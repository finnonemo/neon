// The Core baseline: what the Core snapshot gives a measured element, in the
// shape measure.mjs measures it. A target names its item and its cell of the
// item's Counterpart (core: { item, cell }); the item's property table
// (core/<counterpart>.mjs) names the Core binding each measured property reads.
// An item measured as several elements (a field and its text, a track and its
// thumb) has a table of parts, and its targets name theirs (core: { item, part, cell }).
//
// To add an item: write core/<counterpart>.mjs, list it in tables below, and give
// the item's targets in measure.mjs or expansion/<item>.mjs a core cell. A
// property the table leaves out stays on the CDS baseline.
import { fileURLToPath } from 'node:url';
import { coreValue, readCoreItem } from '../../scripts/lib/core-cell.mjs';
import button from './core/button.mjs';
import textField from './core/text-field.mjs';
import textArea from './core/text-area.mjs';
import select from './core/select.mjs';
import radio from './core/radio.mjs';
import toggle from './core/toggle.mjs';
import segmentedControl from './core/segmented-control.mjs';
import selectionTag from './core/selection-tag.mjs';

// By registry item. Input, label, field and input-group are the parts of one Counterpart, Text field.
const tables = {
  button,
  input: textField,
  label: textField,
  field: textField,
  'input-group': textField,
  textarea: textArea,
  select,
  'radio-group': radio,
  switch: toggle,
  'segmented-control': segmentedControl,
  'toggle-group': selectionTag,
};
const NO_PAINT = 'rgba(0, 0, 0, 0)';
// The snapshot writes a literal as text ("2", "0.5"); a measured number is a number.
const literal = (value) => (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value)) ? Number(value) : value);
const root = fileURLToPath(new URL('../..', import.meta.url));
const items = new Map();
const coreItem = (item) => items.get(item) ?? items.set(item, readCoreItem(root, item)).get(item);

/**
 * One table entry as measure.mjs would measure it: a number, a color, a font's size and line height,
 * a border's width and color, or a literal. An entry reads the cell of its table's set unless it
 * names its own set and where in it (`set`, `at`): a part can be drawn by a nested component.
 */
function measuredValue(core, table, cell, mode, entry, name) {
  if ('literal' in entry) return entry.literal;
  // A text style Core's doc names for a layer the snapshot binds none to.
  if ('textStyle' in entry) {
    const style = core.textStyles[entry.textStyle];
    if (!style) throw new Error(`${name} names the text style ${entry.textStyle}, which the Core snapshot does not have.`);
    return { size: style.size, lineHeight: style.lineHeight, ...('weight' in entry && { weight: entry.weight }) };
  }
  const set = entry.set ?? table.set;
  const at = entry.at ?? cell;
  // A stroke is drawn where the cell binds a paint to it; its weight alone draws nothing.
  if ('paint' in entry) {
    const paint = coreValue(core, set, at, entry.layer, entry.paint);
    const weight = coreValue(core, set, at, entry.layer, entry.weight);
    const width = literal(weight?.value);
    return paint && width > 0 ? { width, color: paint[mode] } : { width: 0, color: NO_PAINT };
  }
  const bound = coreValue(core, set, at, entry.layer, entry.property);
  if (!bound) {
    if ('unbound' in entry) return entry.unbound;
    throw new Error(`Core's ${set} binds no ${entry.layer} ${entry.property} for ${name} in this cell, and the property table gives no value for that.`);
  }
  if (bound.kind === 'color') return bound[mode];
  // A text style gives a size and a line height; the weight is the table's, where it states one.
  if (bound.kind === 'textStyle') return { size: bound.size, lineHeight: bound.lineHeight, ...('weight' in entry && { weight: entry.weight }) };
  return literal(bound.value);
}

/** The table a target reads: the item's, or the part of it the target names. */
function tableOf({ item, part }) {
  const table = tables[item];
  if (!table) throw new Error(`${item} has no property table in evals/templates/core/; it is still measured against the CDS baseline.`);
  if (!table.parts) {
    if (part) throw new Error(`${item}'s property table has no parts, so a target cannot name ${part}.`);
    return table;
  }
  const names = Object.keys(table.parts).join(', ');
  if (!part) throw new Error(`${item}'s property table has parts: name one of ${names}.`);
  if (!table.parts[part]) throw new Error(`${item}'s property table has no part ${part}: it has ${names}.`);
  return table.parts[part];
}

/**
 * The measured properties Core gives one cell of an item's Counterpart, in `mode` (light or dark):
 * every property the item's table (or the named part of it) lists, such as
 * { h, pad, radius, bg, border, color, font, opacity }, or only `names`. A state can leave a
 * property unbound (Loading binds no height), so a target asks for what it checks.
 */
export async function coreBaseline({ item, part, cell }, mode, names) {
  const table = tableOf({ item, part });
  const core = await coreItem(item);
  const read = (name) => {
    const entry = table.properties[name];
    if (!entry) throw new Error(`${item}'s property table${part ? ` lists no ${name} for ${part}` : ` lists no ${name}`}.`);
    const value = Array.isArray(entry) ? entry.map((side) => measuredValue(core, table, cell, mode, side, name)) : measuredValue(core, table, cell, mode, entry, name);
    return entry.atMostHalf ? Math.min(value, read(entry.atMostHalf) / 2) : value;
  };
  return Object.fromEntries((names ?? Object.keys(table.properties)).map((name) => [name, read(name)]));
}

/** The properties a target's table lists. */
const listed = (core) => Object.keys(tables[core.item] ? tableOf(core).properties : {});

/**
 * A CDS baseline case with Core's values in place for every target that names a Core cell: each
 * property the target checks and its item's table lists. A font keeps the parts Core does not give.
 * Targets without a cell, gaps and unlisted properties keep the CDS baseline.
 *
 * A target of an item not yet retuned that renders a retuned one (alert-dialog's actions are Buttons)
 * names the properties it takes from Core in coreProperties; the rest keeps the CDS baseline.
 *
 * A value Core has and CDS lacks (a new size, a new Type) has no CDS element: such a target is held
 * to Core alone, so every property it checks must be in the item's table.
 */
export async function withCoreBaseline(expected, targets, mode) {
  const elements = { ...expected.elements };
  for (const [name, target] of Object.entries(targets)) {
    const cds = elements[name];
    if (!target.core || cds === null) continue;
    const fromCore = listed(target.core).filter((key) => !target.coreProperties || target.coreProperties.includes(key));
    if (!cds) {
      const unlisted = target.check.filter((key) => !fromCore.includes(key));
      if (unlisted.length) throw new Error(`${name} checks ${unlisted.join(', ')}, which the CDS baseline does not hold for it and ${target.core.item}'s property table does not list.`);
      elements[name] = await coreBaseline(target.core, mode, target.check);
      continue;
    }
    const values = await coreBaseline(target.core, mode, Object.keys(cds).filter((key) => fromCore.includes(key)));
    elements[name] = Object.fromEntries(Object.entries(cds).map(([key, value]) => {
      if (!(key in values)) return [key, value];
      return [key, key === 'font' ? { ...value, ...values.font } : values[key]];
    }));
  }
  return { ...expected, elements };
}
