#!/usr/bin/env node
// Builds the Neon registry into registry/r/, pinned to the release tag.
//
//   node scripts/build-registry.mjs [--url <base URL>] [--out <directory>]
//
// --url and --out together build an unpinned copy elsewhere, as the browser
// runner does for a local server. The tracked registry/r/ is always pinned.
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUILD_DIR, buildRegistry, pinnedRegistryUrl } from './lib/registry.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const option = (name) => { const at = process.argv.indexOf(name); return at > 0 ? process.argv[at + 1] : undefined; };
const url = option('--url') ?? await pinnedRegistryUrl(root);
const out = resolve(option('--out') ?? join(root, BUILD_DIR));
if (option('--url') && out === resolve(root, BUILD_DIR)) throw new Error('registry/r/ is pinned to the release; pass --out for an unpinned build.');

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const built = await buildRegistry({ root, url });
for (const [name, content] of built) await writeFile(join(out, name), content);
console.log(`Built ${built.size - 1} items into ${out} for ${url}`);
