#!/usr/bin/env node
// WCAG contrast of a text color on one or more backgrounds, such as every
// stop of a gradient:
//   node scripts/contrast.mjs '#ffffff' '#a3a3bd' '#01172b'
import { contrast } from './lib/colors.mjs';

const [text, ...backgrounds] = process.argv.slice(2);
if (!backgrounds.length || [text, ...backgrounds].some(hex => !/^#[0-9a-f]{6}$/i.test(hex))) {
  console.error("Usage: node scripts/contrast.mjs '#text' '#background'...");
  process.exit(2);
}

for (const background of backgrounds) {
  const ratio = contrast(text, background);
  console.log(`${text} on ${background}  ${ratio.toFixed(2)}:1  ${ratio >= 4.5 ? 'passes' : ratio >= 3 ? 'large text only' : 'fails'}`);
}
