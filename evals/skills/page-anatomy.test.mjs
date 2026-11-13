import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Static guards for the page anatomy reference (records/page-anatomy.md).
// They check the rules are stated and reachable, not that a run follows them.
const skills = new URL('../../skills/', import.meta.url).pathname;
const read = path => readFile(`${skills}${path}`, 'utf8');

test('the contract and two skills link page anatomy behind one condition each', async () => {
  for (const [file, condition] of [['neon-create/SKILL.md', /whole new functional page/], ['neon-redesign/SKILL.md', /composition: 'adapt'/], ['INSTRUCTION.md', /page types and their region order/]]) {
    const lines = (await read(file)).split('\n').filter(line => line.includes('page-anatomy.md'));
    assert.equal(lines.length, 1, file);
    assert.match(lines[0], condition, file);
  }
});

test('the reference keeps its scope and stays inside the four layers (ADR 0011)', async () => {
  const source = await read('neon-audit/references/page-anatomy.md');
  assert.match(source, /not a license to restructure/);
  assert.match(source, /defaults, not templates/);
  // The skills name no reference product, and no value is copied from one.
  assert.doesNotMatch(source, /Coinbase|Uber|CDS/);
  assert.doesNotMatch(source, /\d+\s?px|\d:\d/);
  // The shell is fixed per screen: a page fills panes and never moves them.
  assert.match(source, /never where they are/);
  // Display roles stay on Campaign Pages (functional-patterns.md).
  assert.match(source, /largest type role below the display roles/);
});

test('the reference states the pane, section and narrow-tier rules', async () => {
  const source = await read('neon-audit/references/page-anatomy.md');
  assert.match(source, /Content answers; the inspector acts/);
  assert.match(source, /must not be the only way to act/);
  assert.match(source, /A section previews; the full collection is one step away/);
  assert.match(source, /The gutter is inside the section/);
  assert.match(source, /changes form, never order or content/);
  for (const type of ['Overview', 'Collection', 'Item page', 'Balance or status page', 'Activity', 'Settings']) assert.match(source, new RegExp(`\\| ${type} \\|`));
});
