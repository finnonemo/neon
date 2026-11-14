#!/usr/bin/env node
// Puts two ui-shots.mjs runs side by side in one picture, so a visible change has a before and after
// a reviewer can open:
//   node scripts/ui-shots.mjs <url> --select <css> --out .local/shots/before     (on the base)
//   node scripts/ui-shots.mjs <url> --select <css> --out .local/shots/after      (on the branch)
//   node scripts/before-after.mjs .local/shots/before .local/shots/after
//     [--match select] [--width 720] [--out .local/shots/before-after.png]
// Pairs the PNGs by file name, so both runs take the same --sizes and --select in the same order.
// --match keeps the names that contain it (select for the element clips, 375 for one width). A file
// only one run wrote keeps its row, with the other side marked not captured.
// Uses the Playwright that evals/templates installs:
//   npm ci --prefix evals/templates && npx --prefix evals/templates playwright install chromium
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { INSTALL, loadChromium } from './lib/playwright.mjs';
import { montageHtml, pairShots } from './lib/ui-shots.mjs';

const USAGE = 'Usage: node scripts/before-after.mjs <before dir> <after dir> [--match <text>] [--width 720] [--out .local/shots/before-after.png]';
const fail = (message, code = 1) => {
  console.error(message);
  process.exit(code);
};

let values;
let positionals;
try {
  ({ values, positionals } = parseArgs({
    allowPositionals: true,
    options: { match: { type: 'string', default: '' }, width: { type: 'string', default: '720' }, out: { type: 'string', default: '.local/shots/before-after.png' } },
  }));
} catch (error) {
  fail(`${error.message}\n${USAGE}`, 2);
}
const [before, after] = positionals;
const width = Number(values.width);
if (!before || !after || positionals.length > 2 || !(width > 0)) fail(USAGE, 2);

const list = (directory) => readdir(directory).catch(() => fail(`${directory} is not a directory ui-shots.mjs wrote to.`));
const pairs = pairShots(await list(before), await list(after), values.match);
if (!pairs.length) fail(`No PNG${values.match ? ` named *${values.match}*` : ''} in ${before} or ${after}.`);

const chromium = await loadChromium();
if (!chromium) fail(`Playwright is not installed. Run \`${INSTALL}\`.`, 2);

const src = async (directory, name) => `data:image/png;base64,${(await readFile(join(directory, name))).toString('base64')}`;
const rows = await Promise.all(pairs.map(async (pair) => ({ name: pair.name, before: pair.before ? await src(before, pair.name) : null, after: pair.after ? await src(after, pair.name) : null })));

const out = resolve(values.out);
await mkdir(dirname(out), { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: width * 2 + 80, height: 600 } });
  await page.setContent(montageHtml(rows, { width }), { waitUntil: 'load' });
  await page.locator('main').screenshot({ path: out });
} finally {
  await browser.close();
}
const alone = pairs.filter((pair) => !pair.before || !pair.after);
console.log(`${out}  (${pairs.length - alone.length} of ${pairs.length} in both runs)`);
for (const pair of alone) console.log(`${pair.name}: ${pair.before ? 'before' : 'after'} only`);
