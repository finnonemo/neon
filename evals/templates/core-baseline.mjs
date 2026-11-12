// The Core baseline: what the Core snapshot gives a measured element, in the
// shape measure.mjs measures it. A target names its item and its cell of the
// item's Counterpart (core: { item, cell }); the item's property table
// (core/<item>.mjs) names the Core binding each measured property reads.
//
// To add an item: write core/<item>.mjs, list it in tables below, and give
// the item's targets in measure.mjs or expansion/<item>.mjs a core cell. A
// property the table leaves out stays on the CDS baseline.
import { fileURLToPath } from 'node:url';
import { coreValue, readCoreItem } from '../../scripts/lib/core-cell.mjs';
import button from './core/button.mjs';

const tables = { button };
const root = fileURLToPath(new URL('../..', import.meta.url));
const items = new Map();
const coreItem = (item) => items.get(item) ?? items.set(item, readCoreItem(root, item)).get(item);

/** One table entry as measure.mjs would measure it: a number, a color, a font's size and line height, or a literal. */
function measuredValue(core, table, cell, mode, entry, name) {
  if ('literal' in entry) return entry.literal;
  const bound = coreValue(core, table.set, cell, entry.layer, entry.property);
  if (!bound) {
    if ('unbound' in entry) return entry.unbound;
    throw new Error(`Core's ${table.set} binds no ${entry.layer} ${entry.property} for ${name} in this cell, and the property table gives no value for that.`);
  }
  if (bound.kind === 'color') return bound[mode];
  // A text style gives a size and a line height; the weight is the table's, where it states one.
  if (bound.kind === 'textStyle') return { size: bound.size, lineHeight: bound.lineHeight, ...('weight' in entry && { weight: entry.weight }) };
  return bound.value;
}

/**
 * The measured properties Core gives one cell of an item's Counterpart, in `mode` (light or dark):
 * every property the item's table lists, such as { h, pad, radius, bg, color, font, opacity }, or
 * only `names`. A state can leave a property unbound (Loading binds no height), so a target asks
 * for what it checks.
 */
export async function coreBaseline({ item, cell }, mode, names) {
  const table = tables[item];
  if (!table) throw new Error(`${item} has no property table in evals/templates/core/; it is still measured against the CDS baseline.`);
  const core = await coreItem(item);
  const read = (name) => {
    const entry = table.properties[name];
    const value = Array.isArray(entry) ? entry.map((part) => measuredValue(core, table, cell, mode, part, name)) : measuredValue(core, table, cell, mode, entry, name);
    return entry.atMostHalf ? Math.min(value, read(entry.atMostHalf) / 2) : value;
  };
  return Object.fromEntries((names ?? Object.keys(table.properties)).map((name) => [name, read(name)]));
}

/** The properties an item's table lists. */
const listed = (item) => Object.keys(tables[item]?.properties ?? {});

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
    const table = listed(target.core.item).filter((key) => !target.coreProperties || target.coreProperties.includes(key));
    if (!cds) {
      const unlisted = target.check.filter((key) => !table.includes(key));
      if (unlisted.length) throw new Error(`${name} checks ${unlisted.join(', ')}, which the CDS baseline does not hold for it and ${target.core.item}'s property table does not list.`);
      elements[name] = await coreBaseline(target.core, mode, target.check);
      continue;
    }
    const core = await coreBaseline(target.core, mode, Object.keys(cds).filter((key) => table.includes(key)));
    elements[name] = Object.fromEntries(Object.entries(cds).map(([key, value]) => {
      if (!(key in core)) return [key, value];
      return [key, key === 'font' ? { ...value, ...core.font } : core[key]];
    }));
  }
  return { ...expected, elements };
}
