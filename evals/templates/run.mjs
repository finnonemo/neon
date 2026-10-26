import { mkdtemp, readFile, writeFile, copyFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { assembleStarter } from '../../scripts/lib/assemble-starter.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const work = await mkdtemp(join(tmpdir(), 'neon-browser-'));
const app = join(work, 'app');
async function run(command, args, cwd, env = {}) {
  await new Promise((resolveRun, reject) => {
    const process = spawn(command, args, { cwd, stdio: 'inherit', env: { ...globalThis.process.env, ...env } });
    process.on('error', reject);
    process.on('exit', code => code === 0 ? resolveRun() : reject(new Error(`${command} exited ${code}`)));
  });
}
try {
  await assembleStarter({ sourceRoot: root, destination: app });
  await run('npm', ['ci', '--no-audit', '--no-fund'], app);
  // Build the shipped app before adding any test-only fixtures.
  await run('npm', ['run', 'build'], app);
  await mkdir(join(app, 'src/app'), { recursive: true });
  await copyFile(join(here, 'fixtures/App.tsx'), join(app, 'src/app/App.tsx'));
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
  await run(process.execPath, [join(here, 'node_modules/@playwright/test/cli.js'), 'test', ...process.argv.slice(2)], here, { NEON_TEST_APP: app });
} finally {
  await rm(work, { recursive: true, force: true });
}
