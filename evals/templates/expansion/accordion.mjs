// accordion → CDS Accordion: an open item's header (its padding, title and
// caret) and panel, and a closed item below it, its long Thai/English title
// wrapping. CDS draws the line between items as a Divider and Neon as the
// item's bottom border, so the line is measured by the 1px it adds between
// one item and the next, not by its color (both are bgLine).
const at = '[data-measure=accordion-default]';
// CDS: Accordion > item, Divider, item, Divider, item (the Dividers are divs too); Neon: Accordion > item, item, item.
const cdsItem = (n) => `${at} .cds-Accordion > :nth-child(${n} of .cds-AccordionItem)`;
const neonItem = (n) => `${at} [data-slot=accordion-item]:nth-child(${n})`;
const header = (n) => ({ cds: `${cdsItem(n)} button`, neon: `${neonItem(n)} [data-slot=accordion-trigger]` });

const item = (n, name) => ({
  [`${name}Header`]: { ...header(n), check: ['h', 'w', 'bg'] },
  [`${name}HeaderBox`]: { cds: `${cdsItem(n)} button > div`, neon: `${neonItem(n)} [data-slot=accordion-trigger]`, check: ['pad'] },
  [`${name}Title`]: { cds: `${cdsItem(n)} button > div > div:first-child > div > div`, neon: `${neonItem(n)} [data-slot=accordion-trigger-title]`, check: ['h', 'w', 'font', 'color'] },
  [`${name}Caret`]: { cds: `${cdsItem(n)} [data-icon-name=caretUp]`, neon: `${neonItem(n)} [data-slot=accordion-trigger-icon]`, check: ['h', 'w', 'color'] },
});

export const screens = [{
  targets: {
    ...item(1, 'open'),
    ...item(2, 'closed'),
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
// time, as in CDS. PROVISIONAL (#134): the focus ring is Neon's, so it is
// checked for being shown rather than measured.
export function a11y({ test, expect, gotoExpansion, keyboardFocus }) {
  const trigger = (page, name) => page.locator(at).getByRole('button', { name });
  const panelOf = async (page, button) => page.locator(`[id="${await button.getAttribute('aria-controls')}"]`);

  test('an accordion header reached from the keyboard shows a focus indicator', async ({ page }) => {
    await gotoExpansion(page);
    const fees = trigger(page, 'ค่าธรรมเนียม / Fees');
    const focus = await keyboardFocus(page, fees);
    await expect(fees).toBeFocused();
    expect(focus.focusVisible).toBe(true);
    expect(focus.after, 'the focused header draws an indicator').not.toBe('');
    expect(focus.after, 'the focused header looks different').not.toBe(focus.before);
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
