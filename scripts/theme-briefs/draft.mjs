// draft mode: drafts each named brief's prose with Claude Code, one prompt library entry at a time in
// "after" order, up to three attempts each with the misses of the last sent back, then renders the brief.
// It always writes a local draft and review report; only a brief whose every entry and brief-level check
// passes is written to the registry, with its authoring record. If Claude Code cannot answer, nothing is
// written. The record holds versions, labels and hashes only: no prompt, answer, path or account detail.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { briefProblems, checkInputs, renderable, sourceNamesOf } from './checks.mjs';
import { askClaude, ClaudeError, claudeVersion, EFFORT, MODEL } from './model.mjs';
import { accentPlacements, entryChecks, proseText } from './prose-checks.mjs';
import { freshBrief, placeholderProse, readProse, renderBrief, SCRIPTED_SECTIONS, splitSections } from './render.mjs';
import { ENTRIES, entryOrder } from './schemas.mjs';
import { paletteTokens } from '../lib/colors.mjs';

// Who signed Claude Code in for the run, as a label; never the account itself.
export const ACCOUNTS = ['maintainer-sign-in', 'neutral-account', 'neutral-key'];
const ATTEMPTS = 3;
// The section heading each entry's prose sits under; the header has none.
const FILLS = { tagline: 'Header', 'mood-occasion': 'Header', 'occasion-components': 'Components', 'preset-dos-donts': "Do's and Don'ts", imagery: 'Imagery', layout: 'Layout', 'example-prompts': 'Agent Prompt Guide' };

// JSON with sorted keys, so a hash depends only on content.
const canonical = (value) => Array.isArray(value) ? `[${value.map(canonical).join(',')}]`
  : value && typeof value === 'object' ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
    : JSON.stringify(value);
const hash = (value) => createHash('sha256').update(typeof value === 'string' ? value : canonical(value)).digest('hex');
const normalize = (value) => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim()
  : Array.isArray(value) ? value.map(normalize)
    : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, normalize(inner)])) : value;
const words = (text) => text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;

// The tool's own version: a hash of its modules.
const toolVersion = () => hash(readdirSync(import.meta.dirname).filter((file) => file.endsWith('.mjs')).sort().map((file) => readFileSync(join(import.meta.dirname, file), 'utf8')).join('\0'));
function commitOf(root) {
  const result = spawnSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}

// The value of each input an entry may name; a whole preset leaves out its kind, slug and source.
function inputValue(input, brief, outputs) {
  const { theme, texts, picks, occasion, layout, imagery, facts } = brief;
  const preset = ({ kind, slug, source, ...rest }) => rest;
  const [head, field] = input.split('.');
  if (input === 'layout') return preset(layout);
  if (input === 'imagery') return preset(imagery);
  if (head === 'occasion' || head === 'layout' || head === 'imagery') return brief[head][field];
  if (head === 'theme') return { kind: theme.kind, label: theme.label, mood: texts[theme.id].mood, sibling: texts[theme.id].sibling, roles: theme.roles }[field];
  if (input === 'brief.name') return picks.briefName;
  if (input === 'brandPattern.colourway') return picks.brandPattern.colourway;
  if (input === 'brandPattern.section') return layout.brandPattern.section;
  if (input === 'accentPlacements') return accentPlacements(brief);
  if (input === 'colorVars') return [...theme.vars.keys()].map((name) => `--immersive-${name}`);
  if (input === 'typeRoles') return facts.scale.type.map(({ role }) => role);
  if (input === 'occasion-components.components') return outputs['occasion-components'].components;
  if (input === 'occasion-components.names') return outputs['occasion-components'].components.map(({ name }) => name);
  throw new Error(`no value for input "${input}"`);
}

function systemPrompt(shared, brief) {
  const { theme, facts } = brief;
  const fill = (line) => line
    .replaceAll('{{variables}}', [...[...theme.vars.keys()].map((name) => `--immersive-${name}`), ...[...facts.neonVars].map((name) => `--${name}`)].join(', '))
    .replaceAll('{{typeRoles}}', facts.scale.type.map(({ role }) => role).join(', '));
  return [...shared.preamble, ...shared.bans].map(fill).join('\n');
}

function entryPrompt(name, data, bands, inputs, previous) {
  const misses = previous ? [...previous.hard, ...previous.soft] : [];
  return [
    `Entry: ${name}. Write ${data.fills}.`,
    '', 'Formula:', ...data.formula.map((line) => `- ${line}`),
    '', 'Targets:', ...Object.entries(bands).map(([key, [low, high]]) => `- ${key}: ${low}–${high}`),
    ...(data.rules.length ? ['', 'Rules:', ...data.rules.map((line) => `- ${line}`)] : []),
    ...(data.example ? ['', 'Example input:', JSON.stringify(data.example.input), 'Example output, for its shape and register only:', JSON.stringify(data.example.output)] : []),
    '', 'Inputs:', JSON.stringify(inputs, null, 2),
    ...(misses.length ? ['', 'Your last answer missed these checks; fix every one:', ...misses.map((line) => `- ${line}`)] : []),
    '', 'Answer with JSON that matches the output schema.',
  ].join('\n');
}

// Draft one brief's entries; returns everything the writes and the review report need.
function draftBrief(name, brief, { library, claude, model, sources, tokens }) {
  const { shared, entries, order } = library;
  const system = systemPrompt(shared, brief);
  const placements = accentPlacements(brief);
  // The mood band covers the whole paragraph; the theme half and ratio line are scripted.
  const head = splitSections(renderBrief(brief, placeholderProse(brief)))[0].text.split('\n');
  const scriptedMood = words(head.at(-3)) + words(head.at(-1));
  const outputs = {};
  const runs = {};
  for (const entry of order) {
    const data = entries[entry];
    const waiting = data.after.filter((other) => !outputs[other]);
    if (waiting.length) {
      runs[entry] = { waiting };
      continue;
    }
    const bands = Object.fromEntries(Object.entries(data.targets).map(([key, [low, high]]) => [key, entry === 'mood-occasion' ? [low - scriptedMood, high - scriptedMood] : [low, high]]));
    const schema = entry === 'mood-occasion'
      ? { ...data.output, properties: { ...data.output.properties, accentPlacement: placements.length ? { type: 'string', enum: placements } : { enum: [null] } } }
      : data.output;
    const resolved = Object.fromEntries(data.inputs.map((input) => [input, inputValue(input, brief, outputs)]));
    const attempts = [];
    while (attempts.length < ATTEMPTS && !(attempts.length && !attempts.at(-1).hard.length && !attempts.at(-1).soft.length)) {
      const { answer, problem } = askClaude({ claude, model, system, schema, prompt: entryPrompt(entry, data, bands, resolved, attempts.at(-1)) });
      const normalized = normalize(answer);
      const checks = problem ? { hard: [problem], soft: [] } : entryChecks(entry, normalized, { brief, data, schema, bands, placements, sources });
      attempts.push({ answer: normalized, ...checks });
    }
    // The hard-passing attempt with fewest soft misses, the earliest on a tie.
    const kept = attempts.map((attempt, index) => ({ ...attempt, number: index + 1 })).filter(({ hard }) => !hard.length)
      .sort((a, b) => a.soft.length - b.soft.length || a.number - b.number)[0];
    runs[entry] = { inputs: resolved, attempts, kept };
    if (kept) outputs[entry] = kept.answer;
  }

  const placeholder = placeholderProse(brief);
  const prose = Object.fromEntries(ENTRIES.map((entry) => [entry, outputs[entry] ?? placeholder[entry]]));
  const text = renderBrief(brief, prose);
  const markers = order.filter((entry) => !outputs[entry]).map((entry) => ({
    heading: FILLS[entry],
    line: runs[entry].waiting
      ? `**Not drafted — ${entry}:** it waits on ${runs[entry].waiting.join(', ')}, which did not pass its hard checks.`
      : `**Hard checks failed — ${entry}:** ${runs[entry].attempts.at(-1).hard.join('; ')}`,
  }));
  if (!markers.length) {
    const fresh = freshBrief(text, brief);
    const problems = fresh.text === text ? briefProblems(text, { theme: brief.theme, brief, tokens, sources, record: { accentPlacement: outputs['mood-occasion'].accentPlacement } })
      : ['the drafted prose does not read back from the brief'];
    if (problems.length) markers.push({ heading: 'Header', line: `**Brief checks failed:** ${problems.join('; ')}` });
  }
  return { name, brief, system, runs, order, outputs, text, passed: !markers.length, draft: withMarkers(text, markers) };
}

// The brief with each marker as a paragraph straight after its section's heading line.
function withMarkers(text, markers) {
  const lines = text.split('\n');
  for (const { heading, line } of [...markers].reverse()) {
    const at = heading === 'Header' ? 0 : lines.indexOf(`## ${heading}`);
    lines.splice(at + 1, 0, '', line);
  }
  return lines.join('\n');
}

function record(result, { commit, version, claudeVersion: claudeCode, model, account }) {
  const read = readProse(result.text, result.brief).prose;
  return {
    brief: result.name,
    tool: { commit, version },
    claudeCode: { version: claudeCode, model, effort: EFFORT, modelOverride: model !== MODEL },
    account,
    shared: hash(result.system),
    entries: Object.fromEntries(result.order.map((entry) => {
      const { inputs, attempts, kept } = result.runs[entry];
      return [entry, {
        entry: hash(result.library[entry]),
        inputs: hash(inputs),
        attempts: attempts.map(({ hard, soft }) => ({ hard: hard.length, soft: soft.length })),
        kept: kept.number,
        output: hash(read[entry]),
      }];
    })),
    accentPlacement: result.outputs['mood-occasion'].accentPlacement,
  };
}

const fenced = (value) => ['```json', JSON.stringify(value, null, 2), '```'];
const flat = (value) => proseText(value).split('\n');

function review(result, { root, out, others, claudeVersion: claudeCode, model }) {
  const { name, brief, runs, order, outputs, passed } = result;
  const committedPath = join(out, `${name}.md`);
  const committed = existsSync(committedPath) ? readProse(readFileSync(committedPath, 'utf8'), brief) : undefined;
  const lines = [
    `# ${name}: draft review`,
    '',
    passed ? `Passed every check; written to ${relative(root, committedPath)}.` : 'Not written to the registry: see the failed checks below and the markers in draft.md.',
    `Claude Code ${claudeCode}, ${model}, effort ${EFFORT}.`,
    '',
    `Scripted sections (${SCRIPTED_SECTIONS.join(', ')}): scripted, matches fresh output.`,
  ];
  for (const entry of order) {
    const run = runs[entry];
    lines.push('', `## ${entry}`, '');
    if (run.waiting) {
      lines.push(`Not run: it waits on ${run.waiting.join(', ')}.`);
      continue;
    }
    lines.push(run.kept ? `Kept attempt ${run.kept.number} of ${run.attempts.length}; output ${hash(run.kept.answer)}.` : `No attempt of ${run.attempts.length} passed its hard checks.`);
    lines.push('', 'Inputs:', '', ...fenced(run.inputs));
    run.attempts.forEach(({ answer, hard, soft }, index) => {
      lines.push('', `### Attempt ${index + 1}`, '', index ? `Feedback sent: the misses of attempt ${index}.` : 'No feedback: first attempt.', '');
      lines.push(...(hard.length ? hard.map((line) => `- Hard: ${line}`) : ['- Hard: none']), ...(soft.length ? soft.map((line) => `- Warning: ${line}`) : ['- Warnings: none']));
      if (answer !== undefined) lines.push('', ...fenced(answer));
    });
    if (!outputs[entry]) continue;
    if (!committed) lines.push('', 'No committed brief to compare.');
    else if (committed.problems) lines.push('', 'The committed brief\'s prose cannot be read, so it is not compared.');
    else {
      const before = flat(committed.prose[entry]);
      const after = flat(outputs[entry]);
      lines.push('', before.join('\n') === after.join('\n') ? 'Same as the committed brief.' : ['Against the committed brief:', '', '```diff', ...before.map((line) => `- ${line}`), ...after.map((line) => `+ ${line}`), '```'].join('\n'));
    }
  }
  const ours = new Set(proseText(outputs).toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []);
  lines.push('', '## Same-theme overlap', '');
  const overlaps = others.filter((other) => other.name !== name && other.theme === brief.theme.id).map((other) => {
    const theirs = new Set(other.text.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []);
    const shared = [...ours].filter((word) => theirs.has(word)).length;
    return `- ${other.name}: ${(shared / new Set([...ours, ...theirs]).size).toFixed(2)} word overlap (Jaccard)`;
  });
  lines.push(...(overlaps.length ? overlaps : ['No other committed brief on this theme.']));
  return `${lines.join('\n')}\n`;
}

// The prompt library, ready to run, as { library } or { problems }.
function libraryOf(inputs) {
  const files = Object.fromEntries(inputs.library.map(({ name, data }) => [name, data]));
  const missing = ['shared', ...ENTRIES].filter((name) => !files[name]).map((name) => `theme-briefs/prompt-library/${name}.json is missing; draft needs every entry`);
  if (missing.length) return { problems: missing };
  const entries = Object.fromEntries(ENTRIES.map((name) => [name, files[name]]));
  return { library: { shared: files.shared, entries, order: entryOrder(Object.fromEntries(ENTRIES.map((name) => [name, entries[name].after]))).order } };
}

export function draftBriefs({ root, names, out = join(root, 'registry/theme-briefs'), local = join(root, '.local/theme-briefs'), model = MODEL, account = ACCOUNTS[0], claude = process.env.CLAUDE_PATH || 'claude' }) {
  const { inputs, problems } = checkInputs(root);
  const { library, problems: libraryProblems = [] } = problems.length ? {} : libraryOf(inputs);
  const refused = [...problems, ...libraryProblems];
  const briefs = refused.length ? [] : names.map((name) => ({ name, ...renderable(name, inputs, problems) }));
  for (const { name, brief, reason } of briefs) if (!brief) refused.push(`${name}: ${reason ?? 'its inputs cannot be rendered'}`);
  if (refused.length) return { lines: [...refused, 'Draft: nothing drafted; fix the problems above'], failed: true };

  const sources = sourceNamesOf(inputs.presets);
  const context = { library, claude, model, sources, tokens: paletteTokens(join(root, 'theme/tokens/colors.json')) };
  let results;
  let claudeCode;
  try {
    claudeCode = claudeVersion(claude);
    results = briefs.map(({ name, brief }) => ({ ...draftBrief(name, brief, context), library: library.entries }));
  } catch (error) {
    if (!(error instanceof ClaudeError)) throw error;
    return { lines: [`${error.message}. Nothing was written.`], failed: true };
  }

  const others = existsSync(out) ? readdirSync(out).filter((file) => file.endsWith('.md')).map((file) => {
    const other = file.replace(/\.md$/, '');
    return { name: other, theme: inputs.picks.find((picks) => picks.name === other)?.data?.theme, text: readFileSync(join(out, file), 'utf8') };
  }) : [];
  const meta = { root, out, others, commit: commitOf(root), version: toolVersion(), claudeVersion: claudeCode, model, account };
  const lines = [];
  for (const result of results) {
    const dir = join(local, result.name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'draft.md'), result.draft);
    writeFileSync(join(dir, 'review.md'), review(result, meta));
    const reviewPath = relative(root, join(dir, 'review.md'));
    if (!result.passed) {
      lines.push(`${result.name}: checks failed; not written. Draft ${relative(root, join(dir, 'draft.md'))}; review ${reviewPath}`);
      continue;
    }
    mkdirSync(out, { recursive: true });
    mkdirSync(join(root, 'theme-briefs/records'), { recursive: true });
    writeFileSync(join(out, `${result.name}.md`), result.text);
    writeFileSync(join(root, 'theme-briefs/records', `${result.name}.json`), `${JSON.stringify(record(result, meta), null, 2)}\n`);
    lines.push(`${result.name}: written to ${relative(root, join(out, `${result.name}.md`))}; review ${reviewPath}`);
  }
  return { lines, failed: results.some(({ passed }) => !passed) };
}
