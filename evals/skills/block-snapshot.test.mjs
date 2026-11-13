import test from 'node:test';
import assert from 'node:assert/strict';
import { access, appendFile, cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { packagePlugin } from '../../scripts/package-plugin.mjs';
import { BLOCK_SNAPSHOT_DIR, TREK_FONTS, checkBlockSnapshot } from '../../scripts/lib/block-snapshot.mjs';

const snapshot = join(import.meta.dirname, '../..', BLOCK_SNAPSHOT_DIR);
async function copyOfSnapshot() {
  const directory = join(await mkdtemp(join(tmpdir(), 'neon-block-test-')), 'block');
  await cp(snapshot, directory, { recursive: true });
  return directory;
}

test('the Block snapshot is what the sync wrote, and names the Block commit it was built from', async () => {
  const block = await checkBlockSnapshot(snapshot);
  assert.match(block.commit, /^[0-9a-f]{40}$/);
});

test('a hand edit, a missing file and a stray file each fail the check', async () => {
  const edited = await copyOfSnapshot();
  await appendFile(join(edited, 'block-engine.mjs'), '\n// tuned by hand\n');
  await assert.rejects(checkBlockSnapshot(edited), /block-engine\.mjs does not match what the sync wrote/);

  const missing = await copyOfSnapshot();
  await rm(join(missing, 'hb.wasm'));
  await assert.rejects(checkBlockSnapshot(missing), /hb\.wasm is missing/);

  const stray = await copyOfSnapshot();
  await writeFile(join(stray, 'fonts/Other.otf'), 'x');
  await assert.rejects(checkBlockSnapshot(stray), /fonts\/Other\.otf is not a file the sync wrote/);

  const relisted = await copyOfSnapshot();
  await writeFile(join(relisted, 'manifest.json'), JSON.stringify({ block: { commit: 'x' }, files: {}, seal: 'x' }));
  await assert.rejects(checkBlockSnapshot(relisted), /manifest\.json does not match what the sync wrote/);
});

test('Finnomena Trek is a local file: the check allows it, and the packaged plugin never carries it', async () => {
  const withTrek = await copyOfSnapshot();
  for (const name of TREK_FONTS) await writeFile(join(withTrek, 'fonts', name), 'local');
  await checkBlockSnapshot(withTrek);

  const sourceRoot = await mkdtemp(join(tmpdir(), 'neon-block-source-'));
  const repository = join(import.meta.dirname, '../..');
  const { entries } = await packagePlugin({ destination: await mkdtemp(join(tmpdir(), 'neon-block-entries-')) });
  for (const entry of entries.filter(entry => entry !== BLOCK_SNAPSHOT_DIR)) await cp(join(repository, entry), join(sourceRoot, entry), { recursive: true });
  await cp(withTrek, join(sourceRoot, BLOCK_SNAPSHOT_DIR), { recursive: true });
  const destination = await mkdtemp(join(tmpdir(), 'neon-block-package-'));
  await packagePlugin({ sourceRoot, destination });
  await checkBlockSnapshot(join(destination, BLOCK_SNAPSHOT_DIR));
  for (const name of TREK_FONTS) await assert.rejects(access(join(destination, BLOCK_SNAPSHOT_DIR, 'fonts', name)));
  await access(join(destination, BLOCK_SNAPSHOT_DIR, 'fonts/IBMPlexSansThai-Regular.ttf'));
});
