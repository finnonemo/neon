// Assembles a disposable app and runs the Playwright specs against it.
//   node run.mjs [playwright args]                 the CDS starter (default)
//   node run.mjs --target neon [playwright args]   the Neon base, from this checkout's registry
//   --keep leaves the assembled app in place and prints its path, for screenshots.
import { mkdtemp, readFile, readdir, writeFile, copyFile, rm, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { assembleStarter } from '../../scripts/lib/assemble-starter.mjs';
import { bareCnImports, buildRegistry } from '../../scripts/lib/registry.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const args = process.argv.slice(2);
const targetAt = args.indexOf('--target');
const target = targetAt >= 0 ? args.splice(targetAt, 2)[1] : 'cds';
const keep = args.includes('--keep') && args.splice(args.indexOf('--keep'), 1).length > 0;
if (!['cds', 'neon'].includes(target)) throw new Error(`Unknown target ${target}; use cds or neon.`);
// shadcn's CLI is pinned: its init and registry formats change between releases.
const SHADCN = 'shadcn@4.23.0';
const work = await mkdtemp(join(tmpdir(), 'neon-browser-'));
const app = join(work, 'app');
async function run(command, args, cwd, env = {}) {
  await new Promise((resolveRun, reject) => {
    const process = spawn(command, args, { cwd, stdio: 'inherit', env: { ...globalThis.process.env, ...env } });
    process.on('error', reject);
    process.on('exit', code => code === 0 ? resolveRun() : reject(new Error(`${command} exited ${code}`)));
  });
}

async function assembleCds() {
  await assembleStarter({ sourceRoot: root, destination: app });
  await run('npm', ['ci', '--no-audit', '--no-fund'], app);
  // Build the shipped app before adding any test-only fixtures.
  await run('npm', ['run', 'build'], app);
  await mkdir(join(app, 'src/app/shared'), { recursive: true });
  for (const file of ['App.tsx', 'Approval.tsx', 'Extras.tsx', 'shared/data.ts']) {
    await copyFile(join(here, 'fixtures', file), join(app, 'src/app', file));
  }
  await copyFile(join(root, 'theme/examples/app-entry.tsx'), join(app, 'src/app/IntegrationRoot.tsx'));
  const mainPath = join(app, 'src/main.tsx');
  let main = await readFile(mainPath, 'utf8');
  main = main.replace('import { AppRoot } from "./app/AppRoot";', '')
    .replace('<AppRoot>', '').replace('</AppRoot>', '');
  // Isolate the documented integration imports: the fixture's reference
  // provider owns reset/default/icon CSS, while main retains the Thai loader.
  main = main.replace(/^import "@coinbase\/[^\n]+\n/gm, '');
  await writeFile(mainPath, main);
  await run('npm', ['run', 'build'], app);
}

// Creates the app as an employee would, with shadcn init from the Neon base,
// against this checkout's registry served locally instead of the release tag.
async function assembleNeon() {
  let items;
  const server = createServer(async (request, response) => {
    try {
      const body = await readFile(join(work, 'registry', decodeURIComponent(new URL(request.url, 'http://x').pathname)));
      response.writeHead(200, { 'content-type': 'application/json' }).end(body);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise((listening) => server.listen(0, '127.0.0.1', listening));
  try {
    const url = `http://127.0.0.1:${server.address().port}/r`;
    await mkdir(join(work, 'registry/r'), { recursive: true });
    for (const [name, content] of await buildRegistry({ root, url })) await writeFile(join(work, 'registry/r', name), content);
    ({ items } = JSON.parse(await readFile(join(work, 'registry/r/registry.json'), 'utf8')));
    await run('npx', ['--yes', SHADCN, 'init', '-t', 'vite', '-b', 'radix', '-n', 'app', '--no-monorepo', `${url}/neon-base.json`], work);
    // The vite template appends shadcn's stock button and a theme provider.
    const components = items.filter((item) => item.type === 'registry:ui').map((item) => `@neon/${item.name}`);
    await run('npx', ['--yes', SHADCN, 'add', ...components, '--overwrite', '-y'], app);
    await rm(join(app, 'src/components/theme-provider.tsx'), { force: true });
  } finally {
    server.close();
  }
  // Every registry file lands unchanged where its item targets, so no stock
  // file (shadcn's button, the template's index.html) survives in its place.
  for (const file of items.flatMap((item) => item.files)) {
    const path = file.target.replace(/^~\//, '');
    const installed = await readFile(join(app, path), 'utf8').catch(() => null);
    if (installed !== await readFile(join(root, 'registry', file.path), 'utf8')) throw new Error(`${path} is not the registry's ${file.path}.`);
  }
  const sources = await readdir(join(app, 'src'), { recursive: true, withFileTypes: true });
  const files = await Promise.all(sources.filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name)).map(async (entry) => {
    const path = join(entry.parentPath, entry.name);
    return [relative(app, path), await readFile(path, 'utf8')];
  }));
  const problems = bareCnImports(files);
  if (problems.length) throw new Error(problems.join('\n'));
  await run('npm', ['run', 'build'], app);
  // Fixtures: App.tsx routes the screens; the rest sit beside AppRoot.
  await mkdir(join(app, 'src/app/shared'), { recursive: true });
  await copyFile(join(here, 'fixtures/neon/App.tsx'), join(app, 'src/App.tsx'));
  for (const file of ['Approval.tsx', 'Extras.tsx', 'Hook.tsx']) await copyFile(join(here, 'fixtures/neon', file), join(app, 'src/app', file));
  await copyFile(join(here, 'fixtures/shared/data.ts'), join(app, 'src/app/shared/data.ts'));
  const mainPath = join(app, 'src/main.tsx');
  const main = await readFile(mainPath, 'utf8');
  await writeFile(mainPath, main.replace('<AppRoot>', '<AppRoot colorScheme={new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light"}>'));
  await run('npm', ['run', 'build'], app);
}

try {
  await (target === 'neon' ? assembleNeon() : assembleCds());
  // The layouts reach the Neon base with #95; until then it runs the match and accessibility specs only.
  const specs = target === 'neon' && !args.some((arg) => arg.endsWith('.spec.mjs')) ? ['cds-match.spec.mjs', 'neon-a11y.spec.mjs'] : [];
  await run(process.execPath, [join(here, 'node_modules/@playwright/test/cli.js'), 'test', ...specs, ...args], here, { NEON_TEST_APP: app, NEON_TARGET: target });
} finally {
  if (keep) console.log(`Kept the assembled app at ${app}`); else await rm(work, { recursive: true, force: true });
}
