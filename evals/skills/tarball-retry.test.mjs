import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runRetryingMissingTarball } from '../templates/tarball-retry.mjs';

const E404 = 'npm error code E404\nnpm error 404 Not Found - GET https://registry.npmjs.org/@scope/pkg/-/pkg-8.73.0.tgz - Not found';

/** A command that counts its runs in a file, and fails with `message` until run number `passAt`. */
async function command({ message, passAt }) {
  const work = await mkdtemp(join(tmpdir(), 'neon-retry-test-'));
  const counter = join(work, 'runs');
  const script = join(work, 'install.mjs');
  await writeFile(counter, '0');
  await writeFile(script, `
    import { readFileSync, writeFileSync } from 'node:fs';
    const run = Number(readFileSync(${JSON.stringify(counter)}, 'utf8')) + 1;
    writeFileSync(${JSON.stringify(counter)}, String(run));
    if (run < ${passAt}) { console.error(${JSON.stringify(message)}); process.exit(1); }
    console.log('installed');
  `);
  return { script, runs: async () => Number(await readFile(counter, 'utf8')) };
}

const quiet = { write() {} };
const options = (extra) => ({ waitMs: 1, stdout: quiet, stderr: quiet, log() {}, ...extra });

test('an install that fails on a tarball npm does not serve yet is run again until it passes', async () => {
  const { script, runs } = await command({ message: E404, passAt: 3 });
  const logged = [];
  let cleared = 0;
  await runRetryingMissingTarball(process.execPath, [script], options({ log: (line) => logged.push(line), beforeRetry: async () => { cleared++; } }));
  assert.equal(await runs(), 3);
  assert.equal(cleared, 2, 'what a failed run left is cleared before each new run');
  assert.match(logged[0], /pkg-8\.73\.0\.tgz yet; run 2 of 5/);
});

test('a tarball that never appears stops the suite, naming it', async () => {
  const { script, runs } = await command({ message: E404, passAt: Infinity });
  await assert.rejects(runRetryingMissingTarball(process.execPath, [script], options({ tries: 3 })), /still answers 404 for \S+pkg-8\.73\.0\.tgz after 3 runs/);
  assert.equal(await runs(), 3);
});

test('any other failure stops at once', async () => {
  const { script, runs } = await command({ message: 'npm error code ERESOLVE', passAt: Infinity });
  await assert.rejects(runRetryingMissingTarball(process.execPath, [script], options()), /exited 1$/);
  assert.equal(await runs(), 1);
});
