// The expansion screen (layout=expansion, #164): each registry expansion item
// owns one module in expansion/, named after the item. A module exports
//   screens  CDS-match entries in measure.mjs's shape. name defaults to
//            'expansion-<item>' and query to 'layout=expansion'; give a second
//            entry (an overlay's open state) its own name.
//   a11y     optional: ({ test, expect, gotoExpansion }) => registers the item's
//            Neon behavior checks; gotoExpansion(page) opens the screen.
// Its fixtures are fixtures/expansion/<item>.tsx (CDS) and
// fixtures/neon/expansion/<item>.tsx (Neon). Adding an item adds files only.
// Modules import nothing from here: this file imports them.
import { readdirSync } from 'node:fs';

export const EXPANSION_QUERY = 'layout=expansion';
export const gotoExpansion = (page) => page.goto(`/?${EXPANSION_QUERY}`);

const dir = new URL('./expansion/', import.meta.url);

/** An item's module with its screens' defaults filled in; one without a screen is an error, never skipped. */
export function expansionItem(name, module) {
  if (!module.screens?.length) throw new Error(`evals/templates/expansion/${name}.mjs exports no screens; measure the item against its Counterpart.`);
  return { ...module, name, screens: module.screens.map((screen) => ({ name: `expansion-${name}`, query: EXPANSION_QUERY, ...screen })) };
}

export const expansionItems = await Promise.all(readdirSync(dir).filter((file) => file.endsWith('.mjs')).sort().map(async (file) => {
  const name = file.slice(0, -'.mjs'.length);
  return expansionItem(name, await import(new URL(file, dir).href));
}));
