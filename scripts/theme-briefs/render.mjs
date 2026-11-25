// Scripted renderer for Theme Briefs: a pure function from validated inputs
// and prose to Markdown sections, found by fixed headings, and its inverse,
// which reads the prose back out of a brief. Rendering a brief with the prose
// read from it gives the same text whenever its scripted parts are fresh.
//
// Prose is keyed by prompt library entry, in the shape each entry outputs:
// tagline { tagline }, mood-occasion { paragraph }, occasion-components
// { components: [{ name, role, paragraph }] }, preset-dos-donts { dos, donts },
// imagery { paragraph }.
import { blockColourway, colorVariable } from './schemas.mjs';

const SECTIONS = ['Tokens — Colors', 'Tokens — Typography', 'Components', 'Occasion content', "Do's and Don'ts", 'Surfaces', 'Imagery', 'Brand Pattern', 'Agent Prompt Guide', 'Sibling Themes', 'Quick Start'];
const HEADER = 'Header';

// The brief a picks file describes, from loaded inputs, as { brief }, or { missing } naming the theme texts
// it lacks. Sibling Themes needs every theme's text. Missing presets are left to the compatibility check.
export function assembleBrief(inputs, picks) {
  const { facts, presets, themeTexts } = inputs;
  const texts = Object.fromEntries(themeTexts.map(({ id, data }) => [id, data]));
  const chosen = Object.fromEntries(Object.entries(picks.data?.presets ?? {}).map(([kind, slug]) => [kind, presets[kind]?.[slug]?.data]));
  const theme = facts.themes[picks.data?.theme];
  const missing = Object.keys(facts.themes).filter((id) => !texts[id]).map((id) => `theme-briefs/themes/${id}.json`);
  if (!theme || !chosen.occasion || !chosen.imagery) return { missing: [] };
  if (missing.length) return { missing };
  return { brief: { name: picks.name, picks: picks.data, theme, facts, texts, ...chosen } };
}

const table = (header, rows) => [`| ${header.join(' | ')} |`, `|${header.map(() => '---').join('|')}|`, ...rows.map((row) => `| ${row.join(' | ')} |`)].join('\n');
const code = (text) => `\`${text}\``;
const variable = (name) => code(`--immersive-${name}`);
const descending = (steps) => Object.keys(steps).sort((a, b) => b - a);
const family = (token) => token.replace(/ \d+$/, '');

function header({ theme, picks, texts }, prose) {
  const ratio = Object.entries(theme.ratio).map(([name, share]) => `${name} ${share}%`).join(', ');
  return [
    `# Finnomena ${theme.label} · ${picks.briefName} — Theme Brief`,
    `> ${prose.tagline.tagline}`,
    '',
    `**Theme:** ${theme.kind}`,
    `**Immersive Theme:** ${theme.id}`,
    '',
    `This is a Finnomena Theme Brief, not a Reference Design: skip Brand Intensity and apply the whole Brand Contract. Colors come from the ${theme.label} Immersive Theme and the typeface from Neon's theme. It gives no layout, type size, spacing, shape or motion: design the page yourself. Provisional pending design owner review.`,
    '',
    // One paragraph on three lines, so the occasion half can be read back by position.
    texts[theme.id].mood.replace(/\s+/g, ' ').trim(),
    prose['mood-occasion'].paragraph,
    `Membership ratio: ${ratio}.`,
  ].join('\n');
}

function colors({ theme, facts }) {
  const role = (name) => {
    if (name === 'canvas') return 'Page background';
    if (name === 'text') return 'Text on the canvas';
    if (name === 'action') return `Main action fill; label ${variable('on-action')}`;
    if (name === 'on-action') return 'Main action label';
    if (theme.vars.get(name) === theme.vars.get('canvas')) return 'The canvas color, not a block fill';
    const kind = { palette: 'Tint block', accent: 'Accent block', support: 'Support block' }[name.split('-')[0]];
    return `${kind}; text ${variable(`on-${name}`)}`;
  };
  const rows = theme.own.filter((name) => !name.startsWith('on-') || name === 'on-action')
    .map((name) => [theme.tokens.get(name), code(theme.vars.get(name)), variable(name), role(name)]);
  const secondary = Object.entries(facts.secondary);
  const steps = secondary[0]?.[1] ?? [];
  const textOf = (name, familySteps) => {
    const groups = new Map();
    for (const step of familySteps) groups.set(theme.tokens.get(`on-${name}-${step}`), [...(groups.get(theme.tokens.get(`on-${name}-${step}`)) ?? []), step]);
    return groups.size === 1 ? [...groups.keys()][0] : [...groups].map(([token, on]) => `${token} on ${on.join(', ')}`).join('; ');
  };
  const secondaryRows = secondary.map(([name, familySteps]) => [family(theme.tokens.get(`${name}-${familySteps[0]}`)), ...familySteps.map((step) => code(theme.vars.get(`${name}-${step}`))), textOf(name, familySteps)]);
  return [
    '## Tokens — Colors',
    '',
    table(['Name', 'Value', 'Token', 'Role'], rows),
    '',
    `**Shared secondary colors**, in every theme, for small highlight, tag and illustration blocks only. Each step is ${code('--immersive-<family>-<step>')} with its own ${code('on-')} text variable.`,
    '',
    table(['Family', ...steps, 'Text'], secondaryRows),
  ].join('\n');
}

function typography({ facts }) {
  const { typeface, weights } = facts.type;
  return [
    '## Tokens — Typography',
    '',
    `### ${typeface} · ${code('--fontFamily-body')}`,
    `- **Substitute:** none. ${typeface} is part of the Brand Floor.`,
    `- **Weights:** ${weights.join(', ')}`,
    '- **Role:** all text, Thai and Latin alike.',
  ].join('\n');
}

// Steps of a family that may fill a block: every step but the canvas.
const blockSteps = (theme, name) => descending(theme.steps[name]).filter((step) => theme.steps[name][step].bg !== theme.canvas);
const stepRange = (name, steps) => steps.length === 1 ? variable(`${name}-${steps[0]}`) : `${variable(`${name}-${steps[0]}`)} to ${variable(`${name}-${steps.at(-1)}`)}`;

// Block fills whose text is not the main action's color: a button in the action color does not read there.
// Each family is named whole when every one of its block steps is such a fill.
const offActionFills = (theme) => theme.families.flatMap((family) => blockSteps(theme, family).filter((step) => theme.steps[family][step].fg !== theme.action).map((step) => `${family}-${step}`));
function offActionNote(theme) {
  const fills = offActionFills(theme);
  if (!fills.length) return '';
  const named = theme.families.flatMap((family) => {
    const own = fills.filter((fill) => fill.startsWith(`${family}-`));
    return own.length === blockSteps(theme, family).length ? [`every ${code(family)} fill`] : own.map(variable);
  });
  return ` On ${named.join(', ').replace(/, ([^,]*)$/, ' and $1')}, ${variable('action')} does not read: fill the button with that fill's ${code('on-')} text variable and set its label in the fill's own variable.`;
}

const blocks = (heading, entries) => [`## ${heading}`, ...entries.map(([name, role, text]) => `### ${name}\n**Role:** ${role}\n\n${text}`)].join('\n\n');

function components({ theme }) {
  const fills = (name) => `${stepRange(name, blockSteps(theme, name))} fills, each with its own ${code('on-')} text variable`;
  const fixed = [
    ['Main Action', 'The action the page is for', `Neon ${code('Button')} filled with ${variable('action')}, its label in ${variable('on-action')}.${offActionNote(theme)}`],
    ['Secondary Action', 'An alternative beside the main action', `Neon ${code('Button')} in its ${code('secondary')} variant: ${variable('palette-75')} fill with its label in ${variable('on-palette-75')}. On ${theme.families.includes('support') ? 'an accent or support fill' : 'an accent fill'}, or on a block that already has that fill, the ${code('ghost')} variant: no fill, its label in the fill's ${code('on-')} text variable. Neon has no outlined button.`],
    ['Logo', 'Brand identity', `Neon's logo item, the ${theme.kind === 'dark' ? 'dark-surface' : 'light-surface'} mark. Never recreate the wordmark as text.`],
    ['Tint Block', 'A block in the palette', `${fills('palette')}.`],
    ['Accent Block', 'A block in the accent', `${fills('accent')}.`],
    ...(theme.families.includes('support') ? [['Support Block', 'A block in the support color', `${fills('support')}.`]] : []),
  ];
  return blocks('Components', fixed);
}

// What the occasion's components say, as facts; the page's design decides their look and order.
function occasionContent(brief, prose) {
  return blocks('Occasion content', prose['occasion-components'].components.map(({ name, role, paragraph }) => [name, role, paragraph]));
}

// The stock Do's and Don'ts, keyed on theme facts; the preset bullets follow them.
function stockRules(theme) {
  const tints = blockSteps(theme, 'palette');
  const dos = [
    `Color the whole page from the theme's ${code('--immersive-')} variables.`,
    `Pair every fill with its own ${code('on-')} text variable, and text on the canvas with ${variable('text')}.`,
    'Build emphasis with tint steps, never with opacity.',
    'Keep one color family per block.',
    theme.canvasIsPalette
      ? `Start stepped blocks at ${variable(`palette-${tints[0]}`)}; ${variable('palette-100')} is the canvas.`
      : `Use ${variable('palette-100')} for blocks too: the canvas is not a palette step.`,
  ];
  const donts = [
    "Do not use a gradient outside Neon's Gradient Recipes — each stop is a step of this theme.",
    'Do not write new hex values or near-palette tints — every color is a token step.',
    'Do not let the shared secondary colors lead — keep them to small highlight, tag and illustration blocks.',
    `Do not use ${variable('action')} (${theme.tokens.get('action')}) as a block fill — it is reserved for the main action and its ${variable('on-action')} label.`,
  ];
  return { dos, donts };
}

function dosAndDonts({ theme }, prose) {
  const stock = stockRules(theme);
  const dos = [...stock.dos, ...prose['preset-dos-donts'].dos];
  const donts = [...stock.donts, ...prose['preset-dos-donts'].donts];
  return ["## Do's and Don'ts", '', '### Do', ...dos.map((line) => `- ${line}`), '', "### Don't", ...donts.map((line) => `- ${line}`)].join('\n');
}

function surfaces({ theme }) {
  const row = (level, name, purpose) => [level, theme.tokens.get(name), code(theme.vars.get(name)), variable(name), purpose];
  return ['## Surfaces', '', table(['Level', 'Name', 'Value', 'Token', 'Purpose'], [
    row('1', 'canvas', 'Page background'),
    ...blockSteps(theme, 'palette').map((step, index) => row(String(index + 2), `palette-${step}`, 'Tint block')),
    row('—', `accent-${blockSteps(theme, 'accent')[0]}`, 'Accent block'),
    ...(theme.families.includes('support') ? [row('—', `support-${blockSteps(theme, 'support')[0]}`, 'Support block')] : []),
  ])].join('\n');
}

function brandPattern({ theme, picks }) {
  const { blockColourway: id } = picks.brandPattern;
  const { ground, blocks: drawn } = blockColourway(id);
  const shown = (color) => `${color.split('.')[0]} (${variable(colorVariable(theme, color))})`;
  return [
    '## Brand Pattern',
    '',
    `- **Block Colourway:** ${code(id)}, ${shown(drawn)} blocks on ${shown(ground)}`,
    '',
    'Optional unless the request asks for one. Draw it with the Block engine, never by hand or in CSS, and do not crop, stretch, cover or animate it. A photo inside it fills one whole Block. Its colors are fixed in the file, so a page that switches theme swaps the file. Where it goes and how large it is are the page design\'s.',
  ].join('\n');
}

function promptGuide({ theme, facts, occasion }) {
  const hex = (name) => `${variable(name)} (${code(theme.vars.get(name))})`;
  const reference = [
    `- text: ${hex('text')}`,
    `- background: ${hex('canvas')}`,
    `- tint blocks: ${stepRange('palette', blockSteps(theme, 'palette'))}`,
    `- accent: ${stepRange('accent', blockSteps(theme, 'accent'))}`,
    ...(theme.families.includes('support') ? [`- support: ${stepRange('support', blockSteps(theme, 'support'))}`] : []),
    `- primary action: ${hex('action')}, label ${hex('on-action')}`,
    ...occasion.secondaryHighlights.map((name) => `- highlight: ${stepRange(name, facts.secondary[name] ?? [])}, small blocks only`),
  ];
  return ['## Agent Prompt Guide', '', '**Quick Color Reference**', ...reference].join('\n');
}

function siblings({ theme, facts, texts }) {
  const others = Object.values(facts.themes).filter((other) => other.id !== theme.id);
  return ['## Sibling Themes', '', ...others.map((other) => `- **${other.label}** (${code(other.id)}; ${other.kind}; canvas ${other.tokens.get('canvas')}, ${code(other.vars.get('canvas'))}): ${texts[other.id].sibling.replace(/\s+/g, ' ').trim()}`)].join('\n');
}

function quickStart({ theme, name }) {
  const aliases = theme.own.map((own) => `  --color-${own === 'text' ? 'ink' : own}: var(--immersive-${own});`);
  return [
    '## Quick Start',
    '',
    `Build on the Neon base. Add ${code('@neon/theme')}, ${code('@neon/immersive-themes')} and this brief's item, ${code(`@neon/theme-brief-${name}`)}. ${code('ImmersiveLayout')} is optional: pass it ${code(`immersiveTheme="${theme.id}"`)}, or, on the page's own root, import ${code('@/theme/immersive.css')} and set ${code(`data-immersive-theme="${theme.id}"`)} on that root and on ${code('<html>')}, removed on unmount, and give ${code('Logo')} its ${code('tone')}. Every value comes from the installed CSS; never retype the values above.`,
    '',
    '### Tailwind v4',
    '',
    '```css',
    '@theme inline {',
    '  /* Aliases only; the values stay in the Immersive Themes CSS. */',
    ...aliases,
    '}',
    '```',
  ].join('\n');
}

// Its opening is fixed, so a paragraph after it is found even when the typeface has changed.
export const BRAND_FLOOR_OPENING = "Imagery never carries another brand's";
const brandFloor = (facts) => `${BRAND_FLOOR_OPENING} logo, copy or look, and the Finnomena logo and ${facts.type.typeface} stay on every screen.`;

function imagery({ facts }, prose) {
  return `## Imagery\n\n${prose.imagery.paragraph}\n\n${brandFloor(facts)}`;
}

// Prose of the right shape for a brief, every text set to `text`: for a section no entry has drafted.
export const PLACEHOLDER = '[not drafted]';
export function placeholderProse({ occasion }, text = PLACEHOLDER) {
  return {
    tagline: { tagline: text },
    'mood-occasion': { paragraph: text },
    'occasion-components': { components: occasion.components.map(({ name }) => ({ name, role: text, paragraph: text })) },
    'preset-dos-donts': { dos: occasion.dos.map(() => text), donts: occasion.donts.map(() => text) },
    imagery: { paragraph: text },
  };
}

// Each section's renderer, by heading, in the order SECTIONS gives.
const RENDERERS = {
  'Tokens — Colors': colors, 'Tokens — Typography': typography, Components: components, 'Occasion content': occasionContent,
  "Do's and Don'ts": dosAndDonts, Surfaces: surfaces, Imagery: imagery, 'Brand Pattern': brandPattern,
  'Agent Prompt Guide': promptGuide, 'Sibling Themes': siblings, 'Quick Start': quickStart,
};

// The sections with no prose in them.
export const SCRIPTED_SECTIONS = SECTIONS.filter((heading) => !['Occasion content', "Do's and Don'ts", 'Imagery'].includes(heading));

// The whole brief: the header, then each section in order.
export const renderBrief = (brief, prose) => `${[header(brief, prose), ...SECTIONS.map((heading) => RENDERERS[heading](brief, prose))].join('\n\n')}\n`;

// The brief rewritten from fresh scripted output, keeping the prose read from it: { text } or { problems }.
export function freshBrief(markdown, brief) {
  const { prose, problems } = readProse(markdown, brief);
  return problems ? { problems } : { text: renderBrief(brief, prose) };
}

// A brief's Markdown split at its "## " headings; text before the first is the header.
export function splitSections(markdown) {
  const sections = [{ heading: HEADER, lines: [] }];
  let fence = false;
  for (const line of markdown.split('\n')) {
    if (line.startsWith('```')) fence = !fence;
    if (!fence && line.startsWith('## ')) sections.push({ heading: line.slice(3).trim(), lines: [] });
    sections.at(-1).lines.push(line);
  }
  return sections.map(({ heading, lines }) => ({ heading, text: lines.join('\n').trim() }));
}

const paragraphs = (text) => text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
const body = (text) => text.split('\n').slice(1).join('\n').trim();

// The prose in a brief's Markdown, found by structure, never by matching scripted text, so drifted
// scripted parts do not hide it. Returns { prose } or { problems }.
export function readProse(markdown, brief) {
  const problems = [];
  const sections = new Map(splitSections(markdown).map(({ heading, text }) => [heading, text]));
  const section = (heading) => {
    if (!sections.has(heading)) problems.push(`section "${heading}" is missing, so its prose cannot be read`);
    return sections.get(heading) ?? '';
  };
  for (const heading of sections.keys()) {
    if (heading !== HEADER && !SECTIONS.includes(heading)) problems.push(`section "${heading}" is not a Theme Brief section; move its text into a prose section or remove it`);
  }
  const head = section(HEADER);
  // Title and tagline, labels, status, mood: anything more would be dropped on a rewrite.
  if (paragraphs(head).length > 4) problems.push(`the header has ${paragraphs(head).length} paragraphs; it holds the title and tagline, labels, status and mood paragraph only`);
  const tagline = head.split('\n').find((line) => line.startsWith('> '))?.slice(2);
  if (tagline === undefined) problems.push('the header has no "> " tagline line');
  const mood = paragraphs(head).at(-1)?.split('\n') ?? [];
  if (mood.length < 3) problems.push('the header\'s mood paragraph must keep its three lines: theme half, occasion half, ratio sentence');

  const components = section('Occasion content').split(/^### /m).slice(1)
    .map((block) => block.trim().split('\n'))
    .map(([name, role, ...rest]) => {
      if (!role?.startsWith('**Role:** ')) problems.push(`component "${name.trim()}" has no "**Role:**" line`);
      return { name: name.trim(), role: role?.slice('**Role:** '.length) ?? '', paragraph: rest.join('\n').trim() };
    });

  const rules = section("Do's and Don'ts");
  // Preset bullets are the last in each list. A list longer than the stock and preset bullets together
  // holds a hand-added bullet that a rewrite would drop.
  const stock = stockRules(brief.theme);
  const bullets = (title, stockCount, count) => {
    const list = rules.split(new RegExp(`^### ${title}$`, 'm'))[1]?.split(/^### /m)[0].split('\n').filter((line) => line.startsWith('- ')).map((line) => line.slice(2)) ?? [];
    if (list.length < count) problems.push(`"### ${title}" has ${list.length} bullets; the occasion preset's need the last ${count}`);
    if (list.length > stockCount + count) problems.push(`"### ${title}" has ${list.length} bullets, more than its ${stockCount} stock bullets and the occasion preset's ${count}`);
    return list.slice(list.length - count);
  };
  const dos = bullets('Do', stock.dos.length, brief.occasion.dos.length);
  const donts = bullets("Don't", stock.donts.length, brief.occasion.donts.length);

  const imageryParts = paragraphs(body(section('Imagery')));
  if (imageryParts.length < 2) problems.push('Imagery must keep its prose and the Brand Floor sentence as separate paragraphs');
  else if (imageryParts.slice(0, -1).some((part) => part.startsWith(BRAND_FLOOR_OPENING))) problems.push('Imagery has text after its Brand Floor sentence, which must come last');
  if (problems.length) return { problems };
  return {
    prose: {
      tagline: { tagline },
      'mood-occasion': { paragraph: mood.slice(1, -1).join('\n') },
      'occasion-components': { components },
      'preset-dos-donts': { dos, donts },
      imagery: { paragraph: imageryParts.slice(0, -1).join('\n\n') },
    },
  };
}
