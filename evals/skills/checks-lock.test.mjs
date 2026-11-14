import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { CEILING, takeChecksLock, tickets } from '../../scripts/lib/checks-lock.mjs';

const lib = fileURLToPath(new URL('../../scripts/lib/checks-lock.mjs', import.meta.url));

// A queue of its own per test, and runs told apart by a made-up pid that counts as running.
async function queue(t) {
  const dir = await mkdtemp(join(tmpdir(), 'neon-checks-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const running = new Set();
  const lines = [];
  const take = (pid, extra = {}) => {
    running.add(pid);
    return takeChecksLock({ label: `run ${pid}`, worktree: `/work/${pid}`, dir, pid, env: {}, poll: 1, alive: (id) => running.has(id), log: (line) => lines.push(line), ...extra });
  };
  return { dir, running, lines, take };
}

test('a run alone takes the lock at once and gives it back', async (t) => {
  const { dir, lines, take } = await queue(t);
  const release = await take(1);
  assert.deepEqual(tickets(dir).map(({ pid, worktree, label }) => ({ pid, worktree, label })), [{ pid: 1, worktree: '/work/1', label: 'run 1' }]);
  release();
  assert.deepEqual(tickets(dir), []);
  assert.deepEqual(lines, [], 'a run that did not wait says nothing');
});

test('a second run names the run it waits for, by pid and worktree, then runs', async (t) => {
  const { lines, take } = await queue(t);
  const first = await take(1);
  let secondHolds = false;
  const second = take(2).then((release) => {
    secondHolds = true;
    return release;
  });
  await new Promise((later) => setTimeout(later, 30));
  assert.equal(secondHolds, false, 'the second run waits while the first holds the lock');
  assert.deepEqual(lines, ['checks lock: waiting for run 1 (pid 1, /work/1)']);
  first();
  (await second)();
  assert.equal(lines.at(-1), 'checks lock: taken by run 2');
});

test('runs go in the order they arrived', async (t) => {
  const { lines, take } = await queue(t);
  const first = await take(1);
  const order = [];
  const rest = [2, 3].map((pid) => take(pid).then((release) => {
    order.push(pid);
    release();
  }));
  await new Promise((later) => setTimeout(later, 30));
  assert.ok(lines.includes('checks lock: waiting for run 1 (pid 1, /work/1), 1 more ahead'), 'the third run says how many are ahead');
  first();
  await Promise.all(rest);
  assert.deepEqual(order, [2, 3]);
});

test('a holder that is no longer running is cleared, so a killed run blocks nothing', async (t) => {
  const { dir, running, lines, take } = await queue(t);
  await take(1);
  running.delete(1);
  const release = await take(2);
  assert.deepEqual(lines, ['checks lock: run 1 (pid 1, /work/1) is no longer running; its place is cleared']);
  assert.deepEqual(tickets(dir).map((ticket) => ticket.pid), [2]);
  release();
});

test('a ticket untouched past the ceiling is cleared though its pid answers', async (t) => {
  const { dir, take } = await queue(t);
  await take(1);
  const long = new Date(Date.now() - CEILING - 1000);
  await utimes(tickets(dir)[0].path, long, long);
  const release = await take(2);
  assert.deepEqual(tickets(dir).map((ticket) => ticket.pid), [2]);
  release();
});

test('a check started by the holder does not wait for it', async (t) => {
  const { dir, take } = await queue(t);
  const env = {};
  const release = await take(1, { env });
  assert.equal(env.NEON_CHECKS_LOCK, tickets(dir)[0].path);
  const inner = await take(2, { env: { ...env } });
  assert.deepEqual(tickets(dir).map((ticket) => ticket.pid), [1], 'the inner run takes no ticket');
  inner();
  release();
  assert.equal(env.NEON_CHECKS_LOCK, undefined);
});

// A real process: the ticket goes when the run is stopped, and is cleared when it is killed.
// Under validate this test is itself a check started by the holder, so the child is told of none.
const holder = (dir) => new Promise((ready, failed) => {
  const script = `import { takeChecksLock } from ${JSON.stringify(lib)}; await takeChecksLock({ label: 'held', dir: ${JSON.stringify(dir)} }); console.log('held'); setInterval(() => {}, 1000);`;
  const child = spawn(process.execPath, ['--input-type=module', '-e', script], { stdio: ['ignore', 'pipe', 'inherit'], env: { ...process.env, NEON_CHECKS_LOCK: '' } });
  child.on('error', failed);
  child.stdout.once('data', () => ready(child));
});
const ended = (child) => new Promise((done) => child.on('close', (code, signal) => done(signal)));

test('a run stopped by a signal gives the lock back as it goes', async (t) => {
  const { dir } = await queue(t);
  const child = await holder(dir);
  const [ticket] = tickets(dir);
  assert.equal(ticket.pid, child.pid);
  child.kill('SIGTERM');
  assert.equal(await ended(child), 'SIGTERM', 'the run still ends by the signal');
  assert.equal(existsSync(ticket.path), false);
});

test('a run killed outright leaves a ticket that the next run clears', async (t) => {
  const { dir } = await queue(t);
  const child = await holder(dir);
  child.kill('SIGKILL');
  await ended(child);
  assert.deepEqual(tickets(dir).map((ticket) => ticket.pid), [child.pid], 'the killed run could not remove its ticket');
  const lines = [];
  const release = await takeChecksLock({ label: 'next', dir, env: {}, poll: 1, log: (line) => lines.push(line) });
  assert.match(lines[0], new RegExp(`^checks lock: held \\(pid ${child.pid}, .+\\) is no longer running; its place is cleared$`));
  assert.deepEqual(tickets(dir).map((ticket) => ticket.pid), [process.pid]);
  release();
});
