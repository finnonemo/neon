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
 *
 * Maintainers only: node probe-page.mjs --draft-preset <slug> <https url>
 *          [--out <dir>] [--chrome <path>] [--timeout <seconds>] [--json]
 * drafts a Theme Brief layout preset from one named page (ADR 0007), measured
 * at 1440 in the same temporary profile, never signed in. It keeps section
 * roles, geometry snapped to --space-* and --borderRadius-* steps from
 * theme/css/theme.css, and the motion level; never text, colors, fonts or
 * images. It writes <slug>.json, probe.json and the screenshot to --out and
 * exits 0. HTTP 401, 403 or 429, a sign-in wall, a bot challenge or a CAPTCHA
 * stops it with `Preset draft: not measured; <reason>`, as does anything that
 * stops the probe, and it exits 1 with no draft. A robots.txt disallow for
 * neon-probe or * is a warning recorded in source.robotsDisallowed; it does
 * not stop the page view. The maintainer steps are in the Neon repository's
 * Theme Brief write-up, under drafting from a page.
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
  // Calls `listener` with the params of every `method` event on `sessionId`.
  const on = (method, sessionId, listener) => listeners.add(message => {
    if (message.method === method && message.sessionId === sessionId) listener(message.params);
  });
  return { child, send, once, on, kill };
}

async function measureWidth(chrome, sessionId, url, width, { scheme, brands, out, probe, gate }) {
  const { send, once } = chrome;
  await send('Emulation.setDeviceMetricsOverride', { width, height: width < 768 ? 812 : 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] }, sessionId);
  const loaded = once('Page.loadEventFired', sessionId);
  const { errorText } = await send('Page.navigate', { url }, sessionId);
  if (errorText) throw new Unverified(gate?.status() ?? `${url} did not load: ${errorText}`);
  await loaded;
  // Let a client-rendered app paint and its fonts load before measuring.
  await send('Runtime.evaluate', { expression: 'new Promise(r => setTimeout(r, 500)).then(() => document.fonts.ready).then(() => new Promise(r => setTimeout(r, 200)))', awaitPromise: true }, sessionId);
  const stopped = gate && (gate.status() ?? await gate.page());
  if (stopped) throw new Unverified(stopped);
  if (brands.length) await send('Runtime.evaluate', { expression: `window.neonProbeSourceBrands = ${JSON.stringify(brands)};` }, sessionId);
  const evaluated = await send('Runtime.evaluate', { expression: probe, returnByValue: true, awaitPromise: true }, sessionId);
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
export async function probePage(url, { widths = [375, 1440], brands = [], scheme = 'light', out, chrome: chromePath, timeout = 60, draft = false } = {}) {
  const probe = draft ? `(${draftSweep})()` : readFileSync(probePath, 'utf8');
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
      const gate = draft ? await draftGate(chrome, sessionId, targetId, url) : null;
      for (const width of widths) measured.push(await measureWidth(chrome, sessionId, url, width, { scheme, brands, out, probe, gate }));
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
  add('low contrast text on fill', result.lowContrastTextOnFill);
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

// Drafting a layout preset from a page a maintainer names (ADR 0007). Only
// structure, geometry and motion carry over; nothing the page says or shows does.

const STOP_STATUSES = { 401: 'the page answered HTTP 401 (sign-in required)', 403: 'the page answered HTTP 403 (forbidden)', 429: 'the page answered HTTP 429 (too many requests)' };

// What stops a draft: the top document's status, read from the network, and what the loaded page shows.
// The top frame's id is its target id, so frameId is the targetId.
async function draftGate(chrome, sessionId, frameId, url) {
  let response = null;
  chrome.on('Network.responseReceived', sessionId, params => {
    if (params.type === 'Document' && params.frameId === frameId) response = params.response;
  });
  await chrome.send('Network.enable', {}, sessionId);
  const named = new URL(url);
  return {
    // The response's stop, if any: its status, a challenge header, or a redirect to a sign-in path.
    status: () => {
      if (!response) return null;
      if (STOP_STATUSES[response.status]) return STOP_STATUSES[response.status];
      const header = Object.entries(response.headers ?? {}).find(([name]) => name.toLowerCase() === 'cf-mitigated')?.[1];
      if (/challenge/i.test(header ?? '')) return `a bot challenge (cf-mitigated: ${header})`;
      const { pathname } = new URL(response.url);
      if (SIGN_IN_PATH.test(pathname) && !SIGN_IN_PATH.test(named.pathname)) return `a sign-in wall (redirected to ${pathname})`;
      return null;
    },
    page: async () => {
      const { result } = await chrome.send('Runtime.evaluate', { expression: `(${pageWall})()`, returnByValue: true }, sessionId);
      return result.value ?? null;
    },
  };
}

const SIGN_IN_PATH = /(?:^|\/)(?:log-?in|sign-?in|auth|sso)(?:\/|$)/i;

// Runs in the page: a bot challenge, CAPTCHA or sign-in form the page shows instead of itself, or null.
function pageWall() {
  const visible = element => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  };
  const title = document.title.trim();
  if (/^(just a moment|attention required|verify you are (a )?human|are you a robot|security check)/i.test(title)) return `a bot challenge (title "${title}")`;
  const markers = [
    ['a bot challenge', '#challenge-form, #cf-challenge-running, .cf-turnstile, iframe[src*="challenges.cloudflare.com"]'],
    ['a CAPTCHA', '.g-recaptcha, .h-captcha, iframe[src*="hcaptcha.com"], iframe[src*="recaptcha/api2/bframe"]'],
  ];
  for (const [kind, selector] of markers) {
    const found = [...document.querySelectorAll(selector)].find(visible);
    if (found) return `${kind} (${found.id ? `#${found.id}` : found.matches('iframe') ? `iframe from ${new URL(found.src, location.href).hostname}` : `.${[...found.classList].find(name => selector.includes(`.${name}`))}`})`;
  }
  if ([...document.querySelectorAll('input[type="password"]')].some(visible)) return 'a sign-in wall (a visible password field)';
  return null;
}

// Runs in the page after scrolling it through: the structure, geometry and
// motion a layout preset keeps, as section roles and px or ms numbers. Colors
// only decide what counts as a filled block; no text, color or font is returned.
async function draftSweep() {
  for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) {
    scrollTo(0, y);
    await new Promise(done => setTimeout(done, 100));
  }
  scrollTo(0, 0);
  const visible = element => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  };
  const painted = color => !/^(transparent|rgba\(.*,\s*0\))$/.test(color);
  const fillOf = element => {
    for (let at = element; at; at = at.parentElement) {
      const color = getComputedStyle(at).backgroundColor;
      if (painted(color)) return color;
    }
    return 'rgb(255, 255, 255)';
  };
  const px = value => parseFloat(value) || 0;
  // The page's section container: <main>, else the first element below <body> with more than one visible child.
  let container = document.querySelector('main') ?? document.body;
  for (let kids = [...container.children].filter(visible); kids.length === 1 && container !== document.querySelector('main'); kids = [...container.children].filter(visible)) container = kids[0];
  const blocks = [...container.children].filter(element => visible(element) && element.getBoundingClientRect().height >= 40 && !element.matches('header, nav, [role="banner"], [role="navigation"]'));
  const footers = [...document.querySelectorAll('footer, [role="contentinfo"]')].filter(element => visible(element) && !container.contains(element) && !element.parentElement.closest('footer, [role="contentinfo"]'));
  const role = (element, index) => {
    if (element.matches('footer, [role="contentinfo"]')) return 'footer';
    if (index === 0) return 'hero';
    if (element.querySelector('form') || element.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), textarea, select').length >= 2) return 'form';
    if (element.querySelector('blockquote, q')) return 'proof';
    if ([...element.querySelectorAll('ul, ol')].some(list => list.children.length >= 3)) return 'detail-list';
    return 'call-out';
  };
  const sections = [...blocks, ...footers].map((element, index) => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      role: role(element, index),
      top: box.top + scrollY,
      bottom: box.bottom + scrollY,
      paddingTop: px(style.paddingTop),
      fullBleed: box.width >= innerWidth * 0.98 && (style.backgroundImage !== 'none' || (painted(style.backgroundColor) && style.backgroundColor !== fillOf(document.body))),
    };
  });
  // Filled blocks inside sections: a fill unlike what is behind it, a border or a shadow; controls are not blocks.
  const cards = blocks.flatMap(section => [...section.querySelectorAll('*')].filter(element => {
    if (!visible(element) || element.matches('a, button, input, select, textarea, label, img, svg, video, iframe')) return false;
    const box = element.getBoundingClientRect();
    if (box.width < 80 || box.height < 40 || box.width >= section.getBoundingClientRect().width * 0.9) return false;
    const style = getComputedStyle(element);
    const filled = painted(style.backgroundColor) && style.backgroundColor !== fillOf(element.parentElement);
    return filled || (px(style.borderTopWidth) > 0 && painted(style.borderTopColor)) || style.boxShadow !== 'none';
  }).map(element => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const radius = style.borderTopLeftRadius;
    const full = radius.endsWith('%') ? px(radius) >= 50 : px(radius) >= Math.min(box.width, box.height) / 2;
    return { radius: full ? 'full' : px(radius), padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(px) };
  }));
  const toMs = value => value.split(',').map(part => parseFloat(part) * (part.trim().endsWith('ms') ? 1 : 1000));
  const durations = [...document.querySelectorAll('*')].filter(visible).map(element => {
    const style = getComputedStyle(element);
    return Math.max(...toMs(style.transitionDuration), ...toMs(style.animationDuration));
  }).filter(duration => duration > 0);
  return { viewportWidth: innerWidth, sections, cards, durations };
}

const themeSteps = (() => {
  let css = '';
  try {
    css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../theme/css/theme.css'), 'utf8');
  } catch {}
  const steps = prefix => [...css.matchAll(new RegExp(`--(${prefix}-[\\w]+):\\s*([\\d.]+)px`, 'g'))].map(([, name, value]) => ({ name, px: Number(value) })).sort((a, b) => a.px - b.px);
  return { space: steps('space'), borderRadius: steps('borderRadius') };
})();

const FULL_ROUND = 'borderRadius-1000';

/**
 * The step nearest `px`; a tie goes to the smaller step, and a value past the
 * scale caps at its last step. The full-round radius is never a nearest step.
 */
export function snapToStep(px, steps) {
  const scale = steps.filter(step => step.name !== FULL_ROUND);
  return scale.reduce((best, step) => (Math.abs(step.px - px) < Math.abs(best.px - px) ? step : best)).name;
}

// The motion levels' upper bounds in ms (provisional, spec 113): still up to 150, subtle up to 250, lively past it.
export const motionLevel = ms => (ms === undefined || ms <= 150 ? 'still' : ms <= 250 ? 'subtle' : 'lively');

const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length ? sorted[Math.floor((sorted.length - 1) / 2)] : undefined;
};

// Placeholders for the intent notes a maintainer writes; nothing from the page goes in them.
const INTENT_PLACEHOLDERS = {
  heroPattern: 'maintainer to write: how the hero is arranged and how it stacks on narrow screens',
  navigation: 'maintainer to write: the navigation, if any, and how it behaves on narrow screens',
  footer: 'maintainer to write: what the footer holds',
};

/**
 * A layout preset from one sweep: section roles in page order, geometry
 * snapped to space and borderRadius steps, motion mapped to its level.
 * Returns { preset, measuredPx, unmeasured: [field] }.
 */
export function layoutPreset(sweep, { slug, url, measuredOn, robotsDisallowed }) {
  const { sections, cards, durations } = sweep;
  const main = sections.filter(section => section.role !== 'footer');
  const gaps = main.slice(1).map((section, index) => Math.max(section.top - main[index].bottom, section.paddingTop));
  const unmeasured = [];
  const radii = cards.map(card => (card.radius === 'full' ? FULL_ROUND : snapToStep(card.radius, themeSteps.borderRadius)));
  const counts = radii.reduce((tally, name) => tally.set(name, (tally.get(name) ?? 0) + 1), new Map());
  const stepPx = name => themeSteps.borderRadius.find(step => step.name === name).px;
  const blockRadius = [...counts].sort(([a, countA], [b, countB]) => countB - countA || stepPx(a) - stepPx(b))[0]?.[0];
  const paddings = cards.flatMap(card => card.padding).filter(value => value > 0);
  const measuredPx = { cardPadding: median(paddings), sectionGap: median(gaps.length ? gaps : main.map(section => section.paddingTop)), motionMs: median(durations) };
  const step = (field, value, fallback) => {
    if (value !== undefined) return snapToStep(value, themeSteps.space);
    unmeasured.push(field);
    return fallback;
  };
  if (!blockRadius) unmeasured.push('blockRadius');
  const cardPadding = step('cardPadding', measuredPx.cardPadding, 'space-4');
  const cardPaddingPx = themeSteps.space.find(entry => entry.name === cardPadding).px;
  const roles = sections.map(section => section.role);
  if (!roles.length) unmeasured.push('sections');
  const preset = {
    kind: 'layout',
    slug,
    sections: roles.length ? roles : ['hero'],
    ...INTENT_PLACEHOLDERS,
    density: cardPaddingPx <= 16 ? 'compact' : cardPaddingPx <= 32 ? 'comfortable' : 'spacious',
    blockRadius: blockRadius ?? 'borderRadius-0',
    sectionGap: step('sectionGap', measuredPx.sectionGap, 'space-8'),
    cardPadding,
    pageWidth: sections.some(section => section.fullBleed) ? 'full-bleed' : 'contained',
    motion: motionLevel(measuredPx.motionMs),
    brandPattern: { section: roles.includes('hero') ? 'hero' : roles[0] ?? 'hero' },
    source: { url, measuredOn, kept: ['structure', 'geometry', 'motion'], robotsDisallowed },
  };
  return { preset, measuredPx, unmeasured };
}

// The product token robots.txt rules are matched against, beside `*`.
export const ROBOTS_TOKEN = 'neon-probe';

// Whether a robots.txt rule's path pattern matches `path`: `*` is any run of characters and a final `$` ends the path.
const ruleMatches = (pattern, path) => new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$')}`).test(path);

/**
 * Whether robots.txt `text` disallows `path` (path and query) for `token`, by
 * RFC 9309: the groups naming the token, else the `*` groups; the longest
 * matching rule wins, and Allow wins a tie.
 */
export function robotsDisallows(text, path, token = ROBOTS_TOKEN) {
  const groups = [];
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    const match = line.replace(/#.*/, '').match(/^\s*([\w-]+)\s*:\s*(.*?)\s*$/);
    if (!match) continue;
    const field = match[1].toLowerCase();
    const value = match[2];
    if (field === 'user-agent') {
      if (!current || current.rules.length) groups.push(current = { agents: [], rules: [] });
      current.agents.push(value.toLowerCase());
    } else if ((field === 'allow' || field === 'disallow') && current) {
      current.rules.push({ allow: field === 'allow', pattern: value });
    }
  }
  const named = groups.filter(group => group.agents.includes(token.toLowerCase()));
  const rules = (named.length ? named : groups.filter(group => group.agents.includes('*'))).flatMap(group => group.rules).filter(rule => rule.pattern);
  const best = rules.filter(rule => ruleMatches(rule.pattern, path))
    .sort((a, b) => b.pattern.length - a.pattern.length || Number(b.allow) - Number(a.allow))[0];
  return Boolean(best && !best.allow);
}

// Fetches the page's robots.txt, saying why when it could not be read.
async function robotsCheck(url) {
  const page = new URL(url);
  try {
    const response = await fetch(new URL('/robots.txt', page), { headers: { 'user-agent': ROBOTS_TOKEN }, signal: AbortSignal.timeout(10000) });
    // RFC 9309 2.3.1: an unavailable robots.txt (4xx) allows everything; an unreachable one (5xx or a network error) disallows everything.
    if (response.status >= 500) return { disallowed: true, note: `robots.txt answered ${response.status}, which counts as a complete disallow` };
    if (!response.ok) return { disallowed: false, note: null };
    return { disallowed: robotsDisallows(await response.text(), page.pathname + page.search), note: null };
  } catch (error) {
    return { disallowed: true, note: `robots.txt could not be read (${error.cause?.code ?? error.message}), which counts as a complete disallow` };
  }
}

// Raw draft output stays out of the Neon checkout this script runs from, except under its .local/.
const neonRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
function draftOutRefusal(out) {
  const target = realPath(out);
  const root = realPath(neonRoot);
  if (insideDirectory(target, join(root, '.local'))) return null;
  if (insideDirectory(target, root)) return `it is inside the Neon repository at ${root}, where only .local/ takes raw output`;
  return outRefusal(out);
}

/** Why `url` cannot be drafted from (not a public https page, or a local http one for checks), or null. */
export function draftUrlRefusal(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return 'it is not a URL';
  }
  if (parsed.hostname === 'refero.design' || parsed.hostname.endsWith('.refero.design')) return 'the Refero corpus is never a preset source';
  if (parsed.protocol === 'https:') return null;
  if (parsed.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(parsed.hostname)) return null;
  return 'name a public https page';
}

/**
 * Drafts a layout preset named `slug` from `url`. Resolves to { preset,
 * measured, notMeasured: reason | null, robots }; never rejects for browser
 * trouble or a stop.
 */
export async function draftPreset(url, slug, { out, chrome, timeout = 60, measuredOn = new Date().toLocaleDateString('en-CA') } = {}) {
  const page = new URL(url);
  page.hash = '';
  const robots = await robotsCheck(page.href);
  const { measured, notRun } = await probePage(page.href, { widths: [1440], out, chrome, timeout, draft: true });
  if (notRun || !measured.length) return { preset: null, measured, notMeasured: notRun ?? 'nothing was measured', robots };
  const { preset, measuredPx, unmeasured } = layoutPreset(measured[0].result, { slug, url: page.href, measuredOn, robotsDisallowed: robots.disallowed });
  return { preset, measuredPx, unmeasured, measured, notMeasured: null, robots };
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
        'draft-preset': { type: 'string' },
      },
    });
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
  const { values, positionals } = options;
  const slug = values['draft-preset'];
  if (slug !== undefined) {
    const urlRefusal = positionals.length === 1 ? draftUrlRefusal(positionals[0]) : 'name one page';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || values.serve || urlRefusal) {
      console.error(`Usage: node probe-page.mjs --draft-preset <slug> <https url> [--out <dir>] [--chrome <path>] [--timeout <seconds>] [--json]${urlRefusal ? ` (${urlRefusal})` : ''}`);
      process.exit(2);
    }
    const refusal = values.out && draftOutRefusal(values.out);
    if (refusal) {
      console.error(`Refusing --out ${values.out}: ${refusal}. Name a directory outside it, or omit --out for a temp directory.`);
      process.exit(2);
    }
    const out = resolve(values.out ?? join(tmpdir(), `neon-probe-${Date.now()}-${process.pid}`));
    const drafted = await draftPreset(positionals[0], slug, { out, chrome: values.chrome, timeout: Number(values.timeout) });
    const { preset, notMeasured, robots } = drafted;
    if (robots.note) console.log(`Note: ${robots.note}.`);
    if (robots.disallowed) console.log(`Warning: robots.txt disallows ${new URL(positionals[0]).pathname} for ${ROBOTS_TOKEN}; recorded as source.robotsDisallowed for the reviewer.`);
    if (!preset) {
      console.log(`Preset draft: not measured; ${notMeasured}`);
      process.exit(1);
    }
    const file = join(out, `${slug}.json`);
    writeFileSync(join(out, 'probe.json'), JSON.stringify({ measured: drafted.measured, robots }, null, 2));
    writeFileSync(file, `${JSON.stringify(preset, null, 2)}\n`);
    if (values.json) {
      console.log(JSON.stringify({ preset, measuredPx: drafted.measuredPx, unmeasured: drafted.unmeasured, robots }, null, 2));
      process.exit(0);
    }
    const { measuredPx, unmeasured } = drafted;
    const was = (value, unit) => (value === undefined ? 'not measured' : `${Math.round(value)}${unit} measured`);
    console.log(`  sections ${preset.sections.join(', ')}; pageWidth ${preset.pageWidth}; density ${preset.density}`);
    console.log(`  blockRadius ${preset.blockRadius}; cardPadding ${preset.cardPadding} (${was(measuredPx.cardPadding, 'px')}); sectionGap ${preset.sectionGap} (${was(measuredPx.sectionGap, 'px')}); motion ${preset.motion} (${was(measuredPx.motionMs, 'ms')})`);
    if (unmeasured.length) console.log(`  Not measured, so set by hand: ${unmeasured.join(', ')}.`);
    console.log(`  Screenshot and raw measurements: ${out}`);
    console.log(`  Before committing it to theme-briefs/presets/layout/${slug}.json: write heroPattern, navigation and footer as your own intent notes, check each field against the screenshot, and run the Theme Brief check.`);
    console.log(`Preset draft: ${file}`);
    process.exit(0);
  }
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
