import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const repo = join(import.meta.dirname, '../..');
const tool = join(repo, 'scripts/theme-briefs/theme-briefs.mjs');

// Theme sources the loader reads, copied from the repository so facts match the real themes.
const THEME_FILES = ['theme/immersive-themes.json', 'theme/css/immersive-themes.css', 'theme/css/theme.css', 'theme/tokens/colors.json'];

const valid = {
  'theme-briefs/presets/occasion/run.json': {
    kind: 'occasion', slug: 'run',
    taglineIntent: 'a members running event with a shared start line',
    moodIntent: 'a weekend race members train for together',
    components: [
      { name: 'Race distance card', role: 'compare the distances on offer', contentNotes: 'distance, start time, one select action', roles: ['palette', 'action'] },
      { name: 'Registration call-out', role: 'carry the main registration action', contentNotes: 'deadline and the main action', roles: ['accent', 'action'] },
    ],
    dos: ['show the registration deadline next to every main action'],
    donts: ['use the route map as a decorative background'],
    promptInputs: ['a set of race distance cards'],
    secondaryHighlights: ['green'],
  },
  'theme-briefs/presets/layout/event-landing.json': {
    kind: 'layout', slug: 'event-landing',
    sections: ['hero', 'detail-list', 'call-out', 'form', 'footer'],
    heroPattern: 'split headline and lead image', navigation: 'none', footer: 'minimal',
    density: 'comfortable', blockRadius: 'borderRadius-500', sectionGap: 'space-10', cardPadding: 'space-4',
    pageWidth: 'full-bleed', motion: 'subtle', brandPattern: { section: 'hero' },
  },
  'theme-briefs/presets/imagery/people-in-action.json': {
    kind: 'imagery', slug: 'people-in-action',
    leads: 'photography of members taking part', framing: 'close and mid shots',
    subject: 'real members, candid', illustration: 'spot illustrations for small blocks only', density: 'one large image per screen',
  },
  'theme-briefs/picks/club-run.json': {
    theme: 'club', briefName: 'Run',
    presets: { occasion: 'run', layout: 'event-landing', imagery: 'people-in-action' },
    brandPattern: { colourway: 'accent', ground: 50 },
  },
  'theme-briefs/themes/club.json': {
    mood: 'Club opens the membership on a white canvas with navy ink. Light grey steps build quiet section blocks.',
    sibling: 'White canvas with navy ink and a yellow spark.',
  },
};

function fixture(t, changes = {}) {
  const root = mkdtempSync(join(tmpdir(), 'neon-theme-briefs-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const file of THEME_FILES) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    cpSync(join(repo, file), join(root, file));
  }
  const files = { 'registry/registry.json': { name: 'neon', homepage: 'https://example.invalid', items: [] }, ...valid, ...changes };
  for (const [path, content] of Object.entries(files)) {
    if (content === null) continue;
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), typeof content === 'string' ? content : `${JSON.stringify(content, null, 2)}\n`);
  }
  return root;
}

function run(args, env = {}) {
  const result = spawnSync(process.execPath, [tool, ...args], { encoding: 'utf8', env: { ...process.env, ...env } });
  return { status: result.status, out: `${result.stdout}${result.stderr}` };
}

function checkOnly(root) {
  return run(['check-only', '--root', root]);
}

function snapshot(root) {
  const files = {};
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else files[path.slice(root.length)] = readFileSync(path, 'utf8');
    }
  };
  walk(root);
  return files;
}

test('check-only passes a valid input tree, reports what it read and writes nothing', (t) => {
  const root = fixture(t);
  const before = snapshot(root);
  const { status, out } = checkOnly(root);
  assert.equal(status, 0, out);
  assert.match(out, /^Theme Brief check: 4 themes, 3 presets, 1 picks file, 1 theme text, 0 prompt library entries, 0 briefs; no problems$/m);
  assert.deepEqual(snapshot(root), before);
});

const OCCASION = 'theme-briefs/presets/occasion/run.json';
const LAYOUT = 'theme-briefs/presets/layout/event-landing.json';
const IMAGERY = 'theme-briefs/presets/imagery/people-in-action.json';
const PICKS = 'theme-briefs/picks/club-run.json';
const CLUB_TEXT = 'theme-briefs/themes/club.json';
const edit = (path, change) => ({ [path]: change(structuredClone(valid[path])) });

function assertRefused(t, changes, expected) {
  const { status, out } = checkOnly(fixture(t, changes));
  assert.equal(status, 1, out);
  for (const pattern of [expected].flat()) assert.match(out, pattern);
  assert.match(out, /^Theme Brief check: .*; \d+ problems?$/m);
}

const SCHEMA_REFUSALS = {
  'an unknown key': [edit(PICKS, (p) => ({ ...p, accentHex: 'yellow' })), /^theme-briefs\/picks\/club-run\.json: unknown key "accentHex"$/m],
  'an unknown nested key': [edit(LAYOUT, (p) => ({ ...p, brandPattern: { section: 'hero', tone: 'warm' } })), /^theme-briefs\/presets\/layout\/event-landing\.json: unknown key "brandPattern\.tone"$/m],
  'a missing key': [edit(IMAGERY, ({ framing, ...p }) => p), /^theme-briefs\/presets\/imagery\/people-in-action\.json: missing key "framing"$/m],
  'a hex-like string': [edit(OCCASION, (p) => ({ ...p, moodIntent: 'a navy #01172b evening' })), /^theme-briefs\/presets\/occasion\/run\.json: "moodIntent" holds a hex-like value$/m],
  'a short hex in a nested list': [edit(OCCASION, (p) => { p.components[0].contentNotes = 'price in #fc0'; return p; }), /^theme-briefs\/presets\/occasion\/run\.json: "components\.0\.contentNotes" holds a hex-like value$/m],
  'a font field': [edit(IMAGERY, (p) => ({ ...p, fontFamily: 'Inter' })), /^theme-briefs\/presets\/imagery\/people-in-action\.json: "fontFamily" is a font field; type comes from the theme$/m],
  'a px value': [edit(LAYOUT, (p) => ({ ...p, heroPattern: 'a 640px tall split hero' })), /^theme-briefs\/presets\/layout\/event-landing\.json: "heroPattern" holds a px value; use a step name$/m],
  'an enum value': [edit(LAYOUT, (p) => ({ ...p, pageWidth: 'boxed' })), /^theme-briefs\/presets\/layout\/event-landing\.json: "pageWidth" must be one of contained, full-bleed$/m],
  'a motion level': [edit(LAYOUT, (p) => ({ ...p, motion: 'parallax' })), /"motion" must be one of still, subtle, lively$/m],
  'a section role': [edit(LAYOUT, (p) => ({ ...p, sections: ['hero', 'gallery'] })), /"sections\.1" must be one of hero, proof, detail-list, call-out, form, footer$/m],
  'a component theme role': [edit(OCCASION, (p) => { p.components[0].roles = ['green']; return p; }), /"components\.0\.roles\.0" must be one of palette, accent, support, action$/m],
  'a secondary highlight': [edit(OCCASION, (p) => ({ ...p, secondaryHighlights: ['teal'] })), /"secondaryHighlights\.0" must be one of green, blue, purple, red, orange$/m],
  'a colourway that is no theme family': [edit(PICKS, (p) => ({ ...p, brandPattern: { colourway: 'green', ground: 50 } })), /"brandPattern\.colourway" must be one of palette, accent, support$/m],
  'too few components': [edit(OCCASION, (p) => ({ ...p, components: p.components.slice(0, 1) })), /"components" must have 2–6 items, has 1$/m],
  'too many components': [edit(OCCASION, (p) => ({ ...p, components: Array(7).fill(p.components[0]) })), /"components" must have 2–6 items, has 7$/m],
  'too many dos': [edit(OCCASION, (p) => ({ ...p, dos: ['a', 'b', 'c', 'd'] })), /"dos" must have 1–3 items, has 4$/m],
  'no donts': [edit(OCCASION, (p) => ({ ...p, donts: [] })), /"donts" must have 1–3 items, has 0$/m],
  'a wrong type': [edit(PICKS, (p) => ({ ...p, brandPattern: { colourway: 'accent', ground: '50' } })), /"brandPattern\.ground" must be a positive integer$/m],
  'a kind that does not match its folder': [edit(IMAGERY, (p) => ({ ...p, kind: 'layout' })), /people-in-action\.json: "kind" must be one of imagery$/m],
  'a slug that does not match its file name': [edit(LAYOUT, (p) => ({ ...p, slug: 'landing' })), /event-landing\.json: "slug" must match the file name "event-landing"$/m],
};

const ENTRY = 'theme-briefs/prompt-library/tagline.json';
const entry = {
  fills: 'header tagline',
  inputs: ['occasion.taglineIntent', 'theme.sibling', 'theme.kind'],
  after: [],
  formula: ['a concrete subject', 'a preposition', 'the ground it sits on'],
  targets: { words: [10, 22], firstClauseWords: [3, 7] },
  rules: ['no values', 'sentence case'],
  output: { type: 'object', properties: { tagline: { type: 'string' } }, required: ['tagline'], additionalProperties: false },
  example: { input: { 'occasion.taglineIntent': 'a pottery club open studio night' }, output: { tagline: 'Wheels and wet clay on a warm canvas' } },
};

Object.assign(SCHEMA_REFUSALS, {
  'a radius step for a spacing pick': [edit(LAYOUT, (p) => ({ ...p, sectionGap: 'borderRadius-500' })), /event-landing\.json: "sectionGap" must be a space-\* step name$/m],
  'a spacing step for the block radius': [edit(LAYOUT, (p) => ({ ...p, blockRadius: 'space-4' })), /"blockRadius" must be a borderRadius-\* step name$/m],
  'a step that is not on the scale': [edit(LAYOUT, (p) => ({ ...p, cardPadding: 'space-11' })), /"cardPadding" must be a space-\* step name$/m],
  'a step written as a variable': [edit(LAYOUT, (p) => ({ ...p, cardPadding: 'var(--space-4)' })), /"cardPadding" must be a space-\* step name$/m],
  'a picks file named apart from its brief': [{ [PICKS]: null, 'theme-briefs/picks/club-race.json': valid[PICKS] }, /^theme-briefs\/picks\/club-race\.json: file name must be "club-run\.json" \(theme and brief name\)$/m],
  'a brief name that is not plain English': [edit(PICKS, (p) => ({ ...p, briefName: 'วิ่ง' })), /"briefName" must be an English name/m],
  'a theme text for no theme': [{ 'theme-briefs/themes/neon.json': valid[CLUB_TEXT] }, /^theme-briefs\/themes\/neon\.json: no Immersive Theme "neon"$/m],
  'a theme text with a ratio': [edit(CLUB_TEXT, (p) => ({ ...p, mood: 'Club opens on a white canvas. Navy text reads at 17:1 on it.' })), /^theme-briefs\/themes\/club\.json: "mood" holds a ratio or percentage$/m],
  'a theme text with a percentage': [edit(CLUB_TEXT, (p) => ({ ...p, sibling: 'White canvas, 60% of the page.' })), /"sibling" holds a ratio or percentage$/m],
  'a theme text with a superlative': [edit(CLUB_TEXT, (p) => ({ ...p, mood: 'Club opens on the brightest canvas. Navy ink carries the text.' })), /"mood" compares or ranks themes \("brightest"\)$/m],
  'a theme text with "only"': [edit(CLUB_TEXT, (p) => ({ ...p, sibling: 'The only white canvas.' })), /"sibling" compares or ranks themes \("only"\)$/m],
  'a theme text with "most"': [edit(CLUB_TEXT, (p) => ({ ...p, sibling: 'The most open of the themes.' })), /"sibling" compares or ranks themes \("most"\)$/m],
  'a theme text with "of the four"': [edit(CLUB_TEXT, (p) => ({ ...p, sibling: 'The lightest of the four.' })), /"sibling" compares or ranks themes \("of the four"\)/m],
  'a theme text naming another theme': [edit(CLUB_TEXT, (p) => ({ ...p, sibling: 'Lighter than Ultra, with navy ink.' })), /"sibling" compares or ranks themes \("Ultra"\)$/m],
  'a mood of one sentence': [edit(CLUB_TEXT, (p) => ({ ...p, mood: 'Club opens on a white canvas with navy ink.' })), /"mood" must be 2–4 sentences, has 1$/m],
  'a sibling line over 20 words': [edit(CLUB_TEXT, (p) => ({ ...p, sibling: Array(21).fill('canvas').join(' ') })), /"sibling" must be 20 words or fewer, has 21$/m],
  'a prompt library entry with an unknown name': [{ 'theme-briefs/prompt-library/headline.json': entry }, /^theme-briefs\/prompt-library\/headline\.json: not a prompt library entry; entries are tagline, mood-occasion/m],
  'a prompt library entry with an unknown key': [{ [ENTRY]: { ...entry, temperature: 1 } }, /tagline\.json: unknown key "temperature"$/m],
  'a prompt library entry that takes a source': [{ [ENTRY]: { ...entry, inputs: [...entry.inputs, 'layout.source'] } }, /tagline\.json: "inputs\.3" names a preset source, which is never an input$/m],
  'a prompt library entry after itself': [{ [ENTRY]: { ...entry, after: ['tagline'] } }, /tagline\.json: "after" names the entry itself$/m],
  'a prompt library target that is not a band': [{ [ENTRY]: { ...entry, targets: { words: [10] } } }, /tagline\.json: "targets\.words" must have 2 items, has 1$/m],
  'a prompt library example with a hex': [{ [ENTRY]: { ...entry, example: { input: {}, output: { tagline: 'Clay on #f5e6d3' } } } }, /tagline\.json: "example\.output\.tagline" holds a hex-like value$/m],
  'a shared file with an unknown key': [{ 'theme-briefs/prompt-library/shared.json': { preamble: ['Write in English.'], bans: [], model: 'x' } }, /shared\.json: unknown key "model"$/m],
  'malformed JSON': [{ [IMAGERY]: '{ "kind": "imagery", ' }, /^theme-briefs\/presets\/imagery\/people-in-action\.json: not valid JSON/m],
});

// A copy of the real theme data with one theme whose accent step is the canvas color.
function withCanvasAccent() {
  const data = JSON.parse(readFileSync(join(repo, 'theme/immersive-themes.json'), 'utf8'));
  data.themes.club.accent['25'] = { bg: data.themes.club.canvas, fg: data.themes.club.text };
  return data;
}

const source = (url) => ({ url, measuredOn: '2026-10-30', kept: ['structure', 'geometry'], robotsDisallowed: false });
const review = (status) => ({ status, source_revision: '2026-10-30', reviewer: status === 'illustrative' ? null : 'Design owner', reviewed_on: status === 'illustrative' ? null : '2026-11-01', approved_properties: [] });

const COMPATIBILITY_REFUSALS = {
  'a support component on Club': [edit(OCCASION, (p) => { p.components[1].roles = ['support']; return p; }), /^theme-briefs\/picks\/club-run\.json: occasion "run" component "Registration call-out" uses role "support", which Club lacks \(roles: action, palette, accent\)$/m],
  'a colourway from a family the theme lacks': [edit(PICKS, (p) => ({ ...p, brandPattern: { colourway: 'support', ground: 50 } })), /^theme-briefs\/picks\/club-run\.json: colourway "support" is not one of Club's families \(palette, accent\)$/m],
  'a ground that is not a step of the colourway': [edit(PICKS, (p) => ({ ...p, brandPattern: { colourway: 'accent', ground: 30 } })), /^theme-briefs\/picks\/club-run\.json: ground 30 is not a step of accent \(25, 50, 75, 100\)$/m],
  'a Brand Pattern on the bare canvas': [{ 'theme/immersive-themes.json': withCanvasAccent(), ...edit(PICKS, (p) => ({ ...p, brandPattern: { colourway: 'accent', ground: 25 } })) }, /^theme-briefs\/picks\/club-run\.json: accent 25 is Club's bare canvas; a Brand Pattern sits on the canvas only as palette 100$/m],
  'a Brand Pattern section the layout lacks': [edit(LAYOUT, (p) => ({ ...p, brandPattern: { section: 'proof' } })), /^theme-briefs\/presets\/layout\/event-landing\.json: Brand Pattern section "proof" is not one of its sections$/m],
  'a missing preset': [edit(PICKS, (p) => ({ ...p, presets: { ...p.presets, imagery: 'still-life' } })), /^theme-briefs\/picks\/club-run\.json: imagery preset "still-life" not found under theme-briefs\/presets\/imagery$/m],
  'a third-party source with no review record': [edit(LAYOUT, (p) => ({ ...p, source: source('https://www.example-run.com/events') })), /^theme-briefs\/picks\/club-run\.json: layout "event-landing" has a third-party source, so the picks file needs a review record$/m],
  'a source URL that does not parse, as a third party': [edit(LAYOUT, (p) => ({ ...p, source: source('https://[x]/events') })), /^theme-briefs\/picks\/club-run\.json: layout "event-landing" has a third-party source, so the picks file needs a review record$/m],
  'a Refero Styles page as a source': [edit(IMAGERY, (p) => ({ ...p, source: source('https://www.refero.design/styles/run') })), /^theme-briefs\/presets\/imagery\/people-in-action\.json: "source\.url" is a Refero Styles page; the Refero corpus is never a preset source$/m],
  'a review past illustrative with no reviewer or date': [edit(PICKS, (p) => ({ ...p, review: { ...review('reviewed'), reviewer: null, reviewed_on: null } })), /^theme-briefs\/picks\/club-run\.json: review status "reviewed" needs a reviewer and reviewed_on$/m],
  'a partial review with no approved properties': [edit(PICKS, (p) => ({ ...p, review: review('partially-reviewed') })), /^theme-briefs\/picks\/club-run\.json: review status "partially-reviewed" needs its approved_properties$/m],
  'a review record with no third-party source': [edit(PICKS, (p) => ({ ...p, review: review('reviewed') })), /^theme-briefs\/picks\/club-run\.json: review record without a third-party source; remove it$/m],
};

for (const [name, [changes, expected]] of Object.entries(COMPATIBILITY_REFUSALS)) {
  test(`check-only refuses ${name}`, (t) => assertRefused(t, changes, expected));
}

test('palette 100 may be the bare canvas, and a Finnomena source needs no review', (t) => {
  const root = fixture(t, {
    'theme-briefs/picks/club-run.json': null,
    'theme-briefs/picks/ultra-run.json': { ...valid[PICKS], theme: 'ultra', brandPattern: { colourway: 'palette', ground: 100 } },
    ...edit(LAYOUT, (p) => ({ ...p, source: source('https://www.finnomena.com/campaign/run') })),
  });
  const { status, out } = checkOnly(root);
  assert.equal(status, 0, out);
});

test('check-only refuses a third-party source whose review is illustrative, before any brief is published', (t) => assertRefused(t, {
  ...edit(LAYOUT, (p) => ({ ...p, source: source('https://www.example-run.com/events') })),
  ...edit(PICKS, (p) => ({ ...p, review: review('illustrative') })),
}, /^theme-briefs\/picks\/club-run\.json: layout "event-landing" has a third-party source and its review status is "illustrative"; it ships only after a Finnomena design review$/m));

test('a third-party source with a partial review passes the input checks', (t) => {
  const root = fixture(t, {
    ...edit(LAYOUT, (p) => ({ ...p, source: source('https://www.example-run.com/events') })),
    ...edit(PICKS, (p) => ({ ...p, review: { ...review('partially-reviewed'), approved_properties: ['composition'] } })),
  });
  const { status, out } = checkOnly(root);
  assert.equal(status, 0, out);
});

// A published brief: its Markdown, authoring record and registry entry beside the picks file.
const BRIEF = 'registry/theme-briefs/club-run.md';
// Scripted rendering and scripted-only: a committed brief whose scripted parts are stale, and its prose.
const THEME_TEXTS = {
  'theme-briefs/themes/exclusive.json': { mood: 'Exclusive fills the page with yellow. Navy ink and grey blocks keep it calm.', sibling: 'Yellow canvas with navy ink.' },
  'theme-briefs/themes/private.json': { mood: 'Private opens on a grey canvas. Yellow blocks mark what matters.', sibling: 'Grey canvas with yellow blocks.' },
  'theme-briefs/themes/ultra.json': { mood: 'Ultra sets the page on navy. White ink and yellow highlights carry it.', sibling: 'Navy canvas with white ink.' },
};
const PROSE = {
  tagline: 'Race day on an open canvas, with every member invited to the start line',
  mood: 'Members train together for one weekend race, and the page counts down to the start.\nThe registration call-out carries the accent.',
  components: [
    ['Race distance card', 'Compare the distances on offer', 'Each card sits on var(--immersive-palette-50) with var(--immersive-on-palette-50) text and var(--borderRadius-500) corners.\nThe distance leads in title2.'],
    ['Registration call-out', 'Carry the main registration action', 'The call-out sits on var(--immersive-accent-100) with var(--immersive-on-accent-100) text, with the deadline above the main action.'],
  ],
  dos: ['Show the registration deadline beside every main action, so members never hunt for the date.'],
  donts: ['Do not use the route map as a decorative background — it hides the distances members compare.'],
  imagery: 'Photography of members running together leads, framed close and mid.\n\nSpot illustrations mark small blocks only.',
  layout: 'The page opens on a split hero, then alternates detail lists and a call-out at var(--space-10) gaps before the form.',
  prompts: ['Build a race distance card on var(--immersive-palette-50) with var(--immersive-on-palette-50) text.', 'Build the registration call-out on var(--immersive-accent-100) with var(--immersive-on-accent-100) text.'],
};
// What a drafted brief holds before its scripted sections are refreshed: prose, and stale scripted text.
function staleBrief(prose = PROSE, { theme = 'Club', name = 'Run' } = {}) {
  return [
    `# Finnomena ${theme} · ${name} — Theme Brief`,
    `> ${prose.tagline}`,
    '',
    'Stale header.',
    '',
    'Stale theme half.',
    prose.mood,
    'Stale ratio.',
    '',
    '## Tokens — Colors',
    '',
    'Stale colors.',
    '',
    '## Components',
    '',
    '### Main Action',
    '**Role:** Stale',
    '',
    'Stale.',
    '',
    ...prose.components.flatMap(([title, role, paragraph]) => [`### ${title}`, `**Role:** ${role}`, '', paragraph, '']),
    "## Do's and Don'ts",
    '',
    '### Do',
    '- Stale do.',
    ...prose.dos.map((line) => `- ${line}`),
    '',
    "### Don't",
    ...prose.donts.map((line) => `- ${line}`),
    '',
    '## Imagery',
    '',
    prose.imagery,
    '',
    'Stale Brand Floor sentence.',
    '',
    '## Layout',
    '',
    prose.layout,
    '',
    '## Agent Prompt Guide',
    '',
    '**Quick Color Reference**',
    '- stale',
    '',
    '**Example Component Prompts**',
    '',
    prose.prompts.map((line, index) => `${index + 1}. ${line}`).join('\n\n'),
    '',
  ].join('\n');
}

// The committed brief scripted-only makes from the stale one: what a published brief holds.
function renderBrief(changes = {}) {
  const root = fixture({ after() {} }, { ...THEME_TEXTS, [BRIEF]: staleBrief(), ...changes });
  try {
    const { status, out } = run(['scripted-only', '--root', root]);
    assert.equal(status, 0, out);
    return readFileSync(join(root, BRIEF), 'utf8');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
const briefText = renderBrief();
const published = (items = ['club-run']) => ({
  ...THEME_TEXTS,
  [BRIEF]: briefText,
  'theme-briefs/records/club-run.json': { brief: 'club-run' },
  'registry/registry.json': { name: 'neon', homepage: 'https://example.invalid', items: items.map((name) => ({ name: `theme-brief-${name}`, type: 'registry:item' })) },
});
const thirdParty = (status) => ({
  ...published(),
  ...edit(LAYOUT, (p) => ({ ...p, source: source('https://www.example-run.com/events') })),
  ...edit(PICKS, (p) => ({ ...p, review: review(status) })),
});
// Club's on-palette-50 text turned white, which fails on Light Grey 50.
const whiteOnGrey = () => readFileSync(join(repo, 'theme/css/immersive-themes.css'), 'utf8')
  .replace(/(--immersive-on-palette-50: )#01172b(; \/\* Navy\.100 \*\/\n  --immersive-palette-25: #e9eff2)/, '$1#ffffff$2');

test('a published brief with its picks file, record and registry entry passes', (t) => {
  const { status, out } = checkOnly(fixture(t, published()));
  assert.equal(status, 0, out);
  assert.match(out, /, 1 brief; no problems$/m);
});

const BRIEF_REFUSALS = {
  'a brief with no picks file, record or registry entry': [{ [PICKS]: null, [BRIEF]: briefText }, [
    /^registry\/theme-briefs\/club-run\.md: published brief "club-run" has no picks file theme-briefs\/picks\/club-run\.json$/m,
    /^registry\/theme-briefs\/club-run\.md: published brief "club-run" has no authoring record theme-briefs\/records\/club-run\.json$/m,
    /^registry\/theme-briefs\/club-run\.md: published brief "club-run" has no registry entry "theme-brief-club-run" in registry\/registry\.json$/m,
  ]],
  'a registry entry with no brief Markdown': [{ ...published(), [BRIEF]: null }, /^registry\/registry\.json: published brief "club-run" has no Markdown registry\/theme-briefs\/club-run\.md$/m],
  'a brief that names its source domain': [{ ...thirdParty('reviewed'), [BRIEF]: `${briefText}Measured from www.Example-Run.com.\n` }, /^registry\/theme-briefs\/club-run\.md: names "example-run\.com", a preset source; no source name ships$/m],
  'a brief that names its source site': [{ ...thirdParty('reviewed'), [BRIEF]: `${briefText}A layout in the Example-Run style.\n` }, /^registry\/theme-briefs\/club-run\.md: names "example-run", a preset source; no source name ships$/m],
  'an off-token hex': [{ ...published(), [BRIEF]: `${briefText}| Ink | \`#01172c\` | x |\n` }, /^registry\/theme-briefs\/club-run\.md: #01172c is not a color token \(nearest Navy\/100 #01172b\)$/m],
  'a short hex': [{ ...published(), [BRIEF]: `${briefText}| Ink | \`#abc\` | x |\n` }, /^registry\/theme-briefs\/club-run\.md: #abc is not a color token; tables give a token's 6-digit value$/m],
  'a hex with alpha': [{ ...published(), [BRIEF]: `${briefText}| Ink | \`#01172bff\` | x |\n` }, /^registry\/theme-briefs\/club-run\.md: #01172bff is not a color token; tables give a token's 6-digit value$/m],
  'a variable the theme does not define': [{ ...published(), [BRIEF]: `${briefText}Use \`var(--immersive-support-50)\` with \`var(--immersive-on-support-50)\`.\n` }, /^registry\/theme-briefs\/club-run\.md: names --immersive-on-support-50, which Club does not define$/m],
  'an unreadable fill and text pair': [{ ...published(), 'theme/css/immersive-themes.css': whiteOnGrey() }, /^registry\/theme-briefs\/club-run\.md: --immersive-on-palette-50 on --immersive-palette-50 is 1\.\d\d:1 on Club; text needs 4\.5:1$/m],
};

for (const [name, [changes, expected]] of Object.entries(BRIEF_REFUSALS)) {
  test(`check-only refuses ${name}`, (t) => assertRefused(t, changes, expected));
}

test('a third-party brief passes once the review is recorded', (t) => {
  const { status, out } = checkOnly(fixture(t, thirdParty('reviewed')));
  assert.equal(status, 0, out);
});

test('--out reads committed briefs from another folder', (t) => {
  const root = fixture(t, { ...published(), [BRIEF]: null, 'elsewhere/club-run.md': briefText });
  const { status, out } = run(['check-only', '--root', root, '--out', join(root, 'elsewhere')]);
  assert.equal(status, 0, out);
  assert.match(out, /, 1 brief; no problems$/m);
});

test('theme texts may talk about investing and interest', (t) => {
  const root = fixture(t, edit(CLUB_TEXT, (p) => ({ ...p, mood: 'Club suits members who invest steadily. It keeps interest in the request, not the canvas.' })));
  const { status, out } = checkOnly(root);
  assert.equal(status, 0, out);
});

test('a valid prompt library entry and shared file pass', (t) => {
  const root = fixture(t, { [ENTRY]: entry, 'theme-briefs/prompt-library/shared.json': { preamble: ['Write in English.'], bans: ['no hex'] } });
  const { status, out } = checkOnly(root);
  assert.equal(status, 0, out);
  assert.match(out, /, 2 prompt library entries, /);
});

for (const [name, [changes, expected]] of Object.entries(SCHEMA_REFUSALS)) {
  test(`check-only refuses ${name}`, (t) => assertRefused(t, changes, expected));
}

test('the tool refuses to run without a mode', () => {
  const { status, out } = run([]);
  assert.equal(status, 2);
  assert.match(out, /Usage: node scripts\/theme-briefs\/theme-briefs\.mjs check-only/);
});

test('the repository passes its own Theme Brief check', () => {
  const result = run(['check-only']);
  assert.equal(result.status, 0, result.out);
  assert.match(result.out, /^Theme Brief check: 4 themes, .*; no problems$/m);
});

function scriptedOnly(root) {
  return run(['scripted-only', '--root', root]);
}

const SECTIONS = ['Tokens — Colors', 'Tokens — Typography', 'Tokens — Spacing & Shapes', 'Components', "Do's and Don'ts", 'Surfaces', 'Elevation', 'Imagery', 'Brand Pattern', 'Layout', 'Motion', 'Agent Prompt Guide', 'Sibling Themes', 'Quick Start'];

test('scripted-only renders every scripted part of a committed brief and keeps its prose', (t) => {
  const root = fixture(t, { ...THEME_TEXTS, [BRIEF]: staleBrief() });
  const { status, out } = scriptedOnly(root);
  assert.equal(status, 0, out);
  assert.match(out, /^registry\/theme-briefs\/club-run\.md: rewrote /m);
  const brief = readFileSync(join(root, BRIEF), 'utf8');
  assert.equal(brief.split('\n## ')[0], [
    '# Finnomena Club · Run — Theme Brief',
    `> ${PROSE.tagline}`,
    '',
    '**Theme:** light',
    '**Immersive Theme:** club',
    '',
    "This is a Finnomena Theme Brief, not a Reference Design: skip Brand Intensity and apply the whole Brand Contract. Colors come from the Club Immersive Theme and type from Neon's theme; layout, components, imagery and motion are Finnomena-authored and interpreted, not measured. Provisional pending design owner review.",
    '',
    valid[CLUB_TEXT].mood,
    PROSE.mood,
    'Membership ratio: White 60%, Light Grey 15%, Yellow 15%, Navy 10%.',
    '',
  ].join('\n'));
  assert.deepEqual([...brief.matchAll(/^## (.+)$/gm)].map(([, heading]) => heading), SECTIONS);
  for (const text of [PROSE.imagery, PROSE.layout, ...PROSE.dos, ...PROSE.donts, ...PROSE.components.flat()]) assert.ok(brief.includes(text), text);
  assert.ok(brief.includes(PROSE.prompts.map((line, index) => `${index + 1}. ${line}`).join('\n\n')));
  assert.doesNotMatch(brief, /Stale/);
});

// The wide end margin moved from 24px to 32px in theme.css.
const widerMargin = () => readFileSync(join(repo, 'theme/css/theme.css'), 'utf8')
  .replace(/(@media \(min-width: 1440px\)\s*\{\s*:root\s*\{[^}]*--layout-endMargin: )24px;/, (_, head) => `${head}32px;`);

test('check-only refuses a brief whose scripted section drifted from the theme', (t) => {
  const root = fixture(t, { ...published(), 'theme/css/theme.css': widerMargin() });
  const { status, out } = checkOnly(root);
  assert.equal(status, 1, out);
  assert.match(out, /^registry\/theme-briefs\/club-run\.md: section "Tokens — Spacing & Shapes" differs from fresh scripted output \(found ".*", expected ".*"\); run scripted-only$/m);
  assert.doesNotMatch(out, /section "Components"/);
});

test('check-only refuses a hand edit to a scripted line and allows one to prose', (t) => {
  const scripted = checkOnly(fixture(t, { ...published(), [BRIEF]: briefText.replace('Build emphasis with tint steps', 'Build emphasis with opacity') }));
  assert.equal(scripted.status, 1, scripted.out);
  assert.match(scripted.out, /section "Do's and Don'ts" differs from fresh scripted output \(found "- Build emphasis with opacity, never with opacity\.", expected "- Build emphasis with tint steps, never with opacity\."\)/);
  const prose = checkOnly(fixture(t, { ...published(), [BRIEF]: briefText.replace('framed close and mid', 'framed close') }));
  assert.equal(prose.status, 0, prose.out);
});

test('scripted-only fixes a drifted brief, keeps its prose, and a second run changes nothing', (t) => {
  const root = fixture(t, { ...published(), 'theme/css/theme.css': widerMargin(), [BRIEF]: briefText.replace('framed close and mid', 'framed close') });
  const first = scriptedOnly(root);
  assert.equal(first.status, 0, first.out);
  assert.match(first.out, /^registry\/theme-briefs\/club-run\.md: rewrote Tokens — Spacing & Shapes$/m);
  const brief = readFileSync(join(root, BRIEF), 'utf8');
  assert.match(brief, /^\| End margin from a 1440px viewport \| 32px \| `--layout-endMargin` \|$/m);
  assert.equal(brief, briefText.replace('framed close and mid', 'framed close').replaceAll('then 24px', 'then 32px').replace('| 24px | `--layout-endMargin`', '| 32px | `--layout-endMargin`'));
  const second = scriptedOnly(root);
  assert.match(second.out, /^registry\/theme-briefs\/club-run\.md: scripted sections already match fresh output$/m);
  assert.equal(readFileSync(join(root, BRIEF), 'utf8'), brief);
  assert.equal(checkOnly(root).status, 0);
});

test('scripted-only leaves a brief alone when its prose or inputs cannot be read', (t) => {
  const merged = briefText.replace(`${PROSE.mood}\n`, `${PROSE.mood.replace('\n', ' ')}\n`).replace(/\nMembership ratio: [^\n]+/, '');
  const root = fixture(t, { ...published(), [BRIEF]: merged });
  const prose = scriptedOnly(root);
  assert.equal(prose.status, 1, prose.out);
  assert.match(prose.out, /^registry\/theme-briefs\/club-run\.md: the header's mood paragraph must keep its three lines: theme half, occasion half, ratio sentence; not rewritten$/m);
  assert.equal(readFileSync(join(root, BRIEF), 'utf8'), merged);
  assert.match(checkOnly(root).out, /^registry\/theme-briefs\/club-run\.md: the header's mood paragraph must keep its three lines: theme half, occasion half, ratio sentence; its scripted sections cannot be checked$/m);

  const stale = staleBrief();
  const inputs = fixture(t, { ...published(), [BRIEF]: stale, 'theme-briefs/themes/ultra.json': null });
  const missing = scriptedOnly(inputs);
  assert.equal(missing.status, 1, missing.out);
  assert.match(missing.out, /^registry\/theme-briefs\/club-run\.md: .*theme-briefs\/themes\/ultra\.json.*; not rewritten$/m);
  assert.equal(readFileSync(join(inputs, BRIEF), 'utf8'), stale);
});

// Every theme with each of its colourways and, on its palette, every page width and motion level, rendered in one scripted-only run.
const LABELS = { club: 'Club', exclusive: 'Exclusive', private: 'Private', ultra: 'Ultra' };
const COLOURWAYS = { club: ['palette', 'accent'], exclusive: ['palette', 'accent'], private: ['palette', 'accent'], ultra: ['palette', 'accent', 'support'] };
const LAYOUT_VARIANTS = ['contained', 'full-bleed'].flatMap((pageWidth) => ['still', 'subtle', 'lively'].map((motion) => ({ pageWidth, motion })));
const MATRIX = Object.entries(COLOURWAYS).flatMap(([theme, colourways]) => [
  ...colourways.map((colourway) => ({ colourway, ...LAYOUT_VARIANTS[colourways.indexOf(colourway) + 1] })),
  ...LAYOUT_VARIANTS.filter((_, index) => index !== 1).map((variant) => ({ colourway: 'palette', ...variant })),
].map(({ colourway, pageWidth, motion }) => {
  const briefName = `Run ${colourway} ${pageWidth.replace('-', ' ')} ${motion}`;
  return { theme, colourway, pageWidth, motion, briefName, slug: `${theme}-${briefName.toLowerCase().replaceAll(' ', '-')}`, layout: `${pageWidth}-${motion}` };
}));

function renderMatrix(t) {
  const files = { ...THEME_TEXTS, [PICKS]: null };
  for (const { pageWidth, motion } of LAYOUT_VARIANTS) {
    files[`theme-briefs/presets/layout/${pageWidth}-${motion}.json`] = { ...valid[LAYOUT], slug: `${pageWidth}-${motion}`, pageWidth, motion };
  }
  for (const { theme, colourway, briefName, slug, layout } of MATRIX) {
    files[`theme-briefs/picks/${slug}.json`] = { theme, briefName, presets: { occasion: 'run', layout, imagery: 'people-in-action' }, brandPattern: { colourway, ground: 50 } };
    files[`theme-briefs/records/${slug}.json`] = { brief: slug };
    files[`registry/theme-briefs/${slug}.md`] = staleBrief(PROSE, { theme: LABELS[theme], name: briefName });
  }
  files['registry/registry.json'] = { name: 'neon', homepage: 'https://example.invalid', items: MATRIX.map(({ slug }) => ({ name: `theme-brief-${slug}`, type: 'registry:item' })) };
  const root = fixture(t, files);
  const { status, out } = scriptedOnly(root);
  assert.equal(status, 0, out);
  return { root, briefs: MATRIX.map((cell) => ({ ...cell, text: readFileSync(join(root, `registry/theme-briefs/${cell.slug}.md`), 'utf8') })) };
}

const section = (text, heading) => text.split(/^## /m).find((part) => part.startsWith(`${heading}\n`)) ?? '';
const MOTION = { still: /150ms or less/, subtle: /16px or less, .* 150–250ms with ease-out/, lively: /200–400ms .* 32px or less\. No parallax/ };

test('scripted rendering holds for every theme, colourway, page width and motion level, and passes check-only', (t) => {
  const { root, briefs } = renderMatrix(t);
  for (const { theme, colourway, pageWidth, motion, slug, text } of briefs) {
    const at = `${slug}: `;
    assert.match(text, new RegExp(`^\\*\\*Theme:\\*\\* ${theme === 'ultra' ? 'dark' : 'light'}$`, 'm'), at);
    assert.match(text, /^This is a Finnomena Theme Brief, not a Reference Design: .* Provisional pending design owner review\.$/m, at);
    assert.match(section(text, 'Components'), theme === 'ultra' ? /the dark-surface mark/ : /the light-surface mark/, at);
    assert.equal(/^### Support Block$/m.test(text), theme === 'ultra', at);
    assert.equal(/^\| — \| Light Grey 100 \| `#a6bfcc` \| `--immersive-support-100` \| Support block \|$/m.test(section(text, 'Surfaces')), theme === 'ultra', at);
    assert.match(section(text, 'Tokens — Spacing & Shapes'), /`--layout-contentMaxWidth` \(1440px\).*`--layout-endMargin` \(16px, then 24px from a 1440px viewport\)/, at);
    assert.match(section(text, 'Tokens — Spacing & Shapes'), pageWidth === 'contained' ? /Section fills stop at that column/ : /Section fills span the viewport/, at);
    assert.match(section(text, 'Motion'), MOTION[motion], at);
    assert.match(section(text, 'Brand Pattern'), new RegExp(`^- \\*\\*Ground:\\*\\* \`--immersive-${colourway}-50\` fill with \`--immersive-on-${colourway}-50\` text$`, 'm'), at);
    // No block may be capped at a count that a colourway's Brand Pattern ground could break.
    assert.doesNotMatch(text, /\bone per (screen|page)\b|\bonly one\b/i, at);
    // px values appear only in the brief's own tables, and a prose px value repeats one of them.
    const tablePx = new Set(text.split('\n').filter((line) => line.startsWith('|')).flatMap((line) => line.match(/\d+px/g) ?? []));
    const motionPx = section(text, 'Motion').match(/\d+px/g) ?? [];
    for (const line of text.split('\n').filter((line) => !line.startsWith('|'))) {
      for (const value of line.match(/\d+px/g) ?? []) assert.ok(tablePx.has(value) || motionPx.includes(value), `${at}${value} in "${line}"`);
    }
    assert.doesNotMatch(section(text, 'Components'), /\d+px/, at);
  }
  // Fixed component wording and the stock Do's and Don'ts never change with colourway, page width or motion.
  for (const theme of Object.keys(COLOURWAYS)) {
    const own = briefs.filter((brief) => brief.theme === theme);
    for (const heading of ['Components', "Do's and Don'ts", 'Tokens — Colors', 'Surfaces']) {
      assert.equal(new Set(own.map(({ text }) => section(text, heading))).size, 1, `${theme} ${heading}`);
    }
  }
  assert.match(section(briefs.find((brief) => brief.theme === 'club').text, 'Components'), /^`--immersive-palette-100` to `--immersive-palette-25` fills/m);
  assert.match(section(briefs.find((brief) => brief.theme === 'private').text, 'Components'), /^`--immersive-palette-75` to `--immersive-palette-25` fills/m);
  const { status, out } = checkOnly(root);
  assert.equal(status, 0, out);
  assert.match(out, new RegExp(`, ${MATRIX.length} briefs; no problems$`, 'm'));
});
