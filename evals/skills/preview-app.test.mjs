import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const script = new URL('../../scripts/preview-app.mjs', import.meta.url).pathname;

// A stand-in app: build writes dist/index.html after a delay; preview prints
// its URL before it listens, as a dev server announcing itself early might.
async function fixture(scripts) {
  const app = await mkdtemp(join(tmpdir(), 'neon-preview-'));
  await mkdir(join(app, 'node_modules'));
  await writeFile(join(app, 'build.mjs'), `
    import { mkdir, writeFile } from 'node:fs/promises';
    await new Promise((wait) => setTimeout(wait, 300));
    await mkdir('dist', { recursive: true });
    await writeFile('dist/index.html', 'built');
  `);
  await writeFile(join(app, 'serve.mjs'), `
    import { createServer } from 'node:http';
    import { readFile } from 'node:fs/promises';
    const server = createServer(async (request, response) => response.end(await readFile('dist/index.html')));
    server.listen(0, '127.0.0.1', () => {
      console.log('  \\x1b[32m➜\\x1b[0m  Local:   \\x1b[36mhttp://127.0.0.1:' + server.address().port + '/\\x1b[0m');
    });
  `);
  await writeFile(join(app, 'package.json'), JSON.stringify({ scripts }));
  return app;
}

function run(app) {
  const child = spawn(process.execPath, [script, app, '--timeout', '10'], { stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  const ready = new Promise((resolveReady) => {
    child.stdout.on('data', () => { const url = stdout.match(/^Ready: (\S+)$/m)?.[1]; if (url) resolveReady(url); });
    child.on('exit', (code) => resolveReady({ code, stdout, stderr }));
  });
  return { child, ready };
}

test('prints Ready only after the build finished and the page answers 200', async (t) => {
  const app = await fixture({ build: 'node build.mjs', preview: 'node serve.mjs' });
  const { child, ready } = run(app);
  t.after(async () => { child.kill('SIGTERM'); await rm(app, { recursive: true, force: true }); });
  const url = await ready;
  assert.equal(typeof url, 'string', JSON.stringify(url));
  const response = await fetch(url);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'built');
});

test('refuses a directory without a preview script', async (t) => {
  const app = await fixture({ build: 'node build.mjs' });
  t.after(() => rm(app, { recursive: true, force: true }));
  const { code, stdout, stderr } = await run(app).ready;
  assert.equal(code, 2);
  assert.equal(stdout, '');
  assert.match(stderr, /no preview script/);
});

test('starts no preview when the build fails', async (t) => {
  const app = await fixture({ build: 'node -e "process.exit(3)"', preview: 'node serve.mjs' });
  t.after(() => rm(app, { recursive: true, force: true }));
  const { code, stdout, stderr } = await run(app).ready;
  assert.equal(code, 1);
  assert.equal(stdout, '');
  assert.match(stderr, /Build failed; no preview started/);
});
