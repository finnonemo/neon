// spinner → Core's Progress circle: the Ring's size, stroke weight and colors
// at XSmall (the default) and Large. border reads the top border (the
// Layer/layer-03 Track); color is the arc's, which the bottom border takes
// from currentColor. The fixtures pause the spin from mount, so the ring
// measures at rotate(0).
import { spinnerCell } from '../core/progress-circle.mjs';

const ring = ['h', 'w', 'radius', 'border', 'color'];
const spinner = (hook, Size) => ({ cds: `[data-measure=${hook}] [role=status]`, neon: `[data-measure=${hook}] [data-slot=spinner]`, check: ring, core: spinnerCell({ Size }) });

export const screens = [
  {
    targets: {
      spinnerDefault: spinner('spinner-default', 'XSmall'),
      spinnerLarge: spinner('spinner-large', 'Large'),
    },
    gaps: [],
  },
];

export function a11y({ test, expect, gotoExpansion }) {
  test('a spinner is a polite loading status that reads its label', async ({ page }) => {
    await gotoExpansion(page);
    const statuses = page.locator('[data-measure=spinner]').getByRole('status');
    await expect(statuses).toHaveCount(3);
    for (const status of await statuses.all()) await expect(status).toHaveText('กำลังโหลด / Loading');
  });

  test('the spinner arc draws in its text color over one track color', async ({ page }) => {
    await gotoExpansion(page);
    const colors = await page.locator(spinner('spinner-large').neon).evaluate((el) => {
      const style = getComputedStyle(el);
      return { arc: style.borderBottomColor, text: style.color, track: [style.borderTopColor, style.borderRightColor, style.borderLeftColor] };
    });
    expect(colors.arc).toBe(colors.text);
    expect(new Set(colors.track).size).toBe(1);
    expect(colors.track[0]).not.toBe(colors.arc);
  });

  // Not in Core: a numeric size still draws a ring 10× that many px wide with a 1.1× border,
  // which the browser draws on whole pixels (4.4 → 4).
  test('a numeric size still scales the ring whole', async ({ page }) => {
    await gotoExpansion(page);
    const ring = page.locator('[data-measure=spinner-scaled] [data-slot=spinner]');
    const { width, height } = await ring.boundingBox();
    expect([Math.round(width), Math.round(height)]).toEqual([40, 40]);
    await expect(ring).toHaveCSS('border-top-width', '4px');
  });
}
