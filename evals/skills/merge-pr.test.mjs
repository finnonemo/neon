import assert from 'node:assert/strict';
import test from 'node:test';

import { land, worktreeFor } from '../../scripts/merge-pr.mjs';

const ok = (stdout = '') => ({ status: 0, stdout, stderr: '' });
const fail = (stderr) => ({ status: 1, stdout: '', stderr });
const behind = fail('X Pull request finnonemo/neon#9 is not mergeable: the head branch is not up to date with the base branch.');

// A scripted git and gh: `script` answers the calls a test cares about, the rest succeed quietly.
// `conflicts` are the paths a failed merge of main leaves unmerged; `core` is the Core commit the snapshot names at the
// merge base, on the branch and on main; `sync` and `build` answer the two generators.
function fake({ behindMain = [0], merges = [ok()], mergeMain = ok(), checks = ok(), state = 'OPEN', unpushed = false, conflicts = ['README.md'], core = {}, sync = ok(), build = ok() } = {}) {
  const calls = [];
  let mainCount = 0;
  let mergeCount = 0;
  let staged = false;
  const snapshot = (commit) => ok(JSON.stringify({ core: { commit } }));
  const exec = (command, args) => {
    const line = [command, ...args].join(' ');
    calls.push(line);
    if (line.includes('pr view') && line.includes('headRefName')) return ok(JSON.stringify({ headRefName: 'feature', state }));
    if (line.includes('pr view') && line.includes('mergeCommit')) return ok(JSON.stringify({ mergeCommit: { oid: 'abc123' } }));
    if (line === 'git worktree list --porcelain') return ok('worktree /repo\nHEAD 1\nbranch refs/heads/main\n\nworktree /repo/wt\nHEAD 2\nbranch refs/heads/feature\n');
    if (line.endsWith('rev-list --count HEAD..origin/main')) return ok(String(behindMain[Math.min(mainCount++, behindMain.length - 1)]));
    if (line.includes('rev-list --count origin/feature..HEAD')) return ok(unpushed ? '1' : '0');
    if (line.includes('pr view') && line.includes('headRefOid')) return ok(JSON.stringify({ headRefOid: 'head1' }));
    if (line.endsWith('rev-parse HEAD')) return ok('head1');
    if (line.includes('push -q origin')) unpushed = false;
    if (line.includes('rev-list --count')) return ok('0');
    if (line.endsWith('merge --no-edit -q origin/main')) {
      if (mergeMain.status === 0) unpushed = true;
      return mergeMain;
    }
    if (line.includes('diff --name-only --diff-filter=U')) return ok(staged ? '' : `${conflicts.join('\n')}\n`);
    if (line.endsWith('merge-base HEAD MERGE_HEAD')) return ok('base1\n');
    if (line.endsWith('show base1:core/snapshot.json')) return snapshot(core.base);
    if (line.endsWith('show HEAD:core/snapshot.json')) return snapshot(core.ours);
    if (line.endsWith('show MERGE_HEAD:core/snapshot.json')) return snapshot(core.theirs);
    if (line.endsWith('scripts/sync-core.mjs --from-snapshot')) return sync;
    if (line.endsWith('scripts/build-registry.mjs')) return build;
    if (line.includes('add -A -- core theme registry/r')) staged = true;
    if (line.endsWith('commit --no-edit -q')) unpushed = true;
    if (line.includes('--watch')) return checks;
    if (line.includes('pr merge')) return merges[Math.min(mergeCount++, merges.length - 1)];
    if (line.includes('symbolic-ref')) return ok('feature');
    if (line.includes('status --porcelain')) return ok('');
    return ok();
  };
  return { exec, calls };
}

const quiet = { wait: async () => {}, log: () => {} };

test('worktreeFor finds the checkout that has the branch', () => {
  const porcelain = 'worktree /a\nbranch refs/heads/main\n\nworktree /b\nbranch refs/heads/feature\n';
  assert.equal(worktreeFor(porcelain, 'feature'), '/b');
  assert.equal(worktreeFor(porcelain, 'other'), undefined);
});

test('merges main again and retries when main moves before the merge', async () => {
  const { exec, calls } = fake({ behindMain: [1, 1, 0], merges: [behind, ok()] });
  assert.equal(await land({ pr: 9, exec, ...quiet }), 'abc123');
  assert.equal(calls.filter((c) => c.endsWith('merge --no-edit -q origin/main')).length, 2);
  assert.equal(calls.filter((c) => c.includes('pr merge')).length, 2);
  assert.ok(calls.some((c) => c.includes('push -q origin HEAD:refs/heads/feature')));
  assert.ok(calls.some((c) => c.includes('checkout -q --detach origin/main')), 'leaves the merged branch');
});

test('a conflict aborts the merge and names the files', async () => {
  const { exec, calls } = fake({ behindMain: [1], mergeMain: fail('CONFLICT') });
  await assert.rejects(land({ pr: 9, exec, ...quiet }), /conflicts in README\.md/);
  assert.ok(calls.some((c) => c.endsWith('merge --abort')));
  assert.ok(!calls.some((c) => c.includes('pr merge')));
});

const at = (calls, end) => calls.findIndex((c) => c.endsWith(end));

test('a conflict only in the built registry is settled by building it again', async () => {
  const { exec, calls } = fake({ behindMain: [1, 0], mergeMain: fail('CONFLICT'), conflicts: ['registry/r/button.json', 'registry/r/registry.json'] });
  const lines = [];
  assert.equal(await land({ pr: 9, exec, wait: async () => {}, log: (line) => lines.push(line) }), 'abc123');
  const [built, staged, committed, pushed] = ['scripts/build-registry.mjs', 'add -A -- core theme registry/r', 'commit --no-edit -q', 'push -q origin HEAD:refs/heads/feature'].map((end) => at(calls, end));
  assert.ok(built >= 0 && built < staged && staged < committed && committed < pushed, 'build, stage, commit, then push for the checks');
  assert.ok(!calls.some((c) => c.endsWith('merge --abort') || c.includes('sync-core.mjs')));
  assert.ok(lines.some((line) => line.includes('conflicted only in generated files (registry/r/button.json, registry/r/registry.json)')));
});

for (const [name, core, side] of [
  ['main moved the Core commit', { base: 'aaa', ours: 'aaa', theirs: 'bbb' }, 'MERGE_HEAD'],
  ['the branch moved the Core commit', { base: 'aaa', ours: 'bbb', theirs: 'aaa' }, 'HEAD'],
  ['neither side moved the Core commit', { base: 'aaa', ours: 'aaa', theirs: 'aaa' }, 'HEAD'],
]) {
  test(`a conflict only in the Core snapshot takes it from ${side} when ${name}, then generates`, async () => {
    const { exec, calls } = fake({ behindMain: [1, 0], mergeMain: fail('CONFLICT'), conflicts: ['core/index.json', 'core/snapshot.json'], core });
    assert.equal(await land({ pr: 9, exec, ...quiet }), 'abc123');
    const [taken, synced, built, committed] = [`checkout ${side} -- core/index.json core/snapshot.json`, 'scripts/sync-core.mjs --from-snapshot', 'scripts/build-registry.mjs', 'commit --no-edit -q'].map((end) => at(calls, end));
    assert.ok(taken >= 0 && taken < synced && synced < built && built < committed, 'take the side, sync from the snapshot, build the registry, commit');
    assert.ok(!calls.some((c) => c.endsWith('merge --abort')));
  });
}

test('a Core snapshot conflict stops when both sides moved the Core commit', async () => {
  const { exec, calls } = fake({ behindMain: [1], mergeMain: fail('CONFLICT'), conflicts: ['core/snapshot.json', 'registry/r/button.json'], core: { base: 'aaaaaaaa', ours: 'bbbbbbbb', theirs: 'cccccccc' } });
  await assert.rejects(land({ pr: 9, exec, ...quiet }), /Both sides moved the Core commit \(bbbbbbb here, ccccccc on main\): run the Core sync again/);
  assert.ok(calls.some((c) => c.endsWith('merge --abort')));
  assert.ok(!calls.some((c) => c.includes('checkout') || c.includes('sync-core.mjs') || c.includes('build-registry.mjs') || c.includes('pr merge')));
});

test('a generated file beside a hand-written one in conflict is left for a person', async () => {
  const { exec, calls } = fake({ behindMain: [1], mergeMain: fail('CONFLICT'), conflicts: ['registry/r/button.json', 'registry/ui/button.tsx'] });
  await assert.rejects(land({ pr: 9, exec, ...quiet }), /conflicts in registry\/r\/button\.json, registry\/ui\/button\.tsx; the merge is aborted\. Keep both sides' intent\./);
  assert.ok(calls.some((c) => c.endsWith('merge --abort')));
  assert.ok(!calls.some((c) => c.includes('build-registry.mjs') || c.includes('pr merge')));
});

test('a generator that refuses aborts the merge and passes on what it said', async () => {
  const { exec, calls } = fake({ behindMain: [1], mergeMain: fail('CONFLICT'), conflicts: ['core/index.json'], core: { base: 'aaa', ours: 'aaa', theirs: 'bbb' }, sync: fail('core/components/button.md differs from what the sync recorded') });
  await assert.rejects(land({ pr: 9, exec, ...quiet }), /sync-core\.mjs --from-snapshot refused:\ncore\/components\/button\.md differs/);
  assert.ok(calls.some((c) => c.endsWith('merge --abort')));
  assert.ok(!calls.some((c) => c.includes('commit --no-edit') || c.includes('pr merge')));
});

test('a failed check stops before merging', async () => {
  const { exec, calls } = fake({ checks: fail('validate failed') });
  await assert.rejects(land({ pr: 9, exec, ...quiet }), /a check failed/);
  assert.ok(!calls.some((c) => c.includes('pr merge')));
});

test('a refusal for another reason stops without retrying', async () => {
  const { exec, calls } = fake({ merges: [fail('GraphQL: Review required')] });
  await assert.rejects(land({ pr: 9, exec, ...quiet }), /refused: GraphQL: Review required/);
  assert.equal(calls.filter((c) => c.includes('pr merge')).length, 1);
});

test('a policy refusal that shares the not-mergeable prefix stops without retrying', async () => {
  const { exec, calls } = fake({ merges: [fail('X Pull request finnonemo/neon#9 is not mergeable: the base branch policy prohibits the merge.')] });
  await assert.rejects(land({ pr: 9, exec, ...quiet }), /base branch policy prohibits/);
  assert.equal(calls.filter((c) => c.includes('pr merge')).length, 1);
});

test('refuses a branch with local commits that were never pushed', async () => {
  const { exec, calls } = fake({ unpushed: true });
  await assert.rejects(land({ pr: 9, exec, ...quiet }), /not on origin/);
  assert.ok(!calls.some((c) => c.includes('push')));
});

test('gives up after the tries run out', async () => {
  const { exec } = fake({ behindMain: [1], merges: [behind] });
  await assert.rejects(land({ pr: 9, tries: 2, exec, ...quiet }), /main moved 2 times/);
});

test('an already merged PR returns its merge commit', async () => {
  const { exec, calls } = fake({ state: 'MERGED' });
  assert.equal(await land({ pr: 9, exec, ...quiet }), 'abc123');
  assert.ok(!calls.some((c) => c.includes('push')));
});
