#!/usr/bin/env node
// Prints the Neon-vs-Uber-Base token table used in
// skill-and-theming-ideas.md.
// Neon values are read from this checkout; Base Web values are fixed here,
// each with its file:line in uber/baseweb at commit
// ed21081e33f7db2770922b4e04d16dcf5bbdfa85.
// Run from the repository root: node research/neon-vs-base-tokens.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lines = (rel) => readFileSync(join(root, rel), 'utf8').split('\n');

const themeFile = 'theme/css/theme.css';
const theme = lines(themeFile);
// First declaration wins: the light `:root` block comes first in theme.css.
function cssVar(name) {
  const i = theme.findIndex((l) => l.trim().startsWith(`--${name}:`));
  if (i < 0) return { value: 'not found', at: themeFile };
  return { value: theme[i].split(':').slice(1).join(':').replace(';', '').trim(), at: `${themeFile}:${i + 1}` };
}
function classIn(rel, pattern) {
  const ls = lines(rel);
  for (let i = 0; i < ls.length; i++) {
    const m = ls[i].match(pattern);
    if (m) return { value: m[0], at: `${rel}:${i + 1}` };
  }
  return { value: 'not found', at: rel };
}
const join2 = (...xs) => ({ value: xs.map((x) => x.value).join(' / '), at: xs.map((x) => x.at).join(', ') });

const button = 'registry/ui/button.tsx';
const rows = [
  ['Text (ink)', cssVar('color-fg'), '#000000 (contentPrimary = primaryA)', 'src/themes/light-theme/color-semantic-tokens.ts:32, color-foundation-tokens.ts:13'],
  ['Secondary text', cssVar('color-fgMuted'), '#4B4B4B (contentSecondary = gray800)', 'src/themes/light-theme/color-semantic-tokens.ts:33, src/tokens/color-primitive-tokens.ts:20'],
  ['Page', cssVar('color-bg'), '#FFFFFF (backgroundPrimary = primaryB)', 'src/themes/light-theme/color-semantic-tokens.ts:25'],
  ['Quiet surface', cssVar('color-bgAlternate'), '#F3F3F3 (backgroundSecondary = gray50)', 'src/themes/light-theme/color-semantic-tokens.ts:26, src/tokens/color-primitive-tokens.ts:12'],
  ['Primary action fill', cssVar('color-bgPrimary'), '#000000 (buttonPrimaryFill = backgroundInversePrimary)', 'src/themes/light-theme/color-component-tokens.ts:32'],
  ['Secondary action fill', cssVar('color-bgSecondary'), '#F3F3F3 (buttonSecondaryFill = backgroundSecondary)', 'src/themes/light-theme/color-component-tokens.ts:44'],
  ['Hairline', cssVar('color-bgLine'), 'black at 0.08 (borderTransparent); border200 = 1px black 0.08', 'src/themes/light-theme/color-semantic-tokens.ts:41, src/themes/shared/borders.ts:12-41'],
  ['Focus / accent', cssVar('color-bgLinePrimary'), '#276EF1 (accent = blue600)', 'src/themes/light-theme/color-foundation-tokens.ts:25, src/tokens/color-primitive-tokens.ts:126'],
  ['Field fill', cssVar('color-bgField'), '#F3F3F3 (inputFill = backgroundSecondary), border the same gray', 'src/themes/light-theme/color-component-tokens.ts:222-224'],
  ['Button radius', classIn(button, /rounded-full/), '8px default (buttonBorderRadius); 999px only for shape pill/rounded', 'src/themes/shared/borders.ts:51, src/button/styled-components.ts:308-315'],
  ['Button heights', join2(classIn(button, /default: "h-\d+/), classIn(button, /md: "h-\d+/), classIn(button, /sm: "h-\d+/), classIn(button, /xs: "h-\d+/)), '56 / 48 / 36 / 28px (large / default / small / xSmall)', 'src/button/styled-components.ts:887-908'],
  ['Input', classIn('registry/ui/input.tsx', /h-\d+ w-full min-w-0 rounded-\w+ bg-field/), '8px radius (inputBorderRadius), filled', 'src/themes/shared/borders.ts:56'],
  ['Card / surface', join2(classIn('registry/ui/card.tsx', /rounded-\(--borderRadius-\d+\) border/), cssVar('borderRadius-500')), '0px (surfaceBorderRadius: Card, Modal, Toast)', 'src/themes/shared/borders.ts:60'],
  ['Largest title', join2(cssVar('fontSize-title1'), cssVar('lineHeight-title1'), cssVar('fontWeight-title1')), 'Heading XXLarge 40px / 52px / 700; Heading Large 32 / 40 / 700', 'src/themes/shared/typography.ts:64-98'],
  ['Body', join2(cssVar('fontSize-body'), cssVar('lineHeight-body'), cssVar('fontWeight-body')), 'Paragraph Medium 16px / 24px / normal', 'src/themes/shared/typography.ts:16-56'],
  ['Label', join2(cssVar('fontSize-label1'), cssVar('fontWeight-label1')), 'Label Medium 16px / 500', 'src/themes/shared/typography.ts:46-50, 151'],
];

console.log('| Role | Neon value | Neon source | Base Web value | Base Web source |');
console.log('| --- | --- | --- | --- | --- |');
for (const [role, neon, base, baseAt] of rows) {
  console.log(`| ${role} | \`${neon.value}\` | \`${neon.at}\` | ${base} | \`${baseAt}\` |`);
}
