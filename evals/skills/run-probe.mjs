#!/usr/bin/env node
// Runs browser-probe.js in headless Chromium, light scheme by default.
//
//   node evals/skills/run-probe.mjs --fixture
//   node evals/skills/run-probe.mjs [--shots .local/shots] [--widths 375,1440] [--scheme dark] [--dark-class] [--json] [name...]
//
// --scheme sets prefers-color-scheme; --dark-class adds `dark` to <html> after
// load, for apps that switch on a class (shadcn's `.dark`).
// --fixture loads probe-fixture.html at 375px and fails unless the ids the
// probe reports per category equal the fixture's expected ids, then again with
// the dark scheme and class against its dark expected ids. Otherwise each
// build under the shots directory (grade-rebuild.mjs --shots), or each named
// one, is served over HTTP and probed at every width, one summary line each.
// Uses @playwright/test from evals/templates (npm ci --prefix evals/templates).
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const here = fileURLToPath(new URL('.', import.meta.url));
const probe = readFileSync(join(here, 'browser-probe.js'), 'utf8');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };

function loadChromium() {
  try {
    return createRequire(new URL('../templates/package.json', import.meta.url))('@playwright/test').chromium;
  } catch {
    throw new Error('Playwright is missing: run `npm ci --prefix evals/templates`.');
  }
}

const elementOf = entry => (typeof entry === 'string' ? entry : entry.element);
const idsOf = entries => entries.map(entry => elementOf(entry).match(/#([\w-]+)/)?.[1] ?? elementOf(entry)).sort();

async function probeAt(browser, url, width, { scheme = 'light', darkClass = false } = {}) {
  const page = await browser.newPage({ viewport: { width, height: width < 768 ? 812 : 900 }, colorScheme: scheme });
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    if (darkClass) await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(300);
    return await page.evaluate(probe);
  } finally {
    await page.close();
  }
}

async function checkFixture(browser) {
  const path = join(here, 'probe-fixture.html');
  const html = readFileSync(path, 'utf8');
  const expectedFor = id => JSON.parse(html.match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)</script>`))[1]);
  const failures = [];
  const passes = [
    { name: 'light', expected: expectedFor('probe-expected') },
    { name: 'dark', expected: expectedFor('probe-expected-dark'), scheme: 'dark', darkClass: true },
  ];
  for (const { name, expected, ...options } of passes) {
    const result = await probeAt(browser, pathToFileURL(path).href, 375, options);
    const reported = { ...result, scrolledOnLoad: result.scrolledOnLoad.elements };
    if (result.viewportWidth !== 375) failures.push(`${name} viewportWidth ${result.viewportWidth}, expected 375`);
    for (const [category, ids] of Object.entries(expected)) {
      const actual = idsOf(reported[category]);
      if (actual.join() !== [...ids].sort().join()) failures.push(`${name} ${category}: reported [${actual}], expected [${[...ids].sort()}]`);
    }
  }
  for (const line of failures) console.log(`FAIL ${line}`);
  if (!failures.length) console.log(`pass probe fixture (${passes.map(({ name, expected }) => `${name}: ${Object.keys(expected).length} categories`).join(', ')})`);
  return failures.length === 0;
}

function serve(root) {
  const server = createServer((request, response) => {
    let path = join(root, decodeURIComponent(new URL(request.url, 'http://x').pathname));
    if (!path.startsWith(root)) path = root;
    if (existsSync(path) && statSync(path).isDirectory()) path = join(path, 'index.html');
    if (!existsSync(path)) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
    createReadStream(path).pipe(response);
  });
  return new Promise(done => server.listen(0, '127.0.0.1', () => done(server)));
}

function summary(name, width, result) {
  const low = result.darkBackgroundControls.filter(entry => entry.contrast < 4.5).map(entry => `${entry.element} ${entry.contrast}`);
  const scrolled = result.scrolledOnLoad.elements.map(entry => `${entry.element} ${entry.scrollLeft}px`);
  const parts = [
    `vw=${result.viewportWidth}`,
    `pageOverflow=${result.horizontalOverflow ? result.documentScrollWidth : 'no'}`,
    `overflowing=${result.overflowingElements.length}`,
    `sideways=${result.sidewaysScrollers.length}`,
    `scrolledOnLoad=${scrolled.length ? `[${scrolled.join('; ')}]` : 'none'}`,
    `lowContrast=${low.length ? `[${low.join('; ')}]` : 'none'}`,
    `sameFill=${result.sameAsParentFill.length ? `[${result.sameAsParentFill.map(entry => `${entry.element} ${entry.contrast}`).join('; ')}]` : 'none'}`,
    `underlinedNav=${result.underlinedNavLinks.length}`,
    `serif=${result.serifTextCount}`,
  ];
  return `${name.padEnd(8)} ${String(width).padStart(4)}  ${parts.join('  ')}`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { fixture: { type: 'boolean' }, shots: { type: 'string', default: '.local/shots' }, widths: { type: 'string', default: '375,1440' }, scheme: { type: 'string', default: 'light' }, 'dark-class': { type: 'boolean' }, json: { type: 'boolean' } },
  });
  const browser = await loadChromium().launch();
  try {
    if (values.fixture) {
      process.exitCode = (await checkFixture(browser)) ? 0 : 1;
    } else {
      const root = resolve(values.shots);
      const names = positionals.length ? positionals : readdirSync(root).filter(name => existsSync(join(root, name, 'index.html'))).sort();
      const server = await serve(root);
      const base = `http://127.0.0.1:${server.address().port}`;
      const results = [];
      try {
        for (const name of names) {
          for (const width of values.widths.split(',').map(Number)) {
            const result = await probeAt(browser, `${base}/${name}/`, width, { scheme: values.scheme, darkClass: values['dark-class'] });
            results.push({ name, width, result });
            if (!values.json) console.log(summary(name, width, result));
          }
        }
      } finally {
        server.close();
      }
      if (values.json) console.log(JSON.stringify(results, null, 2));
    }
  } finally {
    await browser.close();
  }
}
