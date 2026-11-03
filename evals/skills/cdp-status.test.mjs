import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';

const script = new URL('../../scripts/cdp-status.mjs', import.meta.url).pathname;

function run(...profiles) {
  return new Promise((done) => {
    execFile(process.execPath, [script, ...profiles.flatMap((dir) => ['--user-data-dir', dir])], (error, stdout) => done({ code: error?.code ?? 0, stdout }));
  });
}

async function profile(t, portFile) {
  const dir = await mkdtemp(join(tmpdir(), 'neon-cdp-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  if (portFile !== undefined) await writeFile(join(dir, 'DevToolsActivePort'), portFile);
  return dir;
}

async function serve(t, handler) {
  const server = createServer(handler);
  await new Promise((listening) => server.listen(0, '127.0.0.1', listening));
  t.after(() => server.close());
  return server.address().port;
}

test('reports off when the profile has no port file', async (t) => {
  const { code, stdout } = await run(await profile(t));
  assert.equal(code, 1);
  assert.match(stdout, /^off .*no DevToolsActivePort/m);
  assert.match(stdout, /Enabling remote debugging is the user's call/);
});

test('reports stale when the port file names a port nothing listens on', async (t) => {
  // A port that was just free: listen on any port, then close it.
  const server = createServer();
  await new Promise((listening) => server.listen(0, '127.0.0.1', listening));
  const { port } = server.address();
  await new Promise((closed) => server.close(closed));
  const { code, stdout } = await run(await profile(t, `${port}\n/devtools/browser/old\n`));
  assert.equal(code, 1);
  assert.match(stdout, new RegExp(`^stale .*names port ${port}, but nothing listens`, 'm'));
});

test('reports live with the HTTP endpoint when /json/version answers', async (t) => {
  const port = await serve(t, (request, response) => {
    if (request.url !== '/json/version') return response.writeHead(404).end();
    response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ Browser: 'Chrome/142.0', webSocketDebuggerUrl: `ws://127.0.0.1:${port}/devtools/browser/abc` }));
  });
  const { code, stdout } = await run(await profile(t, `${port}\n/devtools/browser/abc\n`));
  assert.equal(code, 0);
  assert.match(stdout, new RegExp(`^live .*http://127\\.0\\.0\\.1:${port} \\(Chrome/142\\.0\\)`, 'm'));
});

test('reports ws-only with the browser WebSocket when /json/version is not served', async (t) => {
  const port = await serve(t, (request, response) => response.writeHead(404).end());
  const { code, stdout } = await run(await profile(t, `${port}\n/devtools/browser/abc\n`));
  assert.equal(code, 0);
  assert.match(stdout, new RegExp(`^ws-only .*ws://127\\.0\\.0\\.1:${port}/devtools/browser/abc$`, 'm'));
});
