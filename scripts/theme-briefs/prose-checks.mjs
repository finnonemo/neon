// Checks on model-drafted prose. Check 4 (values), check 6's hard half (fill/text pairing) and check 10 (accent
// placement) run in draft mode on each entry's answer and in CI on the prose read back from a committed brief;
// the rest run in draft mode only.
// Hard checks refuse an answer; soft checks only send it back for another attempt.
import { BRAND_FLOOR_OPENING, offActionFills, placeholderProse, renderBrief } from './render.mjs';
import { blockColourway, jsonSchemaProblems } from './schemas.mjs';

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
// Font names prose may not give, matched by case and whole word; a font missing here is not caught.
// Finnomena Trek is in theme/tokens. Prompt (a Thai font) and generic families like serif are left out: they are common words.
const FONTS = ['Finnomena Trek', 'IBM Plex Sans', 'IBM Plex Serif', 'IBM Plex Mono', 'Inter', 'Roboto', 'Helvetica', 'Arial', 'Georgia',
  'Times New Roman', 'Futura', 'Garamond', 'Montserrat', 'Poppins', 'Lato', 'Open Sans', 'Noto Sans', 'Noto Serif', 'Source Sans',
  'SF Pro', 'Segoe UI', 'Verdana', 'Tahoma', 'Courier', 'Avenir', 'Proxima Nova', 'Gotham', 'DM Sans', 'Manrope', 'Space Grotesk',
  'Playfair Display', 'Merriweather', 'Comic Sans', 'Bodoni', 'Didot', 'Kanit', 'Sarabun', 'Mitr', 'Anuphan', 'Noto Sans Thai'];
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
  // The typeface, then each font found, longest first, is taken out, so a shorter name is not found inside it.
  let untyped = typeface ? text.replaceAll(typeface, ' ') : text;
  for (const font of [...FONTS].sort((a, b) => b.length - a.length)) {
    const pattern = new RegExp(`(?<![\\w-])${escape(font)}(?![\\w-])`, 'g');
    if (!pattern.test(untyped)) continue;
    problems.push(`prose names "${font}", a font other than ${typeface}; type comes from the theme`);
    untyped = untyped.replace(pattern, ' ');
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

// Check 6: each fill prose names takes its own text in the same sentence: --immersive-on-<fill> of the same
// family and step, and --immersive-text on the canvas. A fill is any variable with an on- partner, or the
// canvas. Hard when a sentence with a fill gives a text no fill in it takes; --immersive-text is let through
// when the sentence names the canvas in words. Soft when a fill has no text at all.
export function pairingProblems(text, theme) {
  const hard = [];
  const soft = [];
  const textOf = (fill) => fill === 'canvas' ? 'text' : `on-${fill}`;
  const list = (names) => names.map((name) => `--immersive-${name}`).join(', ');
  // A stop followed by a capital ends a sentence, so "e.g." does not.
  for (const sentence of text.split(/\n|(?<=[.!?])\s+(?=\p{Lu})/u)) {
    const named = [...new Set([...sentence.matchAll(/--immersive-([\w-]*\w)/g)].map(([, name]) => name))];
    const fills = named.filter((name) => name === 'canvas' || (!name.startsWith('on-') && theme.vars.has(`on-${name}`)));
    if (!fills.length) continue;
    const texts = named.filter((name) => name === 'text' || name.startsWith('on-'));
    const canvasInWords = /\bcanvas\b/i.test(sentence.replaceAll('--immersive-canvas', ''));
    const spare = texts.filter((name) => !fills.some((fill) => textOf(fill) === name) && !(name === 'text' && canvasInWords));
    const unpaired = fills.filter((name) => !texts.includes(textOf(name)));
    for (const fill of unpaired) {
      if (spare.length) hard.push(`names --immersive-${fill} as a fill with ${list(spare)} text; text on it is --immersive-${textOf(fill)}`);
      else soft.push(`names --immersive-${fill} as a fill with no text; name --immersive-${textOf(fill)} in the same sentence`);
    }
    if (!unpaired.length && spare.length) {
      hard.push(`names ${list(spare)} text beside ${list(fills)}, whose text is ${list(fills.map(textOf))}`);
    }
  }
  return { hard: [...new Set(hard)], soft: [...new Set(soft)] };
}

// Where the accent may go: each occasion component with the accent role, and the Brand Pattern section
// when its ground is an accent step or Block draws the Pattern with the accent's color.
const patternInAccent = ({ theme, picks }) => picks.brandPattern.colourway === 'accent'
  || Object.values(blockColourway(picks.brandPattern.blockColourway)).includes(theme?.steps.accent?.['100']?.bg);
export const accentPlacements = (brief) => [
  ...brief.occasion.components.filter(({ roles }) => roles.includes('accent')).map(({ name }) => name),
  ...(patternInAccent(brief) ? ['Brand Pattern section'] : []),
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

// A bullet's sentences: a stop followed by a capital starts the next one.
const bulletSentences = (text) => text.trim().split(/(?<=[.!?])\s+(?=\p{Lu})/u).length;
// The slots a component paragraph gives, in order; a slot it leaves out is not checked.
const SLOTS = [['fill', /\bfill\b/i], ['border', /\bborders?\b/i], ['radius', /\b(?:corners?|radius)\b/i], ['padding', /\bpadding\b/i]];
function slotProblem(path, paragraph) {
  const found = SLOTS.map(([slot, pattern]) => [slot, paragraph.search(pattern)]).filter(([, at]) => at >= 0);
  for (const [index, [slot, at]] of found.entries()) {
    const early = found.slice(index + 1).find(([, later]) => later < at);
    if (early) return [`"${path}" gives ${early[0]} before ${slot}; the slot order is ${SLOTS.map(([name]) => name).join(', ')}`];
  }
  return [];
}

// A component paragraph follows its preset's composition picks: a lead fact takes the layout's fact role
// and no component without one reaches a display role; a feature component takes the feature radius;
// only a component with the action role fills an action with the main action's color, and not on a fill
// where that color does not read; no action is outlined, since Neon has no outlined button; a Secondary
// Action on an accent or support fill is the ghost variant, never the palette fill.
const DISPLAY_ROLE = /\bdisplay\d\b/;
function compositionProblems(path, paragraph, component, layout, theme) {
  const problems = [];
  if (!component) return problems;
  if (component.leadFact && !paragraph.includes(layout.factRole)) problems.push(`"${path}" does not set its lead fact (${component.leadFact}) in ${layout.factRole}`);
  if (!component.leadFact && DISPLAY_ROLE.test(paragraph)) problems.push(`"${path}" names a display role, but the component has no lead fact`);
  if (!component.roles.includes('action') && paragraph.includes('--immersive-action')) problems.push(`"${path}" names --immersive-action, but the component does not take the action role; its action is the Secondary Action`);
  if (/\boutlined?\b/i.test(paragraph.replace(/\b(?:no|never|without)\s+(?:an?\s+)?outlined?\b/gi, ''))) problems.push(`"${path}" outlines an action; Neon has no outlined button, and a Secondary Action is the secondary or ghost variant`);
  const fill = paragraph.match(/--immersive-((?:palette|accent|support)-\d+)/)?.[1];
  if (theme && component.roles.includes('action') && offActionFills(theme).includes(fill) && paragraph.includes('--immersive-action')) {
    problems.push(`"${path}" fills its action with --immersive-action on --immersive-${fill}, where it does not read; fill it with --immersive-on-${fill} and set its label in --immersive-${fill}`);
  }
  if (/^(?:accent|support)-/.test(fill ?? '') && /secondary action/i.test(paragraph) && paragraph.includes('--immersive-palette-75')) {
    problems.push(`"${path}" fills a Secondary Action with --immersive-palette-75 on --immersive-${fill}; on an accent or support fill it is the ghost variant, its label in --immersive-on-${fill}`);
  }
  const radius = component.feature ? layout.featureRadius : layout.blockRadius;
  if (/\b(?:corners?|radius)\b/i.test(paragraph) && !paragraph.includes(`--${radius}`)) problems.push(`"${path}" does not round to --${radius}, the ${component.feature ? 'feature block' : 'block and card'} radius`);
  return problems;
}

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
  const pairing = pairingProblems(prose, theme);
  hard.push(...pairing.hard);
  soft.push(...pairing.soft);
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
    answer.components.forEach(({ name: component, role, paragraph }, index) => soft.push(
      ...band(`components.${index}.role`, words(role), bands.roleWords),
      ...band(`components.${index}.paragraph`, words(paragraph), bands.paragraphWords),
      ...band(`components.${index}.paragraph`, sentences(paragraph), bands.paragraphSentences, 'sentences'),
      ...slotProblem(`components.${index}.paragraph`, paragraph),
      ...compositionProblems(`components.${index}.paragraph`, paragraph, occasion.components.find((preset) => preset.name === component), layout, theme),
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
    for (const [path, line] of all) {
      const other = (line.match(/\bdisplay\d\b/g) ?? []).find((role) => role !== layout.factRole);
      if (other) soft.push(`"${path}" names ${other}; the layout's lead fact role is ${layout.factRole}`);
    }
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
    if (occasion.components.some(({ leadFact }) => leadFact) && !paragraph.includes(layout.factRole)) soft.push(`"paragraph" does not say which facts take ${layout.factRole}`);
    for (const ground of new Set(layout.grounds)) if (ground !== 'canvas' && !paragraph.includes(ground)) soft.push(`"paragraph" does not name the ${ground} ground`);
    if (/--immersive-/.test(answer.paragraph)) soft.push('"paragraph" names a color variable; Layout names grounds by word, and the section table gives their variables');
  }
  return { hard, soft };
}
