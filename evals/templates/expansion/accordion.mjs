// accordion → Core's Accordion (core/accordion.mjs), beside CDS Accordion: an open
// item's header (its padding, title and chevron) and panel, and a closed item below it,
// its long Thai/English title wrapping. Core gives the header; the panel is a Slot Core
// gives no padding, so it stays on the CDS baseline, as do the widths and the distances.
// CDS draws the line between items as a Divider and Neon as the
// item's bottom border, so the line is measured by the 1px it adds between
// one item and the next, not by its color (both are bgLine).
import { accordionCell } from '../core/accordion.mjs';

const at = '[data-measure=accordion-default]';
// CDS: Accordion > item, Divider, item, Divider, item (the Dividers are divs too); Neon: Accordion > item, item, item.
const cdsItem = (n) => `${at} .cds-Accordion > :nth-child(${n} of .cds-AccordionItem)`;
const neonItem = (n) => `${at} [data-slot=accordion-item]:nth-child(${n})`;
const header = (n) => ({ cds: `${cdsItem(n)} button`, neon: `${neonItem(n)} [data-slot=accordion-trigger]` });

// A header's height is Core's for a one-line title: the closed item's title wraps, so its height is not held.
const item = (n, name, Expanded) => ({
  [`${name}Header`]: { ...header(n), check: ['h', 'w', 'bg'], core: accordionCell('header', { Expanded }), ...(!Expanded && { coreProperties: ['bg'] }) },
  [`${name}HeaderBox`]: { cds: `${cdsItem(n)} button > div`, neon: `${neonItem(n)} [data-slot=accordion-trigger]`, check: ['pad'], core: accordionCell('header', { Expanded }) },
  [`${name}HeaderShape`]: { neon: `${neonItem(n)} [data-slot=accordion-trigger]`, check: ['radius'], core: accordionCell('header', { Expanded }) },
  [`${name}Title`]: { cds: `${cdsItem(n)} button > div > div:first-child > div > div`, neon: `${neonItem(n)} [data-slot=accordion-trigger-title]`, check: ['h', 'w', 'font', 'color'], core: accordionCell('title', { Expanded }) },
  [`${name}Caret`]: { cds: `${cdsItem(n)} [data-icon-name=caretUp]`, neon: `${neonItem(n)} [data-slot=accordion-trigger-icon]`, check: ['h', 'w', 'color'], core: accordionCell('chevron', { Expanded }) },
});

export const screens = [{
  targets: {
    ...item(1, 'open', true),
    ...item(2, 'closed', false),
    // A disabled header, which the CDS fixture has none of: Core's Disabled inks.
    disabledTitle: { neon: `${neonItem(4)} [data-slot=accordion-trigger-title]`, check: ['color'], core: accordionCell('title', { State: 'Disabled' }) },
    disabledCaret: { neon: `${neonItem(4)} [data-slot=accordion-trigger-icon]`, check: ['color'], core: accordionCell('chevron', { State: 'Disabled' }) },
    panelText: { cds: `${cdsItem(1)} [role=region] p`, neon: `${neonItem(1)} [data-slot=accordion-content] p`, check: ['h', 'w', 'font', 'color'] },
  },
  gaps: [
    ['openTitle', 'openCaret', 'x'],
    ['openHeader', 'panelText', 'y'],
    ['panelText', 'closedHeader', 'y'],
    ['closedHeader', 'lastHeader', 'y'],
  ],
  extraTargets: {
    lastHeader: { ...header(3), check: [] },
  },
}];

// Each header is a button that says whether its panel is expanded and names
// the panel it controls; Enter and Space open and close it, one item open at a
// time, as in CDS. Keyboard focus is Core's 2px Focus/focus stroke inside the header.
export function a11y({ test, expect, gotoExpansion, keyboardFocus, focusColor }) {
  const trigger = (page, name) => page.locator(at).getByRole('button', { name });
  const panelOf = async (page, button) => page.locator(`[id="${await button.getAttribute('aria-controls')}"]`);

  for (const mode of ['light', 'dark']) test(`${mode}: an accordion header reached from the keyboard draws Core's Focus stroke inside it`, async ({ page }) => {
    await gotoExpansion(page, mode);
    const fees = trigger(page, 'ค่าธรรมเนียม / Fees');
    const focus = await keyboardFocus(page, fees);
    await expect(fees).toBeFocused();
    expect(focus.focusVisible).toBe(true);
    expect(focus.after).toBe(`outline 2px ${await focusColor(page)} -2px`);
  });

  test('a disabled accordion header cannot be opened', async ({ page }) => {
    await gotoExpansion(page);
    const closed = trigger(page, 'บัญชีที่ปิดแล้ว / Closed account');
    await expect(closed).toBeDisabled();
    await expect(closed).toHaveAttribute('aria-expanded', 'false');
  });

  test('Enter and Space open and close an item and expose its expanded state', async ({ page }) => {
    await gotoExpansion(page);
    const fees = trigger(page, 'ค่าธรรมเนียม / Fees');
    const tax = trigger(page, 'ลดหย่อนภาษีกองทุน SSF และ RMF / Tax savings funds');
    const feesPanel = await panelOf(page, fees);
    await expect(fees).toHaveAttribute('aria-expanded', 'true');
    await expect(feesPanel).toBeVisible();
    await expect(page.getByRole('region', { name: 'ค่าธรรมเนียม / Fees' })).toHaveText('ไม่มีค่าธรรมเนียมการซื้อขาย / No trading fees');
    await fees.focus();
    await page.keyboard.press('Enter');
    await expect(fees).toHaveAttribute('aria-expanded', 'false');
    await expect(feesPanel).toBeHidden();
    await page.keyboard.press('Space');
    await expect(fees).toHaveAttribute('aria-expanded', 'true');
    await expect(feesPanel).toBeVisible();
    await tax.focus();
    await page.keyboard.press('Space');
    await expect(tax).toHaveAttribute('aria-expanded', 'true');
    await expect(await panelOf(page, tax)).toHaveText('ลดหย่อนได้ตามเงื่อนไข / Deductible within limits');
    await expect(fees, 'opening one item closes the other').toHaveAttribute('aria-expanded', 'false');
    await expect(feesPanel).toBeHidden();
  });
}
