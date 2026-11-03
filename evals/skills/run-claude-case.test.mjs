import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ALLOWED_TOOLS, BROWSER_TOOLS, PERMISSION_NOTE, claudeArgs, pointAtRegistry, registryPreflight, resultWatcher, runFacts, serveRegistry } from './run-claude-case.mjs';

const runner = join(import.meta.dirname, 'run-claude-case.mjs');

test('the note names every allowed shell prefix and says a denial blocks only that command', () => {
  for (const tool of ALLOWED_TOOLS) {
    const prefix = tool.match(/^Bash\((.+?)(?::\*)?\)$/)?.[1];
    if (prefix) assert.ok(PERMISSION_NOTE.includes(prefix), prefix);
  }
  assert.match(PERMISSION_NOTE, /A denied command blocks only that command/);
  assert.ok(BROWSER_TOOLS.every(tool => ALLOWED_TOOLS.includes(tool)));
  assert.ok(!ALLOWED_TOOLS.includes('Bash'), 'unrestricted Bash is never allowed');
});

test('every run gets the same permissions, note, browser tool and isolation from user settings', () => {
  const args = claudeArgs({ plugin: '/pkg', mcpConfig: '/case/mcp.json', prompt: 'Build it' });
  const value = flag => args[args.indexOf(flag) + 1];
  assert.equal(value('--allowedTools'), ALLOWED_TOOLS.join(' '));
  assert.equal(value('--append-system-prompt'), PERMISSION_NOTE);
  assert.equal(value('--permission-mode'), 'dontAsk');
  assert.equal(value('--setting-sources'), 'project,local');
  assert.equal(value('--plugin-dir'), '/pkg');
  assert.ok(args.includes('--strict-mcp-config'));
  assert.equal(args.at(-1), 'Build it');
  assert.ok(!args.includes('--model'));
  assert.equal(claudeArgs({ plugin: '/pkg', mcpConfig: '/m', prompt: 'p', model: 'claude-opus-5-5' })[2], 'claude-opus-5-5');
});

test('the README quotes the note and allowlist the runner uses', async () => {
  const readme = await readFile(join(import.meta.dirname, 'README.md'), 'utf8');
  assert.ok(readme.includes(`Note, verbatim: "${PERMISSION_NOTE}"`), 'README quotes PERMISSION_NOTE');
  const allowlist = readme.match(/^- Allowlist: .*$/m)[0];
  for (const tool of ALLOWED_TOOLS) {
    const prefix = tool.match(/^Bash\((.+):\*\)$/)?.[1];
    if (prefix) for (const word of prefix.split(' ')) assert.match(allowlist, new RegExp(`[\\s\`/]${word}[\\s\`/,]`), prefix);
    else if (!BROWSER_TOOLS.includes(tool)) assert.ok(allowlist.includes(tool), tool);
  }
});

test('a dry run copies the fixture into a fresh repository and writes the run inputs', async t => {
  const root = await mkdtemp(join(tmpdir(), 'neon-claude-case-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const fixture = join(root, 'fixture', 'app');
  await mkdir(join(fixture, 'node_modules'), { recursive: true });
  await writeFile(join(fixture, 'index.html'), '<h1>Before</h1>\n');
  const plugin = join(root, 'pkg');
  await mkdir(plugin);
  const run = spawnSync(process.execPath, [runner, '--fixture', fixture, '--case', 'c1', '--prompt', 'Use port {port}', '--dev-port', '5999', '--package', plugin, '--root', join(root, 'evals'), '--dry-run'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  const caseDirectory = join(root, 'evals', 'c1');
  const summary = JSON.parse(await readFile(join(caseDirectory, 'summary.json'), 'utf8'));
  assert.equal(summary.dryRun, true);
  assert.equal(summary.package, plugin);
  assert.equal(await readFile(join(caseDirectory, 'prompt.txt'), 'utf8'), 'Use port 5999\n');
  assert.equal(await readFile(join(caseDirectory, 'note.txt'), 'utf8'), `${PERMISSION_NOTE}\n`);
  assert.match(await readFile(join(caseDirectory, 'mcp.json'), 'utf8'), /browser-mcp\.mjs/);
  const log = spawnSync('git', ['-C', join(caseDirectory, 'app'), 'log', '--oneline'], { encoding: 'utf8' });
  assert.match(log.stdout, /before/);
  const files = spawnSync('git', ['-C', join(caseDirectory, 'app'), 'ls-files'], { encoding: 'utf8' });
  assert.equal(files.stdout, 'index.html\n');
  const again = spawnSync(process.execPath, [runner, '--fixture', fixture, '--case', 'c1', '--prompt', 'p', '--package', plugin, '--root', join(root, 'evals'), '--dry-run'], { encoding: 'utf8' });
  assert.notEqual(again.status, 0);
  assert.match(again.stderr, /Case already exists/);
});

test('a prompt naming {port} needs --dev-port', () => {
  const run = spawnSync(process.execPath, [runner, '--fixture', '.', '--case', 'x', '--prompt', 'port {port}', '--dry-run'], { encoding: 'utf8' });
  assert.notEqual(run.status, 0);
  assert.match(run.stderr, /pass --dev-port/);
});

test('serveRegistry serves this checkout\'s registry built for its own URL', async () => {
  const { url, close } = await serveRegistry();
  try {
    const base = await (await fetch(`${url}/neon-base.json`)).json();
    assert.equal(base.name, 'neon-base');
    assert.ok(JSON.stringify(base).includes(url), 'registry dependencies point back at the served URL');
    assert.equal((await fetch(`${url}/missing.json`)).status, 404);
  } finally {
    await close();
  }
});

test('resultWatcher fires once on a result event, even split across chunks', () => {
  const seen = [];
  const feed = resultWatcher(event => seen.push(event.total_cost_usd));
  feed(Buffer.from('{"type":"assistant"}\n{"type":"res'));
  feed(Buffer.from('ult","total_cost_usd":1.5}\nnot json\n{"type":"result","total_cost_usd":2}\n'));
  assert.deepEqual(seen, [1.5]);
});

test('registryPreflight warns when the pinned registry does not answer', async () => {
  const root = await mkdtemp(join(tmpdir(), 'neon-preflight-'));
  try {
    await mkdir(join(root, '.claude-plugin'));
    await writeFile(join(root, '.claude-plugin/plugin.json'), '{"version":"9.9.9"}');
    const asked = [];
    const missing = await registryPreflight(root, async url => { asked.push(url); return { ok: false, status: 404 }; });
    assert.match(asked[0], /neon--v9\.9\.9\/registry\/r\/neon-base\.json$/);
    assert.match(missing, /404.*--serve-registry/);
    assert.equal(await registryPreflight(root, async () => ({ ok: true })), null);
    assert.match(await registryPreflight(root, async () => { throw new Error('offline'); }), /offline.*--serve-registry/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('pointAtRegistry points an existing app\'s @neon entry at the served registry and leaves other apps alone', async (t) => {
  const app = await mkdtemp(join(tmpdir(), 'neon-point-'));
  t.after(() => rm(app, { recursive: true, force: true }));
  assert.equal(pointAtRegistry(app, 'http://127.0.0.1:1/r'), false);
  await writeFile(join(app, 'components.json'), `${JSON.stringify({ style: 'x', registries: { '@neon': 'https://old/r/{name}.json', '@other': 'o' } })}\n`);
  assert.equal(pointAtRegistry(app, 'http://127.0.0.1:1/r'), true);
  assert.deepEqual(JSON.parse(await readFile(join(app, 'components.json'), 'utf8')).registries, { '@neon': 'http://127.0.0.1:1/r/{name}.json', '@other': 'o' });
  assert.equal(pointAtRegistry(app, 'http://127.0.0.1:1/r'), false);
  await writeFile(join(app, 'components.json'), '{"style":"x"}\n');
  assert.equal(pointAtRegistry(app, 'http://127.0.0.1:1/r'), false);
});

test('runFacts reads the model, cost and final report from a stream-json log', () => {
  const jsonl = [
    { type: 'system', subtype: 'init', model: 'claude-opus-5-5' },
    { type: 'assistant', message: { content: [{ type: 'text', text: 'Working' }] } },
    { type: 'result', subtype: 'success', total_cost_usd: 0.4617, result: 'The header is navy.' },
  ].map(event => JSON.stringify(event)).join('\n');
  assert.deepEqual(runFacts(`${jsonl}\nnot json\n`), { model: 'claude-opus-5-5', costUsd: 0.4617, report: 'The header is navy.', turns: 0, durationMs: 0 });
  assert.deepEqual(runFacts(''), { model: null, costUsd: null, report: null, turns: null, durationMs: null });
});

test('runFacts takes cost from the last result, since total_cost_usd is cumulative, and adds up turns and duration', () => {
  const jsonl = ['{"type":"result","total_cost_usd":2.73,"num_turns":74,"duration_ms":549648}', '{"type":"assistant"}', '{"type":"result","total_cost_usd":2.84,"num_turns":3,"duration_ms":8405}'].join('\n');
  const { costUsd, turns, durationMs } = runFacts(jsonl);
  assert.deepEqual({ costUsd, turns, durationMs }, { costUsd: 2.84, turns: 77, durationMs: 558053 });
});

// 3 November 2026: a TSV through `xargs -I` hit macOS's 255-byte limit, and
// bash `read` collapsed an empty ref column, so five of eight runs never started.
test('--cases runs each listed case with the shared options', async t => {
  const root = await mkdtemp(join(tmpdir(), 'neon-claude-batch-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const fixture = join(root, 'app');
  await mkdir(fixture);
  await writeFile(join(fixture, 'index.html'), '<h1>Before</h1>\n');
  const plugin = join(root, 'pkg');
  await mkdir(plugin);
  const long = 'Make the header navy. '.repeat(20);
  const cases = join(root, 'cases.json');
  await writeFile(cases, JSON.stringify([
    { case: 'a', fixture, prompt: long },
    { case: 'b', fixture, prompt: 'Use port {port}', devPort: 5998, model: 'claude-opus-5-5' },
  ]));
  const run = spawnSync(process.execPath, [runner, '--cases', cases, '--parallel', '2', '--package', plugin, '--root', join(root, 'evals'), '--dry-run'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /^a: done$/m);
  assert.match(run.stdout, /^b: done$/m);
  assert.equal(await readFile(join(root, 'evals/a/prompt.txt'), 'utf8'), `${long}\n`);
  assert.equal(await readFile(join(root, 'evals/b/prompt.txt'), 'utf8'), 'Use port 5998\n');
  const summary = JSON.parse(await readFile(join(root, 'evals/b/summary.json'), 'utf8'));
  assert.equal(summary.command[summary.command.indexOf('--model') + 1], 'claude-opus-5-5');
});

test('--cases checks every case before starting any', async t => {
  const root = await mkdtemp(join(tmpdir(), 'neon-claude-batch-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const cases = join(root, 'cases.json');
  for (const [list, message] of [
    [[{ case: 'a', fixture: root, prompt: 'p' }, { case: 'a', fixture: root, prompt: 'q' }], /Duplicate case: a/],
    [[{ case: 'a', fixture: root, prompt: 'p' }, { case: 'b', fixture: root }], /Case b needs case, fixture and prompt/],
    [[{ case: 'a', fixture: root, prompt: 'port {port}' }], /Case a names \{port\}; give it devPort/],
    [[{ case: 'a', fixture: root, prompt: 'p', devPort: 5998 }, { case: 'b', fixture: root, prompt: 'q', devPort: 5998 }], /Duplicate dev port: 5998/],
  ]) {
    await writeFile(cases, JSON.stringify(list));
    const run = spawnSync(process.execPath, [runner, '--cases', cases, '--root', join(root, 'evals'), '--dry-run'], { encoding: 'utf8' });
    assert.notEqual(run.status, 0);
    assert.match(run.stderr, message);
    assert.equal(spawnSync('ls', [join(root, 'evals')]).status === 0, false, 'no case directory was created');
  }
});
