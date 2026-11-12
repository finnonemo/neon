// field → Core's Text field: the Title, the Field and the Detail line 8px apart, and the Error
// state's stroke, red message and circle-exclamation. The CDS side is its input stack
// (TextInput's InputStack), which keeps what Core's table does not give: box sizes and gaps.
// The stack's own height shows the Thai helper's line count (both targets use IBM Plex Sans
// Thai at 256px).
import { fieldCell } from '../core/text-field.mjs';

const helper = '[data-measure=field-helper]';
const error = '[data-measure=field-error]';
const box = ['h', 'radius', 'border', 'bg'];
const text = ['font', 'color', 'h'];
const empty = { filled: 'False' };
const invalid = { State: 'Error' };

export const screens = [
  {
    targets: {
      stack: { cds: `${helper} > div`, neon: `${helper} [data-slot=field]`, check: ['h', 'w'] },
      label: { cds: `${helper} [data-testid=field-helper-label]`, neon: `${helper} [data-slot=field-label]`, check: [...text, 'pad'], core: fieldCell('field', 'title', empty) },
      control: { cds: `${helper} [data-testid=input-interactable-area]`, neon: `${helper} input`, check: box, core: fieldCell('input', 'field', empty) },
      helperText: { cds: `${helper} [data-testid=field-helper-text]`, neon: `${helper} [data-slot=field-description]`, check: text, core: fieldCell('field', 'helper', empty) },
      errorStack: { cds: `${error} > div`, neon: `${error} [data-slot=field]`, check: ['h'] },
      errorLabel: { cds: `${error} [data-testid=field-error-label]`, neon: `${error} [data-slot=field-label]`, check: ['font', 'color'], core: fieldCell('field', 'title', invalid) },
      errorControl: { cds: `${error} [data-testid=input-interactable-area]`, neon: `${error} input`, check: box, core: fieldCell('input', 'field', invalid) },
      errorText: { cds: `${error} [data-testid=field-error-text]`, neon: `${error} [data-slot=field-error]`, check: text, core: fieldCell('field', 'error', invalid) },
      errorIcon: { cds: `${error} [data-testid=field-error-text] > span`, neon: `${error} [data-slot=field-error-icon]`, check: ['h', 'w', 'pad', 'color'], core: fieldCell('field', 'errorIcon', invalid) },
      // Core's Disabled, which CDS has no baseline for: the Title and helper take Text/text-disabled.
      disabledLabel: { neon: '[data-measure=field-disabled] [data-slot=field-label]', check: ['font', 'color', 'opacity'], core: fieldCell('field', 'title', { State: 'Disabled' }) },
      disabledControl: { neon: '[data-measure=field-disabled] input', check: [...box, 'opacity'], core: fieldCell('input', 'field', { State: 'Disabled' }) },
      disabledHelper: { neon: '[data-measure=field-disabled] [data-slot=field-description]', check: ['font', 'color'], core: fieldCell('field', 'helper', { State: 'Disabled' }) },
    },
    gaps: [
      ['label', 'control', 'y'],
      ['control', 'helperText', 'y'],
      ['errorLabel', 'errorControl', 'y'],
      ['errorControl', 'errorText', 'y'],
    ],
  },
];

// The item, not the fixture, ties the label, the helper and the error to the
// control: the error state is invalid and announced, an input group's input
// is described too, and long Thai helper text wraps inside the field.
export function a11y({ test, expect, gotoExpansion, keyboardFocus, focusColor }) {
  test('a field reached from the keyboard draws the Focus stroke, over an error too', async ({ page }) => {
    await gotoExpansion(page);
    const email = page.locator(error).getByRole('textbox', { name: 'อีเมล / Email' });
    const focus = await keyboardFocus(page, email);
    expect(focus.focusVisible).toBe(true);
    expect(focus.before, 'the error stroke at rest').toMatch(/^outline 3px .+ -3px$/);
    expect(focus.after).toBe(`outline 3px ${await focusColor(page)} -3px`);
    expect(focus.after).not.toBe(focus.before);
  });

  test('a field labels its control and describes it with the helper, and an error is invalid and announced', async ({ page }) => {
    await gotoExpansion(page);
    const helperField = page.locator(helper);
    const name = helperField.getByRole('textbox', { name: 'ชื่อบัญชี / Account name' });
    await expect(name).toHaveAccessibleDescription(await helperField.locator('[data-slot=field-description]').innerText());
    await expect(name).not.toHaveAttribute('aria-invalid', 'true');

    const errorField = page.locator(error);
    const email = errorField.getByRole('textbox', { name: 'อีเมล / Email' });
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    const alert = errorField.getByRole('alert');
    await expect(alert).toHaveText('รูปแบบอีเมลไม่ถูกต้อง / Invalid email');
    await expect(email).toHaveAccessibleDescription('รูปแบบอีเมลไม่ถูกต้อง / Invalid email');

    const requester = page.locator('[data-measure=field-input-group]').getByRole('textbox', { name: 'ผู้ขอ / Requester' });
    await expect(requester).toHaveAttribute('data-slot', 'input-group-control');
    await expect(requester).toHaveAccessibleDescription('ค้นหาด้วยชื่อหรืออีเมล / Search by name or email');
    await expect(requester).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('long Thai helper text wraps inside the field without overflow', async ({ page }) => {
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoExpansion(page);
      await page.evaluate(() => document.fonts.ready);
      const measured = await page.locator(`${helper} [data-slot=field-description]`).evaluate((el) => ({
        lines: Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)),
        overflow: el.scrollWidth - el.clientWidth,
        inside: el.getBoundingClientRect().right <= el.closest('[data-slot=field]').getBoundingClientRect().right,
      }));
      expect(measured.lines, `${width}px`).toBeGreaterThanOrEqual(2);
      expect(measured.overflow, `${width}px`).toBeLessThanOrEqual(0);
      expect(measured.inside, `${width}px`).toBe(true);
    }
  });
}
