import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm, symlink, cp, access } from 'node:fs/promises';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { install, InstallError, createCommandRunner } from '../../scripts/lib/install.mjs';
import { SHADCN, buildRegistry, pinnedRegistryUrl } from '../../scripts/lib/registry.mjs';

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

// --- New and Add, through the Neon registry ----------------------------------

const registryUrl = 'http://127.0.0.1:1/r';
const built = await buildRegistry({ root: repoRoot, url: registryUrl });
const builtItem = name => JSON.parse(built.get(`${name}.json`));

// Serves the built registry the way raw.githubusercontent.com would.
async function fetchJson(url) {
  const name = url.startsWith(`${registryUrl}/`) && url.slice(registryUrl.length + 1);
  if (!built.has(name)) throw new Error(`404 ${url}`);
  return JSON.parse(built.get(name));
}

// The files an item and its registry dependencies write, by app-relative path.
function itemFiles(name, out = new Map()) {
  const item = builtItem(name);
  for (const dep of item.registryDependencies ?? []) itemFiles(dep.replace('@neon/', '').replace(`${registryUrl}/`, '').replace(/\.json$/, ''), out);
  for (const file of item.files) out.set(file.target.replace(/^~\//, ''), file.content);
  return out;
}

// Stands in for the pinned shadcn CLI as observed: init creates the app from
// the base item (plus the vite template's stock theme provider); add writes
// missing files, skips identical ones, and on a differing file prompts, which
// without a terminal writes nothing and still exits 0.
function fakeShadcn({ write = true } = {}) {
  const calls = [];
  const runCommand = (command, args, cwd) => {
    calls.push({ command, args, cwd });
    // spawnSync fails with ENOENT in a missing directory.
    if (!existsSync(cwd)) throw new InstallError(`spawnSync npx ENOENT (cwd ${cwd})`);
    assert.equal(command, 'npx');
    assert.deepEqual(args.slice(0, 2), ['--yes', SHADCN]);
    if (!write) return;
    if (args[2] === 'init') {
      const app = join(cwd, args[args.indexOf('-n') + 1]);
      if (existsSync(app)) throw new InstallError('dest already exists.');
      const files = itemFiles('neon-base');
      files.set('package.json', '{"name":"app"}');
      files.set('components.json', JSON.stringify({ aliases: { utils: '@/lib/utils' }, registries: builtItem('neon-base').config.registries }));
      files.set('src/components/theme-provider.tsx', 'export function ThemeProvider() {}');
      for (const [path, content] of files) writeSync(join(app, path), content);
      return;
    }
    const files = new Map();
    for (const name of args.slice(3).filter(arg => arg.startsWith('@neon/'))) itemFiles(name.slice(6), files);
    const present = [...files].filter(([path]) => existsSync(join(cwd, path)));
    if (present.some(([path, content]) => readFileSync(join(cwd, path), 'utf8') !== content)) return;
    for (const [path, content] of files) if (!existsSync(join(cwd, path))) writeSync(join(cwd, path), content);
  };
  return { calls, runCommand };
}

function writeSync(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

const registryOptions = { registry: registryUrl, fetchJson };

test('new runs the pinned shadcn init from the Neon base in the target\'s parent', async t => {
  const root = await sandbox(t);
  const destination = join(root, 'fresh');
  const { calls, runCommand } = fakeShadcn();
  const result = await install({ mode: 'new', target: destination, runCommand, ...registryOptions });
  assert.deepEqual(calls, [{
    command: 'npx',
    args: ['--yes', SHADCN, 'init', '-t', 'vite', '-b', 'radix', '-n', 'fresh', '--no-monorepo', `${registryUrl}/neon-base.json`],
    cwd: root,
  }]);
  assert.equal(result.destination, destination);
  assert.equal(result.dependenciesInstalled, true);
});

test('new takes NEON_REGISTRY_URL when no registry is passed, and css-only ignores it', async t => {
  const root = await sandbox(t);
  const env = { NEON_REGISTRY_URL: registryUrl };
  const { calls, runCommand } = fakeShadcn();
  await install({ mode: 'new', target: join(root, 'fresh'), runCommand, fetchJson, env });
  assert.equal(calls[0].args.at(-1), `${registryUrl}/neon-base.json`);
  const app = join(root, 'cds-app');
  await mkdir(app);
  await writeFile(join(app, 'package.json'), '{"name":"app","dependencies":{}}');
  await install({ mode: 'css-only', target: app, env });
});

test('new refuses a non-empty destination before running anything', async t => {
  const root = await sandbox(t);
  const destination = join(root, 'busy');
  await mkdir(destination);
  await writeFile(join(destination, 'keep.txt'), 'mine');
  const { calls, runCommand } = fakeShadcn();
  await assertUnchanged(root, () => install({ mode: 'new', target: destination, runCommand, ...registryOptions }), /destination is not empty/);
  assert.deepEqual(calls, []);
});

// Vite refuses a destination that already exists, even an empty one.
test('new creates the app in an existing empty directory', async t => {
  const destination = join(await sandbox(t), 'fresh');
  await mkdir(destination);
  await install({ mode: 'new', target: destination, runCommand: fakeShadcn().runCommand, ...registryOptions });
  assert.equal(await readFile(join(destination, 'src/app/AppRoot.tsx'), 'utf8'), builtItem('neon-base').files.find(file => file.target === 'src/app/AppRoot.tsx').content);
});

// AppRoot owns the color scheme; the template's provider would be a second one.
test('new removes the vite template\'s stock theme provider', async t => {
  const destination = join(await sandbox(t), 'fresh');
  await install({ mode: 'new', target: destination, runCommand: fakeShadcn().runCommand, ...registryOptions });
  assert.equal(await exists(join(destination, 'src/components/theme-provider.tsx')), false);
});

test('new fails when shadcn exits 0 without creating the Neon base', async t => {
  const destination = join(await sandbox(t), 'fresh');
  await assert.rejects(
    install({ mode: 'new', target: destination, runCommand: fakeShadcn({ write: false }).runCommand, ...registryOptions }),
    error => error instanceof InstallError && /src\/theme\/theme\.css is not the Neon registry's/.test(error.message),
  );
});

test('new creates missing parent directories, as the starter assembly did', async t => {
  const destination = join(await sandbox(t), 'projects/finnomena/fresh');
  await install({ mode: 'new', target: destination, runCommand: fakeShadcn().runCommand, ...registryOptions });
  assert.ok(await exists(join(destination, 'src/app/AppRoot.tsx')));
});

test('new leaves an empty destination in place when shadcn init fails', async t => {
  const destination = join(await sandbox(t), 'fresh');
  await mkdir(destination);
  const failing = () => { throw new InstallError('Command failed (exit 1): npx shadcn init'); };
  await assert.rejects(install({ mode: 'new', target: destination, runCommand: failing, ...registryOptions }), /exit 1/);
  assert.deepEqual(await readdir(destination), []);
});

// shadcn init installs as it creates and imports the theme from src/theme, so
// these options would be silently ignored.
test('new refuses options shadcn init cannot honour', async t => {
  const root = await sandbox(t);
  const destination = join(root, 'fresh');
  for (const [options, message] of [
    [{ themeDir: 'lib/theme' }, /--theme-dir is not supported with --new/],
    [{ skipInstall: true }, /--skip-install is not supported with --new/],
    [{ packageManager: 'pnpm' }, /--package-manager is not supported with --new/],
  ]) {
    const { calls, runCommand } = fakeShadcn();
    await assertUnchanged(root, () => install({ mode: 'new', target: destination, runCommand, ...registryOptions, ...options }), message);
    assert.deepEqual(calls, []);
  }
});

async function neonApp(t) {
  const app = join(await sandbox(t), 'app');
  await install({ mode: 'new', target: app, runCommand: fakeShadcn().runCommand, ...registryOptions });
  return app;
}

const registryFile = (name, target) => builtItem(name).files.find(file => file.target === target).content;

test('add runs the pinned shadcn add for the named Neon items in the app', async t => {
  const app = await neonApp(t);
  const { calls, runCommand } = fakeShadcn();
  const result = await install({ mode: 'add', target: app, items: ['dialog', '@neon/select'], runCommand, ...registryOptions });
  assert.deepEqual(calls, [{ command: 'npx', args: ['--yes', SHADCN, 'add', '@neon/dialog', '@neon/select', '-y'], cwd: app }]);
  for (const name of ['dialog', 'select']) {
    const target = `src/components/ui/${name}.tsx`;
    assert.equal(await readFile(join(app, target), 'utf8'), registryFile(name, target));
  }
  assert.equal(result.mode, 'add');
  assert.equal(result.destination, app);
});

// Dialog depends on Button. shadcn would prompt to overwrite a tuned
// button.tsx and, without a terminal, add nothing at all.
test('add keeps a tuned Neon file the item depends on and still adds the item', async t => {
  const app = await neonApp(t);
  const button = join(app, 'src/components/ui/button.tsx');
  const tuned = `${await readFile(button, 'utf8')}// tuned\n`;
  await writeFile(button, tuned);
  const result = await install({ mode: 'add', target: app, items: ['dialog'], runCommand: fakeShadcn().runCommand, ...registryOptions });
  assert.equal(await readFile(button, 'utf8'), tuned);
  assert.ok(await exists(join(app, 'src/components/ui/dialog.tsx')));
  assert.deepEqual(result.keptFiles, ['src/components/ui/button.tsx']);
});

test('add puts tuned files back when shadcn fails', async t => {
  const app = await neonApp(t);
  const button = join(app, 'src/components/ui/button.tsx');
  await writeFile(button, 'export const Button = "tuned"\n');
  const failing = () => { throw new InstallError('Command failed (exit 1): npx shadcn add'); };
  await assert.rejects(install({ mode: 'add', target: app, items: ['dialog'], runCommand: failing, ...registryOptions }), /exit 1/);
  assert.equal(await readFile(button, 'utf8'), 'export const Button = "tuned"\n');
});

test('add fails when shadcn exits 0 without adding the item', async t => {
  const app = await neonApp(t);
  await assert.rejects(
    install({ mode: 'add', target: app, items: ['dialog'], runCommand: fakeShadcn({ write: false }).runCommand, ...registryOptions }),
    /src\/components\/ui\/dialog\.tsx is not the Neon registry's/,
  );
});

// Neon's components merge type roles through Neon's cn (spike trap 1). A
// stock cn the app keeps is reported, not replaced.
test('add warns when the cn it keeps lacks Neon\'s type roles', async t => {
  const app = await neonApp(t);
  await writeFile(join(app, 'src/lib/utils.ts'), 'import { clsx } from "clsx"\nimport { twMerge } from "tailwind-merge"\nexport const cn = (...inputs) => twMerge(clsx(inputs))\n');
  const logged = [];
  const result = await install({ mode: 'add', target: app, items: ['dialog'], runCommand: fakeShadcn().runCommand, log: line => logged.push(line), ...registryOptions });
  assert.deepEqual(result.keptFiles, ['src/lib/utils.ts']);
  assert.match(logged.join('\n'), /src\/lib\/utils\.ts keeps a cn without Neon's type roles/);
});

// An app shadcn initialized from its own base has no @neon entry, and
// shadcn add @neon/<item> cannot resolve without one.
test('add points an app\'s components.json at the Neon registry when it has none', async t => {
  const app = await neonApp(t);
  const config = JSON.parse(await readFile(join(app, 'components.json'), 'utf8'));
  delete config.registries;
  await writeFile(join(app, 'components.json'), JSON.stringify(config));
  await install({ mode: 'add', target: app, items: ['dialog'], runCommand: fakeShadcn().runCommand, ...registryOptions });
  const updated = JSON.parse(await readFile(join(app, 'components.json'), 'utf8'));
  assert.deepEqual(updated.registries, { '@neon': `${registryUrl}/{name}.json` });
  assert.deepEqual(updated.aliases, config.aliases);
});

test('add refuses before writing when the app is not ready for it', async t => {
  const app = await neonApp(t);
  const older = 'https://raw.githubusercontent.com/finnonemo/neon/neon--v0.4.0/registry/r/{name}.json';
  const elsewhere = await neonApp(t);
  const config = JSON.parse(await readFile(join(elsewhere, 'components.json'), 'utf8'));
  await writeFile(join(elsewhere, 'components.json'), JSON.stringify({ ...config, registries: { '@neon': older } }));
  const bare = await existingApp(await sandbox(t));
  for (const [target, options, message] of [
    [app, { items: [] }, /Name at least one Neon item to add/],
    [app, { items: ['dialog'], skipInstall: true }, /--skip-install is not supported with --add/],
    [app, { items: ['dialog'], themeDir: 'lib/theme' }, /--theme-dir is not supported with --add/],
    [app, { items: ['dialog'], packageManager: 'pnpm' }, /--package-manager is not supported with --add/],
    [app, { items: ['no-such-item'] }, /No Neon registry item at .*no-such-item\.json/],
    [elsewhere, { items: ['dialog'] }, /components\.json's @neon registry is .*neon--v0\.4\.0/],
    [bare, { items: ['dialog'] }, /No components\.json/],
  ]) {
    const { calls, runCommand } = fakeShadcn();
    await assertUnchanged(target, () => install({ mode: 'add', target, runCommand, ...registryOptions, ...options }), message);
    assert.deepEqual(calls, [], message.source);
  }
});

// Packaged with the plugin, the installer adds from the release it ships in.
test('new and add default to the registry pinned to the package\'s release tag', async t => {
  const pinned = await pinnedRegistryUrl(repoRoot);
  const { version } = JSON.parse(await readFile(join(repoRoot, '.claude-plugin/plugin.json'), 'utf8'));
  assert.equal(pinned, `https://raw.githubusercontent.com/finnonemo/neon/neon--v${version}/registry/r`);
  const release = await buildRegistry({ root: repoRoot, url: pinned });
  const fetched = [];
  const releaseFetch = async url => { fetched.push(url); return JSON.parse(release.get(url.slice(pinned.length + 1))); };
  const { calls, runCommand } = recorder();
  await assert.rejects(install({ mode: 'new', target: join(await sandbox(t), 'fresh'), fetchJson: releaseFetch, runCommand }), /is not the Neon registry's/);
  assert.equal(calls[0].args.at(-1), `${pinned}/neon-base.json`);
  const app = await existingApp(await sandbox(t));
  await writeFile(join(app, 'components.json'), '{}');
  await assert.rejects(install({ mode: 'add', target: app, items: ['dialog'], fetchJson: releaseFetch, runCommand }), /is not the Neon registry's/);
  assert.deepEqual(JSON.parse(await readFile(join(app, 'components.json'), 'utf8')).registries, { '@neon': `${pinned}/{name}.json` });
  assert.ok(fetched.length > 0 && fetched.every(url => url.startsWith(`${pinned}/`)), fetched.join('\n'));
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

// shadcn init always installs, so New can never report files without dependencies.
test('CLI new refuses --skip-install rather than claim an app without dependencies', async t => {
  const destination = join(await sandbox(t), 'fresh');
  const result = cli(destination, '--new', '--skip-install');
  assert.equal(result.status, 1, result.stdout);
  assert.match(result.stderr, /--skip-install is not supported with --new/);
  assert.equal(await exists(destination), false);
});

test('CLI add and new refuse what they cannot do with one clean message', async t => {
  const app = await existingApp(await sandbox(t));
  for (const [args, message] of [
    [[app, '--add'], /Name at least one Neon item to add/],
    [[app, '--css-only', '--registry', 'http://127.0.0.1:1/r'], /--registry applies only to --new and --add/],
    [[app, '--add', 'dialog', '--new'], /--new, --add and --css-only are mutually exclusive/],
    [[app, '--add', 'dialog', '--css-only'], /--new, --add and --css-only are mutually exclusive/],
    [[app, 'dialog'], /Usage: node install\.mjs/],
    [[app, '--add', 'dialog'], /No components\.json/],
  ]) {
    const result = cli(...args);
    assert.equal(result.status, 1, `${args.join(' ')}: ${result.stdout}`);
    assert.match(result.stderr, message);
    assert.doesNotMatch(result.stderr, /^\s+at /m, `stack trace for ${args.join(' ')}`);
  }
});

test('deprecated theme/finnomena entry point forwards to the installer and its exit status', async t => {
  const app = await existingApp(await sandbox(t));
  const shim = args => spawnSync(process.execPath, [join(repoRoot, 'theme/finnomena/scripts/install.mjs'), ...args], { encoding: 'utf8' });
  const ok = shim([app, '--css-only']);
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stderr, /Deprecation notice/);
  await access(join(app, 'src/theme/theme.css'));
  const refused = shim([app, '--package-manager', 'deno']);
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /Unsupported --package-manager/);
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
