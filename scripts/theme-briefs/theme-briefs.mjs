#!/usr/bin/env node
// Theme Brief authoring tool, for maintainers only; it never ships in the
// plugin. See docs/design/theme-briefs.md.
//   node scripts/theme-briefs/theme-briefs.mjs check-only [--root <dir>] [--out <dir>]
//   node scripts/theme-briefs/theme-briefs.mjs scripted-only [--root <dir>] [--out <dir>]
// check-only validates the inputs under theme-briefs/ and the committed
// briefs (default <root>/registry/theme-briefs, or --out) with no model, and
// writes nothing. scripted-only rewrites the scripted sections of the
// committed briefs and keeps their prose. Both exit 1 when any problem is found.
import { resolve } from 'node:path';
import { checkThemeBriefs } from './checks.mjs';
import { scriptedOnly } from './scripted-only.mjs';

const USAGE = 'Usage: node scripts/theme-briefs/theme-briefs.mjs check-only|scripted-only [--root <dir>] [--out <dir>]';
const [mode, ...rest] = process.argv.slice(2);
const options = {};
for (let i = 0; i < rest.length; i += 2) {
  if (!['--root', '--out'].includes(rest[i]) || rest[i + 1] === undefined) options.bad = true;
  else options[rest[i].slice(2)] = resolve(rest[i + 1]);
}
if (!['check-only', 'scripted-only'].includes(mode) || options.bad) {
  console.error(USAGE);
  process.exit(2);
}

const root = options.root ?? resolve(import.meta.dirname, '../..');
if (mode === 'scripted-only') {
  const { lines, failed } = scriptedOnly({ root, out: options.out });
  for (const line of lines) console.log(line);
  process.exit(failed ? 1 : 0);
}
const { problems, summary } = checkThemeBriefs({ root, out: options.out });
for (const problem of problems) console.log(problem);
console.log(`Theme Brief check: ${summary}; ${problems.length ? `${problems.length} problem${problems.length === 1 ? '' : 's'}` : 'no problems'}`);
process.exit(problems.length ? 1 : 0);
