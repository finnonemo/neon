#!/usr/bin/env node
// Runs one Claude Code eval sample against a packaged plugin, with the same
// permissions, harness note and browser tool every time, so before/after arms
// stay comparable.
//
//   node evals/skills/run-claude-case.mjs --fixture <app> --case <name> --prompt <text>
//     [--ref <commit> | --package <dir>] [--dev-port <n>] [--model <id>]
//     [--cap <seconds>] [--root .local/evals] [--dry-run]
//
// <root>/<case>/ holds the app copy (a git repository with the fixture as its
// first commit), the run inputs, run.jsonl, run.err and summary.json. The plugin
// is packaged from --ref (a temporary worktree), taken from --package, or packaged
// from this checkout. `{port}` in the prompt becomes --dev-port, where the app's
// `npm run dev` is started before the run and stopped after it. The run is
// stopped at --cap seconds. summary.json lists every denied command; a denial
// voids the sample only if it stopped the build or the look (README "Running
// agent samples").
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { packagePlugin } from '../../scripts/package-plugin.mjs';

const repositoryRoot = resolve(import.meta.dirname, '../..');

// Read-only and build commands an agent needs to inspect, build and look; nothing
// that rewrites history or reaches outside the workspace on its own.
const bashPrefixes = [
  'ls', 'pwd', 'cd', 'cat', 'head', 'tail', 'wc', 'grep', 'find', 'echo', 'test', 'sed', 'rg', 'sort', 'which', 'curl', 'lsof', 'kill', 'sleep',
  'mkdir', 'cp', 'node', 'npm', 'npx', 'sips', 'file', 'python3', 'npm run',
  'git status', 'git log', 'git diff', 'git ls-files', 'git rev-parse', 'git show', 'git branch',
];
export const BROWSER_TOOLS = ['navigate', 'resize', 'evaluate', 'screenshot', 'console'].map(name => `mcp__browser__${name}`);
export const ALLOWED_TOOLS = ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'Skill', ...BROWSER_TOOLS, 'Bash(pwd)', ...bashPrefixes.filter(prefix => prefix !== 'pwd').map(prefix => `Bash(${prefix}:*)`)];

// Without this note, runs read one denied compound command as "the shell is
// blocked" and stopped before building or looking (records/output-quality-blind.md).
export const PERMISSION_NOTE = `Shell permissions in this session: Bash is allowed for commands that start with one of: ${bashPrefixes.join(', ')}. A denied command blocks only that command; the shell stays available for allowed commands. Variable assignments, loops and $(...) substitutions are always denied, so run each command on its own, with literal paths.`;

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

// Every permission denial in a stream-json transcript, including one cut off before its result event.
export function deniedCommands(jsonl) {
  const inputs = new Map();
  const denied = [];
  for (const line of jsonl.split('\n')) {
    let event;
    try { event = JSON.parse(line); } catch { continue; }
    for (const part of event.message?.content ?? []) {
      if (part.type === 'tool_use') inputs.set(part.id, part.input);
    }
    if (event.type === 'system' && event.subtype === 'permission_denied') {
      const input = inputs.get(event.tool_use_id) ?? {};
      denied.push({ tool: event.tool_name, command: input.command ?? input.file_path ?? null });
    }
  }
  return denied;
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
      'dry-run': { type: 'boolean', default: false },
    },
  });
  if (!values.fixture || !values.case || !values.prompt || (values.ref && values.package)) {
    throw new Error('Usage: run-claude-case.mjs --fixture <app> --case <name> --prompt <text> [--ref <commit> | --package <dir>] [--dev-port <n>] [--model <id>] [--cap <seconds>] [--root <dir>] [--dry-run]');
  }
  const port = values['dev-port'];
  if (values.prompt.includes('{port}') && !port) throw new Error('The prompt names {port}; pass --dev-port.');

  const root = resolve(values.root);
  const caseDirectory = join(root, values.case);
  if (existsSync(caseDirectory)) throw new Error(`Case already exists: ${caseDirectory}`);
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
    try {
      if (port) {
        server = spawn('npm', ['run', 'dev', '--', '--port', port, '--strictPort'], { cwd: app, detached: true, stdio: 'ignore' });
        if (!await waitFor(`http://localhost:${port}/`, 60)) throw new Error(`The dev server did not answer on port ${port} within 60s.`);
      }
      summary.startedAt = new Date().toISOString();
      const run = spawn('claude', args, { cwd: app, stdio: ['ignore', 'pipe', 'pipe'] });
      const out = [];
      const err = [];
      run.stdout.on('data', chunk => out.push(chunk));
      run.stderr.on('data', chunk => err.push(chunk));
      const timer = setTimeout(() => { summary.stoppedAtCap = true; run.kill('SIGTERM'); }, summary.cap * 1000);
      summary.exitCode = await new Promise(done => run.on('close', done));
      clearTimeout(timer);
      summary.endedAt = new Date().toISOString();
      summary.stoppedAtCap ??= false;
      const jsonl = Buffer.concat(out).toString();
      writeFileSync(join(caseDirectory, 'run.jsonl'), jsonl);
      writeFileSync(join(caseDirectory, 'run.err'), Buffer.concat(err).toString());
      summary.deniedCommands = deniedCommands(jsonl);
      // Staged first, so files the run created appear in the patch.
      execFileSync('git', ['-C', app, 'add', '-A']);
      writeFileSync(join(caseDirectory, 'diff.patch'), execFileSync('git', ['-C', app, 'diff', '--cached', 'HEAD'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
    } finally {
      stopGroup(server);
    }
  }
  writeFileSync(join(caseDirectory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify(summary, null, 2));
  if (summary.exitCode) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
