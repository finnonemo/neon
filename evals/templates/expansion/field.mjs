// field → the CDS input stack (TextInput's InputStack): label, field and helper
// 4px apart, and the error state's red border, red helper and info icon.
// The stack's own height shows the label's 4px padding and the Thai helper's
// line count (both targets use IBM Plex Sans Thai at 256px).
const helper = '[data-measure=field-helper]';
const error = '[data-measure=field-error]';
const box = ['h', 'radius', 'border', 'bg'];
const text = ['font', 'color', 'h'];

export const screens = [
  {
    targets: {
      stack: { cds: `${helper} > div`, neon: `${helper} [data-slot=field]`, check: ['h', 'w'] },
      label: { cds: `${helper} [data-testid=field-helper-label]`, neon: `${helper} [data-slot=field-label]`, check: [...text, 'pad'] },
      control: { cds: `${helper} [data-testid=input-interactable-area]`, neon: `${helper} input`, check: box },
      helperText: { cds: `${helper} [data-testid=field-helper-text]`, neon: `${helper} [data-slot=field-description]`, check: text },
      errorStack: { cds: `${error} > div`, neon: `${error} [data-slot=field]`, check: ['h'] },
      errorLabel: { cds: `${error} [data-testid=field-error-label]`, neon: `${error} [data-slot=field-label]`, check: ['font', 'color'] },
      errorControl: { cds: `${error} [data-testid=input-interactable-area]`, neon: `${error} input`, check: box },
      errorText: { cds: `${error} [data-testid=field-error-text]`, neon: `${error} [data-slot=field-error]`, check: text },
      errorIcon: { cds: `${error} [data-testid=field-error-text] > span`, neon: `${error} [data-slot=field-error-icon]`, check: ['h', 'w', 'pad', 'color'] },
    },
    gaps: [
      ['label', 'control', 'y'],
      ['control', 'helperText', 'y'],
      ['errorLabel', 'errorControl', 'y'],
      ['errorControl', 'errorText', 'y'],
    ],
  },
];

// The helper and the error describe their control, the error state is
// invalid and announced, and long Thai helper text wraps inside the field.
export function a11y({ test, expect, gotoExpansion }) {
  test('a field describes its control with the helper, and an error is invalid and announced', async ({ page }) => {
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
