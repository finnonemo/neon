// tabs → CDS Tabs (DefaultTab, DefaultTabsActiveIndicator): an active, an
// inactive and a disabled tab, the active tab's underline and the panel below.
// The selectors are ARIA state, which Radix and CDS both render; CDS sets the
// label in an h2 inside each tab, Neon in the trigger itself.
const at = '[data-measure=tabs-default]';
const tab = (state) => `${at} [role=tab]${state}`;
const same = (selector, check) => ({ cds: selector, neon: selector, check });
const active = tab('[aria-selected=true]');
const inactive = tab('[aria-selected=false]:not(:disabled)');
const disabled = tab(':disabled');

export const screens = [{
  targets: {
    tabList: same(`${at} [role=tablist]`, ['h', 'bg']),
    activeTab: same(active, ['h', 'w', 'bg', 'opacity']),
    activeLabel: same(active, ['font', 'color']),
    inactiveTab: same(inactive, ['h', 'w', 'bg', 'opacity']),
    inactiveLabel: same(inactive, ['font', 'color']),
    disabledTab: same(disabled, ['h', 'w', 'opacity']),
    disabledLabel: same(disabled, ['font', 'color']),
    indicator: { cds: `${at} [data-testid=tabs-active-indicator]`, neon: `${at} [data-slot=tabs-indicator]`, check: ['h', 'w', 'bg'] },
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
// less accessible. PROVISIONAL (#134): the focus ring is Neon's, so it is
// checked for being shown rather than measured.
export function a11y({ test, expect, gotoExpansion, keyboardFocus }) {
  const tablist = (page) => page.getByRole('tablist', { name: 'บัญชี / Account' });
  const tabsOf = (page) => ['ภาพรวม', 'History', 'เอกสาร'].map((name) => tablist(page).getByRole('tab', { name }));
  const panel = (page) => page.locator('[data-measure=tabs-default]').getByRole('tabpanel');

  test('a tab reached from the keyboard shows a focus indicator', async ({ page }) => {
    await gotoExpansion(page);
    const [overview] = tabsOf(page);
    const focus = await keyboardFocus(page, overview);
    await expect(overview).toBeFocused();
    expect(focus.focusVisible).toBe(true);
    expect(focus.after, 'the focused tab draws an indicator').not.toBe('');
    expect(focus.after, 'the focused tab looks different').not.toBe(focus.before);
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
