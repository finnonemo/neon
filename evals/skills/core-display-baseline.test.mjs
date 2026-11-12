// The display items' property tables against Core's documented values, from
// core/components/<name>.md at the pinned commit. Each expected value is the doc's, never read
// back through the table.
import test from 'node:test';
import assert from 'node:assert/strict';
import { coreBaseline } from '../templates/core-baseline.mjs';
import { dividerCell } from '../templates/core/divider.mjs';
import { progressCell } from '../templates/core/progress-bar.mjs';
import { spinnerCell } from '../templates/core/progress-circle.mjs';

const NONE = 'rgba(0, 0, 0, 0)';
const both = async (cell, names) => ({ light: await coreBaseline(cell, 'light', names), dark: await coreBaseline(cell, 'dark', names) });

// Divider: a 1px Line filled with Border/border-subtle; the line is a fill, not a stroke.
test('a separator is Core\'s Divider: a 1px line filled with Border/border-subtle, inset or not', async () => {
  const line = { h: 1, border: { width: 0, color: NONE } };
  for (const Inset of ['None', 'Start']) {
    assert.deepEqual(await both(dividerCell({ Inset })), {
      light: { ...line, bg: 'rgba(0, 0, 0, 0.122)' },
      dark: { ...line, bg: 'rgba(255, 255, 255, 0.18)' },
    });
  }
});

// Progress bar: Track Fill × Fixed 2 · 4 · 8 by Size, radius 0, Layer/layer-03; the Indicator's are the Track's.
test('a progress bar is Core\'s square Track on Layer/layer-03, 2, 4 and 8px tall by Size', async () => {
  for (const [Size, h] of [['Small', 2], ['Medium', 4], ['Large', 8]]) {
    for (const part of ['track', 'indicator']) {
      assert.deepEqual(await coreBaseline(progressCell(part, { Size }), 'light', ['h', 'radius']), { h, radius: 0 }, `${Size} ${part}`);
    }
  }
  assert.deepEqual(await both(progressCell('track'), ['bg']), { light: { bg: 'rgb(230, 232, 234)' }, dark: { bg: 'rgb(64, 64, 64)' } });
  assert.deepEqual(await both(progressCell('track', { Progress: 'Indeterminate' }), ['bg']), { light: { bg: 'rgb(230, 232, 234)' }, dark: { bg: 'rgb(64, 64, 64)' } });
});

test('the progress Indicator is support-info, support-success or support-error by Status', async () => {
  const fill = async (cell) => both(progressCell('indicator', cell), ['bg']);
  assert.deepEqual(await fill(), { light: { bg: 'rgb(24, 23, 231)' }, dark: { bg: 'rgb(140, 139, 243)' } });
  assert.deepEqual(await fill({ Status: 'Success', Progress: '100%' }), { light: { bg: 'rgb(0, 150, 70)' }, dark: { bg: 'rgb(0, 196, 91)' } });
  assert.deepEqual(await fill({ Status: 'Error', Progress: '100%' }), { light: { bg: 'rgb(214, 8, 8)' }, dark: { bg: 'rgb(243, 9, 9)' } });
});

test('Core pairs a Success or Error progress bar with a full bar only', async () => {
  await assert.rejects(coreBaseline(progressCell('indicator', { Status: 'Success' }), 'light'), /excludes/);
});

// Progress circle: Ring 15 · 24 · 36 · 48 · 64, stroke 2 · 3 · 4 · 4 · 4, Track Layer/layer-03, Indicator Miscellaneous/interactive.
test('a spinner is Core\'s Progress circle: a round Ring stroked in Layer/layer-03 with an arc in Miscellaneous/interactive', async () => {
  const sizes = [['XSmall', 15, 2], ['Small', 24, 3], ['Medium', 36, 4], ['Large', 48, 4], ['XLarge', 64, 4]];
  for (const [Size, d, width] of sizes) {
    assert.deepEqual(await both(spinnerCell({ Size })), {
      light: { h: d, w: d, radius: d / 2, border: { width, color: 'rgb(230, 232, 234)' }, color: 'rgb(82, 81, 237)' },
      dark: { h: d, w: d, radius: d / 2, border: { width, color: 'rgb(64, 64, 64)' }, color: 'rgb(140, 139, 243)' },
    }, Size);
  }
});
