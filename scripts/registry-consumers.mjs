#!/usr/bin/env node
// Lists the Neon registry items that read a theme token, before claiming which
// Neon base components a token change affects:
//   node scripts/registry-consumers.mjs bgPrimary fgInverse fontSize-headline
// Reads this checkout's registry/ source. A token is a theme.css property
// without its category (bgPrimary for --color-bgPrimary) or a whole property
// name. Follows shadcn's slots and the @theme utilities to the classes items
// use. For apps on frozen CDS, use cds-consumers.mjs.
import { fileURLToPath } from 'node:url';
import { findRegistryConsumers } from './lib/registry-consumers.mjs';

const tokens = process.argv.slice(2);
if (!tokens.length) {
  console.error('Usage: node scripts/registry-consumers.mjs <token>...');
  process.exit(2);
}

const matches = await findRegistryConsumers(fileURLToPath(new URL('../registry', import.meta.url)), tokens);
for (const { token, item, file, line, via, snippet } of matches) console.log(`${token}  @neon/${item}  ${file}:${line} (${via})\n    ${snippet}`);
if (matches.length) console.log(`\nItems: ${[...new Set(matches.map(m => `@neon/${m.item}`))].join(', ')}`);
else console.log(`No registry source names ${tokens.join(', ')}.`);
