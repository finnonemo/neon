#!/usr/bin/env node
// Writes the Core snapshot (GLOSSARY, ADR 0009) from a Core checkout into core/:
//   node scripts/sync-core.mjs --from <Core checkout> [--at <commit or ref>] [--compiler <Core checkout>]
// Core's repository compiles its docs for the web (ADR 0012): this runs the checkout's Web compile, as sync-block
// runs Block's bundle build, copies what it wrote and records the commit the compile names and each file's hash.
// The compile refuses a checkout whose docs are not committed.
// --at compiles that commit in a temporary worktree of the checkout and removes it after, so the checkout's own
// working tree and branch stay as they are, and the snapshot is pinned to the commit named, not to what the checkout
// has checked out when the sync runs.
// --compiler runs another Core checkout's compile on the --from checkout, for a Core commit older than the compile;
// the snapshot then records the compiler's commit beside the docs'.
// Which Core doc each registry item matches is Neon's own table, registry/core-counterparts.json. The snapshot is
// never edited by hand: the repository check compares each file with the hash the sync recorded.
// It prints Core's commits since the snapshot it replaces and the files that changed: the pull request lists both.
// It prints each color role whose value the run changed, per mode: the pull request names each and its contrast.
// The same run writes what follows the snapshot's Theme: the Theme token export
// and the CSS adapter's colors (scripts/lib/core-theme.mjs); and what follows its
// text styles: the adapter's type sizes and line heights (scripts/lib/core-type.mjs).
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { syncCore, movedReport, SNAPSHOT_DIR, COUNTERPARTS_FILE } from './lib/core-snapshot.mjs';
import { writeCoreTheme, changedRolesReport, THEME_EXPORT, ADAPTER } from './lib/core-theme.mjs';
import { writeCoreType } from './lib/core-type.mjs';
import { registryComponents } from './lib/registry.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const option = name => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const from = option('--from');
if (!from) {
  console.error('Usage: node scripts/sync-core.mjs --from <Core checkout> [--at <commit or ref>] [--compiler <Core checkout>]');
  process.exit(2);
}
try {
  const { commit, compiler, files, leftOut, moved } = await syncCore({
    from: resolve(from),
    at: option('--at'),
    compiler: option('--compiler') && resolve(option('--compiler')),
    out: resolve(root, SNAPSHOT_DIR),
    items: await registryComponents(root),
    counterparts: JSON.parse(await readFile(resolve(root, COUNTERPARTS_FILE), 'utf8')),
  });
  console.log(`Wrote ${files.length} files to ${SNAPSHOT_DIR}/ from Core ${commit}${compiler ? `, compiled by Core ${compiler}` : ''}.`);
  for (const line of movedReport(moved, commit)) console.log(line);
  const byStanding = Object.groupBy(Object.keys(leftOut), name => leftOut[name]);
  for (const [standing, names] of Object.entries(byStanding)) console.log(`Left out, ${standing}: ${names.join(', ')}.`);
  const { changed } = await writeCoreTheme(root);
  await writeCoreType(root);
  console.log(`Wrote ${THEME_EXPORT} and the colors of ${ADAPTER} from the snapshot's Theme, and its type sizes and line heights from the snapshot's text styles. Rebuild the registry: node scripts/build-registry.mjs`);
  for (const line of changedRolesReport(changed)) console.log(line);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
