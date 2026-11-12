// progress → Core's Progress bar: the Track's height, radius and color, and
// the Indicator's, at each Size and Status. The Indicator is track-wide and
// slides with translateX, so its width says nothing; the signed gap from the
// fill's end to the track's start (−value × track width) shows how far it reaches.
import { progressCell } from '../core/progress-bar.mjs';

const hook = '[data-measure=progress-default]';
const box = ['h', 'radius', 'bg'];
const track = (name, cell) => ({ neon: `[data-measure=progress-${name}] [data-slot=progress]`, check: box, core: progressCell('track', cell) });
const indicator = (name, cell) => ({ neon: `[data-measure=progress-${name}] [data-slot=progress-indicator]`, check: box, core: progressCell('indicator', cell) });
// Core pairs Success and Error with a full bar only.
const done = (Status) => ({ Status, Progress: '100%' });

export const screens = [
  {
    targets: {
      progressTrack: { cds: `${hook} [role=progressbar]`, neon: `${hook} [data-slot=progress]`, check: ['h', 'w', 'radius', 'bg'], core: progressCell('track') },
      progressFill: { cds: `${hook} [data-testid=cds-progress-bar]`, neon: `${hook} [data-slot=progress-indicator]`, check: box, core: progressCell('indicator') },
      progressSmallTrack: track('small', { Size: 'Small' }),
      progressSmallFill: indicator('small', { Size: 'Small' }),
      progressLargeTrack: track('large', { Size: 'Large' }),
      progressLargeFill: indicator('large', { Size: 'Large' }),
      progressSuccessFill: indicator('success', done('Success')),
      progressErrorFill: indicator('error', done('Error')),
      progressIndeterminateTrack: track('indeterminate', { Progress: 'Indeterminate' }),
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

  // Core's Indeterminate: no Indicator and no value, a Segment 72% of the Track wide, centred.
  test('a progress bar with no value draws Core\'s Segment and states no value', async ({ page }) => {
    await gotoExpansion(page);
    const bar = page.locator('[data-measure=progress-indeterminate]').getByRole('progressbar', { name: 'กำลังเตรียม / Preparing' });
    await expect(bar).not.toHaveAttribute('aria-valuenow');
    await expect(bar.locator('[data-slot=progress-indicator]')).toHaveCount(0);
    const [track, segment] = [await bar.boundingBox(), await bar.locator('[data-slot=progress-segment]').boundingBox()];
    expect(Math.round((segment.width / track.width) * 100)).toBe(72);
    expect(Math.round(((segment.x - track.x) / track.width) * 100)).toBe(14);
  });
}
