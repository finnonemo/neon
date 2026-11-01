// The Neon base must render like the CDS starter: every measured element within
// ±1px and the same colors, at 375 and 1440, light and dark. The baseline is
// captured from the CDS fixtures (npm run baseline) and is the contract both
// targets are held to; NEON_TARGET picks which app the selectors read.
import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { screens, viewports, modes, measureInPage, gap, pick, compare } from './measure.mjs';

const target = process.env.NEON_TARGET ?? 'cds';
const capture = process.env.NEON_CAPTURE_BASELINE === '1';
const baselinePath = fileURLToPath(new URL('./fixtures/cds-baseline.json', import.meta.url));
if (capture && target !== 'cds') throw new Error('The baseline is captured from the CDS target only.');
const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : null;

async function measureScreen(page, screen, viewport, mode) {
  await page.setViewportSize(viewport);
  // A fixed date keeps the calendar's "today" off the measured day.
  await page.clock.setFixedTime(new Date(2026, 9, 15, 12));
  await page.goto(`/?${screen.query}${mode === 'dark' ? '&mode=dark' : ''}`);
  await page.evaluate(() => document.fonts.ready);
  if (screen.open) {
    const trigger = page.locator(screen.open[target]).first();
    if (screen.open.action === 'focus') await trigger.focus(); else await trigger.click();
  }
  // No element is measured under the pointer: hover colors are not the baseline.
  await page.mouse.move(0, 0);
  const all = { ...screen.targets, ...screen.extraTargets };
  const selectors = Object.fromEntries(Object.entries(all).filter(([, spec]) => spec[target]).map(([name, spec]) => [name, spec[target]]));
  // Wait out entry animations: measure until two reads 150ms apart agree.
  let last = '';
  let measured;
  for (let i = 0; i < 20; i++) {
    measured = await page.evaluate(measureInPage, selectors);
    const key = JSON.stringify(measured);
    if (key === last) break;
    last = key;
    await page.waitForTimeout(150);
  }
  const result = { elements: {}, gaps: {} };
  for (const [name, spec] of Object.entries(screen.targets)) {
    if (name in measured) result.elements[name] = measured[name] && pick(measured[name], spec.check);
  }
  for (const [a, b, axis] of screen.gaps) {
    if (a in measured && b in measured) result.gaps[`${a}→${b}`] = measured[a] && measured[b] ? gap(measured[a], measured[b], axis) : null;
  }
  return result;
}

const cases = viewports.flatMap((viewport) => modes.flatMap((mode) => screens.map((screen) => ({ screen, viewport, mode }))));
const caseKey = ({ screen, viewport, mode }) => `${screen.name}@${viewport.width}-${mode}`;

if (capture) {
  test('capture the CDS baseline', async ({ page }) => {
    test.setTimeout(240_000);
    const out = {};
    for (const entry of cases) out[caseKey(entry)] = await measureScreen(page, entry.screen, entry.viewport, entry.mode);
    const missing = Object.entries(out).flatMap(([key, value]) =>
      Object.entries(value.elements).filter(([, v]) => v === null).map(([name]) => `${key} ${name}`));
    writeFileSync(baselinePath, `${JSON.stringify(out, null, 2)}\n`);
    console.log(`Wrote ${Object.keys(out).length} cases; not rendered: ${missing.length ? missing.join(', ') : 'none'}`);
  });
} else {
  test.describe(`${target} matches the CDS baseline`, () => {
    for (const entry of cases) {
      test(caseKey(entry), async ({ page }) => {
        expect(baseline, 'Run npm run baseline first.').not.toBeNull();
        test.skip(entry.screen.open && !entry.screen.open[target], `${target} has no trigger for ${entry.screen.name} yet`);
        const expected = baseline[caseKey(entry)];
        expect(expected, `${caseKey(entry)} is missing from the baseline; run npm run baseline.`).toBeTruthy();
        const actual = await measureScreen(page, entry.screen, entry.viewport, entry.mode);
        const problems = [];
        for (const [name, want] of Object.entries(expected.elements)) {
          if (!(name in actual.elements)) continue; // no selector for this target yet
          const got = actual.elements[name];
          if (!want || !got) { if (!want !== !got) problems.push(`${name}: ${got ? 'rendered' : 'not rendered'} but the baseline ${want ? 'has it' : 'does not'}`); continue; }
          for (const problem of compare(got, want)) problems.push(`${name}: ${problem}`);
        }
        for (const [name, want] of Object.entries(expected.gaps)) {
          if (!(name in actual.gaps)) continue; // no selector for one side yet
          const got = actual.gaps[name];
          if (got === null || want === null ? got !== want : Math.abs(got - want) > 1) problems.push(`gap ${name}: ${got} ≠ ${want}`);
        }
        expect(problems, problems.join('\n')).toEqual([]);
      });
    }
  });
}
