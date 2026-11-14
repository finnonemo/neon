// One machine-wide lock for the heavy checks (scripts/validate.mjs and the browser suite), so
// runs started from several worktrees queue instead of slowing each other into timeouts.
//
// The lock is a queue of tickets in the OS temp directory, one file per run, named by a sequence
// number. The run with the lowest number holds the lock; the others wait in order. A ticket whose
// process is gone is removed by whoever sees it, so a killed run blocks nothing.
import { linkSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const QUEUE = join(tmpdir(), 'neon-checks');
// A process id can be given to another process after its run died. A waiting run touches its
// ticket at every poll and a holder when it takes the lock, so a ticket untouched for this long
// is a run that died, whatever its process id answers. No check runs this long; a machine that
// slept this long mid-run loses the ticket too, and the run goes on unlocked.
export const CEILING = 2 * 60 * 60_000;
const SIGNALS = ['SIGINT', 'SIGTERM', 'SIGHUP'];

/** Whether process `pid` exists; one we may not signal still exists. */
export function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

function read(path) {
  try {
    return { ...JSON.parse(readFileSync(path, 'utf8')), touched: statSync(path).mtimeMs, path };
  } catch {
    return null;
  }
}

/** The queue's tickets, lowest number first. */
export function tickets(dir = QUEUE) {
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  return names
    .filter((name) => /^\d+\.json$/.test(name))
    .map((name) => ({ seq: Number(name.slice(0, -5)), ...read(join(dir, name)) }))
    .filter((ticket) => ticket.path)
    .sort((a, b) => a.seq - b.seq);
}

// link() fails when the name exists, so two runs never share a number, and a number is always
// above every ticket there, so no run joins the queue ahead of one already in it.
function enqueue(dir, body) {
  mkdirSync(dir, { recursive: true });
  const draft = join(dir, `.${body.pid}-${Math.random().toString(36).slice(2)}.draft`);
  writeFileSync(draft, JSON.stringify(body));
  try {
    for (let seq = (tickets(dir).at(-1)?.seq ?? 0) + 1; ; seq += 1) {
      const path = join(dir, `${String(seq).padStart(8, '0')}.json`);
      try {
        linkSync(draft, path);
        return { seq, path };
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
      }
    }
  } finally {
    rmSync(draft, { force: true });
  }
}

const describe = (ticket) => `${ticket.label} (pid ${ticket.pid}, ${ticket.worktree})`;

/**
 * Waits for the checks lock and resolves to `release()`. While it waits it logs the run it waits
 * for, by label, pid and worktree, once per run. A run started by the holder (its environment
 * names the holder's ticket) goes straight through, so a check may start another.
 * The lock is also released when the process exits or is stopped by a signal.
 */
export async function takeChecksLock({
  label,
  worktree = process.cwd(),
  dir = QUEUE,
  log = console.log,
  poll = 2000,
  env = process.env,
  pid = process.pid,
  alive = isAlive,
  wait = (ms) => new Promise((done) => setTimeout(done, ms)),
  now = Date.now,
}) {
  const parent = env.NEON_CHECKS_LOCK && read(env.NEON_CHECKS_LOCK);
  if (parent && alive(parent.pid)) return () => {};

  const gone = (ticket) => !alive(ticket.pid) || now() - ticket.touched > CEILING;
  const body = { pid, worktree, label, since: new Date(now()).toISOString() };
  let mine = enqueue(dir, body);
  let announced;
  for (;;) {
    const ahead = [];
    for (const ticket of tickets(dir)) {
      if (ticket.seq >= mine.seq) break;
      if (gone(ticket)) {
        rmSync(ticket.path, { force: true });
        log(`checks lock: ${describe(ticket)} is no longer running; its place is cleared`);
      } else ahead.push(ticket);
    }
    // A run that slept past the ceiling lost its ticket: it queues again, at the back.
    if (read(mine.path)?.pid !== pid) {
      mine = enqueue(dir, body);
      continue;
    }
    if (ahead.length === 0) break;
    if (announced !== ahead[0].seq) {
      announced = ahead[0].seq;
      log(`checks lock: waiting for ${describe(ahead[0])}${ahead.length > 1 ? `, ${ahead.length - 1} more ahead` : ''}`);
    }
    const stamp = new Date(now());
    utimesSync(mine.path, stamp, stamp);
    await wait(poll);
  }
  const stamp = new Date(now());
  utimesSync(mine.path, stamp, stamp);
  if (announced !== undefined) log(`checks lock: taken by ${label}`);
  env.NEON_CHECKS_LOCK = mine.path;

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    if (read(mine.path)?.pid === pid) rmSync(mine.path, { force: true });
    if (env.NEON_CHECKS_LOCK === mine.path) delete env.NEON_CHECKS_LOCK;
    process.off('exit', release);
    for (const signal of SIGNALS) process.off(signal, stopped[signal]);
  };
  // A handler replaces the signal's default, so stop the process the way the signal would have.
  const stopped = Object.fromEntries(SIGNALS.map((signal) => [signal, () => {
    release();
    process.kill(process.pid, signal);
  }]));
  process.on('exit', release);
  for (const signal of SIGNALS) process.on(signal, stopped[signal]);
  return release;
}
