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

test('a third-party source with a review record passes the input checks', (t) => {
  const root = fixture(t, {
    ...edit(LAYOUT, (p) => ({ ...p, source: source('https://www.example-run.com/events') })),
    ...edit(PICKS, (p) => ({ ...p, review: review('illustrative') })),
  });
  const { status, out } = checkOnly(root);
  assert.equal(status, 0, out);
});

// A published brief: its Markdown, authoring record and registry entry beside the picks file.
const BRIEF = 'registry/theme-briefs/club-run.md';
const briefText = [
  '# Finnomena Club · Run — Theme Brief',
  '',
  '**Immersive Theme:** club',
  '',
  '| Name | Value | Token |',
  '|---|---|---|',
  '| White 100 | `#ffffff` | `--immersive-canvas` |',
  '| Navy 100 | `#01172b` | `--immersive-text` |',
  '| Light Grey 50 | `#d3dfe6` | `--immersive-palette-50` |',
  '',
  'Race distance cards sit on `var(--immersive-palette-50)` with `var(--immersive-on-palette-50)` text; the main action is `var(--immersive-action)`.',
  '',
].join('\n');
const published = (items = ['club-run']) => ({
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
  'a third-party brief whose review is illustrative': [thirdParty('illustrative'), /^theme-briefs\/picks\/club-run\.json: brief "club-run" has a third-party source and its review status is "illustrative"; it ships only after a Finnomena design review$/m],
  'a brief that names its source domain': [{ ...thirdParty('reviewed'), [BRIEF]: `${briefText}Measured from www.Example-Run.com.\n` }, /^registry\/theme-briefs\/club-run\.md: names "example-run\.com", a preset source; no source name ships$/m],
  'a brief that names its source site': [{ ...thirdParty('reviewed'), [BRIEF]: `${briefText}A layout in the Example-Run style.\n` }, /^registry\/theme-briefs\/club-run\.md: names "example-run", a preset source; no source name ships$/m],
  'an off-token hex': [{ ...published(), [BRIEF]: `${briefText}| Ink | \`#01172c\` | x |\n` }, /^registry\/theme-briefs\/club-run\.md: #01172c is not a color token \(nearest Navy\/100 #01172b\)$/m],
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
