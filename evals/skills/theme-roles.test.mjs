import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { onColorLabel } from '../../theme/cds/color-overrides.ts';
import { contrast } from '../../scripts/lib/colors.mjs';

// theme/css/theme.css declares light colors in :root and dark colors twice:
// under prefers-color-scheme and under [data-theme='dark']. Dark inherits every
// role it does not redeclare from :root.
const css = readFileSync(new URL('../../theme/css/theme.css', import.meta.url), 'utf8');
const declarations = block => Object.fromEntries([...block.matchAll(/--color-(\w+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]));
const osDark = css.slice(css.indexOf('@media (prefers-color-scheme: dark)'), css.indexOf(":root[data-theme='dark']"));
const manualDark = css.slice(css.indexOf(":root[data-theme='dark']"));
const light = declarations(css.slice(css.indexOf(':root {'), css.indexOf('@media (prefers-color-scheme: dark)')));
const modes = { light, dark: { ...light, ...declarations(manualDark) } };

const channels = value => {
  const [r, g, b, a = 1] = value.match(/[\d.]+/g).map(Number);
  return { rgb: [r, g, b], a };
};
const over = (value, under) => {
  const { rgb, a } = channels(value);
  return rgb.map((v, i) => v * a + under[i] * (1 - a));
};
// Translucent values sit on the mode's page background.
const surfaceOf = (colors, role) => over(colors[role], over(colors.bg, [255, 255, 255]));
const textOn = (colors, text, surface) => contrast(over(colors[text], surfaceOf(colors, surface)), surfaceOf(colors, surface));

// Pairs CDS draws in @coinbase/cds-web@9.26.1 (node scripts/cds-consumers.mjs):
// status and helper text (CellDetail, InputIcon, SelectStack) in every text
// role on the page, card and popover; Cell and SegmentedControl on bgAlternate;
// Chip on bgSecondary; UpsellCard and the checked SegmentedControl label on
// bgPrimaryWash. Button fills carry the onColorLabel role in each mode.
const textPairs = [
  ...['fg', 'fgMuted', 'fgPrimary', 'fgNegative', 'fgPositive', 'fgWarning']
    .flatMap(text => ['bg', 'bgElevation1', 'bgElevation2', 'bgAlternate'].map(surface => [text, surface])),
  ['fg', 'bgSecondary'],
  ['fg', 'bgPrimaryWash'],
  ['fgPrimary', 'bgPrimaryWash'],
];
const labelFills = ['bgPrimary', 'bgNegative', 'bgPositive'];
// Fills that must read as a different surface from what they sit on.
const nestedSurfaces = [
  ['bgSecondary', 'bg'], ['bgSecondary', 'bgElevation1'],
  ['bgAlternate', 'bg'], ['bgAlternate', 'bgElevation1'],
  ['bgPrimaryWash', 'bg'],
];
const minimumText = 4.5;
const minimumSurface = 1.1;

// Every known failure, as `mode text on surface`. An entry the theme no longer
// fails also fails the test, so a fix removes its entry here.
const known = {
  // Open gaps in Core's Theme, for Core to answer.
  'light fgWarning on *': 'Support/support-warning (Orange/115) as text is 3.7–4.2:1; Core has no warning text token',
  'light label on bgPositive': 'white on Support/support-success (Green/135) is 3.85:1',
  'dark label on bgPositive': 'white on Support/support-success (Green/115) is 2.32:1',
  'dark bgSecondary on bgElevation1': 'Background/background-secondary and Layer/layer-01 are both Grey/90',
  'dark bgAlternate on bgElevation1': 'Background/background-secondary and Layer/layer-01 are both Grey/90',
};

function failures() {
  const found = [];
  for (const [mode, colors] of Object.entries(modes)) {
    for (const [text, surface] of textPairs) {
      const ratio = textOn(colors, text, surface);
      if (ratio < minimumText) found.push({ key: `${mode} ${text} on ${surface}`, ratio });
    }
    for (const fill of labelFills) {
      const ratio = textOn(colors, onColorLabel[mode], fill);
      if (ratio < minimumText) found.push({ key: `${mode} label on ${fill}`, ratio });
    }
    for (const [fill, surface] of nestedSurfaces) {
      const ratio = contrast(surfaceOf(colors, fill), surfaceOf(colors, surface));
      if (ratio < minimumSurface) found.push({ key: `${mode} ${fill} on ${surface}`, ratio });
    }
  }
  return found;
}

const explains = (entry, key) => entry === key || (entry.endsWith(' on *') && key.startsWith(entry.slice(0, -1)));
const matchedEntry = key => (key in known ? key : Object.keys(known).find(entry => explains(entry, key)));

test('both dark blocks declare the same colors', () => {
  assert.deepEqual(declarations(osDark), declarations(manualDark));
});

test('theme roles reach text contrast and surface separation in both modes', () => {
  const found = failures();
  const unexplained = found.filter(({ key }) => !matchedEntry(key)).map(({ key, ratio }) => `${key}: ${ratio.toFixed(2)}`);
  assert.deepEqual(unexplained, [], 'new failures; fix theme.css or add a reasoned entry to `known`');
  const stale = Object.keys(known).filter(entry => !found.some(({ key }) => matchedEntry(key) === entry));
  assert.deepEqual(stale, [], 'known entries the theme no longer fails; remove them');
});
