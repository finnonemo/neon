#!/usr/bin/env node
// Prints what the Core snapshot gives a registry item's Counterpart, before writing or changing the
// item's property table (evals/templates/README.md):
//   node scripts/core-cell.mjs checkbox
//     the Counterpart's sets with their axes and values, and the parts of the item's property table
//   node scripts/core-cell.mjs checkbox Type=Inset Alignment=Left State=Disabled Selection=Checked
//     what the property table gives each part in that cell, in light and in dark (--part <part> for one)
//   node scripts/core-cell.mjs checkbox Type=Inset Alignment=Left State=Disabled Selection=Checked --layers
//     every layer and property Core binds in that cell, resolved; needs no property table
// A cell names every axis of its set; quote a value with a space ('Type=Icon only'). --set <set> names
// the set where a Counterpart has several with the same axes. A Counterpart the snapshot holds as a doc
// alone has no cells: its table is printed as it is.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { coreBaseline, coreTable } from '../evals/templates/core-baseline.mjs';
import { coreValue, readCoreItem } from './lib/core-cell.mjs';
import { layerLines, parseCell, setFor, setLines, tableLines } from './lib/core-cell-report.mjs';
import { SNAPSHOT_DIR } from './lib/core-snapshot.mjs';

const USAGE = 'Usage: node scripts/core-cell.mjs <item> [Axis=Value]... [--part <part>] [--layers] [--set <set>]';
const fail = (message, code = 1) => {
  console.error(message);
  process.exit(code);
};

let values;
let positionals;
try {
  ({ values, positionals } = parseArgs({ allowPositionals: true, options: { part: { type: 'string' }, layers: { type: 'boolean', default: false }, set: { type: 'string' } } }));
} catch (error) {
  fail(`${error.message}\n${USAGE}`, 2);
}
const [item, ...words] = positionals;
if (!item) fail(USAGE, 2);

const root = fileURLToPath(new URL('..', import.meta.url));
const entry = JSON.parse(await readFile(new URL(`../${SNAPSHOT_DIR}/index.json`, import.meta.url), 'utf8'))[item];
if (!entry) fail(`${item} is not in the Counterpart table (registry/core-counterparts.json).`);
if (!entry.counterpart) fail(`${item} has no Counterpart${entry.why ? `: ${entry.why}` : '.'}`);

const table = coreTable(item);
const parts = table?.parts.filter(({ part }) => !values.part || part === values.part) ?? [];
const printTable = async (cell) => console.log((await tableLines(parts, async (part, mode, name) => (await coreBaseline({ item, part, cell }, mode, [name]))[name])).join('\n'));

try {
  if (table && values.part && !parts.length) throw new Error(`${item}'s property table has no part ${values.part}: it has ${table.parts.map(({ part }) => part).filter(Boolean).join(', ') || 'no parts'}.`);
  if (!entry.values) {
    console.log(`${item} → Core's ${entry.counterpart}, a doc alone (${SNAPSHOT_DIR}/${entry.doc}): it has no cells.`);
    if (!table) console.log('No property table in evals/templates/core/: the item is measured against the CDS baseline.');
    else await printTable(undefined);
    process.exit(0);
  }
  const core = await readCoreItem(root, item);
  const cell = parseCell(words);
  if (!words.length && core.sets.some((set) => set.axes.length)) {
    console.log(`${item} → Core's ${core.counterpart} (${SNAPSHOT_DIR}/${entry.values})\n`);
    console.log(setLines(core).join('\n'));
    console.log(table ? `\nProperty table: ${table.parts.map(({ part, properties }) => `${part ?? 'one part'} (${properties.join(', ')})`).join('; ')}` : '\nNo property table in evals/templates/core/: the item is measured against the CDS baseline.');
    process.exit(0);
  }
  if (values.layers) {
    const set = setFor(core, cell, values.set);
    console.log(`Core's ${set.name} at ${words.join(', ') || 'its one cell'}\n`);
    console.log(layerLines(core, set, cell).join('\n'));
  } else {
    if (!table) throw new Error(`${item} has no property table in evals/templates/core/: print Core's bindings with --layers.`);
    if (values.set) throw new Error('--set goes with --layers: a property table names its own set.');
    // A cell its set does not have is refused once, here, and not on every property's line.
    for (const set of new Set(parts.map((part) => part.set))) coreValue(core, set, cell, '', '');
    console.log(`${item}'s property table at ${words.join(', ') || 'its one cell'}\n`);
    await printTable(cell);
  }
} catch (error) {
  fail(error.message);
}
