// What the Core snapshot gives one cell of a Counterpart, as the lines core-cell.mjs prints.
import { coreValue } from './core-cell.mjs';

/** `Axis=Value` words as a cell: ['Type=Icon only', 'State=Focus'] → { Type: 'Icon only', State: 'Focus' }. */
export function parseCell(words) {
  return Object.fromEntries(words.map((word) => {
    const at = word.indexOf('=');
    if (at < 1 || at === word.length - 1) throw new Error(`A cell is written Axis=Value, one word per axis (quote a value with a space: 'Type=Icon only'); got ${word}.`);
    return [word.slice(0, at).trim(), word.slice(at + 1).trim()];
  }));
}

const axesOf = (set) => set.axes.map((axis) => axis.name);
const withAxes = (set) => `${set.name} (${axesOf(set).join(', ') || 'no axes'})`;

/** A Counterpart's sets: each with its axes, their values and the combinations Core excludes. */
export function setLines(core) {
  return core.sets.flatMap((set) => [
    set.name,
    ...(set.axes.length ? set.axes.map((axis) => `  ${axis.name}: ${axis.values.join(', ')}`) : ['  no axes: its one cell is written with no Axis=Value']),
    ...(set.exclude ?? []).map((rule) => `  excludes ${rule}`),
  ]);
}

/** The set a cell is read in: the one named, the Counterpart's only set, or the only one whose axes are the cell's. */
export function setFor(core, cell, name) {
  const all = core.sets.map(withAxes).join('; ');
  if (name) {
    const set = core.sets.find((candidate) => candidate.name === name);
    if (!set) throw new Error(`Core's ${core.counterpart} has no set ${name}: it has ${all}.`);
    return set;
  }
  if (core.sets.length === 1) return core.sets[0];
  const axes = Object.keys(cell).sort().join('\n');
  const fits = core.sets.filter((set) => axesOf(set).sort().join('\n') === axes);
  if (fits.length === 1) return fits[0];
  throw new Error(`${fits.length ? `${fits.map((set) => set.name).join(' and ')} have these axes` : `No set of Core's ${core.counterpart} has exactly these axes`}: name the set with --set. It has ${all}.`);
}

const shown = (value) => {
  if (value.kind === 'color') return `${value.token}  light ${value.light}  dark ${value.dark}`;
  if (value.kind === 'textStyle') return `${value.name}  ${value.size}/${value.lineHeight}`;
  return value.kind === 'literal' ? `${value.value}  (literal)` : String(value.value);
};
const padded = (rows) => {
  const width = Math.max(...rows.map(([name]) => name.length));
  return rows.map(([name, text]) => `  ${name.padEnd(width)}  ${text}`);
};

/**
 * Every layer and property Core binds in one cell of a set, resolved as coreValue resolves it: a
 * number, a Theme token with its color in both modes, a text style with its size and line height,
 * or a literal. A property no rule binds in the cell is left out; one Core's rules tie on says so.
 * Throws for a cell the set does not have.
 */
export function layerLines(core, set, cell) {
  coreValue(core, set.name, cell, '', '');
  const layers = new Map();
  const seen = new Set();
  for (const { layer, property } of set.bindings) {
    const rows = layers.get(layer) ?? layers.set(layer, new Map()).get(layer);
    if (seen.has(`${layer}\n${property}`)) continue;
    seen.add(`${layer}\n${property}`);
    let value;
    try {
      value = coreValue(core, set.name, cell, layer, property);
    } catch (error) {
      rows.set(property, `no value: ${error.message}`);
      continue;
    }
    if (value) rows.set(property, shown(value));
  }
  return [...layers].filter(([, rows]) => rows.size).flatMap(([layer, rows]) => [layer, ...padded([...rows])]);
}

const measured = (value) => (typeof value === 'string' ? value : JSON.stringify(value));

/**
 * What an item's property table gives each part: one line per property, with the light and the dark
 * value where they differ. `parts` is the table as coreTable lists it; `baseline(part, mode, name)`
 * resolves one property, and a property it refuses keeps its line with the reason.
 */
export async function tableLines(parts, baseline) {
  const lines = [];
  for (const { part, properties } of parts) {
    const rows = [];
    for (const name of properties) {
      try {
        const [light, dark] = [measured(await baseline(part, 'light', name)), measured(await baseline(part, 'dark', name))];
        rows.push([name, light === dark ? light : `light ${light}  dark ${dark}`]);
      } catch (error) {
        rows.push([name, `no value: ${error.message}`]);
      }
    }
    lines.push(...(part ? [part] : []), ...padded(rows));
  }
  return lines;
}
