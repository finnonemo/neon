// The controls' property tables against Core's documented values, from core/components/<name>.md
// at the pinned commit: text-field, text-area, select, radio, toggle, segmented-control and
// selection-tag. Each expected value is the doc's, never read back through the table.
import test from 'node:test';
import assert from 'node:assert/strict';
import { coreBaseline, withCoreBaseline } from '../templates/core-baseline.mjs';
import { fieldCell } from '../templates/core/text-field.mjs';
import { textAreaCell } from '../templates/core/text-area.mjs';
import { selectCell } from '../templates/core/select.mjs';
import { radioCell } from '../templates/core/radio.mjs';
import { toggleCell } from '../templates/core/toggle.mjs';
import { segmentedCell, segmentCell } from '../templates/core/segmented-control.mjs';
import { selectionTagCell } from '../templates/core/selection-tag.mjs';

const NONE = 'rgba(0, 0, 0, 0)';
const both = async (cell, names) => ({ light: await coreBaseline(cell, 'light', names), dark: await coreBaseline(cell, 'dark', names) });

// Text field: a 56px Field, 16px sides, 8px corners, on Field/field with no stroke until a state draws one.
test('an enabled input is Core\'s Text field at Large: a filled field with no stroke', async () => {
  const { light, dark } = await both(fieldCell('input', 'field'));
  const box = { h: 56, pad: [0, 16, 0, 16], radius: 8, border: { width: 0, color: NONE }, opacity: 1 };
  assert.deepEqual(light, { ...box, bg: 'rgba(1, 23, 43, 0.102)' });
  assert.deepEqual(dark, { ...box, bg: 'rgba(255, 255, 255, 0.122)' });
});

test('a field state draws its stroke inside the field: Focus 3px, Error 3px on the page background, Read-only 2px', async () => {
  const look = async (State) => both(fieldCell('input', 'field', { State }), ['bg', 'border']);
  assert.deepEqual(await look('Focus'), {
    light: { bg: 'rgba(1, 23, 43, 0.102)', border: { width: 3, color: 'rgb(105, 104, 239)' } },
    dark: { bg: 'rgba(255, 255, 255, 0.122)', border: { width: 3, color: 'rgb(128, 127, 242)' } },
  });
  assert.deepEqual(await look('Error'), {
    light: { bg: 'rgb(255, 255, 255)', border: { width: 3, color: 'rgb(214, 8, 8)' } },
    dark: { bg: 'rgb(0, 0, 0)', border: { width: 3, color: 'rgb(243, 9, 9)' } },
  });
  assert.deepEqual((await look('Read-only')).light.border.width, 2);
  assert.deepEqual(await look('Pressed'), {
    light: { bg: 'rgba(1, 23, 43, 0.122)', border: { width: 0, color: NONE } },
    dark: { bg: 'rgba(255, 255, 255, 0.149)', border: { width: 0, color: NONE } },
  });
});

test('a disabled field dims by Core\'s disabled tokens, not by opacity', async () => {
  const field = await both(fieldCell('input', 'field', { State: 'Disabled' }), ['bg', 'border', 'opacity']);
  assert.deepEqual(field.light, { bg: 'rgba(1, 23, 43, 0.051)', border: { width: 0, color: NONE }, opacity: 1 });
  assert.deepEqual(field.dark, { bg: 'rgba(255, 255, 255, 0.031)', border: { width: 0, color: NONE }, opacity: 1 });
  const text = await both(fieldCell('input', 'text', { State: 'Disabled' }), ['color', 'opacity']);
  assert.deepEqual(text, { light: { color: 'rgba(0, 0, 0, 0.451)', opacity: 1 }, dark: { color: 'rgba(255, 255, 255, 0.451)', opacity: 1 } });
});

// Headline is Medium and everything else Regular (Core's architecture doc, Type weight).
test('a field\'s texts are Core\'s: Headline title, Body input, Subheadline helper and error', async () => {
  const light = async (item, part, State) => coreBaseline(fieldCell(item, part, { State }), 'light', ['font', 'color']);
  assert.deepEqual(await light('label', 'title'), { font: { size: 17, lineHeight: 24, weight: 500 }, color: 'rgba(0, 0, 0, 0.651)' });
  assert.deepEqual(await light('input', 'text'), { font: { size: 17, lineHeight: 24, weight: 400 }, color: 'rgba(0, 0, 0, 0.851)' });
  assert.deepEqual(await light('field', 'helper'), { font: { size: 15, lineHeight: 24, weight: 400 }, color: 'rgba(0, 0, 0, 0.651)' });
  assert.deepEqual(await light('field', 'error', 'Error'), { font: { size: 15, lineHeight: 24, weight: 400 }, color: 'rgb(157, 6, 6)' });
  assert.deepEqual(await coreBaseline(fieldCell('field', 'errorIcon', { State: 'Error' }), 'dark', ['color']), { color: 'rgb(243, 9, 9)' });
});

test('a table with parts needs the part named, and refuses one it does not have', async () => {
  await assert.rejects(coreBaseline({ item: 'input', cell: fieldCell('input', 'field').cell }, 'light'), /input's property table has parts: name one of field, text/);
  await assert.rejects(coreBaseline({ ...fieldCell('input', 'field'), part: 'thumb' }, 'light'), /no part thumb/);
  await assert.rejects(coreBaseline({ item: 'button', part: 'field', cell: {} }, 'light'), /button's property table has no parts/);
});

test('a target held to a part takes that part\'s properties only', async () => {
  const cds = { elements: { control: { h: 56, radius: 8, border: { width: 1, color: 'rgb(91, 97, 110)' }, bg: 'rgb(255, 255, 255)' } }, gaps: {} };
  const targets = { control: { check: ['h', 'radius', 'border', 'bg'], core: fieldCell('input', 'field', { State: 'Error' }) } };
  const expected = await withCoreBaseline(cds, targets, 'light');
  assert.deepEqual(expected.elements.control, { h: 56, radius: 8, border: { width: 3, color: 'rgb(214, 8, 8)' }, bg: 'rgb(255, 255, 255)' });
});

// Text area: 104 tall at every Size, 16px all round.
test('a textarea is Core\'s Text area: 104 tall, 16px padding, no stroke until a state draws one', async () => {
  assert.deepEqual(await coreBaseline(textAreaCell('field'), 'light'), {
    h: 104, pad: [16, 16, 16, 16], radius: 8, bg: 'rgba(1, 23, 43, 0.102)', border: { width: 0, color: NONE }, opacity: 1,
  });
  assert.deepEqual(await coreBaseline(textAreaCell('field', { State: 'Focus' }), 'light', ['border']), { border: { width: 3, color: 'rgb(105, 104, 239)' } });
  assert.deepEqual(await coreBaseline(textAreaCell('text'), 'dark', ['font', 'color']), { font: { size: 17, lineHeight: 24, weight: 400 }, color: 'rgb(255, 255, 255)' });
});

// Select: the Text field's Field; Active is the open state.
test('a select trigger is Core\'s Select: the field, and Active when open', async () => {
  assert.deepEqual(await coreBaseline(selectCell('field'), 'light'), {
    h: 56, pad: [0, 16, 0, 16], radius: 8, bg: 'rgba(1, 23, 43, 0.102)', border: { width: 0, color: NONE }, opacity: 1,
  });
  assert.deepEqual(await both(selectCell('field', { State: 'Active' }), ['bg', 'border']), {
    light: { bg: 'rgb(255, 255, 255)', border: { width: 3, color: 'rgb(1, 23, 43)' } },
    dark: { bg: 'rgb(0, 0, 0)', border: { width: 3, color: 'rgb(255, 255, 255)' } },
  });
  assert.deepEqual(await coreBaseline(selectCell('value'), 'light', ['font', 'color']), { font: { size: 17, lineHeight: 24, weight: 400 }, color: 'rgba(0, 0, 0, 0.851)' });
  assert.deepEqual(await both(selectCell('chevron', { State: 'Disabled' }), ['color']), { light: { color: 'rgba(0, 0, 0, 0.451)' }, dark: { color: 'rgba(255, 255, 255, 0.451)' } });
});

// Radio: the glyph in a 24 × 24 Box, in Icon/icon-primary; the Value beside it is Body.
test('a radio is Core\'s Radio: a 24px box with no paint, the glyph in the icon ink', async () => {
  assert.deepEqual(await coreBaseline(radioCell('box'), 'light'), { h: 24, w: 24, radius: 12, bg: NONE, border: { width: 0, color: NONE }, opacity: 1 });
  assert.deepEqual(await both(radioCell('glyph', { Selection: 'Selected' }), ['h', 'w', 'color']), {
    light: { h: 17, w: 17, color: 'rgba(0, 0, 0, 0.851)' }, dark: { h: 17, w: 17, color: 'rgb(255, 255, 255)' },
  });
  assert.deepEqual(await coreBaseline(radioCell('glyph', { State: 'Disabled' }), 'light', ['color', 'opacity']), { color: 'rgba(0, 0, 0, 0.451)', opacity: 1 });
  assert.deepEqual(await coreBaseline(radioCell('value'), 'light', ['font', 'color', 'opacity']), { font: { size: 17, lineHeight: 24, weight: 400 }, color: 'rgba(0, 0, 0, 0.851)', opacity: 1 });
  assert.deepEqual(await coreBaseline(radioCell('value', { State: 'Disabled' }), 'dark', ['color']), { color: 'rgba(255, 255, 255, 0.451)' });
});

// Toggle: a 48 × 24 track (an 18px thumb in 3px of padding), grey off; on, the track is black under a
// white thumb, and white under a dark thumb in dark.
test('a switch is Core\'s Toggle: a 48 by 24 track, toggle-off and layer-selected-inverse, an 18px icon-inverse thumb', async () => {
  const track = { h: 24, w: 48, pad: [3, 3, 3, 3], radius: 12, opacity: 1 };
  assert.deepEqual(await both(toggleCell('track', { Toggled: 'False' })), {
    light: { ...track, bg: 'rgb(128, 128, 128)' }, dark: { ...track, bg: 'rgb(128, 128, 128)' },
  });
  assert.deepEqual(await both(toggleCell('track', { Toggled: 'True' }), ['bg']), { light: { bg: 'rgb(0, 0, 0)' }, dark: { bg: 'rgb(255, 255, 255)' } });
  assert.deepEqual(await coreBaseline(toggleCell('thumb'), 'light'), { h: 18, w: 18, radius: 9, bg: 'rgb(255, 255, 255)', border: { width: 0, color: 'rgba(0, 0, 0, 0)' }, opacity: 1 });
  assert.deepEqual(await coreBaseline(toggleCell('thumb', { Toggled: 'True' }), 'dark', ['bg']), { bg: 'rgba(0, 0, 0, 0.851)' });
  assert.deepEqual(await both(toggleCell('track', { State: 'Disabled' }), ['bg', 'opacity']), {
    light: { bg: 'rgba(1, 23, 43, 0.102)', opacity: 1 }, dark: { bg: 'rgba(255, 255, 255, 0.102)', opacity: 1 },
  });
  assert.deepEqual(await coreBaseline(toggleCell('thumb', { State: 'Disabled' }), 'dark', ['bg']), { bg: 'rgba(255, 255, 255, 0.451)' });
});

// Segmented control: a 12px-cornered track on button-secondary; the chosen segment is the page background in a 2px strong stroke.
test('a segmented control is Core\'s at each Size: 48, 36 and 56 tall', async () => {
  const at = async (Size) => coreBaseline(segmentedCell({ Size }), 'light', ['h', 'pad', 'radius', 'bg', 'opacity']);
  const track = { radius: 12, bg: 'rgba(1, 23, 43, 0.102)', opacity: 1 };
  assert.deepEqual(await at('Medium'), { h: 48, pad: [6, 6, 6, 6], ...track });
  assert.deepEqual(await at('Small'), { h: 36, pad: [4, 4, 4, 4], ...track });
  assert.deepEqual(await at('Large'), { h: 56, pad: [4, 4, 4, 4], ...track });
  assert.deepEqual(await coreBaseline(segmentedCell({ State: 'Disabled' }), 'dark', ['bg', 'opacity']), { bg: 'rgba(255, 255, 255, 0.122)', opacity: 0.5 });
});

test('a chosen segment is the page background in a strong stroke; the others are bare and secondary', async () => {
  const chosen = await both(segmentCell({ Selected: 'True' }));
  const item = { h: 36, pad: [0, 8, 0, 8], radius: 8, font: { size: 15, lineHeight: 24, weight: 400 } };
  assert.deepEqual(chosen.light, { ...item, bg: 'rgb(255, 255, 255)', border: { width: 2, color: 'rgb(1, 23, 43)' }, color: 'rgba(0, 0, 0, 0.851)' });
  assert.deepEqual(chosen.dark, { ...item, bg: 'rgb(0, 0, 0)', border: { width: 2, color: 'rgb(255, 255, 255)' }, color: 'rgb(255, 255, 255)' });
  const other = await coreBaseline(segmentCell({ Selected: 'False' }), 'light');
  assert.deepEqual(other, { ...item, bg: 'rgba(255, 255, 255, 0)', border: { width: 2, color: 'rgba(255, 255, 255, 0)' }, color: 'rgba(0, 0, 0, 0.651)' });
  const sizes = async (Size) => coreBaseline(segmentCell({ Selected: 'False', Size }), 'light', ['h', 'pad', 'font']);
  assert.deepEqual(await sizes('Small'), { h: 28, pad: [0, 2, 0, 2], font: { size: 15, lineHeight: 24, weight: 400 } });
  assert.deepEqual(await sizes('Large'), { h: 48, pad: [0, 8, 0, 8], font: { size: 17, lineHeight: 24, weight: 400 } });
});

// Selection tag, Secondary Navy: 40, 32 and 24 tall; the ring is 1px, 2px when selected.
test('a toggle is Core\'s Selection tag in Secondary Navy at Large, Medium and Small', async () => {
  const at = async (Size) => coreBaseline(selectionTagCell({ Size }), 'light', ['h', 'pad', 'radius', 'font']);
  assert.deepEqual(await at('Large'), { h: 40, pad: [10, 8, 10, 8], radius: 8, font: { size: 17, lineHeight: 24, weight: 400 } });
  assert.deepEqual(await at('Medium'), { h: 32, pad: [6, 8, 6, 8], radius: 8, font: { size: 15, lineHeight: 24, weight: 400 } });
  assert.deepEqual(await at('Small'), { h: 24, pad: [2, 6, 2, 6], radius: 4, font: { size: 13, lineHeight: 20, weight: 400 } });
});

test('a pressed toggle keeps its fill and takes the 2px ring in the tag\'s ink; a disabled one takes the disabled tokens', async () => {
  const look = async (cell) => both(selectionTagCell(cell), ['bg', 'color', 'border', 'opacity']);
  assert.deepEqual(await look({ Selected: 'False' }), {
    light: { bg: 'rgb(242, 243, 244)', color: 'rgb(0, 9, 17)', border: { width: 1, color: 'rgb(217, 220, 223)' }, opacity: 1 },
    dark: { bg: 'rgba(166, 191, 204, 0.122)', color: 'rgb(192, 197, 202)', border: { width: 1, color: 'rgba(166, 191, 204, 0.251)' }, opacity: 1 },
  });
  assert.deepEqual(await look({ Selected: 'True' }), {
    light: { bg: 'rgb(242, 243, 244)', color: 'rgb(0, 9, 17)', border: { width: 2, color: 'rgb(0, 9, 17)' }, opacity: 1 },
    dark: { bg: 'rgba(166, 191, 204, 0.122)', color: 'rgb(192, 197, 202)', border: { width: 2, color: 'rgb(192, 197, 202)' }, opacity: 1 },
  });
  assert.deepEqual((await look({ Selected: 'True', State: 'Disabled' })).light, {
    bg: 'rgb(242, 243, 244)', color: 'rgba(0, 0, 0, 0.451)', border: { width: 2, color: 'rgb(242, 243, 244)' }, opacity: 1,
  });
});
