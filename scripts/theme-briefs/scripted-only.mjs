// scripted-only mode: rewrites every scripted section of each committed brief
// from fresh output and keeps all prose, read from the brief by heading, so
// hand edits survive. A brief whose inputs or prose cannot be read is reported
// and left as it is.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { checkInputs, renderable } from './checks.mjs';
import { freshBrief, splitSections } from './render.mjs';

export function scriptedOnly({ root, out = join(root, 'registry/theme-briefs') }) {
  const { inputs, problems } = checkInputs(root);
  const lines = [...problems];
  let failed = problems.length > 0;
  const files = existsSync(out) ? readdirSync(out).filter((file) => file.endsWith('.md')).sort() : [];
  for (const file of files) {
    const path = join(out, file);
    const where = relative(root, path);
    const markdown = readFileSync(path, 'utf8');
    const { brief, reason } = renderable(file.replace(/\.md$/, ''), inputs, problems);
    const fresh = brief ? freshBrief(markdown, brief) : { problems: [reason ?? 'its inputs have the problems listed above'] };
    if (fresh.problems) {
      failed = true;
      lines.push(...fresh.problems.map((message) => `${where}: ${message}; not rewritten`));
      continue;
    }
    if (fresh.text === markdown) {
      lines.push(`${where}: scripted sections already match fresh output`);
      continue;
    }
    const before = new Map(splitSections(markdown).map(({ heading, text }) => [heading, text]));
    const changed = splitSections(fresh.text).filter(({ heading, text }) => before.get(heading) !== text).map(({ heading }) => heading);
    writeFileSync(path, fresh.text);
    lines.push(`${where}: rewrote ${changed.length ? changed.join(', ') : 'its whitespace'}`);
  }
  lines.push(`Scripted-only: ${files.length} brief${files.length === 1 ? '' : 's'} read; ${failed ? 'problems found' : 'no problems'}`);
  return { lines, failed };
}
