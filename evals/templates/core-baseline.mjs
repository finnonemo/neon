// The Core baseline: what the Core snapshot gives a measured element, in the
// shape measure.mjs measures it. A target names its item and its cell of the
// item's Counterpart (core: { item, cell }); the item's property table
// (core/<counterpart>.mjs) names the Core binding each measured property reads.
// An item measured as several elements (a field and its text, a track and its
// thumb) has a table of parts, and its targets name theirs (core: { item, part, cell }).
//
// A Counterpart the snapshot holds as a doc alone has no cells: its table says so (doc: true) and
// names the Theme token, Scale step or text style the doc gives each part ({ doc: 'Layer/layer-01' }),
// or states the doc's raw number ({ literal: 300 }).
//
// A Counterpart built from other Core components (Date picker's fields are Date field's) names
// their docs (nested: ['date-field']): their sets are read beside its own, and a part names its set.
//
// To add an item: write core/<counterpart>.mjs, list it in tables below, and give
// the item's targets in measure.mjs or expansion/<item>.mjs a core cell. A
// property the table leaves out stays on the CDS baseline.
import { fileURLToPath } from 'node:url';
import { coreValue, docValue, readCoreDoc, readCoreItem } from '../../scripts/lib/core-cell.mjs';
import { NO_PAINT } from './core/entries.mjs';
import button from './core/button.mjs';
import textField from './core/text-field.mjs';
import textArea from './core/text-area.mjs';
import select from './core/select.mjs';
import checkbox from './core/checkbox.mjs';
import radio from './core/radio.mjs';
import toggle from './core/toggle.mjs';
import segmentedControl from './core/segmented-control.mjs';
import selectionTag from './core/selection-tag.mjs';
import divider from './core/divider.mjs';
import progressBar from './core/progress-bar.mjs';
import progressCircle from './core/progress-circle.mjs';
import displayTag from './core/display-tag.mjs';
import avatar from './core/avatar.mjs';
import listItem from './core/list-item.mjs';
import table from './core/table.mjs';
import tabs from './core/tabs.mjs';
import accordion from './core/accordion.mjs';
import pagination from './core/pagination.mjs';
import tooltip from './core/tooltip.mjs';
import snackbar from './core/snackbar.mjs';
import banner from './core/banner.mjs';
import alert from './core/alert.mjs';
import sheet from './core/sheet.mjs';
import popover from './core/popover.mjs';
import menu from './core/menu.mjs';
import dateAndTime from './core/date-and-time.mjs';
import datePicker from './core/date-picker.mjs';

// By registry item. Input, label, field and input-group are the parts of one Counterpart, Text field.
const tables = {
  button,
  input: textField,
  label: textField,
  field: textField,
  'input-group': textField,
  textarea: textArea,
  select,
  checkbox,
  'radio-group': radio,
  switch: toggle,
  'segmented-control': segmentedControl,
  'toggle-group': selectionTag,
  separator: divider,
  progress: progressBar,
  spinner: progressCircle,
  tag: displayTag,
  avatar,
  'list-row': listItem,
  table,
  tabs,
  accordion,
  pagination,
  tooltip,
  sonner: snackbar,
  alert: banner,
  'alert-dialog': alert,
  dialog: alert,
  sheet,
  popover,
  'dropdown-menu': menu,
  calendar: dateAndTime,
  'date-picker': datePicker,
};
// The snapshot writes a literal as text ("2", "0.5"); a measured number is a number.
const asNumber = (value) => (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value)) ? Number(value) : value);
const root = fileURLToPath(new URL('../..', import.meta.url));
const items = new Map();
const coreItem = (item) => items.get(item) ?? items.set(item, tables[item].doc ? readCoreDoc(root, item) : readCoreItem(root, item, { nested: tables[item].nested })).get(item);

/**
 * One table entry as measure.mjs would measure it: a number, a color, a font's size and line height,
 * a border's width and color (`strokeOf` names the layer whose stroke it is), a literal, or what a
 * name in the Counterpart's doc stands for (`doc`). An entry reads the cell of its table's set unless it
 * names its own set and where in it (`set`, `at`): a part can be drawn by a nested component.
 */
function measuredValue(core, table, cell, mode, entry, name) {
  if ('literal' in entry) return entry.literal;
  // A name the Counterpart's doc gives the part; a color with a strokeWidth is a border.
  if ('doc' in entry) {
    const named = docValue(core, entry.doc);
    if (named.kind === 'color') return 'strokeWidth' in entry ? { width: entry.strokeWidth, color: named[mode] } : named[mode];
    return named.kind === 'textStyle' ? { size: named.size, lineHeight: named.lineHeight } : named.value;
  }
  // A text style Core's doc names for a layer the snapshot binds none to.
  if ('textStyle' in entry) {
    const style = core.textStyles[entry.textStyle];
    if (!style) throw new Error(`${name} names the text style ${entry.textStyle}, which the Core snapshot does not have.`);
    return { size: style.size, lineHeight: style.lineHeight, ...('weight' in entry && { weight: entry.weight }) };
  }
  const set = entry.set ?? table.set;
  const at = entry.at ?? cell;
  // A stroke is drawn where the cell binds a paint to it; its weight alone draws nothing.
  if ('strokeOf' in entry) {
    const paint = coreValue(core, set, at, entry.strokeOf, 'strokes.0');
    const width = asNumber(coreValue(core, set, at, entry.strokeOf, 'strokeWeight')?.value);
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
  return asNumber(bound.value);
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
const listed = (cellRef) => Object.keys(tables[cellRef.item] ? tableOf(cellRef).properties : {});

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
