// separator → Core's Divider: the line's weight and color. Core's Divider is
// horizontal only, so the vertical one takes its color and stroke alone. The
// texts either side are measured only for the gaps, which show the line brings
// no margin of its own.
import { dividerCell } from '../core/divider.mjs';

const horizontal = '[data-measure=separator-horizontal]';
const vertical = '[data-measure=separator-vertical]';
const inset = '[data-measure=separator-inset]';
const line = ['h', 'w', 'bg', 'border'];

export const screens = [
  {
    targets: {
      separatorHorizontal: { cds: `${horizontal} hr`, neon: `${horizontal} [data-slot=separator]`, check: line, core: dividerCell() },
      separatorVertical: { cds: `${vertical} hr`, neon: `${vertical} [data-slot=separator]`, check: line, core: dividerCell(), coreProperties: ['bg', 'border'] },
      separatorInset: { neon: `${inset} [data-slot=separator]`, check: ['h', 'bg', 'border'], core: dividerCell({ Inset: 'Start' }) },
    },
    extraTargets: {
      above: { cds: `${horizontal} p:nth-of-type(1)`, neon: `${horizontal} p:nth-of-type(1)`, check: [] },
      below: { cds: `${horizontal} p:nth-of-type(2)`, neon: `${horizontal} p:nth-of-type(2)`, check: [] },
      before: { cds: `${vertical} p:nth-of-type(1)`, neon: `${vertical} p:nth-of-type(1)`, check: [] },
      after: { cds: `${vertical} p:nth-of-type(2)`, neon: `${vertical} p:nth-of-type(2)`, check: [] },
    },
    gaps: [
      ['above', 'separatorHorizontal', 'y'],
      ['separatorHorizontal', 'below', 'y'],
      ['before', 'separatorVertical', 'x'],
      ['separatorVertical', 'after', 'x'],
    ],
  },
];

export function a11y({ test, expect, gotoExpansion }) {
  test('a separator is decorative by default and a separator only when marked semantic', async ({ page }) => {
    await gotoExpansion(page);
    const section = page.locator('[data-measure=separator]');
    await expect(section.locator('[data-slot=separator]')).toHaveCount(3);
    await expect(section.getByRole('separator')).toHaveCount(1);
    await expect(page.locator(horizontal).getByRole('separator')).toHaveCount(0);
    await expect(page.locator(vertical).getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  // Core's Inset=Start: the Container pads its left 16, and the line ends where the plain one does.
  test('an inset separator starts 16px in and ends at its container\'s edge', async ({ page }) => {
    await gotoExpansion(page);
    const [plain, inner] = await Promise.all([horizontal, inset].map((hook) => page.locator(`${hook} [data-slot=separator]`).boundingBox()));
    expect(Math.round(inner.x - plain.x)).toBe(16);
    expect(Math.round(inner.x + inner.width)).toBe(Math.round(plain.x + plain.width));
  });
}
