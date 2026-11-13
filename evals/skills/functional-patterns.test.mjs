import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Static guards for the functional patterns reference (records/functional-patterns.md).
// They check the rules are stated and reachable, not that a run follows them.
const skills = new URL('../../skills/', import.meta.url).pathname;
const read = path => readFile(`${skills}${path}`, 'utf8');

test('each skill links the functional patterns reference behind one condition', async () => {
  const create = (await read('neon-create/SKILL.md')).split('\n').filter(line => line.includes('functional-patterns.md'));
  assert.equal(create.length, 1);
  assert.match(create[0], /functional screen/);
  const redesign = (await read('neon-redesign/SKILL.md')).split('\n').filter(line => line.includes('functional-patterns.md'));
  assert.equal(redesign.length, 1);
  assert.match(redesign[0], /composition: 'adapt'/);
  assert.match(redesign[0], /do not adopt CDS/);
});

test('the contract states the short rules and their scope', async () => {
  const source = await read('INSTRUCTION.md');
  // Action hierarchy is Core's (core-rules.test.mjs): the contract links it and keeps the screen-level rules.
  assert.match(source, /which action is primary, secondary or tertiary.*are Core's \[hierarchy rules\]\(\.\.\/core\/hierarchy\.md\)/);
  assert.match(source, /Prefer list rows to cards/);
  assert.match(source, /Shadows mark only layers that float/);
  assert.match(source, /preserve and colors-only work keep existing structure/);
  assert.match(source, /without overlapping a tab bar/);
});

test('the reference keeps its scope, action and motion rules', async () => {
  const source = await read('neon-audit/references/functional-patterns.md');
  assert.match(source, /does not license restructuring/);
  assert.match(source, /do not authorize adopting a component library in a CSS-only restyle/);
  // New work is on the Neon base (ADR 0006): CDS names live only in the CDS reference (#220).
  assert.doesNotMatch(source, /ListCell|Tray|Fallback|useBreakpointTier/);
  assert.match(source, /An app already on CDS finds the same patterns in CDS names in \[CDS integration\]\(\.\.\/\.\.\/neon-create\/references\/cds-integration\.md#functional-patterns\)/);
  const cdsPatterns = (await read('neon-create/references/cds-integration.md')).split('## Functional patterns')[1];
  assert.match(cdsPatterns ?? '', /ListCell[\s\S]*useBreakpointTier/);
  assert.match(source, /Row actions are secondary or tertiary/);
  // The starter's BottomNav is fixed to the bottom at tier sm; a dock must not sit under it.
  assert.match(source, /the dock sits above it, or the flow hides the tab bar/);
  assert.match(source, /no divider after the last row/);
  assert.match(source, /No animation loops longer than 5 seconds/);
  // A source-brand name would turn the rules into a bundled reference design (ADR 0001).
  assert.doesNotMatch(source, /Coinbase|Uber|Base app/);
});

test('the first-screen rule keeps the row action secondary', async () => {
  const source = await read('neon-create/references/new-ui-workflow.md');
  assert.match(source, /On a row it is a secondary or tertiary action/);
  assert.match(source, /a pair below 4\.5:1 \(3:1 for large text\) is a mapping mismatch to report, not to recolor/);
});
