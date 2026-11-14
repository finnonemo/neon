#!/usr/bin/env node
// Writes the Core snapshot (GLOSSARY, ADR 0009) from a Core checkout into core/:
//   node scripts/sync-core.mjs --from <Core checkout> [--compiler <Core checkout>] [--dry-run] [--subjects]
//   node scripts/sync-core.mjs --index
// Core's repository compiles its docs for the web (ADR 0012): this runs the checkout's Web compile, as sync-block
// runs Block's bundle build, copies what it wrote and records the commit the compile names and each file's hash.
// The compile refuses a checkout whose docs are not committed.
// --compiler runs another Core checkout's compile on the --from checkout, for a Core commit older than the compile;
// the snapshot then records the compiler's commit beside the docs'.
// Which Core doc each registry item matches is Neon's own table, registry/core-counterparts.json. The snapshot is
// never edited by hand: the repository check compares each file with the hash the sync recorded.
// It prints how far Core moved since the snapshot it replaces and the files that changed. Core's repository is
// private: its commits are named by hash, and --subjects adds their subjects, to read and not to paste.
// --dry-run compiles, refuses what a sync refuses and prints the same, and writes nothing.
// --index writes core/index.json again from the Counterpart table and the snapshot as checked in, with no Core
// checkout: what a change to the table alone needs, and what settles a merge conflict in the index or the manifest.
// The same run writes what follows the snapshot's Theme: the Theme token export
// and the CSS adapter's colors (scripts/lib/core-theme.mjs); and what follows its
// text styles: the adapter's type sizes and line heights (scripts/lib/core-type.mjs).
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { syncCore, indexCore, movedReport, SNAPSHOT_DIR, COUNTERPARTS_FILE } from './lib/core-snapshot.mjs';
import { writeCoreTheme, THEME_EXPORT, ADAPTER } from './lib/core-theme.mjs';
import { writeCoreType } from './lib/core-type.mjs';
import { registryComponents } from './lib/registry.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const option = name => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const from = option('--from');
const index = args.includes('--index');
const dryRun = args.includes('--dry-run');
// --index takes the snapshot as checked in, so it has no Core checkout to name and nothing to run dry.
if (index ? from || dryRun : !from) {
  console.error('Usage: node scripts/sync-core.mjs --from <Core checkout> [--compiler <Core checkout>] [--dry-run] [--subjects]\n       node scripts/sync-core.mjs --index');
  process.exit(2);
}
try {
  const snapshot = {
    out: resolve(root, SNAPSHOT_DIR),
    items: await registryComponents(root),
    counterparts: JSON.parse(await readFile(resolve(root, COUNTERPARTS_FILE), 'utf8')),
  };
  if (index) {
    const { changed } = await indexCore(snapshot);
    console.log(changed
      ? `Wrote ${SNAPSHOT_DIR}/index.json from ${COUNTERPARTS_FILE}, and its hash and the seal in ${SNAPSHOT_DIR}/snapshot.json.`
      : `${SNAPSHOT_DIR}/index.json already follows ${COUNTERPARTS_FILE}: nothing changed.`);
    process.exit(0);
  }
  const { commit, compiler, files, leftOut, moved } = await syncCore({ ...snapshot, from: resolve(from), compiler: resolve(option('--compiler') ?? from), write: !dryRun });
  if (dryRun) console.log(`Dry run: nothing is written. The Theme export and the adapter are not written or checked.`);
  console.log(`${dryRun ? 'Would write' : 'Wrote'} ${files.length} files to ${SNAPSHOT_DIR}/ from Core ${commit}${compiler ? `, compiled by Core ${compiler}` : ''}.`);
  for (const line of movedReport(moved, commit, { subjects: args.includes('--subjects') })) console.log(line);
  const byStanding = Object.groupBy(Object.keys(leftOut), name => leftOut[name]);
  for (const [standing, names] of Object.entries(byStanding)) console.log(`Left out, ${standing}: ${names.join(', ')}.`);
  if (dryRun) process.exit(0);
  await writeCoreTheme(root);
  await writeCoreType(root);
  console.log(`Wrote ${THEME_EXPORT} and the colors of ${ADAPTER} from the snapshot's Theme, and its type sizes and line heights from the snapshot's text styles. Rebuild the registry: node scripts/build-registry.mjs`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
