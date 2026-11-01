import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

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
  });
  assert.match(reportLine, /^Browser probe: 375px low contrast text on fill p#canvas-text-on-tint "[^"]*"; p#wrapped/);
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
