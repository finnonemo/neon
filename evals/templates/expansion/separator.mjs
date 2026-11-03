// separator → CDS Divider: line weight, color and spacing in both orientations.
// The texts either side are measured only for the gaps, which show the line
// brings no margin of its own.
const horizontal = '[data-measure=separator-horizontal]';
const vertical = '[data-measure=separator-vertical]';
const line = ['h', 'w', 'bg', 'border'];

export const screens = [
  {
    name: 'expansion-separator',
    query: 'layout=expansion',
    targets: {
      separatorHorizontal: { cds: `${horizontal} hr`, neon: `${horizontal} [data-slot=separator]`, check: line },
      separatorVertical: { cds: `${vertical} hr`, neon: `${vertical} [data-slot=separator]`, check: line },
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

// CDS Divider is always role=separator; Neon's is decorative unless marked semantic.
export function a11y({ test, expect }) {
  test('a separator is decorative by default and a separator only when marked semantic', async ({ page }) => {
    await page.goto('/?layout=expansion');
    const section = page.locator('[data-measure=separator]');
    await expect(section.locator('[data-slot=separator]')).toHaveCount(2);
    await expect(section.getByRole('separator')).toHaveCount(1);
    await expect(page.locator('[data-measure=separator-horizontal]').getByRole('separator')).toHaveCount(0);
    await expect(page.locator('[data-measure=separator-vertical]').getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });
}
