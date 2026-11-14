import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { runTestFiles } from '../../scripts/lib/test-files.mjs';

const passing = "import test from 'node:test';\ntest('one', () => {});\ntest('two', () => {});\n";
const failing = "import test from 'node:test';\nimport assert from 'node:assert/strict';\ntest('fine', () => {});\ntest('the broken one', () => assert.equal(1, 2));\n";

test('each test file is named as it finishes, and a failing one prints its output', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'neon-test-files-'));
  try {
    await writeFile(join(dir, 'a.test.mjs'), passing);
    await writeFile(join(dir, 'b.test.mjs'), failing);
    await writeFile(join(dir, 'c.test.mjs'), 'process.exit(3);\n');
    const lines = [];
    const totals = await runTestFiles({ files: ['a.test.mjs', 'b.test.mjs', 'c.test.mjs'], cwd: dir, concurrency: 1, log: (line) => lines.push(line) });
    assert.deepEqual(totals, { pass: 3, fail: 2, failed: ['b.test.mjs', 'c.test.mjs'] });
    assert.match(lines[0], /^ {2}✔ a\.test\.mjs \(2 pass, [\d.]+s\)$/);
    assert.match(lines[1], /the broken one/, 'the failing file prints its full output');
    assert.match(lines[2], /^ {2}✖ b\.test\.mjs \(1 fail, 1 pass, [\d.]+s\)$/);
    assert.match(lines.at(-1), /^ {2}✖ c\.test\.mjs \(1 fail, 0 pass, [\d.]+s\)$/, 'a file that dies before reporting is one failure');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('files run a few at a time and each is counted once', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'neon-test-files-'));
  try {
    const files = ['a.test.mjs', 'b.test.mjs', 'c.test.mjs'];
    for (const file of files) await writeFile(join(dir, file), passing);
    const lines = [];
    const totals = await runTestFiles({ files, cwd: dir, concurrency: 2, log: (line) => lines.push(line) });
    assert.deepEqual(totals, { pass: 6, fail: 0, failed: [] });
    assert.deepEqual(lines.map((line) => line.match(/[abc]\.test\.mjs/)[0]).sort(), files);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
