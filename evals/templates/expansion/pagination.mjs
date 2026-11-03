// pagination → CDS Pagination: 40px circular page buttons 4px apart, the
// current page filled primary and the rest transparent, a two-digit page
// padded like a small button, a muted headline ellipsis, and icon-only
// previous and next buttons, previous disabled on the first page.
const nav = '[data-measure=pagination]';
const neonItem = (n) => `${nav} [data-slot=pagination-item]:nth-child(${n}) > *`;
const page = ['h', 'w', 'radius', 'border', 'bg', 'color', 'font', 'pad'];
const control = ['h', 'w', 'radius', 'bg', 'opacity'];

export const screens = [
  {
    targets: {
      bar: { cds: `${nav} nav`, neon: `${nav} nav`, check: ['h', 'w'] },
      previous: { cds: `${nav} [data-testid=pagination-previous]`, neon: neonItem(1), check: control },
      previousIcon: { cds: `${nav} [data-testid=pagination-previous] [data-icon-name]`, neon: `${neonItem(1)} svg`, check: ['h', 'w', 'color'] },
      current: { cds: `${nav} [aria-current=page]`, neon: `${nav} [aria-current=page]`, check: page },
      page: { cds: `${nav} [data-pagenumber="2"]`, neon: neonItem(3), check: page },
      third: { cds: `${nav} [data-pagenumber="3"]`, neon: neonItem(4), check: ['h', 'w'] },
      ellipsis: { cds: `${nav} nav > [aria-hidden=true]`, neon: `${nav} [data-slot=pagination-ellipsis]`, check: ['h', 'w', 'font', 'color'] },
      last: { cds: `${nav} [data-pagenumber="10"]`, neon: neonItem(6), check: page },
      next: { cds: `${nav} [data-testid=pagination-next]`, neon: neonItem(7), check: control },
      nextIcon: { cds: `${nav} [data-testid=pagination-next] [data-icon-name]`, neon: `${neonItem(7)} svg`, check: ['h', 'w', 'color'] },
    },
    gaps: [
      ['previous', 'current', 'x'],
      ['current', 'page', 'x'],
      ['third', 'ellipsis', 'x'],
      ['ellipsis', 'last', 'x'],
      ['last', 'next', 'x'],
    ],
  },
];

// A named navigation landmark of links: exactly one page is aria-current,
// previous and next are labelled, previous is disabled (out of the tab order,
// and inert to a click a screen reader sends) on the first page, and following
// a link moves the current page. PROVISIONAL (#134): the focus ring is Neon's
// shared one, checked for being shown rather than measured.
export function a11y({ test, expect, gotoExpansion, keyboardFocus }) {
  test('pagination marks the current page, labels its controls and disables previous on the first page', async ({ page }) => {
    await gotoExpansion(page);
    const pages = page.locator(nav).getByRole('navigation', { name: 'เลือกหน้า / Pages' });
    const current = pages.locator('[aria-current=page]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAccessibleName('หน้า 1 / Page 1');
    const previous = pages.getByRole('link', { name: 'หน้าก่อนหน้า / Previous page' });
    const next = pages.getByRole('link', { name: 'หน้าถัดไป / Next page' });
    await expect(previous).toBeDisabled();
    await expect(next).toBeEnabled();
    await expect(pages.getByRole('link', { name: 'หน้า 10 / Page 10' })).toBeVisible();

    // Shift+Tab from page 1 skips the disabled previous link.
    await pages.getByRole('link', { name: 'หน้า 1 / Page 1' }).focus();
    await page.keyboard.press('Shift+Tab');
    await expect(previous).not.toBeFocused();

    // A screen reader activates a link by sending it a click event, which
    // pointer-events: none does not stop; a disabled previous must ignore it.
    await previous.dispatchEvent('click');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAccessibleName('หน้า 1 / Page 1');

    await next.click();
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAccessibleName('หน้า 2 / Page 2');
    await expect(previous).toBeEnabled();

    await pages.getByRole('link', { name: 'หน้า 3 / Page 3' }).focus();
    await page.keyboard.press('Enter');
    await expect(current).toHaveAccessibleName('หน้า 3 / Page 3');
  });

  test('a page link reached from the keyboard shows a focus indicator', async ({ page }) => {
    await gotoExpansion(page);
    const link = page.locator(nav).getByRole('link', { name: 'หน้า 2 / Page 2' });
    const focus = await keyboardFocus(page, link);
    await expect(link).toBeFocused();
    expect(focus.focusVisible).toBe(true);
    expect(focus.after, 'the focused link draws an indicator').not.toBe('');
    expect(focus.after, 'the focused link looks different').not.toBe(focus.before);
  });
}
