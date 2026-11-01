#!/usr/bin/env node
// PROTOTYPE for finnonemo/neon#84: throwaway, never merged. It answers "do preset
// combinations give distinct, on-theme Theme Briefs?" with a rough version of the
// tool the map decided (scripted sections, closed preset schemas, seven prompt
// library entries run through `claude -p` under checks, at most 3 attempts each).
//
//   node theme-briefs/PROTOTYPE-84/build.mjs picks/club-run.json...   draft briefs into out/
//   node theme-briefs/PROTOTYPE-84/build.mjs --check-only <picks>...  schema and compatibility only
//   node theme-briefs/PROTOTYPE-84/build.mjs --scripted-only <picks>... re-render scripted sections from
//                                                                      the record's prose and diff
// Raw model output and review.md go to .local/theme-briefs-84/<brief>/ (untracked).
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { contrast } from '../../scripts/lib/colors.mjs';

const here = import.meta.dirname;
const root = resolve(here, '../..');
const RAW = join(root, '.local/theme-briefs-84');
const MODEL = process.env.PROTO_MODEL ?? 'claude-opus-5-5';
// Model calls run from an empty directory outside the repo, so no project instructions load.
const CALL_DIR = mkdtempSync(join(tmpdir(), 'theme-brief-84-'));
const read = (path) => readFileSync(path, 'utf8');
const json = (path) => JSON.parse(read(path));
const hash = (text) => createHash('sha256').update(text).digest('hex').slice(0, 12);
const words = (text) => text.trim().split(/\s+/).filter(Boolean).length;

// ---------- theme sources ----------
const themeData = json(join(root, 'theme/immersive-themes.json'));
const themesOf = themeData.themes ?? Object.fromEntries(Object.entries(themeData).filter(([key]) => !['secondary', '$comment'].includes(key)));
const THEME_IDS = Object.keys(themesOf);

function parseImmersiveCss() {
  const css = read(join(root, 'theme/css/immersive-themes.css'));
  const blocks = {};
  for (const [, theme, body] of css.matchAll(/\[data-immersive-theme(?:="(\w+)")?\]\s*\{([^}]*)\}/g)) {
    const vars = [];
    for (const [, name, hex, token] of body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});\s*\/\*\s*([^*]+?)\s*\*\//gi)) vars.push({ name: name.replace(/^immersive-/, ''), hex: hex.toLowerCase(), token });
    blocks[theme ?? 'secondary'] = vars;
  }
  return blocks;
}
const CSS = parseImmersiveCss();

function parseThemeCss() {
  const css = read(join(root, 'theme/css/theme.css'));
  const vars = {};
  for (const [, name, value] of css.matchAll(/--((?:fontSize|lineHeight|fontWeight|fontFamily|space|borderRadius)-[\w]+):\s*([^;]+);/g)) vars[name] ??= value.trim();
  return vars;
}
const BASE = parseThemeCss();
const px = (value) => value.endsWith('rem') ? `${parseFloat(value) * 16}px` : value;
const TYPE_ROLES = ['display1', 'display2', 'display3', 'title1', 'title2', 'title3', 'title4', 'headline', 'body', 'label1', 'label2', 'caption', 'legal']
  .map((role) => ({ role, size: px(BASE[`fontSize-${role}`]), line: px(BASE[`lineHeight-${role}`]), weight: BASE[`fontWeight-${role}`] }));
const SPACE = Object.keys(BASE).filter((key) => key.startsWith('space-')).map((key) => ({ name: key, value: BASE[key] }));
const RADIUS = Object.keys(BASE).filter((key) => key.startsWith('borderRadius-')).map((key) => ({ name: key, value: BASE[key] }));
const STEP_NAMES = new Set([...SPACE, ...RADIUS].map((step) => step.name));

function themeFacts(id) {
  const theme = themesOf[id];
  const vars = CSS[id];
  const hexOf = (name) => vars.find((v) => v.name === name)?.hex;
  const families = ['palette', 'accent', 'support'].filter((family) => theme[family]);
  const kind = theme.text.startsWith('White') ? 'dark' : 'light';
  const canvasIsPalette = theme.palette['100'].bg === theme.canvas;
  const familyLabel = (family) => theme[family]['100'].bg.split('.')[0];
  const text = json(join(here, 'themes', `${id}.json`));
  return { id, theme, vars, hexOf, families, kind, canvasIsPalette, familyLabel, text, label: theme.label };
}

// ---------- presets: closed schemas and compatibility ----------
const ROLES = ['hero', 'proof', 'detail-list', 'call-out', 'form', 'footer'];
const SCHEMA = {
  occasion: { kind: 'string', slug: 'string', taglineIntent: 'string', moodIntent: 'string', components: 'array', dos: 'array', donts: 'array', promptInputs: 'array', secondaryHighlights: 'array' },
  component: { name: 'string', role: 'string', contentNotes: 'string', roles: 'array' },
  layout: { kind: 'string', slug: 'string', sections: 'array', heroPattern: 'string', navigation: 'string', footer: 'string', density: 'string', blockRadius: 'string', sectionGap: 'string', cardPadding: 'string', pageWidth: 'string', motion: 'string', brandPattern: 'object' },
  imagery: { kind: 'string', slug: 'string', leads: 'string', framing: 'string', subject: 'string', illustration: 'string', density: 'string' },
  picks: { theme: 'string', briefName: 'string', presets: 'object', brandPattern: 'object' },
};
function closed(object, schema, where, problems) {
  for (const key of Object.keys(object)) if (!(key in schema)) problems.push(`${where}: unknown key "${key}"`);
  for (const [key, type] of Object.entries(schema)) {
    const actual = Array.isArray(object[key]) ? 'array' : typeof object[key];
    if (actual !== type) problems.push(`${where}: "${key}" must be ${type}, is ${actual}`);
  }
}
function scan(value, where, problems) {
  if (typeof value === 'string') {
    if (/#[0-9a-f]{3,8}\b/i.test(value)) problems.push(`${where}: hex-like value "${value}"`);
    if (/\b\d+(\.\d+)?px\b/.test(value)) problems.push(`${where}: px value "${value}"`);
  } else if (value && typeof value === 'object') {
    for (const [key, inner] of Object.entries(value)) {
      if (/font/i.test(key)) problems.push(`${where}: font field "${key}"`);
      scan(inner, `${where}.${key}`, problems);
    }
  }
}
function loadBrief(picksPath) {
  const problems = [];
  const picks = json(picksPath);
  closed(picks, SCHEMA.picks, 'picks', problems);
  scan(picks, 'picks', problems);
  if (!THEME_IDS.includes(picks.theme)) return { problems: [...problems, `picks: unknown theme "${picks.theme}"`] };
  const facts = themeFacts(picks.theme);
  const preset = (kind) => json(join(here, 'presets', kind, `${picks.presets[kind]}.json`));
  const occasion = preset('occasion'), layout = preset('layout'), imagery = preset('imagery');
  for (const [kind, data] of [['occasion', occasion], ['layout', layout], ['imagery', imagery]]) {
    closed(data, SCHEMA[kind], kind, problems);
    scan(data, kind, problems);
    if (data.kind !== kind) problems.push(`${kind}: kind is "${data.kind}"`);
  }
  occasion.components.forEach((component, index) => {
    closed(component, SCHEMA.component, `occasion.components[${index}]`, problems);
    // Compatibility is computed from capability: every role named must exist on the theme.
    for (const role of component.roles) if (!['action', ...facts.families].includes(role)) problems.push(`occasion.components[${index}]: role "${role}" does not exist on ${facts.label}`);
  });
  if (occasion.components.length < 2 || occasion.components.length > 6) problems.push('occasion: 2–6 components');
  for (const family of occasion.secondaryHighlights) if (!['green', 'blue', 'purple', 'red', 'orange'].includes(family)) problems.push(`occasion: unknown secondary "${family}"`);
  for (const section of layout.sections) if (!ROLES.includes(section)) problems.push(`layout: unknown section role "${section}"`);
  for (const key of ['blockRadius', 'sectionGap', 'cardPadding']) if (!STEP_NAMES.has(layout[key])) problems.push(`layout: ${key} "${layout[key]}" is not a scale step`);
  if (!['compact', 'comfortable', 'spacious'].includes(layout.density)) problems.push('layout: density');
  if (!['contained', 'full-bleed'].includes(layout.pageWidth)) problems.push('layout: pageWidth');
  if (!['still', 'subtle', 'lively'].includes(layout.motion)) problems.push('layout: motion');
  if (!layout.sections.includes(layout.brandPattern.section)) problems.push(`layout: Brand Pattern section "${layout.brandPattern.section}" is not one of its sections`);
  const { colourway, ground } = picks.brandPattern;
  if (!facts.families.includes(colourway)) problems.push(`picks: colourway "${colourway}" is not one of ${facts.label}'s families (${facts.families.join(', ')})`);
  else if (!facts.theme[colourway][String(ground)]) problems.push(`picks: ground ${ground} is not a step of ${colourway}`);
  const slug = picks.briefName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return { problems, picks, facts, occasion, layout, imagery, slug, name: `${picks.theme}-${slug}` };
}

// ---------- scripted sections ----------
const MOTION = {
  still: 'No motion. Content is present on load; hover and focus change color or outline only, with no transition.',
  subtle: 'Each section fades in and rises a short way once, as it first enters view, over 200–300ms with ease-out. Hover and focus transitions take 150ms. Nothing loops, autoplays or moves on its own.',
  lively: 'Sections enter with a fade and rise as they reach view, staggered by 60–80ms across cards in one row, over 300–400ms. One looping accent is allowed per page, such as a slowly drifting Brand Pattern. Nothing moves faster than the eye can follow.',
};
const rows = (header, body) => [`| ${header.join(' | ')} |`, `|${header.map(() => '---').join('|')}|`, ...body.map((row) => `| ${row.join(' | ')} |`)].join('\n');
const nice = (token) => token.replace('.', ' ');
const fg = (facts, name) => facts.vars.find((v) => v.name === `on-${name}`);

function render(brief, prose) {
  const { facts, occasion, layout, imagery, picks } = brief;
  const t = facts.theme;
  const v = (name) => facts.vars.find((entry) => entry.name === name);
  const ratio = `Membership ratio: ${Object.entries(t.ratio).map(([family, share]) => `${family} ${share}`).join(' / ')}.`;
  const sections = [];
  sections.push(['Header', [
    `# Finnomena ${facts.label} · ${picks.briefName} — Theme Brief`,
    `> ${prose.tagline.tagline}`,
    '',
    `**Theme:** ${facts.kind}`,
    `**Immersive Theme:** ${facts.id}`,
    '',
    `This is a Finnomena Theme Brief, not a Reference Design. Finnomena wrote it for one Campaign Page in the ${facts.label} Immersive Theme. Colors and type come from the installed Neon theme and Immersive Themes CSS: the values below are for reading, never for retyping. Provisional pending design owner review.`,
    '',
    `${facts.text.mood} ${prose['mood-occasion'].paragraph} ${ratio}`,
  ].join('\n')]);

  const roleText = (name) => {
    if (name === 'canvas') return 'Page background; the largest share of the page';
    if (name === 'text') return 'Body and heading text on the canvas';
    if (name === 'action') return `Main action fill; label ${nice(v('on-action').token)}`;
    if (name === 'on-action') return 'Main action label';
    const [family] = name.split('-');
    const label = nice(fg(facts, name).token);
    return { palette: `Theme tint block; text ${label}`, accent: `Accent block, highlight or offer; text ${label}`, support: `Support block for detail; text ${label}` }[family];
  };
  const colorRows = facts.vars.filter((entry) => !entry.name.startsWith('on-') || entry.name === 'on-action')
    .map((entry) => [nice(entry.token), `\`${entry.hex}\``, `\`--immersive-${entry.name}\``, roleText(entry.name)]);
  const secondary = ['green', 'blue', 'purple', 'red', 'orange'].map((family) => [
    `${family[0].toUpperCase()}${family.slice(1)} (\`--immersive-${family}-*\`)`,
    ...['100', '75', '50', '25'].map((step) => `\`${CSS.secondary.find((entry) => entry.name === `${family}-${step}`).hex}\``),
    [...new Set(['100', '75', '50', '25'].map((step) => nice(CSS.secondary.find((entry) => entry.name === `on-${family}-${step}`).token).split(' ')[0]))].join(' or '),
  ]);
  sections.push(['Tokens — Colors', `## Tokens — Colors\n\n${rows(['Name', 'Value', 'Token', 'Role'], colorRows)}\n\n**Shared secondary colors** (every theme; small highlight, tag and illustration blocks only):\n\n${rows(['Family', '100', '75', '50', '25', 'Text'], secondary)}`]);

  sections.push(['Tokens — Typography', `## Tokens — Typography\n\n### IBM Plex Sans Thai · \`--fontFamily-body\`\n- **Substitute:** none. IBM Plex Sans Thai is part of the Brand Floor; \`sans-serif\` is only the CSS fallback.\n- **Weights:** ${[...new Set(TYPE_ROLES.map((r) => r.weight))].sort().join(', ')}\n- **Role:** every text role, Thai and Latin alike.\n\n### Type Scale\n\n${rows(['Role', 'Family', 'Weight', 'Size', 'Line Height', 'Token'], TYPE_ROLES.map((r) => [r.role, 'IBM Plex Sans Thai', r.weight, r.size, r.line, `\`--fontSize-${r.role}\``]))}`]);

  const step = (name) => `\`--${name}\` (${BASE[name]})`;
  sections.push(['Tokens — Spacing & Shapes', `## Tokens — Spacing & Shapes\n\n**Base unit:** 8px\n\n**Density:** ${layout.density}\n\n### Spacing Scale\n\n${rows(['Name', 'Value', 'Token'], SPACE.map((s) => [s.name.replace('space-', '').replace('_', '.'), s.value, `\`--${s.name}\``]))}\n\n### Border Radius\n\n${rows(['Name', 'Value', 'Token'], RADIUS.map((r) => [r.name.replace('borderRadius-', ''), r.name === 'borderRadius-1000' ? 'fully round' : r.value, `\`--${r.name}\``]))}\n\n### Picks\n\n- **Block and card radius:** ${step(layout.blockRadius)}\n- **Section gap:** ${step(layout.sectionGap)}\n- **Card padding:** ${step(layout.cardPadding)}\n- **Element gap:** ${step('space-1')}–${step('space-2')}\n- **Page width:** ${layout.pageWidth === 'contained' ? 'contained, held to the `Viewport max-width` breakpoint token' : 'full-bleed: section fills run edge to edge, content keeps its own column'}`]);

  const actionRatio = contrast(v('action').hex, v('on-action').hex).toFixed(2);
  const firstTint = facts.canvasIsPalette ? '75' : '100';
  const fixed = [
    ['Main Action', 'The one primary action per section', `Neon \`Button\` on \`--immersive-action\` with an \`--immersive-on-action\` label (${actionRatio}:1), headline type role, \`--borderRadius-1000\` corners, 48px high with \`--space-4\` side padding.`],
    ['Secondary Action', 'An alternative beside the main action', `Transparent fill with \`--immersive-text\` label and a 2px \`--immersive-text\` outline, the same height and radius as the Main Action.`],
    ['Logo', 'Brand identity', `Neon's logo item, the ${facts.kind === 'dark' ? 'dark-surface' : 'light-surface'} mark. Never recreate the wordmark as text.`],
    ['Tint Block', 'Group a section or a set of details', `\`--immersive-palette-${firstTint}\` to \`--immersive-palette-25\` fills, each with its own \`--immersive-on-palette-*\` text. Flat: no border, no shadow; step lighter for nested emphasis.`],
    ['Accent Block', 'The highlighted offer or call-out', `\`--immersive-accent-100\` fill with \`--immersive-on-accent-100\` text. One per screen; lighter accent steps hold supporting copy.`],
    ...(facts.families.includes('support') ? [['Support Block', 'Detail and reference content', `\`--immersive-support-100\` to \`--immersive-support-25\` fills with their \`--immersive-on-support-*\` text, for detail lists and secondary information.`]] : []),
  ];
  const componentText = [...fixed.map(([name, role, body]) => `### ${name}\n**Role:** ${role}\n\n${body}`),
    ...prose['occasion-components'].components.map((c) => `### ${c.name}\n**Role:** ${c.role}\n\n${c.paragraph}`)].join('\n\n');
  sections.push(['Components', `## Components\n\n${componentText}`]);

  const dos = [
    `Set \`data-immersive-theme="${facts.id}"\` on the page root and color every section from its \`--immersive-*\` properties.`,
    'Pair every fill with its own `--immersive-on-*` text color.',
    'Build emphasis with tint steps, never with opacity.',
    'Keep one color family per background block.',
    facts.canvasIsPalette ? 'Start stepped blocks at `--immersive-palette-75`; `--immersive-palette-100` is the canvas.' : 'Treat the canvas as its own color: it is not a palette step, so blocks may use `--immersive-palette-100`.',
    ...prose['preset-dos-donts'].dos,
  ];
  const donts = [
    'Do not use gradients — Immersive Themes have none.',
    'Do not write new hex values or near-palette tints — every color is a token step.',
    'Do not let the shared secondary colors lead — keep them to small tags and illustration blocks.',
    `Do not use \`--immersive-action\` (${nice(v('action').token)}) as a block fill — it is reserved for the main action and its \`--immersive-on-action\` label.`,
    ...prose['preset-dos-donts'].donts,
  ];
  sections.push(["Do's and Don'ts", `## Do's and Don'ts\n\n### Do\n${dos.map((d) => `- ${d}`).join('\n')}\n\n### Don't\n${donts.map((d) => `- ${d}`).join('\n')}`]);

  const surfaces = [['1', 'Canvas', `\`${v('canvas').hex}\``, 'Page background'],
    ...['100', '75', '50', '25'].filter((s) => !(facts.canvasIsPalette && s === '100')).map((s, i) => [`${i + 2}`, nice(v(`palette-${s}`).token), `\`${v(`palette-${s}`).hex}\``, 'Tint block']),
    ['—', nice(v('accent-100').token), `\`${v('accent-100').hex}\``, 'Accent block']];
  sections.push(['Surfaces', `## Surfaces\n\n${rows(['Level', 'Name', 'Value', 'Purpose'], surfaces)}`]);
  sections.push(['Elevation', '## Elevation\n\n- **None.** The tokens define no shadow. Separate surfaces with tint steps, not shadows or borders.']);
  sections.push(['Imagery', `## Imagery\n\n${prose.imagery.paragraph} Imagery never carries another brand's logo, copy or look, and IBM Plex Sans Thai and the Finnomena logo stay on every screen.`]);

  const { colourway, ground } = picks.brandPattern;
  const onCanvas = colourway === 'palette' && String(ground) === '100' && facts.canvasIsPalette;
  sections.push(['Brand Pattern', `## Brand Pattern\n\n- **Section:** ${layout.brandPattern.section}\n- **Colourway:** ${facts.familyLabel(colourway)} (\`${colourway}\`)\n- **Ground:** \`--immersive-${colourway}-${ground}\` with \`--immersive-on-${colourway}-${ground}\` text${onCanvas ? ' (the canvas itself)' : ''}\n\nThe ${layout.brandPattern.section} section carries the Brand Pattern. Its fill is the ground step, and the pattern's tones are other steps of the ${facts.familyLabel(colourway)} family only. The pattern comes from Finnomena's Block pattern generator with a locked seed and is committed as SVG; copy sits in its Text zone. Never crop, stretch, recolor, fade or hand-draw it, and never imitate it in CSS.`]);
  sections.push(['Layout', `## Layout\n\n${prose.layout.paragraph}`]);
  sections.push(['Motion', `## Motion\n\n**Level:** ${layout.motion}\n\n${MOTION[layout.motion]} Under \`prefers-reduced-motion: reduce\`, use the still level.`]);

  const qcr = [
    `- text: \`--immersive-text\``,
    `- background: \`--immersive-canvas\`; tint blocks \`--immersive-palette-${firstTint}\`…\`-25\``,
    `- accent: \`--immersive-accent-100\``,
    ...(facts.families.includes('support') ? ['- support: `--immersive-support-100`…`-25`'] : []),
    `- primary action: \`--immersive-action\`, label \`--immersive-on-action\``,
    `- highlight: ${occasion.secondaryHighlights.map((f) => `\`--immersive-${f}-*\``).join(', ')}, small blocks only`,
  ];
  sections.push(['Agent Prompt Guide', `## Agent Prompt Guide\n\n**Quick Color Reference**\n${qcr.join('\n')}\n\n**Example Component Prompts**\n\n${prose['example-prompts'].prompts.map((p, i) => `${i + 1}. ${p}`).join('\n\n')}`]);

  const siblings = THEME_IDS.filter((id) => id !== facts.id).map((id) => { const s = themeFacts(id); return `- **${s.label}** (${s.kind}, canvas \`${s.hexOf('canvas')}\`) — ${s.text.sibling}`; });
  sections.push(['Sibling Themes', `## Sibling Themes\n\n${siblings.join('\n')}`]);

  const aliases = facts.vars.map((entry) => `  --color-${entry.name === 'text' ? 'ink' : entry.name}: var(--immersive-${entry.name});`);
  sections.push(['Quick Start', `## Quick Start\n\nStart from the Neon base (\`shadcn init\` with Neon's \`neon-base\` item), add \`@neon/theme\`, the Immersive Themes item and this brief's item, then set \`data-immersive-theme="${facts.id}"\` on the page root. Never retype the values above.\n\n### Tailwind v4\n\n\`\`\`css\n@theme inline {\n  /* Aliases only; the values stay in the generated Immersive Themes CSS */\n${aliases.join('\n')}\n}\n\`\`\``]);
  return sections;
}
const SCRIPTED = new Set(['Tokens — Colors', 'Tokens — Typography', 'Tokens — Spacing & Shapes', 'Surfaces', 'Elevation', 'Brand Pattern', 'Motion', 'Sibling Themes', 'Quick Start']);
const markdown = (sections) => `${sections.map(([, text]) => text).join('\n\n')}\n`;

// ---------- prompt library ----------
const ENTRIES = ['tagline', 'mood-occasion', 'occasion-components', 'imagery', 'preset-dos-donts', 'layout', 'example-prompts'];
const library = Object.fromEntries(ENTRIES.map((entry) => [entry, json(join(here, 'prompt-library', `${entry}.json`))]));
const shared = read(join(here, 'prompt-library/shared.json'));

function allowedVars(facts) {
  return new Set([...facts.vars.map((e) => `immersive-${e.name}`), ...CSS.secondary.map((e) => `immersive-${e.name}`), ...Object.keys(BASE)]);
}
function resolveInputs(brief, entry, done) {
  const { facts, occasion, layout, imagery, picks } = brief;
  const { kind: _k, slug: _s, ...layoutFields } = layout;
  const { kind: _ik, slug: _is, ...imageryFields } = imagery;
  const source = {
    'occasion.taglineIntent': occasion.taglineIntent, 'occasion.moodIntent': occasion.moodIntent,
    'occasion.components': occasion.components.map(({ name, role, contentNotes, roles }) => ({ name, role, contentNotes, themeRolesUsed: roles })),
    'occasion.dos': occasion.dos, 'occasion.donts': occasion.donts, 'occasion.promptInputs': occasion.promptInputs,
    'theme.mood': facts.text.mood, 'theme.sibling': facts.text.sibling, 'theme.kind': facts.kind, 'theme.id': facts.id,
    'brief.name': picks.briefName,
    colorRoles: ['canvas', 'text', 'palette (tint blocks)', 'accent', ...(facts.families.includes('support') ? ['support'] : []), 'action'],
    colorVars: [...facts.vars.map((e) => `var(--immersive-${e.name})`), ...occasion.secondaryHighlights.flatMap((f) => ['100', '75', '50', '25'].flatMap((s) => [`var(--immersive-${f}-${s})`, `var(--immersive-on-${f}-${s})`]))],
    typeRoles: TYPE_ROLES.map((r) => `${r.role} (${r.size}/${r.line}, weight ${r.weight})`),
    layout: layoutFields, 'layout.blockRadius': `var(--${layout.blockRadius})`, 'layout.cardPadding': `var(--${layout.cardPadding})`, 'layout.sectionGap': `var(--${layout.sectionGap})`, 'layout.density': layout.density, 'layout.sections': layout.sections,
    imagery: imageryFields, canvasRole: 'the canvas', 'brandPattern.section': layout.brandPattern.section,
    components: done['occasion-components']?.components, 'components.names': done['occasion-components']?.components.map((c) => c.name),
  };
  return Object.fromEntries(library[entry].inputs.map((key) => [key, source[key]]));
}

function targetsFor(brief, entry) {
  const targets = { ...library[entry].targets };
  if (entry === 'mood-occasion') {
    // The whole mood paragraph lands in 110–132 words, so this half gets what the theme half and ratio leave.
    const fixedWords = words(brief.facts.text.mood) + words(`Membership ratio: ${Object.entries(brief.facts.theme.ratio).map(([f, s]) => `${f} ${s}`).join(' / ')}.`);
    targets.words = [110 - fixedWords, 132 - fixedWords];
  }
  return targets;
}

function prompt(brief, entry, inputs, feedback) {
  const e = library[entry];
  return [
    `Entry: ${entry}. It fills: ${e.fills}.`,
    `Formula, slots in order:\n${e.formula.map((s) => `- ${s}`).join('\n')}`,
    `Targets: ${JSON.stringify(targetsFor(brief, entry))} (words are counted per item where items exist).`,
    `Rules:\n${e.rules.map((r) => `- ${r}`).join('\n')}`,
    `Example, with invented placeholders (copy its shape, never its wording):\n${JSON.stringify(e.example)}`,
    `Inputs:\n${JSON.stringify(inputs, null, 2)}`,
    ...(feedback.length ? [`Your previous answer failed these checks; fix them:\n${feedback.map((f) => `- ${f}`).join('\n')}`] : []),
  ].join('\n\n');
}

function callClaude(system, user, schema, cwd) {
  const args = ['-p', '--model', MODEL, '--effort', 'high', '--tools', '', '--strict-mcp-config', '--setting-sources', 'project,local',
    '--no-session-persistence', '--system-prompt', system, '--output-format', 'json', '--json-schema', JSON.stringify(schema), user];
  return new Promise((resolveCall, reject) => {
    const child = spawn('claude', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('exit', (code) => {
      try {
        const result = JSON.parse(out);
        resolveCall({ raw: result, answer: result.structured_output ?? JSON.parse(result.result) });
      } catch (error) { reject(new Error(`claude exited ${code}: ${err || out.slice(0, 500)}`)); }
    });
  });
}

const textOf = (answer) => JSON.stringify(answer).replace(/\\"/g, '"');
const strings = (value) => typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(strings) : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];

function checks(brief, entry, answer, tablesPx) {
  const hard = [], soft = [];
  const { facts, occasion, layout } = brief;
  const all = strings(answer).join('\n');
  if (/#[0-9a-f]{3,8}\b/i.test(all)) hard.push('hex value present');
  const allowed = allowedVars(facts);
  for (const [, name] of all.matchAll(/var\(--([\w-]+)\)/g)) if (!allowed.has(name)) hard.push(`var(--${name}) is not defined for ${facts.label}`);
  for (const [value] of all.matchAll(/\b\d+(?:\.\d+)?px\b/g)) if (!tablesPx.has(value)) hard.push(`${value} is not in the brief's tables`);
  for (const [, size, line] of all.matchAll(/\b(\d+)px\s*\/\s*(\d+)px/g)) if (!TYPE_ROLES.some((r) => r.size === `${size}px` && r.line === `${line}px`)) hard.push(`${size}px/${line}px is not a Type Scale pair`);
  if (/gradient/i.test(all)) hard.push('gradient mentioned');
  if (/refero/i.test(all)) hard.push('source name present');
  const motionBans = { still: /\b(animat\w*|parallax|transition\w*|fades?\s+in|slides?\s+in|loop\w*)\b/i, subtle: /\b(parallax|bounce\w*|loop\w*|autoplay\w*)\b/i, lively: /\b(parallax)\b/i };
  if (['layout', 'imagery', 'example-prompts', 'occasion-components'].includes(entry) && motionBans[layout.motion].test(all)) hard.push(`motion beyond the "${layout.motion}" level: "${all.match(motionBans[layout.motion])[0]}"`);
  const example = strings(library[entry].example.output).join(' ').toLowerCase().split(/\s+/);
  const lower = all.toLowerCase().split(/\s+/);
  for (let i = 0; i + 8 <= example.length; i++) if (lower.join(' ').includes(example.slice(i, i + 8).join(' '))) { hard.push('copies 8+ words from the example'); break; }
  if (['tagline', 'mood-occasion', 'imagery'].includes(entry) && /var\(|\bpx\b|\d/.test(all)) hard.push('values present where the entry allows none');
  if (entry === 'layout' && /\d+px/.test(all)) hard.push('px in Layout; use step names');
  const targets = targetsFor(brief, entry);
  const band = (label, count, [low, high]) => { if (count < low || count > high) soft.push(`${label}: ${count} words, band ${low}–${high}`); };
  if (entry === 'tagline') {
    band('tagline', words(answer.tagline), targets.words);
    band('first clause', words(answer.tagline.split(/ — |,/)[0]), targets.firstClauseWords);
    const capitals = answer.tagline.split(/\s+/).slice(1).filter((w) => /^[A-Z]/.test(w) && !['Finnomena', 'Club', 'Exclusive', 'Private', 'Ultra'].includes(w.replace(/\W/g, '')));
    if (capitals.length) soft.push(`tagline not sentence case: ${capitals.join(' ')}`);
  }
  if (entry === 'mood-occasion') band('mood half', words(answer.paragraph), targets.words);
  if (entry === 'imagery') band('imagery', words(answer.paragraph), targets.words);
  if (entry === 'layout') {
    band('layout', words(answer.paragraph), targets.words);
    for (const role of new Set(layout.sections)) if (!answer.paragraph.toLowerCase().includes(role.replace('-', ' ')) && !answer.paragraph.toLowerCase().includes(role)) soft.push(`layout does not name section role "${role}"`);
    for (const c of occasion.components) if (!answer.paragraph.includes(c.name) && !answer.paragraph.toLowerCase().includes(c.name.toLowerCase())) soft.push(`layout does not place "${c.name}"`);
  }
  if (entry === 'occasion-components') {
    if (answer.components.length !== occasion.components.length || answer.components.some((c, i) => c.name !== occasion.components[i].name)) hard.push('components do not match the preset one for one');
    for (const c of answer.components) {
      band(`role "${c.name}"`, words(c.role), targets.roleWords);
      band(`paragraph "${c.name}"`, words(c.paragraph), targets.paragraphWords);
      for (const [, name] of c.paragraph.matchAll(/var\(--immersive-((?!on-)[\w-]+)\)/g)) if (allowed.has(`immersive-on-${name}`) && !c.paragraph.includes(`--immersive-on-${name}`)) soft.push(`"${c.name}": var(--immersive-${name}) without its on- pair`);
    }
  }
  if (entry === 'preset-dos-donts') {
    if (answer.dos.length !== occasion.dos.length || answer.donts.length !== occasion.donts.length) hard.push('not one bullet per intent');
    for (const d of [...answer.dos, ...answer.donts]) band('bullet', words(d), targets.words);
    for (const d of answer.donts) if (!/^Do not\b/.test(d) || !d.includes(' — ')) soft.push(`Don't lacks "Do not … — why": ${d.slice(0, 40)}`);
  }
  if (entry === 'example-prompts') {
    if (answer.prompts.length < targets.count[0] || answer.prompts.length > targets.count[1]) soft.push(`${answer.prompts.length} prompts, band ${targets.count.join('–')}`);
    for (const p of answer.prompts) band('prompt', words(p), targets.words);
    if (!answer.prompts.some((p) => occasion.components.some((c) => p.includes(c.name)))) soft.push('no prompt names an occasion component');
  }
  return { hard: [...new Set(hard)], soft };
}

async function runEntry(brief, entry, done, tablesPx, log) {
  const system = JSON.parse(shared).preamble.join('\n');
  const inputs = resolveInputs(brief, entry, done);
  const attempts = [];
  let feedback = [];
  for (let attempt = 1; attempt <= 3; attempt++) {
    const user = prompt(brief, entry, inputs, feedback);
    let answer, error;
    try { ({ answer } = await callClaude(system, user, library[entry].output, CALL_DIR)); } catch (e) { error = e.message; }
    const result = answer ? checks(brief, entry, answer, tablesPx) : { hard: [`no answer: ${error}`], soft: [] };
    attempts.push({ attempt, answer, ...result });
    writeFileSync(join(log.dir, `${entry}.attempt${attempt}.json`), JSON.stringify({ user, answer, ...result }, null, 2));
    if (!result.hard.length && !result.soft.length) break;
    if (!result.hard.length && attempt >= 2) break;
    feedback = [...result.hard, ...result.soft];
  }
  const passing = attempts.filter((a) => !a.hard.length).sort((a, b) => a.soft.length - b.soft.length);
  const kept = passing[0] ?? attempts.at(-1);
  log.entries[entry] = { inputs, inputsHash: hash(JSON.stringify(inputs)), entryHash: hash(read(join(here, 'prompt-library', `${entry}.json`))), attempts: attempts.map(({ attempt, hard, soft }) => ({ attempt, hard, soft })), kept: kept.attempt, passedHard: !kept.hard.length, outputHash: hash(JSON.stringify(kept.answer ?? null)) };
  done[entry] = kept.answer;
}

const PLACEHOLDER = { tagline: { tagline: '' }, 'mood-occasion': { paragraph: '' }, 'occasion-components': { components: [] }, imagery: { paragraph: '' }, 'preset-dos-donts': { dos: [], donts: [] }, layout: { paragraph: '' }, 'example-prompts': { prompts: [] } };
function tablePx(brief) {
  // px values the prose may use: every px that appears in the scripted tables.
  return new Set(markdown(render(brief, PLACEHOLDER)).match(/\b\d+(?:\.\d+)?px\b/g));
}

async function draft(brief) {
  const dir = join(RAW, brief.name);
  mkdirSync(dir, { recursive: true });
  const log = { dir, entries: {} };
  const done = {};
  const tablesPx = tablePx(brief);
  await Promise.all(['tagline', 'mood-occasion', 'occasion-components', 'imagery'].map((e) => runEntry(brief, e, done, tablesPx, log)));
  await Promise.all(['preset-dos-donts', 'layout', 'example-prompts'].map((e) => runEntry(brief, e, done, tablesPx, log)));
  const text = markdown(render(brief, done));
  const failed = Object.entries(log.entries).filter(([, e]) => !e.passedHard).map(([n]) => n);
  const record = { brief: brief.name, model: MODEL, effort: 'high', claudeCode: '2.1.316', sharedHash: hash(shared), entries: Object.fromEntries(Object.entries(log.entries).map(([n, e]) => [n, { entryHash: e.entryHash, inputsHash: e.inputsHash, attempts: e.attempts, kept: e.kept, passedHard: e.passedHard, outputHash: e.outputHash }])), prose: done };
  writeFileSync(join(here, 'out', `${brief.name}.record.json`), `${JSON.stringify(record, null, 2)}\n`);
  if (failed.length) {
    writeFileSync(join(dir, 'draft.md'), text);
    console.log(`${brief.name}: hard checks still fail in ${failed.join(', ')}; draft at ${join(dir, 'draft.md')}`);
    process.exitCode = 1;
  } else {
    writeFileSync(join(here, 'out', `${brief.name}.md`), text);
    console.log(`${brief.name}: written`);
  }
  const review = Object.entries(log.entries).map(([n, e]) => `## ${n}\nentry ${e.entryHash}, inputs ${e.inputsHash}\n\n\`\`\`json\n${JSON.stringify(e.inputs, null, 2)}\n\`\`\`\n\n${e.attempts.map((a) => `- attempt ${a.attempt}: hard [${a.hard.join('; ')}] soft [${a.soft.join('; ')}]`).join('\n')}\n\nKept: attempt ${e.kept}\n\n${JSON.stringify(done[n], null, 2)}`).join('\n\n');
  writeFileSync(join(dir, 'review.md'), `# Review: ${brief.name}\n\n${review}\n`);
}

// ---------- main ----------
const args = process.argv.slice(2);
const mode = args[0]?.startsWith('--') ? args.shift() : 'draft';
for (const path of args) {
  const brief = loadBrief(resolve(here, path));
  if (brief.problems.length) { console.log(`${basename(path)}: refused\n${brief.problems.map((p) => `  - ${p}`).join('\n')}`); process.exitCode = 1; continue; }
  if (mode === '--dry') { console.log(markdown(render(brief, PLACEHOLDER))); continue; }
  if (mode === '--check-only') { console.log(`${basename(path)}: schema and compatibility pass`); continue; }
  if (mode === '--scripted-only') {
    const record = json(join(here, 'out', `${brief.name}.record.json`));
    const fresh = render(brief, record.prose);
    const committed = read(join(here, 'out', `${brief.name}.md`));
    const stale = fresh.filter(([name, text]) => SCRIPTED.has(name) && !committed.includes(text)).map(([name]) => name);
    console.log(`${brief.name}: ${stale.length ? `scripted sections differ from fresh output: ${stale.join(', ')}` : 'scripted sections match fresh output'}`);
    if (stale.length) process.exitCode = 1;
    continue;
  }
  await draft(brief);
}
