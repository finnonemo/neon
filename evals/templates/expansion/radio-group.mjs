// radio-group → CDS RadioGroup: the group's headline label, then a checked and
// an unchecked option (ring, dot and label) and the spacing between them, in
// an enabled group and a disabled one.
const enabled = '[data-measure=radio-group-enabled]';
const disabled = '[data-measure=radio-group-disabled]';
// CDS renders the group label, then one .cds-Control per option, as siblings.
const cdsOption = (group, n) => `${group} [role=radiogroup] > .cds-Control:nth-child(${n + 1})`;
const neonOption = (group, n) => `${group} [data-slot=radio-group] > :nth-child(${n})`;
const ring = ['h', 'w', 'radius', 'bg', 'border', 'opacity'];

const option = (group, n, check = ring) => ({
  ring: { cds: `${cdsOption(group, n)} [data-filled]`, neon: `${neonOption(group, n)} [data-slot=radio-group-item]`, check },
  dot: { cds: `${cdsOption(group, n)} [data-testid=radio-icon] circle`, neon: `${neonOption(group, n)} [data-slot=radio-group-indicator]`, check: ['h', 'w', 'color', 'opacity'] },
  label: { cds: `${cdsOption(group, n)} label span[id]`, neon: `${neonOption(group, n)} label`, check: ['font', 'color', 'opacity'] },
});

const checked = option(enabled, 1);
const unchecked = option(enabled, 2);
const disabledChecked = option(disabled, 1);
const disabledUnchecked = option(disabled, 2);

export const screens = [
  {
    name: 'expansion-radio-group',
    query: 'layout=expansion',
    targets: {
      groupLabel: { cds: `${enabled} [role=radiogroup] > :first-child`, neon: `${enabled} p`, check: ['font', 'color'] },
      checkedRing: checked.ring,
      checkedDot: checked.dot,
      checkedLabel: checked.label,
      uncheckedRing: unchecked.ring,
      uncheckedLabel: unchecked.label,
      disabledCheckedRing: disabledChecked.ring,
      disabledCheckedDot: disabledChecked.dot,
      disabledCheckedLabel: disabledChecked.label,
      disabledUncheckedRing: disabledUnchecked.ring,
      disabledUncheckedLabel: disabledUnchecked.label,
    },
    gaps: [
      ['groupLabel', 'checkedLabel', 'y'],
      ['checkedRing', 'checkedLabel', 'x'],
      ['checkedRing', 'uncheckedRing', 'y'],
      ['checkedLabel', 'uncheckedLabel', 'y'],
      ['checkedRing', 'checkedDot', 'y'],
      ['uncheckedRing', 'disabledCheckedRing', 'y'],
    ],
  },
];

// Radix's keyboard model: the arrow keys move focus and the choice together,
// and a disabled group takes neither.
export function a11y({ test, expect }) {
  test('a radio group is named by its label and the arrow keys move its choice', async ({ page }) => {
    await page.goto('/?layout=expansion');
    const group = page.getByRole('radiogroup', { name: 'บัญชีรับเงิน / Payout' });
    const bank = group.getByRole('radio', { name: 'ธนาคาร / Bank' });
    const wallet = group.getByRole('radio', { name: 'วอลเล็ต / Wallet' });
    await expect(bank).toBeChecked();
    await bank.focus();
    // Radix checks the radio its focus lands on only while the arrow is still down.
    await page.keyboard.down('ArrowDown');
    await expect(wallet).toBeChecked();
    await page.keyboard.up('ArrowDown');
    await expect(wallet).toBeFocused();
    await expect(bank).not.toBeChecked();
    await page.keyboard.down('ArrowUp');
    await expect(bank).toBeChecked();
    await page.keyboard.up('ArrowUp');
    await expect(bank).toBeFocused();

    const frequency = page.getByRole('radiogroup', { name: 'รอบการลงทุน / Frequency' });
    await expect(frequency.getByRole('radio', { name: 'รายเดือน / Monthly' })).toBeChecked();
    for (const radio of await frequency.getByRole('radio').all()) await expect(radio).toBeDisabled();
  });
}
