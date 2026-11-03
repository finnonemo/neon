// switch → CDS Switch, off, on, and disabled off and on: the track's size,
// fill and padding, the thumb's size, fill and hairline, and the label beside
// it. The thumb → label gap shows where the thumb sits, so it tells off from on.
const states = { off: 'switch-off', on: 'switch-on', disabledOff: 'switch-disabled-off', disabledOn: 'switch-disabled-on' };

const targets = {};
const gaps = [];
for (const [state, hook] of Object.entries(states)) {
  const at = `[data-measure=${hook}]`;
  targets[`${state}Track`] = { cds: `${at} [data-testid=switch-track]`, neon: `${at} [data-slot=switch]`, check: ['h', 'w', 'radius', 'bg', 'pad', 'opacity'] };
  targets[`${state}Thumb`] = { cds: `${at} [data-testid=switch-thumb]`, neon: `${at} [data-slot=switch-thumb]`, check: ['h', 'w', 'radius', 'bg', 'border', 'opacity'] };
  targets[`${state}Label`] = { cds: `${at} label span[id]`, neon: `${at} label`, check: ['font', 'color', 'opacity'] };
  gaps.push([`${state}Track`, `${state}Label`, 'x'], [`${state}Thumb`, `${state}Label`, 'x'], [`${state}Track`, `${state}Thumb`, 'y']);
}
gaps.push(['offTrack', 'onTrack', 'y'], ['onTrack', 'disabledOffTrack', 'y']);

export const screens = [{ name: 'expansion-switch', query: 'layout=expansion', targets, gaps }];

// Radix's keyboard model: Space flips a focused switch; a disabled one stays put.
export function a11y({ test, expect }) {
  test('a switch is named by its label and flips with Space', async ({ page }) => {
    await page.goto('/?layout=expansion');
    const alerts = page.locator('[data-measure=switch-off]').getByRole('switch', { name: 'แจ้งเตือน / Alerts' });
    await expect(alerts).not.toBeChecked();
    await alerts.focus();
    await page.keyboard.press('Space');
    await expect(alerts).toBeChecked();
    await page.keyboard.press('Space');
    await expect(alerts).not.toBeChecked();
    const verified = page.locator('[data-measure=switch-disabled-on]').getByRole('switch', { name: 'ยืนยันตัวตน / Verified' });
    await expect(verified).toBeChecked();
    await expect(verified).toBeDisabled();
  });
}
