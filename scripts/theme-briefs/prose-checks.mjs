// Checks on model-drafted prose. Check 4 (values and prescriptions) runs in draft mode on each entry's answer
// and in CI on the prose read back from a committed brief; the rest run in draft mode only.
// Hard checks refuse an answer; soft checks only send it back for another attempt.
import { BRAND_FLOOR_OPENING } from './render.mjs';
import { jsonSchemaProblems } from './schemas.mjs';

// Words: whitespace-separated tokens holding a letter or digit, so a dash is not one.
export const words = (text) => text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
const sentences = (text) => text.match(/[^.!?]+[.!?]+/g)?.length ?? 0;
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// What a brief leaves to the page's design (ADR 0018): arrangement, size, shape and motion. Type roles and
// spacing come as words here; as variables and px they are refused by value.
const PRESCRIPTIONS = {
  layout: ['section', 'sections', 'column', 'columns', 'grid', 'hero', 'footer', 'full-bleed', 'edge to edge', 'sticky', 'full width'],
  'size or shape': ['padding', 'margin', 'radius', 'rounded', 'corners', 'border', 'borders', 'shadow', 'shadows', 'display1', 'display2', 'display3', 'title1', 'title2', 'title3', 'title4', 'label1', 'label2'],
  motion: ['animate', 'animates', 'animated', 'animation', 'fade', 'fades', 'stagger', 'staggered', 'parallax', 'autoplay', 'on scroll', 'crossfade', 'crossfades'],
};
// Font names prose may not give, matched by case and whole word; a font missing here is not caught.
// Finnomena Trek is in theme/tokens. Prompt (a Thai font) and generic families like serif are left out: they are common words.
const FONTS = ['Finnomena Trek', 'IBM Plex Sans', 'IBM Plex Serif', 'IBM Plex Mono', 'Inter', 'Roboto', 'Helvetica', 'Arial', 'Georgia',
  'Times New Roman', 'Futura', 'Garamond', 'Montserrat', 'Poppins', 'Lato', 'Open Sans', 'Noto Sans', 'Noto Serif', 'Source Sans',
  'SF Pro', 'Segoe UI', 'Verdana', 'Tahoma', 'Courier', 'Avenir', 'Proxima Nova', 'Gotham', 'DM Sans', 'Manrope', 'Space Grotesk',
  'Playfair Display', 'Merriweather', 'Comic Sans', 'Bodoni', 'Didot', 'Kanit', 'Sarabun', 'Mitr', 'Anuphan', 'Noto Sans Thai'];
// Every string in a prose object.
export function proseText(prose) {
  const strings = (value) => typeof value === 'string' ? [value] : Object.values(value ?? {}).flatMap(strings);
  return strings(prose).join('\n');
}

// Check 4: prose gives no value and no prescription: no hex, no variable, no px or ms, no font but the theme's,
// no layout, size, shape or motion.
export function valueProblems(text, { facts }) {
  const problems = [];
  for (const hex of new Set(text.match(/#[0-9a-f]{3,8}\b/gi) ?? [])) problems.push(`prose holds ${hex}; prose names colors by role, never by value`);
  for (const name of new Set(text.match(/(?<![\w-])--[A-Za-z][\w-]*\w/g) ?? [])) problems.push(`prose names ${name}; prose names no variable`);
  for (const value of new Set(text.match(/\b\d+(?:\.\d+)?\s?(?:px|ms)\b/g) ?? [])) problems.push(`prose gives ${value}; size and timing are the page's design`);
  const { typeface } = facts.type;
  // The typeface, then each font found, longest first, is taken out, so a shorter name is not found inside it.
  let untyped = typeface ? text.replaceAll(typeface, ' ') : text;
  for (const font of [...FONTS].sort((a, b) => b.length - a.length)) {
    const pattern = new RegExp(`(?<![\\w-])${escape(font)}(?![\\w-])`, 'g');
    if (!pattern.test(untyped)) continue;
    problems.push(`prose names "${font}", a font other than ${typeface}; type comes from the theme`);
    untyped = untyped.replace(pattern, ' ');
  }
  for (const [part, named] of Object.entries(PRESCRIPTIONS)) {
    for (const word of named) if (new RegExp(`(?<![\\w-])${word}(?![\\w-])`, 'i').test(text)) problems.push(`prose prescribes ${part} ("${word}"); a brief leaves it to the page's design`);
  }
  return problems;
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

// A bullet's sentences: a stop followed by a capital starts the next one.
const bulletSentences = (text) => text.trim().split(/(?<=[.!?])\s+(?=\p{Lu})/u).length;
const band = (path, count, [low, high], unit = 'words') => count < low || count > high ? [`"${path}" has ${count} ${unit}; the target is ${low}–${high}`] : [];

// The hard and soft checks on one entry's answer, normalized. ctx: brief, entry data, output schema,
// bands (the entry's targets, the mood's already less the scripted lines) and source names.
export function entryChecks(name, answer, { brief, data, schema, bands, sources }) {
  const hard = jsonSchemaProblems(answer, schema);
  if (hard.length) return { hard, soft: [] };
  const soft = [];
  const all = strings(answer);
  const prose = proseText(answer);
  const { occasion, theme, picks } = brief;
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

  // Values.
  hard.push(...valueProblems(prose, brief));
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
    for (const key of ['dos', 'donts']) {
      answer[key].forEach((line, index) => {
        soft.push(...band(`${key}.${index}`, words(line), bands.words));
        const count = bulletSentences(line);
        if (count !== 1) soft.push(`"${key}.${index}" has ${count} sentences; each bullet is one`);
      });
    }
    answer.donts.forEach((line, index) => { if (!line.startsWith('Do not ') || !line.includes(' — ')) soft.push(`"donts.${index}" must start "Do not" and give its reason after " — "`); });
  }
  if (name === 'imagery') soft.push(...band('paragraph', words(answer.paragraph), bands.words));
  return { hard, soft };
}
