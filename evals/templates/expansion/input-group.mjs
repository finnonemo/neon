// input-group → CDS TextInput's start and end slots: the bordered field, the
// slot boxes and their padding, the input's padding beside them, the suffix
// type and the end icon button's size and color.
const start = '[data-measure=input-group-start]';
const suffix = '[data-measure=input-group-suffix]';
const button = '[data-measure=input-group-button]';
const field = ['h', 'w', 'radius', 'border', 'bg'];
const input = ['h', 'pad', 'font', 'color'];

export const screens = [
  {
    targets: {
      startField: { cds: `${start} [data-testid=input-interactable-area]`, neon: `${start} [data-slot=input-group]`, check: field },
      startSlot: { cds: `${start} [data-testid=input-group-start-slot] > div`, neon: `${start} [data-slot=input-group-addon]`, check: ['h', 'w', 'pad'] },
      startIcon: { cds: `${start} [data-testid=input-group-start-slot] [data-icon-name]`, neon: `${start} [data-slot=input-group-addon] svg`, check: ['h', 'w', 'color'] },
      startInput: { cds: `${start} input`, neon: `${start} input`, check: input },
      suffixField: { cds: `${suffix} [data-testid=input-interactable-area]`, neon: `${suffix} [data-slot=input-group]`, check: field },
      suffixInput: { cds: `${suffix} input`, neon: `${suffix} input`, check: input },
      suffixText: { cds: `${suffix} [data-testid=input-group-suffix-slot] p`, neon: `${suffix} [data-slot=input-group-addon]`, check: ['w', 'pad', 'font', 'color'] },
      buttonField: { cds: `${button} [data-testid=input-interactable-area]`, neon: `${button} [data-slot=input-group]`, check: field },
      buttonInput: { cds: `${button} input`, neon: `${button} input`, check: input },
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
export function a11y({ test, expect, gotoExpansion }) {
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
