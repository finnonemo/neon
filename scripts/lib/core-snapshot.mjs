// The Core snapshot (GLOSSARY): the copy of Core that Neon carries, pinned to one Core commit (ADR 0009).
// Core's repository compiles it (ADR 0012): syncCore runs Core's Web compile from a Core checkout, copies what it
// wrote, adds the index and records the commit and each file's hash; checkCoreSnapshot is the repository check that
// refuses a hand edit. Nothing here reads Core's own docs.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync, realpathSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, join, sep } from 'node:path';
import { listFiles } from './plain-text-references.mjs';

export const SNAPSHOT_DIR = 'core';
export const COUNTERPARTS_FILE = 'registry/core-counterparts.json';
const MANIFEST = 'snapshot.json';
const INDEX = 'index.json';
// Core's Web compile, in a Core checkout, and the directory its compiler lives in.
const WEB_COMPILE = 'docs/agents/web-compile.mjs';
const COMPILER_DIR = 'docs/agents';
// The look Core's Web compile is compiled at: Core's web look (GLOSSARY).
const LOOK = { iOS: false, textSize: 'Large' };
const sha256 = content => createHash('sha256').update(content).digest('hex');
const sealOf = ({ core, look, files }) => sha256(JSON.stringify({ core, look, files }));
const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8' }).trim();

/**
 * Runs Core's Web compile of the checkout at `from`, with the compiler in the checkout at `compiler`, and returns
 * what it wrote: { repository, commit, files: Map path → content, leftOut: { doc: standing } }. The repository and
 * the commit are the ones the compile prints; `--committed` has it refuse a source with uncommitted changes, so that
 * commit names what was compiled.
 */
async function webCompile({ from, compiler }) {
  const script = join(compiler, WEB_COMPILE);
  if (!existsSync(script)) {
    throw new Error(`${compiler} is not a Core checkout that holds the Web compile (${WEB_COMPILE}). A Core commit older than the compile is compiled with a newer checkout's: --compiler <Core checkout>.`);
  }
  const built = await mkdtemp(join(tmpdir(), 'neon-core-'));
  try {
    let printed;
    try {
      printed = execFileSync(process.execPath, [script, '--out', built, '--from', from, '--committed'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (error) {
      throw new Error(`Core's Web compile failed, so nothing was written:\n${(error.stderr || error.message).trim()}`);
    }
    const wrote = printed.match(/^Wrote \d+ files to .* from (\S+) ([0-9a-f]{40})\.$/m);
    if (!wrote) throw new Error(`Core's Web compile did not print the commit it compiled ("Wrote N files to <dir> from <repository> <commit>."), so nothing was written. It printed:\n${printed.trim()}`);
    const files = new Map();
    for (const path of (await listFiles(built)).map(path => path.split(sep).join('/')).sort()) files.set(path, await readFile(join(built, path), 'utf8'));
    const leftOut = Object.fromEntries([...printed.matchAll(/^Left out, (\w+): (.+)\.$/gm)].flatMap(([, standing, names]) => names.split(', ').map(name => [name, standing])));
    return { repository: wrote[1], commit: wrote[2], files, leftOut };
  } finally {
    await rm(built, { recursive: true, force: true });
  }
}

/**
 * The index: each registry item's Counterpart (GLOSSARY) with the snapshot files that hold it, or why it has none.
 * `counterparts` is the Counterpart table, { item: { core: '<doc>', why? } | { core: null, why } }; it must cover
 * `items` exactly. A Supporting item (GLOSSARY) has no Counterpart of its own.
 * An entry may also list the prop values with no Core cell (`notInCore: { variant: ['outline'] }`), for the
 * Catalog site to mark; the skills leave them out of new work (ADR 0009). The index does not carry them.
 */
function counterpartIndex({ items, counterparts, files, leftOut }) {
  const names = items.map(item => item.name);
  const missing = names.filter(name => !(name in counterparts));
  if (missing.length) throw new Error(`The Counterpart table has no Counterpart entry for: ${missing.join(', ')}.`);
  const stale = Object.keys(counterparts).filter(name => !names.includes(name));
  if (stale.length) throw new Error(`The Counterpart table names items that are not registry items: ${stale.join(', ')}.`);
  return Object.fromEntries(items.map(({ name, supporting }) => {
    const { core, why } = counterparts[name];
    if (supporting && core !== null) throw new Error(`${name} is a Supporting item, which has no Counterpart of its own: the Counterpart table gives it ${core}.`);
    if (core === null) {
      if (!why) throw new Error(`${name}: an item with no Counterpart needs a why.`);
      return [name, { counterpart: null, ...(supporting ? { supporting: true } : {}), why }];
    }
    const doc = `components/${core}.md`;
    if (!files.has(doc)) {
      throw new Error(core in leftOut
        ? `${name}: its Counterpart ${core} is a doc Core's Web compile leaves out as ${leftOut[core]}, so the snapshot does not hold it.`
        : `${name}: its Counterpart ${core}: Core's Web compile wrote no such doc.`);
    }
    // A compiled doc opens with the component's name, as Core's compile wrote it.
    const counterpart = files.get(doc).match(/^# (.+)\n/)?.[1];
    if (!counterpart) throw new Error(`${name}: its Counterpart's compiled doc, ${doc}, does not open with the component's name.`);
    const values = `components/${core}.json`;
    return [name, { counterpart, doc, ...(files.has(values) ? { values } : {}), ...(why ? { why } : {}) }];
  }));
}

/**
 * Compiles the Core checkout at `from` with Core's Web compile and writes the snapshot to `out`, replacing what was
 * there. `compiler` is the Core checkout whose compile runs: `from` itself unless the commit to compile is older than
 * the compile, and then the snapshot records the compiler's commit too. `items` are the registry's components, as
 * { name, supporting }. Returns the commit, the files written and the Core docs the compile left out, by standing.
 */
export async function syncCore({ from, compiler = from, out, items, counterparts }) {
  const compiled = await webCompile({ from, compiler });
  const { repository, commit, leftOut } = compiled;
  const core = { repository, commit };
  if (realpathSync(compiler) !== realpathSync(from)) {
    const uncommitted = git(compiler, 'status', '--porcelain', '--', COMPILER_DIR);
    if (uncommitted) throw new Error(`The Core checkout at ${compiler} has uncommitted changes in its compiler, so no commit names what compiled the snapshot:\n${uncommitted}`);
    const compilerCommit = git(compiler, 'rev-parse', 'HEAD');
    if (compilerCommit !== commit) core.compiler = compilerCommit;
  }
  const files = new Map(compiled.files);
  for (const reserved of [INDEX, MANIFEST]) if (files.has(reserved)) throw new Error(`Core's Web compile wrote ${reserved}, which is the snapshot's own file, so nothing was written.`);
  const data = value => `${JSON.stringify(value, null, 2)}\n`;
  files.set(INDEX, data(counterpartIndex({ items, counterparts, files, leftOut })));
  // The manifest: where the snapshot came from, the look it was compiled at, each file's hash for the repository check, and a seal over all three.
  const hashes = Object.fromEntries([...files].sort(([a], [b]) => (a < b ? -1 : 1)).map(([path, content]) => [path, sha256(content)]));
  const manifest = { core, look: LOOK, files: hashes };
  files.set(MANIFEST, data({ ...manifest, seal: sealOf(manifest) }));
  await rm(out, { recursive: true, force: true });
  for (const [path, content] of files) {
    await mkdir(dirname(join(out, path)), { recursive: true });
    await writeFile(join(out, path), content);
  }
  return { commit, compiler: core.compiler, files: [...files.keys()], leftOut };
}

/**
 * The repository check for the snapshot at `directory`: every file is the one the sync wrote, the index points
 * only at docs the snapshot holds, and, where the registry is at hand, the index covers `items` exactly.
 */
export async function checkCoreSnapshot(directory, { items } = {}) {
  const problems = [];
  const read = path => readFile(join(directory, path), 'utf8');
  const manifest = JSON.parse(await read(MANIFEST));
  const { files } = manifest;
  if (manifest.seal !== sealOf(manifest)) problems.push(`${MANIFEST} does not match what the sync wrote.`);
  const present = (await listFiles(directory)).map(path => path.split(sep).join('/')).filter(path => path !== MANIFEST);
  for (const path of present.filter(path => !(path in files))) problems.push(`${path} is not a file the sync wrote.`);
  for (const [path, hash] of Object.entries(files)) {
    if (!present.includes(path)) problems.push(`${path} is missing.`);
    else if (sha256(await read(path)) !== hash) problems.push(`${path} does not match what the sync wrote.`);
  }
  if (present.includes(INDEX)) {
    const index = JSON.parse(await read(INDEX));
    for (const [item, entry] of Object.entries(index)) {
      for (const path of [entry.doc, entry.values].filter(Boolean)) {
        if (!present.includes(path)) problems.push(`The index sends ${item} to ${path}, which the snapshot does not hold.`);
      }
    }
    if (items) {
      const uncovered = items.filter(item => !(item in index));
      if (uncovered.length) problems.push(`The index has no entry for registry items: ${uncovered.join(', ')}.`);
      const stale = Object.keys(index).filter(item => !items.includes(item));
      if (stale.length) problems.push(`The index names items the registry does not have: ${stale.join(', ')}.`);
    }
  }
  if (problems.length) {
    throw new Error(`The Core snapshot in ${directory} is not the one the sync wrote:\n${problems.join('\n')}\nThe snapshot is never edited by hand: change Core, or the Counterpart table, and re-run node scripts/sync-core.mjs --from <Core checkout>.`);
  }
}
