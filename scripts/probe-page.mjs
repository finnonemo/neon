#!/usr/bin/env node
/**
 * probe-page.mjs — measures a rendered page without a browser tool. Drives an
 * installed Chrome over the DevTools protocol (a pipe, so no port and no npm
 * dependencies), loads the page at each width and evaluates the shipped
 * browser probe (skills/neon-redesign/references/browser-probe.js) on it.
 *
 * Usage: node probe-page.mjs <url> | --serve <build dir> [<path>]
 *          [--widths 375,1440] [--source-brand <name>]... [--scheme light|dark]
 *          [--out <dir>] [--chrome <path>] [--timeout <seconds>] [--json]
 *
 * --serve serves a production build (such as an app's dist folder) on a free
 * local port and measures <path> there, default /, so no dev server or fixed
 * port is needed.
 * Prints, per width, the probe's leads plus the Neon rules (IBM Plex Sans Thai
 * loaded for Thai and Latin text, the Finnomena logo, and with --source-brand
 * the Reference Design's brand in title, meta and alt text), each naming
 * elements, then the verification report line. Screenshots and probe.json go
 * to --out, default a new directory under the OS temp dir; an --out inside the
 * current directory, the --serve build or the app holding it (its nearest
 * package.json) is refused. Chrome's profile is a temp directory
 * removed on exit. Chrome is found through --chrome, CHROME_PATH or the usual
 * install paths. Missing Chrome, a failed launch, a page that does not load or
 * a timeout prints `Browser probe: not run; …` and exits 0: the checks stay
 * unverified, and delivery is not blocked. Exits 2 on a usage error.
 */
import { spawn } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { homedir, tmpdir } from 'node:os';
import { delimiter, dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const probePath = join(dirname(fileURLToPath(import.meta.url)), '../skills/neon-redesign/references/browser-probe.js');

function chromeCandidates() {
  const fromPath = names => (process.env.PATH ?? '').split(delimiter).flatMap(dir => names.map(name => join(dir, name)));
  if (process.platform === 'darwin') {
    const apps = ['Google Chrome.app/Contents/MacOS/Google Chrome', 'Chromium.app/Contents/MacOS/Chromium', 'Microsoft Edge.app/Contents/MacOS/Microsoft Edge'];
    return ['/Applications', join(homedir(), 'Applications')].flatMap(dir => apps.map(app => join(dir, app)));
  }
  if (process.platform === 'win32') {
    const roots = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean);
    return roots.flatMap(root => [join(root, 'Google/Chrome/Application/chrome.exe'), join(root, 'Microsoft/Edge/Application/msedge.exe')]);
  }
  return fromPath(['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge']);
}

export function findChrome(explicit = process.env.CHROME_PATH) {
  if (explicit) return existsSync(explicit) ? { path: explicit } : { reason: `Chrome not found at ${explicit}` };
  const path = chromeCandidates().find(candidate => existsSync(candidate));
  return path ? { path } : { reason: 'Chrome not found; pass --chrome <path> or set CHROME_PATH' };
}

class Unverified extends Error {}

// One Chrome over --remote-debugging-pipe: we write NUL-terminated JSON to its fd 3 and read its fd 4.
function launch(chromePath, profile) {
  const args = [
    '--headless=new', '--remote-debugging-pipe', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-sync',
    '--disable-background-networking', '--disable-component-update', '--use-mock-keychain', '--password-store=basic',
    '--hide-scrollbars', '--mute-audio', '--disable-breakpad', '--disable-crash-reporter', 'about:blank',
  ];
  // Its own process group, so a wrapper script (Linux's google-chrome) and its
  // children die together; TMPDIR inside the profile, so Chrome's temp files go with it.
  const child = spawn(chromePath, args, {
    cwd: profile,
    detached: process.platform !== 'win32',
    env: { ...process.env, TMPDIR: profile },
    stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(-2000); });
  const pending = new Map();
  let nextId = 1;
  let buffer = '';
  const listeners = new Set();
  let closed = null;
  const close = reason => {
    if (closed) return;
    closed = reason;
    for (const { reject } of pending.values()) reject(new Unverified(reason));
    pending.clear();
    for (const listener of listeners) listener({ method: 'closed' });
  };
  const failure = () => {
    const tail = stderr.trim().split('\n').filter(Boolean).slice(-3).join(' | ');
    return tail ? ` (${tail})` : '';
  };
  child.on('error', error => close(`Chrome failed to launch: ${error.message}`));
  child.on('exit', (code, signal) => close(`Chrome exited${code === null ? ` on ${signal}` : ` with code ${code}`} before measuring${failure()}`));
  child.stdio[3].on('error', () => {});
  child.stdio[4].on('error', () => {});
  child.stdio[4].setEncoding('utf8');
  child.stdio[4].on('data', chunk => {
    buffer += chunk;
    let end;
    while ((end = buffer.indexOf('\0')) >= 0) {
      const message = JSON.parse(buffer.slice(0, end));
      buffer = buffer.slice(end + 1);
      if (message.id && pending.has(message.id)) {
        const { resolve: done, reject, method } = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) reject(new Error(`${method}: ${message.error.message}`));
        else done(message.result);
      } else {
        for (const listener of listeners) listener(message);
      }
    }
  });
  const send = (method, params = {}, sessionId) => new Promise((done, reject) => {
    if (closed) return reject(new Unverified(closed));
    const id = nextId++;
    pending.set(id, { resolve: done, reject, method });
    child.stdio[3].write(`${JSON.stringify({ id, method, params, sessionId })}\0`);
  });
  const once = (method, sessionId) => {
    const event = new Promise((done, reject) => {
      const listener = message => {
        if (message.method === 'closed') { listeners.delete(listener); reject(new Unverified(closed)); }
        if (message.method === method && message.sessionId === sessionId) { listeners.delete(listener); done(message.params); }
      };
      listeners.add(listener);
    });
    // A wait abandoned by an earlier failure must not reject unhandled when Chrome closes.
    event.catch(() => {});
    return event;
  };
  const kill = () => {
    if (process.platform !== 'win32') {
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {}
    }
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
  };
  return { child, send, once, kill };
}

async function measureWidth(chrome, sessionId, url, width, { scheme, brands, out, probe }) {
  const { send, once } = chrome;
  await send('Emulation.setDeviceMetricsOverride', { width, height: width < 768 ? 812 : 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] }, sessionId);
  const loaded = once('Page.loadEventFired', sessionId);
  const { errorText } = await send('Page.navigate', { url }, sessionId);
  if (errorText) throw new Unverified(`${url} did not load: ${errorText}`);
  await loaded;
  // Let a client-rendered app paint and its fonts load before measuring.
  await send('Runtime.evaluate', { expression: 'new Promise(r => setTimeout(r, 500)).then(() => document.fonts.ready).then(() => new Promise(r => setTimeout(r, 200)))', awaitPromise: true }, sessionId);
  if (brands.length) await send('Runtime.evaluate', { expression: `window.neonProbeSourceBrands = ${JSON.stringify(brands)};` }, sessionId);
  const evaluated = await send('Runtime.evaluate', { expression: probe, returnByValue: true }, sessionId);
  if (evaluated.exceptionDetails) throw new Unverified(`the probe threw: ${evaluated.exceptionDetails.exception?.description ?? evaluated.exceptionDetails.text}`);
  const { cssContentSize } = await send('Page.getLayoutMetrics', {}, sessionId);
  const height = Math.min(Math.ceil(cssContentSize.height), 12000);
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } }, sessionId);
  mkdirSync(out, { recursive: true });
  const screenshot = join(out, `${width}.png`);
  writeFileSync(screenshot, Buffer.from(data, 'base64'));
  return { width, result: evaluated.result.value, screenshot };
}

/**
 * Probes `url` at each width. Resolves to { measured: [{ width, result,
 * screenshot }], notRun: reason | null }; never rejects for browser trouble.
 */
export async function probePage(url, { widths = [375, 1440], brands = [], scheme = 'light', out, chrome: chromePath, timeout = 60 } = {}) {
  const probe = readFileSync(probePath, 'utf8');
  const found = findChrome(chromePath);
  if (!found.path) return { measured: [], notRun: found.reason };
  const profile = mkdtempSync(join(tmpdir(), 'neon-probe-profile-'));
  const chrome = launch(found.path, profile);
  const measured = [];
  let timer;
  try {
    const timedOut = new Promise((_, reject) => { timer = setTimeout(() => reject(new Unverified(`timed out after ${timeout}s`)), timeout * 1000); });
    const run = (async () => {
      const { targetId } = await chrome.send('Target.createTarget', { url: 'about:blank' });
      const { sessionId } = await chrome.send('Target.attachToTarget', { targetId, flatten: true });
      await chrome.send('Page.enable', {}, sessionId);
      for (const width of widths) measured.push(await measureWidth(chrome, sessionId, url, width, { scheme, brands, out, probe }));
    })();
    run.catch(() => {});
    await Promise.race([run, timedOut]);
    return { measured, notRun: null };
  } catch (error) {
    return { measured, notRun: error instanceof Unverified ? error.message : `Chrome failed: ${error.message}` };
  } finally {
    clearTimeout(timer);
    chrome.kill();
    await new Promise(done => (chrome.child.exitCode !== null || chrome.child.signalCode !== null ? done() : chrome.child.once('exit', done)));
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}

// The first `count` element names of a list, and how many more there are.
const namesOf = (list, count = 2) => list.slice(0, count).map(entry => (typeof entry === 'string' ? entry : entry.element)).join('; ') + (list.length > count ? ` +${list.length - count} more` : '');

const quoted = ({ element, text }) => (element.includes(text.slice(0, 40)) ? element : `${element} "${text}"`);

// Adds `name` and the first element names of `list` to `found` when the list is not empty.
const adder = found => (name, list) => { if (list.length) found.push(`${name} ${namesOf(list)}`); };

/** The probe's general leads at one width (overflow, contrast, fills, nav, dialogs, serif text), each naming its elements. */
export function layoutLeads(result) {
  const found = [];
  const add = adder(found);
  if (result.horizontalOverflow) found.push(`page overflow to ${result.documentScrollWidth}px`);
  add('overflowing', result.overflowingElements);
  add('scrolled on load', result.scrolledOnLoad.elements);
  add('sideways scrollers', result.sidewaysScrollers);
  add('low contrast on dark fill', result.darkBackgroundControls.filter(entry => entry.contrast < 4.5));
  add('fill matching its background', result.sameAsParentFill);
  add('underlined nav', result.underlinedNavLinks);
  add('dialog past the viewport', result.dialogs.filter(dialog => !dialog.fits));
  add('serif text', result.serifSamples);
  return found;
}

/** Leads from the Neon rules at one width: IBM Plex Sans Thai, the Finnomena logo and the source brand. */
export function neonLeads(result) {
  const found = [];
  const add = adder(found);
  if (!result.plexThai.loadedFaces.length) found.push('no IBM Plex Sans Thai face loaded');
  if (result.plexThai.failedFaces) found.push(`${result.plexThai.failedFaces} IBM Plex Sans Thai faces failed to load`);
  add('Thai text not in IBM Plex Sans Thai', result.plexThai.thai.notInPlex);
  add('Latin text not in IBM Plex Sans Thai', result.plexThai.latin.notInPlex);
  if (!result.finnomenaLogo.visible.length) found.push(result.finnomenaLogo.hidden.length ? `Finnomena logo hidden (${namesOf(result.finnomenaLogo.hidden)})` : 'no Finnomena logo');
  if (result.sourceBrand) add('source brand in', result.sourceBrand.found.map(quoted));
  return found;
}

/** Leads a reviewer should inspect at one width, each naming its elements. */
export const leads = result => [...layoutLeads(result), ...neonLeads(result)];

/** The fixed report line from verification.md's item 5. */
export function reportLine(widths, measured) {
  if (!measured.length) return `Browser probe: not run; recheck at ${widths.map(width => `${width}px`).join(' and ')}`;
  return `Browser probe: ${widths.map(width => {
    const entry = measured.find(item => item.width === width);
    if (!entry) return `${width}px not run`;
    const found = leads(entry.result);
    return `${width}px ${found.length ? found.join(', ') : 'clean'}`;
  }).join('; ')}`;
}

// The Neon rules' results at one width, one indented line each, for the human-readable output.
function neonRuleLines(result) {
  const { plexThai, finnomenaLogo, sourceBrand } = result;
  const script = (name, { inPlex, inPlexCount, notInPlex, notInPlexCount }) => `${name} text in IBM Plex Sans Thai: ${inPlexCount}${inPlex.length ? ` (${namesOf(inPlex)})` : ''}; not in it: ${notInPlexCount ? `${notInPlexCount} (${namesOf(notInPlex, 3)})` : 'none'}`;
  const logo = finnomenaLogo.visible.length
    ? finnomenaLogo.visible.map(entry => `${entry.element} (by ${entry.by.join(', ')})`).join('; ')
    : finnomenaLogo.hidden.length ? `hidden at this width: ${namesOf(finnomenaLogo.hidden)}` : 'none found';
  let brand = 'not checked; pass --source-brand <name> for a Reference Design page';
  if (sourceBrand) {
    const { checked } = sourceBrand;
    const where = `${checked.title ? 'title' : 'an empty title'}, ${checked.meta} meta and ${checked.alt} alt text`;
    brand = sourceBrand.found.length
      ? `${sourceBrand.brands.join(', ')} found in ${sourceBrand.found.map(quoted).join('; ')}`
      : `${sourceBrand.brands.join(', ')} absent from ${where}`;
  }
  return [
    `  Font faces: ${plexThai.loadedFaces.length ? `IBM Plex Sans Thai loaded: ${plexThai.loadedFaces.join(', ')}` : 'no IBM Plex Sans Thai face loaded'}${plexThai.failedFaces ? `; ${plexThai.failedFaces} Plex faces failed to load` : ''}`,
    `  ${script('Thai', plexThai.thai)}`,
    `  ${script('Latin', plexThai.latin)}`,
    `  Finnomena logo: ${logo}`,
    `  Source brand: ${brand}`,
  ];
}

const contentTypes = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.ico': 'image/x-icon' };

// A production build on a free local port; paths that are not files get index.html, as an app's routes do.
function serve(root) {
  const server = createServer((request, response) => {
    let path = join(root, decodeURIComponent(new URL(request.url, 'http://x').pathname));
    if (!insideDirectory(path, root) || !existsSync(path) || statSync(path).isDirectory()) path = join(root, 'index.html');
    if (!existsSync(path)) return response.writeHead(404).end();
    response.writeHead(200, { 'content-type': contentTypes[extname(path)] ?? 'application/octet-stream' });
    createReadStream(path).pipe(response);
  });
  return new Promise(done => server.listen(0, '127.0.0.1', () => done(server)));
}

function insideDirectory(path, directory) {
  const rel = relative(directory, path);
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}

// The real path of `path`, resolving symlinks through its nearest existing ancestor (/tmp is /private/tmp on macOS).
function realPath(path) {
  const absolute = resolve(path);
  if (existsSync(absolute)) return realpathSync(absolute);
  const parent = dirname(absolute);
  return parent === absolute ? absolute : join(realPath(parent), relative(parent, absolute));
}

// The nearest directory at or above `start` with a package.json, short of the home and root directories.
function nearestApp(start) {
  for (let dir = start; dir !== dirname(dir) && dir !== realPath(homedir()); dir = dirname(dir)) {
    if (existsSync(join(dir, 'package.json'))) return dir;
  }
  return null;
}

/** Why `out` may not hold screenshots (it is inside the served build, its app or the current directory), or null. */
export function outRefusal(out, { serve, cwd = process.cwd() } = {}) {
  const target = realPath(out);
  const build = serve && realPath(serve);
  const app = build && nearestApp(build);
  if (build && insideDirectory(target, build)) return 'it is inside the served build';
  if (app && insideDirectory(target, app)) return `it is inside the app at ${app}`;
  if (insideDirectory(target, realPath(cwd))) return 'it is inside the current directory, which is taken to be the app';
  return null;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  let options;
  try {
    options = parseArgs({
      allowPositionals: true,
      options: {
        widths: { type: 'string', default: '375,1440' },
        'source-brand': { type: 'string', multiple: true, default: [] },
        scheme: { type: 'string', default: 'light' },
        out: { type: 'string' },
        chrome: { type: 'string' },
        timeout: { type: 'string', default: '60' },
        serve: { type: 'string' },
        json: { type: 'boolean' },
      },
    });
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
  const { values, positionals } = options;
  const widths = values.widths.split(',').map(Number);
  if (positionals.length !== 1 && !(values.serve && positionals.length === 0) || widths.some(width => !Number.isInteger(width) || width <= 0) || !['light', 'dark'].includes(values.scheme)) {
    console.error('Usage: node probe-page.mjs <url> | --serve <build dir> [<path>] [--widths 375,1440] [--source-brand <name>]... [--scheme light|dark] [--out <dir>] [--chrome <path>] [--timeout <seconds>] [--json]');
    process.exit(2);
  }
  const refusal = values.out && outRefusal(values.out, { serve: values.serve });
  if (refusal) {
    console.error(`Refusing --out ${values.out}: ${refusal}. Name a directory outside the app, or omit --out for a temp directory.`);
    process.exit(2);
  }
  const out = resolve(values.out ?? join(tmpdir(), `neon-probe-${Date.now()}-${process.pid}`));
  const server = values.serve ? await serve(resolve(values.serve)) : null;
  const url = server ? new URL(positionals[0] ?? '/', `http://127.0.0.1:${server.address().port}`).href : positionals[0];
  const { measured, notRun } = await probePage(url, {
    widths, brands: values['source-brand'], scheme: values.scheme, out, chrome: values.chrome, timeout: Number(values.timeout),
  });
  server?.close();
  const line = reportLine(widths, measured);
  if (measured.length) writeFileSync(join(out, 'probe.json'), JSON.stringify({ measured, notRun, reportLine: line }, null, 2));
  if (values.json) {
    console.log(JSON.stringify({ measured, notRun, reportLine: line }, null, 2));
    process.exit(0);
  }
  for (const { width, result, screenshot } of measured) {
    console.log(`${width}px  ${result.url}  viewportWidth ${result.viewportWidth}${result.viewportWidth === width ? '' : ` (expected ${width}: this width is void)`}  ${values.scheme}`);
    console.log(neonRuleLines(result).join('\n'));
    const found = layoutLeads(result);
    console.log(`  Other leads: ${found.length ? found.join(', ') : 'none'}`);
    console.log(`  Screenshot: ${screenshot}`);
  }
  if (notRun) console.log(`Not measured${measured.length ? ` after ${measured.map(entry => `${entry.width}px`).join(', ')}` : ''}: ${notRun}. Browser checks stay unverified.`);
  console.log(line);
}
