import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm, symlink, cp, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { install, InstallError, createCommandRunner } from '../../scripts/lib/install.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const cdsFiles = ['theme.config.ts', 'color-overrides.ts', 'createTheme.ts', 'breakpoints.config.ts'];
const starterManifest = JSON.parse(await readFile(join(repoRoot, 'templates/vitejs-cds/package.json'), 'utf8'));
const cdsVersion = starterManifest.dependencies['@coinbase/cds-web'];

// Each sandbox carries its own .git so package-manager evidence never climbs into the real filesystem.
async function sandbox(t) {
  const root = await mkdtemp(join(tmpdir(), 'neon-install-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, '.git'));
  return root;
}

async function existingApp(root, manifest = { name: 'app' }, name = 'app') {
  const app = join(root, name);
  await mkdir(app, { recursive: true });
  await writeFile(join(app, 'package.json'), JSON.stringify(manifest));
  return app;
}

function recorder() {
  const calls = [];
  return { calls, runCommand: (command, args, cwd) => { calls.push({ command, args, cwd }); } };
}

async function files(dir) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true }).catch(() => []);
  return entries
    .filter(entry => !entry.isDirectory())
    .map(entry => relative(dir, join(entry.parentPath, entry.name)))
    .filter(path => !path.startsWith('.git'))
    .sort();
}

async function assertUnchanged(dir, attempt, pattern) {
  const before = await files(dir);
  await assert.rejects(attempt, error => error instanceof InstallError && pattern.test(error.message));
  assert.deepEqual(await files(dir), before);
}

async function exists(path) {
  return access(path).then(() => true, () => false);
}

// --- CSS-only ---------------------------------------------------------------

test('css-only copies the CSS adapter into src/theme and runs no command', async t => {
  const app = await existingApp(await sandbox(t));
  const { calls, runCommand } = recorder();
  const result = await install({ mode: 'css-only', target: app, runCommand });
  assert.equal(result.themeDir, join(app, 'src', 'theme'));
  assert.equal(result.copiedFiles, 1);
  assert.equal(
    await readFile(join(app, 'src/theme/theme.css'), 'utf8'),
    await readFile(join(repoRoot, 'theme/css/theme.css'), 'utf8'),
  );
  assert.deepEqual(calls, []);
});

test('css-only honours a project-relative theme directory', async t => {
  const app = await existingApp(await sandbox(t));
  const result = await install({ mode: 'css-only', target: app, themeDir: 'styles/brand', runCommand: recorder().runCommand });
  assert.equal(result.themeDir, join(app, 'styles', 'brand'));
  assert.ok(await exists(join(app, 'styles/brand/theme.css')));
});

test('theme directories that leave the target are refused before writing', async t => {
  const root = await sandbox(t);
  const app = await existingApp(root);
  const outside = join(root, 'outside');
  await mkdir(outside);
  await symlink(outside, join(app, 'linked'));
  for (const themeDir of ['/abs/theme', '../escape', '.', 'linked/theme']) {
    await assertUnchanged(root, () => install({ mode: 'css-only', target: app, themeDir, runCommand: recorder().runCommand }), /Theme destination/);
  }
});

test('a symlinked default src/theme that escapes the target is refused', async t => {
  const root = await sandbox(t);
  const app = await existingApp(root);
  await mkdir(join(root, 'elsewhere'));
  await symlink(join(root, 'elsewhere'), join(app, 'src'));
  await assertUnchanged(root, () => install({ mode: 'css-only', target: app, runCommand: recorder().runCommand }), /symlinked ancestor/);
});

test('an unsupported package manager is refused in every mode before writing', async t => {
  const app = await existingApp(await sandbox(t), { dependencies: { '@coinbase/cds-web': cdsVersion } });
  for (const mode of ['css-only', 'cds']) {
    await assertUnchanged(app, () => install({ mode, target: app, packageManager: 'deno', skipInstall: true, runCommand: recorder().runCommand }), /Unsupported --package-manager "deno"/);
  }
});

// --- Customised files -------------------------------------------------------

test('identical existing theme files are kept and only missing ones are copied', async t => {
  const app = await existingApp(await sandbox(t), { dependencies: { '@coinbase/cds-web': cdsVersion } });
  await mkdir(join(app, 'src/theme'), { recursive: true });
  await cp(join(repoRoot, 'theme/cds/createTheme.ts'), join(app, 'src/theme/createTheme.ts'));
  const result = await install({ mode: 'cds', target: app, runCommand: recorder().runCommand });
  assert.equal(result.copiedFiles, 3);
});

test('a customised theme file stops the whole copy, leaving the other files unwritten', async t => {
  const app = await existingApp(await sandbox(t));
  await mkdir(join(app, 'src/theme'), { recursive: true });
  await writeFile(join(app, 'src/theme/breakpoints.config.ts'), '// local change\n');
  const { calls, runCommand } = recorder();
  await assertUnchanged(app, () => install({ mode: 'cds', target: app, runCommand }), /Refusing to overwrite customized file/);
  assert.deepEqual(calls, []);
});

// --- CDS --------------------------------------------------------------------

test('cds refuses a target without package.json', async t => {
  const root = await sandbox(t);
  await mkdir(join(root, 'empty'));
  await assertUnchanged(root, () => install({ mode: 'cds', target: join(root, 'empty'), runCommand: recorder().runCommand }), /No package\.json found/);
});

test('cds copies the four canonical theme files and adds CDS at the starter version', async t => {
  const app = await existingApp(await sandbox(t));
  const { calls, runCommand } = recorder();
  const result = await install({ mode: 'cds', target: app, runCommand });
  for (const file of cdsFiles) {
    assert.equal(await readFile(join(app, 'src/theme', file), 'utf8'), await readFile(join(repoRoot, 'theme/cds', file), 'utf8'));
  }
  assert.deepEqual(calls, [{ command: 'npm', args: ['install', `@coinbase/cds-web@${cdsVersion}`], cwd: app }]);
  assert.equal(result.packageManager, 'npm');
  assert.equal(result.dependenciesInstalled, true);
  assert.equal(result.copiedFiles, 4);
});

test('cds skips the install when CDS is already a dependency or devDependency', async t => {
  const root = await sandbox(t);
  for (const field of ['dependencies', 'devDependencies']) {
    const app = await existingApp(root, { [field]: { '@coinbase/cds-web': '^9.0.0' } }, field);
    const { calls, runCommand } = recorder();
    const result = await install({ mode: 'cds', target: app, runCommand });
    assert.deepEqual(calls, []);
    assert.equal(result.cdsAlreadyPresent, true);
  }
});

test('cds with skipInstall copies files, runs nothing, and reports the pending CDS version', async t => {
  const app = await existingApp(await sandbox(t));
  const { calls, runCommand } = recorder();
  const result = await install({ mode: 'cds', target: app, skipInstall: true, runCommand });
  assert.deepEqual(calls, []);
  assert.equal(result.dependenciesInstalled, false);
  assert.equal(result.cdsVersion, cdsVersion);
  assert.ok(await exists(join(app, 'src/theme/theme.config.ts')));
});

test('cds reads a CDS version from the starter before copying anything', async t => {
  const root = await sandbox(t);
  const source = join(root, 'neon');
  await cp(join(repoRoot, 'theme'), join(source, 'theme'), { recursive: true });
  await mkdir(join(source, 'templates/vitejs-cds'), { recursive: true });
  await writeFile(join(source, 'templates/vitejs-cds/package.json'), JSON.stringify({ dependencies: {} }));
  const app = await existingApp(root);
  await assertUnchanged(app, () => install({ mode: 'cds', target: app, sourceRoot: source, skipInstall: true, runCommand: recorder().runCommand }), /does not declare a @coinbase\/cds-web version/);
});

// --- Package-manager evidence -----------------------------------------------

test('a lockfile at the workspace root is found through manifestless directories', async t => {
  const root = await sandbox(t);
  await writeFile(join(root, 'pnpm-lock.yaml'), '');
  const app = await existingApp(root, { name: 'portal' }, 'apps/portal');
  const { calls, runCommand } = recorder();
  await install({ mode: 'cds', target: app, runCommand });
  assert.deepEqual(calls, [{ command: 'pnpm', args: ['add', `@coinbase/cds-web@${cdsVersion}`], cwd: app }]);
});

test('a declared packageManager in a parent manifest selects that manager', async t => {
  const root = await sandbox(t);
  await writeFile(join(root, 'package.json'), JSON.stringify({ packageManager: 'yarn@4.1.0' }));
  const app = await existingApp(root, { name: 'portal' }, 'apps/portal');
  const { calls, runCommand } = recorder();
  await install({ mode: 'cds', target: app, runCommand });
  assert.equal(calls[0].command, 'yarn');
  assert.deepEqual(calls[0].args, ['add', `@coinbase/cds-web@${cdsVersion}`]);
});

test('the evidence walk stops at a .git directory', async t => {
  const root = await sandbox(t);
  await writeFile(join(root, 'pnpm-lock.yaml'), '');
  const app = await existingApp(root, { name: 'nested' }, 'nested');
  await mkdir(join(app, '.git'));
  const { calls, runCommand } = recorder();
  await install({ mode: 'cds', target: app, runCommand });
  assert.equal(calls[0].command, 'npm');
});

test('conflicting lockfiles are refused before writing, even when nothing would be installed', async t => {
  const root = await sandbox(t);
  const app = await existingApp(root, { devDependencies: { '@coinbase/cds-web': cdsVersion } });
  await writeFile(join(app, 'yarn.lock'), '');
  await writeFile(join(app, 'package-lock.json'), '{}');
  await assertUnchanged(app, () => install({ mode: 'cds', target: app, skipInstall: true, runCommand: recorder().runCommand }), /Conflicting package manager evidence/);
});

test('an explicit package manager overrides lockfile evidence', async t => {
  const app = await existingApp(await sandbox(t));
  await writeFile(join(app, 'yarn.lock'), '');
  const { calls, runCommand } = recorder();
  await install({ mode: 'cds', target: app, packageManager: 'bun', runCommand });
  assert.equal(calls[0].command, 'bun');
});

// --- New --------------------------------------------------------------------

test('new assembles the starter with canonical theme files and runs npm ci in it', async t => {
  const destination = join(await sandbox(t), 'fresh');
  const { calls, runCommand } = recorder();
  const result = await install({ mode: 'new', target: destination, runCommand });
  assert.equal(result.destination, destination);
  assert.ok(await exists(join(destination, 'src/app/AppRoot.tsx')));
  for (const file of cdsFiles) assert.ok(await exists(join(destination, 'src/theme', file)));
  assert.deepEqual(calls, [{ command: 'npm', args: ['ci'], cwd: destination }]);
  assert.equal(result.packageManager, 'npm');
  assert.equal(result.dependenciesInstalled, true);
});

test('new with an explicit manager runs a plain install', async t => {
  const destination = join(await sandbox(t), 'fresh');
  const { calls, runCommand } = recorder();
  await install({ mode: 'new', target: destination, packageManager: 'pnpm', runCommand });
  assert.deepEqual(calls, [{ command: 'pnpm', args: ['install'], cwd: destination }]);
});

test('new with skipInstall assembles files without running a command', async t => {
  const destination = join(await sandbox(t), 'fresh');
  const { calls, runCommand } = recorder();
  const result = await install({ mode: 'new', target: destination, skipInstall: true, runCommand });
  assert.deepEqual(calls, []);
  assert.equal(result.dependenciesInstalled, false);
  assert.ok(await exists(join(destination, 'package.json')));
});

test('new refuses a non-empty destination', async t => {
  const root = await sandbox(t);
  const destination = join(root, 'busy');
  await mkdir(destination);
  await writeFile(join(destination, 'keep.txt'), 'mine');
  const { calls, runCommand } = recorder();
  await assertUnchanged(root, () => install({ mode: 'new', target: destination, runCommand }), /destination is not empty/);
  assert.deepEqual(calls, []);
});

test('new refuses a theme directory because the starter imports a fixed src/theme', async t => {
  const root = await sandbox(t);
  const destination = join(root, 'fresh');
  await assert.rejects(install({ mode: 'new', target: destination, themeDir: 'lib/theme', runCommand: recorder().runCommand }), /--theme-dir is not supported with --new/);
  assert.equal(await exists(destination), false);
});

test('new refuses a malformed starter manifest before creating the destination', async t => {
  const root = await sandbox(t);
  const source = join(root, 'neon');
  await cp(join(repoRoot, 'theme'), join(source, 'theme'), { recursive: true });
  await mkdir(join(source, 'templates/vitejs-cds'), { recursive: true });
  await writeFile(join(source, 'templates/vitejs-cds/package.json'), '{ not json');
  const destination = join(root, 'fresh');
  await assert.rejects(install({ mode: 'new', target: destination, sourceRoot: source, runCommand: recorder().runCommand }), InstallError);
  assert.equal(await exists(destination), false);
});

// --- Real command runner ----------------------------------------------------

test('the real command runner uses a shell only on Windows', () => {
  for (const [platform, shell] of [['win32', true], ['darwin', false], ['linux', false]]) {
    const seen = [];
    const run = createCommandRunner({ platform, spawn: (command, args, options) => { seen.push({ command, args, options }); return { status: 0 }; }, log: () => {} });
    run('npm', ['ci'], '/app');
    assert.deepEqual(seen, [{ command: 'npm', args: ['ci'], options: { cwd: '/app', stdio: 'inherit', shell } }]);
  }
});

test('the real command runner reports the child exit status and launch failures', () => {
  const failing = createCommandRunner({ platform: 'linux', spawn: () => ({ status: 7 }), log: () => {} });
  assert.throws(() => failing('pnpm', ['add', 'x'], '/app'), error => error instanceof InstallError && error.exitCode === 7 && /Command failed \(exit 7\): pnpm add x/.test(error.message));
  const missing = createCommandRunner({ platform: 'linux', spawn: () => ({ error: new Error('spawn bun ENOENT') }), log: () => {} });
  assert.throws(() => missing('bun', ['install'], '/app'), error => error instanceof InstallError && error.exitCode === 1 && /Failed to run "bun": spawn bun ENOENT/.test(error.message));
});

// --- CLI smoke --------------------------------------------------------------

function cli(...args) {
  return spawnSync(process.execPath, [join(repoRoot, 'scripts/install.mjs'), ...args], { encoding: 'utf8' });
}

test('CLI css-only prints the import hint and exits 0', async t => {
  const app = await existingApp(await sandbox(t));
  const result = cli(app, '--css-only');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Copied 1 theme files into .*src\/theme/);
  assert.match(result.stdout, /Done\. Import it once/);
});

test('CLI new with --skip-install never claims an unqualified Done', async t => {
  const destination = join(await sandbox(t), 'fresh');
  const result = cli(destination, '--new', '--skip-install');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Dependencies not installed/);
  assert.doesNotMatch(result.stdout, /^Done\./m);
});

test('CLI refusals print one clean message and exit 1', async t => {
  const app = await existingApp(await sandbox(t));
  await mkdir(join(app, 'src/theme'), { recursive: true });
  await writeFile(join(app, 'src/theme/theme.css'), '/* local */');
  for (const [args, message] of [
    [[app, '--css-only'], /Refusing to overwrite customized file/],
    [[app, '--sync-starter'], /assembled from canonical assets/],
    [[app, '--new', '--css-only'], /mutually exclusive/],
    [[app, '--new', '--theme-dir', 'x'], /--theme-dir is not supported with --new/],
    [[app, '--package-manager', 'deno'], /Unsupported --package-manager/],
    [[], /Usage: node install\.mjs/],
  ]) {
    const result = cli(...args);
    assert.equal(result.status, 1, `${args.join(' ')}: ${result.stdout}`);
    assert.match(result.stderr, message);
    assert.doesNotMatch(result.stderr, /^\s+at /m, `stack trace for ${args.join(' ')}`);
  }
});
