#!/usr/bin/env node
// Decides whether template-browser.yml runs its browser job. A skipped job
// passes a required check, so the job runs unless the diff from base to head
// proves no browser path changed: a missing SHA, a failed diff or an empty
// diff all mean run.
//
//   node .github/scripts/browser-changes.mjs <base> <head>
//
// Prints the browser paths that changed and appends browser=true|false to
// $GITHUB_OUTPUT when it is set.
import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const BROWSER_PATHS = /^(templates\/|evals\/templates\/|theme\/|scripts\/lib\/(assemble-starter|assets)\.mjs$|skills\/neon-redesign\/references\/browser-probe\.js$|evals\/skills\/(probe-fixture[^/]*\.html|run-probe\.mjs|grade-restyle\.mjs|grade-rebuild\.mjs)$|evals\/skills\/fixtures\/|\.github\/workflows\/template-browser\.yml$|\.github\/scripts\/browser-changes\.mjs$)/;

// { browser, matched }: matched is null when the diff proved nothing.
export function browserChanges(base, head, cwd = process.cwd()) {
  if (!base || !head) return { browser: true, matched: null };
  const diff = spawnSync('git', ['diff', '--name-only', `${base}...${head}`], { cwd, encoding: 'utf8' });
  const changed = diff.status === 0 ? diff.stdout.split('\n').filter(Boolean) : [];
  if (!changed.length) return { browser: true, matched: null };
  const matched = changed.filter(path => BROWSER_PATHS.test(path));
  return { browser: matched.length > 0, matched };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { browser, matched } = browserChanges(process.argv[2], process.argv[3]);
  console.log(matched ? `Browser paths changed:\n${matched.join('\n') || 'none'}` : 'No usable diff; running the browser job.');
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `browser=${browser}\n`);
}
