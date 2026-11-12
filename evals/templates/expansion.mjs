// The expansion screen (layout=expansion, #164): each registry expansion item
// owns one module in expansion/, named after the item. A module exports
//   screens  CDS-match entries in measure.mjs's shape. name defaults to
//            'expansion-<item>' and query to 'layout=expansion'; give a second
//            entry (an overlay's open state) its own name.
//   a11y     optional: ({ test, expect, gotoExpansion, keyboardFocus }) => registers the item's
//            Neon behavior checks; gotoExpansion(page) opens the screen and
//            keyboardFocus(page, control) reports its keyboard focus indicator.
// Its fixtures are fixtures/expansion/<item>.tsx (CDS) and
// fixtures/neon/expansion/<item>.tsx (Neon). Adding an item adds files only.
// Modules import nothing from here: this file imports them.
import { readdirSync } from 'node:fs';

export const EXPANSION_QUERY = 'layout=expansion';
export const gotoExpansion = (page) => page.goto(`/?${EXPANSION_QUERY}`);

/** Waits until every transition and entry animation has ended. A spinner turns without end, so it is not waited for. */
export const settled = (page) => page.waitForFunction(() => document.getAnimations().every((animation) =>
  animation.playState !== 'running' || animation.effect?.getComputedTiming().iterations === Infinity));

/**
 * Reaches a control from the keyboard (Shift+Tab away, Tab back) and returns
 * the indicator it draws, before and after, and whether it matches
 * :focus-visible. The indicator is the outline and the box-shadow actually
 * drawn: an outline with style none or no width draws nothing.
 */
export async function keyboardFocus(page, control) {
  const indicator = () => control.evaluate((el) => {
    const style = getComputedStyle(el);
    const outline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0 ? `outline ${style.outlineWidth} ${style.outlineColor} ${style.outlineOffset}` : '';
    const shadow = style.boxShadow !== 'none' ? `shadow ${style.boxShadow}` : '';
    return { visible: el.matches(':focus-visible'), look: [outline, shadow].filter(Boolean).join(' | ') };
  });
  const before = await indicator();
  await control.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await settled(page);
  const after = await indicator();
  return { before: before.look, after: after.look, focusVisible: after.visible };
}

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
