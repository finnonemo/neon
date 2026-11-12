#!/usr/bin/env node
// Compiles the Core snapshot (GLOSSARY, ADR 0009) from a Core checkout into core/:
//   node scripts/sync-core.mjs --from <Core checkout>
// The checkout's HEAD is the commit the snapshot records, so its docs must be
// committed. Which Core doc each registry item matches is Neon's own table,
// registry/core-counterparts.json. The snapshot is never edited by hand: the
// repository check compares each file with the hash the sync recorded.
// The same run writes what follows the snapshot's Theme: the Theme token export
// and the CSS adapter's colors (scripts/lib/core-theme.mjs); and what follows its
// text styles: the adapter's type sizes and line heights (scripts/lib/core-type.mjs).
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { syncCore, SNAPSHOT_DIR, COUNTERPARTS_FILE } from './lib/core-snapshot.mjs';
import { writeCoreTheme, THEME_EXPORT, ADAPTER } from './lib/core-theme.mjs';
import { writeCoreType } from './lib/core-type.mjs';
import { registryComponents } from './lib/registry.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const flag = process.argv.indexOf('--from');
const from = flag > -1 ? process.argv[flag + 1] : undefined;
if (!from) {
  console.error('Usage: node scripts/sync-core.mjs --from <Core checkout>');
  process.exit(2);
}
try {
  const { commit, files, leftOut } = await syncCore({
    from: resolve(from),
    out: resolve(root, SNAPSHOT_DIR),
    items: await registryComponents(root),
    counterparts: JSON.parse(await readFile(resolve(root, COUNTERPARTS_FILE), 'utf8')),
  });
  console.log(`Wrote ${files.length} files to ${SNAPSHOT_DIR}/ from Core ${commit}.`);
  const byStatus = Object.groupBy(Object.keys(leftOut), name => leftOut[name]);
  for (const [status, names] of Object.entries(byStatus)) console.log(`Left out, ${status}: ${names.join(', ')}.`);
  await writeCoreTheme(root);
  await writeCoreType(root);
  console.log(`Wrote ${THEME_EXPORT} and the colors of ${ADAPTER} from the snapshot's Theme, and its type sizes and line heights from the snapshot's text styles. Rebuild the registry: node scripts/build-registry.mjs`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
