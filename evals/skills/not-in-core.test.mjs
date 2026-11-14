// Prop values with no Core cell (ADR 0009): they keep working, the Counterpart table lists them as
// not in Core, for the Catalog site to mark, and the skills do not choose them for new work.
// The same holds for the props an item hands on to a library that draws from them: the table names
// the library (`notInCorePassThrough`) in place of a list.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { registryComponents } from '../../scripts/lib/registry.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const read = path => readFile(`${root}${path}`, 'utf8');

/** The values a cva prop takes in a registry item's source: the keys of its `<prop>: { … }` group. */
function propValues(source, prop) {
  const group = source.match(new RegExp(`\\n {6}${prop}: \\{\\n([\\s\\S]*?)\\n {6}\\}`));
  assert.ok(group, `no ${prop} group`);
  return [...group[1].matchAll(/^ {8}"?([\w-]+)"?:/gm)].map(([, name]) => name);
}

/**
 * The values any prop takes: a cva group's keys, or the members of the type the item's source
 * gives the prop (`size?: "xs" | "sm" | number`, or a type it declares by name), or the values of a Radix prop the item reads
 * back in a `data-[<prop>=<value>]` class.
 */
function valuesOf(source, prop) {
  if (new RegExp(`\\n {6}${prop}: \\{\\n`).test(source)) return propValues(source, prop);
  const union = source.match(new RegExp(`\\b${prop}\\?: ([^\\n;}]+)`));
  // A prop typed by a name the source declares (`side?: Side`) takes that type's members.
  const members = union && (source.match(new RegExp(`\\ntype ${union[1].trim()} = ([^\\n]+)`))?.[1] ?? union[1]);
  if (members) return members.split('|').map(member => member.trim().replace(/^"|"$/g, ''));
  return [...new Set([...source.matchAll(new RegExp(`data-\\[${prop}=([\\w-]+)\\]`, 'g'))].map(([, value]) => value))];
}

test('the Counterpart table marks button\'s outline as not in Core', async () => {
  const table = JSON.parse(await read('registry/core-counterparts.json'));
  assert.deepEqual(table.button.notInCore, { variant: ['outline'] });
});

test('the Counterpart table marks input-group\'s addons above and below the control as not in Core', async () => {
  const table = JSON.parse(await read('registry/core-counterparts.json'));
  assert.deepEqual(table['input-group'].notInCore, { align: ['block-start', 'block-end'] });
});

test('the Counterpart table marks a vertical separator and a numeric spinner size as not in Core', async () => {
  const table = JSON.parse(await read('registry/core-counterparts.json'));
  assert.deepEqual(table.separator.notInCore, { orientation: ['vertical'] });
  assert.deepEqual(table.spinner.notInCore, { size: ['number'] });
});

test('the Counterpart table marks the promotional alert as not in Core', async () => {
  const table = JSON.parse(await read('registry/core-counterparts.json'));
  assert.deepEqual(table.alert.notInCore, { variant: ['promotional'] });
});

test('the Counterpart table marks a sheet from the top, the left or the right as not in Core', async () => {
  const table = JSON.parse(await read('registry/core-counterparts.json'));
  assert.deepEqual(table.sheet.notInCore, { side: ['top', 'left', 'right'] });
});

test('every value marked as not in Core is a value its item still has', async () => {
  const table = JSON.parse(await read('registry/core-counterparts.json'));
  for (const [item, { notInCore }] of Object.entries(table)) {
    if (!notInCore) continue;
    const source = await read(`registry/ui/${item}.tsx`);
    for (const [prop, values] of Object.entries(notInCore)) {
      const has = valuesOf(source, prop);
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

test('the Counterpart table names the library the calendar and the Toaster pass their other props through to', async () => {
  const table = JSON.parse(await read('registry/core-counterparts.json'));
  assert.equal(table.calendar.notInCorePassThrough, 'react-day-picker');
  assert.equal(table.sonner.notInCorePassThrough, 'sonner');
});

test('every item marked as passing props through takes that library\'s props whole and spreads them onto its component', async () => {
  const table = JSON.parse(await read('registry/core-counterparts.json'));
  const items = new Map((await registryComponents(root)).map(item => [item.name, item]));
  for (const [item, { notInCorePassThrough: library }] of Object.entries(table)) {
    if (!library) continue;
    // The table's own rule: a dependency, named without its version, that the item's file imports.
    assert.ok(items.get(item).dependencies.includes(library), `${item} does not depend on ${library}`);
    assert.ok(items.get(item).imports.includes(library), `${item} does not import ${library}`);
    const source = await read(`registry/ui/${item}.tsx`);
    const imported = source.match(new RegExp(`^import \\{([^}]+)\\} from "${library}"`, 'm'))[1].split(',').map(name => name.trim().replace(/^type /, '').split(' as ').pop());
    // Its props are the library's own type, not a list the item names…
    const typed = imported.filter(name => new RegExp(`(\\.\\.\\.props \\}|\\(props): (React\\.ComponentProps<typeof ${name}>|${name})\\)`).test(source));
    assert.ok(typed.length, `${item} does not take ${library}'s props whole`);
    // …and what it does not name goes to the library's component.
    const element = imported.find(name => source.includes(`<${name}\n`));
    assert.ok(element, `${item} renders no component of ${library}`);
    assert.match(source.slice(source.indexOf(`<${element}\n`)), /\n {6}\{\.\.\.props\}\n {4}\/>/, `${item} does not spread its props onto ${element}`);
  }
});

test('the skill keeps the props passed through to a library out of new work, and names each library', async () => {
  const table = JSON.parse(await read('registry/core-counterparts.json'));
  const guidance = (await read('skills/neon-create/references/neon-base.md')).split('\n').find(line => line.startsWith('- **Components:**'));
  const libraries = Object.values(table).flatMap(entry => entry.notInCorePassThrough ?? []);
  assert.ok(libraries.length);
  for (const library of libraries) assert.ok(guidance.includes(library), `the Components guidance does not name ${library}`);
  assert.match(guidance, /`numberOfMonths`[^.]*`richColors`[^.]*not in Core[^.]*never[^.]*new/);
});
