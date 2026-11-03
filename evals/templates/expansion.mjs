// The expansion screen (layout=expansion, #164): each registry expansion item
// owns one module in expansion/, named after the item. A module exports
//   screens  CDS-match entries in measure.mjs's shape, with query 'layout=expansion'
//   a11y     optional: ({ test, expect }) => registers the item's Neon behavior checks
// Its fixtures are fixtures/expansion/<item>.tsx (CDS) and
// fixtures/neon/expansion/<item>.tsx (Neon). Adding an item adds files only.
import { readdirSync } from 'node:fs';

const dir = new URL('./expansion/', import.meta.url);
export const expansionItems = await Promise.all(readdirSync(dir).filter((file) => file.endsWith('.mjs')).sort().map(async (file) =>
  ({ name: file.slice(0, -'.mjs'.length), ...await import(new URL(file, dir).href) })));
