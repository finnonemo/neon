// progress → CDS ProgressBar: the track's height, radius and color, and the
// fill's. Both sides draw the fill track-wide and slide it with translateX, so
// its width says nothing; the signed gap from the fill's end to the track's
// start (−value × track width) shows how far it reaches.
const hook = '[data-measure=progress-default]';

export const screens = [
  {
    targets: {
      progressTrack: { cds: `${hook} [role=progressbar]`, neon: `${hook} [data-slot=progress]`, check: ['h', 'w', 'radius', 'bg'] },
      progressFill: { cds: `${hook} [data-testid=cds-progress-bar]`, neon: `${hook} [data-slot=progress-indicator]`, check: ['h', 'radius', 'bg'] },
    },
    gaps: [['progressFill', 'progressTrack', 'x']],
  },
];

export function a11y({ test, expect, gotoExpansion }) {
  test('progress exposes its name and value to assistive tech', async ({ page }) => {
    await gotoExpansion(page);
    const bar = page.locator('[data-measure=progress]').getByRole('progressbar', { name: 'อัปโหลดเอกสาร / Uploading documents' });
    await expect(bar).toHaveAttribute('aria-valuenow', '60');
    await expect(bar).toHaveAttribute('aria-valuemin', '0');
    await expect(bar).toHaveAttribute('aria-valuemax', '100');
  });
}
