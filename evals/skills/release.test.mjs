import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { VERSION_FILES, publishProblems, setVersion } from '../../scripts/lib/release.mjs';

const repoRoot = resolve(import.meta.dirname, '../..');

/** A checkout with package.json at 1.2.3, one commit, and a bare repository as its origin. */
async function checkout() {
  const work = await mkdtemp(join(tmpdir(), 'neon-release-test-'));
  const root = join(work, 'checkout');
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  execFileSync('git', ['init', '--bare', '-q', join(work, 'origin.git')]);
  execFileSync('git', ['init', '-q', root]);
  await writeFile(join(root, 'package.json'), '{\n  "name": "finnomena",\n  "version": "1.2.3"\n}\n');
  git('remote', 'add', 'origin', join(work, 'origin.git'));
  // A commit and an annotated tag both need an identity, and a CI runner has none.
  git('config', 'user.name', 't');
  git('config', 'user.email', 't@example.com');
  const commit = (message) => git('commit', '-q', '--allow-empty', '-am', message);
  git('add', '-A');
  commit('release');
  return { root, git, commit };
}

test('a release is not published before its tag is on origin', async () => {
  const { root, git } = await checkout();
  const [problem, ...rest] = await publishProblems({ root });
  assert.equal(rest.length, 0);
  assert.match(problem, /neon--v1\.2\.3 is not on origin/);
  assert.match(problem, /git push origin refs\/tags\/neon--v1\.2\.3/);

  // A tag that stayed on this computer is still not on origin.
  git('tag', 'neon--v1.2.3');
  assert.match((await publishProblems({ root }))[0], /is not on origin/);

  git('push', '-q', 'origin', 'refs/tags/neon--v1.2.3');
  assert.deepEqual(await publishProblems({ root }), []);
});

test('a release is published only from the commit its tag names', async () => {
  const { root, git, commit } = await checkout();
  git('tag', '-a', 'neon--v1.2.3', '-m', 'annotated');
  git('push', '-q', 'origin', 'refs/tags/neon--v1.2.3');
  assert.deepEqual(await publishProblems({ root }), [], 'an annotated tag is read by the commit it names');

  commit('a later commit');
  const [problem] = await publishProblems({ root });
  assert.match(problem, /this checkout is at [0-9a-f]{7}/);
  assert.match(problem, /git switch --detach neon--v1\.2\.3/);
});

test('a release is published only with the files its tag holds', async () => {
  const { root, git } = await checkout();
  git('tag', 'neon--v1.2.3');
  git('push', '-q', 'origin', 'refs/tags/neon--v1.2.3');
  assert.deepEqual(await publishProblems({ root }), [], 'a clean checkout of the tag');

  // A file left in the checkout that no commit holds would ship under the release's name.
  await mkdir(join(root, 'theme'), { recursive: true });
  await writeFile(join(root, 'theme/tokens.resolved.json'), '{}\n');
  const [untracked, ...rest] = await publishProblems({ root });
  assert.equal(rest.length, 0);
  assert.match(untracked, /would hold 1 file that neon--v1\.2\.3 does not: theme\/tokens\.resolved\.json/);

  // A file git ignores is left out of the package too, so it is no problem.
  await writeFile(join(root, '.gitignore'), 'theme/\n');
  git('add', '.gitignore');
  git('commit', '-q', '-m', 'ignore theme');
  git('tag', '-f', 'neon--v1.2.3');
  git('push', '-q', '-f', 'origin', 'refs/tags/neon--v1.2.3');
  assert.deepEqual(await publishProblems({ root }), []);

  // A tracked file changed since the tag.
  await writeFile(join(root, 'package.json'), '{\n  "name": "finnomena",\n  "version": "1.2.3",\n  "private": false\n}\n');
  const [modified] = await publishProblems({ root });
  assert.match(modified, /would hold 1 file changed since neon--v1\.2\.3: package\.json/);
});

test('npm publish runs the check, and the script exits 1 on a problem', async () => {
  const { scripts } = JSON.parse(await readFile(join(repoRoot, 'package.json'), 'utf8'));
  assert.equal(scripts.prepublishOnly, 'node scripts/release.mjs --check-publish');

  // This repository's own state: published only where HEAD is the release tag on origin.
  const expected = await publishProblems({ root: repoRoot });
  const run = spawnSync(process.execPath, [join(repoRoot, 'scripts/release.mjs'), '--check-publish'], { encoding: 'utf8' });
  assert.equal(run.status, expected.length ? 1 : 0);
  assert.equal(run.stderr.trim(), expected.join('\n'));
});

test('the version is set in every file that states it, and nothing else in them moves', async () => {
  const root = await mkdtemp(join(tmpdir(), 'neon-release-test-'));
  const before = {};
  for (const file of VERSION_FILES) {
    before[file] = await readFile(join(repoRoot, file), 'utf8');
    await mkdir(join(root, file, '..'), { recursive: true });
    await writeFile(join(root, file), before[file]);
  }
  await setVersion({ root, version: '9.8.7' });
  for (const file of VERSION_FILES) {
    const after = await readFile(join(root, file), 'utf8');
    assert.equal(JSON.parse(after).version, '9.8.7', file);
    assert.deepEqual({ ...JSON.parse(after), version: 0 }, { ...JSON.parse(before[file]), version: 0 }, file);
    assert.equal(after.split('\n').length, before[file].split('\n').length, `${file} keeps its lines`);
  }
  await assert.rejects(setVersion({ root, version: 'v9.8.7' }), /is not a version/);
});
