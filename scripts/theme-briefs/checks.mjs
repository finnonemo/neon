// The Theme Brief check module, shared by the authoring tool and CI
// (evals/skills/theme-briefs.test.mjs). Hard checks only; checks on drafted prose are in prose-checks.mjs.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { contrast, matchToken, paletteTokens } from '../lib/colors.mjs';
import { loadInputs, PRESET_KINDS } from './inputs.mjs';
import { accentPlacements, accentProblems, pairingProblems, proseText, valueProblems } from './prose-checks.mjs';
import { assembleBrief, freshBrief, readProse, splitSections } from './render.mjs';
import { isThirdParty, sourceHost } from './schemas.mjs';

// Where authoring records live: draft mode writes them and CI reads them.
export const RECORDS = 'theme-briefs/records';

const plural = (count, one, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

// The presets a picks file names, by kind, and the names that have no preset file.
function chosenPresets(data, presets) {
  const chosen = {};
  const missing = [];
  for (const kind of PRESET_KINDS) {
    const slug = data?.presets?.[kind];
    if (typeof slug !== 'string') continue;
    if (presets[kind][slug]) chosen[kind] = presets[kind][slug].data;
    else missing.push(`${kind} preset "${slug}" not found under theme-briefs/presets/${kind}`);
  }
  return { chosen, missing };
}

const thirdPartyKinds = (chosen) => Object.keys(chosen).filter((kind) => isThirdParty(sourceHost(chosen[kind])));

// Compatibility: the picks file's presets and colourway fit its theme. Skips what the schema already refused.
function compatibility({ path, data }, presets, facts) {
  const theme = facts.themes[data?.theme];
  if (!theme || typeof data.presets !== 'object' || data.presets === null) return [];
  const { chosen, missing } = chosenPresets(data, presets);
  const problems = [...missing];
  for (const component of Array.isArray(chosen.occasion?.components) ? chosen.occasion.components : []) {
    for (const role of Array.isArray(component?.roles) ? component.roles : []) {
      if (!theme.roles.includes(role)) problems.push(`occasion "${data.presets.occasion}" component "${component.name}" uses role "${role}", which ${theme.label} lacks (roles: ${theme.roles.join(', ')})`);
    }
  }
  const accented = (Array.isArray(chosen.occasion?.components) ? chosen.occasion.components : []).some((component) => Array.isArray(component?.roles) && component.roles.includes('accent'));
  if (Array.isArray(chosen.layout?.grounds) && chosen.layout.grounds.includes('accent') && chosen.occasion && !accented) {
    problems.push(`layout "${data.presets.layout}" gives a section an accent ground, but no component of occasion "${data.presets.occasion}" takes the accent role`);
  }
  const { colourway, ground } = data.brandPattern ?? {};
  if (typeof colourway === 'string' && Number.isInteger(ground)) {
    const steps = theme.steps[colourway];
    if (!steps) problems.push(`colourway "${colourway}" is not one of ${theme.label}'s families (${theme.families.join(', ')})`);
    else if (!steps[ground]) problems.push(`ground ${ground} is not a step of ${colourway} (${Object.keys(steps).join(', ')})`);
    else if (steps[ground].bg === theme.canvas && !(colourway === 'palette' && ground === 100)) {
      problems.push(`${colourway} ${ground} is ${theme.label}'s bare canvas; a Brand Pattern sits on the canvas only as palette 100`);
    }
  }
  const thirdParty = thirdPartyKinds(chosen);
  for (const kind of thirdParty) {
    if (!data.review) problems.push(`${kind} "${data.presets[kind]}" has a third-party source, so the picks file needs a review record`);
    else if (data.review.status === 'illustrative') problems.push(`${kind} "${data.presets[kind]}" has a third-party source and its review status is "illustrative"; it ships only after a Finnomena design review`);
  }
  if (data.review && !thirdParty.length && Object.keys(chosen).length === PRESET_KINDS.length) {
    problems.push('review record without a third-party source; remove it');
  }
  return problems.map((message) => `${path}: ${message}`);
}

// The names a source could leak by: its host, its registrable domain and the site label.
function sourceNames(host) {
  const labels = host.split('.');
  const country = labels.length > 2 && labels.at(-1).length === 2 && labels.at(-2).length <= 3;
  const domain = labels.slice(country ? -3 : -2).join('.');
  return [...new Set([host, domain, domain.split('.')[0]])].filter((name) => name.length >= 3);
}
// Every name a third-party preset source could leak by, across all presets.
export const sourceNamesOf = (presets) => PRESET_KINDS.flatMap((kind) => Object.values(presets[kind]))
  .map(({ data }) => sourceHost(data)).filter(isThirdParty).flatMap(sourceNames);
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Colors: every hex is a color token, and every fill/text pair the brief names is readable.
function colorProblems(text, theme, tokens) {
  const problems = [];
  for (const hex of new Set(text.match(/#[0-9a-f]{3,8}\b/gi) ?? [])) {
    if (hex.length !== 7) {
      problems.push(`${hex} is not a color token; tables give a token's 6-digit value`);
      continue;
    }
    const { exact, nearest } = matchToken(hex, tokens);
    if (!exact) problems.push(`${hex} is not a color token (nearest ${nearest.name} ${nearest.value})`);
  }
  if (!theme) return problems;
  const named = new Set([...text.matchAll(/--immersive-([\w-]*\w)/g)].map(([, name]) => name));
  const pair = (fore, back, minimum, need) => {
    const ratio = contrast(theme.vars.get(fore), theme.vars.get(back));
    if (ratio < minimum) problems.push(`--immersive-${fore} on --immersive-${back} is ${ratio.toFixed(2)}:1 on ${theme.label}; ${need}`);
  };
  for (const name of named) {
    if (!theme.vars.has(name)) problems.push(`names --immersive-${name}, which ${theme.label} does not define`);
    else if (name.startsWith('on-') && theme.vars.has(name.slice(3))) pair(name, name.slice(3), 4.5, 'text needs 4.5:1');
    else if (name === 'text') pair('text', 'canvas', 4.5, 'text needs 4.5:1');
    else if (name === 'action') pair('action', 'canvas', 3, "an action's edge needs 3:1");
  }
  return problems;
}

// Check 9: no two picks files of one theme share all three presets; a colourway alone is no new design.
// Each twin is reported on the later file, naming the earlier.
function distinctness(picks) {
  const seen = new Map();
  const problems = [];
  for (const { path, data } of picks) {
    if (typeof data?.theme !== 'string' || PRESET_KINDS.some((kind) => typeof data.presets?.[kind] !== 'string')) continue;
    const key = JSON.stringify([data.theme, ...PRESET_KINDS.map((kind) => data.presets[kind])]);
    const earlier = seen.get(key);
    if (!earlier) {
      seen.set(key, { path, data });
      continue;
    }
    const colourwayOnly = earlier.data.brandPattern?.colourway !== data.brandPattern?.colourway;
    problems.push(`${path}: has the same occasion, layout and imagery presets as ${earlier.path}; briefs on one theme differ in at least one preset${colourwayOnly ? ', not only in colourway' : ''}`);
  }
  return problems;
}

// The inputs and every problem found in them, before any brief is read.
export function checkInputs(root) {
  const inputs = loadInputs(root);
  const problems = [...inputs.problems];
  for (const picks of inputs.picks) problems.push(...compatibility(picks, inputs.presets, inputs.facts));
  problems.push(...distinctness(inputs.picks));
  return { inputs, problems };
}

// The brief a published brief's picks file describes, ready to render, as { brief }; or { reason } when it
// cannot be rendered, with reason undefined when the problems already found say why.
export function renderable(name, inputs, problems) {
  const picks = inputs.picks.find((candidate) => candidate.name === name);
  if (!picks) return { reason: `has no picks file theme-briefs/picks/${name}.json` };
  const paths = ['theme/immersive-themes.json', picks.path, ...inputs.themeTexts.map(({ path }) => path),
    ...PRESET_KINDS.map((kind) => inputs.presets[kind][picks.data?.presets?.[kind]]?.path).filter(Boolean)];
  if (problems.some((problem) => paths.some((path) => problem.startsWith(`${path}: `)))) return {};
  const { brief, missing } = assembleBrief(inputs, picks);
  if (brief) return { brief };
  return { reason: missing.length ? `needs ${missing.join(', ')} for its Sibling Themes` : undefined };
}

const clip = (line = '') => JSON.stringify(line.length > 80 ? `${line.slice(0, 77)}...` : line);

// Check 3: every scripted section equals fresh scripted output exactly, per section found by heading.
function scriptedDrift(markdown, brief) {
  const fresh = freshBrief(markdown, brief);
  if (fresh.problems) return fresh.problems.map((message) => `${message}; its scripted sections cannot be checked`);
  const found = splitSections(markdown);
  const expected = splitSections(fresh.text);
  const headings = (sections) => sections.map(({ heading }) => heading).join(', ');
  if (headings(found) !== headings(expected)) return [`sections must be, in order: ${headings(expected)}; found ${headings(found)}; run scripted-only`];
  return expected.flatMap(({ heading, text }, index) => {
    if (found[index].text === text) return [];
    const have = found[index].text.split('\n');
    const want = text.split('\n');
    const line = want.findIndex((wanted, at) => wanted !== have[at]);
    const at = line === -1 ? want.length : line;
    return [`section "${heading}" differs from fresh scripted output (found ${clip(have[at])}, expected ${clip(want[at])}); run scripted-only`];
  });
}

// Checks 3, 4, 5, 6, 7 and 10 on one brief's Markdown, each message once. `brief` is undefined when the brief
// cannot be rendered, and `record` when it has no authoring record.
export function briefProblems(text, { theme, brief, tokens, sources, record }) {
  const problems = new Set(colorProblems(text, theme, tokens));
  if (brief) {
    for (const message of scriptedDrift(text, brief)) problems.add(message);
    const { prose } = readProse(text, brief);
    if (prose) {
      for (const message of valueProblems(proseText(prose), brief)) problems.add(message);
      // Check 6, hard only: a fill with no text named is a draft-time warning, never a CI failure.
      for (const message of pairingProblems(proseText(prose), brief.theme).hard) problems.add(message);
      if (record) for (const message of accentProblems(record.accentPlacement, prose['mood-occasion'].paragraph, accentPlacements(brief))) problems.add(message);
    }
  }
  // No source name: no site or domain name from any preset source; the first name found per source is enough.
  const leaked = sources.find((source) => new RegExp(`(?<![\\w-])${escape(source)}(?![\\w-])`, 'i').test(text));
  if (leaked) problems.add(`names "${leaked}", a preset source; no source name ships`);
  return [...problems];
}

// Check 11, theme coverage: every Immersive Theme has a theme text and at least one published brief.
function coverageProblems(inputs, published, where) {
  const texts = new Set(inputs.themeTexts.map(({ id }) => id));
  return Object.values(inputs.facts.themes).flatMap((theme) => [
    ...(texts.has(theme.id) ? [] : [`theme-briefs/themes/${theme.id}.json: missing; every Immersive Theme needs a theme text`]),
    ...(published.has(theme.id) ? [] : [`${where}: ${theme.label} has no published brief; every Immersive Theme needs at least one`]),
  ]);
}

// `coverage: false` skips check 11, for fixture trees that hold fewer themes' briefs than the theme data.
export function checkThemeBriefs({ root, out = join(root, 'registry/theme-briefs'), coverage = true }) {
  const { inputs, problems } = checkInputs(root);
  const { facts, presets } = inputs;
  const briefs = existsSync(out) ? readdirSync(out).filter((name) => name.endsWith('.md')) : [];

  // Pairs: a published brief (Markdown or registry entry) has its picks file, Markdown, record and registry entry.
  const at = (path) => relative(root, path);
  const registry = JSON.parse(existsSync(join(root, 'registry/registry.json')) ? readFileSync(join(root, 'registry/registry.json'), 'utf8') : '{}');
  const entries = new Set((registry.items ?? []).map((item) => item.name).filter((name) => name?.startsWith('theme-brief-')).map((name) => name.slice('theme-brief-'.length)));
  const picksByName = new Map(inputs.picks.map((picks) => [picks.name, picks]));
  const tokens = paletteTokens(join(root, 'theme/tokens/colors.json'));
  const sources = sourceNamesOf(presets);
  const published = new Set();
  for (const name of [...new Set([...briefs.map((file) => file.replace(/\.md$/, '')), ...entries])].sort()) {
    const markdown = join(out, `${name}.md`);
    const where = existsSync(markdown) ? at(markdown) : 'registry/registry.json';
    const picks = picksByName.get(name);
    const recordPath = join(root, RECORDS, `${name}.json`);
    const missing = [
      !existsSync(markdown) && `Markdown ${at(markdown)}`,
      !picks && `picks file theme-briefs/picks/${name}.json`,
      !existsSync(recordPath) && `authoring record theme-briefs/records/${name}.json`,
      !entries.has(name) && `registry entry "theme-brief-${name}" in registry/registry.json`,
    ].filter(Boolean);
    for (const part of missing) problems.push(`${where}: published brief "${name}" has no ${part}`);
    if (!existsSync(markdown)) continue;
    const text = readFileSync(markdown, 'utf8');
    const theme = facts.themes[picks?.data?.theme] ?? Object.values(facts.themes).find((candidate) => name.startsWith(`${candidate.id}-`));
    if (theme) published.add(theme.id);
    const { brief, reason } = picks ? renderable(name, inputs, problems) : {};
    if (reason) problems.push(`${where}: ${reason}; its scripted sections cannot be checked`);
    let record;
    try {
      record = existsSync(recordPath) ? JSON.parse(readFileSync(recordPath, 'utf8')) : undefined;
    } catch (error) {
      problems.push(`${at(recordPath)}: not valid JSON (${error.message})`);
    }
    for (const message of briefProblems(text, { theme, brief, tokens, sources, record })) problems.push(`${where}: ${message}`);
  }
  if (coverage) problems.push(...coverageProblems(inputs, published, at(out)));
  const counts = [
    plural(Object.keys(inputs.facts.themes).length, 'theme'),
    plural(PRESET_KINDS.reduce((sum, kind) => sum + Object.keys(inputs.presets[kind]).length, 0), 'preset'),
    plural(inputs.picks.length, 'picks file'),
    plural(inputs.themeTexts.length, 'theme text'),
    plural(inputs.library.length, 'prompt library entry', 'prompt library entries'),
    plural(briefs.length, 'brief'),
  ];
  return { problems, summary: counts.join(', ') };
}
