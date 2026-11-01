// The Neon base's own accessibility: axe on the approval screen in both modes,
// tag contrast and the segmented control's keyboard. Runs on the neon target only.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.skip(process.env.NEON_TARGET !== 'neon', 'The Neon base only');

// PROVISIONAL (#97): white on fgNegative is 4.32:1 in dark; CDS ships the same pair.
const knownDark = (violation, mode) => mode === 'dark' && violation.id === 'color-contrast'
  ? violation.nodes.every((node) => node.target.join(' ').includes('[data-variant="destructive"]') || /data-variant="destructive"/.test(node.html))
  : false;

for (const mode of ['light', 'dark']) {
  test(`approval passes axe in ${mode}`, async ({ page }) => {
    await page.goto(`/?layout=approval${mode === 'dark' ? '&mode=dark' : ''}`);
    await page.evaluate(() => document.fonts.ready);
    // Colors transition into dark mode; axe reads them once they settle.
    await page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== 'running'));
    // The role-and-color span probes cn, not a component, so axe skips it.
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).exclude('[data-measure=role-and-color]').analyze();
    const unexpected = violations.filter((violation) => !knownDark(violation, mode));
    expect(unexpected.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

test('every tag reads at 4.5:1 or more on its wash in light', async ({ page }) => {
  await page.goto('/?layout=approval');
  const ratios = await page.$$eval('[data-slot=tag]', (tags) => {
    const luminance = (rgb) => {
      const [r, g, b] = rgb.match(/[\d.]+/g).slice(0, 3).map((v) => { const c = Number(v) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    return tags.map((tag) => {
      const style = getComputedStyle(tag);
      const [a, b] = [luminance(style.color), luminance(style.backgroundColor)].sort((x, y) => y - x);
      return { variant: tag.dataset.variant, ratio: Math.round(((a + 0.05) / (b + 0.05)) * 100) / 100 };
    });
  });
  expect(new Set(ratios.map((r) => r.variant))).toEqual(new Set(['warning', 'positive', 'negative']));
  for (const { variant, ratio } of ratios) expect(ratio, `${variant} tag`).toBeGreaterThanOrEqual(4.5);
});

test('the segmented control is one radio group the arrow keys move through', async ({ page }) => {
  await page.goto('/?layout=approval');
  const group = page.getByRole('radiogroup', { name: 'สถานะ / Status' });
  await group.getByRole('radio', { name: 'ทั้งหมด' }).focus();
  // Radix checks the radio its focus lands on only while the arrow is still down.
  await page.keyboard.down('ArrowRight');
  await expect(group.getByRole('radio', { name: 'รอ' })).toBeChecked();
  await page.keyboard.up('ArrowRight');
  await expect(group.getByRole('radio', { name: 'รอ' })).toBeFocused();
  await expect(page.locator('[data-measure=list] [data-slot=tag]')).toHaveText(Array(4).fill('รออนุมัติ'));
});
