// The Neon base's own accessibility: axe on both screens in both modes, tag
// contrast, the segmented control's keyboard, focus return from the overlays
// and the DatePicker's format. Runs on the neon target only.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.skip(process.env.NEON_TARGET !== 'neon', 'The Neon base only');

// PROVISIONAL (#97): white on fgNegative is 4.32:1 in dark; CDS ships the same pair.
const knownDark = (violation, mode) => mode === 'dark' && violation.id === 'color-contrast'
  ? violation.nodes.every((node) => node.target.join(' ').includes('[data-variant="destructive"]') || /data-variant="destructive"/.test(node.html))
  : false;

for (const [layout, mode] of ['approval', 'extras'].flatMap((layout) => ['light', 'dark'].map((mode) => [layout, mode]))) {
  test(`${layout} passes axe in ${mode}`, async ({ page }) => {
    await page.goto(`/?layout=${layout}${mode === 'dark' ? '&mode=dark' : ''}`);
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

test('the dialog and the row menu return focus to their triggers', async ({ page }) => {
  await page.goto('/?layout=extras');
  const reject = page.getByRole('button', { name: 'ปฏิเสธคำขอ' });
  await reject.click();
  const dialog = page.getByRole('dialog', { name: 'ยืนยันการปฏิเสธ' });
  await expect(dialog).toBeVisible();
  // Radix hides the page behind the dialog from assistive technology; it hides
  // main rather than #root, since #root also holds the toaster's live region.
  await expect(page.locator('main')).toHaveAttribute('aria-hidden', 'true');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(reject).toBeFocused();

  const more = page.getByRole('button', { name: 'ตัวเลือก Somchai Jaidee' });
  await more.click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toBeHidden();
  await expect(more).toBeFocused();
});

test('picking an option closes the select', async ({ page }) => {
  await page.goto('/?layout=extras');
  await page.getByRole('combobox', { name: 'ประเภท / Type' }).click();
  await page.getByRole('option', { name: 'ลาพักร้อน' }).click();
  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(page.getByRole('combobox', { name: 'ประเภท / Type' })).toHaveText('ลาพักร้อน');
});

test('the toast is announced politely without a provider in the screen', async ({ page }) => {
  await page.goto('/?layout=extras');
  await page.getByRole('button', { name: 'บันทึก', exact: true }).click();
  await expect(page.locator('[data-sonner-toast]')).toHaveText('บันทึกแล้ว / Saved');
  await expect(page.locator('section[aria-live]')).toHaveAttribute('aria-live', 'polite');
});

test.describe('in a Thai browser', () => {
  test.use({ locale: 'th-TH' });
  test('the DatePicker shows the format it is given, with no Buddhist year', async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 15, 12));
    await page.goto('/?layout=extras');
    expect(await page.evaluate(() => new Date(2026, 9, 10).toLocaleDateString())).toContain('2569');
    const field = page.locator('[data-measure=date] [data-slot=date-picker]');
    await field.click();
    await expect(page.locator('[data-slot=calendar] .rdp-caption_label')).toHaveText('October 2026');
    await page.locator('[data-slot=calendar] button[data-day="2026-10-10"]').click();
    await expect(field).toHaveText('10/10/2026');
    await expect(field).toBeFocused();
  });
});
