#!/usr/bin/env node
// PROTOTYPE for finnonemo/neon#84: assembles a disposable Neon-base app the way
// evals/templates/run.mjs does (shadcn init from this checkout's registry, served
// locally), then copies in what the registry doesn't ship yet: the Immersive Themes
// CSS (no registry item) and one Theme Brief hand-placed at docs/theme-briefs/.
//
//   node theme-briefs/PROTOTYPE-84/assemble-app.mjs <brief name, e.g. club-run> <destination>
import { spawn } from 'node:child_process';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join, resolve } from 'node:path';
import { buildRegistry } from '../../scripts/lib/registry.mjs';

const here = import.meta.dirname;
const root = resolve(here, '../..');
const [brief, destination] = process.argv.slice(2);
const work = resolve(destination);
const app = join(work, 'app');
const SHADCN = 'shadcn@4.23.0';
const run = (command, args, cwd) => new Promise((done, fail) => {
  const child = spawn(command, args, { cwd, stdio: 'inherit' });
  child.on('exit', (code) => code === 0 ? done() : fail(new Error(`${command} ${args.join(' ')} exited ${code}`)));
});

await mkdir(join(work, 'registry/r'), { recursive: true });
const server = createServer(async (request, response) => {
  try { response.writeHead(200, { 'content-type': 'application/json' }).end(await readFile(join(work, 'registry', decodeURIComponent(new URL(request.url, 'http://x').pathname)))); }
  catch { response.writeHead(404).end(); }
});
await new Promise((listening) => server.listen(0, '127.0.0.1', listening));
try {
  const url = `http://127.0.0.1:${server.address().port}/r`;
  for (const [name, content] of await buildRegistry({ root, url })) await writeFile(join(work, 'registry/r', name), content);
  await run('npx', ['--yes', SHADCN, 'init', '-t', 'vite', '-b', 'radix', '-n', 'app', '--no-monorepo', `${url}/neon-base.json`], work);
  await run('npx', ['--yes', SHADCN, 'add', '@neon/tag', '@neon/input', '@neon/label', '@neon/select', '@neon/checkbox', '--overwrite', '-y'], app);
} finally { server.close(); }
await mkdir(join(app, 'src/theme'), { recursive: true });
await copyFile(join(root, 'theme/css/immersive-themes.css'), join(app, 'src/theme/immersive-themes.css'));
if (brief !== '-') {
  await mkdir(join(app, 'docs/theme-briefs'), { recursive: true });
  await copyFile(join(here, 'out', `${brief}.md`), join(app, 'docs/theme-briefs', `${brief}.md`));
}
await run('npm', ['run', 'build'], app);
console.log(`App ready at ${app}`);
