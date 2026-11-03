// button-group → CDS ButtonGroup: separate pill buttons 8px apart, never
// joined, in a group as wide as its container. Horizontal keeps each button's
// own size and type; vertical fills the group's width with each button.
const horizontal = '[data-measure=button-group-horizontal]';
const vertical = '[data-measure=button-group-vertical]';
const cdsButton = (group, n) => `${group} ul > li:nth-child(${n}) > button`;
const neonButton = (group, n) => `${group} [data-slot=button-group] > :nth-child(${n})`;
const look = ['h', 'w', 'radius', 'border', 'bg', 'color', 'font', 'pad'];

export const screens = [
  {
    targets: {
      group: { cds: `${horizontal} ul`, neon: `${horizontal} [data-slot=button-group]`, check: ['h', 'w'] },
      first: { cds: cdsButton(horizontal, 1), neon: neonButton(horizontal, 1), check: look },
      second: { cds: cdsButton(horizontal, 2), neon: neonButton(horizontal, 2), check: look },
      stackedFirst: { cds: cdsButton(vertical, 1), neon: neonButton(vertical, 1), check: look },
      stackedSecond: { cds: cdsButton(vertical, 2), neon: neonButton(vertical, 2), check: look },
    },
    gaps: [
      ['first', 'second', 'x'],
      ['stackedFirst', 'stackedSecond', 'y'],
    ],
  },
];

// The group is a named group of ordinary buttons, reached in order by Tab.
// Its labels stay on one line inside the group at 375 and 1440.
export function a11y({ test, expect, gotoExpansion }) {
  test('a button group is named and its buttons are reached in order', async ({ page }) => {
    await gotoExpansion(page);
    const group = page.locator(horizontal).getByRole('group', { name: 'คำสั่ง / Actions' });
    const buy = group.getByRole('button', { name: 'ซื้อ / Buy' });
    const sell = group.getByRole('button', { name: 'ขาย / Sell' });
    await buy.focus();
    await page.keyboard.press('Tab');
    await expect(sell).toBeFocused();
    await expect(page.locator(vertical).getByRole('group', { name: 'ส่งออก / Export' }).getByRole('button')).toHaveCount(2);
  });

  test('Thai and English labels stay on one line inside the group at 375 and 1440', async ({ page }) => {
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoExpansion(page);
      await page.evaluate(() => document.fonts.ready);
      const rows = await page.locator('[data-measure^=button-group] [data-slot=button-group]').evaluateAll((groups) => groups.map((group) => {
        const box = group.getBoundingClientRect();
        return [...group.children].map((el) => {
          const item = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          const text = item.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
          return { label: el.textContent, lines: Math.round(text / parseFloat(style.lineHeight)), inside: item.right <= box.right + 0.5 && el.scrollWidth <= el.clientWidth };
        });
      }).flat());
      expect(rows.length).toBe(4);
      for (const row of rows) {
        expect(row.lines, `${width}px ${row.label}`).toBe(1);
        expect(row.inside, `${width}px ${row.label}`).toBe(true);
      }
    }
  });
}
