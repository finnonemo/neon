// The Block snapshot (GLOSSARY, ADR 0010): the built Block engine and the fonts it draws text in, copied from a
// Block checkout into block/ and pinned to that checkout's commit. Never edited by hand: the repository check
// compares each file with the hash the sync recorded.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const BLOCK_SNAPSHOT_DIR = 'block';
export const BLOCK_MANIFEST = 'manifest.json';
const BLOCK_REPOSITORY = 'github.com/pawisssh/block';
const ENGINE_FILES = ['block-engine.mjs', 'hb.wasm'];
// IBM Plex is under the SIL Open Font License, which lets it travel with the snapshot.
const OPEN_FONTS = [
  'IBMPlexSansThai-Regular.ttf',
  'IBMPlexSansThai-Medium.ttf',
  'IBMPlexSansThai-LICENSE.txt',
  'IBMPlexMono-Regular.ttf',
  'IBMPlexMono-LICENSE.txt',
];
// Finnomena Trek is under Fontcraft's licence, which forbids distributing it without written permission. The sync
// copies it only when told to, and it is never listed in the manifest, so it stays a local file (.gitignore).
export const TREK_FONTS = ['FinnomenaTrek-Regular.otf', 'FinnomenaTrek-Medium.otf'];

const sha256 = content => createHash('sha256').update(content).digest('hex');
const sealOf = ({ block, files }) => sha256(JSON.stringify({ block, files }));

const NOTICE = commit => `Block snapshot

Built from Block (${BLOCK_REPOSITORY}), Finnomena's Pattern builder, at commit ${commit}
by scripts/sync-block.mjs. Do not edit these files: change Block and sync again.

Code: MIT License
  block-engine.mjs: Copyright (c) 2026 Pawish Gawinseth. It bundles harfbuzzjs, Copyright (c) 2019 Ebrahim
  Byagowi, MIT License; hb.wasm is HarfBuzz built by that project.

Finnomena brand assets: all rights reserved
  Copyright (c) Finnomena. Used under the Finnomena brand guideline; no licence to them is granted here.
  The Finnomena logo and the Reference Patterns embedded in block-engine.mjs, and the artwork it draws.

IBM Plex: SIL Open Font License 1.1
  fonts/IBMPlexSansThai-*.ttf and fonts/IBMPlexMono-Regular.ttf
  Copyright (c) 2017 IBM Corp. with Reserved Font Name "Plex". The licence text is beside the fonts.

FinnomenaTrek: not included
  Fontcraft's licence forbids distributing the typeface without written permission, so its files are not part
  of this snapshot. Where fonts/FinnomenaTrek-Regular.otf and fonts/FinnomenaTrek-Medium.otf are present, or
  FINNO_FONTS_DIR names a directory that holds them, artwork text is drawn in Trek; otherwise in IBM Plex Sans Thai.
`;

/**
 * Builds the engine in the Block checkout at `from` and writes the snapshot to `out`. The checkout must be clean,
 * so the commit the snapshot records is what was built. `trek` also copies the Trek fonts, as local files.
 */
export async function syncBlock({ from, out, trek = false }) {
  if (!existsSync(join(from, 'scripts/build-engine-bundle.mjs'))) {
    throw new Error(`${from} is not a Block checkout that can build the engine bundle (scripts/build-engine-bundle.mjs).`);
  }
  if (!existsSync(join(from, 'node_modules/esbuild'))) throw new Error(`Install Block's dependencies first: npm ci --prefix ${from}`);
  const built = await mkdtemp(join(tmpdir(), 'neon-block-'));
  execFileSync(process.execPath, ['scripts/build-engine-bundle.mjs', '--outdir', built], { cwd: from, stdio: ['ignore', 'ignore', 'inherit'] });
  const { commit } = JSON.parse(await readFile(join(built, 'engine.json'), 'utf8'));
  if (commit.endsWith('-dirty')) throw new Error(`The Block checkout has uncommitted changes. Commit them first, so the snapshot names a commit that holds what it was built from.`);

  const files = new Map();
  for (const name of ENGINE_FILES) files.set(name, await readFile(join(built, name)));
  for (const name of OPEN_FONTS) files.set(`fonts/${name}`, await readFile(join(from, 'apps/web/public/fonts', name)));
  files.set('NOTICE', Buffer.from(NOTICE(commit)));
  const hashes = Object.fromEntries([...files].sort(([a], [b]) => (a < b ? -1 : 1)).map(([path, content]) => [path, sha256(content)]));
  const manifest = { block: { repository: BLOCK_REPOSITORY, commit }, files: hashes };
  files.set(BLOCK_MANIFEST, Buffer.from(`${JSON.stringify({ ...manifest, seal: sealOf(manifest) }, null, 2)}\n`));

  // Trek files already here are the maintainer's own; a sync without --trek leaves them.
  const kept = new Map();
  for (const name of TREK_FONTS) {
    const source = trek ? join(from, 'apps/web/public/fonts', name) : join(out, 'fonts', name);
    if (existsSync(source)) kept.set(`fonts/${name}`, await readFile(source));
  }
  await rm(out, { recursive: true, force: true });
  for (const [path, content] of [...files, ...kept]) {
    await mkdir(join(out, path, '..'), { recursive: true });
    await writeFile(join(out, path), content);
  }
  await rm(built, { recursive: true, force: true });
  return { commit, files: [...files.keys()], trek: [...kept.keys()] };
}

async function listFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory()
    ? listFiles(join(directory, entry.name), `${prefix}${entry.name}/`)
    : [`${prefix}${entry.name}`]));
  return nested.flat();
}

/** The repository check for the snapshot at `directory`: every file is the one the sync wrote, and nothing else is there but local Trek fonts. */
export async function checkBlockSnapshot(directory) {
  const problems = [];
  const manifest = JSON.parse(await readFile(join(directory, BLOCK_MANIFEST), 'utf8'));
  if (manifest.seal !== sealOf(manifest)) problems.push(`${BLOCK_MANIFEST} does not match what the sync wrote.`);
  const local = TREK_FONTS.map(name => `fonts/${name}`);
  const present = (await listFiles(directory)).filter(path => path !== BLOCK_MANIFEST && !local.includes(path) && !path.endsWith('.DS_Store'));
  for (const path of present.filter(path => !(path in manifest.files))) problems.push(`${path} is not a file the sync wrote.`);
  for (const [path, hash] of Object.entries(manifest.files)) {
    if (!present.includes(path)) problems.push(`${path} is missing.`);
    else if (sha256(await readFile(join(directory, path))) !== hash) problems.push(`${path} does not match what the sync wrote.`);
  }
  if (problems.length) throw new Error(`The Block snapshot (${directory}) was changed by hand or is incomplete. Run scripts/sync-block.mjs instead.\n  ${problems.join('\n  ')}`);
  return manifest.block;
}
