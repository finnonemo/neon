// tabs → Core's Tabs (core/tabs.mjs), beside CDS Tabs: a selected, an unselected and a
// disabled tab, the selected tab's Line, the Track and the panel below. The selectors are
// ARIA state, which Radix and CDS both render. A tab's width and the distances between
// tabs are not Core's to give (they follow the label), so they stay on the CDS baseline.
import { tabCell } from '../core/tabs.mjs';

const at = '[data-measure=tabs-default]';
const tab = (state) => `${at} [role=tab]${state}`;
const same = (selector, check) => ({ cds: selector, neon: selector, check });
const active = tab('[aria-selected=true]');
const inactive = tab('[aria-selected=false]:not(:disabled)');
const disabled = tab(':disabled');

export const screens = [{
  targets: {
    tabList: same(`${at} [role=tablist]`, ['h', 'bg']),
    activeTab: { ...same(active, ['h', 'w', 'bg', 'opacity']), core: tabCell('tab', { Selected: true }) },
    activeLabel: { ...same(active, ['font', 'color']), core: tabCell('label', { Selected: true }) },
    inactiveTab: { ...same(inactive, ['h', 'w', 'bg', 'opacity']), core: tabCell('tab') },
    inactiveLabel: { ...same(inactive, ['font', 'color']), core: tabCell('label') },
    disabledTab: { ...same(disabled, ['h', 'w', 'opacity']), core: tabCell('tab', { State: 'Disabled' }) },
    disabledLabel: { ...same(disabled, ['font', 'color']), core: tabCell('label', { State: 'Disabled' }) },
    indicator: { cds: `${at} [data-testid=tabs-active-indicator]`, neon: `${at} [data-slot=tabs-indicator]`, check: ['h', 'w', 'bg'], core: tabCell('line', { Selected: true }) },
    // Core's own parts, which CDS has no element for.
    activeTabBox: { neon: active, check: ['pad'], core: tabCell('tab', { Selected: true }) },
    inactiveTabBox: { neon: inactive, check: ['pad'], core: tabCell('tab') },
    track: { neon: `${at} [data-slot=tabs-track]`, check: ['h', 'bg'], core: tabCell('track') },
    panelText: same(`${at} [role=tabpanel] p`, ['font', 'color']),
  },
  gaps: [
    ['activeTab', 'inactiveTab', 'x'],
    ['inactiveTab', 'disabledTab', 'x'],
    ['activeTab', 'indicator', 'y'],
    ['tabList', 'panelText', 'y'],
  ],
  extraTargets: {},
}];

// Radix's tabs keyboard model: one Tab stop, the selected tab; arrows, Home
// and End move along the enabled tabs (wrapping, skipping the disabled one)
// and select as they go, switching the panel. CDS only moves focus and
// selects on Enter; selecting on arrival is Radix's documented default and no
// less accessible. Keyboard focus is Core's 2px Focus/focus stroke inside the tab, an inset ring
// the selected tab's Line draws over.
export function a11y({ test, expect, gotoExpansion, keyboardFocus, focusColor }) {
  const tablist = (page) => page.getByRole('tablist', { name: 'บัญชี / Account' });
  const tabsOf = (page) => ['ภาพรวม', 'History', 'เอกสาร'].map((name) => tablist(page).getByRole('tab', { name }));
  const panel = (page) => page.locator('[data-measure=tabs-default]').getByRole('tabpanel');

  for (const mode of ['light', 'dark']) test(`${mode}: a tab reached from the keyboard draws Core's Focus stroke inside it`, async ({ page }) => {
    await gotoExpansion(page, mode);
    const [overview] = tabsOf(page);
    const focus = await keyboardFocus(page, overview);
    await expect(overview).toBeFocused();
    expect(focus.focusVisible).toBe(true);
    const ring = `${await focusColor(page)} 0px 0px 0px 2px inset`;
    expect(focus.before).not.toContain(ring);
    expect(focus.after).toContain(ring);
  });

  test('arrows, Home and End move the selection along the enabled tabs and switch the panel', async ({ page }) => {
    await gotoExpansion(page);
    const [overview, history, documents] = tabsOf(page);
    await expect(overview).toHaveAttribute('aria-selected', 'true');
    await expect(documents).toBeDisabled();
    await expect(panel(page)).toHaveText('ยอดคงเหลือและรายการล่าสุด / Balance and recent activity');
    await overview.focus();
    await page.keyboard.press('ArrowRight');
    await expect(history).toBeFocused();
    await expect(history).toHaveAttribute('aria-selected', 'true');
    await expect(overview).toHaveAttribute('aria-selected', 'false');
    await expect(panel(page)).toHaveText('รายการย้อนหลัง 30 วัน / The last 30 days');
    await expect(panel(page)).toHaveAttribute('aria-labelledby', await history.getAttribute('id'));
    await page.keyboard.press('ArrowRight');
    await expect(overview, 'focus skips the disabled tab and wraps round').toBeFocused();
    await expect(overview).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('End');
    await expect(history, 'End lands on the last enabled tab').toBeFocused();
    await expect(history).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Home');
    await expect(overview).toBeFocused();
    await expect(overview).toHaveAttribute('aria-selected', 'true');
    await expect(panel(page)).toHaveText('ยอดคงเหลือและรายการล่าสุด / Balance and recent activity');
  });

  test('Tab enters the tab list on the selected tab only', async ({ page }) => {
    await gotoExpansion(page);
    const [overview, history] = tabsOf(page);
    await overview.focus();
    await page.keyboard.press('ArrowRight');
    await expect(history).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Shift+Tab');
    await expect(history).not.toBeFocused();
    await page.keyboard.press('Tab');
    await expect(history, 'Tab returns to the selected tab, not the first').toBeFocused();
    await page.keyboard.press('Tab');
    await expect(overview, 'the next Tab leaves the tab list').not.toBeFocused();
    await expect(panel(page)).toBeFocused();
  });
}
