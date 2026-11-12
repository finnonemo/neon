// The Neon base's own accessibility: axe on every screen in both modes, tag
// contrast, the segmented control's keyboard, focus return from the overlays
// and the DatePicker's format. Runs on the neon target only.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { computedColor as computed, expansionItems, focusColor, gotoExpansion, keyboardFocus, settled } from './expansion.mjs';

test.skip(process.env.NEON_TARGET !== 'neon', 'The Neon base only');

for (const [layout, mode] of ['approval', 'extras', 'expansion'].flatMap((layout) => ['light', 'dark'].map((mode) => [layout, mode]))) {
  test(`${layout} passes axe in ${mode}`, async ({ page }) => {
    await page.goto(`/?layout=${layout}${mode === 'dark' ? '&mode=dark' : ''}`);
    await page.evaluate(() => document.fonts.ready);
    // Colors transition into dark mode; axe reads them once they settle.
    await settled(page);
    // The role-and-color span probes cn, not a component, so axe skips it. A disabled field's helper
    // is Core's Text/text-disabled, part of an inactive control (WCAG 1.4.3 exempts it); axe exempts
    // a disabled control's label but not its description.
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('[data-measure=role-and-color]').exclude('[data-measure=field-disabled] [data-slot=field-description]').analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
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

// Core's List item: Focus turns the row's 2px stroke Focus/focus and hides its Divider.
for (const mode of ['light', 'dark']) test(`${mode}: a list row reached from the keyboard draws Core's Focus stroke inside it and hides its Divider`, async ({ page }) => {
  await page.goto(`/?layout=approval${mode === 'dark' ? '&mode=dark' : ''}`);
  const item = page.locator('[data-measure=list] li:nth-child(2)');
  const divider = item.locator('[data-slot=list-row-divider]');
  await expect(divider).toBeVisible();
  const focus = await keyboardFocus(page, item.locator('[data-slot=list-row]'));
  expect(focus.focusVisible).toBe(true);
  expect(focus.after).toBe(`outline 2px ${await focusColor(page)} -2px`);
  await expect(divider).toBeHidden();
});

test('a selected list row shows by its Checkmark, one line is 56px and the last row has no Divider', async ({ page }) => {
  await page.goto('/?layout=approval');
  const rows = page.locator('[data-measure=list] [data-slot=list-row]');
  await expect(rows.first()).toHaveAttribute('aria-current', 'true');
  await expect(rows.first().locator('[data-slot=list-row-check]')).toBeVisible();
  await expect(rows.nth(1).locator('[data-slot=list-row-check]')).toHaveCount(0);
  await expect(page.locator('[data-measure=list] li:last-child [data-slot=list-row-divider]')).toBeHidden();
  await page.goto('/?layout=extras');
  const oneLine = page.locator('[data-measure=core-list] li:nth-child(2) [data-slot=list-row]');
  expect((await oneLine.boundingBox()).height).toBe(56);
  await expect(page.locator('[data-measure=core-list] li:nth-child(1) [data-slot=list-row]')).toBeDisabled();
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

// Core's Focus state: the stroke inside the control turns Focus/focus, 3px on a field and 2px on a segment.
// A focused text field on the web is being edited, so it takes State=Focus, not Core's ring outside a field at rest.
for (const mode of ['light', 'dark']) test(`${mode}: a field and a segment reached from the keyboard draw Core's Focus stroke inside them`, async ({ page }) => {
  const dark = mode === 'dark' ? '&mode=dark' : '';
  await page.goto(`/?layout=approval${dark}`);
  const inside = async (control, width) => {
    const focus = await keyboardFocus(page, control);
    expect(focus.focusVisible).toBe(true);
    expect(focus.after).toBe(`outline ${width}px ${await focusColor(page)} -${width}px`);
  };
  await inside(page.locator('[data-measure=search] input'), 3);
  await inside(page.getByRole('radiogroup', { name: 'สถานะ / Status' }).getByRole('radio', { name: 'ทั้งหมด' }), 2);
  await page.goto(`/?layout=approval&pane=inspector${dark}`);
  await inside(page.locator('[data-measure=notes] textarea'), 3);
  await page.goto(`/?layout=extras${dark}`);
  await inside(page.locator('[data-measure=select] [data-slot=select-trigger]'), 3);
  // Focus shows over invalid, and a read-only field's 2px stroke grows to the 3px Focus stroke.
  await inside(page.locator('[data-measure=core-fields] [data-field=invalid] input'), 3);
  await inside(page.locator('[data-measure=core-fields] [data-field=read-only] input'), 3);
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

for (const mode of ['light', 'dark']) test(`${mode}: a button reached from the keyboard draws Core's focus color and its Hover fill`, async ({ page }) => {
  await page.goto(`/?layout=extras${mode === 'dark' ? '&mode=dark' : ''}`);
  const save = page.getByRole('button', { name: 'บันทึก', exact: true });
  const focus = await keyboardFocus(page, save);
  expect(focus.focusVisible).toBe(true);
  expect(focus.before).toBe('');
  // Focus/focus, 2px, 2px outside the button.
  expect(focus.after).toBe(`outline 2px ${await focusColor(page)} 2px`);
  await expect(save).toHaveCSS('background-color', await computed(page, 'var(--color-bgButtonSecondaryHover)'));
});

test('a loading button keeps its size, focus and name, is announced as busy and ignores a press', async ({ page }) => {
  await page.goto('/?layout=extras');
  const send = page.getByRole('button', { name: 'ส่งรายงาน' });
  const size = async () => { const { width, height } = await send.boundingBox(); return { width, height }; };
  const idle = await size();
  await send.focus();
  await page.keyboard.press('Enter');
  await expect(send).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('[data-sonner-toast]')).toHaveCount(1);
  expect(await size()).toEqual(idle);
  await expect(send).toBeFocused();
  // The spinner takes the label's place; the label stays in the button for its name and its width.
  await expect(send.locator('[data-slot=button-spinner]')).toBeVisible();
  await expect(send).toHaveCSS('-webkit-text-fill-color', 'rgba(0, 0, 0, 0)');
  await page.keyboard.press('Enter');
  await send.click();
  await page.waitForTimeout(300);
  await expect(page.locator('[data-sonner-toast]')).toHaveCount(1);
});

test('the loading spinner turns once a second and stands still under reduced motion', async ({ page }) => {
  await page.goto('/?layout=extras');
  const spinner = page.locator('[data-measure=core-buttons] [aria-busy=true] [data-slot=button-spinner]');
  await expect(spinner).toHaveCSS('animation-duration', '1s');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(spinner).toHaveCSS('animation-name', 'none');
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

// Each registry expansion item's behavior checks, from expansion/<item>.mjs.
for (const item of expansionItems) if (item.a11y) test.describe(item.name, () => item.a11y({ test, expect, gotoExpansion, keyboardFocus, focusColor }));
