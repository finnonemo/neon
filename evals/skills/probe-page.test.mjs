import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { execFile, spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadInputs } from '../../scripts/theme-briefs/inputs.mjs';
import { bans, presetSchema, validate } from '../../scripts/theme-briefs/schemas.mjs';
import { robotsDisallows } from '../../scripts/probe-page.mjs';

const runner = join(import.meta.dirname, '../../scripts/probe-page.mjs');
const notRun = /^Browser probe: not run; recheck at 375px and 1440px$/m;

const temps = [];
const tempDir = prefix => {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  temps.push(dir);
  return dir;
};
after(() => temps.forEach(dir => rmSync(dir, { recursive: true, force: true })));

// Runs the runner with its own temp dir and an app dir as cwd, so leftovers in either show.
function probe(args, { timeout = 30000 } = {}) {
  const temp = tempDir('neon-probe-test-tmp-');
  const app = tempDir('neon-probe-test-app-');
  writeFileSync(join(app, 'package.json'), '{}');
  const result = spawnSync(process.execPath, [runner, ...args], { cwd: app, env: { ...process.env, TMPDIR: temp, CHROME_PATH: '' }, encoding: 'utf8', timeout });
  return { ...result, temp, app };
}

function fakeChrome(body) {
  const dir = tempDir('neon-fake-chrome-');
  const path = join(dir, 'chrome');
  writeFileSync(path, `#!/bin/sh\necho $$ > "${dir}/pid"\n${body}\n`);
  chmodSync(path, 0o755);
  return { path, pid: () => Number(readFileSync(join(dir, 'pid'), 'utf8')) };
}

const alive = pid => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

test('missing Chrome is reported as not run and does not block delivery', () => {
  const result = probe(['http://127.0.0.1:9/', '--chrome', '/nonexistent/chrome']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Chrome not found at \/nonexistent\/chrome\. Browser checks stay unverified\./);
  assert.match(result.stdout, notRun);
  assert.deepEqual(readdirSync(result.temp), []);
  assert.deepEqual(readdirSync(result.app), ['package.json']);
});

test('a Chrome that fails to launch is reported with its error, not run, and leaves no profile', { skip: process.platform === 'win32' }, () => {
  const chrome = fakeChrome('echo "sandbox initialization failed" >&2\nexit 1');
  const result = probe(['http://127.0.0.1:9/', '--chrome', chrome.path]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Chrome exited with code 1 before measuring \(sandbox initialization failed\)\. Browser checks stay unverified\./);
  assert.match(result.stdout, notRun);
  assert.deepEqual(readdirSync(result.temp), []);
  assert.deepEqual(readdirSync(result.app), ['package.json']);
});

test('a Chrome that never answers times out as not run and is killed', { skip: process.platform === 'win32' }, () => {
  const chrome = fakeChrome('exec sleep 30');
  const result = probe(['http://127.0.0.1:9/', '--chrome', chrome.path, '--timeout', '1'], { timeout: 15000 });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /timed out after 1s\. Browser checks stay unverified\./);
  assert.match(result.stdout, notRun);
  assert.equal(alive(chrome.pid()), false);
  assert.deepEqual(readdirSync(result.temp), []);
});

// The measured path needs a Chrome; where none launches (CI without one, a sandbox) these skip with the runner's reason.
const fixture = name => pathToFileURL(join(import.meta.dirname, name)).href;
function probeWithChrome(t, args) {
  const result = probe([...args, '--widths', '375', '--timeout', '30'], { timeout: 60000 });
  const reason = result.stdout.match(/^Not measured: (.*)$/m)?.[1];
  if (reason && !/did not load/.test(reason)) t.skip(reason);
  assert.equal(result.status, 0, `stderr: ${result.stderr}\nstdout: ${result.stdout}`);
  return { ...result, skipped: Boolean(reason && !/did not load/.test(reason)) };
}

test('a page that does not load is reported as not run, with Chrome closed cleanly', t => {
  const result = probeWithChrome(t, ['http://127.0.0.1:9/']);
  if (result.skipped) return;
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Not measured: http:\/\/127\.0\.0\.1:9\/ did not load: net::ERR_[A-Z_]+\./);
  assert.match(result.stdout, /^Browser probe: not run; recheck at 375px$/m);
  assert.deepEqual(readdirSync(result.temp), [], `stderr: ${result.stderr}`);
});

test('the Neon rules name the elements: Plex text, logos by how they matched, and the source brand', t => {
  const result = probeWithChrome(t, [fixture('probe-fixture.html'), '--source-brand', 'Lumora']);
  if (result.skipped) return;
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /viewportWidth 375 /);
  assert.match(result.stdout, /Thai text in IBM Plex Sans Thai: 1 \(p#thai-plex "งานออกแบบ"\); not in it: 1 \(p#thai-fallback/);
  assert.match(result.stdout, /Finnomena logo: img#logo-data "Finnomena" \(by alt, asset shape\); img#logo-base64 \(by asset shape\)/);
  assert.match(result.stdout, /Source brand: Lumora found in meta\[name="description"\] "A Lumora-style event page"; img#brand-alt "Lumora logo" \[alt\]$/m);
  // Body text that names the reference, such as a credit, is not scanned.
  assert.doesNotMatch(result.stdout, /brand-text/);
  // Screenshots go to the OS temp dir; the app is untouched.
  const shot = result.stdout.match(/Screenshot: (.*)$/m)[1];
  assert.ok(realpathSync(shot).startsWith(realpathSync(result.temp)), shot);
  assert.deepEqual(readdirSync(result.app), ['package.json']);
  assert.deepEqual(readdirSync(result.temp).filter(name => name.startsWith('neon-probe-profile-')), []);
});

test('with no Plex face, no logo and the brand absent, each is said, and absence names what was checked', t => {
  const result = probeWithChrome(t, [fixture('probe-fixture-no-plex.html'), '--source-brand', 'Halcyon']);
  if (result.skipped) return;
  assert.match(result.stdout, /Font faces: no IBM Plex Sans Thai face loaded/);
  assert.match(result.stdout, /Latin text in IBM Plex Sans Thai: 0; not in it: 1 \(p#latin "Design Day"\)/);
  assert.match(result.stdout, /Finnomena logo: none found/);
  assert.match(result.stdout, /Source brand: Halcyon absent from title, 1 meta and 1 alt text/);
  assert.match(result.stdout, /^Browser probe: 375px no IBM Plex Sans Thai face loaded, .*no Finnomena logo$/m);
});

test('text on a filled block below 4.5:1 is a lead, through transparent wrappers, and on-token text is not', t => {
  const result = probeWithChrome(t, [fixture('probe-fixture-text-on-fill.html'), '--json']);
  if (result.skipped) return;
  const { measured: [{ result: probed }], reportLine } = JSON.parse(result.stdout);
  const found = Object.fromEntries(probed.lowContrastTextOnFill.map(({ element, fill, fg, bg, contrast }) => [element.match(/#([\w-]+)/)[1], { fill: fill.match(/#([\w-]+)/)[1], fg, bg, contrast }]));
  // Measured against the nearest filled block, not the transparent wrappers or the canvas behind them.
  assert.deepEqual(found, {
    'canvas-text-on-tint': { fill: 'tint-block', fg: 'rgb(255,255,255)', bg: 'rgb(192,197,202)', contrast: 1.74 },
    wrapped: { fill: 'tint-50-block', fg: 'rgb(255,255,255)', bg: 'rgb(128,139,149)', contrast: 3.47 },
    // Inside a dark control that passes; the failing control's own label stays under darkBackgroundControls only.
    'black-in-button': { fill: 'save', fg: 'rgb(0,0,0)', bg: 'rgb(43,43,43)', contrast: 1.48 },
  });
  assert.match(reportLine, /, low contrast text on fill p#canvas-text-on-tint "[^"]*"; p#wrapped "[^"]*" \+1 more,/);
});

test('--serve measures a production build on its own port, falling back to index.html for app routes', t => {
  const dist = tempDir('neon-probe-test-dist-');
  writeFileSync(join(dist, 'index.html'), '<!doctype html><title>Built</title><link rel="stylesheet" href="/assets/app.css"><p id="built">Built page</p>');
  mkdirSync(join(dist, 'assets'));
  writeFileSync(join(dist, 'assets/app.css'), '#built { font-family: Georgia; }');
  const result = probeWithChrome(t, ['--serve', dist, '/events/2026']);
  if (result.skipped) return;
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^375px {2}http:\/\/127\.0\.0\.1:\d+\/events\/2026 {2}viewportWidth 375/m);
  // The stylesheet was served with its type, so the serif face applied.
  assert.match(result.stdout, /serif text p#built "Built page"/);
});

// Each runs from a directory outside the app, as an agent in a parent folder or the Neon root would.
function probeFrom(args) {
  return spawnSync(process.execPath, [runner, ...args, '--chrome', '/nonexistent/chrome'], { cwd: tempDir('neon-probe-test-cwd-'), encoding: 'utf8' });
}

test('--out inside the app that holds the served build is refused, from any directory', () => {
  const parent = tempDir('neon-probe-test-parent-');
  mkdirSync(join(parent, 'app/dist'), { recursive: true });
  writeFileSync(join(parent, 'app/dist/index.html'), '<p>Built</p>');
  writeFileSync(join(parent, 'app/package.json'), '{}');
  const result = probeFrom(['--serve', join(parent, 'app/dist'), '--out', join(parent, 'app/shots')]);
  assert.equal(result.status, 2, result.stdout);
  assert.match(result.stderr, /Refusing --out .*shots: it is inside the app/);
  assert.deepEqual(readdirSync(join(parent, 'app')).sort(), ['dist', 'package.json']);
});

test('--out inside the served build is refused even without a package.json', () => {
  const parent = tempDir('neon-probe-test-parent-');
  mkdirSync(join(parent, 'dist'));
  writeFileSync(join(parent, 'dist/index.html'), '<p>Built</p>');
  const result = probeFrom(['--serve', join(parent, 'dist'), '--out', join(parent, 'dist/shots')]);
  assert.equal(result.status, 2, result.stdout);
  assert.match(result.stderr, /Refusing --out .*shots: it is inside the served build/);
  assert.deepEqual(readdirSync(join(parent, 'dist')), ['index.html']);
  // Beside the build, outside any app, is allowed.
  const beside = probeFrom(['--serve', join(parent, 'dist'), '--out', join(parent, 'shots')]);
  assert.equal(beside.status, 0, beside.stderr);
  assert.match(beside.stdout, /Browser probe: not run/);
});

test('screenshots are never written inside the app', () => {
  const app = tempDir('neon-probe-test-app-');
  const result = spawnSync(process.execPath, [runner, 'http://127.0.0.1:9/', '--out', 'shots', '--chrome', '/nonexistent/chrome'], { cwd: app, encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Refusing --out shots: it is inside the current directory/);
  assert.deepEqual(readdirSync(app), []);
});

// Drafting a preset from a named page (spec 113, ADR 0007). Each page is served
// by a local server in this process, so the runner is spawned asynchronously.
function serveFixtures(routes) {
  const server = createServer((request, response) => {
    const path = new URL(request.url, 'http://x').pathname;
    const route = routes[path];
    if (!route) return response.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
    const { status = 200, type = 'text/html', headers = {}, body = '' } = typeof route === 'string' ? { body: route } : route;
    response.writeHead(status, { 'content-type': type, ...headers }).end(body);
  });
  return new Promise(done => server.listen(0, '127.0.0.1', () => done({ origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() })));
}

function draft(args, { timeout = 60000 } = {}) {
  const temp = tempDir('neon-probe-test-tmp-');
  const app = tempDir('neon-probe-test-app-');
  return new Promise(done => {
    execFile(process.execPath, [runner, ...args], { cwd: app, env: { ...process.env, TMPDIR: temp, CHROME_PATH: '' }, encoding: 'utf8', timeout }, (error, stdout, stderr) => {
      done({ status: error ? error.code ?? 1 : 0, stdout, stderr, temp, app });
    });
  });
}

const fixtureHtml = name => readFileSync(join(import.meta.dirname, name), 'utf8');

test('a robots.txt disallow is a warning recorded for the reviewer, not a stop, and no Chrome stops the draft', async () => {
  const site = await serveFixtures({
    '/robots.txt': { type: 'text/plain', body: 'User-agent: *\nDisallow: /events/\nAllow: /events/open\n' },
    '/events/run': '<p>Run</p>',
  });
  try {
    const result = await draft(['--draft-preset', 'run-landing', `${site.origin}/events/run`, '--chrome', '/nonexistent/chrome']);
    assert.match(result.stdout, /^Warning: robots\.txt disallows \/events\/run for neon-probe; recorded as source\.robotsDisallowed for the reviewer\.$/m);
    assert.match(result.stdout, /^Preset draft: not measured; Chrome not found at \/nonexistent\/chrome$/m);
    assert.equal(result.status, 1);
    assert.deepEqual(readdirSync(result.temp), []);
  } finally {
    site.close();
  }
});

// Drafts with a real Chrome; where none launches the test skips with the runner's reason.
async function draftWithChrome(t, args) {
  const result = await draft([...args, '--timeout', '30']);
  const reason = result.stdout.match(/^Preset draft: not measured; (Chrome (?:not found|exited|failed).*)$/m)?.[1];
  if (reason) t.skip(reason);
  return { ...result, skipped: Boolean(reason) };
}

for (const [status, reason] of [[401, 'the page answered HTTP 401 (sign-in required)'], [403, 'the page answered HTTP 403 (forbidden)'], [429, 'the page answered HTTP 429 (too many requests)']]) {
  test(`HTTP ${status} stops the draft with no workaround and writes no preset`, async t => {
    const site = await serveFixtures({ '/page': { status, body: '<p>Blocked</p>' } });
    try {
      const out = join(tempDir('neon-probe-test-out-'), 'draft');
      const result = await draftWithChrome(t, ['--draft-preset', 'blocked', `${site.origin}/page`, '--out', out]);
      if (result.skipped) return;
      assert.match(result.stdout, new RegExp(`^Preset draft: not measured; ${reason.replace(/[()]/g, '\\$&')}$`, 'm'));
      assert.equal(result.status, 1);
      assert.equal(existsSync(out), false, 'nothing is written for a stopped page');
      assert.deepEqual(readdirSync(result.temp), []);
    } finally {
      site.close();
    }
  });
}

const stops = [
  ['a visible password field', { '/page': '<form><input name="user"><input type="password" name="pass"></form>' }, 'a sign-in wall (a visible password field)'],
  ['a redirect to a sign-in page', { '/members': { status: 302, headers: { location: '/account/login?next=/members' } }, '/account/login': '<p>Welcome back</p>' }, 'a sign-in wall (redirected to /account/login)'],
  ['a challenge title', { '/page': '<title>Just a moment...</title><p>Checking your browser</p>' }, 'a bot challenge (title "Just a moment...")'],
  ['a challenge header', { '/page': { headers: { 'cf-mitigated': 'challenge' }, body: '<p>One moment</p>' } }, 'a bot challenge (cf-mitigated: challenge)'],
  ['a Turnstile widget', { '/page': '<p>Confirm</p><div class="cf-turnstile" style="width:300px;height:65px"></div>' }, 'a bot challenge (.cf-turnstile)'],
  ['a CAPTCHA widget', { '/page': '<form><div class="g-recaptcha" style="width:304px;height:78px"></div></form>' }, 'a CAPTCHA (.g-recaptcha)'],
];
for (const [name, routes, reason] of stops) {
  test(`${name} stops the draft as not measured, never worked around`, async t => {
    const site = await serveFixtures(routes);
    try {
      const out = join(tempDir('neon-probe-test-out-'), 'draft');
      const result = await draftWithChrome(t, ['--draft-preset', 'walled', `${site.origin}${Object.keys(routes)[0]}`, '--out', out]);
      if (result.skipped) return;
      assert.ok(result.stdout.split('\n').includes(`Preset draft: not measured; ${reason}`), result.stdout);
      assert.equal(result.status, 1);
      assert.equal(existsSync(out), false, 'nothing is written for a stopped page');
    } finally {
      site.close();
    }
  });
}

// Each case's expected steps come from theme.css: space-1_5 12px, space-2 16px,
// space-3 24px, space-4 32px, space-8 64px, space-9 72px, space-10 80px (the last);
// borderRadius-200 8px, -300 12px, -900 56px (the last before full-round -1000).
const snapping = [
  ['ties go to the smaller step', '?radius=10px&pad=20px&gap=68px&motion=200ms', { blockRadius: 'borderRadius-200', cardPadding: 'space-2', sectionGap: 'space-8', motion: 'subtle', density: 'compact' }],
  ['full-round becomes borderRadius-1000 and values past the scale cap at its last step', '?radius=9999px&pad=40px&gap=200px&motion=150ms', { blockRadius: 'borderRadius-1000', cardPadding: 'space-5', sectionGap: 'space-10', motion: 'still', density: 'spacious' }],
  ['a large radius short of full-round caps at borderRadius-900', '?radius=120px&pad=28px&gap=6px&motion=350ms', { blockRadius: 'borderRadius-900', cardPadding: 'space-3', sectionGap: 'space-0_75', motion: 'lively', density: 'comfortable' }],
  ['a 50% radius is full-round, and no transitions is still', '?radius=50%25&pad=12px&gap=72px&motion=0s', { blockRadius: 'borderRadius-1000', cardPadding: 'space-1_5', sectionGap: 'space-9', motion: 'still', density: 'compact' }],
];
for (const [name, query, expected] of snapping) {
  test(`drafting snaps measured geometry and motion to steps: ${name}`, async t => {
    const site = await serveFixtures({ '/run': fixtureHtml('probe-fixture-preset.html') });
    try {
      const out = join(tempDir('neon-probe-test-out-'), 'draft');
      const result = await draftWithChrome(t, ['--draft-preset', 'night-run', `${site.origin}/run${query}`, '--out', out]);
      if (result.skipped) return;
      assert.equal(result.status, 0, `stderr: ${result.stderr}\nstdout: ${result.stdout}`);
      const preset = JSON.parse(readFileSync(join(out, 'night-run.json'), 'utf8'));
      const { blockRadius, cardPadding, sectionGap, motion, density } = preset;
      assert.deepEqual({ blockRadius, cardPadding, sectionGap, motion, density }, expected);
    } finally {
      site.close();
    }
  });
}

test('the drafted preset passes the closed layout schema with its source filled, and keeps nothing the page says or shows', async t => {
  const site = await serveFixtures({
    '/robots.txt': { type: 'text/plain', body: 'User-agent: neon-probe\nDisallow: /run\n\nUser-agent: *\nAllow: /\n' },
    '/run': fixtureHtml('probe-fixture-preset.html'),
  });
  try {
    const out = join(tempDir('neon-probe-test-out-'), 'draft');
    const result = await draftWithChrome(t, ['--draft-preset', 'night-run', `${site.origin}/run#hero`, '--out', out]);
    if (result.skipped) return;
    assert.equal(result.status, 0, `stderr: ${result.stderr}\nstdout: ${result.stdout}`);
    assert.match(result.stdout, /^Warning: robots\.txt disallows \/run for neon-probe; recorded as source\.robotsDisallowed for the reviewer\.$/m);
    const file = join(out, 'night-run.json');
    assert.match(result.stdout, new RegExp(`^Preset draft: ${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm'));
    const text = readFileSync(file, 'utf8');
    const preset = JSON.parse(text);
    // Structure: the sections in page order, with the Pattern in the hero.
    assert.deepEqual(preset.sections, ['hero', 'detail-list', 'proof', 'call-out', 'form', 'footer']);
    assert.equal(preset.pageWidth, 'full-bleed');
    assert.deepEqual(preset.brandPattern, { section: 'hero' });
    // Provenance: the named page without its fragment, today, what was kept, and the robots.txt disallow.
    assert.deepEqual({ ...preset.source, measuredOn: undefined }, { url: `${site.origin}/run`, measuredOn: undefined, kept: ['structure', 'geometry', 'motion'], robotsDisallowed: true });
    assert.match(preset.source.measuredOn, /^\d{4}-\d{2}-\d{2}$/);
    // The fixture is served over http on loopback; a named public page is https, which the schema requires.
    const asPublic = { ...preset, source: { ...preset.source, url: preset.source.url.replace(site.origin, 'https://events.example') } };
    const facts = loadInputs(join(import.meta.dirname, '../..')).facts;
    assert.deepEqual([...validate(asPublic, presetSchema('layout', 'night-run', facts)), ...bans(preset)], []);
    // Nothing from the page: no brand, copy, color or font.
    for (const leak of ['Lumora', 'Night Run', 'Register', 'city lights', 'e4007c', '#', 'Playfair', 'serif']) assert.ok(!text.includes(leak), `the draft holds "${leak}": ${text}`);
  } finally {
    site.close();
  }
});

test('robots.txt follows RFC 9309: the neon-probe group over *, longest match, Allow on a tie, $ and *', () => {
  const robots = 'User-agent: *\nDisallow: /\n\nUser-agent: Neon-Probe\nDisallow: /private\nAllow: /private/open\nDisallow: /tie\nAllow: /tie\nDisallow: /*.pdf$\n';
  assert.equal(robotsDisallows(robots, '/events'), false, 'the named group replaces *');
  assert.equal(robotsDisallows(robots, '/private/page'), true);
  assert.equal(robotsDisallows(robots, '/private/open/page'), false, 'the longer Allow wins');
  assert.equal(robotsDisallows(robots, '/tie'), false, 'Allow wins a tie');
  assert.equal(robotsDisallows(robots, '/files/a.pdf'), true);
  assert.equal(robotsDisallows(robots, '/files/a.pdf?x=1'), false, '$ anchors the end');
  assert.equal(robotsDisallows('User-agent: *\nDisallow: /events\n', '/events/run'), true, '* applies when no group names neon-probe');
  assert.equal(robotsDisallows('User-agent: other\nDisallow: /\n', '/events'), false);
});

test('a Refero Styles page is refused before anything is fetched', async () => {
  const result = await draft(['--draft-preset', 'refero', 'https://styles.refero.design/style/x', '--chrome', '/nonexistent/chrome']);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /\(the Refero corpus is never a preset source\)/);
});

test('raw draft output may go under the Neon repository\'s .local/ but nowhere else in it, from any directory', async () => {
  const site = await serveFixtures({ '/page': '<p>Run</p>' });
  const repo = join(import.meta.dirname, '../..');
  const local = join(repo, '.local', `probe-draft-test-${process.pid}`);
  try {
    const inRepo = await draft(['--draft-preset', 'run', `${site.origin}/page`, '--out', join(repo, 'theme-briefs', 'presets', 'layout'), '--chrome', '/nonexistent/chrome']);
    assert.equal(inRepo.status, 2);
    assert.match(inRepo.stderr, /Refusing --out .*: it is inside the Neon repository/);
    const inLocal = await draft(['--draft-preset', 'run', `${site.origin}/page`, '--out', local, '--chrome', '/nonexistent/chrome']);
    assert.match(inLocal.stdout, /^Preset draft: not measured; Chrome not found at \/nonexistent\/chrome$/m);
    assert.equal(inLocal.status, 1);
  } finally {
    site.close();
    rmSync(local, { recursive: true, force: true });
  }
});

test('a robots.txt that answers 5xx counts as a complete disallow, per RFC 9309', async () => {
  const site = await serveFixtures({ '/robots.txt': { status: 503, body: 'down' }, '/page': '<p>Run</p>' });
  try {
    const result = await draft(['--draft-preset', 'run', `${site.origin}/page`, '--chrome', '/nonexistent/chrome']);
    assert.match(result.stdout, /^Warning: robots\.txt disallows \/page for neon-probe; recorded as source\.robotsDisallowed for the reviewer\.$/m);
    assert.equal(result.status, 1);
  } finally {
    site.close();
  }
});
