// Scripted renderer for Theme Briefs: a pure function from validated inputs
// and prose to Markdown sections, found by fixed headings, and its inverse,
// which reads the prose back out of a brief. Rendering a brief with the prose
// read from it gives the same text whenever its scripted parts are fresh.
//
// Prose is keyed by prompt library entry, in the shape each entry outputs:
// tagline { tagline }, mood-occasion { paragraph }, occasion-components
// { components: [{ name, role, paragraph }] }, preset-dos-donts { dos, donts },
// imagery { paragraph }, layout { paragraph }, example-prompts { prompts }.

export const SECTIONS = ['Tokens — Colors', 'Tokens — Typography', 'Tokens — Spacing & Shapes', 'Components', "Do's and Don'ts", 'Surfaces', 'Elevation', 'Imagery', 'Brand Pattern', 'Layout', 'Motion', 'Agent Prompt Guide', 'Sibling Themes', 'Quick Start'];
export const HEADER = 'Header';
const FIXED_COMPONENTS = ['Main Action', 'Secondary Action', 'Logo', 'Tint Block', 'Accent Block', 'Support Block'];
const PROMPTS_LABEL = '**Example Component Prompts**';

// Provisional (pending design owner review): Neon has no motion tokens.
const MOTION = {
  still: 'State changes only, such as hover and focus, in 150ms or less. Content is present on load.',
  subtle: 'Fades, or slides of 16px or less, as content enters view, over 150–250ms with ease-out.',
  lively: 'Staggered reveals over 200–400ms as content enters view, with translation of 32px or less. No parallax behind text.',
};

// The brief a picks file describes, from loaded inputs, as { brief }, or { missing } naming the theme texts
// it lacks. Sibling Themes needs every theme's text. Missing presets are left to the compatibility check.
export function assembleBrief(inputs, picks) {
  const { facts, presets, themeTexts } = inputs;
  const texts = Object.fromEntries(themeTexts.map(({ id, data }) => [id, data]));
  const chosen = Object.fromEntries(Object.entries(picks.data?.presets ?? {}).map(([kind, slug]) => [kind, presets[kind]?.[slug]?.data]));
  const theme = facts.themes[picks.data?.theme];
  const missing = Object.keys(facts.themes).filter((id) => !texts[id]).map((id) => `theme-briefs/themes/${id}.json`);
  if (!theme || !chosen.occasion || !chosen.layout || !chosen.imagery) return { missing: [] };
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
    `This is a Finnomena Theme Brief, not a Reference Design: skip Brand Intensity and apply the whole Brand Contract. Colors come from the ${theme.label} Immersive Theme and type from Neon's theme; layout, components, imagery and motion are Finnomena-authored and interpreted, not measured. Provisional pending design owner review.`,
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
  const { typeface, type } = facts.scale;
  return [
    '## Tokens — Typography',
    '',
    `### ${typeface} · ${code('--fontFamily-body')}`,
    `- **Substitute:** none. ${typeface} is part of the Brand Floor.`,
    `- **Weights:** ${[...new Set(type.map(({ weight }) => weight))].sort().join(', ')}`,
    '- **Role:** every text role, Thai and Latin alike.',
    '',
    '### Type Scale',
    '',
    table(['Role', 'Family', 'Weight', 'Size', 'Line Height', 'Token'], type.map(({ role, weight, size, line }) => [role, typeface, weight, size, line, code(`--fontSize-${role}`)])),
  ].join('\n');
}

function spacing({ facts, layout }) {
  const { space, borderRadius, contentMaxWidth, endMargin, wideEndMargin } = facts.scale;
  const valueOf = (name) => [...space, ...borderRadius].find((step) => step.name === name)?.value;
  const shown = (name) => name === 'borderRadius-1000' ? 'fully round' : valueOf(name);
  const step = (name) => `${code(`--${name}`)} (${shown(name)})`;
  const margins = `${endMargin}${wideEndMargin ? `, then ${wideEndMargin.value} from a ${wideEndMargin.from} viewport` : ''}`;
  const column = `Content sits in one centred column at most ${code('--layout-contentMaxWidth')} (${contentMaxWidth}) wide, with ${code('--layout-endMargin')} (${margins}) inside it.`;
  const width = layout.pageWidth === 'contained'
    ? `contained. ${column} Section fills stop at that column, inside the end margins, with the block radius.`
    : `full-bleed. ${column} Section fills span the viewport.`;
  return [
    '## Tokens — Spacing & Shapes',
    '',
    `**Base unit:** ${step('space-1')}`,
    '',
    '### Spacing Scale',
    '',
    table(['Name', 'Value', 'Token'], space.map(({ name, value }) => [name.slice('space-'.length).replace('_', '.'), value, code(`--${name}`)])),
    '',
    '### Border Radius',
    '',
    table(['Name', 'Value', 'Token'], borderRadius.map(({ name }) => [name.slice('borderRadius-'.length), shown(name), code(`--${name}`)])),
    '',
    '### Layout',
    '',
    table(['Name', 'Value', 'Token'], [
      ['Content max width', contentMaxWidth, code('--layout-contentMaxWidth')],
      ['End margin', endMargin, code('--layout-endMargin')],
      ...(wideEndMargin ? [[`End margin from a ${wideEndMargin.from} viewport`, wideEndMargin.value, code('--layout-endMargin')]] : []),
    ]),
    '',
    '### Picks',
    '',
    `- **Density:** ${layout.density}`,
    `- **Block and card radius:** ${step(layout.blockRadius)}`,
    `- **Section gap:** ${step(layout.sectionGap)}`,
    `- **Card padding:** ${step(layout.cardPadding)}`,
    `- **Page width:** ${width}`,
  ].join('\n');
}

// Steps of a family that may fill a block: every step but the canvas.
const blockSteps = (theme, name) => descending(theme.steps[name]).filter((step) => theme.steps[name][step].bg !== theme.canvas);
const stepRange = (name, steps) => steps.length === 1 ? variable(`${name}-${steps[0]}`) : `${variable(`${name}-${steps[0]}`)} to ${variable(`${name}-${steps.at(-1)}`)}`;

function components({ theme }, prose) {
  const fills = (name) => `${stepRange(name, blockSteps(theme, name))} fills, each with its own ${code('on-')} text variable`;
  const fixed = [
    ['Main Action', 'The main action of a section', `Neon ${code('Button')} filled with ${variable('action')}, its label in ${variable('on-action')}, with ${code('--borderRadius-1000')} corners.`],
    ['Secondary Action', 'An alternative beside the main action', `Neon ${code('Button')} with no fill, its label and outline in ${variable('text')} on the canvas. On a filled block, label and outline take that block's ${code('on-')} text variable.`],
    ['Logo', 'Brand identity', `Neon's logo item, the ${theme.kind === 'dark' ? 'dark-surface' : 'light-surface'} mark. Never recreate the wordmark as text.`],
    ['Tint Block', 'Group a section or a set of details', `${fills('palette')}. Flat: no border and no shadow; step lighter for nested emphasis.`],
    ['Accent Block', 'Highlight an offer or call-out', `${fills('accent')}. Flat, like the Tint Block.`],
    ...(theme.families.includes('support') ? [['Support Block', 'Detail and reference content', `${fills('support')}, for detail lists and secondary information.`]] : []),
  ];
  const entries = [...fixed, ...prose['occasion-components'].components.map(({ name, role, paragraph }) => [name, role, paragraph])];
  return ['## Components', ...entries.map(([name, role, body]) => `### ${name}\n**Role:** ${role}\n\n${body}`)].join('\n\n');
}

function dosAndDonts({ theme }, prose) {
  const tints = blockSteps(theme, 'palette');
  const dos = [
    `Set ${code(`data-immersive-theme="${theme.id}"`)} on the page root and color every section from the theme's ${code('--immersive-')} variables.`,
    `Pair every fill with its own ${code('on-')} text variable, and text on the canvas with ${variable('text')}.`,
    'Build emphasis with tint steps, never with opacity.',
    'Keep one color family per block.',
    theme.canvasIsPalette
      ? `Start stepped blocks at ${variable(`palette-${tints[0]}`)}; ${variable('palette-100')} is the canvas.`
      : `Use ${variable('palette-100')} for blocks too: the canvas is not a palette step.`,
    ...prose['preset-dos-donts'].dos,
  ];
  const donts = [
    'Do not use gradients — Immersive Themes have none.',
    'Do not write new hex values or near-palette tints — every color is a token step.',
    'Do not let the shared secondary colors lead — keep them to small highlight, tag and illustration blocks.',
    `Do not use ${variable('action')} (${theme.tokens.get('action')}) as a block fill — it is reserved for the main action and its ${variable('on-action')} label.`,
    ...prose['preset-dos-donts'].donts,
  ];
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

function brandPattern({ theme, picks, layout }) {
  const { colourway, ground } = picks.brandPattern;
  const label = theme.familyLabels[colourway];
  const onCanvas = theme.steps[colourway][ground].bg === theme.canvas;
  return [
    '## Brand Pattern',
    '',
    `- **Section:** ${layout.brandPattern.section}`,
    `- **Colourway:** ${label} (${code(colourway)})`,
    `- **Ground:** ${variable(`${colourway}-${ground}`)} fill with ${variable(`on-${colourway}-${ground}`)} text${onCanvas ? ', the canvas itself' : ''}`,
    '',
    `The ${layout.brandPattern.section} section carries the Brand Pattern on its ground, and the Pattern keeps to the ${label} family. Block's Brand Pattern procedure makes it as a static SVG: never hand-draw it, imitate it in CSS or animate it.`,
  ].join('\n');
}

function motion({ layout }) {
  return ['## Motion', '', `**Level:** ${layout.motion}`, '', MOTION[layout.motion], '', `Under ${code('prefers-reduced-motion: reduce')}, use the still level. Nothing animates the Brand Pattern. The motion values are provisional pending design owner review.`].join('\n');
}

function promptGuide({ theme, facts, occasion }, prose) {
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
  return ['## Agent Prompt Guide', '', '**Quick Color Reference**', ...reference, '', PROMPTS_LABEL, '', prose['example-prompts'].prompts.map((line, index) => `${index + 1}. ${line}`).join('\n\n')].join('\n');
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
    `Build on the Neon base. Add ${code('@neon/theme')}, the Immersive Themes item and this brief's item, ${code(`@neon/theme-brief-${name}`)}, then set ${code(`data-immersive-theme="${theme.id}"`)} on the page root. Every value comes from the installed CSS; never retype the values above.`,
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

// The brief's sections in order, each { heading, text }; the header comes first, under HEADER.
export function renderSections(brief, prose) {
  const parts = [colors, typography, spacing, components, dosAndDonts, surfaces, elevation, imagery, brandPattern, layoutSection, motion, promptGuide, siblings, quickStart];
  return [{ heading: HEADER, text: header(brief, prose) }, ...parts.map((part, index) => ({ heading: SECTIONS[index], text: part(brief, prose) }))];
}

function elevation() {
  return '## Elevation\n\n- **None.** The tokens define no shadow. Separate surfaces with tint steps, not shadows or borders.';
}

function imagery({ facts }, prose) {
  return `## Imagery\n\n${prose.imagery.paragraph}\n\nImagery never carries another brand's logo, copy or look, and the Finnomena logo and ${facts.scale.typeface} stay on every screen.`;
}

function layoutSection(brief, prose) {
  return `## Layout\n\n${prose.layout.paragraph}`;
}

export const joinSections = (sections) => `${sections.map(({ text }) => text).join('\n\n')}\n`;
export const renderBrief = (brief, prose) => joinSections(renderSections(brief, prose));

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
  const head = section(HEADER);
  const tagline = head.split('\n').find((line) => line.startsWith('> '))?.slice(2);
  if (tagline === undefined) problems.push('the header has no "> " tagline line');
  const mood = paragraphs(head).at(-1)?.split('\n') ?? [];
  if (mood.length < 3) problems.push('the header\'s mood paragraph must keep its three lines: theme half, occasion half, ratio sentence');

  const components = section('Components').split(/^### /m).slice(1)
    .map((block) => block.trim().split('\n'))
    .filter(([name]) => !FIXED_COMPONENTS.includes(name.trim()))
    .map(([name, role, ...rest]) => {
      if (!role?.startsWith('**Role:** ')) problems.push(`component "${name.trim()}" has no "**Role:**" line`);
      return { name: name.trim(), role: role?.slice('**Role:** '.length) ?? '', paragraph: rest.join('\n').trim() };
    });

  const rules = section("Do's and Don'ts");
  const bullets = (title, count, side) => {
    const list = rules.split(new RegExp(`^### ${title}$`, 'm'))[1]?.split(/^### /m)[0].split('\n').filter((line) => line.startsWith('- ')).map((line) => line.slice(2)) ?? [];
    if (list.length < count) problems.push(`"### ${title}" has ${list.length} bullets; the ${side} need the last ${count}`);
    return list.slice(list.length - count);
  };
  const dos = bullets('Do', brief.occasion.dos.length, 'occasion preset\'s dos');
  const donts = bullets("Don't", brief.occasion.donts.length, 'occasion preset\'s don\'ts');

  const imageryParts = paragraphs(body(section('Imagery')));
  if (imageryParts.length < 2) problems.push('Imagery must keep its prose and the Brand Floor sentence as separate paragraphs');
  const layout = body(section('Layout'));
  const guide = section('Agent Prompt Guide').split(PROMPTS_LABEL);
  if (guide.length < 2) problems.push(`Agent Prompt Guide has no ${PROMPTS_LABEL} label`);
  const prompts = (guide[1] ?? '').trim().split(/\n\s*\n(?=\d+\. )/).filter(Boolean).map((item) => item.replace(/^\d+\. /, ''));

  if (problems.length) return { problems };
  return {
    prose: {
      tagline: { tagline },
      'mood-occasion': { paragraph: mood.slice(1, -1).join('\n') },
      'occasion-components': { components },
      'preset-dos-donts': { dos, donts },
      imagery: { paragraph: imageryParts.slice(0, -1).join('\n\n') },
      layout: { paragraph: layout },
      'example-prompts': { prompts },
    },
  };
}
