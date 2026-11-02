// Checks on model-drafted prose. Check 4 (values) and check 10 (accent placement) run in draft mode on each
// entry's answer and in CI on the prose read back from a committed brief; the rest run in draft mode only.
// Hard checks refuse an answer; soft checks only send it back for another attempt.
import { BRAND_FLOOR_OPENING, placeholderProse, renderBrief } from './render.mjs';
import { jsonSchemaProblems } from './schemas.mjs';

const PX = /\b\d+(?:\.\d+)?px\b/g;
// Words: whitespace-separated tokens holding a letter or digit, so a dash is not one.
export const words = (text) => text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
const sentences = (text) => text.match(/[^.!?]+[.!?]+/g)?.length ?? 0;
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Provisional, like the Motion section: what each level allows in prose.
const MOTION = {
  still: { max: 150, banned: ['animate', 'fade', 'slide', 'reveal', 'stagger'] },
  subtle: { max: 250, banned: ['stagger'] },
  lively: { max: 400, banned: [] },
};
const NEVER_MOVES = ['parallax', 'loop', 'autoplay', 'bounce'];
// A motion word in any form: fade, fades, faded, fading.
const motionWord = (word) => new RegExp(`\\b${word.replace(/e$/, '')}(?:e|es|ed|ing|s|ion|ions)?\\b`, 'i');

// Every string in a prose object, but the mood's accent placement, which names a component.
export function proseText(prose) {
  const strings = (value) => typeof value === 'string' ? [value] : Object.entries(value ?? {}).flatMap(([key, inner]) => key === 'accentPlacement' ? [] : strings(inner));
  return strings(prose).join('\n');
}

// px values the brief's own tables give.
const tablePx = (brief) => new Set(renderBrief(brief, placeholderProse(brief)).split('\n').filter((line) => line.startsWith('|')).flatMap((line) => line.match(PX) ?? []));

// Check 4: prose gives no value the theme does not: no hex, no undefined variable, no px outside the
// brief's tables, no type size off the Type Scale, no gradient, no motion beyond the layout's level.
export function valueProblems(text, brief) {
  const { theme, facts, layout } = brief;
  const problems = [];
  for (const hex of new Set(text.match(/#[0-9a-f]{3,8}\b/gi) ?? [])) problems.push(`prose holds ${hex}; prose names colors by variable or role, never by value`);
  // Worded like the color check's, so CI reports a variable once.
  for (const name of new Set([...text.matchAll(/(?<![\w-])--([A-Za-z][\w-]*\w)/g)].map(([, name]) => name))) {
    const defined = name.startsWith('immersive-') ? theme.vars.has(name.slice('immersive-'.length)) : facts.neonVars.has(name);
    if (!defined) problems.push(`names --${name}, which ${theme.label} does not define`);
  }
  const { type, typeface } = facts.scale;
  for (const [pair, size, line] of text.matchAll(/(\d+(?:\.\d+)?px)\s*\/\s*(\d+(?:\.\d+)?px)/g)) {
    if (!type.some((row) => row.size === size && row.line === line)) problems.push(`prose gives ${pair}, which is not a Type Scale size and line height`);
  }
  if (typeface) {
    for (const [named, size] of text.matchAll(new RegExp(`${escape(typeface)}\\s+(\\d+(?:\\.\\d+)?px)`, 'g'))) {
      if (!type.some((row) => row.size === size)) problems.push(`prose gives ${named}, which is not a Type Scale size`);
    }
  }
  const allowed = tablePx(brief);
  for (const px of new Set(text.match(PX) ?? [])) if (!allowed.has(px)) problems.push(`prose gives ${px}, which no table in the brief holds`);
  if (/\bgradients?\b/i.test(text)) problems.push('prose names a gradient; Immersive Themes have none');
  const level = MOTION[layout.motion];
  for (const word of [...NEVER_MOVES, ...level.banned]) {
    const found = text.match(motionWord(word));
    if (found) problems.push(`prose names "${found[0]}", which the ${layout.motion} motion level does not allow`);
  }
  for (const [value, ms] of text.matchAll(/\b(\d+)\s*ms\b/g)) {
    if (Number(ms) > level.max) problems.push(`prose gives ${value}, more than the ${layout.motion} motion level's ${level.max}ms`);
  }
  return problems;
}

// Where the accent may go: each occasion component with the accent role, and the Brand Pattern section
// when its colourway is the accent.
export const accentPlacements = ({ occasion, picks }) => [
  ...occasion.components.filter(({ roles }) => roles.includes('accent')).map(({ name }) => name),
  ...(picks.brandPattern.colourway === 'accent' ? ['Brand Pattern section'] : []),
];

// Check 10: the accent placement is one of the brief's and the mood paragraph names it.
export function accentProblems(placement, paragraph, placements) {
  if (!placements.length) return placement === null ? [] : [`accent placement ${JSON.stringify(placement)} given, but nothing in this brief carries the accent; it must be null`];
  if (!placements.includes(placement)) return [`accent placement ${JSON.stringify(placement ?? null)} is not one of ${placements.join(', ')}`];
  const named = placement === 'Brand Pattern section' ? 'Brand Pattern' : placement;
  return paragraph.toLowerCase().includes(named.toLowerCase()) ? [] : [`the mood paragraph does not name its accent placement "${placement}"`];
}

// Each string in an answer with its dotted path.
const strings = (value, path = '') => typeof value === 'string' ? [[path, value]]
  : Object.entries(value ?? {}).flatMap(([key, inner]) => strings(inner, path ? `${path}.${key}` : key));

// Runs of eight words the text shares with the example. Variables break a run; they are values, not words.
const runs = (text) => {
  const found = new Set();
  for (const part of text.toLowerCase().split(/var\([^)]*\)|--[\w-]+/)) {
    const tokens = part.match(/[\p{L}\p{N}']+/gu) ?? [];
    for (let at = 0; at + 8 <= tokens.length; at++) found.add(tokens.slice(at, at + 8).join(' '));
  }
  return found;
};

const band = (path, count, [low, high], unit = 'words') => count < low || count > high ? [`"${path}" has ${count} ${unit}; the target is ${low}–${high}`] : [];

// The hard and soft checks on one entry's answer, normalized. ctx: brief, entry data, output schema,
// bands (the entry's targets, the mood's already less the scripted lines), placements and source names.
export function entryChecks(name, answer, { brief, data, schema, bands, placements, sources }) {
  const hard = jsonSchemaProblems(answer, schema);
  if (hard.length) return { hard, soft: [] };
  const soft = [];
  const all = strings(answer);
  const prose = proseText(answer);
  const { occasion, layout, theme, picks } = brief;
  const componentNames = occasion.components.map((component) => component.name);

  // Shape: what would stop the brief reading its prose back.
  for (const [path, text] of all) if (/^(#|```)/.test(text)) hard.push(`"${path}" starts like a Markdown heading or fence`);
  if (name === 'occasion-components') {
    const found = answer.components.map((component) => component.name);
    if (found.join('\n') !== componentNames.join('\n')) hard.push(`components must be ${componentNames.map((n) => `"${n}"`).join(', ')}, in that order and keeping their names; found ${found.map((n) => `"${n}"`).join(', ')}`);
  }
  if (name === 'preset-dos-donts') {
    for (const key of ['dos', 'donts']) if (answer[key].length !== occasion[key].length) hard.push(`"${key}" must have ${occasion[key].length} bullets, one per intent; has ${answer[key].length}`);
  }
  if (name === 'imagery' && answer.paragraph.startsWith(BRAND_FLOOR_OPENING)) hard.push('"paragraph" opens like the Brand Floor sentence, which the tool adds');
  if (name === 'example-prompts') answer.prompts.forEach((prompt, index) => { if (/^\d+\.\s/.test(prompt)) hard.push(`"prompts.${index}" starts with a list number`); });

  // Values.
  if (['tagline', 'mood-occasion', 'imagery'].includes(name)) {
    for (const [path, text] of all) if (path !== 'accentPlacement' && /var\(|--|\d+(?:\.\d+)?px/.test(text)) hard.push(`"${path}" holds a value (var(), a variable or px); this part names none`);
  }
  if (name === 'layout') for (const px of new Set(prose.match(PX) ?? [])) hard.push(`"paragraph" holds ${px}; Layout names spacing by step, never in px`);
  hard.push(...valueProblems(prose, brief));
  if (name === 'mood-occasion') hard.push(...accentProblems(answer.accentPlacement, answer.paragraph, placements));
  if (data.example) {
    const example = runs(proseText(data.example.output));
    const copied = [...runs(prose)].find((run) => example.has(run));
    if (copied) hard.push(`copies eight or more words from the example ("${copied}")`);
  }
  const leaked = sources.find((source) => new RegExp(`(?<![\\w-])${escape(source)}(?![\\w-])`, 'i').test(prose));
  if (leaked) hard.push(`names "${leaked}", a preset source; no source name ships`);

  // Bands.
  if (name === 'tagline') {
    soft.push(...band('tagline', words(answer.tagline), bands.words), ...band('tagline first clause', words(answer.tagline.split(' — ')[0]), bands.firstClauseWords));
    const proper = new Set(['Finnomena', theme.label, ...picks.briefName.split(' ')]);
    const capital = answer.tagline.split(/\s+/).slice(1).find((word) => /^\p{Lu}/u.test(word) && !proper.has(word.replace(/[^\p{L}\p{N}]/gu, '')));
    if (capital) soft.push(`"tagline" capitalizes "${capital}"; taglines are sentence case`);
  }
  if (name === 'mood-occasion') soft.push(...band('paragraph', words(answer.paragraph), bands.paragraphWords));
  if (name === 'occasion-components') {
    answer.components.forEach(({ role, paragraph }, index) => soft.push(
      ...band(`components.${index}.role`, words(role), bands.roleWords),
      ...band(`components.${index}.paragraph`, words(paragraph), bands.paragraphWords),
      ...band(`components.${index}.paragraph`, sentences(paragraph), bands.paragraphSentences, 'sentences'),
    ));
  }
  if (name === 'preset-dos-donts') {
    for (const key of ['dos', 'donts']) answer[key].forEach((line, index) => soft.push(...band(`${key}.${index}`, words(line), bands.words)));
    answer.donts.forEach((line, index) => { if (!line.startsWith('Do not ') || !line.includes(' — ')) soft.push(`"donts.${index}" must start "Do not" and give its reason after " — "`); });
  }
  if (name === 'imagery' || name === 'layout') soft.push(...band('paragraph', words(answer.paragraph), bands.words));
  if (name === 'example-prompts') {
    soft.push(...band('prompts', answer.prompts.length, bands.count, 'prompts'));
    answer.prompts.forEach((prompt, index) => soft.push(...band(`prompts.${index}`, words(prompt), bands.words)));
    const named = (text) => componentNames.some((component) => text.toLowerCase().includes(component.toLowerCase()));
    if (!answer.prompts.some(named)) soft.push(`no prompt names an occasion component (${componentNames.join(', ')})`);
  }

  // Agreement with the presets.
  if (name === 'layout') {
    const paragraph = answer.paragraph.toLowerCase();
    for (const component of componentNames) if (!paragraph.includes(component.toLowerCase())) soft.push(`"paragraph" does not place the component "${component}"`);
    if (!paragraph.includes(layout.brandPattern.section)) soft.push(`"paragraph" does not name the Brand Pattern section, "${layout.brandPattern.section}"`);
  }
  return { hard, soft };
}
