// The Core snapshot (GLOSSARY): the copy of Core that Neon carries, pinned to one Core commit (ADR 0009).
// Core's repository compiles it (ADR 0012): syncCore runs Core's Web compile from a Core checkout, copies what it
// wrote, adds the index and records the commit and each file's hash; checkCoreSnapshot is the repository check that
// refuses a hand edit, and checkCounterpartTable the one that holds the Counterpart table, and the index it gives,
// to the snapshot.
// Nothing here reads Core's own docs.
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

// The names of the docs among a snapshot's paths. Core's Web compile writes every approved doc and no other.
const approvedDocs = paths => new Set([...paths].flatMap(path => path.match(/^components\/(.+)\.md$/)?.[1] ?? []));

/**
 * An item with no Counterpart and the name of an approved Core doc must name that doc as `unmatched`, so a doc
 * Core approves later cannot leave the entry's `why` false with nothing failing. `approved` is the names of
 * Core's approved docs. Returns the problems, one line each.
 */
function unmatchedProblems(counterparts, approved) {
  return Object.entries(counterparts).flatMap(([name, { core, unmatched }]) => {
    if (unmatched !== undefined && core !== null) return [`${name}: it has the Counterpart ${core}, so it names no unmatched doc.`];
    if (unmatched !== undefined && !approved.has(unmatched)) return [`${name}: its unmatched doc ${unmatched} is not an approved doc in Core.`];
    if (core === null && approved.has(name) && unmatched !== name) return [`${name}: Core has an approved doc of this name and the item has no Counterpart. Give it the Counterpart, or name the doc as unmatched and say in why what the item follows instead.`];
    return [];
  });
}

/**
 * The repository check for the Counterpart table against the snapshot at `directory`: the `unmatched` rule, and,
 * where the registry is at hand (`items`, as { name, supporting }), the index. Both are read from the files the
 * snapshot holds, so the check needs no Core checkout. The index is the table read against those files, so a table
 * that moved without a sync leaves every hash as recorded: the index is built again here and compared.
 */
export async function checkCounterpartTable(counterparts, directory, { items } = {}) {
  const read = path => readFile(join(directory, path), 'utf8');
  const { files } = JSON.parse(await read(MANIFEST));
  const problems = unmatchedProblems(counterparts, approvedDocs(Object.keys(files)));
  if (!problems.length && items) {
    const held = new Map(await Promise.all(Object.keys(files).filter(path => path !== INDEX).map(async path => [path, await read(path)])));
    let given;
    try {
      given = counterpartIndex({ items, counterparts, files: held, leftOut: {} });
    } catch (error) {
      problems.push(error.message);
    }
    if (given) {
      const index = JSON.parse(await read(INDEX));
      const differs = Object.keys(given).filter(item => JSON.stringify(index[item]) !== JSON.stringify(given[item]));
      if (differs.length) problems.push(`The index (${INDEX}) is not the one the table gives for: ${differs.join(', ')}. Re-run node scripts/sync-core.mjs --from <Core checkout>.`);
    }
  }
  if (problems.length) throw new Error(`The Counterpart table (${COUNTERPARTS_FILE}) does not follow the snapshot in ${directory}:\n${problems.join('\n')}`);
}

/**
 * The index: each registry item's Counterpart (GLOSSARY) with the snapshot files that hold it, or why it has none.
 * `counterparts` is the Counterpart table, { item: { core: '<doc>', why? } | { core: null, why } }; it must cover
 * `items` exactly. A Supporting item (GLOSSARY) has no Counterpart of its own.
 * An entry may also list the prop values with no Core cell (`notInCore: { variant: ['outline'] }`), for the
 * Catalog site to mark; the skills leave them out of new work (ADR 0009). The index does not carry them.
 * An entry with no Counterpart whose item has the name of an approved Core doc names that doc (`unmatched`);
 * the index does not carry it either.
 */
function counterpartIndex({ items, counterparts, files, leftOut }) {
  const unmatched = unmatchedProblems(counterparts, approvedDocs(files.keys()));
  if (unmatched.length) throw new Error(unmatched.join('\n'));
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
 * { name, supporting }. Returns the commit, the files written, the Core docs the compile left out, by standing,
 * and what moved since the snapshot it replaced (movedReport).
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
  const moved = movedSince(await readFile(join(out, MANIFEST), 'utf8').then(JSON.parse, () => null), { from, core, hashes });
  await rm(out, { recursive: true, force: true });
  for (const [path, content] of files) {
    await mkdir(dirname(join(out, path)), { recursive: true });
    await writeFile(join(out, path), content);
  }
  return { commit, compiler: core.compiler, files: [...files.keys()], leftOut, moved };
}

/**
 * What moved since the snapshot the sync replaces, whose manifest is `previous`: the commit it was at, Core's
 * commits from there to the new one (null when the checkout at `from` does not hold the earlier commit), the
 * compiler's commits when another compiler wrote this snapshot, and the snapshot files added, changed and removed.
 * Null when there was no snapshot. Which paths Core's compile reads is Core's to know, so the commits are all of
 * Core's between the two, not only those that change a compiled file.
 */
function movedSince(previous, { from, core, hashes }) {
  if (!previous?.core?.commit) return null;
  const was = previous.core.commit;
  let commits = [];
  if (was !== core.commit) {
    try {
      // git's own complaint about a commit it does not hold stays out of the terminal: the report says it.
      commits = execFileSync('git', ['-C', from, 'log', '--format=%h %s', `${was}..${core.commit}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').filter(Boolean);
    } catch {
      commits = null;
    }
  }
  // A snapshot compiled by its own checkout names no compiler: its compiler moves with Core, and is not said twice.
  const compilers = [previous.core.compiler ?? was, core.compiler ?? core.commit];
  const named = (previous.core.compiler || core.compiler) && compilers[0] !== compilers[1];
  const before = previous.files ?? {};
  return {
    from: was,
    commits,
    ...(named ? { compiler: compilers } : {}),
    added: Object.keys(hashes).filter(path => !(path in before)),
    changed: Object.keys(hashes).filter(path => path in before && before[path] !== hashes[path]),
    removed: Object.keys(before).filter(path => !(path in hashes)),
  };
}

/** What the sync prints about `moved` (syncCore's result), as lines: the pull request lists the same commits and files. */
export function movedReport(moved, commit) {
  if (!moved) return [];
  const short = sha => sha.slice(0, 8);
  const lines = [];
  if (moved.from === commit) lines.push(`Core has not moved: the snapshot was already at ${short(commit)}.`);
  else if (!moved.commits) lines.push(`Core moved ${short(moved.from)} → ${short(commit)}. This checkout does not hold ${short(moved.from)}, so the commits between them are not listed.`);
  else lines.push(`Core moved ${short(moved.from)} → ${short(commit)}. Core's commits between them: ${moved.commits.length}.`, ...moved.commits.map(line => `  ${line}`));
  if (moved.compiler) lines.push(`The compiler moved ${short(moved.compiler[0])} → ${short(moved.compiler[1])}.`);
  for (const kind of ['added', 'changed', 'removed']) {
    if (moved[kind].length) lines.push(`${kind[0].toUpperCase()}${kind.slice(1)} in the snapshot: ${moved[kind].join(', ')}.`);
  }
  if (!moved.added.length && !moved.changed.length && !moved.removed.length) lines.push('No snapshot file changed.');
  return lines;
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
