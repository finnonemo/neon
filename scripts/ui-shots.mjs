#!/usr/bin/env node
// Captures a page as viewport-sized tiles and element clips at reduced scale,
// so an agent can look at a rendered UI without reading a full-page,
// full-resolution PNG. WebGL renders through SwiftShader, so three.js canvases
// draw in headless Chromium instead of timing out a full-page capture.
//   node scripts/ui-shots.mjs <url> [--sizes 375x812,1440x900] [--select <css>]...
//     [--scale 0.5] [--tiles 4] [--wait 1500] [--out .local/shots]
// Uses the Playwright that evals/templates installs:
//   npm ci --prefix evals/templates && npx --prefix evals/templates playwright install chromium
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { parseSizes, tileOffsets } from './lib/ui-shots.mjs';

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

const evalsPackage = fileURLToPath(new URL('../evals/templates/package.json', import.meta.url));
let chromium;
try {
  const entry = createRequire(evalsPackage).resolve('@playwright/test');
  const playwright = await import(pathToFileURL(entry).href);
  // A CommonJS package: named exports may sit only on the default export.
  chromium = playwright.chromium ?? playwright.default.chromium;
} catch {
  console.error('Playwright is not installed. Run `npm ci --prefix evals/templates && npx --prefix evals/templates playwright install chromium`.');
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
      await target.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const path = join(out, `${width}-select${i + 1}.png`);
      await target.screenshot({ path });
      written.push(`${path}  (${selector})`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(written.join('\n'));
