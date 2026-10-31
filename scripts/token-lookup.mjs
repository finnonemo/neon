#!/usr/bin/env node
// Names the theme/tokens/colors.json token for each hex, before calling a
// design color on- or off-token:
//   node scripts/token-lookup.mjs '#bccfd9' '#f5fb6b'
// Prints every exact match, or the nearest token and its RGB distance.
import { matchToken, paletteTokens } from './lib/colors.mjs';

const hexes = process.argv.slice(2);
if (!hexes.length || hexes.some(hex => !/^#[0-9a-f]{6}$/i.test(hex))) {
  console.error("Usage: node scripts/token-lookup.mjs '#rrggbb'...");
  process.exit(2);
}

const tokens = paletteTokens();
for (const hex of hexes) {
  const { exact, nearest } = matchToken(hex, tokens);
  console.log(exact
    ? `${hex}  ${exact.join(', ')}`
    : `${hex}  off-token; nearest ${nearest.name} ${nearest.value} (distance ${nearest.distance})`);
}
