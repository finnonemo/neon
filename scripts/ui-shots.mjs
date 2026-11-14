#!/usr/bin/env node
// Captures a page as viewport-sized tiles and element clips at reduced scale,
// so an agent can look at a rendered UI without reading a full-page,
// full-resolution PNG. WebGL renders through SwiftShader, so three.js canvases
// draw in headless Chromium instead of timing out a full-page capture.
//   node scripts/ui-shots.mjs <url> [--sizes 375x812,1440x900] [--select <css>]...
//     [--scale 0.5] [--tiles 4] [--wait 1500] [--out .local/shots]
// A selected element with no box of its own (display: contents, as the eval fixtures' data-measure hooks are) is
// captured as the area its descendants cover. A selector that cannot be captured gets a line and the run goes on.
// Uses the Playwright that evals/templates installs:
//   npm ci --prefix evals/templates && npx --prefix evals/templates playwright install chromium
import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { INSTALL, loadChromium } from './lib/playwright.mjs';
import { coveringBox, parseSizes, tileOffsets, viewportClip } from './lib/ui-shots.mjs';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    sizes: { type: 'string', default: '375x812,1440x900' },
    select: { type: 'string', multiple: true, default: [] },
    scale: { type: 'string', default: '0.5' },
    tiles: { type: 'string', default: '4' },
    wait: { type: 'string', default: '1500' },
    out: { type: 'string', default: '.local/shots' },
  },
});
const [url] = positionals;
if (!url) {
  console.error('Usage: node scripts/ui-shots.mjs <url> [--sizes 375x812,1440x900] [--select <css>]... [--scale 0.5] [--tiles 4] [--wait 1500] [--out .local/shots]');
  process.exit(2);
}

const chromium = await loadChromium();
if (!chromium) {
  console.error(`Playwright is not installed. Run \`${INSTALL}\`.`);
  process.exit(2);
}

const out = resolve(values.out);
await mkdir(out, { recursive: true });
const scale = Number(values.scale);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const written = [];
try {
  for (const [width, height] of parseSizes(values.sizes)) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(Number(values.wait));
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const offsets = tileOffsets(scrollHeight, height, Number(values.tiles));
    for (const [i, y] of offsets.entries()) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(400);
      const path = join(out, `${width}-tile${i + 1}.png`);
      await page.screenshot({ path });
      written.push(`${path}  (y ${y}–${y + height} of ${scrollHeight})`);
    }
    for (const [i, selector] of values.select.entries()) {
      const target = page.locator(selector).first();
      if (!(await target.count())) {
        written.push(`${width} ${selector}: no match`);
        continue;
      }
      const path = join(out, `${width}-select${i + 1}.png`);
      try {
        const own = await target.boundingBox();
        if (own?.width && own?.height) {
          await target.scrollIntoViewIfNeeded();
          await page.waitForTimeout(400);
          await target.screenshot({ path });
          written.push(`${path}  (${selector})`);
          continue;
        }
        const box = coveringBox(await target.evaluate((element) => [...element.querySelectorAll('*')].map((child) => {
          const { x, y, width, height } = child.getBoundingClientRect();
          return { x: x + window.scrollX, y: y + window.scrollY, width, height };
        })));
        if (box) {
          await page.evaluate(({ x, y }) => window.scrollTo(x, y), box);
          await page.waitForTimeout(400);
        }
        const shown = box && viewportClip(box, await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY })), { width, height });
        if (!shown) {
          written.push(`${width} ${selector}: not visible`);
          continue;
        }
        await page.screenshot({ path, clip: shown.clip });
        written.push(`${path}  (${selector}: the area its descendants cover${shown.cut ? ', cut at the viewport' : ''})`);
      } catch (error) {
        written.push(`${width} ${selector}: ${error.message.split('\n')[0]}`);
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(written.join('\n'));
