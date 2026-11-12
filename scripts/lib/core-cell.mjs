// One cell of a Counterpart, read from the Core snapshot (ADR 0009): what Core binds a layer's
// property to at one value of every variant axis. The snapshot's values file lists each set's
// bindings as rules; this resolves the rule that holds for the cell to a number, a color in both
// modes, a text style or a literal.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { cssColor } from './colors.mjs';
import { SNAPSHOT_DIR } from './core-snapshot.mjs';

const MODES = ['light', 'dark'];
// One `{{Axis=Value, Value}}` group of a rule; `*` is any value and `!Value` any value but that one.
const GROUP = /\{\{([^=}]+)=([^}]*)\}\}/g;

const json = async (root, path) => JSON.parse(await readFile(join(root, SNAPSHOT_DIR, path), 'utf8'));
const conditions = when => [...when.matchAll(GROUP)].map(([, axis, values]) => ({ axis: axis.trim(), values: values.split(',').map(value => value.trim()) }));
const holds = (cell, { axis, values }) => values.some(value => value === '*' || (value.startsWith('!') ? cell[axis] !== value.slice(1) : cell[axis] === value));
const matches = (cell, when) => conditions(when).every(condition => holds(cell, condition));
// How many axes a rule narrows: `{{Size=*}}` narrows none.
const narrowed = when => conditions(when).filter(({ values }) => !values.includes('*')).length;
const named = cell => Object.entries(cell).map(([axis, value]) => `${axis}=${value}`).join(', ');

/** A registry item's Counterpart as the Core snapshot in `root` holds it: its sets, with the Theme and text styles their values name. */
export async function readCoreItem(root, item) {
  const entry = (await json(root, 'index.json'))[item];
  if (!entry?.values) throw new Error(`The Core snapshot has no values file for ${item}: ${entry ? `its Counterpart ${entry.counterpart} has a doc only` : 'the Counterpart table does not list it'}.`);
  const [values, theme, textStyles] = await Promise.all([json(root, entry.values), json(root, 'theme.json'), json(root, 'text-styles.json')]);
  return { item, counterpart: entry.counterpart, sets: values.sets, theme, textStyles };
}

function setOf(core, name) {
  const set = core.sets.find(candidate => candidate.name === name);
  if (!set) throw new Error(`Core's ${core.counterpart} has no set ${name}: it has ${core.sets.map(candidate => candidate.name).join(', ')}.`);
  return set;
}

/** Refuses a cell the set does not have: an axis left out, a value the axis lacks, or a combination Core excludes. */
function refuseUnknownCell(core, set, cell) {
  for (const axis of set.axes) {
    if (!(axis.name in cell)) throw new Error(`A cell of Core's ${set.name} names every axis; ${axis.name} is missing (${axis.values.join(', ')}).`);
    if (!axis.values.includes(cell[axis.name])) throw new Error(`Core's ${set.name} has no ${axis.name}=${cell[axis.name]}: it has ${axis.values.join(', ')}.`);
  }
  const excluded = (set.exclude ?? []).find(rule => matches(cell, rule));
  if (excluded) throw new Error(`Core's ${set.name} excludes ${excluded}, so it has no cell ${named(cell)}.`);
}

/** A rule's value for the cell: a Components variable, a Theme token, a text style or a literal. */
function resolved(core, set, cell, binding) {
  if (binding.literal) return { kind: 'literal', value: binding.value };
  const value = binding.value.replace(GROUP, (group, axis) => cell[axis.trim()]);
  if (value.startsWith('Theme/')) {
    const token = value.slice('Theme/'.length);
    const modes = core.theme[token];
    if (!modes) throw new Error(`Core's ${set.name} binds ${binding.layer} ${binding.property} to ${token}, a token the snapshot's Theme does not have.`);
    return { kind: 'color', token, ...Object.fromEntries(MODES.map(mode => [mode, cssColor(modes[mode].hex)])) };
  }
  if (value.startsWith('Components/')) {
    const variable = value.slice('Components/'.length);
    if (!(variable in set.variables)) throw new Error(`Core's ${set.name} binds ${binding.layer} ${binding.property} to ${variable}, a variable the snapshot does not have.`);
    return { kind: 'number', value: set.variables[variable] };
  }
  // A text style is named with its group (`Body/Subheadline`); the snapshot keys it without (`Subheadline`).
  const name = [value, value.slice(value.indexOf('/') + 1)].find(candidate => candidate in core.textStyles);
  if (!name) throw new Error(`Core's ${set.name} binds ${binding.layer} ${binding.property} to ${value}, which is no variable, Theme token or text style of the snapshot.`);
  return { kind: 'textStyle', name, ...core.textStyles[name] };
}

/**
 * What Core binds `property` of `layer` to in one cell of a set: `{ kind: 'number', value }`,
 * `{ kind: 'color', token, light, dark }`, `{ kind: 'textStyle', name, size, lineHeight }` or
 * `{ kind: 'literal', value }`; null when no rule binds it there. `cell` gives every axis a value
 * (`{ Hierarchy: 'Primary', Type: 'Default', Size: 'Large', State: 'Enabled' }`).
 *
 * When several rules hold, the one that narrows the most axes is the cell's: Core writes a general
 * rule (`{{State=Disabled}}`) and then its exceptions (`{{Type=Inverse}}{{State=Disabled}}`). Core
 * states no order beyond that, so two rules that narrow as many axes to different values are refused.
 */
export function coreValue(core, setName, cell, layer, property) {
  const set = setOf(core, setName);
  refuseUnknownCell(core, set, cell);
  const rules = set.bindings.filter(binding => binding.layer === layer && binding.property === property && matches(cell, binding.when));
  if (!rules.length) return null;
  const most = Math.max(...rules.map(rule => narrowed(rule.when)));
  const [first, ...rest] = rules.filter(rule => narrowed(rule.when) === most);
  const other = rest.find(rule => rule.value !== first.value);
  if (other) throw new Error(`Core's ${set.name} binds ${layer} ${property} to both ${first.value} and ${other.value} at ${named(cell)}, and neither rule is the narrower one.`);
  return resolved(core, set, cell, first);
}
