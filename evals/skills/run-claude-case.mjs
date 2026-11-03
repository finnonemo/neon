#!/usr/bin/env node
// Runs one Claude Code eval sample against a packaged plugin, with the same
// permissions, harness note and browser tool every time, so before/after arms
// stay comparable.
//
//   node evals/skills/run-claude-case.mjs --fixture <app> --case <name> --prompt <text>
//     [--ref <commit> | --package <dir>] [--dev-port <n>] [--model <id>]
//     [--cap <seconds>] [--root .local/evals] [--serve-registry] [--dry-run]
//   node evals/skills/run-claude-case.mjs --cases <cases.json> [--parallel <n>] [shared options]
//
// --cases takes a JSON list of { case, fixture, prompt, ref?, package?, devPort?,
// model?, cap? }; a case's own fields win over the shared options. Every case is
// checked before any starts, and at most --parallel (default 4) run at once.
//
// <root>/<case>/ holds the app copy (a git repository with the fixture as its
// first commit), the run inputs, run.jsonl, run.err, report.md (the run's final
// reply) and summary.json, which adds the model the run used, its cost, turns
// and duration. The plugin is packaged from --ref (a temporary worktree), taken
// from --package, or packaged from this checkout. `{port}` in the prompt becomes
// --dev-port, where the app's `npm run dev` is started before the run and
// stopped after it. The run is stopped at --cap seconds. summary.json carries check-run.mjs's result: every
// denied command, and void when the run then reported the shell as blocked.
// --serve-registry serves this checkout's Neon registry on localhost and sets
// NEON_REGISTRY_URL for the run, so `install.mjs --new` and `--add` work
// before the release is tagged, without the agent passing --registry. Without
// it, a package whose pinned registry does not answer gets a warning first.
// The run ends RESULT_GRACE seconds after its first result event: a process it
// left in the background, such as a dev server, would otherwise hold it to --cap.
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { packagePlugin } from '../../scripts/package-plugin.mjs';
import { buildRegistry, pinnedRegistryUrl } from '../../scripts/lib/registry.mjs';
import { checkRun } from './check-run.mjs';

const repositoryRoot = resolve(import.meta.dirname, '../..');

// Read-only and build commands an agent needs to inspect, build and look; nothing
// that rewrites history or reaches outside the workspace on its own.
const bashPrefixes = [
  'ls', 'pwd', 'cd', 'cat', 'head', 'tail', 'wc', 'grep', 'find', 'echo', 'test', 'sed', 'rg', 'sort', 'which', 'curl', 'lsof', 'kill', 'sleep',
  'mkdir', 'cp', 'node', 'npm', 'npx', 'sips', 'file', 'python3', 'npm run',
  'git status', 'git log', 'git diff', 'git ls-files', 'git rev-parse', 'git show', 'git branch',
];
export const BROWSER_TOOLS = ['navigate', 'resize', 'evaluate', 'screenshot', 'console'].map(name => `mcp__browser__${name}`);
export const ALLOWED_TOOLS = ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'Skill', ...BROWSER_TOOLS, ...bashPrefixes.map(prefix => `Bash(${prefix}:*)`)];

// Without this note, runs read one denied compound command as "the shell is
// blocked" and stopped before building or looking (records/output-quality-blind.md).
export const PERMISSION_NOTE = `Shell permissions in this session: Bash is allowed for commands that start with one of: ${[bashPrefixes.filter(prefix => !prefix.includes(' ')).join(' '), ...bashPrefixes.filter(prefix => prefix.includes(' '))].join(', ')}. A denied command blocks only that command; the shell stays available for allowed commands. Variable assignments, loops and $(...) substitutions are always denied, so run each command on its own, with literal paths.`;

export function claudeArgs({ plugin, mcpConfig, prompt, model }) {
  return [
    '-p', ...(model ? ['--model', model] : []),
    // Project and local settings only: the evaluator's own hooks and plugins stay out of the run.
    '--setting-sources', 'project,local',
    '--plugin-dir', plugin, '--add-dir', plugin,
    '--mcp-config', mcpConfig, '--strict-mcp-config',
    '--permission-mode', 'dontAsk', '--allowedTools', ALLOWED_TOOLS.join(' '),
    '--append-system-prompt', PERMISSION_NOTE,
    '--output-format', 'stream-json', '--verbose', prompt,
  ];
}

// The model, cost, turns, duration and final reply a stream-json log records;
// null when absent. total_cost_usd is cumulative, so cost is the last result's;
// turns and duration are per result, so they add up.
export function runFacts(jsonl) {
  const facts = { model: null, costUsd: null, report: null, turns: null, durationMs: null };
  for (const line of jsonl.split('\n')) {
    let event;
    try { event = JSON.parse(line); } catch { continue; }
    if (event.type === 'system' && event.subtype === 'init') facts.model = event.model ?? facts.model;
    if (event.type === 'result') {
      Object.assign(facts, {
        costUsd: event.total_cost_usd ?? null,
        report: event.result ?? null,
        turns: (facts.turns ?? 0) + (event.num_turns ?? 0),
        durationMs: (facts.durationMs ?? 0) + (event.duration_ms ?? 0),
      });
    }
  }
  return facts;
}

function packageAt(ref, destination) {
  const checkout = mkdtempSync(join(tmpdir(), 'neon-ref-'));
  try {
    execFileSync('git', ['-C', repositoryRoot, 'worktree', 'add', '--detach', '-q', checkout, ref]);
    // The ref's own packager, so the package matches what that revision shipped.
    execFileSync(process.execPath, [join(checkout, 'scripts/package-plugin.mjs'), destination], { stdio: 'ignore' });
    return execFileSync('git', ['-C', checkout, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } finally {
    execFileSync('git', ['-C', repositoryRoot, 'worktree', 'remove', '--force', checkout]);
  }
}

const RESULT_GRACE = 30;

/** Calls onResult once, on the first stream-json `result` event in the chunks fed to it. */
export function resultWatcher(onResult) {
  let pending = '';
  let fired = false;
  return chunk => {
    if (fired) return;
    const lines = (pending + chunk).split('\n');
    pending = lines.pop();
    for (const line of lines) {
      let event;
      try { event = JSON.parse(line); } catch { continue; }
      if (event?.type === 'result') {
        fired = true;
        onResult(event);
        return;
      }
    }
  };
}

/** A warning when the package's pinned registry does not answer, else null. */
export async function registryPreflight(packageRoot, fetchImpl = fetch) {
  const url = `${await pinnedRegistryUrl(packageRoot)}/neon-base.json`;
  const hint = 'a run that creates an app or adds Neon items will fail at install; pass --serve-registry';
  try {
    const response = await fetchImpl(url, { method: 'HEAD' });
    return response.ok ? null : `${url} answered ${response.status}: ${hint}.`;
  } catch (error) {
    return `${url} did not answer (${error.message}): ${hint}.`;
  }
}

/** Serves this checkout's built Neon registry at `url`, as the smoke build does. */
export async function serveRegistry() {
  const directory = mkdtempSync(join(tmpdir(), 'neon-eval-registry-'));
  // Async reads, so the server keeps answering while the run is awaited.
  const server = createServer(async (request, response) => {
    try {
      const body = await readFile(join(directory, decodeURIComponent(new URL(request.url, 'http://x').pathname)));
      response.writeHead(200, { 'content-type': 'application/json' }).end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise(listening => server.listen(0, '127.0.0.1', listening));
  const url = `http://127.0.0.1:${server.address().port}/r`;
  await mkdir(join(directory, 'r'));
  for (const [name, content] of await buildRegistry({ root: repositoryRoot, url })) await writeFile(join(directory, 'r', name), content);
  const close = async () => {
    await new Promise(closed => server.close(closed));
    await rm(directory, { recursive: true, force: true });
  };
  return { url, close };
}

async function waitFor(url, seconds) {
  for (let second = 0; second < seconds; second++) {
    try { if ((await fetch(url)).ok) return true; } catch {}
    await new Promise(wait => setTimeout(wait, 1000));
  }
  return false;
}

function stopGroup(child) {
  if (!child || child.exitCode !== null) return;
  try { process.kill(-child.pid, 'SIGTERM'); } catch { child.kill('SIGTERM'); }
}

const usage = 'Usage: run-claude-case.mjs --fixture <app> --case <name> --prompt <text> [--ref <commit> | --package <dir>] [--dev-port <n>] [--model <id>] [--cap <seconds>] [--root <dir>] [--serve-registry] [--dry-run], or --cases <cases.json> [--parallel <n>]';

// Throws before anything is copied, so a batch never starts half its cases.
function checkCase(values) {
  const name = values.case ?? '(unnamed)';
  if (!values.fixture || !values.case || !values.prompt) throw new Error(values.cases ? `Case ${name} needs case, fixture and prompt.` : usage);
  if (values.ref && values.package) throw new Error(`Case ${name} takes --ref or --package, not both.`);
  if (values.prompt.includes('{port}') && !values['dev-port']) throw new Error(values.cases ? `Case ${values.case} names {port}; give it devPort.` : 'The prompt names {port}; pass --dev-port.');
  const caseDirectory = join(resolve(values.root), values.case);
  if (existsSync(caseDirectory)) throw new Error(`Case already exists: ${caseDirectory}`);
}

async function runCase(values) {
  const port = values['dev-port'];
  const root = resolve(values.root);
  const caseDirectory = join(root, values.case);
  const app = join(caseDirectory, basename(resolve(values.fixture)));
  mkdirSync(caseDirectory, { recursive: true });
  execFileSync('rsync', ['-a', '--exclude', 'node_modules', '--exclude', '.git', '--exclude', 'dist', `${resolve(values.fixture)}/`, `${app}/`]);
  execFileSync('git', ['-C', app, 'init', '-q']);
  writeFileSync(join(app, '.git/info/exclude'), 'node_modules\ndist\n', { flag: 'a' });
  execFileSync('git', ['-C', app, 'add', '-A']);
  execFileSync('git', ['-C', app, '-c', 'user.name=eval', '-c', 'user.email=eval@localhost', 'commit', '-qm', 'before']);
  if (existsSync(join(app, 'package.json'))) {
    const lock = existsSync(join(app, 'package-lock.json'));
    execFileSync('npm', [lock ? 'ci' : 'install', '--no-audit', '--no-fund'], { cwd: app, stdio: 'ignore' });
  }

  const summary = { case: values.case, app, cap: Number(values.cap), model: values.model ?? null };
  if (values.package) summary.package = resolve(values.package);
  else {
    summary.package = join(caseDirectory, 'plugin');
    if (values.ref) summary.ref = packageAt(values.ref, summary.package);
    else await packagePlugin({ destination: summary.package });
  }
  const prompt = values.prompt.replaceAll('{port}', port ?? '');
  const mcpConfig = join(caseDirectory, 'mcp.json');
  writeFileSync(mcpConfig, `${JSON.stringify({ mcpServers: { browser: { command: process.execPath, args: [join(import.meta.dirname, 'browser-mcp.mjs')] } } })}\n`);
  writeFileSync(join(caseDirectory, 'prompt.txt'), `${prompt}\n`);
  writeFileSync(join(caseDirectory, 'allowlist.txt'), `${ALLOWED_TOOLS.join(' ')}\n`);
  writeFileSync(join(caseDirectory, 'note.txt'), `${PERMISSION_NOTE}\n`);
  try { summary.claudeVersion = execFileSync('claude', ['--version'], { encoding: 'utf8' }).trim(); } catch { summary.claudeVersion = null; }
  const args = claudeArgs({ plugin: summary.package, mcpConfig, prompt, model: values.model });

  if (values['dry-run']) {
    summary.dryRun = true;
    summary.command = ['claude', ...args];
  } else {
    let server;
    let registry;
    const env = { ...process.env };
    try {
      if (values['serve-registry']) {
        registry = await serveRegistry();
        env.NEON_REGISTRY_URL = summary.registry = registry.url;
      } else if ((summary.registryWarning = await registryPreflight(summary.package))) console.error(`Warning: ${summary.registryWarning}`);
      else delete summary.registryWarning;
      if (port) {
        server = spawn('npm', ['run', 'dev', '--', '--port', port, '--strictPort'], { cwd: app, detached: true, stdio: 'ignore' });
        if (!await waitFor(`http://localhost:${port}/`, 60)) throw new Error(`The dev server did not answer on port ${port} within 60s.`);
      }
      summary.startedAt = new Date().toISOString();
      const run = spawn('claude', args, { cwd: app, env, stdio: ['ignore', 'pipe', 'pipe'] });
      const out = [];
      const err = [];
      let grace;
      const watch = resultWatcher(() => {
        summary.endedOnResult = true;
        grace = setTimeout(() => run.kill('SIGTERM'), RESULT_GRACE * 1000);
      });
      run.stdout.on('data', chunk => { out.push(chunk); watch(chunk); });
      run.stderr.on('data', chunk => err.push(chunk));
      const timer = setTimeout(() => { summary.stoppedAtCap = true; run.kill('SIGTERM'); }, summary.cap * 1000);
      summary.exitCode = await new Promise(done => run.on('close', done));
      clearTimeout(timer);
      clearTimeout(grace);
      summary.endedAt = new Date().toISOString();
      summary.stoppedAtCap ??= false;
      summary.endedOnResult ??= false;
      const jsonl = Buffer.concat(out).toString();
      writeFileSync(join(caseDirectory, 'run.jsonl'), jsonl);
      writeFileSync(join(caseDirectory, 'run.err'), Buffer.concat(err).toString());
      const { model, report, ...stats } = runFacts(jsonl);
      Object.assign(summary, { model: model ?? summary.model, ...stats }, checkRun(jsonl));
      if (report !== null) writeFileSync(join(caseDirectory, 'report.md'), `${report}\n`);
      // Staged first, so files the run created appear in the patch.
      execFileSync('git', ['-C', app, 'add', '-A']);
      writeFileSync(join(caseDirectory, 'diff.patch'), execFileSync('git', ['-C', app, 'diff', '--cached', 'HEAD'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
    } finally {
      stopGroup(server);
      await registry?.close();
    }
  }
  writeFileSync(join(caseDirectory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  return summary;
}


async function main() {
  const { values } = parseArgs({
    options: {
      fixture: { type: 'string' },
      case: { type: 'string' },
      prompt: { type: 'string' },
      ref: { type: 'string' },
      package: { type: 'string' },
      'dev-port': { type: 'string' },
      model: { type: 'string' },
      cap: { type: 'string', default: '2700' },
      root: { type: 'string', default: join(repositoryRoot, '.local/evals') },
      'serve-registry': { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
      cases: { type: 'string' },
      parallel: { type: 'string', default: '4' },
    },
  });
  if (!values.cases) {
    checkCase(values);
    const summary = await runCase(values);
    console.log(JSON.stringify(summary, null, 2));
    if (summary.exitCode) process.exitCode = 1;
    return;
  }
  const { cases: _, parallel, ...shared } = values;
  const list = JSON.parse(await readFile(resolve(values.cases), 'utf8')).map(({ devPort, cap, ...item }) => ({
    ...shared, cases: values.cases, ...item,
    ...(devPort === undefined ? {} : { 'dev-port': String(devPort) }),
    ...(cap === undefined ? {} : { cap: String(cap) }),
  }));
  const names = new Set();
  const ports = new Set();
  for (const item of list) {
    if (names.has(item.case)) throw new Error(`Duplicate case: ${item.case}`);
    names.add(item.case);
    // Parallel runs on one dev server would read each other's app.
    if (ports.has(item['dev-port'])) throw new Error(`Duplicate dev port: ${item['dev-port']}`);
    if (item['dev-port'] !== undefined) ports.add(item['dev-port']);
    checkCase(item);
  }
  // Each case runs in its own process: setup blocks on npm and git, which would
  // stall another case's registry server in this one.
  const flags = item => Object.entries(item).flatMap(([key, value]) => {
    if (key === 'cases' || value === undefined || value === false) return [];
    return value === true ? [`--${key}`] : [`--${key}`, String(value)];
  });
  let next = 0;
  const worker = async () => {
    while (next < list.length) {
      const item = list[next++];
      const child = spawn(process.execPath, [import.meta.filename, ...flags(item)], { stdio: ['ignore', 'ignore', 'pipe'] });
      const err = [];
      child.stderr.on('data', chunk => err.push(chunk));
      const code = await new Promise(done => child.on('close', done));
      const reason = Buffer.concat(err).toString().trim().split('\n').at(-1);
      console.log(`${item.case}: ${code ? `failed (exit ${code})${reason ? `, ${reason}` : ''}` : 'done'}`);
      if (code) process.exitCode = 1;
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Number(parallel)) }, worker));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
