// The Neon base's layouts must keep the CDS starter's geometry: the sidebar,
// panes, toolbars, bottom navigation and nav links within ±1px, and no page
// overflow, at each named width. The baseline is captured from the CDS
// fixtures (npm run baseline) into fixtures/cds-layout-baseline.json.
// Elements are found by structure alone, so the frozen starter needs no hooks.
import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const target = process.env.NEON_TARGET ?? 'cds';
const capture = process.env.NEON_CAPTURE_BASELINE === '1';
const baselinePath = fileURLToPath(new URL('./fixtures/cds-layout-baseline.json', import.meta.url));
if (capture && target !== 'cds') throw new Error('The baseline is captured from the CDS target only.');
const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : null;

const layouts = ['app', 'content', 'simple', 'board', 'immersive'];
const widths = [375, 768, 1024, 1280, 1440, 1920];

// Each layout element four levels deep, keyed by its child-index path. A pane's
// toolbar and scroll body are measured but not entered: what they hold is the
// fixture's content, not the layout. A link counts with its first child (the
// logo image or nav icon), whose insides differ: a CDS glyph, a lucide svg.
function measureLayout() {
  const box = el => {
    const r = el.getBoundingClientRect();
    return r.width === 0 && r.height === 0 ? 'hidden' : [r.x, r.y, r.width, r.height].map(Math.round);
  };
  const link = a => [box(a), a.firstElementChild ? box(a.firstElementChild) : 'empty'];
  const boxes = {};
  const walk = (el, path, depth) => {
    [...el.children].forEach((child, i) => {
      const key = path ? `${path}.${i}` : `${i}`;
      boxes[key] = child.matches('a') ? link(child) : box(child);
      const leaf = child.matches('a, [data-pane-control]') || getComputedStyle(child).overflowY === 'auto';
      if (depth < 4 && !leaf) walk(child, key, depth + 1);
    });
  };
  const root = document.querySelector('.neon-layout');
  boxes.root = box(root);
  walk(root, '', 1);
  return {
    boxes,
    links: [...root.querySelectorAll('nav a')].map(link),
    overflow: document.documentElement.scrollWidth > innerWidth,
  };
}

async function measure(page, layout, width) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`/?layout=${layout}`);
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(measureLayout);
}

const cases = layouts.flatMap(layout => widths.map(width => ({ layout, width })));
const caseKey = ({ layout, width }) => `${layout}@${width}`;

if (capture) {
  test('capture the CDS layout baseline', async ({ page }) => {
    test.setTimeout(120_000);
    const out = {};
    for (const entry of cases) out[caseKey(entry)] = await measure(page, entry.layout, entry.width);
    // One case per line keeps the baseline's diffs readable.
    writeFileSync(baselinePath, `{\n${Object.entries(out).map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)}`).join(',\n')}\n}\n`);
  });
} else {
  for (const entry of cases) {
    test(`${target} ${caseKey(entry)} keeps the CDS layout geometry`, async ({ page }) => {
      expect(baseline, 'Run npm run baseline first.').not.toBeNull();
      const want = baseline[caseKey(entry)];
      expect(want, `${caseKey(entry)} is missing from the baseline; run npm run baseline.`).toBeTruthy();
      const got = await measure(page, entry.layout, entry.width);
      const differs = (a, b) => typeof a === 'string' || typeof b === 'string' ? a !== b
        : Array.isArray(a[0]) || Array.isArray(b[0]) ? a.length !== b.length || a.some((v, i) => differs(v, b[i]))
        : a.some((v, i) => Math.abs(v - b[i]) > 1);
      const problems = [];
      for (const key of new Set([...Object.keys(want.boxes), ...Object.keys(got.boxes)])) {
        const [a, b] = [got.boxes[key], want.boxes[key]];
        if (!a || !b || differs(a, b)) problems.push(`${key}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`);
      }
      if (got.links.length !== want.links.length) problems.push(`${got.links.length} nav links ≠ ${want.links.length}`);
      else got.links.forEach((link, i) => { if (differs(link, want.links[i])) problems.push(`nav link ${i}: ${JSON.stringify(link)} ≠ ${JSON.stringify(want.links[i])}`); });
      if (got.overflow !== want.overflow) problems.push(`page overflow ${got.overflow} ≠ ${want.overflow}`);
      expect(problems, problems.join('\n')).toEqual([]);
    });
  }
}
