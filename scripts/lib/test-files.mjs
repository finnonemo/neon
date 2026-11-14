// Runs node:test files one process each, a few at a time, and reports each file as it finishes.
import { spawn } from 'node:child_process';
import { availableParallelism } from 'node:os';

function count(output, name) {
  return Number(output.match(new RegExp(`^(?:ℹ|#) ${name} (\\d+)`, 'm'))?.[1] ?? 0);
}

/**
 * Runs each of `files` with `node --test`, at most `concurrency` at once (the test runner's own
 * default). A passing file logs one line as it finishes; a failing file logs its full output
 * first. Resolves to the pass and fail counts and the files that failed.
 */
export async function runTestFiles({ files, cwd, concurrency = Math.max(1, availableParallelism() - 1), log = console.log }) {
  const totals = { pass: 0, fail: 0, failed: [] };
  const queue = [...files];
  // Inside a test run this variable makes a child runner report in the parent's wire format.
  const { NODE_TEST_CONTEXT: _, ...env } = process.env;
  const one = (file) => new Promise((done) => {
    const started = Date.now();
    const child = spawn(process.execPath, ['--test', '--test-reporter=spec', file], { cwd, env });
    let output = '';
    child.stdout.on('data', (chunk) => (output += chunk));
    child.stderr.on('data', (chunk) => (output += chunk));
    child.on('error', (error) => (output += error.message));
    child.on('close', (status) => {
      const pass = count(output, 'pass');
      // A file that dies before its tests report still counts as one failure.
      const fail = status === 0 ? 0 : Math.max(1, count(output, 'fail'));
      const seconds = ((Date.now() - started) / 1000).toFixed(1);
      totals.pass += pass;
      totals.fail += fail;
      if (status === 0) log(`  ✔ ${file} (${pass} pass, ${seconds}s)`);
      else {
        totals.failed.push(file);
        log(output.trimEnd());
        log(`  ✖ ${file} (${fail} fail, ${pass} pass, ${seconds}s)`);
      }
      done();
    });
  });
  const worker = async () => {
    for (let file = queue.shift(); file; file = queue.shift()) await one(file);
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker));
  return totals;
}
