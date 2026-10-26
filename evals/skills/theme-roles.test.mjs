import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { onColorLabel } from '../../theme/cds/color-overrides.ts';

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
const luminance = rgb => rgb.map(v => v / 255)
  .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
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
  // Open gaps in declared values.
  'light fgPositive on *': 'green text is 3.4–3.9:1',
  'light fgWarning on *': 'orange text is 2.8–3.2:1',
  'light label on bgPositive': 'white on green is 2.96:1',
  'dark fgPrimary on *': 'dark fgPrimary equals dark bgPrimary, rgb(65,81,96): 1.5–2.6:1 as text',
  'dark fgNegative on bgElevation1': 'red text on the card is 4.02:1',
  'dark fgNegative on bgAlternate': 'bgAlternate equals bgElevation1 in dark',
  'dark fgNegative on bgElevation2': 'red text on the popover is 2.92:1',
  'dark fgWarning on bgElevation2': 'orange text on the popover is 3.98:1',
  'dark label on bgNegative': 'white on red is 4.33:1',
  'dark bgSecondary on bgElevation1': 'bgSecondary, bgAlternate and bgElevation1 share rgb(26,26,26)',
  'dark bgAlternate on bgElevation1': 'bgSecondary, bgAlternate and bgElevation1 share rgb(26,26,26)',
  // Inheritance bugs: the dark blocks do not redeclare the role, so dark keeps the light value.
  'dark fg on bgPrimaryWash': 'bgPrimaryWash stays rgb(242,243,244): white text is 1.11:1',
  'dark label on bgPositive': 'bgPositive stays light green rgb(0,173,80): white is 2.96:1',
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
