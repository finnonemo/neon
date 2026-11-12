// input-group → Core's Text field with something beside its text: the group draws the Field,
// the control inside it is bare, and a unit takes the input text's style. The CDS side is
// TextInput's start and end slots, which keeps what Core's table does not give: the slot boxes
// and their padding, and the end icon button's size and color (Core has neither a start icon
// nor an action inside the Field).
import { fieldCell } from '../core/text-field.mjs';

const start = '[data-measure=input-group-start]';
const suffix = '[data-measure=input-group-suffix]';
const button = '[data-measure=input-group-button]';
const field = ['h', 'w', 'radius', 'border', 'bg'];
const input = ['h', 'pad', 'font', 'color'];
const filled = fieldCell('input-group', 'field');
const typed = fieldCell('input-group', 'text');

export const screens = [
  {
    targets: {
      startField: { cds: `${start} [data-testid=input-interactable-area]`, neon: `${start} [data-slot=input-group]`, check: field, core: fieldCell('input-group', 'field', { filled: 'False' }) },
      startSlot: { cds: `${start} [data-testid=input-group-start-slot] > div`, neon: `${start} [data-slot=input-group-addon]`, check: ['h', 'w', 'pad'] },
      startIcon: { cds: `${start} [data-testid=input-group-start-slot] [data-icon-name]`, neon: `${start} [data-slot=input-group-addon] svg`, check: ['h', 'w', 'color'] },
      startInput: { cds: `${start} input`, neon: `${start} input`, check: input, core: typed },
      suffixField: { cds: `${suffix} [data-testid=input-interactable-area]`, neon: `${suffix} [data-slot=input-group]`, check: field, core: filled },
      suffixInput: { cds: `${suffix} input`, neon: `${suffix} input`, check: input, core: typed },
      suffixText: { cds: `${suffix} [data-testid=input-group-suffix-slot] p`, neon: `${suffix} [data-slot=input-group-addon]`, check: ['w', 'pad', 'font', 'color'], core: fieldCell('input-group', 'unit') },
      buttonField: { cds: `${button} [data-testid=input-interactable-area]`, neon: `${button} [data-slot=input-group]`, check: field, core: filled },
      buttonInput: { cds: `${button} input`, neon: `${button} input`, check: input, core: typed },
      buttonSlot: { cds: `${button} [data-testid=input-group-button-slot] > div`, neon: `${button} [data-slot=input-group-addon]`, check: ['h', 'w', 'pad'] },
      endButton: { cds: `${button} button`, neon: `${button} button`, check: ['h', 'w', 'radius', 'color', 'bg'] },
      endIcon: { cds: `${button} button [data-icon-name]`, neon: `${button} button svg`, check: ['h', 'w', 'color'] },
    },
    gaps: [
      ['startSlot', 'startInput', 'x'],
      ['suffixInput', 'suffixText', 'x'],
      ['buttonInput', 'buttonSlot', 'x'],
    ],
  },
];

// The adornments are part of one labelled control: clicking a start icon
// focuses the input, and the end button is its own labelled button.
export function a11y({ test, expect, gotoExpansion, focusColor }) {
  test('an input group draws the Focus stroke while its input has keyboard focus', async ({ page }) => {
    await gotoExpansion(page);
    const group = page.locator(`${suffix} [data-slot=input-group]`);
    const stroke = () => group.evaluate((el) => { const style = getComputedStyle(el); return `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor} ${style.outlineOffset}`; });
    expect(await stroke()).not.toBe(`solid 3px ${await focusColor(page)} -3px`);
    const amount = page.locator(suffix).getByRole('textbox', { name: 'จำนวนเงิน / Amount' });
    await amount.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(amount).toBeFocused();
    await expect.poll(stroke).toBe(`solid 3px ${await focusColor(page)} -3px`);
  });

  test('an input group keeps its input labelled, focuses it from an addon, and labels its button', async ({ page }) => {
    await gotoExpansion(page);
    const search = page.locator(start).getByRole('textbox', { name: 'ค้นหา / Search' });
    await page.locator(`${start} [data-slot=input-group-addon]`).click();
    await expect(search).toBeFocused();
    const clear = page.locator(button).getByRole('button', { name: 'ล้าง / Clear' });
    await clear.focus();
    await expect(clear).toBeFocused();
    await expect(page.locator(suffix).getByRole('textbox', { name: 'จำนวนเงิน / Amount' })).toHaveValue('1,000');
  });
}
