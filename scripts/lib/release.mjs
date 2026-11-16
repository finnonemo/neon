// What a release changes and what must be true before it is published. The release script runs it.
import { execFile } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

/** Every file that states the version. evals/skills/finno.test.mjs holds them equal. */
export const VERSION_FILES = ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json', 'package.json'];

/** The tag the registry's item URLs name (scripts/lib/registry.mjs, pinnedRegistryUrl). */
export const releaseTag = (version) => `neon--v${version}`;

/** Writes `version` into each of VERSION_FILES, leaving the rest of each file as it is. */
export async function setVersion({ root, version }) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`"${version}" is not a version; use the form 1.2.3.`);
  for (const file of VERSION_FILES) {
    const path = join(root, file);
    const before = await readFile(path, 'utf8');
    const after = before.replace(/^(\s*"version":\s*")[^"]*(")/m, `$1${version}$2`);
    if (!/^\s*"version":\s*"/m.test(before)) throw new Error(`${file} states no version.`);
    await writeFile(path, after);
  }
}

const run = promisify(execFile);
const gitIn = (root) => async (...args) => (await run('git', args, { cwd: root })).stdout.trim();

/**
 * Why this checkout must not be published, one line each; empty when it may be. A published
 * package's skills install registry items from raw files at the release tag, so the tag has to
 * be on origin, naming the commit being published, before the package is.
 */
export async function publishProblems({ root, git = gitIn(root) }) {
  const { version } = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  const tag = releaseTag(version);
  const head = await git('rev-parse', 'HEAD');
  const refs = (await git('ls-remote', 'origin', `refs/tags/${tag}`, `refs/tags/${tag}^{}`)).split('\n').filter(Boolean);
  if (!refs.length) {
    return [`The tag ${tag} is not on origin, so the registry item URLs of ${version} return 404. Push it first: git tag ${tag} <the release commit on main> && git push origin refs/tags/${tag}`];
  }
  // An annotated tag lists its commit on the peeled line; a lightweight tag has only the one line.
  const commit = (refs.find((line) => line.endsWith('^{}')) ?? refs[0]).split(/\s+/)[0];
  if (commit !== head) {
    return [`The tag ${tag} names ${commit.slice(0, 7)} and this checkout is at ${head.slice(0, 7)}. Publish from the tagged commit: git switch --detach ${tag}`];
  }
  return [];
}
