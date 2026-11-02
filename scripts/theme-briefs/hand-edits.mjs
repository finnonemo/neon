// accept and redraft modes: they keep a maintainer's hand edits safe from the model. A section is
// hand-edited when its prose, read back from the brief, no longer matches the output hash its record
// gives. accept reruns every check on a hand-edited local draft and writes it when every hard check
// passes; its record keeps the model's output hashes and marks the edited sections. redraft reruns named
// entries and the entries after them, and refuses to overwrite a hand-edited section unless it is named
// to discard. Entry changes never trigger a redraft: redraft only says which kept sections were drafted
// from an older entry.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { briefProblems, RECORDS } from './checks.mjs';
import { ACCOUNTS, draftBrief, entryTargets, hash, MARKERS, prepare, runClaude, writeResults } from './draft.mjs';
import { MODEL } from './model.mjs';
import { accentPlacements, entryChecks } from './prose-checks.mjs';
import { PLACEHOLDER, readProse } from './render.mjs';
import { ENTRIES } from './schemas.mjs';

// The entries whose prose no longer matches the record's output hash, in library order.
export const handEdited = (prose, record) => ENTRIES.filter((entry) => record.entries?.[entry]?.output !== hash(prose[entry]));

// The named entries and every entry after them, directly or through another.
function withDependents(named, entries) {
  const targets = new Set(named);
  for (let grew = true; grew;) {
    grew = false;
    for (const [entry, { after }] of Object.entries(entries)) {
      if (targets.has(entry) || !after.some((other) => targets.has(other))) continue;
      targets.add(entry);
      grew = true;
    }
  }
  return targets;
}

const refuse = (lines) => ({ lines: [...lines, 'Redraft: nothing redrafted; fix the problems above'], failed: true });

export function redraftBrief({ root, name, entries: named, discard = [], out = join(root, 'registry/theme-briefs'), local = join(root, '.local/theme-briefs'), model = MODEL, account = ACCOUNTS[0], claude = process.env.CLAUDE_PATH || 'claude' }) {
  const unknown = [...new Set([...named, ...discard])].filter((entry) => !ENTRIES.includes(entry));
  if (unknown.length) return refuse(unknown.map((entry) => `"${entry}" is not a prompt library entry (${ENTRIES.join(', ')})`));
  const { inputs, library, briefs, context, refused } = prepare({ root, names: [name], model, claude });
  if (refused) return refuse(refused);
  const { brief } = briefs[0];
  const briefPath = join(out, `${name}.md`);
  const recordPath = join(root, RECORDS, `${name}.json`);
  if (!existsSync(briefPath) || !existsSync(recordPath)) return refuse([`${name}: redraft needs the committed brief ${relative(root, briefPath)} and its authoring record ${relative(root, recordPath)}; run draft first`]);
  let record;
  try {
    record = JSON.parse(readFileSync(recordPath, 'utf8'));
  } catch (error) {
    return refuse([`${relative(root, recordPath)}: not valid JSON (${error.message})`]);
  }
  const { prose, problems } = readProse(readFileSync(briefPath, 'utf8'), brief);
  if (problems) return refuse(problems.map((problem) => `${relative(root, briefPath)}: ${problem}`));

  const targets = withDependents(named, library.entries);
  const edited = handEdited(prose, record);
  const lines = [
    ...library.order.filter((entry) => targets.has(entry) && edited.includes(entry) && !discard.includes(entry))
      .map((entry) => `${name}: ${entry} is hand-edited; add --discard ${entry} to overwrite it`),
    ...discard.filter((entry) => !targets.has(entry)).map((entry) => `${name}: --discard ${entry} names an entry this redraft does not rewrite`),
  ];
  if (lines.length) return refuse(lines);

  // Kept entries stand in for later entries' inputs as the brief now reads, hand edits included.
  const kept = library.order.filter((entry) => !targets.has(entry));
  const seed = Object.fromEntries(kept.map((entry) => [entry, entry === 'mood-occasion' ? { ...prose[entry], accentPlacement: record.accentPlacement } : prose[entry]]));
  const run = runClaude(claude, briefs, () => ({ ...draftBrief(name, brief, context, seed), library: library.entries, shared: library.shared, previous: record.entries }));
  if (!run.results) return run;
  const written = writeResults(run.results, { root, out, local, inputs, claudeCode: run.claudeCode, model, account });
  const older = kept.filter((entry) => record.entries[entry]?.entry !== hash(library.entries[entry]) || record.entries[entry]?.shared !== hash(library.shared));
  return { ...written, lines: [...written.lines, ...older.map((entry) => `${name}: kept ${entry}, drafted from an older entry or shared.json; name it to redraft it`)] };
}

// The accent placement an accepted mood paragraph carries: the run's, while the paragraph still names it,
// else the one placement the paragraph names. Check 10 refuses anything else.
function acceptedPlacement(paragraph, brief, recorded) {
  const placements = accentPlacements(brief);
  if (!placements.length) return null;
  const named = placements.filter((placement) => paragraph.toLowerCase().includes((placement === 'Brand Pattern section' ? 'Brand Pattern' : placement).toLowerCase()));
  return named.includes(recorded) || named.length !== 1 ? recorded : named[0];
}

// Every check on one accepted draft, as { problems, warnings, accentPlacement }: draft markers, then each
// entry's hard and soft checks on the prose as the draft reads, then the brief-level checks.
function acceptProblems(text, brief, runRecord, { library, sources, tokens }) {
  const left = [PLACEHOLDER, ...MARKERS].filter((mark) => text.includes(mark));
  if (left.length) return { problems: left.map((mark) => `still holds "${mark.replace(/:\*\*$/, '')}"; replace the ${mark === PLACEHOLDER ? 'placeholder' : 'marker'} with the section's prose`), warnings: [] };
  const { prose, problems: unread } = readProse(text, brief);
  if (unread) return { problems: unread, warnings: [] };
  const accentPlacement = acceptedPlacement(prose['mood-occasion'].paragraph, brief, runRecord.accentPlacement);
  const problems = [];
  const warnings = [];
  for (const entry of library.order) {
    const data = library.entries[entry];
    const answer = entry === 'mood-occasion' ? { ...prose[entry], accentPlacement } : prose[entry];
    const { hard, soft } = entryChecks(entry, answer, { brief, data, sources, ...entryTargets(entry, data, brief) });
    problems.push(...hard.map((message) => `${entry}: ${message}`));
    warnings.push(...soft.map((message) => `${entry}: ${message}`));
  }
  for (const message of briefProblems(text, { theme: brief.theme, brief, tokens, sources, record: { accentPlacement } })) {
    if (!problems.some((line) => line.endsWith(`: ${message}`))) problems.push(message);
  }
  return { problems, warnings, prose, accentPlacement };
}

export function acceptBriefs({ root, names, out = join(root, 'registry/theme-briefs'), local = join(root, '.local/theme-briefs') }) {
  const { library, briefs, context, refused } = prepare({ root, names });
  if (refused) return { lines: [...refused, 'Accept: nothing accepted; fix the problems above'], failed: true };
  const lines = [];
  let failed = false;
  for (const { name, brief } of briefs) {
    const draftPath = join(local, name, 'draft.md');
    const runPath = join(local, name, 'record.json');
    const where = relative(root, draftPath);
    let runRecord;
    let text;
    let checked;
    if (!existsSync(draftPath) || !existsSync(runPath)) checked = { problems: [`accept needs the draft and its run record ${relative(root, runPath)}; run draft first`] };
    else {
      text = readFileSync(draftPath, 'utf8');
      try {
        runRecord = JSON.parse(readFileSync(runPath, 'utf8'));
        checked = acceptProblems(text, brief, runRecord, { library, ...context });
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        checked = { problems: [`its run record ${relative(root, runPath)} is not valid JSON (${error.message})`] };
      }
    }
    if (checked.problems.length) {
      failed = true;
      lines.push(...checked.problems.map((problem) => `${where}: ${problem}`), `${name}: not accepted; nothing written`);
      continue;
    }
    lines.push(...checked.warnings.map((warning) => `${name}: warning — ${warning}`));
    const edited = handEdited(checked.prose, runRecord);
    const entries = Object.fromEntries(Object.entries(runRecord.entries).map(([entry, data]) => [entry, edited.includes(entry) ? { ...data, handEdited: true } : data]));
    mkdirSync(out, { recursive: true });
    mkdirSync(join(root, RECORDS), { recursive: true });
    writeFileSync(join(out, `${name}.md`), text);
    writeFileSync(join(root, RECORDS, `${name}.json`), `${JSON.stringify({ ...runRecord, entries, accentPlacement: checked.accentPlacement }, null, 2)}\n`);
    lines.push(`${name}: accepted; written to ${relative(root, join(out, `${name}.md`))}; ${edited.length ? `hand-edited: ${edited.join(', ')}` : 'no section hand-edited'}`);
  }
  return { lines, failed };
}
