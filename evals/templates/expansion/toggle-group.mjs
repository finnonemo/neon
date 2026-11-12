// toggle-group → Core's Selection tag in Secondary Navy. Each size's pressed and unpressed items
// (box, padding, type, fill and the ring inside, which alone tells pressed from not), the 8px
// between items, a disabled group's tokens and a vertical group's full-width items. toggle, a
// Supporting item, is measured here through toggle-group's items and has no screen of its own.
// The CDS selectors (a ButtonGroup of Buttons) stay for the CDS target and for the widths and
// gaps, which Core's Selection tag does not give.
import { selectionTagCell } from '../core/selection-tag.mjs';

const at = (hook) => `[data-measure=toggle-group-${hook}]`;
const neon = (hook, n) => `${at(hook)} [data-slot=toggle-group-item]:nth-child(${n})`;
const item = (hook, n, check, cell) => ({ cds: `${at(hook)} li:nth-child(${n}) > button`, neon: neon(hook, n), check, core: selectionTagCell(cell) });
// CDS's buttons have no ring, so the baseline holds none: the ring is held to Core alone.
const ring = (hook, n, cell) => ({ neon: neon(hook, n), check: ['border'], core: selectionTagCell(cell) });
const look = ['h', 'w', 'pad', 'radius', 'font', 'color', 'bg'];
const pressed = (cell) => ({ ...cell, Selected: 'True' });
const [sm, lg, off] = [{ Size: 'Small' }, { Size: 'Large' }, { State: 'Disabled' }];

export const screens = [
  {
    targets: {
      defaultPressed: item('default', 1, look, pressed({})),
      defaultUnpressed: item('default', 2, look, {}),
      defaultPressedLast: item('default', 3, ['h', 'w', 'bg'], pressed({})),
      defaultPressedRing: ring('default', 1, pressed({})),
      defaultUnpressedRing: ring('default', 2, {}),
      smPressed: item('sm', 2, look, pressed(sm)),
      smUnpressed: item('sm', 1, look, sm),
      smUnpressedLast: item('sm', 3, ['h', 'w'], sm),
      smPressedRing: ring('sm', 2, pressed(sm)),
      smUnpressedRing: ring('sm', 1, sm),
      lgPressed: item('lg', 1, look, pressed(lg)),
      lgUnpressed: item('lg', 2, look, lg),
      lgPressedRing: ring('lg', 1, pressed(lg)),
      lgUnpressedRing: ring('lg', 2, lg),
      disabledPressed: item('disabled', 1, ['h', 'color', 'bg', 'opacity'], pressed(off)),
      disabledUnpressed: item('disabled', 2, ['h', 'color', 'bg', 'opacity'], off),
      disabledPressedRing: ring('disabled', 1, pressed(off)),
      disabledUnpressedRing: ring('disabled', 2, off),
      verticalPressed: item('vertical', 1, ['h', 'w', 'bg'], pressed({})),
      verticalUnpressed: item('vertical', 2, ['h', 'w', 'bg'], {}),
    },
    gaps: [
      ['defaultPressed', 'defaultUnpressed', 'x'],
      ['defaultUnpressed', 'defaultPressedLast', 'x'],
      ['smUnpressed', 'smPressed', 'x'],
      ['lgPressed', 'lgUnpressed', 'x'],
      ['disabledPressed', 'disabledUnpressed', 'x'],
      ['verticalPressed', 'verticalUnpressed', 'y'],
      ['defaultPressed', 'smUnpressed', 'y'],
    ],
  },
];

// Radix's keyboard model: one Tab stop per group, which lands on its first
// pressed item; arrows move focus without pressing, Space and Enter press. Single mode is a radio group, so pressing
// one item releases the other; multiple mode is a toolbar of aria-pressed
// buttons, each pressed on its own. Core's Selection tag has no Focus state: keyboard focus
// draws Focus/focus 2px wide round the tag, outside its ring.
export function a11y({ test, expect, gotoExpansion, keyboardFocus }) {
  test('a toggle reached from the keyboard shows a focus indicator', async ({ page }) => {
    await gotoExpansion(page);
    const stock = page.getByRole('toolbar', { name: 'สินทรัพย์ / Assets' }).getByRole('button', { name: 'หุ้น' });
    const focus = await keyboardFocus(page, stock);
    await expect(stock).toBeFocused();
    expect(focus.focusVisible).toBe(true);
    expect(focus.after, 'the focused toggle draws an indicator').not.toBe('');
    expect(focus.after, 'the focused toggle looks different').not.toBe(focus.before);
    // The ring inside still tells pressed from not: 2px in the tag's ink.
    await expect(stock).toHaveCSS('outline-width', '2px');
    await expect(stock).toHaveCSS('outline-offset', '-2px');
  });

  test('single mode: arrows move focus, Space and Enter choose one item and release the other', async ({ page }) => {
    await gotoExpansion(page);
    const group = page.getByRole('radiogroup', { name: 'ช่วงเวลา / Period' });
    const [day, week, month] = ['วัน / 1D', 'สัปดาห์ / 1W', 'เดือน / 1M'].map((name) => group.getByRole('radio', { name }));
    await expect(week).toBeChecked();
    await week.focus();
    await page.keyboard.press('ArrowRight');
    await expect(month).toBeFocused();
    await expect(week, 'an arrow moves focus only').toBeChecked();
    await page.keyboard.press('Space');
    await expect(month).toBeChecked();
    await expect(week).not.toBeChecked();
    await page.keyboard.press('ArrowRight');
    await expect(day, 'focus wraps round the group').toBeFocused();
    await page.keyboard.press('Enter');
    await expect(day).toBeChecked();
    await expect(month).not.toBeChecked();
  });

  test('multiple mode: arrows move focus, Space and Enter press each item on its own', async ({ page }) => {
    await gotoExpansion(page);
    const group = page.getByRole('toolbar', { name: 'สินทรัพย์ / Assets' });
    const [stock, fund, gold] = ['หุ้น', 'กองทุน', 'ทอง'].map((name) => group.getByRole('button', { name }));
    await expect(stock).toHaveAttribute('aria-pressed', 'true');
    await expect(fund).toHaveAttribute('aria-pressed', 'false');
    await stock.focus();
    await page.keyboard.press('ArrowRight');
    await expect(fund).toBeFocused();
    await page.keyboard.press('Space');
    for (const pressed of [stock, fund, gold]) await expect(pressed).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(stock).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(stock).toHaveAttribute('aria-pressed', 'false');
    await expect(fund).toHaveAttribute('aria-pressed', 'true');
  });

  test('a disabled group takes no presses', async ({ page }) => {
    await gotoExpansion(page);
    const group = page.getByRole('toolbar', { name: 'ความเสี่ยง / Risk' });
    for (const name of ['ต่ำ / Low', 'สูง / High']) await expect(group.getByRole('button', { name })).toBeDisabled();
    await expect(group.getByRole('button', { name: 'ต่ำ / Low' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('Thai and English labels stay on one line inside the group at 375 and 1440', async ({ page }) => {
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoExpansion(page);
      await page.evaluate(() => document.fonts.ready);
      const rows = await page.locator('[data-measure=toggle-group] [data-slot=toggle-group]').evaluateAll((groups) => groups.map((group) => {
        const box = group.getBoundingClientRect();
        return [...group.children].map((el) => {
          const item = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          const text = item.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
          return { label: el.textContent, lines: Math.round(text / parseFloat(style.lineHeight)), inside: item.right <= box.right + 0.5 && el.scrollWidth <= el.clientWidth };
        });
      }).flat());
      for (const row of rows) {
        expect(row.lines, `${width}px ${row.label}`).toBe(1);
        expect(row.inside, `${width}px ${row.label}`).toBe(true);
      }
    }
  });
}
