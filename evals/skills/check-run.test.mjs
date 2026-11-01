import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRun } from './check-run.mjs';

const use = (id, command) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name: 'Bash', input: { command } }] } });
const deny = id => ({ type: 'system', subtype: 'permission_denied', tool_name: 'Bash', tool_use_id: id });
const say = text => ({ type: 'assistant', message: { content: [{ type: 'text', text }] } });
const run = (...events) => events.map(event => JSON.stringify(event)).join('\n');

test('voids a run that reports the shell blocked after a denial, naming the command', () => {
  const result = checkRun(run(use('a', 'git status; ls'), deny('a'), say('Shell commands were blocked, so the build was not run.')));
  assert.equal(result.void, true);
  assert.deepEqual(result.denied, [{ tool: 'Bash', command: 'git status; ls' }]);
  assert.match(result.blockedClaim, /blocked/);
});

test('keeps a run whose denial did not stop it using the shell', () => {
  const result = checkRun(run(use('a', 'cd x && grep y z'), deny('a'), say('Build passed; Browser probe: 375px clean; 1440px clean.')));
  assert.equal(result.void, false);
  assert.equal(result.denied.length, 1);
});

test('ignores a blocked-shell remark made before any denial', () => {
  assert.equal(checkRun(run(say('If Bash is blocked I will use Read.'), use('a', 'ls'))).void, false);
});

test('reads a run cut off mid-line at its cap', () => {
  const result = checkRun(`${run(use('a', 'B=src; ls $B'), deny('a'))}\n{"type":"assi`);
  assert.deepEqual(result.denied, [{ tool: 'Bash', command: 'B=src; ls $B' }]);
});
