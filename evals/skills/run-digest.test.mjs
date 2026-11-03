import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { digest, parseRun } from './run-digest.mjs';

const script = join(import.meta.dirname, 'run-digest.mjs');
const use = (name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id: name, name, input }] } });
const result = (text, cost) => ({ type: 'result', subtype: 'success', result: text, total_cost_usd: cost });

// Shaped like the #123 runs: a closing report, then a second turn after the dev
// server stopped, then a line cut off when the run was stopped.
const run = [
  { type: 'system', subtype: 'init' },
  use('Skill', { skill: 'neon:neon-create', args: 'Build a campaign page' }),
  use('Bash', { command: 'ls app\nnpm run build', description: 'List and build' }),
  use('Read', { file_path: '/plugin/skills/neon-create/SKILL.md' }),
  use('Grep', { pattern: 'NeonContext' }),
  use('Write', { file_path: '/app/DESIGN.md', content: '# Design' }),
  use('Edit', { file_path: '/app/src/App.tsx', old_string: 'a', new_string: 'b' }),
  { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 'Bash', content: 'ok' }] } },
  result('Built the page at http://localhost:5202.', 2.62),
  use('Bash', { command: 'npm run dev' }),
  result('Restarted the dev server.\nIt is back up.', 2.73),
].map(event => JSON.stringify(event)).join('\n') + '\n{"type":"assis';

test('digests the tool calls in order, with the last result and its cost', () => {
  assert.deepEqual(digest(parseRun(run)), {
    steps: [
      ['skill', 'neon:neon-create'],
      ['bash', 'ls app\nnpm run build'],
      ['read', '/plugin/skills/neon-create/SKILL.md'],
      ['write', '/app/DESIGN.md'],
      ['edit', '/app/src/App.tsx'],
      ['bash', 'npm run dev'],
    ],
    results: 2,
    result: 'Restarted the dev server.\nIt is back up.',
    costUsd: 2.73,
  });
});

test('a run stopped before any result has no result or cost', () => {
  assert.deepEqual(digest(parseRun(JSON.stringify(use('Read', { file_path: '/a' })))), { steps: [['read', '/a']], results: 0, result: null, costUsd: null });
});

test('prints a digest for each case directory', async t => {
  const root = await mkdtemp(join(tmpdir(), 'neon-run-digest-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'c1'));
  await writeFile(join(root, 'c1', 'run.jsonl'), run);
  const printed = spawnSync(process.execPath, [script, join(root, 'c1')], { encoding: 'utf8' });
  assert.equal(printed.status, 0, printed.stderr);
  assert.equal(printed.stdout, [
    'c1  $2.73  2 results',
    '  skill  neon:neon-create',
    '  bash   ls app',
    '         npm run build',
    '  read   /plugin/skills/neon-create/SKILL.md',
    '  write  /app/DESIGN.md',
    '  edit   /app/src/App.tsx',
    '  bash   npm run dev',
    '  result',
    '    Restarted the dev server.',
    '    It is back up.',
    '',
  ].join('\n'));
  assert.equal(spawnSync(process.execPath, [script], { encoding: 'utf8' }).status, 2);
});
