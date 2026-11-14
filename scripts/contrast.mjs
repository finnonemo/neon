#!/usr/bin/env node
// WCAG contrast of a text color on one or more backgrounds, such as every
// stop of a gradient:
//   node scripts/contrast.mjs '#ffffff' '#a3a3bd' '#01172b'
// Each color is a hex value or a color role of the CSS adapter, theme/css/theme.css.
// With a role among them the ratio is given in light and in dark:
//   node scripts/contrast.mjs fgPositive bg bgSecondary bgPositiveWash
// A background that is not opaque is drawn over the mode's bg, and text that
// is not opaque over its background.
import { readFile } from 'node:fs/promises';
import { contrast, roleContrast } from './lib/colors.mjs';
import { adapterColors, ADAPTER } from './lib/core-theme.mjs';

const [text, ...backgrounds] = process.argv.slice(2);
if (!backgrounds.length) {
  console.error("Usage: node scripts/contrast.mjs <text> <background>...\nEach is a hex value ('#01172b') or a color role of theme/css/theme.css (fgPositive).");
  process.exit(2);
}
const verdict = ratio => `${ratio.toFixed(2)}:1  ${ratio >= 4.5 ? 'passes' : ratio >= 3 ? 'large text only' : 'fails'}`;

if ([text, ...backgrounds].every(hex => /^#[0-9a-f]{6}$/i.test(hex))) {
  for (const background of backgrounds) console.log(`${text} on ${background}  ${verdict(contrast(text, background))}`);
} else {
  try {
    const colors = adapterColors(await readFile(new URL(`../${ADAPTER}`, import.meta.url), 'utf8'));
    const named = ({ name, value }) => (name === value ? name : `${name} ${value}`);
    for (const row of roleContrast({ text, backgrounds, colors })) {
      console.log(`${row.mode.padEnd(5)}  ${named(row.text)} on ${named(row.background)}${row.over ? ` over ${row.over}` : ''}  ${verdict(row.ratio)}`);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
