import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Static guards for neon-create reference rules that came from rebuild samples
// (README "CDS rebuild"). They check the rule is stated, not that a run follows it.
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
