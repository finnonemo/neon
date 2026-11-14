#!/usr/bin/env node
// Squash-merges a pull request once its checks pass, merging main into it again
// while main moves under it.
//
//   node scripts/merge-pr.mjs <pr number> [--tries 6]
//
// Branch protection needs an up-to-date branch and the repository has no
// auto-merge, so a PR whose checks pass can still be refused when another PR
// landed meanwhile: #307 took five rounds of merge, push, checks and merge.
// Each try:
//   1. merges origin/main into the PR's branch, in the worktree that has it
//      checked out;
//   2. pushes;
//   3. waits for the checks, stopping on a failed one;
//   4. squash-merges.
// A refusal because the branch is behind starts the next try. A conflict
// stops: the merge is aborted and the conflicting files are named, for a
// person or session to resolve with both sides' intent. After the merge, the
// worktree leaves the merged branch for origin/main, detached.
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const behindPattern = /not up to date|head branch is behind/i;

/** Runs a command and returns its status and output; never throws. */
export function run(command, args, { cwd } = {}) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  return { status: result.status ?? 1, stdout: result.stdout ?? '', stderr: result.stderr ?? result.error?.message ?? '' };
}

/** The worktree that has `branch` checked out, from `git worktree list --porcelain`. */
export function worktreeFor(porcelain, branch) {
  let path;
  for (const line of porcelain.split('\n')) {
    if (line.startsWith('worktree ')) path = line.slice('worktree '.length);
    if (line === `branch refs/heads/${branch}`) return path;
  }
  return undefined;
}

class Stop extends Error {}

/**
 * Lands PR `pr`. `exec(command, args, { cwd })` and `wait(ms)` are injected so tests can script
 * git and gh. Resolves to the merge commit; rejects with a message that says what to do next.
 */
export async function land({ pr, tries = 6, cwd = process.cwd(), exec = run, wait = (ms) => new Promise((done) => setTimeout(done, ms)), log = console.log, poll = 5000 }) {
  const must = (command, args, options, message) => {
    const result = exec(command, args, options);
    if (result.status !== 0) throw new Stop(`${message}: ${(result.stderr || result.stdout).trim()}`);
    return result.stdout.trim();
  };
  const view = (fields) => JSON.parse(must('gh', ['pr', 'view', String(pr), '--json', fields], { cwd }, `PR ${pr}: gh pr view failed`));

  try {
    const { headRefName: branch, state } = view('headRefName,state');
    if (state === 'MERGED') return view('mergeCommit').mergeCommit?.oid;
    if (state !== 'OPEN') throw new Stop(`PR ${pr} is ${state}`);
    const dir = worktreeFor(must('git', ['worktree', 'list', '--porcelain'], { cwd }, 'git worktree list failed'), branch);
    if (!dir) throw new Stop(`PR ${pr}: no worktree has ${branch} checked out; check it out (git worktree add <dir> ${branch}) and run this again`);
    const git = (args, message) => must('git', ['-C', dir, ...args], {}, message);
    const count = (range) => Number(git(['rev-list', '--count', range], `git rev-list ${range} failed`));
    git(['fetch', '-q', 'origin', branch], 'git fetch failed');
    if (count(`origin/${branch}..HEAD`) > 0) throw new Stop(`PR ${pr}: ${dir} has commits on ${branch} that are not on origin; push them (and let their checks run) before landing`);

    for (let attempt = 1; attempt <= tries; attempt += 1) {
      if (git(['status', '--porcelain', '--untracked-files=no'], 'git status failed')) throw new Stop(`PR ${pr}: ${dir} has uncommitted changes; commit or set them aside first`);
      git(['fetch', '-q', 'origin', 'main', branch], 'git fetch failed');
      if (count(`HEAD..origin/${branch}`) > 0) {
        if (exec('git', ['-C', dir, 'merge', '-q', '--ff-only', `origin/${branch}`]).status !== 0) throw new Stop(`PR ${pr}: ${branch} and origin/${branch} have diverged; merge origin/${branch} into ${dir} first`);
        log(`took the commits pushed to ${branch} from elsewhere`);
      }
      if (count('HEAD..origin/main') > 0) {
        const merged = exec('git', ['-C', dir, 'merge', '--no-edit', '-q', 'origin/main']);
        if (merged.status !== 0) {
          const files = exec('git', ['-C', dir, 'diff', '--name-only', '--diff-filter=U']).stdout.trim().split('\n').filter(Boolean);
          exec('git', ['-C', dir, 'merge', '--abort']);
          throw new Stop(`PR ${pr}: merging origin/main conflicts in ${files.join(', ') || 'files git did not list'}; the merge is aborted. Merge origin/main into ${dir}, keep both sides' intent, run the checks, commit, then run this again`);
        }
        log(`try ${attempt}: merged origin/main into ${branch} (${git(['rev-parse', '--short', 'HEAD'], 'git rev-parse failed')})`);
      }
      if (count(`origin/${branch}..HEAD`) > 0) {
        git(['push', '-q', 'origin', `HEAD:refs/heads/${branch}`], `PR ${pr}: push failed`);
        log(`try ${attempt}: pushed ${branch}`);
      }
      // Until GitHub sees the pushed head, gh reports the last head's checks, which may have passed.
      const head = git(['rev-parse', 'HEAD'], 'git rev-parse failed');
      for (let waited = 0; view('headRefOid').headRefOid !== head; waited += 1) {
        if (waited * poll >= 5 * 60_000) throw new Stop(`PR ${pr}: GitHub still shows another head than ${head} after five minutes`);
        await wait(poll);
      }
      for (let waited = 0; /no checks reported/i.test(exec('gh', ['pr', 'checks', String(pr)], { cwd }).stderr); waited += 1) {
        if (waited * poll >= 5 * 60_000) throw new Stop(`PR ${pr}: no checks registered after five minutes; look at the repository's Actions`);
        await wait(poll);
      }
      const checks = exec('gh', ['pr', 'checks', String(pr), '--watch', '--fail-fast', '--interval', '30'], { cwd });
      if (checks.status !== 0) throw new Stop(`PR ${pr}: a check failed; not merging\n${exec('gh', ['pr', 'checks', String(pr)], { cwd }).stdout.trim()}`);
      const merge = exec('gh', ['pr', 'merge', String(pr), '--squash'], { cwd });
      if (merge.status === 0) {
        const oid = view('mergeCommit').mergeCommit?.oid;
        log(`PR ${pr} merged as ${oid}`);
        if (exec('git', ['-C', dir, 'symbolic-ref', '-q', '--short', 'HEAD']).stdout.trim() === branch) {
          git(['fetch', '-q', 'origin', 'main'], 'git fetch failed');
          git(['checkout', '-q', '--detach', 'origin/main'], 'git checkout failed');
          log(`${dir} is now on origin/main (detached)`);
        }
        return oid;
      }
      if (!behindPattern.test(merge.stderr + merge.stdout)) throw new Stop(`PR ${pr}: gh pr merge refused: ${(merge.stderr || merge.stdout).trim()}`);
      log(`try ${attempt}: main moved before the merge; again`);
    }
    throw new Stop(`PR ${pr}: main moved ${tries} times before a merge went in; run this again`);
  } catch (error) {
    if (error instanceof Stop) throw new Error(error.message);
    throw error;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: { tries: { type: 'string', default: '6' } } });
  const pr = Number(positionals[0]);
  if (!Number.isInteger(pr) || pr <= 0) {
    console.error('Usage: node scripts/merge-pr.mjs <pr number> [--tries 6]');
    process.exit(2);
  }
  try {
    await land({ pr, tries: Number(values.tries) });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
