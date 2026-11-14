// alert-dialog → Core's Alert at iOS=False, measured open: the overlay, the 300px card, the
// Headline title and Body message, and the two half-width Medium actions (Core's Tertiary
// cancel and its Primary, here Danger). The card, its text block, the title and the message
// take the Core baseline (core/alert.mjs), the actions Core's Button. Sizes that follow from
// the wrapped Thai and English copy (the card's height, the text's and the actions' boxes) and
// the gaps stay on the CDS baseline, their differences recorded in core-differences.json.
import { alertCell } from '../core/alert.mjs';
import { buttonCell } from '../core/button.mjs';

const fromCore = ['font', 'color', 'pad', 'bg'];

const alert = '[role=alertdialog]';

export const screens = [
  {
    name: 'expansion-alert-dialog-open',
    open: { action: 'click', cds: '[data-measure=alert-dialog] button', neon: '[data-measure=alert-dialog] [data-slot=alert-dialog-trigger]' },
    targets: {
      alertOverlay: { cds: `${alert} [data-testid=modal-overlay]`, neon: '[data-slot=alert-dialog-overlay]', check: ['bg'], core: alertCell('overlay') },
      alertCard: { cds: `${alert} [data-testid=modal-dialog-motion] > div`, neon: '[data-slot=alert-dialog-content]', check: ['w', 'h', 'radius', 'bg'], core: alertCell('card') },
      alertCardPad: { neon: '[data-slot=alert-dialog-content]', check: ['pad'], core: alertCell('card') },
      alertText: { neon: '[data-slot=alert-dialog-header]', check: ['pad'], core: alertCell('text') },
      alertTitle: { cds: `${alert} h3`, neon: '[data-slot=alert-dialog-title]', check: ['font', 'color', 'h', 'w'], core: alertCell('title') },
      alertBody: { cds: `${alert} p`, neon: '[data-slot=alert-dialog-description]', check: ['font', 'color', 'h', 'w'], core: alertCell('message') },
      alertCancel: { cds: `${alert} button[data-variant=secondary]`, neon: '[data-slot=alert-dialog-cancel]', check: ['h', 'w', 'font', 'color', 'pad', 'radius', 'bg'], core: buttonCell('Tertiary', { Size: 'Medium' }), coreProperties: fromCore },
      alertAction: { cds: `${alert} button[data-variant=negative]`, neon: '[data-slot=alert-dialog-action]', check: ['h', 'w', 'font', 'color', 'pad', 'radius', 'bg'], core: buttonCell('Primary', { Type: 'Danger', Size: 'Medium' }), coreProperties: fromCore },
    },
    gaps: [
      ['alertCard', 'alertTitle', 'y'],
      ['alertTitle', 'alertCard', 'x'],
      ['alertTitle', 'alertBody', 'y'],
      ['alertBody', 'alertCancel', 'y'],
      ['alertCancel', 'alertAction', 'x'],
      ['alertAction', 'alertCard', 'y'],
    ],
  },
];

const title = 'ลบบัญชีรับเงิน / Remove payout account';
const trigger = (page) => page.locator('[data-measure=alert-dialog]').getByRole('button', { name: 'ลบบัญชี / Remove account' });

// Radix's alert dialog, as Core's Alert behaves: named by its title and described
// by its body, deaf to a click on the overlay, and returning focus to its
// trigger however it closes. Axe reads it open, which the screen pass cannot.
export function a11y({ test, expect, gotoExpansion }) {
  test('an alert dialog is named and described by its title and body, and hides the page behind it', async ({ page }) => {
    await gotoExpansion(page);
    await trigger(page).click();
    const alert = page.getByRole('alertdialog', { name: title });
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAccessibleDescription("บัญชีนี้จะถูกลบและไม่สามารถกู้คืนได้ / This can't be undone.");
    // Radix hides all but the dialog and the page's live regions (aria-hidden
    // keeps [aria-live] audible, such as alert's), so the page's controls,
    // not necessarily main, leave the accessibility tree.
    await expect(trigger(page), 'the page behind the dialog is hidden').toHaveCount(0);
  });

  test('an alert dialog stays open on an overlay click and returns focus to its trigger after Cancel, the action and Escape', async ({ page }) => {
    await gotoExpansion(page);
    const alert = page.getByRole('alertdialog', { name: title });
    for (const close of [
      () => alert.getByRole('button', { name: 'ยกเลิก / Cancel' }).click(),
      () => alert.getByRole('button', { name: 'ลบ / Remove' }).click(),
      () => page.keyboard.press('Escape'),
    ]) {
      await trigger(page).click();
      await expect(alert).toBeVisible();
      await page.locator('[data-slot=alert-dialog-overlay]').click({ position: { x: 8, y: 8 } });
      await expect(alert).toBeVisible();
      await close();
      await expect(alert).toBeHidden();
      await expect(trigger(page)).toBeFocused();
    }
  });

  for (const mode of ['light', 'dark']) {
    test(`an open alert dialog passes axe in ${mode}`, async ({ page }) => {
      const { default: AxeBuilder } = await import('@axe-core/playwright');
      await page.goto(`/?layout=expansion${mode === 'dark' ? '&mode=dark' : ''}`);
      await page.evaluate(() => document.fonts.ready);
      await trigger(page).click();
      await expect(page.getByRole('alertdialog')).toBeVisible();
      await page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== 'running'));
      const { violations } = await new AxeBuilder({ page }).include('[data-slot=alert-dialog-content]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });
  }
}
