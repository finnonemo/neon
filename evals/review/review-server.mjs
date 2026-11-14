#!/usr/bin/env node
// Serves one review round to the owner: the page at http://localhost:5190/ and
// each run's production build on its own port, 5191 for the first case and up.
//
//   node evals/review/review-server.mjs --round <name> [--build] [--port 5190]
//
// A round is <root>/<round>/, written by run-claude-case.mjs --root .local/review/<round>.
// Each case folder holds the app the run built somewhere under it; --build runs
// `npm run build` in each app that has no dist/ yet. The page writes the owner's
// ✓/✗ to evals/review/verdicts.json; review.html?sandbox reads them and never writes.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';

const here = import.meta.dirname;
const repositoryRoot = resolve(here, '../..');
export const verdictsFile = join(here, 'verdicts.json');

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon' };

// The app a run built: the shallowest folder under the case that holds a
// package.json with a build script, skipping node_modules.
export function findApp(caseDirectory, depth = 3) {
  const queue = [[caseDirectory, 0]];
  while (queue.length) {
    const [directory, level] = queue.shift();
    const manifest = join(directory, 'package.json');
    if (existsSync(manifest)) {
      try {
        const { scripts = {} } = JSON.parse(readFileSync(manifest, 'utf8'));
        if (scripts.build) return directory;
      } catch { /* not an app */ }
    }
    if (level >= depth) continue;
    for (const name of readdirSync(directory)) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      const child = join(directory, name);
      if (statSync(child).isDirectory()) queue.push([child, level + 1]);
    }
  }
  return null;
}

export function listCases(roundDirectory) {
  return readdirSync(roundDirectory)
    .filter(name => /^review-\d+$/.test(name) && statSync(join(roundDirectory, name)).isDirectory())
    .sort()
    .map(name => {
      const app = findApp(join(roundDirectory, name));
      const dist = app && existsSync(join(app, 'dist', 'index.html')) ? join(app, 'dist') : null;
      return { case: name, app, dist };
    });
}

export async function readVerdicts(file = verdictsFile) {
  if (!existsSync(file)) return { version: 1, rounds: {} };
  return JSON.parse(await readFile(file, 'utf8'));
}

// One verdict per case per round; a later click replaces it.
export async function recordVerdict({ round, case: name, verdict, tags = [], note = '' }, file = verdictsFile, now = new Date()) {
  if (!/^review-\d+$/.test(name ?? '')) throw new Error('Unknown case.');
  if (!['pass', 'fail'].includes(verdict)) throw new Error('A verdict is pass or fail.');
  const data = await readVerdicts(file);
  const entry = (data.rounds[round] ??= { done: null, cases: {} });
  entry.cases[name] = { verdict, tags: [...new Set(tags)].sort(), note: String(note).trim(), at: now.toISOString() };
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
  return entry;
}

export async function markDone(round, file = verdictsFile, now = new Date()) {
  const data = await readVerdicts(file);
  const entry = (data.rounds[round] ??= { done: null, cases: {} });
  entry.done = now.toISOString();
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
  return entry;
}

function serveStatic(root, request, response, fallback) {
  const path = normalize(decodeURIComponent(new URL(request.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  let file = join(root, path);
  if (!file.startsWith(root + sep) && file !== root) return response.writeHead(403).end();
  if (!existsSync(file) || statSync(file).isDirectory()) file = existsSync(join(file, 'index.html')) ? join(file, 'index.html') : fallback;
  readFile(file).then(body => response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' }).end(body), () => response.writeHead(404).end());
}

async function body(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString() || '{}');
}

async function main() {
  const { values } = parseArgs({ options: {
    round: { type: 'string' },
    root: { type: 'string', default: join(repositoryRoot, '.local/review') },
    port: { type: 'string', default: '5190' },
    build: { type: 'boolean', default: false },
  } });
  if (!values.round) throw new Error('Usage: review-server.mjs --round <name> [--build] [--port 5190]');
  const roundDirectory = resolve(values.root, values.round);
  if (!existsSync(roundDirectory)) throw new Error(`No round at ${roundDirectory}.`);
  let cases = listCases(roundDirectory);
  if (values.build) {
    for (const item of cases.filter(item => item.app && !item.dist)) {
      try {
        execFileSync('npm', ['run', 'build'], { cwd: item.app, stdio: 'inherit' });
      } catch {
        console.error(`${item.case}: the build failed; it is shown as not built.`);
      }
    }
    cases = listCases(roundDirectory);
  }
  const port = Number(values.port);
  cases.forEach((item, index) => {
    item.port = port + 1 + index;
    if (!item.dist) return;
    createServer((request, response) => serveStatic(item.dist, request, response, join(item.dist, 'index.html'))).listen(item.port, '127.0.0.1');
  });

  createServer(async (request, response) => {
    const { pathname } = new URL(request.url, 'http://x');
    try {
      if (request.method === 'GET' && pathname === '/api/state') {
        const verdicts = await readVerdicts();
        const state = { round: values.round, cases: cases.map(({ case: name, port: casePort, dist }) => ({ case: name, port: casePort, built: Boolean(dist) })), verdicts: verdicts.rounds[values.round] ?? { done: null, cases: {} } };
        return response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(state));
      }
      if (request.method === 'POST' && pathname === '/api/verdict') {
        const entry = await recordVerdict({ ...(await body(request)), round: values.round });
        return response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(entry));
      }
      if (request.method === 'POST' && pathname === '/api/done') {
        const entry = await markDone(values.round);
        return response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(entry));
      }
      if (request.method === 'GET' && (pathname === '/' || pathname === '/review.html')) {
        return response.writeHead(200, { 'content-type': types['.html'], 'cache-control': 'no-store' }).end(await readFile(join(here, 'review.html')));
      }
      response.writeHead(404).end();
    } catch (error) {
      response.writeHead(400, { 'content-type': 'application/json' }).end(JSON.stringify({ error: error.message }));
    }
  }).listen(port, '127.0.0.1', () => {
    console.log(`Review round ${values.round}: http://localhost:${port}/ (sandbox: http://localhost:${port}/review.html?sandbox)`);
    for (const item of cases) console.log(`  ${item.case}: ${item.dist ? `http://localhost:${item.port}/` : 'not built'}`);
  });
}

if (import.meta.filename === resolve(process.argv[1] ?? '')) main().catch(error => { console.error(error.message); process.exitCode = 1; });
