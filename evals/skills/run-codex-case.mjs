#!/usr/bin/env node
// Runs one Codex eval case against the packaged plugin, isolated from the
// evaluator's own Codex home, user skills and /tmp.
//
//   node evals/skills/run-codex-case.mjs --fixture <app> --case <name> --prompt <text>
//     [--app-name <dir>] [--node-modules <dir>] [--root .local/evals] [--attempts 3] [--dry-run]
//
// <root>/<case>/ is the only directory Codex may write: the app copy, its HOME
// and TMPDIR, run.jsonl, run.err and summary.json. The Codex home and the
// packaged plugin sit in <root>/.private/<case>/, outside it. The copied
// auth.json is deleted on exit, including on interrupt. `--dry-run` sets up and
// checks the plugin without running Codex.
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { packagePlugin } from '../../scripts/package-plugin.mjs';

const repositoryRoot = resolve(import.meta.dirname, '../..');

function hashTree(directory) {
  const hashes = new Map();
  for (const entry of readdirSync(directory, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name);
    hashes.set(relative(directory, path), createHash('sha256').update(readFileSync(path)).digest('hex'));
  }
  return hashes;
}

// Files of `expected` that `actual` lacks or holds with different content.
export function diffTrees(expected, actual) {
  const want = hashTree(expected);
  const have = hashTree(actual);
  const missing = [];
  const changed = [];
  for (const [path, hash] of want) {
    if (!have.has(path)) missing.push(path);
    else if (have.get(path) !== hash) changed.push(path);
  }
  return { missing, changed };
}

export function isCapacityFailure(jsonl) {
  return /at capacity/i.test(jsonl);
}

export function newEntries(before, after) {
  const seen = new Set(before);
  return after.filter(name => !seen.has(name));
}

function git(app, ...args) {
  execFileSync('git', ['-C', app, ...args], { stdio: 'ignore' });
}

function codex(env, args, options = {}) {
  return new Promise(resolvePromise => {
    const child = spawn('codex', args, { env, stdio: ['ignore', 'pipe', 'pipe'], ...options });
    const out = [];
    const err = [];
    child.stdout.on('data', chunk => out.push(chunk));
    child.stderr.on('data', chunk => err.push(chunk));
    child.on('close', code => resolvePromise({ code, stdout: Buffer.concat(out).toString(), stderr: Buffer.concat(err).toString() }));
  });
}

function authFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { recursive: true }).filter(name => basename(String(name)) === 'auth.json');
}

async function main() {
  const { values } = parseArgs({
    options: {
      fixture: { type: 'string' },
      case: { type: 'string' },
      prompt: { type: 'string' },
      'app-name': { type: 'string' },
      'node-modules': { type: 'string' },
      root: { type: 'string', default: join(repositoryRoot, '.local/evals') },
      attempts: { type: 'string', default: '3' },
      'dry-run': { type: 'boolean', default: false },
    },
  });
  if (!values.fixture || !values.case || (!values.prompt && !values['dry-run'])) {
    throw new Error('Usage: run-codex-case.mjs --fixture <app> --case <name> --prompt <text> [--node-modules <dir>] [--root <dir>] [--dry-run]');
  }

  const root = resolve(values.root);
  const caseDirectory = join(root, values.case);
  const privateDirectory = join(root, '.private', values.case);
  if (existsSync(caseDirectory) || existsSync(privateDirectory)) throw new Error(`Case already exists: ${caseDirectory}`);
  const app = join(caseDirectory, values['app-name'] ?? basename(resolve(values.fixture)));
  const codexHome = join(privateDirectory, 'codex-home');
  const plugin = join(privateDirectory, 'plugin');
  const home = join(caseDirectory, 'home');
  const tmp = join(caseDirectory, 'tmp');
  const auth = join(codexHome, 'auth.json');

  const removeAuth = () => rmSync(auth, { force: true });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      removeAuth();
      process.exit(130);
    });
  }

  const summary = { case: values.case, app, dryRun: values['dry-run'] };
  try {
    for (const directory of [home, tmp, codexHome]) mkdirSync(directory, { recursive: true });
    execFileSync('rsync', ['-a', '--exclude', 'node_modules', '--exclude', '.git', '--exclude', 'dist', `${resolve(values.fixture)}/`, `${app}/`]);
    if (values['node-modules']) execFileSync('cp', ['-cR', resolve(values['node-modules']), join(app, 'node_modules')]);
    execFileSync('git', ['-C', app, 'init', '-q']);
    writeFileSync(join(app, '.git/info/exclude'), 'node_modules\ndist\n', { flag: 'a' });
    git(app, 'add', '-A');
    git(app, '-c', 'user.name=eval', '-c', 'user.email=eval@localhost', 'commit', '-qm', 'before');

    await packagePlugin({ destination: plugin });
    copyFileSync(join(homedir(), '.codex/auth.json'), auth);
    writeFileSync(join(codexHome, 'config.toml'), `[projects."${app}"]\ntrust_level = "trusted"\n\n[sandbox_workspace_write]\nnetwork_access = true\n`);

    const env = { ...process.env, CODEX_HOME: codexHome, HOME: home, TMPDIR: tmp };
    const marketplace = JSON.parse(readFileSync(join(plugin, '.claude-plugin/marketplace.json'), 'utf8'));
    const pluginName = marketplace.plugins[0].name;
    for (const args of [['plugin', 'marketplace', 'add', plugin], ['plugin', 'add', `${pluginName}@${marketplace.name}`]]) {
      const result = await codex(env, args);
      if (result.code !== 0) throw new Error(`codex ${args.join(' ')} failed:\n${result.stderr}`);
    }
    const cacheRoot = join(codexHome, 'plugins/cache', marketplace.name, pluginName);
    const versions = existsSync(cacheRoot) ? readdirSync(cacheRoot) : [];
    if (versions.length !== 1) throw new Error(`Expected one cached plugin version in ${cacheRoot}, found ${versions.length}`);
    summary.plugin = diffTrees(plugin, join(cacheRoot, versions[0]));
    if (summary.plugin.missing.length || summary.plugin.changed.length) {
      throw new Error(`Installed plugin differs from the package: ${JSON.stringify(summary.plugin)}`);
    }

    if (!values['dry-run']) {
      const caseEntries = readdirSync(caseDirectory);
      const tmpBefore = readdirSync('/tmp');
      const attempts = Number(values.attempts);
      for (let attempt = 1; attempt <= attempts; attempt++) {
        const result = await codex(env, ['exec', '--json', '--sandbox', 'workspace-write', '-C', app, '--add-dir', caseDirectory, values.prompt]);
        writeFileSync(join(caseDirectory, 'run.jsonl'), result.stdout);
        writeFileSync(join(caseDirectory, 'run.err'), result.stderr);
        Object.assign(summary, { attempts: attempt, exitCode: result.code });
        if (!isCapacityFailure(result.stdout) || attempt === attempts) break;
        git(app, 'checkout', '-q', '.');
        git(app, 'clean', '-qfd');
        for (const name of newEntries(caseEntries, readdirSync(caseDirectory))) {
          if (!['run.jsonl', 'run.err'].includes(name)) rmSync(join(caseDirectory, name), { recursive: true, force: true });
        }
        await new Promise(wait => setTimeout(wait, 90_000));
      }
      summary.capacityFailure = isCapacityFailure(readFileSync(join(caseDirectory, 'run.jsonl'), 'utf8'));
      // Other processes may also have created entries in the meantime.
      summary.newTmpEntries = newEntries(tmpBefore, readdirSync('/tmp'));
    }
  } finally {
    removeAuth();
    const leftover = authFiles(root);
    summary.authRemoved = leftover.length === 0;
    if (leftover.length) {
      console.error(`auth.json remains under ${root}: ${leftover.join(', ')}`);
      process.exitCode = 1;
    }
  }
  writeFileSync(join(caseDirectory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify(summary, null, 2));
  if (summary.exitCode || summary.capacityFailure) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
