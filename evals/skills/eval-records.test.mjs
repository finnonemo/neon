import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Guards over the eval records in records/ and their index, README.md.
const records = join(import.meta.dirname, 'records');
const files = (await readdir(records)).filter(name => name.endsWith('.md'));
const readme = await readFile(join(import.meta.dirname, 'README.md'), 'utf8');

// Recorded before the verdict rule was checked; their Partial and "Pass (fallback)" verdicts stay as run.
const legacyVerdicts = new Set(['browser-probe-in-verification.md']);

test('every record is linked from the README', () => {
  for (const name of files) assert.ok(readme.includes(`](records/${name}`), `README links records/${name}`);
});

test('each record starts with its own title', async () => {
  for (const name of files) assert.match(await readFile(join(records, name), 'utf8'), /^# \S/, name);
});

test('verdict cells are pass, fail or unverified, as the README says', async () => {
  assert.match(readme, /Verdicts are pass, fail or unverified/);
  for (const name of files.filter(name => !legacyVerdicts.has(name))) {
    const source = await readFile(join(records, name), 'utf8');
    for (const row of source.match(/^\| Verdict \|.*$/gm) ?? []) {
      for (const cell of row.split('|').slice(2, -1).map(cell => cell.trim())) {
        assert.match(cell, /^(Pass|Fail|Unverified)(?=$|[:;,.\s])/, `${name}: "${cell}"`);
      }
    }
  }
});
