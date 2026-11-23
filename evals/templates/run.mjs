// Assembles a disposable app and runs the Playwright specs against it.
//   node run.mjs [playwright args]   the Neon base, from this checkout's registry
//   --target neon is accepted and is the only target; Neon 2.0.0 removed the CDS one.
//   --keep leaves the assembled app in place and prints its path, for screenshots.
// The preview takes a free port; NEON_TEMPLATE_PORT fixes it. Runs on one machine queue behind
// the checks lock (scripts/lib/checks-lock.mjs), which scripts/validate.mjs takes too.
import { mkdtemp, readFile, readdir, writeFile, copyFile, cp, rm, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { takeChecksLock } from '../../scripts/lib/checks-lock.mjs';
import { freePort } from '../../scripts/lib/free-port.mjs';
import { SHADCN, bareCnImports, browserSuiteItems, buildRegistry } from '../../scripts/lib/registry.mjs';
import { runRetryingMissingTarball } from './tarball-retry.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const args = process.argv.slice(2);
const targetAt = args.indexOf('--target');
const target = targetAt >= 0 ? args.splice(targetAt, 2)[1] : 'neon';
const keep = args.includes('--keep') && args.splice(args.indexOf('--keep'), 1).length > 0;
if (target !== 'neon') throw new Error(`Unknown target ${target}; the only target is neon (Neon 2.0.0 removed the CDS one).`);
const release = await takeChecksLock({ label: `browser suite (${target})`, worktree: root });
const work = await mkdtemp(join(tmpdir(), 'neon-browser-'));
const app = join(work, 'app');
async function run(command, args, cwd, env = {}) {
  await new Promise((resolveRun, reject) => {
    const process = spawn(command, args, { cwd, stdio: 'inherit', env: { ...globalThis.process.env, ...env } });
    process.on('error', reject);
    process.on('exit', code => code === 0 ? resolveRun() : reject(new Error(`${command} exited ${code}`)));
  });
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
    // Both commands install the newest versions npm lists, whose tarballs it may not serve yet.
    await runRetryingMissingTarball('npx', ['--yes', SHADCN, 'init', '-t', 'vite', '-b', 'radix', '-n', 'app', '--no-monorepo', `${url}/neon-base.json`], { cwd: work, beforeRetry: () => rm(app, { recursive: true, force: true }) });
    // The vite template appends shadcn's stock button and a theme provider.
    const components = browserSuiteItems(items).map((name) => `@neon/${name}`);
    await runRetryingMissingTarball('npx', ['--yes', SHADCN, 'add', ...components, '--overwrite', '-y'], { cwd: app });
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
  for (const file of ['Approval.tsx', 'Extras.tsx', 'Expansion.tsx', 'Hook.tsx']) await copyFile(join(here, 'fixtures/neon', file), join(app, 'src/app', file));
  // Shipped examples are tested as they ship, not from copies.
  await copyFile(join(root, 'examples/pane-grids/PaneGrids.tsx'), join(app, 'src/app/PaneGrids.tsx'));
  await cp(join(root, 'examples/campaign-sections'), join(app, 'src/app/campaign-sections'), { recursive: true });
  await cp(join(here, 'fixtures/neon/expansion'), join(app, 'src/app/expansion'), { recursive: true });
  await copyFile(join(here, 'fixtures/shared/data.ts'), join(app, 'src/app/shared/data.ts'));
  const mainPath = join(app, 'src/main.tsx');
  const main = await readFile(mainPath, 'utf8');
  await writeFile(mainPath, main.replace('<AppRoot>', '<AppRoot colorScheme={new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light"}>'));
  await run('npm', ['run', 'build'], app);
}

try {
  await assembleNeon();
  // Picked after the app is assembled, so the port is free when the preview binds it.
  const port = process.env.NEON_TEMPLATE_PORT ?? String(await freePort());
  await run(process.execPath, [join(here, 'node_modules/@playwright/test/cli.js'), 'test', ...args], here, { NEON_TEST_APP: app, NEON_TARGET: target, NEON_TEMPLATE_PORT: port });
} finally {
  if (keep) console.log(`Kept the assembled app at ${app}`); else await rm(work, { recursive: true, force: true });
  release();
}
