// switch → CDS Switch, off, on, and disabled off and on: the track's size,
// fill and padding, the thumb's size, fill and hairline, and the label beside
// it. The thumb → label gap shows where the thumb sits, so it tells off from on.
const at = (hook) => `[data-measure=${hook}]`;
const parts = (state, hook) => ({
  [`${state}Track`]: { cds: `${at(hook)} [data-testid=switch-track]`, neon: `${at(hook)} [data-slot=switch]`, check: ['h', 'w', 'radius', 'bg', 'pad', 'opacity'] },
  [`${state}Thumb`]: { cds: `${at(hook)} [data-testid=switch-thumb]`, neon: `${at(hook)} [data-slot=switch-thumb]`, check: ['h', 'w', 'radius', 'bg', 'border', 'opacity'] },
  [`${state}Label`]: { cds: `${at(hook)} label span[id]`, neon: `${at(hook)} label`, check: ['font', 'color', 'opacity'] },
});
const partGaps = (state) => [[`${state}Track`, `${state}Label`, 'x'], [`${state}Thumb`, `${state}Label`, 'x'], [`${state}Track`, `${state}Thumb`, 'y']];
const states = [['off', 'switch-off'], ['on', 'switch-on'], ['disabledOff', 'switch-disabled-off'], ['disabledOn', 'switch-disabled-on']];

export const screens = [{
  targets: Object.assign({}, ...states.map(([state, hook]) => parts(state, hook))),
  gaps: [...states.flatMap(([state]) => partGaps(state)), ['offTrack', 'onTrack', 'y'], ['onTrack', 'disabledOffTrack', 'y']],
}];

// Radix's keyboard model: Space flips a focused switch; a disabled one stays put.
export function a11y({ test, expect, gotoExpansion }) {
  test('a switch is named by its label and flips with Space', async ({ page }) => {
    await gotoExpansion(page);
    const alerts = page.locator(at('switch-off')).getByRole('switch', { name: 'แจ้งเตือน / Alerts' });
    await expect(alerts).not.toBeChecked();
    await alerts.focus();
    await page.keyboard.press('Space');
    await expect(alerts).toBeChecked();
    await page.keyboard.press('Space');
    await expect(alerts).not.toBeChecked();
    const verified = page.locator(at('switch-disabled-on')).getByRole('switch', { name: 'ยืนยันตัวตน / Verified' });
    await expect(verified).toBeChecked();
    await expect(verified).toBeDisabled();
  });
}
