import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { checkAdrNumbers } from '../../scripts/lib/adr-numbers.mjs';

async function adrs(t, names) {
  const directory = await mkdtemp(join(tmpdir(), 'neon-adr-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const name of names) await writeFile(join(directory, name), '# Decision\n');
  return directory;
}

test('rejects two ADRs that share a number', async t => {
  const directory = await adrs(t, ['0003-gradients-from-palette-recipes.md', '0003-campaign-pages-skip-the-floor.md', '0004-other.md']);
  await assert.rejects(checkAdrNumbers(directory), /0003-campaign-pages-skip-the-floor.md, 0003-gradients-from-palette-recipes.md/);
});

test('accepts distinct numbers and ignores files that are not ADRs', async t => {
  const directory = await adrs(t, ['0001-a.md', '0002-b.md', 'README.md']);
  await checkAdrNumbers(directory);
});
