import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Static guards for neon-create reference rules that came from rebuild samples
// (records/cds-rebuild.md). They check the rule is stated, not that a run follows it.
const references = new URL('../../skills/neon-create/references/', import.meta.url).pathname;

test('the rebuild inventory records responsive rules and carries them over', async () => {
  const source = await readFile(`${references}rebuild.md`, 'utf8');
  const inventory = source.match(/3\. \*\*Write the parity inventory\*\*.*$/m)?.[0] ?? '';
  // Health-check samples kept an add-column zone the source hides at 375px.
  assert.match(inventory, /responsive rules/);
  assert.match(inventory, /hides, resizes or rearranges at a breakpoint/);
  assert.match(source, /[Cc]arry each responsive rule into the rebuild/);
  // A copied scroll-to-end effect loaded the column container scrolled sideways.
  assert.match(source, /effects? that (?:depends?|reads?) (?:on )?layout/);
});

test('CDS integration warns that Box lays children out in a flex row', async () => {
  const source = await readFile(`${references}cds-integration.md`, 'utf8');
  // bs-s1's <Box as="section"> laid its fund cards side by side, 1882px wide at 375px.
  assert.match(source, /`Box` computes to `display: flex` in a row/);
  assert.match(source, /flexDirection="column"/);
  assert.match(source, /`VStack`/);
});

test('the rebuild reference carries the Box flex-row rule', async () => {
  const source = await readFile(`${references}rebuild.md`, 'utf8');
  const build = source.match(/## Build\n([\s\S]*?)\n## /)?.[1] ?? '';
  // bs-s1's <Box as="section"> panels overflowed; state the rule where rebuilds lay out panels.
  assert.match(build, /`Box` is a flex row/);
  assert.match(build, /flexDirection="column"/);
  assert.match(build, /`VStack`/);
});

test('neon-create links the Campaign Page content reference behind one condition', async () => {
  const skill = await readFile(new URL('../../skills/neon-create/SKILL.md', import.meta.url), 'utf8');
  const lines = skill.split('\n').filter(line => line.includes('references/campaign-content.md'));
  assert.equal(lines.length, 1);
  assert.match(lines[0], /new or rebuilt Campaign Page/);
});

test('the Campaign Page content reference keeps its four rules', async () => {
  const source = await readFile(`${references}campaign-content.md`, 'utf8');
  // records/campaign-page-content.md: claims first, first screen, rendered headline lines, no invented proof.
  assert.match(source, /claim list.*Done report/);
  assert.match(source, /map the claims onto its section order/);
  assert.match(source, /date and place appear there/);
  assert.match(source, /rendered line count at 375px and 1440px/);
  assert.match(source, /report the headline check as unverified/);
  assert.match(source, /Never invent testimonials/);
  assert.match(source, /pre-launch to-do/);
  assert.match(source, /Brand Intensity and the Brand Floor are unchanged/);
});
