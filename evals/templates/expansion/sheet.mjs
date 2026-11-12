// sheet → Core's Sheet at iOS=False, measured open on each side, since the sides differ in
// size, rounded corners, header padding and close control. Core's sheet opens from the bottom
// alone, so only the bottom sheet's surface takes all of the Core baseline (core/sheet.mjs); the
// other sides, which are Neon's, take its fill, its top padding and its lack of a stroke, and
// their corners are recorded against the CDS baseline with the header's sizes and the gaps
// (core-differences.json). The overlay spans the viewport, so the gaps between it and the sheet
// pin the sheet's left and bottom edges; with its size, that places it. Gaps are keyed by their
// pair, so each pair is measured along one axis. The handle and the close button are measured
// on every side: a side without one must have none. radii reads all four corners, since only
// the open edge's two are rounded.
import { sheetCell } from '../core/sheet.mjs';

const side = (pin) => ({
  name: `expansion-sheet-${pin}`,
  open: { action: 'click', cds: `[data-measure=sheet-${pin}] button`, neon: `[data-measure=sheet-${pin}] [data-slot=sheet-trigger]` },
  targets: {
    sheetOverlay: { cds: '[data-testid=tray-overlay]', neon: '[data-slot=sheet-overlay]', check: ['bg'], core: sheetCell('overlay') },
    sheet: { cds: '[data-testid=tray]', neon: '[data-slot=sheet-content]', check: ['h', 'w', 'radii', 'bg', 'border'], core: sheetCell('surface'), ...(pin !== 'bottom' && { coreProperties: ['bg', 'border'] }) },
    sheetPad: { neon: '[data-slot=sheet-content]', check: ['pad'], core: sheetCell('surface') },
    sheetHandle: { cds: '.cds-Tray-handleBarHandle', neon: '[data-slot=sheet-handle]', check: ['h', 'w', 'radius', 'bg', 'opacity'], core: sheetCell('grabber') },
    sheetClose: { cds: '[data-testid=tray-close-button]', neon: '[data-slot=sheet-header] [data-slot=sheet-close]', check: ['h', 'w', 'radius', 'color'] },
    sheetCloseIcon: { cds: '[data-testid=tray-close-button] .cds-Icon', neon: '[data-slot=sheet-header] [data-slot=sheet-close] svg', check: ['h', 'w'] },
    sheetTitle: { cds: '.cds-Tray-title', neon: '[data-slot=sheet-title]', check: ['font', 'color', 'h'] },
    sheetBody: { cds: '.cds-Tray-content p', neon: '[data-slot=sheet-body] p', check: ['font', 'color', 'h', 'w'] },
  },
  gaps: [
    ['sheetOverlay', 'sheet', 'x'],
    ['sheet', 'sheetOverlay', 'y'],
    ['sheet', 'sheetTitle', 'y'],
    ['sheetBody', 'sheet', 'x'],
    ['sheet', 'sheetHandle', 'y'],
    ['sheetHandle', 'sheetTitle', 'y'],
    ['sheetClose', 'sheet', 'x'],
    ['sheet', 'sheetClose', 'y'],
    ['sheetTitle', 'sheetBody', 'y'],
  ],
});

const sides = ['bottom', 'top', 'left', 'right'];

export const screens = sides.map(side);

const trigger = (page, pin) => page.locator(`[data-measure=sheet-${pin}]`).getByRole('button', { name: pin, exact: true });
const settled = (page) => page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== 'running'));

// The bottom sheet shows CDS's HandleBar, which is its close button; the other
// sides show the close button instead. Every way out returns focus to the
// trigger. Core's sheet has no stroke in either mode, and its Grabber's target is 96 by 48px
// at the top of the sheet. Axe reads each side open.
export function a11y({ test, expect, gotoExpansion, focusColor }) {
  const open = async (page, pin) => {
    await trigger(page, pin).click();
    const sheet = page.getByRole('dialog', { name: 'ตัวกรอง / Filters' });
    await expect(sheet).toBeVisible();
    return sheet;
  };

  test('only a bottom sheet shows the handle, and it closes the sheet like the close button elsewhere', async ({ page }) => {
    await gotoExpansion(page);
    for (const pin of sides) {
      const sheet = await open(page, pin);
      const handle = sheet.locator('[data-slot=sheet-handle]');
      const close = sheet.getByRole('button', { name: 'ปิด / Close' });
      await expect(close).toHaveCount(1);
      if (pin === 'bottom') {
        await expect(handle).toBeVisible();
        await expect(close.locator('[data-slot=sheet-handle]')).toHaveCount(1);
      } else {
        await expect(handle).toHaveCount(0);
      }
      await close.click();
      await expect(sheet).toBeHidden();
      await expect(trigger(page, pin)).toBeFocused();
    }
  });

  test('a sheet closes on Escape and on an overlay click and returns focus to its trigger', async ({ page }) => {
    await gotoExpansion(page);
    for (const pin of sides) {
      let sheet = await open(page, pin);
      await page.keyboard.press('Escape');
      await expect(sheet).toBeHidden();
      await expect(trigger(page, pin)).toBeFocused();
      sheet = await open(page, pin);
      // A point on the overlay the sheet leaves uncovered; Playwright refuses the click if the sheet is on top.
      const { width, height } = page.viewportSize();
      const uncovered = { bottom: { x: width / 2, y: 8 }, top: { x: width / 2, y: height - 8 }, left: { x: width - 8, y: height / 2 }, right: { x: 8, y: height / 2 } };
      await page.locator('[data-slot=sheet-overlay]').click({ position: uncovered[pin] });
      await expect(sheet).toBeHidden();
      await expect(trigger(page, pin)).toBeFocused();
    }
  });

  test('a sheet has no border in light or dark, and a bottom sheet\'s grabber is a 96 by 48px target at its top that shows keyboard focus', async ({ page }) => {
    for (const mode of ['light', 'dark']) {
      await gotoExpansion(page, mode);
      for (const pin of sides) {
        const sheet = await open(page, pin);
        await settled(page);
        const widths = await sheet.evaluate((el) => ['Top', 'Right', 'Bottom', 'Left'].map((edge) => getComputedStyle(el)[`border${edge}Width`]));
        expect(widths, `${mode} ${pin}`).toEqual(['0px', '0px', '0px', '0px']);
        await page.keyboard.press('Escape');
        await expect(sheet).toBeHidden();
      }
      // Opened from the keyboard, focus lands on the grabber, the sheet's first control.
      await trigger(page, 'bottom').focus();
      await page.keyboard.press('Enter');
      const sheet = page.getByRole('dialog', { name: 'ตัวกรอง / Filters' });
      await expect(sheet).toBeVisible();
      await settled(page);
      const grabber = sheet.locator('[data-slot=sheet-handle-bar]');
      await expect(grabber).toBeFocused();
      const [box, around] = [await grabber.boundingBox(), await sheet.boundingBox()];
      expect([Math.round(box.width), Math.round(box.height), Math.round(box.y - around.y)], mode).toEqual([96, 48, 0]);
      expect(Math.abs(box.x + box.width / 2 - (around.x + around.width / 2)), mode).toBeLessThanOrEqual(1);
      const outline = await grabber.evaluate((el) => [getComputedStyle(el).outlineWidth, getComputedStyle(el).outlineColor]);
      expect(outline, mode).toEqual(['2px', await focusColor(page)]);
      await page.keyboard.press('Escape');
      await expect(sheet).toBeHidden();
    }
  });

  for (const mode of ['light', 'dark']) {
    test(`an open sheet passes axe on every side in ${mode}`, async ({ page }) => {
      const { default: AxeBuilder } = await import('@axe-core/playwright');
      await page.goto(`/?layout=expansion${mode === 'dark' ? '&mode=dark' : ''}`);
      await page.evaluate(() => document.fonts.ready);
      for (const pin of sides) {
        const sheet = await open(page, pin);
        await settled(page);
        const { violations } = await new AxeBuilder({ page }).include('[data-slot=sheet-content]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        expect(violations.map((v) => `${pin} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
        await page.keyboard.press('Escape');
        await expect(sheet).toBeHidden();
      }
    });
  }
}
