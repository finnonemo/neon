// pagination → Core's Pagination (core/pagination.mjs), beside CDS Pagination: the bar,
// each page a 36px box (the current page on the inverse fill), the ellipsis, and icon-only
// previous and next buttons, previous disabled on the first page. Previous and Next are
// Buttons, and a page's type has no Neon type role (Core's Callout): both stay on the CDS
// baseline, as do the distances.
import { paginationCell } from '../core/pagination.mjs';

// The fixture's own hook, inside the section's of the same name: the section also holds the
// disabled pages.
const nav = '[data-measure=pagination] [data-measure=pagination]';
const neonItem = (n) => `${nav} [data-slot=pagination-item]:nth-child(${n}) > *`;
const page = ['h', 'w', 'radius', 'border', 'bg', 'color', 'font', 'pad'];
const control = ['h', 'w', 'radius', 'bg', 'opacity'];

export const screens = [
  {
    targets: {
      bar: { cds: `${nav} nav`, neon: `${nav} nav`, check: ['h', 'w'], core: paginationCell('bar') },
      barBox: { neon: `${nav} nav`, check: ['pad', 'bg'], core: paginationCell('bar') },
      previous: { cds: `${nav} [data-testid=pagination-previous]`, neon: neonItem(1), check: control },
      previousIcon: { cds: `${nav} [data-testid=pagination-previous] [data-icon-name]`, neon: `${neonItem(1)} svg`, check: ['h', 'w', 'color'] },
      current: { cds: `${nav} [aria-current=page]`, neon: `${nav} [aria-current=page]`, check: page, core: paginationCell('page', { Selected: true }) },
      page: { cds: `${nav} [data-pagenumber="2"]`, neon: neonItem(3), check: page, core: paginationCell('page') },
      third: { cds: `${nav} [data-pagenumber="3"]`, neon: neonItem(4), check: ['h', 'w'], core: paginationCell('page') },
      ellipsis: { cds: `${nav} nav > [aria-hidden=true]`, neon: `${nav} [data-slot=pagination-ellipsis]`, check: ['h', 'w', 'font', 'color'], core: paginationCell('ellipsis') },
      last: { cds: `${nav} [data-pagenumber="10"]`, neon: neonItem(6), check: page, core: paginationCell('page') },
      next: { cds: `${nav} [data-testid=pagination-next]`, neon: neonItem(7), check: control },
      nextIcon: { cds: `${nav} [data-testid=pagination-next] [data-icon-name]`, neon: `${neonItem(7)} svg`, check: ['h', 'w', 'color'] },
      // Core's Selected and Disabled page, which the CDS fixture has none of.
      disabledCurrent: { neon: '[data-measure=pagination-disabled] [aria-current=page]', check: ['bg', 'color'], core: paginationCell('page', { Selected: true, State: 'Disabled' }) },
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
// a link moves the current page. Keyboard focus is Core's 2px Focus/focus ring round a page's
// box, inside its 48px target.
export function a11y({ test, expect, gotoExpansion, keyboardFocus, focusColor }) {
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

  // Enter on Previous at page 2 disables it under the keyboard, and Core's Icon button, Tertiary,
  // Disabled has no fill. Chromium takes the focus off a link that loses its href. A browser that
  // leaves it there still matches :focus-visible: the second half focuses the disabled link to
  // stand in for one, with no transition so the fill is read at once.
  test('previous that turns disabled while it holds keyboard focus has no fill', async ({ page }) => {
    await gotoExpansion(page);
    const pages = page.locator(nav).getByRole('navigation', { name: 'เลือกหน้า / Pages' });
    const previous = pages.getByRole('link', { name: 'หน้าก่อนหน้า / Previous page' });
    const transparent = 'rgba(0, 0, 0, 0)';
    await pages.getByRole('link', { name: 'หน้าถัดไป / Next page' }).click();
    await keyboardFocus(page, previous);
    await expect(previous).not.toHaveCSS('background-color', transparent);
    await page.keyboard.press('Enter');
    await expect(previous).toBeDisabled();
    await expect(previous).toHaveCSS('background-color', transparent);

    await previous.evaluate((el) => {
      el.style.transition = 'none';
      el.tabIndex = -1;
      el.focus();
    });
    await expect(previous).toBeFocused();
    expect(await previous.evaluate((el) => el.matches(':focus-visible'))).toBe(true);
    await expect(previous).toHaveCSS('background-color', transparent);
  });

  // Core's page has one box. A size is the Button's, so a page number given one keeps the Button.
  test('a page number given a size keeps the Button in that size', async ({ page }) => {
    await gotoExpansion(page);
    const sized = page.locator('[data-measure=pagination-disabled]').getByRole('link', { name: 'หน้า 2 / Page 2' });
    const { width, height } = await sized.boundingBox();
    expect({ width, height }).toEqual({ width: 32, height: 32 });
  });

  // The fixture's bar is 320px wide, narrower than five pages at their 48px targets with Previous
  // and Next (384px; 400px with Core's 48px Icon buttons).
  test('a bar narrower than its pages keeps Previous and Next inside it', async ({ page }) => {
    await gotoExpansion(page);
    const box = (locator) => locator.boundingBox();
    const bar = await box(page.locator(`${nav} [data-slot=pagination]`));
    const previous = await box(page.locator(nav).getByRole('link', { name: 'หน้าก่อนหน้า / Previous page' }));
    const next = await box(page.locator(nav).getByRole('link', { name: 'หน้าถัดไป / Next page' }));
    expect(previous.x).toBeGreaterThanOrEqual(bar.x);
    expect(next.x + next.width).toBeLessThanOrEqual(bar.x + bar.width);
  });

  for (const mode of ['light', 'dark']) test(`${mode}: a page reached from the keyboard draws Core's Focus ring round its box, and its target is 48px`, async ({ page }) => {
    await gotoExpansion(page, mode);
    const link = page.locator(nav).getByRole('link', { name: 'หน้า 2 / Page 2' });
    const focus = await keyboardFocus(page, link);
    await expect(link).toBeFocused();
    expect(focus.focusVisible).toBe(true);
    expect(focus.after).toBe(`outline 2px ${await focusColor(page)} 0px`);
    const target = await link.evaluate((el) => { const { width, height } = getComputedStyle(el, '::after'); return { width, height }; });
    expect(target).toEqual({ width: '48px', height: '48px' });
  });
}
