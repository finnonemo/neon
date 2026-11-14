// The overlay items' property tables against Core's documented values, from
// core/components/<name>.md at the pinned commit. Each expected value is the doc's, never read
// back through the table.
import test from 'node:test';
import assert from 'node:assert/strict';
import { coreBaseline } from '../templates/core-baseline.mjs';
import { tooltipCell } from '../templates/core/tooltip.mjs';
import { snackbarAction, snackbarCell } from '../templates/core/snackbar.mjs';
import { bannerCell } from '../templates/core/banner.mjs';
import { alertCell } from '../templates/core/alert.mjs';
import { sheetCell } from '../templates/core/sheet.mjs';
import { popoverCell } from '../templates/core/popover.mjs';
import { menuCell } from '../templates/core/menu.mjs';
import { docValue, readCoreDoc } from '../../scripts/lib/core-cell.mjs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));

// Core's Text/text-primary.
const ink = { light: 'rgba(0, 0, 0, 0.851)', dark: 'rgb(255, 255, 255)' };
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
  assert.deepEqual(await both(bannerCell('icon', 'error')), { light: { color: ink.light }, dark: { color: ink.dark } });
  for (const text of ['title', 'message']) {
    assert.deepEqual(await both(bannerCell(text, 'warning')), { light: { font: { size: 15, lineHeight: 24 }, color: ink.light }, dark: { font: { size: 15, lineHeight: 24 }, color: ink.dark } });
  }
  assert.throws(() => bannerCell('box', 'promotional'), /no Status for the promotional alert/);
});

// The Counterparts the snapshot holds as a doc alone (Alert, Sheet, Popover, Menu): a table names
// the Theme token, Scale step or text style the doc gives each part, and states the doc's raw numbers.
const layer01 = { light: 'rgb(255, 255, 255)', dark: 'rgb(26, 26, 26)' };
const subtle = { light: 'rgba(0, 0, 0, 0.122)', dark: 'rgba(255, 255, 255, 0.18)' };
const inBoth = (value) => ({ light: value('light'), dark: value('dark') });

test('an alert dialog is Core\'s Alert at iOS=False: a 300px card on Layer/layer-01 with 16px corners, over the overlay', async () => {
  assert.deepEqual(await both(alertCell('card')), inBoth((mode) => ({ w: 300, pad: [16, 16, 16, 16], radius: 16, bg: layer01[mode] })));
  assert.deepEqual(await both(alertCell('overlay')), { light: { bg: 'rgba(0, 0, 0, 0.2)' }, dark: { bg: 'rgba(0, 0, 0, 0.502)' } });
  assert.deepEqual(await both(alertCell('text')), inBoth(() => ({ pad: [8, 8, 24, 8] })));
  for (const part of ['title', 'message']) {
    assert.deepEqual(await both(alertCell(part)), inBoth((mode) => ({ font: { size: 17, lineHeight: 24 }, color: ink[mode] })));
  }
  // dialog is matched to the same Alert.
  assert.deepEqual(await coreBaseline(alertCell('card', 'dialog'), 'dark', ['bg']), { bg: layer01.dark });
});

test('a sheet is Core\'s Sheet at iOS=False: Layer/layer-01 with 16px top corners, padded 16 above, under a 48 by 4 grabber', async () => {
  assert.deepEqual(await both(sheetCell('surface')), inBoth((mode) => ({ pad: [16, 0, 0, 0], radii: [16, 16, 0, 0], bg: layer01[mode], border: { width: 0, color: 'rgba(0, 0, 0, 0)' } })));
  assert.deepEqual(await both(sheetCell('grabber')), inBoth((mode) => ({ h: 4, w: 48, radius: 2, bg: subtle[mode], opacity: 1 })));
  assert.deepEqual(await both(sheetCell('overlay')), { light: { bg: 'rgba(0, 0, 0, 0.2)' }, dark: { bg: 'rgba(0, 0, 0, 0.502)' } });
});

test('a popover is Core\'s Popover at iOS=False: 352px on Layer/layer-01 with 12px corners, a 1px subtle border and 16px padding', async () => {
  assert.deepEqual(await both(popoverCell()), inBoth((mode) => ({ w: 352, pad: [16, 16, 16, 16], radius: 12, bg: layer01[mode], border: { width: 1, color: subtle[mode] } })));
});

test('a dropdown menu is Core\'s Menu at iOS=False: 238px on Layer/layer-01 with 12px corners, 48px pill rows in Body', async () => {
  assert.deepEqual(await both(menuCell('surface')), inBoth((mode) => ({ w: 238, pad: [10, 0, 10, 0], radius: 12, bg: layer01[mode], border: { width: 0, color: 'rgba(0, 0, 0, 0)' } })));
  assert.deepEqual(await both(menuCell('item')), inBoth((mode) => ({ h: 48, pad: [12, 8, 12, 6], radius: 24, font: { size: 17, lineHeight: 24 }, color: ink[mode] })));
  assert.deepEqual(await both(menuCell('danger')), { light: { font: { size: 17, lineHeight: 24 }, color: 'rgb(157, 6, 6)' }, dark: { font: { size: 17, lineHeight: 24 }, color: 'rgb(251, 153, 153)' } });
  assert.deepEqual(await both(menuCell('disabled')), { light: { color: 'rgba(0, 0, 0, 0.451)', opacity: 1 }, dark: { color: 'rgba(255, 255, 255, 0.451)', opacity: 1 } });
  assert.deepEqual(await both(menuCell('sectionTitle')), { light: { h: 32, pad: [4, 8, 8, 8], font: { size: 13, lineHeight: 20 }, color: 'rgba(0, 0, 0, 0.651)' }, dark: { h: 32, pad: [4, 8, 8, 8], font: { size: 13, lineHeight: 20 }, color: 'rgba(255, 255, 255, 0.651)' } });
  assert.deepEqual(await both(menuCell('separator')), inBoth((mode) => ({ h: 1, bg: subtle[mode] })));
});

test('a doc table cannot name a token, a step or a text style its Counterpart\'s doc does not', async () => {
  const core = await readCoreDoc(root, 'popover');
  assert.equal(docValue(core, 'Radius/radius-md').value, 12);
  assert.deepEqual(docValue(core, 'Layer/layer-01'), { kind: 'color', token: 'Layer/layer-01', ...layer01 });
  assert.throws(() => docValue(core, 'Text/text-negative'), /Core's Popover doc does not name Text\/text-negative/);
  assert.throws(() => docValue(core, 'Radius/radius-xl'), /Core's Popover doc does not name Radius\/radius-xl/);
  await assert.rejects(readCoreDoc(root, 'date-picker'), /no Counterpart/);
  assert.equal(docValue(await readCoreDoc(root, 'dropdown-menu'), 'Body/Body').lineHeight, 24);
});
