// The calendar's property table against Core's documented values, from
// core/components/date-and-time.md at the pinned commit. Each expected value is the doc's, never
// read back through the table.
import test from 'node:test';
import assert from 'node:assert/strict';
import { coreBaseline } from '../templates/core-baseline.mjs';
import { pickersCell } from '../templates/core/date-and-time.mjs';
import { docValue, readCoreDoc } from '../../scripts/lib/core-cell.mjs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const both = async (part) => ({ light: await coreBaseline(pickersCell(part), 'light'), dark: await coreBaseline(pickersCell(part), 'dark') });
const inBoth = (value) => ({ light: value('light'), dark: value('dark') });

// Text/text-primary, Text/text-secondary, Link/link-primary, Text/text-inverse, Text/text-disabled,
// Layer/layer-selected-inverse and Miscellaneous/highlight.
const primary = { light: 'rgba(0, 0, 0, 0.851)', dark: 'rgb(255, 255, 255)' };
const secondary = { light: 'rgba(0, 0, 0, 0.651)', dark: 'rgba(255, 255, 255, 0.651)' };
const link = { light: 'rgb(24, 23, 231)', dark: 'rgb(140, 139, 243)' };
const inverse = { light: 'rgb(255, 255, 255)', dark: 'rgba(0, 0, 0, 0.851)' };
const disabled = { light: 'rgba(0, 0, 0, 0.451)', dark: 'rgba(255, 255, 255, 0.451)' };
const selectedInverse = { light: 'rgb(0, 0, 0)', dark: 'rgb(255, 255, 255)' };
const highlight = { light: 'rgba(24, 23, 231, 0.102)', dark: 'rgba(24, 23, 231, 0.251)' };
const title3 = { size: 20, lineHeight: 28 };
const none = 'rgba(0, 0, 0, 0)';

test('a calendar is Core\'s Date and time at iOS=False: a 48px Header, Footnote weekdays and weeks of 48px days', async () => {
  assert.deepEqual(await both('header'), inBoth(() => ({ h: 48, pad: [0, 0, 0, 8] })));
  assert.deepEqual(await both('month'), inBoth((mode) => ({ font: { size: 17, lineHeight: 24 }, color: primary[mode] })));
  assert.deepEqual(await both('arrow'), inBoth(() => ({ h: 48, w: 48, bg: none })));
  assert.deepEqual(await both('weekday'), inBoth((mode) => ({ font: { size: 13, lineHeight: 20 }, color: secondary[mode] })));
  assert.deepEqual(await both('week'), inBoth(() => ({ h: 48 })));
});

test('a calendar day is Core\'s _Day: Title 3 in a 36px round Mark, link ink and a dot on today, an inverse disc when picked', async () => {
  assert.deepEqual(await both('day'), inBoth((mode) => ({ h: 48, w: 48, font: title3, color: primary[mode], opacity: 1 })));
  assert.deepEqual(await both('today'), inBoth((mode) => ({ font: title3, color: link[mode] })));
  assert.deepEqual(await both('selected'), inBoth((mode) => ({ h: 48, w: 48, font: title3, color: inverse[mode] })));
  assert.deepEqual(await both('disabled'), inBoth((mode) => ({ font: title3, color: disabled[mode], opacity: 1 })));
  assert.deepEqual(await both('mark'), inBoth(() => ({ h: 36, w: 36, radius: 18, bg: none })));
  assert.deepEqual(await both('selectedMark'), inBoth((mode) => ({ h: 36, w: 36, radius: 18, bg: selectedInverse[mode] })));
  assert.deepEqual(await both('dot'), inBoth((mode) => ({ h: 4, w: 4, bg: link[mode] })));
});

test('a range\'s band is 36 tall in Miscellaneous/highlight: a whole day in the range, half of each end', async () => {
  assert.deepEqual(await both('band'), inBoth((mode) => ({ h: 36, bg: highlight[mode], w: 48 })));
  assert.deepEqual(await both('bandEnd'), inBoth((mode) => ({ h: 36, bg: highlight[mode], w: 24 })));
});

test('the calendar\'s table cannot name what Date and time\'s doc does not', async () => {
  const core = await readCoreDoc(root, 'calendar');
  assert.equal(core.counterpart, 'Date and time');
  // The doc writes the Mark's radius as Radius/Round, which is no step of the snapshot's Scales.
  assert.throws(() => docValue(core, 'Radius/radius-round'), /Core's Date and time doc does not name Radius\/radius-round/);
  // The arrows' ink is Icon button's, not this doc's.
  assert.throws(() => docValue(core, 'Icon/icon-primary'), /Core's Date and time doc does not name Icon\/icon-primary/);
});
