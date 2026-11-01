#!/usr/bin/env node
// Runs the shipped probe (skills/neon-redesign/references/browser-probe.js)
// in headless Chromium, light scheme by default.
//
//   node evals/skills/run-probe.mjs --fixture
//   node evals/skills/run-probe.mjs [--shots .local/shots] [--widths 375,1440] [--scheme dark] [--dark-class] [--json] [name...]
//
// --scheme sets prefers-color-scheme; --dark-class adds `dark` to <html> after
// load, for apps that switch on a class (shadcn's `.dark`).
// --fixture loads probe-fixture.html at 375px and fails unless the ids the
// probe reports per category equal the fixture's expected ids (and contrast to
// two decimals, where the fixture gives one), then again with the dark scheme
// and class against its dark expected ids, then probe-fixture-no-plex.html
// and probe-fixture-thai-404.html.
// A fixture's #probe-source-brands is set as the probe's source-brand global
// first, as probe-page.mjs does. Otherwise each build under the
// shots directory (grade-rebuild.mjs --shots), or each named one, is served
// over HTTP and probed at every width, one summary line each.
// Uses @playwright/test from evals/templates (npm ci --prefix evals/templates).
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const here = fileURLToPath(new URL('.', import.meta.url));
const probe = readFileSync(join(here, '../../skills/neon-redesign/references/browser-probe.js'), 'utf8');
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

async function probeAt(browser, url, width, { scheme = 'light', darkClass = false, sourceBrands = [] } = {}) {
  const page = await browser.newPage({ viewport: { width, height: width < 768 ? 812 : 900 }, colorScheme: scheme });
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    if (darkClass) await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    // As probe-page.mjs and verification.md do: the brand global first, then the probe's unchanged text.
    if (sourceBrands.length) await page.evaluate(brands => { window.neonProbeSourceBrands = brands; }, sourceBrands);
    return await page.evaluate(probe);
  } finally {
    await page.close();
  }
}

// A category lists ids, or maps each id to the contrast it must report, compared
// to two decimals, or to the reasons (`by`) it must report a match for.
export function fixtureFailures(name, expected, reported) {
  const failures = [];
  for (const [category, want] of Object.entries(expected)) {
    const ids = Array.isArray(want) ? want : Object.keys(want);
    const actual = idsOf(reported[category]);
    if (actual.join() !== [...ids].sort().join()) failures.push(`${name} ${category}: reported [${actual}], expected [${[...ids].sort()}]`);
    if (Array.isArray(want)) continue;
    for (const entry of reported[category]) {
      const [id] = idsOf([entry]);
      if (!(id in want)) continue;
      if (Array.isArray(want[id])) {
        if (String(entry.by) !== String(want[id])) failures.push(`${name} ${category} ${id}: matched by [${entry.by}], expected [${want[id]}]`);
      } else if (Math.round(entry.contrast * 100) !== Math.round(want[id] * 100)) failures.push(`${name} ${category} ${id}: contrast ${entry.contrast}, expected ${want[id]}`);
    }
  }
  return failures;
}

// Nested probe results as flat categories of element-named entries.
const categoriesOf = result => ({
  ...result,
  scrolledOnLoad: result.scrolledOnLoad.elements,
  thaiTextInPlex: result.plexThai.thai.inPlex,
  thaiTextNotInPlex: result.plexThai.thai.notInPlex,
  latinTextInPlex: result.plexThai.latin.inPlex,
  latinTextNotInPlex: result.plexThai.latin.notInPlex,
  finnomenaLogo: result.finnomenaLogo.visible,
  finnomenaLogoHidden: result.finnomenaLogo.hidden,
  sourceBrandFound: result.sourceBrand?.found ?? [],
});

async function checkFixture(browser) {
  const jsonIn = (file, id) => {
    const match = readFileSync(join(here, file), 'utf8').match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)</script>`));
    return match ? JSON.parse(match[1]) : undefined;
  };
  const failures = [];
  // `loaded`: whether a Plex face must load (true) or none may (false); `failed`: how many Plex faces must fail.
  const passes = [
    { name: 'light', file: 'probe-fixture.html', expected: jsonIn('probe-fixture.html', 'probe-expected'), faces: { loaded: true } },
    { name: 'dark', file: 'probe-fixture.html', expected: jsonIn('probe-fixture.html', 'probe-expected-dark'), scheme: 'dark', darkClass: true },
    { name: 'no-plex', file: 'probe-fixture-no-plex.html', expected: jsonIn('probe-fixture-no-plex.html', 'probe-expected'), faces: { loaded: false } },
    { name: 'thai-404', file: 'probe-fixture-thai-404.html', expected: jsonIn('probe-fixture-thai-404.html', 'probe-expected'), faces: { failed: 1 } },
  ];
  for (const { name, file, expected, faces = {}, ...options } of passes) {
    const sourceBrands = jsonIn(file, 'probe-source-brands') ?? [];
    const result = await probeAt(browser, pathToFileURL(join(here, file)).href, 375, { ...options, sourceBrands });
    const reported = categoriesOf(result);
    const { loadedFaces, failedFaces } = result.plexThai;
    if (faces.loaded === false && loadedFaces.length) failures.push(`${name} loadedFaces: [${loadedFaces}], expected none`);
    if (faces.loaded === true && !loadedFaces.length) failures.push(`${name} loadedFaces: none, expected the stand-in face`);
    if (faces.failed !== undefined && failedFaces !== faces.failed) failures.push(`${name} failedFaces: ${failedFaces}, expected ${faces.failed}`);
    if (result.viewportWidth !== 375) failures.push(`${name} viewportWidth ${result.viewportWidth}, expected 375`);
    failures.push(...fixtureFailures(name, expected, reported));
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
