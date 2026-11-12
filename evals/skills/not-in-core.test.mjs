// Prop values with no Core cell (ADR 0009): they keep working, the Counterpart table marks them as
// not in Core for the Catalog, and the skills do not choose them for new work.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const read = path => readFile(`${root}${path}`, 'utf8');

/** The values a cva prop takes in a registry item's source: the keys of its `<prop>: { … }` group. */
function propValues(source, prop) {
  const group = source.match(new RegExp(`\\n {6}${prop}: \\{\\n([\\s\\S]*?)\\n {6}\\}`));
  assert.ok(group, `no ${prop} group`);
  return [...group[1].matchAll(/^ {8}"?([\w-]+)"?:/gm)].map(([, name]) => name);
}

test('the Counterpart table marks button\'s outline as not in Core', async () => {
  const table = JSON.parse(await read('registry/core-counterparts.json'));
  assert.deepEqual(table.button.notInCore, { variant: ['outline'] });
});

test('every value marked as not in Core is a value its item still has', async () => {
  const table = JSON.parse(await read('registry/core-counterparts.json'));
  for (const [item, { notInCore }] of Object.entries(table)) {
    if (!notInCore) continue;
    const source = await read(`registry/ui/${item}.tsx`);
    for (const [prop, values] of Object.entries(notInCore)) {
      const has = propValues(source, prop);
      for (const value of values) assert.ok(has.includes(value), `${item} has no ${prop} "${value}": it has ${has.join(', ')}`);
    }
  }
});

test('the skill names every Button variant and size, and keeps the one not in Core out of new work', async () => {
  const source = await read('registry/ui/button.tsx');
  const guidance = (await read('skills/neon-create/references/neon-base.md')).split('\n').find(line => line.startsWith('- **Components:**'));
  for (const value of [...propValues(source, 'variant'), ...propValues(source, 'size')]) assert.ok(guidance.includes(`\`${value}\``), `the Components guidance does not name ${value}`);
  assert.match(guidance, /`loading`/);
  assert.match(guidance, /`outline`[^.]*not in Core[^.]*never[^.]*new/);
});
