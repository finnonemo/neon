// The display items' property tables against Core's documented values, from
// core/components/<name>.md at the pinned commit. Each expected value is the doc's, never read
// back through the table.
import test from 'node:test';
import assert from 'node:assert/strict';
import { coreBaseline } from '../templates/core-baseline.mjs';
import { dividerCell } from '../templates/core/divider.mjs';
import { progressCell } from '../templates/core/progress-bar.mjs';
import { spinnerCell } from '../templates/core/progress-circle.mjs';
import { tagCell } from '../templates/core/display-tag.mjs';
import { avatarCell } from '../templates/core/avatar.mjs';
import { listCell } from '../templates/core/list-item.mjs';
import { tableCell } from '../templates/core/table.mjs';
import { tabCell } from '../templates/core/tabs.mjs';
import { accordionCell } from '../templates/core/accordion.mjs';
import { paginationCell } from '../templates/core/pagination.mjs';

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

// Display tag: Small 24 (pad 2 · 6, radius 4, Footnote), Medium 32 (4 · 8, radius 8, Subheadline), Large 40 (8 · 8, radius 8, Body);
// Secondary is a tinted fill with its ink and no stroke.
test('a tag is Core\'s Display tag in Secondary: 24, 32 and 40px by Size, with no stroke', async () => {
  const sizes = [
    ['Small', { h: 24, pad: [2, 6, 2, 6], radius: 4, font: { size: 13, lineHeight: 20, weight: 400 } }],
    ['Medium', { h: 32, pad: [4, 8, 4, 8], radius: 8, font: { size: 15, lineHeight: 24, weight: 400 } }],
    ['Large', { h: 40, pad: [8, 8, 8, 8], radius: 8, font: { size: 17, lineHeight: 24, weight: 400 } }],
  ];
  for (const [Size, box] of sizes) {
    assert.deepEqual(await coreBaseline(tagCell({ Size }), 'light', ['h', 'pad', 'radius', 'font', 'border', 'opacity']), { ...box, border: { width: 0, color: NONE }, opacity: 1 }, Size);
  }
});

test('each tag variant takes its Color\'s Secondary fill and ink in both modes', async () => {
  const colors = async (Color) => both(tagCell({ Color }), ['bg', 'color']);
  assert.deepEqual(await colors('Navy'), {
    light: { bg: 'rgb(242, 243, 244)', color: 'rgb(0, 9, 17)' },
    dark: { bg: 'rgba(166, 191, 204, 0.122)', color: 'rgb(192, 197, 202)' },
  });
  assert.deepEqual(await colors('Green'), {
    light: { bg: 'rgb(242, 254, 248)', color: 'rgb(0, 116, 53)' },
    dark: { bg: 'rgba(0, 231, 107, 0.122)', color: 'rgb(0, 208, 96)' },
  });
  assert.deepEqual(await colors('Orange'), {
    light: { bg: 'rgb(254, 247, 243)', color: 'rgb(174, 69, 10)' },
    dark: { bg: 'rgba(242, 100, 20, 0.122)', color: 'rgb(245, 139, 79)' },
  });
  assert.deepEqual(await colors('Red'), {
    light: { bg: 'rgb(255, 245, 245)', color: 'rgb(186, 7, 7)' },
    dark: { bg: 'rgba(247, 50, 50, 0.122)', color: 'rgb(249, 112, 112)' },
  });
});

test('a tag has no cell for a Color or a Size the Neon tag has no value for', () => {
  assert.throws(() => tagCell({ Color: 'Purple' }), /no variant/);
  assert.throws(() => tagCell({ Size: 'XSmall' }), /no size/);
});

// Avatar: Small 36 with Headline (Medium weight), Medium 48 with Title 3 Strong; Avatar/background under Text/text-on-color.
// Strong has no Neon type role, so the table states no weight for it.
test('an avatar is Core\'s round Avatar: 36 with a Headline initial, 48 with a Title 3 one', async () => {
  const fill = 'rgb(93, 93, 238)';
  const ink = 'rgb(255, 255, 255)';
  assert.deepEqual(await both(avatarCell('circle')), { light: { h: 36, w: 36, radius: 18, bg: fill }, dark: { h: 36, w: 36, radius: 18, bg: fill } });
  assert.deepEqual(await both(avatarCell('circle', { Size: 'Medium' })), { light: { h: 48, w: 48, radius: 24, bg: fill }, dark: { h: 48, w: 48, radius: 24, bg: fill } });
  assert.deepEqual(await coreBaseline(avatarCell('label'), 'light'), { font: { size: 17, lineHeight: 24, weight: 500 }, color: ink });
  assert.deepEqual(await coreBaseline(avatarCell('label', { Size: 'Medium' }), 'dark'), { font: { size: 20, lineHeight: 28 }, color: ink });
  assert.throws(() => avatarCell('circle', { Size: 'Large' }), /no size/);
});

// List item: the row min 48, padding 0 · 8, radius 12, Layer/layer-01, stroke 2 inside (Transparent, Focus/focus on Focus);
// Label + Subtitle padding 14 · 0; two lines 72; Title Headline, Subtitle Footnote in Text/text-secondary.
test('a list row is Core\'s List item: a 72px two-line row with 12px corners on Layer/layer-01', async () => {
  const box = { h: 72, pad: [0, 8, 0, 8], radius: 12 };
  assert.deepEqual(await both(listCell('row')), {
    light: { ...box, bg: 'rgb(255, 255, 255)', border: { width: 2, color: 'rgba(255, 255, 255, 0)' } },
    dark: { ...box, bg: 'rgb(26, 26, 26)', border: { width: 2, color: 'rgba(255, 255, 255, 0)' } },
  });
  assert.deepEqual(await coreBaseline(listCell('text'), 'light'), { pad: [14, 0, 14, 0] });
  assert.deepEqual(await both(listCell('title')), {
    light: { font: { size: 17, lineHeight: 24, weight: 500 }, color: 'rgba(0, 0, 0, 0.851)' },
    dark: { font: { size: 17, lineHeight: 24, weight: 500 }, color: 'rgb(255, 255, 255)' },
  });
  assert.deepEqual(await both(listCell('subtitle')), {
    light: { font: { size: 13, lineHeight: 20, weight: 400 }, color: 'rgba(0, 0, 0, 0.651)' },
    dark: { font: { size: 13, lineHeight: 20, weight: 400 }, color: 'rgba(255, 255, 255, 0.651)' },
  });
});

test('a list row\'s states: Active fills it, Focus strokes it, Disabled greys its text, and its Checkmark is the link color', async () => {
  assert.deepEqual(await both(listCell('row', { State: 'Active' }), ['bg']), { light: { bg: 'rgba(1, 23, 43, 0.078)' }, dark: { bg: 'rgba(255, 255, 255, 0.122)' } });
  assert.deepEqual(await both(listCell('row', { State: 'Focus' }), ['border']), {
    light: { border: { width: 2, color: 'rgb(105, 104, 239)' } },
    dark: { border: { width: 2, color: 'rgb(128, 127, 242)' } },
  });
  for (const part of ['title', 'subtitle']) {
    assert.deepEqual(await both(listCell(part, { State: 'Disabled' }), ['color']), { light: { color: 'rgba(0, 0, 0, 0.451)' }, dark: { color: 'rgba(255, 255, 255, 0.451)' } }, part);
  }
  assert.deepEqual(await both(listCell('checkmark')), { light: { color: 'rgb(24, 23, 231)' }, dark: { color: 'rgb(140, 139, 243)' } });
});

// Table: cells min 56, padding 14 · 8; header Label Footnote Strong in Text/text-secondary on the Header row's Layer/layer-02;
// body Label Body in Text/text-primary.
test('a table is Core\'s Table at Medium: 56px rows, cells padded 14 and 8, a Footnote Strong header on Layer/layer-02', async () => {
  const cell = { h: 56, pad: [14, 8, 14, 8] };
  assert.deepEqual(await both(tableCell('headerCell')), {
    light: { ...cell, bg: 'rgb(242, 243, 244)', font: { size: 13, lineHeight: 20, weight: 600 }, color: 'rgba(0, 0, 0, 0.651)' },
    dark: { ...cell, bg: 'rgb(38, 38, 38)', font: { size: 13, lineHeight: 20, weight: 600 }, color: 'rgba(255, 255, 255, 0.651)' },
  });
  assert.deepEqual(await both(tableCell('bodyCell')), {
    light: { ...cell, font: { size: 17, lineHeight: 24, weight: 400 }, color: 'rgba(0, 0, 0, 0.851)' },
    dark: { ...cell, font: { size: 17, lineHeight: 24, weight: 400 }, color: 'rgb(255, 255, 255)' },
  });
  assert.deepEqual(await coreBaseline(tableCell('bodyRow'), 'light'), { h: 56 });
  // Type=Button and Type=Input cells: padding 4 · 8.
  assert.deepEqual(await coreBaseline(tableCell('controlCell'), 'light'), { h: 56, pad: [4, 8, 4, 8] });
  assert.throws(() => tableCell('footer'), /no measured part/);
});

// Tabs: _Tab min 48 × 48, Content padding 12 · 16, stroke 2 inside; Label Body/Subheadline (15 / 24) Regular,
// Text/text-secondary, Text/text-primary when selected; Line 2 tall in Border/border-strong; Track 1 tall in Border/border-subtle.
test('a tab is Core\'s _Tab: 48px, padded 12 and 16, a Subheadline label, a 2px Line when selected over a 1px Track', async () => {
  const tab = { h: 48, pad: [12, 16, 12, 16], bg: 'rgba(255, 255, 255, 0)', border: { width: 2, color: 'rgba(255, 255, 255, 0)' }, opacity: 1 };
  assert.deepEqual(await both(tabCell('tab')), { light: tab, dark: tab });
  const font = { size: 15, lineHeight: 24, weight: 400 };
  assert.deepEqual(await both(tabCell('label')), { light: { font, color: 'rgba(0, 0, 0, 0.651)' }, dark: { font, color: 'rgba(255, 255, 255, 0.651)' } });
  assert.deepEqual(await both(tabCell('label', { Selected: true })), { light: { font, color: 'rgba(0, 0, 0, 0.851)' }, dark: { font, color: 'rgb(255, 255, 255)' } });
  assert.deepEqual(await both(tabCell('line', { Selected: true })), { light: { h: 2, bg: 'rgb(1, 23, 43)' }, dark: { h: 2, bg: 'rgb(255, 255, 255)' } });
  assert.deepEqual(await both(tabCell('line')), { light: { h: 2, bg: 'rgba(255, 255, 255, 0)' }, dark: { h: 2, bg: 'rgba(255, 255, 255, 0)' } });
  assert.deepEqual(await both(tabCell('track')), { light: { h: 1, bg: 'rgba(0, 0, 0, 0.122)' }, dark: { h: 1, bg: 'rgba(255, 255, 255, 0.18)' } });
});

test('a tab\'s states: Active fills it, Focus strokes it, Disabled greys its label', async () => {
  assert.deepEqual(await both(tabCell('tab', { State: 'Active' }), ['bg']), { light: { bg: 'rgba(1, 23, 43, 0.078)' }, dark: { bg: 'rgba(255, 255, 255, 0.122)' } });
  assert.deepEqual(await both(tabCell('tab', { Selected: true, State: 'Focus' }), ['border']), {
    light: { border: { width: 2, color: 'rgb(105, 104, 239)' } },
    dark: { border: { width: 2, color: 'rgb(128, 127, 242)' } },
  });
  assert.deepEqual(await both(tabCell('label', { State: 'Disabled' }), ['color']), { light: { color: 'rgba(0, 0, 0, 0.451)' }, dark: { color: 'rgba(255, 255, 255, 0.451)' } });
  assert.throws(() => tabCell('tab', { State: 'Skeleton' }), /no Skeleton state/);
});

// Accordion header: row padding 0 · 8, radius 12, Layer/layer-01, stroke 2 inside; Label block padding 14, Medium 56 tall;
// Label Headings/Headline in Text/text-primary; chevron in a 24 × 24 box in Icon/icon-secondary.
test('an accordion header is Core\'s _Accordion header at Medium: 56px on Layer/layer-01, a Headline title and a 24px chevron box', async () => {
  const box = { h: 56, pad: [14, 8, 14, 8], radius: 12, border: { width: 2, color: 'rgba(255, 255, 255, 0)' } };
  for (const Expanded of [false, true]) {
    assert.deepEqual(await both(accordionCell('header', { Expanded })), { light: { ...box, bg: 'rgb(255, 255, 255)' }, dark: { ...box, bg: 'rgb(26, 26, 26)' } });
  }
  const font = { size: 17, lineHeight: 24, weight: 500 };
  assert.deepEqual(await both(accordionCell('title')), { light: { font, color: 'rgba(0, 0, 0, 0.851)' }, dark: { font, color: 'rgb(255, 255, 255)' } });
  assert.deepEqual(await both(accordionCell('chevron')), { light: { h: 24, w: 24, color: 'rgba(0, 0, 0, 0.651)' }, dark: { h: 24, w: 24, color: 'rgba(255, 255, 255, 0.651)' } });
});

test('an accordion header\'s states: Active fills it, Focus strokes it, Disabled greys its title and chevron', async () => {
  assert.deepEqual(await both(accordionCell('header', { State: 'Active' }), ['bg']), { light: { bg: 'rgba(1, 23, 43, 0.078)' }, dark: { bg: 'rgba(255, 255, 255, 0.122)' } });
  assert.deepEqual(await both(accordionCell('header', { State: 'Focus' }), ['border']), {
    light: { border: { width: 2, color: 'rgb(105, 104, 239)' } },
    dark: { border: { width: 2, color: 'rgb(128, 127, 242)' } },
  });
  for (const part of ['title', 'chevron']) {
    assert.deepEqual(await both(accordionCell(part, { State: 'Disabled' }), ['color']), { light: { color: 'rgba(0, 0, 0, 0.451)' }, dark: { color: 'rgba(255, 255, 255, 0.451)' } }, part);
  }
  assert.throws(() => accordionCell('header', { State: 'Skeleton' }), /no Skeleton state/);
});

// Pagination: bar min height 56, padding 16 at the sides, Layer/layer-01; a page item's Container 36 × 36, radius 8,
// Text/text-primary; Selected is Background/background-inverse with Text/text-inverse.
test('pagination is Core\'s Numbered bar at Medium: 56px on Layer/layer-01, each page a 36px box with 8px corners', async () => {
  const bar = { h: 56, pad: [0, 16, 0, 16] };
  assert.deepEqual(await both(paginationCell('bar')), { light: { ...bar, bg: 'rgb(255, 255, 255)' }, dark: { ...bar, bg: 'rgb(26, 26, 26)' } });
  const box = { h: 36, w: 36, pad: [0, 0, 0, 0], radius: 8 };
  assert.deepEqual(await both(paginationCell('page')), {
    light: { ...box, bg: 'rgba(255, 255, 255, 0)', color: 'rgba(0, 0, 0, 0.851)' },
    dark: { ...box, bg: 'rgba(255, 255, 255, 0)', color: 'rgb(255, 255, 255)' },
  });
  assert.deepEqual(await both(paginationCell('page', { Selected: true })), {
    light: { ...box, bg: 'rgb(0, 0, 0)', color: 'rgb(255, 255, 255)' },
    dark: { ...box, bg: 'rgb(255, 255, 255)', color: 'rgba(0, 0, 0, 0.851)' },
  });
  assert.deepEqual(await both(paginationCell('ellipsis')), { light: { color: 'rgba(0, 0, 0, 0.851)' }, dark: { color: 'rgb(255, 255, 255)' } });
});

test('a page\'s states: Hover and Pressed fill it, Disabled greys its number, and a disabled selected page keeps a fill', async () => {
  assert.deepEqual(await both(paginationCell('page', { State: 'Hover' }), ['bg']), { light: { bg: 'rgba(1, 23, 43, 0.051)' }, dark: { bg: 'rgba(255, 255, 255, 0.078)' } });
  assert.deepEqual(await both(paginationCell('page', { State: 'Pressed' }), ['bg']), { light: { bg: 'rgba(1, 23, 43, 0.078)' }, dark: { bg: 'rgba(255, 255, 255, 0.122)' } });
  assert.deepEqual(await both(paginationCell('page', { State: 'Disabled' }), ['bg', 'color']), {
    light: { bg: 'rgba(255, 255, 255, 0)', color: 'rgba(0, 0, 0, 0.451)' },
    dark: { bg: 'rgba(255, 255, 255, 0)', color: 'rgba(255, 255, 255, 0.451)' },
  });
  assert.deepEqual(await both(paginationCell('page', { Selected: true, State: 'Disabled' }), ['bg']), { light: { bg: 'rgba(1, 23, 43, 0.078)' }, dark: { bg: 'rgba(255, 255, 255, 0.122)' } });
  assert.throws(() => paginationCell('page', { State: 'Skeleton' }), /no Skeleton state/);
});
