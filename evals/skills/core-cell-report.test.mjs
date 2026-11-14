import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { layerLines, parseCell, partsBySet, partsFor, setFor, setLines, tableLines } from '../../scripts/lib/core-cell-report.mjs';
import { coreTable } from '../templates/core-baseline.mjs';

// A small Counterpart: a Chip whose fill a Disabled rule overrides, and a nested set with the same axes.
const set = (name) => ({
  name,
  axes: [{ name: 'Size', values: ['Small', 'Large'] }, { name: 'State', values: ['Enabled', 'Disabled'] }],
  exclude: ['{{Size=Small}}{{State=Disabled}}'],
  variables: { 'Chip/Large/Layout height': 40 },
  bindings: [
    { layer: 'Container', property: 'height', when: '{{Size=Large}}', value: 'Components/Chip/Large/Layout height' },
    { layer: 'Container', property: 'fills.0', when: '{{Size=*}}', value: 'Theme/Layer/fill' },
    { layer: 'Container', property: 'fills.0', when: '{{State=Disabled}}', value: 'Theme/Layer/fill-disabled' },
    { layer: 'Container / Label', property: 'textStyleId', when: '{{Size=*}}', value: 'Body' },
    { layer: 'Container / Label', property: 'characters', when: '{{Size=*}}', value: 'Chip', literal: true },
    { layer: 'Container / Badge', property: 'width', when: '{{Size=Small}}', value: 'Components/Chip/Large/Layout height' },
  ],
});
const core = {
  item: 'chip',
  counterpart: 'Chip',
  sets: [set('Chip'), set('_Chip item')],
  theme: { 'Layer/fill': { light: { hex: '#ffffff' }, dark: { hex: '#000000' } }, 'Layer/fill-disabled': { light: { hex: '#eeeeee' }, dark: { hex: '#111111' } } },
  textStyles: { Body: { size: 17, lineHeight: 24 } },
};

test('a cell is read from Axis=Value words, and a word without both is refused', () => {
  assert.deepEqual(parseCell(['Type=Icon only', 'State=Focus']), { Type: 'Icon only', State: 'Focus' });
  assert.deepEqual(parseCell([]), {});
  assert.throws(() => parseCell(['Disabled']), /Axis=Value.*got Disabled/);
  assert.throws(() => parseCell(['State=']), /got State=/);
});

test('a Counterpart\'s sets print with their axes, values and excluded combinations', () => {
  assert.deepEqual(setLines({ ...core, sets: [core.sets[0], { name: 'Bare', axes: [], bindings: [] }] }), [
    'Chip',
    '  Size: Small, Large',
    '  State: Enabled, Disabled',
    '  excludes {{Size=Small}}{{State=Disabled}}',
    'Bare',
    '  no axes: its one cell is written with no Axis=Value',
  ]);
});

test('a cell is read in the set named, the only set, or the only set with its axes', () => {
  const cell = { Size: 'Large', State: 'Enabled' };
  assert.equal(setFor({ ...core, sets: [core.sets[0]] }, {}).name, 'Chip');
  assert.equal(setFor(core, cell, '_Chip item').name, '_Chip item');
  assert.equal(setFor({ ...core, sets: [core.sets[0], { name: 'Bare', axes: [] }] }, cell).name, 'Chip');
  assert.throws(() => setFor(core, cell), /Chip and _Chip item have these axes: name the set with --set/);
  assert.throws(() => setFor(core, { Size: 'Large' }), /No set of Core's Chip has exactly these axes/);
  assert.throws(() => setFor(core, cell, 'Chop'), /has no set Chop: it has Chip \(Size, State\)/);
});

test('a cell\'s layers print what Core binds there: the narrower rule, both modes of a token, and no unbound property', () => {
  assert.deepEqual(layerLines(core, core.sets[0], { Size: 'Large', State: 'Disabled' }), [
    'Container',
    '  height   40',
    '  fills.0  Layer/fill-disabled  light rgb(238, 238, 238)  dark rgb(17, 17, 17)',
    'Container / Label',
    '  textStyleId  Body  17/24',
    '  characters   Chip  (literal)',
  ]);
  assert.throws(() => layerLines(core, core.sets[0], { Size: 'Small', State: 'Disabled' }), /excludes/);
  assert.throws(() => layerLines(core, core.sets[0], { Size: 'Large' }), /State is missing/);
});

test('a table prints one value where the modes agree, both where they differ, and the reason where the table gives none', async () => {
  const values = { h: () => 40, bg: (mode) => (mode === 'light' ? 'rgb(1, 2, 3)' : 'rgb(4, 5, 6)'), border: () => ({ width: 0, color: 'none' }), font: () => { throw new Error('binds no text style'); } };
  const lines = await tableLines([{ part: 'box', properties: ['h', 'bg'] }, { part: 'label', properties: ['border', 'font'] }], async (part, mode, name) => values[name](mode));
  assert.deepEqual(lines, [
    'box',
    '  h   40',
    '  bg  light rgb(1, 2, 3)  dark rgb(4, 5, 6)',
    'label',
    '  border  {"width":0,"color":"none"}',
    '  font    no value: binds no text style',
  ]);
  assert.deepEqual(await tableLines([{ properties: ['h'] }], async () => 8), ['  h  8']);
});

test('an item\'s property table lists its parts with their set and properties', () => {
  assert.deepEqual(coreTable('checkbox').parts.map(({ part, set: name }) => [part, name]), [['box', 'Checkbox'], ['glyph', 'Checkbox'], ['value', 'Checkbox']]);
  assert.equal(coreTable('sheet').doc, true);
  assert.equal(coreTable('card'), null);
  assert.deepEqual(coreTable('checkbox').nested, []);
  assert.deepEqual(coreTable('date-picker').nested, ['date-field'], 'the docs of the Core components whose sets the table reads beside its own');
});

// Parts that read sets with different axes cannot share a cell: the date picker's field is Date field's.
test('a cell is read for the parts whose set has its axes, and a cell no part\'s set has is refused with what each reads', () => {
  const group = { name: 'Chip group', axes: [{ name: 'Wrap', values: ['False', 'True'] }], variables: {}, bindings: [] };
  const grouped = { ...core, sets: [core.sets[0], group] };
  const parts = [{ part: 'chip', set: 'Chip' }, { part: 'label', set: 'Chip' }, { part: 'row', set: 'Chip group' }];
  assert.deepEqual(partsFor(grouped, parts, { Size: 'Large', State: 'Enabled' }), { read: parts.slice(0, 2), left: parts.slice(2) });
  assert.deepEqual(partsFor(grouped, parts, { Wrap: 'True' }), { read: parts.slice(2), left: parts.slice(0, 2) });
  assert.equal(partsBySet(grouped, parts), 'chip, label read Chip (Size, State); row reads Chip group (Wrap)');
  assert.throws(() => partsFor(grouped, parts, { Size: 'Large' }), /No part of chip's property table reads a set with exactly these axes: chip, label read Chip \(Size, State\); row reads Chip group \(Wrap\)\. Name the axes of one set, or pick a part with --part\./);
  assert.deepEqual(partsFor(grouped, parts.slice(0, 2), { Size: 'Large' }), { read: parts.slice(0, 2), left: [] }, 'parts of one set are all read: coreValue refuses the cell');
  assert.throws(() => partsFor(grouped, [...parts, { part: 'gone', set: 'Chip row' }], { Wrap: 'True' }), /has no set Chip row/);
});

const run = (...args) => spawnSync(process.execPath, [fileURLToPath(new URL('../../scripts/core-cell.mjs', import.meta.url)), ...args], { encoding: 'utf8' });

test('core-cell.mjs prints an item\'s sets, a cell of its table and a cell\'s layers from the snapshot', () => {
  const sets = run('checkbox');
  assert.equal(sets.status, 0, sets.stderr);
  assert.match(sets.stdout, /checkbox → Core's Checkbox[\s\S]*\n  Selection: Unchecked, Checked, Indeterminate\n[\s\S]*Property table: box \(/);
  const cell = ['Type=Inset', 'Alignment=Left', 'State=Disabled', 'Selection=Checked'];
  const table = run('checkbox', ...cell, '--part', 'glyph');
  assert.equal(table.status, 0, table.stderr);
  assert.match(table.stdout, /^checkbox's property table at Type=Inset, Alignment=Left, State=Disabled, Selection=Checked\n\nglyph\n[\s\S]*\n  color +light rgba?\([^)]+\)  dark rgba?\([^)]+\)\n/);
  const layers = run('checkbox', ...cell, '--layers');
  assert.equal(layers.status, 0, layers.stderr);
  assert.match(layers.stdout, /\nContainer \/ Icon \+ Value \/ Checkbox margin \/ Box \/ Icon\n[\s\S]*\n  characters +square-check  \(literal\)\n/);
});

test('core-cell.mjs fails on a cell Core does not have, and an item with no Counterpart, and prints the table of a doc alone', () => {
  const missing = run('checkbox', 'State=Disabled');
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /names every axis; Type is missing/);
  assert.equal(missing.stdout, '');
  const card = run('card');
  assert.equal(card.status, 1);
  assert.match(card.stderr, /card has no Counterpart: /);
  const sheet = run('sheet', '--part', 'grabber');
  assert.equal(sheet.status, 0, sheet.stderr);
  assert.match(sheet.stdout, /a doc alone \(core\/components\/sheet\.md\): it has no cells\.\ngrabber\n  h +4\n/);
  assert.equal(run().status, 2);
});

// The date picker's table names Date field as nested, and its parts read two sets with different axes.
test('core-cell.mjs reads the sets a table names as nested: the date picker\'s field in Date field, its open calendar in Date picker', () => {
  const sets = run('date-picker');
  assert.equal(sets.status, 0, sets.stderr);
  assert.match(sets.stdout, /with the sets of date-field\n\nDate picker\n  Type: Single, Range\n[\s\S]*\nDate field\n  Text filled: False, True\n[\s\S]*Property table: field in Date field \([^)]+\); [\s\S]*; open in Date picker \(gap, w\)\n/);
  const field = ['Text filled=True', 'State=Enabled', 'Size=Large'];
  const inField = run('date-picker', ...field);
  assert.equal(inField.status, 0, inField.stderr);
  assert.match(inField.stdout, /\nfield\n  h +56\n[\s\S]*\nicon\n  color +light [^\n]+\n\nNot in this cell: open reads Date picker \(Type, Open, Size\)\.\n$/);
  const open = run('date-picker', 'Type=Single', 'Open=True', 'Size=Large');
  assert.equal(open.status, 0, open.stderr);
  assert.match(open.stdout, /\nopen\n  gap +4\n  w +370\n\nNot in this cell: field, value, placeholder, icon read Date field \(Text filled, State, Size\)\.\n$/);
  const layers = run('date-picker', ...field, '--layers');
  assert.equal(layers.status, 0, layers.stderr);
  assert.match(layers.stdout, /^Core's Date field at Text filled=True, State=Enabled, Size=Large\n\nContainer\n/);
  const neither = run('date-picker', 'Size=Large');
  assert.equal(neither.status, 1);
  assert.match(neither.stderr, /No part of date-picker's property table reads a set with exactly these axes: [\s\S]*pick a part with --part\./);
  assert.equal(neither.stdout, '');
  const part = run('date-picker', 'Size=Large', '--part', 'open');
  assert.equal(part.status, 1);
  assert.match(part.stderr, /A cell of Core's Date picker names every axis; Type is missing/);
});
