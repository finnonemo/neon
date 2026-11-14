#!/usr/bin/env node
// Writes the Core snapshot (GLOSSARY, ADR 0009) from a Core checkout into core/:
//   node scripts/sync-core.mjs --from <Core checkout> [--compiler <Core checkout>]
// Core's repository compiles its docs for the web (ADR 0012): this runs the checkout's Web compile, as sync-block
// runs Block's bundle build, copies what it wrote and records the commit the compile names and each file's hash.
// The compile refuses a checkout whose docs are not committed.
// --compiler runs another Core checkout's compile on the --from checkout, for a Core commit older than the compile;
// the snapshot then records the compiler's commit beside the docs'.
// A change to Neon's own tables alone needs no checkout and leaves the commit where it is:
//   node scripts/sync-core.mjs --from-snapshot
// rewrites the index from the Counterpart table, and the colors and type below from the Role table, out of the
// snapshot core/ already holds. It refuses a snapshot that is not the one the sync wrote.
// Which Core doc each registry item matches is Neon's own table, registry/core-counterparts.json. The snapshot is
// never edited by hand: the repository check compares each file with the hash the sync recorded.
// It prints Core's commits since the snapshot it replaces and the files that changed: the pull request lists both.
// The same run writes what follows the snapshot's Theme: the Theme token export
// and the CSS adapter's colors (scripts/lib/core-theme.mjs); and what follows its
// text styles: the adapter's type sizes and line heights (scripts/lib/core-type.mjs).
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { syncCore, syncIndex, movedReport, SNAPSHOT_DIR, COUNTERPARTS_FILE } from './lib/core-snapshot.mjs';
import { writeCoreTheme, THEME_EXPORT, ADAPTER } from './lib/core-theme.mjs';
import { writeCoreType } from './lib/core-type.mjs';
import { registryComponents } from './lib/registry.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const option = name => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const from = option('--from');
const fromSnapshot = args.includes('--from-snapshot');
// One source: a Core checkout to compile, or the snapshot Neon holds.
if (Boolean(from) === fromSnapshot) {
  console.error('Usage: node scripts/sync-core.mjs --from <Core checkout> [--compiler <Core checkout>]\n       node scripts/sync-core.mjs --from-snapshot');
  process.exit(2);
}
try {
  const out = resolve(root, SNAPSHOT_DIR);
  const items = await registryComponents(root);
  const counterparts = JSON.parse(await readFile(resolve(root, COUNTERPARTS_FILE), 'utf8'));
  if (fromSnapshot) {
    const { commit, changed } = await syncIndex({ out, items, counterparts });
    console.log(changed
      ? `Rewrote ${SNAPSHOT_DIR}/index.json from ${COUNTERPARTS_FILE}, and its hash and the seal in ${SNAPSHOT_DIR}/snapshot.json. The snapshot stays at Core ${commit}.`
      : `${SNAPSHOT_DIR}/index.json already follows ${COUNTERPARTS_FILE}. The snapshot stays at Core ${commit}.`);
  } else {
    const { commit, compiler, files, leftOut, moved } = await syncCore({ from: resolve(from), compiler: resolve(option('--compiler') ?? from), out, items, counterparts });
    console.log(`Wrote ${files.length} files to ${SNAPSHOT_DIR}/ from Core ${commit}${compiler ? `, compiled by Core ${compiler}` : ''}.`);
    for (const line of movedReport(moved, commit)) console.log(line);
    const byStanding = Object.groupBy(Object.keys(leftOut), name => leftOut[name]);
    for (const [standing, names] of Object.entries(byStanding)) console.log(`Left out, ${standing}: ${names.join(', ')}.`);
  }
  await writeCoreTheme(root);
  await writeCoreType(root);
  console.log(`Wrote ${THEME_EXPORT} and the colors of ${ADAPTER} from the snapshot's Theme, and its type sizes and line heights from the snapshot's text styles. Rebuild the registry: node scripts/build-registry.mjs`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
