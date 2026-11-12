import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { coreValue, readCoreItem } from '../../scripts/lib/core-cell.mjs';
import { coreBaseline, withCoreBaseline } from '../templates/core-baseline.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const button = (Hierarchy, Type, Size, State) => ({ item: 'button', cell: { Hierarchy, Type, Size, State } });

// A small Counterpart: one set whose Container has a fill that a more specific rule overrides.
const VALUES = {
  component: 'Chip',
  sets: [{
    name: 'Chip',
    axes: [
      { name: 'Type', values: ['Default', 'Inverse'] },
      { name: 'Size', values: ['Small', 'Large'] },
      { name: 'State', values: ['Enabled', 'Disabled'] },
    ],
    exclude: ['{{Type=Inverse}}{{Size=Small}}'],
    variables: { 'Chip/Container/Small/Layout height': 24, 'Chip/Container/Large/Layout height': 32 },
    bindings: [
      { layer: 'Container', property: 'minHeight', when: '{{Size=*}}', value: 'Components/Chip/Container/{{Size=*}}/Layout height' },
      { layer: 'Container', property: 'fills.0', when: '{{State=Enabled}}', value: 'Theme/Layer/layer-01' },
      { layer: 'Container', property: 'fills.0', when: '{{State=Disabled}}', value: 'Theme/Button/button-disabled' },
      { layer: 'Container', property: 'fills.0', when: '{{Type=Inverse}}{{State=Disabled}}', value: 'Theme/Button/button-inverse-disabled' },
      { layer: 'Container', property: 'layoutSizingVertical', when: '{{State=Enabled, Disabled}}', value: 'HUG', literal: true },
      { layer: 'Container / Label', property: 'textStyleId', when: '{{Size=*}}', value: 'Body/Subheadline' },
    ],
  }],
};
const THEME = {
  'Layer/layer-01': { light: { primitive: 'White/100', hex: '#FFFFFF' }, dark: { primitive: 'Grey/90', hex: '#1A1A1A' } },
  'Button/button-disabled': { light: { primitive: 'Navy/10A', hex: '#01172B1A' }, dark: { primitive: 'White/10A', hex: '#FFFFFF1A' } },
  'Button/button-inverse-disabled': { light: { primitive: 'White/10A', hex: '#FFFFFF1A' }, dark: { primitive: 'Navy/10A', hex: '#01172B1A' } },
};

async function snapshot(t, values = VALUES) {
  const dir = await mkdtemp(join(tmpdir(), 'neon-core-cell-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const files = {
    'core/index.json': { chip: { counterpart: 'Chip', doc: 'components/chip.md', values: 'components/chip.json' }, label: { counterpart: 'Label', doc: 'components/label.md' } },
    'core/components/chip.json': values,
    'core/theme.json': THEME,
    'core/text-styles.json': { Subheadline: { size: 15, lineHeight: 24 } },
  };
  for (const [path, content] of Object.entries(files)) {
    await mkdir(dirname(join(dir, path)), { recursive: true });
    await writeFile(join(dir, path), JSON.stringify(content));
  }
  return readCoreItem(dir, 'chip');
}
const chip = (Type, Size, State) => ({ Type, Size, State });

test('a cell reads a Components variable at its own Size', async t => {
  const core = await snapshot(t);
  assert.deepEqual(coreValue(core, 'Chip', chip('Default', 'Small', 'Enabled'), 'Container', 'minHeight'), { kind: 'number', value: 24 });
  assert.deepEqual(coreValue(core, 'Chip', chip('Default', 'Large', 'Enabled'), 'Container', 'minHeight'), { kind: 'number', value: 32 });
});

test('a cell reads a Theme token in both modes, a text style and a literal', async t => {
  const core = await snapshot(t);
  const cell = chip('Default', 'Large', 'Enabled');
  assert.deepEqual(coreValue(core, 'Chip', cell, 'Container', 'fills.0'), { kind: 'color', token: 'Layer/layer-01', light: 'rgb(255, 255, 255)', dark: 'rgb(26, 26, 26)' });
  assert.deepEqual(coreValue(core, 'Chip', cell, 'Container / Label', 'textStyleId'), { kind: 'textStyle', name: 'Subheadline', size: 15, lineHeight: 24 });
  assert.deepEqual(coreValue(core, 'Chip', cell, 'Container', 'layoutSizingVertical'), { kind: 'literal', value: 'HUG' });
});

test('the rule naming more axes wins, and a property no rule binds is null', async t => {
  const core = await snapshot(t);
  assert.equal(coreValue(core, 'Chip', chip('Inverse', 'Large', 'Disabled'), 'Container', 'fills.0').token, 'Button/button-inverse-disabled');
  assert.equal(coreValue(core, 'Chip', chip('Default', 'Large', 'Disabled'), 'Container', 'fills.0').token, 'Button/button-disabled');
  assert.equal(coreValue(core, 'Chip', chip('Default', 'Large', 'Enabled'), 'Container', 'strokes.0'), null);
});

test('two rules naming as many axes with different values are refused', async t => {
  const values = structuredClone(VALUES);
  values.sets[0].bindings.push({ layer: 'Container', property: 'fills.0', when: '{{Type=Default}}', value: 'Theme/Button/button-disabled' });
  const core = await snapshot(t, values);
  assert.throws(() => coreValue(core, 'Chip', chip('Default', 'Large', 'Enabled'), 'Container', 'fills.0'), /Layer\/layer-01.*Button\/button-disabled|Button\/button-disabled.*Layer\/layer-01/);
});

test('a cell Core does not have is refused: an unknown value, a missing axis, an excluded combination', async t => {
  const core = await snapshot(t);
  assert.throws(() => coreValue(core, 'Chip', chip('Default', 'Huge', 'Enabled'), 'Container', 'minHeight'), /Size=Huge/);
  assert.throws(() => coreValue(core, 'Chip', { Type: 'Default', Size: 'Large' }, 'Container', 'minHeight'), /State/);
  assert.throws(() => coreValue(core, 'Chip', chip('Inverse', 'Small', 'Enabled'), 'Container', 'minHeight'), /excludes/);
  assert.throws(() => coreValue(core, 'Tag', chip('Default', 'Large', 'Enabled'), 'Container', 'minHeight'), /Chip/);
});

test('a value the snapshot cannot resolve is refused', async t => {
  const values = structuredClone(VALUES);
  values.sets[0].bindings.push(
    { layer: 'Container', property: 'paddingLeft', when: '{{Size=*}}', value: 'Components/Chip/Container/{{Size=*}}/Padding left' },
    { layer: 'Container', property: 'strokes.0', when: '{{Size=*}}', value: 'Theme/Border/border-none' },
  );
  const core = await snapshot(t, values);
  const cell = chip('Default', 'Large', 'Enabled');
  assert.throws(() => coreValue(core, 'Chip', cell, 'Container', 'paddingLeft'), /Chip\/Container\/Large\/Padding left/);
  assert.throws(() => coreValue(core, 'Chip', cell, 'Container', 'strokes.0'), /Border\/border-none/);
});

test('an item whose Counterpart has no values file is refused', async t => {
  const core = snapshot(t).then(() => readCoreItem(root, 'no-such-item'));
  await assert.rejects(core, /no-such-item/);
});

// Core's Button, from core/components/button.md at the pinned commit.
test('the button baseline is Core\'s Primary Default at Large', async () => {
  const cell = button('Primary', 'Default', 'Large', 'Enabled');
  const size = { h: 56, pad: [16, 24, 16, 24], radius: 28, font: { size: 17, lineHeight: 24, weight: 500 }, opacity: 1 };
  assert.deepEqual(await coreBaseline(cell, 'light'), { ...size, bg: 'rgb(1, 23, 43)', color: 'rgb(255, 255, 255)' });
  assert.deepEqual(await coreBaseline(cell, 'dark'), { ...size, bg: 'rgb(65, 81, 96)', color: 'rgb(255, 255, 255)' });
});

test('the button baseline follows Size: XSmall 28, Small 36, Medium 48', async () => {
  const at = async Size => { const { h, pad, radius, font } = await coreBaseline(button('Primary', 'Default', Size, 'Enabled'), 'light'); return { h, pad, radius, font }; };
  assert.deepEqual(await at('XSmall'), { h: 28, pad: [4, 12, 4, 12], radius: 14, font: { size: 13, lineHeight: 20, weight: 500 } });
  assert.deepEqual(await at('Small'), { h: 36, pad: [6, 16, 6, 16], radius: 18, font: { size: 15, lineHeight: 24, weight: 500 } });
  assert.deepEqual(await at('Medium'), { h: 48, pad: [12, 24, 12, 24], radius: 24, font: { size: 15, lineHeight: 24, weight: 500 } });
});

test('the button baseline follows Hierarchy and Type in both modes', async () => {
  const colors = async (cell, mode) => { const { bg, color } = await coreBaseline(cell, mode); return { bg, color }; };
  const secondary = button('Secondary', 'Default', 'Large', 'Enabled');
  assert.deepEqual(await colors(secondary, 'light'), { bg: 'rgba(1, 23, 43, 0.102)', color: 'rgba(0, 0, 0, 0.851)' });
  assert.deepEqual(await colors(secondary, 'dark'), { bg: 'rgba(255, 255, 255, 0.122)', color: 'rgb(255, 255, 255)' });
  const danger = button('Primary', 'Danger', 'Large', 'Enabled');
  assert.deepEqual(await colors(danger, 'light'), { bg: 'rgb(214, 8, 8)', color: 'rgb(255, 255, 255)' });
  assert.deepEqual(await colors(danger, 'dark'), { bg: 'rgb(214, 8, 8)', color: 'rgb(255, 255, 255)' });
  const brand = button('Primary', 'Brand', 'Large', 'Enabled');
  assert.deepEqual(await colors(brand, 'light'), { bg: 'rgb(242, 249, 60)', color: 'rgba(0, 0, 0, 0.851)' });
  assert.deepEqual(await colors(brand, 'dark'), { bg: 'rgb(217, 225, 7)', color: 'rgba(0, 0, 0, 0.851)' });
});

test('a Tertiary button has no fill, and a Disabled one takes Core\'s disabled tokens at full opacity', async () => {
  const tertiary = await coreBaseline(button('Tertiary', 'Default', 'Large', 'Enabled'), 'light');
  assert.equal(tertiary.bg, 'rgba(0, 0, 0, 0)');
  const disabled = button('Primary', 'Default', 'Large', 'Disabled');
  const look = async mode => { const { bg, color, opacity } = await coreBaseline(disabled, mode); return { bg, color, opacity }; };
  assert.deepEqual(await look('light'), { bg: 'rgba(1, 23, 43, 0.102)', color: 'rgba(0, 0, 0, 0.451)', opacity: 1 });
  assert.deepEqual(await look('dark'), { bg: 'rgba(255, 255, 255, 0.102)', color: 'rgba(255, 255, 255, 0.451)', opacity: 1 });
});

test('an item with no property table is refused', async () => {
  await assert.rejects(coreBaseline({ item: 'card', cell: {} }, 'light'), /card/);
});

// A CDS baseline case as the browser suite holds it: only the properties each target checks.
const CDS_BUTTON = { font: { size: 17, lineHeight: 22, weight: 500 }, color: 'rgb(255, 255, 255)', bg: 'rgb(1, 23, 43)', h: 54, pad: [16, 32, 16, 32], radius: 27 };
const CASE = {
  elements: {
    approve: CDS_BUTTON,
    sized: { h: 54, w: 129 },
    title: { font: { size: 28, lineHeight: 34, weight: 400 }, color: 'rgb(0, 0, 0)' },
    absent: null,
  },
  gaps: { 'approve→sized': 8 },
};
const TARGETS = {
  approve: { check: ['font', 'color', 'bg', 'h', 'pad', 'radius'], core: button('Primary', 'Default', 'Large', 'Enabled') },
  sized: { check: ['h', 'w'], core: button('Primary', 'Default', 'Large', 'Enabled') },
  title: { check: ['font', 'color'] },
  absent: { check: ['h'], core: button('Primary', 'Default', 'Large', 'Enabled') },
};

test('a target with a Core cell takes Core\'s value for each property it checks; the rest keeps the CDS baseline', async () => {
  const expected = await withCoreBaseline(CASE, TARGETS, 'dark');
  assert.deepEqual(expected.elements.approve, {
    font: { size: 17, lineHeight: 24, weight: 500 }, color: 'rgb(255, 255, 255)', bg: 'rgb(65, 81, 96)', h: 56, pad: [16, 24, 16, 24], radius: 28,
  });
  assert.deepEqual(expected.elements.sized, { h: 56, w: 129 });
  assert.deepEqual(expected.elements.title, CASE.elements.title);
  assert.equal(expected.elements.absent, null);
  assert.deepEqual(expected.gaps, CASE.gaps);
  assert.deepEqual(CASE.elements.approve, CDS_BUTTON, 'the CDS baseline itself is left as it was');
});

test('a target with a Core cell and no CDS element is held to Core for every property it checks', async () => {
  const targets = { ...TARGETS, brandMedium: { check: ['font', 'color', 'bg', 'h', 'pad', 'radius'], core: button('Primary', 'Brand', 'Medium', 'Enabled') } };
  const expected = await withCoreBaseline(CASE, targets, 'light');
  assert.deepEqual(expected.elements.brandMedium, {
    font: { size: 15, lineHeight: 24, weight: 500 }, color: 'rgba(0, 0, 0, 0.851)', bg: 'rgb(242, 249, 60)', h: 48, pad: [12, 24, 12, 24], radius: 24,
  });
  assert.equal(expected.elements.absent, null, 'an element the CDS baseline holds as not rendered stays so');
});

test('a target with no CDS element cannot check a property Core\'s table leaves out', async () => {
  const targets = { wide: { check: ['h', 'w'], core: button('Primary', 'Default', 'Large', 'Enabled') } };
  await assert.rejects(withCoreBaseline(CASE, targets, 'light'), /wide checks w/);
});

// Core's Loading state fixes the height of the Enabled button instead of binding a minimum, and its label is unbound.
test('a target checks only the properties Core binds in its cell: Loading keeps the Enabled fill', async () => {
  const targets = { saving: { check: ['bg', 'opacity'], core: button('Primary', 'Default', 'Large', 'Loading') } };
  const expected = await withCoreBaseline({ elements: {}, gaps: {} }, targets, 'light');
  assert.deepEqual(expected.elements.saving, { bg: 'rgb(1, 23, 43)', opacity: 1 });
  const tall = { saving: { check: ['bg', 'h'], core: button('Primary', 'Default', 'Large', 'Loading') } };
  await assert.rejects(withCoreBaseline({ elements: {}, gaps: {} }, tall, 'light'), /binds no Container minHeight for h/);
});

// An item not yet retuned can render a retuned one: alert-dialog's actions are Buttons whose height it sets itself.
test('a target can take only some properties from Core and keep the CDS baseline for the rest', async () => {
  const targets = { approve: { ...TARGETS.approve, coreProperties: ['font', 'pad'] } };
  const expected = await withCoreBaseline(CASE, targets, 'dark');
  assert.deepEqual(expected.elements.approve, { ...CDS_BUTTON, font: { size: 17, lineHeight: 24, weight: 500 }, pad: [16, 24, 16, 24] });
});
