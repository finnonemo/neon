import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

// build-index.test.mjs covers titles and the index; this guards the verdict words.
const records = join(import.meta.dirname, 'records');
const files = (await readdir(records)).filter(name => name.endsWith('.md'));
const readme = await readFile(join(import.meta.dirname, 'README.md'), 'utf8');

// Recorded before the verdict rule was checked; their Partial and "Pass (fallback)" verdicts stay as run.
const legacyVerdicts = new Set(['browser-probe-in-verification.md']);

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
