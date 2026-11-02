#!/usr/bin/env node
// Theme Brief authoring tool, for maintainers only; it never ships in the
// plugin. See docs/design/theme-briefs.md.
//   node scripts/theme-briefs/theme-briefs.mjs check-only [--root <dir>] [--out <dir>]
//   node scripts/theme-briefs/theme-briefs.mjs scripted-only [--root <dir>] [--out <dir>]
//   node scripts/theme-briefs/theme-briefs.mjs [draft] <brief>... [--root <dir>] [--out <dir>] [--local <dir>] [--model <id>] [--account <label>]
// check-only validates the inputs under theme-briefs/ and the committed
// briefs (default <root>/registry/theme-briefs, or --out) with no model, and
// writes nothing. scripted-only rewrites the scripted sections of the
// committed briefs and keeps their prose. draft, the default, drafts each
// named brief's prose with Claude Code (CLAUDE_PATH, else `claude`) into
// <local>/<brief>/ (default <root>/.local/theme-briefs) and, when every check
// passes, writes the brief and its authoring record. Each exits 1 when any
// problem is found.
import { resolve } from 'node:path';
import { checkThemeBriefs } from './checks.mjs';
import { ACCOUNTS, draftBriefs } from './draft.mjs';
import { scriptedOnly } from './scripted-only.mjs';

const USAGE = [
  'Usage: node scripts/theme-briefs/theme-briefs.mjs check-only|scripted-only [--root <dir>] [--out <dir>]',
  `       node scripts/theme-briefs/theme-briefs.mjs [draft] <brief>... [--root <dir>] [--out <dir>] [--local <dir>] [--model <id>] [--account ${ACCOUNTS.join('|')}]`,
].join('\n');
const MODES = ['check-only', 'scripted-only', 'draft'];
const args = process.argv.slice(2);
const mode = MODES.includes(args[0]) ? args.shift() : 'draft';
const flags = mode === 'draft' ? ['--root', '--out', '--local', '--model', '--account'] : ['--root', '--out'];
const options = {};
const names = [];
for (let i = 0; i < args.length; i++) {
  if (!args[i].startsWith('--')) names.push(args[i]);
  else if (!flags.includes(args[i]) || args[i + 1] === undefined) options.bad = true;
  else options[args[i].slice(2)] = ['--model', '--account'].includes(args[i]) ? args[++i] : resolve(args[++i]);
}
if (options.bad || (mode === 'draft' ? !names.length : names.length) || (options.account && !ACCOUNTS.includes(options.account))) {
  console.error(USAGE);
  process.exit(2);
}

const root = options.root ?? resolve(import.meta.dirname, '../..');
if (mode === 'draft') {
  const { lines, failed } = draftBriefs({ root, names, out: options.out, local: options.local, model: options.model, account: options.account });
  for (const line of lines) console.log(line);
  process.exit(failed ? 1 : 0);
}
if (mode === 'scripted-only') {
  const { lines, failed } = scriptedOnly({ root, out: options.out });
  for (const line of lines) console.log(line);
  process.exit(failed ? 1 : 0);
}
const { problems, summary } = checkThemeBriefs({ root, out: options.out });
for (const problem of problems) console.log(problem);
console.log(`Theme Brief check: ${summary}; ${problems.length ? `${problems.length} problem${problems.length === 1 ? '' : 's'}` : 'no problems'}`);
process.exit(problems.length ? 1 : 0);
