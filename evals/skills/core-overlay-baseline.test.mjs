// The overlay items' property tables against Core's documented values, from
// core/components/<name>.md at the pinned commit. Each expected value is the doc's, never read
// back through the table.
import test from 'node:test';
import assert from 'node:assert/strict';
import { coreBaseline } from '../templates/core-baseline.mjs';
import { tooltipCell } from '../templates/core/tooltip.mjs';
import { snackbarAction, snackbarCell } from '../templates/core/snackbar.mjs';
import { bannerCell } from '../templates/core/banner.mjs';

const both = async (cell, names) => ({ light: await coreBaseline(cell, 'light', names), dark: await coreBaseline(cell, 'dark', names) });

// Tooltip: the tip's Surface is Background/background-inverse with 8px corners, padded 16 at its
// sides and 2, 8 or 16 above and below by Size; its Label is Subheadline in Text/text-inverse.
test('a tooltip is Core\'s _Tooltip item: an inverse Surface with 8px corners, padded 2, 8 or 16 by Size', async () => {
  const surface = (y) => ({ light: { pad: [y, 16, y, 16], radius: 8, bg: 'rgb(0, 0, 0)' }, dark: { pad: [y, 16, y, 16], radius: 8, bg: 'rgb(255, 255, 255)' } });
  assert.deepEqual(await both(tooltipCell('surface', { size: 'sm' })), surface(2));
  assert.deepEqual(await both(tooltipCell('surface')), surface(8));
  assert.deepEqual(await both(tooltipCell('surface', { size: 'lg' })), surface(16));
  assert.deepEqual(await both(tooltipCell('label')), {
    light: { font: { size: 15, lineHeight: 24 }, color: 'rgb(255, 255, 255)' },
    dark: { font: { size: 15, lineHeight: 24 }, color: 'rgba(0, 0, 0, 0.851)' },
  });
  assert.throws(() => tooltipCell('surface', { size: 'xl' }), /no xl size/);
});

test('a toast is Core\'s Snackbar: an inverse Container at least 56px tall with 16px corners, padded 16 at its sides and 4 beside its action', async () => {
  const container = (right) => ({ light: { h: 56, pad: [0, right, 0, 16], radius: 16, bg: 'rgb(0, 0, 0)' }, dark: { h: 56, pad: [0, right, 0, 16], radius: 16, bg: 'rgb(255, 255, 255)' } });
  assert.deepEqual(await both(snackbarCell('container')), container(16));
  assert.deepEqual(await both(snackbarCell('container', { leading: true, action: true })), container(4));
  assert.deepEqual(await both(snackbarCell('text')), { light: { color: 'rgb(255, 255, 255)' }, dark: { color: 'rgba(0, 0, 0, 0.851)' } });
  assert.deepEqual(await both(snackbarCell('icon', { leading: true })), { light: { h: 24, w: 24, color: 'rgb(255, 255, 255)' }, dark: { h: 24, w: 24, color: 'rgba(0, 0, 0, 0.851)' } });
  assert.deepEqual(await coreBaseline(snackbarAction, 'light', ['h', 'pad', 'bg', 'color', 'font']), {
    h: 48, pad: [12, 24, 12, 24], bg: 'rgba(0, 0, 0, 0)', color: 'rgb(255, 255, 255)', font: { size: 15, lineHeight: 24, weight: 500 },
  });
});

test('an alert is Core\'s In-line banner in Primary: its Status\'s fill under primary text and a primary icon', async () => {
  const box = (light, dark) => ({ light: { h: 80, pad: [16, 16, 16, 16], radius: 16, bg: light }, dark: { h: 80, pad: [16, 16, 16, 16], radius: 16, bg: dark } });
  assert.deepEqual(await both(bannerCell('box')), box('rgb(243, 243, 254)', 'rgba(24, 23, 231, 0.251)'));
  assert.deepEqual(await both(bannerCell('box', 'success')), box('rgb(230, 253, 240)', 'rgba(0, 231, 107, 0.149)'));
  assert.deepEqual(await both(bannerCell('box', 'warning')), box('rgb(254, 247, 243)', 'rgba(242, 100, 20, 0.149)'));
  assert.deepEqual(await both(bannerCell('box', 'error')), box('rgb(255, 245, 245)', 'rgba(247, 50, 50, 0.149)'));
  const ink = { light: 'rgba(0, 0, 0, 0.851)', dark: 'rgb(255, 255, 255)' };
  assert.deepEqual(await both(bannerCell('icon', 'error')), { light: { color: ink.light }, dark: { color: ink.dark } });
  for (const text of ['title', 'message']) {
    assert.deepEqual(await both(bannerCell(text, 'warning')), { light: { font: { size: 15, lineHeight: 24 }, color: ink.light }, dark: { font: { size: 15, lineHeight: 24 }, color: ink.dark } });
  }
  assert.throws(() => bannerCell('box', 'promotional'), /no Status for the promotional alert/);
});
