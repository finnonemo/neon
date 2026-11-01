import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { section } from './markdown-section.mjs';

// Static guards for the functional screen habits table and the narrow-screen table
// pattern (#54; README "Functional screen habits"). They check the rules are stated
// and linked, not that a run follows them.
const skills = new URL('../../skills/', import.meta.url).pathname;
const read = path => readFile(join(skills, path), 'utf8');
const tableRows = text =>
  text.split('\n').filter(line => line.startsWith('|')).slice(2).map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));

test('review checks place the habits table right after brand consistency', async () => {
  const source = await read('neon-review/references/review-checks.md');
  const headings = [...source.matchAll(/^## (.+)$/gm)].map(match => match[1]);
  const at = headings.indexOf('Brand consistency');
  assert.deepEqual(headings.slice(at, at + 3), ['Brand consistency', 'Functional screen habits', 'Responsive behavior']);
});

test('the habits table names each habit the ticket lists, with a CDS or composition alternative', async () => {
  const rows = tableRows(section(await read('neon-review/references/review-checks.md'), 'Functional screen habits'));
  assert.ok(rows.length >= 6 && rows.length <= 9, `about eight rows, got ${rows.length}`);
  const habits = rows.map(([habit]) => habit).join('\n');
  for (const habit of [/icon/i, /chart/i, /zebra/i, /uppercase/i, /chip/i, /pagination/i, /emoji/i]) assert.match(habits, habit);
  for (const [habit, alternative] of rows) {
    // Each alternative is a CDS component, prop or composition choice, never a stylesheet edit.
    assert.match(alternative ?? '', /`[A-Za-z]+|[Cc]omposition/, `${habit}: names a CDS component, prop or composition`);
  }
});

test('no habit row is a CSS override or a navy or indigo tell', async () => {
  const habits = section(await read('neon-review/references/review-checks.md'), 'Functional screen habits');
  const table = tableRows(habits).flat().join('\n');
  assert.doesNotMatch(table, /className|style=|!important|text-transform|letter-spacing:|nth-child|background(?:-color)?:|\.css\b/);
  // Navy is Neon's structural foundation and indigo its interaction highlight (INSTRUCTION.md).
  assert.doesNotMatch(table, /navy|indigo|violet|purple|sidebar|\bdark\b/i);
  assert.match(habits, /[Nn]avy.*indigo.*not habits/);
  assert.match(habits, /[Rr]eview-only.*edits nothing/);
});

test('the Look and fix critique links the habits table', async () => {
  const loop = section(await read('neon-redesign/references/verification.md'), 'Look and fix');
  assert.doesNotMatch(loop, /<!--/);
  const critique = loop.match(/^2\. \*\*Critique\*\*[\s\S]*?(?=^3\. )/m)?.[0] ?? '';
  assert.ok(critique.includes('](../../neon-review/references/review-checks.md#functional-screen-habits)'));
});

test('responsive task access turns a narrow comparison table into two-line rows without dropping fields', async () => {
  const access = section(await read('neon-create/references/new-ui-workflow.md'), 'Responsive task access');
  const narrow = section(access, 'Tables on narrow screens', '###');
  assert.match(narrow, /640px/);
  assert.match(narrow, /two-line rows/);
  assert.match(narrow, /identity and (?:its )?key figure/);
  assert.match(narrow, /[Ff]ields move to line 2.*never dropped/);
  // Without column headers each moved field needs its label; ListCell truncates description unless multiline.
  assert.match(narrow, /label/);
  assert.match(narrow, /`multiline`/);
  assert.match(narrow, /[Ff]ilters fold into one control row or a sheet/);
  assert.match(narrow, /375px/);
});

test('neon-create reads the new UI workflow for a comparison table', async () => {
  const skill = await read('neon-create/SKILL.md');
  const line = skill.split('\n').find(text => text.includes('(references/new-ui-workflow.md)')) ?? '';
  assert.match(line, /comparison table/);
});
