// sheet → CDS Tray, measured open on each side, since the sides differ in
// size, rounded corners, header padding and close control. The overlay spans
// the viewport, so the gaps between it and the sheet pin the sheet's left and
// bottom edges; with its size, that places it. Gaps are keyed by their pair,
// so each pair is measured along one axis. The handle and the close button
// are measured on every side: a side without one must have none. radii reads
// all four corners, since only the open edge's two are rounded.
const side = (pin) => ({
  name: `expansion-sheet-${pin}`,
  open: { action: 'click', cds: `[data-measure=sheet-${pin}] button`, neon: `[data-measure=sheet-${pin}] [data-slot=sheet-trigger]` },
  targets: {
    sheetOverlay: { cds: '[data-testid=tray-overlay]', neon: '[data-slot=sheet-overlay]', check: ['bg'] },
    sheet: { cds: '[data-testid=tray]', neon: '[data-slot=sheet-content]', check: ['h', 'w', 'radii', 'bg', 'border'] },
    sheetHandle: { cds: '.cds-Tray-handleBarHandle', neon: '[data-slot=sheet-handle]', check: ['h', 'w', 'radius', 'bg', 'opacity'] },
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
// trigger. CDS Tray is bordered in dark only: a bgLine hairline on all four
// sides, none in light. Axe reads each side open.
export function a11y({ test, expect, gotoExpansion }) {
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

  test('a sheet is bordered in bgLine on all four sides in dark and not at all in light', async ({ page }) => {
    for (const mode of ['light', 'dark']) {
      await page.goto(`/?layout=expansion${mode === 'dark' ? '&mode=dark' : ''}`);
      for (const pin of sides) {
        const sheet = await open(page, pin);
        await settled(page);
        const edges = await sheet.evaluate((el) => {
          const probe = document.body.appendChild(Object.assign(document.createElement('span'), { style: 'color: var(--color-bgLine)' }));
          const line = getComputedStyle(probe).color;
          probe.remove();
          const style = getComputedStyle(el);
          return { line, sides: ['Top', 'Right', 'Bottom', 'Left'].map((edge) => [style[`border${edge}Width`], style[`border${edge}Color`]]) };
        });
        for (const [width, color] of edges.sides) {
          if (mode === 'dark') expect([width, color], `${mode} ${pin}`).toEqual(['1px', edges.line]);
          else expect(width, `${mode} ${pin}`).toBe('0px');
        }
        await page.keyboard.press('Escape');
        await expect(sheet).toBeHidden();
      }
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
