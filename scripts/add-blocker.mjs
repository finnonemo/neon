#!/usr/bin/env node
// Marks one issue blocked by another with GitHub's native dependency, unless
// the edge would close a loop that keeps every ticket in it off the frontier:
//   node scripts/add-blocker.mjs <child> <blocker> [--repo owner/name]
// Refuses, naming the loop, when the blocker already waits on the child
// through open blockers.
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// The chain from `blocker` through open blockers to `child`, or null.
// `blockedBy(n)` resolves to the numbers of n's open blockers.
export async function dependencyPath(blocker, child, blockedBy) {
  const seen = new Set();
  async function walk(number) {
    if (number === child) return [number];
    if (seen.has(number)) return null;
    seen.add(number);
    for (const next of await blockedBy(number)) {
      const path = await walk(next);
      if (path) return [number, ...path];
    }
    return null;
  }
  return walk(blocker);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const args = process.argv.slice(2);
  const repoAt = args.indexOf('--repo');
  const gh = (...ghArgs) => execFileSync('gh', ghArgs, { encoding: 'utf8' }).trim();
  const repo = repoAt >= 0 ? args.splice(repoAt, 2)[1] : gh('repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner');
  const [child, blocker] = args.map(Number);
  if (args.length !== 2 || !Number.isInteger(child) || !Number.isInteger(blocker)) {
    console.error('Usage: node scripts/add-blocker.mjs <child> <blocker> [--repo owner/name]');
    process.exit(2);
  }
  const blockedBy = async (number) => gh('api', '--paginate', `repos/${repo}/issues/${number}/dependencies/blocked_by`, '--jq', '.[] | select(.state == "open") | .number')
    .split('\n').filter(Boolean).map(Number);
  const loop = await dependencyPath(blocker, child, blockedBy);
  if (loop) {
    console.error(`Refusing: #${child} blocked by #${blocker} closes a loop (${[child, ...loop].map((n) => `#${n}`).join(' ← ')}). Split the ticket or drop an edge in that loop.`);
    process.exit(1);
  }
  const blockerId = gh('api', `repos/${repo}/issues/${blocker}`, '--jq', '.id');
  gh('api', '--method', 'POST', `repos/${repo}/issues/${child}/dependencies/blocked_by`, '-F', `issue_id=${blockerId}`);
  console.log(`#${child} is blocked by #${blocker}.`);
}
