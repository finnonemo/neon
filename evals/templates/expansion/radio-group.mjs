// radio-group → Core's Radio (Type=Inset): the group's headline label, then a chosen and an
// unchosen option (the Box, the glyph in it and the Value beside it) and the spacing between
// them, in an enabled group and a disabled one. The CDS selectors stay for the CDS target and
// for what Core's Radio does not give (the group label, the gaps).
import { radioCell } from '../core/radio.mjs';

const enabled = '[data-measure=radio-group-enabled]';
const disabled = '[data-measure=radio-group-disabled]';
// CDS renders the group label, then one .cds-Control per option, as siblings.
const cdsOption = (group, n) => `${group} [role=radiogroup] > .cds-Control:nth-child(${n + 1})`;
const neonOption = (group, n) => `${group} [data-slot=radio-group] > :nth-child(${n})`;
const ring = ['h', 'w', 'radius', 'bg', 'border', 'opacity'];

const glyph = ['h', 'w', 'color', 'opacity'];
const option = (group, n, cell) => ({
  ring: { cds: `${cdsOption(group, n)} [data-filled]`, neon: `${neonOption(group, n)} [data-slot=radio-group-item]`, check: ring, core: radioCell('box', cell) },
  dot: { cds: `${cdsOption(group, n)} [data-testid=radio-icon] circle`, neon: `${neonOption(group, n)} [data-slot=radio-group-indicator]`, check: glyph, core: radioCell('glyph', cell) },
  // CDS draws no dot in an option not chosen; Core's glyph is always there.
  glyph: { neon: `${neonOption(group, n)} [data-slot=radio-group-indicator]`, check: glyph, core: radioCell('glyph', cell) },
  label: { cds: `${cdsOption(group, n)} label span[id]`, neon: `${neonOption(group, n)} label`, check: ['font', 'color', 'opacity'], core: radioCell('value', cell) },
});

const checked = option(enabled, 1, { Selection: 'Selected' });
const unchecked = option(enabled, 2, {});
const disabledChecked = option(disabled, 1, { State: 'Disabled', Selection: 'Selected' });
const disabledUnchecked = option(disabled, 2, { State: 'Disabled' });

export const screens = [
  {
    targets: {
      groupLabel: { cds: `${enabled} [role=radiogroup] > :first-child`, neon: `${enabled} p`, check: ['font', 'color'] },
      checkedRing: checked.ring,
      checkedDot: checked.dot,
      checkedLabel: checked.label,
      uncheckedRing: unchecked.ring,
      uncheckedGlyph: unchecked.glyph,
      uncheckedLabel: unchecked.label,
      disabledCheckedRing: disabledChecked.ring,
      disabledCheckedDot: disabledChecked.dot,
      disabledCheckedLabel: disabledChecked.label,
      disabledUncheckedRing: disabledUnchecked.ring,
      disabledUncheckedGlyph: disabledUnchecked.glyph,
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

// Radix's keyboard model: the arrow keys move focus and the choice together, and a disabled
// group takes neither. Keyboard focus is Core's round Focus ring: Focus/focus, 2px wide, its
// outer edge 4px out from the Box.
export function a11y({ test, expect, gotoExpansion, keyboardFocus, focusColor }) {
  test('a radio reached from the keyboard shows a focus indicator', async ({ page }) => {
    await gotoExpansion(page);
    const bank = page.getByRole('radiogroup', { name: 'บัญชีรับเงิน / Payout' }).getByRole('radio', { name: 'ธนาคาร / Bank' });
    const focus = await keyboardFocus(page, bank);
    await expect(bank).toBeFocused();
    expect(focus.focusVisible).toBe(true);
    expect(focus.before).toBe('');
    expect(focus.after).toBe(`outline 2px ${await focusColor(page)} 2px`);
  });

  test('a radio group is named by its label and the arrow keys move its choice', async ({ page }) => {
    await gotoExpansion(page);
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
