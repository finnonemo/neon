// switch → Core's Toggle (Style=Toggle only), off, on, and disabled off and on: the track's
// size, fill and padding and the thumb's size and fill. The label beside it is the fixture's, as
// Toggle only has none, and stays on the CDS baseline with the thumb's hairline. The thumb →
// label gap shows where the thumb sits, so it tells off from on.
import { toggleCell } from '../core/toggle.mjs';

const at = (hook) => `[data-measure=${hook}]`;
const parts = (state, hook, cell) => ({
  [`${state}Track`]: { cds: `${at(hook)} [data-testid=switch-track]`, neon: `${at(hook)} [data-slot=switch]`, check: ['h', 'w', 'radius', 'bg', 'pad', 'opacity'], core: toggleCell('track', cell) },
  [`${state}Thumb`]: { cds: `${at(hook)} [data-testid=switch-thumb]`, neon: `${at(hook)} [data-slot=switch-thumb]`, check: ['h', 'w', 'radius', 'bg', 'border', 'opacity'], core: toggleCell('thumb', cell) },
  [`${state}Label`]: { cds: `${at(hook)} label span[id]`, neon: `${at(hook)} label`, check: ['font', 'color', 'opacity'] },
});
const partGaps = (state) => [[`${state}Track`, `${state}Label`, 'x'], [`${state}Thumb`, `${state}Label`, 'x'], [`${state}Track`, `${state}Thumb`, 'y']];
const states = [
  ['off', 'switch-off', {}],
  ['on', 'switch-on', { Toggled: 'True' }],
  ['disabledOff', 'switch-disabled-off', { State: 'Disabled' }],
  ['disabledOn', 'switch-disabled-on', { State: 'Disabled', Toggled: 'True' }],
];

export const screens = [{
  targets: Object.assign({}, ...states.map(([state, hook, cell]) => parts(state, hook, cell))),
  gaps: [...states.flatMap(([state]) => partGaps(state)), ['offTrack', 'onTrack', 'y'], ['onTrack', 'disabledOffTrack', 'y']],
}];

// Radix's keyboard model: Space flips a focused switch; a disabled one stays put. Core's web
// Toggle draws no Focus state, so keyboard focus shows the Button's indicator: Focus/focus, 2px
// wide, 2px out.
export function a11y({ test, expect, gotoExpansion, keyboardFocus, focusColor }) {
  test('a switch reached from the keyboard shows a focus indicator', async ({ page }) => {
    await gotoExpansion(page);
    const alerts = page.locator(at('switch-off')).getByRole('switch', { name: 'แจ้งเตือน / Alerts' });
    const focus = await keyboardFocus(page, alerts);
    await expect(alerts).toBeFocused();
    expect(focus.focusVisible).toBe(true);
    expect(focus.before).toBe('');
    expect(focus.after).toBe(`outline 2px ${await focusColor(page)} 2px`);
  });

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
