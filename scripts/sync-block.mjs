#!/usr/bin/env node
// Builds the Block snapshot (GLOSSARY, ADR 0010) from a Block checkout into block/:
//   node scripts/sync-block.mjs --from <Block checkout> [--trek]
// The checkout's HEAD is the commit the snapshot records, so its changes must be committed and its
// dependencies installed (npm ci). --trek also copies the Finnomena Trek fonts, which stay local files
// (.gitignore): the typeface's licence forbids distributing it without written permission.
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { syncBlock, BLOCK_SNAPSHOT_DIR } from './lib/block-snapshot.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const flag = args.indexOf('--from');
const from = flag > -1 ? args[flag + 1] : undefined;
if (!from) {
  console.error('Usage: node scripts/sync-block.mjs --from <Block checkout> [--trek]');
  process.exit(2);
}
try {
  const { commit, files, trek } = await syncBlock({ from: resolve(from), out: resolve(root, BLOCK_SNAPSHOT_DIR), trek: args.includes('--trek') });
  console.log(`Wrote ${files.length} files to ${BLOCK_SNAPSHOT_DIR}/ from Block ${commit}.`);
  console.log(trek.length ? `Finnomena Trek is here as local files, not part of the snapshot: ${trek.join(', ')}.` : 'Finnomena Trek is not here: artwork text is drawn in IBM Plex Sans Thai.');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
