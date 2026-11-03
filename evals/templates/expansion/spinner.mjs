// spinner → CDS Spinner: the ring's size, border weight and colors at the
// default size and a large one. border reads the top border (the bgAlternate
// track); color is the arc's, which the bottom border takes from currentColor.
// Both fixtures pause the spin from mount, so the ring measures at rotate(0).
const ring = ['h', 'w', 'radius', 'border', 'color'];
const spinner = (hook) => ({ cds: `[data-measure=${hook}] [role=status]`, neon: `[data-measure=${hook}] [data-slot=spinner]`, check: ring });

export const screens = [
  {
    targets: {
      spinnerDefault: spinner('spinner-default'),
      spinnerLarge: spinner('spinner-large'),
    },
    gaps: [],
  },
];

export function a11y({ test, expect, gotoExpansion }) {
  test('a spinner is a polite loading status that reads its label', async ({ page }) => {
    await gotoExpansion(page);
    const statuses = page.locator('[data-measure=spinner]').getByRole('status');
    await expect(statuses).toHaveCount(2);
    for (const status of await statuses.all()) await expect(status).toHaveText('กำลังโหลด / Loading');
  });

  test('the spinner arc draws in its text color over a bgAlternate track', async ({ page }) => {
    await gotoExpansion(page);
    const colors = await page.locator(spinner('spinner-large').neon).evaluate((el) => {
      const style = getComputedStyle(el);
      return { arc: style.borderBottomColor, text: style.color, track: [style.borderTopColor, style.borderRightColor, style.borderLeftColor] };
    });
    expect(colors.arc).toBe(colors.text);
    expect(new Set(colors.track).size).toBe(1);
    expect(colors.track[0]).not.toBe(colors.arc);
  });
}
