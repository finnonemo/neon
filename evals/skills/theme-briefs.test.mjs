import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
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
      { name: 'Race distance card', role: 'compare the distances on offer', contentNotes: 'distance, start time, one select action', roles: ['palette'], leadFact: 'the distance' },
      { name: 'Registration call-out', role: 'carry the main registration action', contentNotes: 'deadline and the main action', roles: ['accent', 'action'], feature: true },
    ],
    dos: ['show the registration deadline next to every main action'],
    donts: ['use the route map as a decorative background'],
    promptInputs: ['a set of race distance cards'],
    secondaryHighlights: ['green'],
  },
  'theme-briefs/presets/layout/event-landing.json': {
    kind: 'layout', slug: 'event-landing',
    sections: ['hero', 'detail-list', 'call-out', 'form', 'footer'],
    grounds: ['pattern', 'canvas', 'accent', 'tint', 'canvas'],
    heroPattern: 'split headline and lead image', navigation: 'none', footer: 'minimal',
    density: 'comfortable', blockRadius: 'borderRadius-500', sectionGap: 'space-10', cardPadding: 'space-4',
    featureRadius: 'borderRadius-700', factRole: 'display3',
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

// Fixture trees publish briefs for fewer themes than the theme data holds, so these skip theme coverage.
function checkOnly(root) {
  return run(['check-only', '--root', root, '--skip-coverage']);
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
  'a spacing step for the feature radius': [edit(LAYOUT, (p) => ({ ...p, featureRadius: 'space-4' })), /"featureRadius" must be a borderRadius-\* step name$/m],
  'a fact role below the display roles': [edit(LAYOUT, (p) => ({ ...p, factRole: 'title1' })), /event-landing\.json: "factRole" must be one of display1, display2, display3$/m],
  'a ground that is not one of the four': [edit(LAYOUT, (p) => ({ ...p, grounds: ['pattern', 'canvas', 'accent', 'navy', 'canvas'] })), /event-landing\.json: "grounds\.3" must be one of canvas, tint, accent, pattern$/m],
  'grounds that do not match the sections': [edit(LAYOUT, (p) => ({ ...p, grounds: ['pattern', 'canvas', 'accent'] })), /event-landing\.json: "grounds" has 3 items; it gives one ground per section, and there are 5$/m],
  'a pattern ground off the Brand Pattern section': [edit(LAYOUT, (p) => ({ ...p, grounds: ['pattern', 'pattern', 'accent', 'tint', 'canvas'] })), /event-landing\.json: "grounds\.1" is "pattern", but the Brand Pattern section is section 1$/m],
  'a Brand Pattern section on another ground': [edit(LAYOUT, (p) => ({ ...p, grounds: ['canvas', 'canvas', 'accent', 'tint', 'canvas'] })), /event-landing\.json: "grounds\.0" must be "pattern": the Brand Pattern section takes the ground its picks file chooses$/m],
  'a page left on the canvas throughout': [edit(LAYOUT, (p) => ({ ...p, grounds: ['pattern', 'canvas', 'canvas', 'canvas', 'canvas'] })), /event-landing\.json: "grounds" leaves every section on the canvas; give at least one section a tint or accent ground$/m],
  'a feature flag that is not true or false': [edit(OCCASION, (p) => { p.components[1].feature = 'yes'; return p; }), /run\.json: "components\.1\.feature" must be true or false$/m],
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
  'a prompt library input the tool does not supply': [{ [ENTRY]: { ...entry, inputs: [...entry.inputs, 'picks.review'] } }, /tagline\.json: "inputs\.3" is not an input the tool supplies$/m],
  'a prompt library input from an entry not run before it': [{ [ENTRY]: { ...entry, inputs: [...entry.inputs, 'occasion-components.names'] } }, /tagline\.json: "inputs\.3" takes the output of "occasion-components", which "after" does not name$/m],
  'a prompt library target the entry does not check': [{ [ENTRY]: { ...entry, targets: { ...entry.targets, sentences: [1, 2] } } }, /tagline\.json: "targets\.sentences" is not a band tagline checks; its bands are words, firstClauseWords$/m],
  'a mood entry with no accent placement': [{ 'theme-briefs/prompt-library/mood-occasion.json': { ...entry, targets: {}, output: { type: 'object', properties: { paragraph: { type: 'string' } } } } }, /mood-occasion\.json: "output" must have an accentPlacement property$/m],
  'prompt library entries that wait on each other': [{ [ENTRY]: { ...entry, after: ['imagery'] }, 'theme-briefs/prompt-library/imagery.json': { ...entry, targets: {}, after: ['tagline'] } }, [/tagline\.json: "after" makes a cycle through tagline, imagery$/m, /imagery\.json: "after" makes a cycle through tagline, imagery$/m]],
  'a shared placeholder the tool does not fill': [{ 'theme-briefs/prompt-library/shared.json': { preamble: ['Use {{variables}} and {{brandName}}.'], bans: [] } }, /shared\.json: "preamble\.0" has the placeholder \{\{brandName\}\}; placeholders are \{\{variables\}\}, \{\{typeRoles\}\}$/m],
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
  'an accent ground with no accent component': [edit(OCCASION, (p) => { p.components[1].roles = ['palette', 'action']; return p; }), /^theme-briefs\/picks\/club-run\.json: layout "event-landing" gives a section an accent ground, but no component of occasion "run" takes the accent role$/m],
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

// Check 9: a second Club picks file, a twin of club-run unless it changes something.
const twin = (change = (p) => p) => ({ 'theme-briefs/picks/club-race.json': change({ ...structuredClone(valid[PICKS]), briefName: 'Race' }) });
const DISTINCTNESS_REFUSALS = {
  'two picks files of one theme with the same presets': [twin(), /^theme-briefs\/picks\/club-run\.json: has the same occasion, layout and imagery presets as theme-briefs\/picks\/club-race\.json; briefs on one theme differ in at least one preset$/m],
  'two picks files of one theme that differ only in ground': [twin((p) => ({ ...p, brandPattern: { ...p.brandPattern, ground: 75 } })), /^theme-briefs\/picks\/club-run\.json: has the same occasion, layout and imagery presets as theme-briefs\/picks\/club-race\.json; briefs on one theme differ in at least one preset$/m],
  'two picks files of one theme that differ only in colourway': [twin((p) => ({ ...p, brandPattern: { colourway: 'palette', ground: 75 } })), /^theme-briefs\/picks\/club-run\.json: has the same occasion, layout and imagery presets as theme-briefs\/picks\/club-race\.json; briefs on one theme differ in at least one preset, not only in colourway$/m],
};

for (const [name, [changes, expected]] of Object.entries(DISTINCTNESS_REFUSALS)) {
  test(`check-only refuses ${name}`, (t) => assertRefused(t, changes, expected));
}

test('the same presets may serve two themes, and one changed preset makes a distinct brief', (t) => {
  const otherLayout = { ...valid[LAYOUT], slug: 'editorial' };
  const root = fixture(t, {
    'theme-briefs/picks/ultra-run.json': { ...valid[PICKS], theme: 'ultra' },
    'theme-briefs/presets/layout/editorial.json': otherLayout,
    ...twin((p) => ({ ...p, presets: { ...p.presets, layout: 'editorial' } })),
  });
  const { status, out } = checkOnly(root);
  assert.equal(status, 0, out);
  assert.match(out, /3 picks files/);
});

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
  'theme-briefs/records/club-run.json': { brief: 'club-run', accentPlacement: 'Registration call-out' },
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
  const { status, out } = run(['check-only', '--root', root, '--out', join(root, 'elsewhere'), '--skip-coverage']);
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
  // One imagery preset per colourway, so no two briefs of a theme share all three presets (check 9).
  for (const colourway of ['accent', 'support']) files[`theme-briefs/presets/imagery/people-in-action-${colourway}.json`] = { ...valid[IMAGERY], slug: `people-in-action-${colourway}` };
  for (const { theme, colourway, briefName, slug, layout } of MATRIX) {
    const imagery = colourway === 'palette' ? 'people-in-action' : `people-in-action-${colourway}`;
    files[`theme-briefs/picks/${slug}.json`] = { theme, briefName, presets: { occasion: 'run', layout, imagery }, brandPattern: { colourway, ground: 50 } };
    files[`theme-briefs/records/${slug}.json`] = { brief: slug, accentPlacement: 'Registration call-out' };
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
    // Every px value outside a table repeats one of the brief's own table values.
    const tablePx = new Set(text.split('\n').filter((line) => line.startsWith('|')).flatMap((line) => line.match(/\d+px/g) ?? []));
    for (const line of text.split('\n').filter((line) => !line.startsWith('|'))) {
      for (const value of line.match(/\d+px/g) ?? []) assert.ok(tablePx.has(value), `${at}${value} in "${line}"`);
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

test('scripted-only refuses to drop hand-added prose it cannot place', (t) => {
  const BRAND_FLOOR = "Imagery never carries another brand's logo, copy or look, and the Finnomena logo and IBM Plex Sans Thai stay on every screen.";
  const cases = {
    'an added Do bullet': [briefText.replace('- Keep one color family per block.\n', '- Keep one color family per block.\n- Keep forms short.\n'),
      /^registry\/theme-briefs\/club-run\.md: "### Do" has 7 bullets, more than its 5 stock bullets and the occasion preset's 1; not rewritten$/m],
    'a paragraph after the Brand Floor sentence': [briefText.replace(BRAND_FLOOR, `${BRAND_FLOOR}\n\nNo stock photos.`),
      /^registry\/theme-briefs\/club-run\.md: Imagery has text after its Brand Floor sentence, which must come last; not rewritten$/m],
    'a paragraph after a drifted Brand Floor sentence': [briefText.replace(BRAND_FLOOR, `${BRAND_FLOOR.replace('IBM Plex Sans Thai', 'Inter')}\n\nNo stock photos.`),
      /^registry\/theme-briefs\/club-run\.md: Imagery has text after its Brand Floor sentence, which must come last; not rewritten$/m],
    'a hand-added section': [briefText.replace('## Quick Start', '## Notes\n\nKeep the start-line photo.\n\n## Quick Start'),
      /^registry\/theme-briefs\/club-run\.md: section "Notes" is not a Theme Brief section; move its text into a prose section or remove it; not rewritten$/m],
    'a paragraph added to the header': [briefText.replace('\nClub opens the membership', '\nA note for the team.\n\nClub opens the membership'),
      /^registry\/theme-briefs\/club-run\.md: the header has 5 paragraphs; it holds the title and tagline, labels, status and mood paragraph only; not rewritten$/m],
  };
  for (const [name, [text, expected]] of Object.entries(cases)) {
    const root = fixture(t, { ...published(), [BRIEF]: text });
    const { status, out } = scriptedOnly(root);
    assert.equal(status, 1, `${name}: ${out}`);
    assert.match(out, expected, name);
    assert.equal(readFileSync(join(root, BRIEF), 'utf8'), text, name);
    assert.match(checkOnly(root).out, new RegExp(expected.source.replace('; not rewritten', '; its scripted sections cannot be checked'), 'm'), name);
  }
});

test('check-only refuses an occasion component named like a fixed one', (t) => assertRefused(t, edit(OCCASION, (p) => ({ ...p, components: [{ ...p.components[0], name: 'Support Block' }, p.components[1]] })),
  /^theme-briefs\/presets\/occasion\/run\.json: component "Support Block" takes the name of a fixed component$/m));

test('the Colors table marks a block step that is the canvas color', (t) => {
  const root = fixture(t, { ...THEME_TEXTS, 'registry/theme-briefs/ultra-run.md': staleBrief(PROSE, { theme: 'Ultra' }), [PICKS]: null, 'theme-briefs/picks/ultra-run.json': { ...valid[PICKS], theme: 'ultra' } });
  const { status, out } = run(['scripted-only', '--root', root]);
  assert.equal(status, 0, out);
  const brief = readFileSync(join(root, 'registry/theme-briefs/ultra-run.md'), 'utf8');
  assert.match(brief, /^\| Navy 100 \| `#01172b` \| `--immersive-palette-100` \| The canvas color, not a block fill \|$/m);
});

// Draft mode: a fake `claude`, chosen through CLAUDE_PATH, answers each prompt library entry from a
// script of answers per attempt and logs every call, so no test needs a model or the network.
const LIBRARY = 'theme-briefs/prompt-library';
const libraryFiles = () => Object.fromEntries(readdirSync(join(repo, LIBRARY)).map((name) => [`${LIBRARY}/${name}`, readFileSync(join(repo, LIBRARY, name), 'utf8')]));
const FAKE_CLAUDE = `#!${process.execPath}
import { appendFileSync, readFileSync } from 'node:fs';
const args = process.argv.slice(2);
if (args.includes('--version')) { console.log('2.1.316 (Claude Code)'); process.exit(0); }
const prompt = readFileSync(0, 'utf8');
const entry = prompt.match(/^Entry: ([\\w-]+)\\./m)?.[1];
const log = process.env.FAKE_CLAUDE_LOG;
const attempt = readFileSync(log, 'utf8').split('\\n').filter(Boolean).map(JSON.parse).filter((call) => call.entry === entry).length + 1;
appendFileSync(log, JSON.stringify({ entry, attempt, args, prompt }) + '\\n');
const answers = JSON.parse(readFileSync(process.env.FAKE_CLAUDE_ANSWERS, 'utf8'))[entry];
const answer = answers[Math.min(attempt, answers.length) - 1];
if (answer.$exit) { console.error('Invalid API key · Please run /login'); process.exit(answer.$exit); }
// Fields a real result carries that must never reach the record.
const meta = { session_id: '5f0c-session-77', account: 'maintainer@example.com', total_cost_usd: 0.42 };
console.log(JSON.stringify(answer.$raw !== undefined
  ? { type: 'result', is_error: false, result: answer.$raw, ...meta }
  : { type: 'result', is_error: false, result: JSON.stringify(answer), structured_output: answer, ...meta }));
`;

// Answers that pass every hard and soft check on the club-run fixture.
const GOOD = {
  tagline: { tagline: 'Race day on an open canvas — every member invited to one shared start line' },
  'mood-occasion': {
    paragraph: 'For race weekend the accent is saved for the Registration call-out, so the one action members came for is the brightest thing on the page. Everything else stays on the canvas and soft grey blocks, with rounded corners and generous gaps that give each distance room to be compared without a crowd of competing colors. The rhythm is steady rather than loud, the way a long run settles after the first kilometre. The page closes on the start line at dawn, bibs pinned, members shaking out their legs before the horn.',
    accentPlacement: 'Registration call-out',
  },
  'occasion-components': {
    components: [
      { name: 'Race distance card', role: 'Compare the distances on offer', paragraph: 'Each card sits on var(--immersive-palette-50) with var(--immersive-on-palette-50) text, no border, var(--borderRadius-500) corners and var(--space-4) padding. The distance leads in display3 above the start time in body, then one select action. A distance that has filled up says so in body text and offers no action.' },
      { name: 'Registration call-out', role: 'Carry the main registration action', paragraph: 'The call-out sits on var(--immersive-accent-100) with var(--immersive-on-accent-100) text, no border, var(--borderRadius-700) corners and var(--space-4) padding. The deadline sits in title3 above one main action. It appears once, after the distances.' },
    ],
  },
  'preset-dos-donts': {
    dos: ['Show the registration deadline beside every main action on the Race distance card, so members never hunt for the date.'],
    donts: ['Do not use the route map as a decorative background — it hides the distances members came to compare.'],
  },
  imagery: {
    paragraph: 'Photography of members running together leads every screen, framed close and mid so faces and stride carry the energy. Subjects are real members in candid moments on the course, set on the canvas or a soft grey block and never tinted with the accent. Spot illustrations mark small blocks only, such as a distance badge or a water station, drawn in the text color. Icons stay simple line marks beside labels. Images sit beside the hero and its Brand Pattern, never over it, with one large image per screen at most. The page should feel open and unhurried.',
  },
  layout: {
    paragraph: 'A full-bleed page opens on a split hero, its headline beside one lead image, on the pattern ground: the hero is the Brand Pattern section, and the event name is the largest thing on the first screen. Below it a detail list on the canvas sets out the Race distance card set as equal cards, the one set of peers on the page, each led by its distance in display3. A call-out section on the accent ground holds the Registration call-out, a feature block that spans the content column at borderRadius-700. A short form follows on the tint ground for sign-up details, and a minimal footer on the canvas closes the page. There is no navigation bar, so the hero carries the page title. Sections sit at var(--space-10) gaps, with var(--borderRadius-500) corners on every card and var(--space-4) padding inside cards, keeping a comfortable rhythm from top to bottom.',
  },
  'example-prompts': {
    prompts: [
      'Create a Race distance card: var(--immersive-palette-50) fill with var(--immersive-on-palette-50) text, var(--borderRadius-500) corners, var(--space-4) padding, the distance in display3 and the start time in body, with one select action.',
      'Create a Registration call-out: var(--immersive-accent-100) fill with var(--immersive-on-accent-100) text, var(--borderRadius-700) corners, var(--space-4) padding, the deadline in title3 above one main action on var(--immersive-action) with a var(--immersive-on-action) label.',
      'Create a hero section: the canvas with var(--immersive-text) headline in display2, a lead image beside it, and one main action on var(--immersive-action) with a var(--immersive-on-action) label.',
    ],
  },
};

// A temp folder for the fake and its log, outside the fixture root.
function fakeClaude(t, answers) {
  const dir = mkdtempSync(join(tmpdir(), 'neon-fake-claude-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const path = join(dir, 'claude');
  writeFileSync(path, FAKE_CLAUDE, { mode: 0o755 });
  writeFileSync(join(dir, 'answers.json'), JSON.stringify({ ...Object.fromEntries(Object.entries(GOOD).map(([name, answer]) => [name, [answer]])), ...answers }));
  writeFileSync(join(dir, 'calls.log'), '');
  return {
    path,
    env: { CLAUDE_PATH: path, FAKE_CLAUDE_LOG: join(dir, 'calls.log'), FAKE_CLAUDE_ANSWERS: join(dir, 'answers.json') },
    calls: () => readFileSync(join(dir, 'calls.log'), 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line)),
  };
}

function draft(t, { answers = {}, changes = {}, args = [] } = {}) {
  const root = fixture(t, { ...THEME_TEXTS, ...libraryFiles(), ...changes });
  const fake = fakeClaude(t, answers);
  const result = run(['draft', 'club-run', '--root', root, ...args], fake.env);
  return { root, fake, ...result };
}

const local = (root, file) => join(root, '.local/theme-briefs/club-run', file);
const RECORD = 'theme-briefs/records/club-run.json';

test('draft writes a brief that passes check-only, its record, and a review report', (t) => {
  const { root, fake, status, out } = draft(t);
  assert.equal(status, 0, out);
  assert.match(out, /^club-run: written to registry\/theme-briefs\/club-run\.md; review \.local\/theme-briefs\/club-run\/review\.md$/m);
  assert.deepEqual(fake.calls().map(({ entry, attempt }) => `${entry} ${attempt}`).sort(), Object.keys(GOOD).map((name) => `${name} 1`).sort());
  const brief = readFileSync(join(root, BRIEF), 'utf8');
  assert.match(brief, /^> Race day on an open canvas — every member invited to one shared start line$/m);
  assert.ok(brief.includes(GOOD.layout.paragraph));
  assert.equal(readFileSync(local(root, 'draft.md'), 'utf8'), brief);
  const record = JSON.parse(readFileSync(join(root, RECORD), 'utf8'));
  assert.equal(record.accentPlacement, 'Registration call-out');
  // Once the maintainer adds its registry entry, CI passes the brief.
  writeFileSync(join(root, 'registry/registry.json'), JSON.stringify({ name: 'neon', homepage: 'https://example.invalid', items: [{ name: 'theme-brief-club-run', type: 'registry:item' }] }));
  const check = checkOnly(root);
  assert.equal(check.status, 0, check.out);
});

test('every prompt library entry takes the theme kind and mood', () => {
  for (const [path, text] of Object.entries(libraryFiles())) {
    if (path.endsWith('/shared.json')) continue;
    const { inputs } = JSON.parse(text);
    assert.ok(inputs.includes('theme.kind') && inputs.includes('theme.mood'), path);
  }
});

test('the review report gives each entry hash, the scripted-section check and per-section overlap with same-theme briefs', (t) => {
  const first = draft(t);
  assert.equal(first.status, 0, first.out);
  const sibling = {
    'theme-briefs/presets/imagery/trail-crowd.json': { ...valid[IMAGERY], slug: 'trail-crowd' },
    'theme-briefs/picks/club-trail-run.json': { ...valid[PICKS], briefName: 'Trail Run', presets: { ...valid[PICKS].presets, imagery: 'trail-crowd' } },
    'registry/theme-briefs/club-trail-run.md': readFileSync(join(first.root, BRIEF), 'utf8') };
  const { root, status, out } = draft(t, { changes: sibling });
  assert.equal(status, 0, out);
  const report = readFileSync(local(root, 'review.md'), 'utf8');
  const record = JSON.parse(readFileSync(join(root, RECORD), 'utf8'));
  for (const [name, { entry }] of Object.entries(record.entries)) assert.match(report, new RegExp(`^## ${name}\\n\\nEntry ${entry}\\.`, 'm'), name);
  assert.match(report, /^Scripted sections \(.+\): scripted, matches fresh output\.$/m);
  // The sibling holds the same prose, so every model section overlaps fully.
  assert.match(report, /^- club-trail-run: Header 1\.00, Components 1\.00, Do's and Don'ts 1\.00, Imagery 1\.00, Layout 1\.00, Agent Prompt Guide 1\.00$/m);
});

test('soft checks send back a Do longer than one sentence and component slots out of order', (t) => {
  const twoSentences = { ...GOOD['preset-dos-donts'], dos: ['Show the deadline beside every main action on the Race distance card. Members should never hunt for the date at all.'] };
  const outOfOrder = components([]);
  outOfOrder.components[0] = { ...outOfOrder.components[0], paragraph: 'Each card sits on var(--immersive-palette-50) with var(--immersive-on-palette-50) text and var(--space-4) padding, no border and var(--borderRadius-500) corners. The distance leads in display3 above the start time in body, then one select action. A distance that has filled up says so in body text and offers no action.' };
  const { fake, status, out } = draft(t, { answers: { 'preset-dos-donts': [twoSentences, GOOD['preset-dos-donts']], 'occasion-components': [outOfOrder, GOOD['occasion-components']] } });
  assert.equal(status, 0, out);
  assert.match(calls(fake, 'preset-dos-donts')[1].prompt, /^- "dos\.0" has 2 sentences; each bullet is one$/m);
  assert.match(calls(fake, 'occasion-components')[1].prompt, /^- "components\.0\.paragraph" gives padding before border; the slot order is fill, border, radius, padding$/m);
});

test('soft checks send back a component that misses its composition picks, and a Layout that names no ground', (t) => {
  const plain = components([]);
  plain.components[0] = { ...plain.components[0], paragraph: `${plain.components[0].paragraph.replace('leads in display3', 'leads in title2')} Its action sits on var(--immersive-action) with a var(--immersive-on-action) label.` };
  plain.components[1] = { ...plain.components[1], paragraph: plain.components[1].paragraph.replace('var(--borderRadius-700)', 'var(--borderRadius-500)').replace('sits in title3', 'sits in display3') };
  const flat = { paragraph: GOOD.layout.paragraph.replace('on the tint ground ', '').replace('in display3', 'in large type') };
  const { fake, status, out } = draft(t, { answers: { 'occasion-components': [plain, GOOD['occasion-components']], layout: [flat, GOOD.layout] } });
  assert.equal(status, 0, out);
  const sent = calls(fake, 'occasion-components')[1].prompt;
  assert.match(sent, /^- "components\.0\.paragraph" does not set its lead fact \(the distance\) in display3$/m);
  assert.match(sent, /^- "components\.0\.paragraph" names --immersive-action, but the component does not take the action role; its action is the Secondary Action$/m);
  assert.match(sent, /^- "components\.1\.paragraph" names a display role, but the component has no lead fact$/m);
  assert.match(sent, /^- "components\.1\.paragraph" does not round to --borderRadius-700, the feature block radius$/m);
  const layout = calls(fake, 'layout')[1].prompt;
  assert.match(layout, /^- "paragraph" does not name the tint ground$/m);
  assert.match(layout, /^- "paragraph" does not say which facts take display3$/m);
});

test('a soft check sends back a Do that names a display role other than the layout\'s fact role', (t) => {
  const wrong = { ...GOOD['preset-dos-donts'], dos: GOOD['preset-dos-donts'].dos.map((line, index) => index ? line : line.replace(/\.$/, ' in display1.')) };
  const { fake, status, out } = draft(t, { answers: { 'preset-dos-donts': [wrong, GOOD['preset-dos-donts']] } });
  assert.equal(status, 0, out);
  assert.match(calls(fake, 'preset-dos-donts')[1].prompt, /^- "dos\.0" names display1; the layout's lead fact role is display3$/m);
});

test('Layout opens on the scripted section table, theme by theme, and its prose reads back without it', (t) => {
  assert.match(briefText, /^## Layout\n\n\| # \| Section \| Ground \| Fill \| Text \|\n\|---\|---\|---\|---\|---\|\n\| 1 \| hero \| pattern \| `--immersive-accent-50` \| `--immersive-on-accent-50` \|\n\| 2 \| detail-list \| canvas \| `--immersive-canvas` \| `--immersive-text` \|\n\| 3 \| call-out \| accent \| `--immersive-accent-100` \| `--immersive-on-accent-100` \|\n\| 4 \| form \| tint \| `--immersive-palette-100` \| `--immersive-on-palette-100` \|\n\| 5 \| footer \| canvas \| `--immersive-canvas` \| `--immersive-text` \|\n\nRows are in page order\. A `tint`, `accent` or `pattern` ground fills its section edge to edge, with the content column inside it; on `canvas` the section's blocks carry the fills\.\n\nThe page opens on a split hero/m);
  assert.match(briefText, /^- \*\*Feature block radius:\*\* `--borderRadius-700` \(40px\), for a block that spans the content column; cards inside it keep the block and card radius$/m);
  assert.match(briefText, /^- \*\*Lead fact role:\*\* `display3` \(54px\/64px\), for the one fact a component leads with; other component text stops at `title1`$/m);
  // A second scripted-only pass leaves the brief as it is: the prose is read back without the table.
  const root = fixture(t, { ...THEME_TEXTS, [BRIEF]: briefText });
  const { status, out } = run(['scripted-only', '--root', root]);
  assert.equal(status, 0, out);
  assert.equal(readFileSync(join(root, BRIEF), 'utf8'), briefText);
  // On a theme whose canvas is a palette step, the tint ground is the next step down.
  const contained = renderBrief({ ...edit(LAYOUT, (p) => ({ ...p, pageWidth: 'contained' })) });
  assert.match(contained, /ground fills its section to the content column, with the block radius; on `canvas`/);
});

const calls = (fake, name) => fake.calls().filter(({ entry }) => entry === name);
// The Inputs block of a prompt, as sent.
const promptInputs = (prompt) => JSON.parse(prompt.split('\nInputs:\n')[1].split('\n\n')[0]);
const longRole = 'A role that keeps on going well past the eight words a role may have';
const components = (roles) => ({ components: GOOD['occasion-components'].components.map((component, index) => ({ ...component, role: roles[index] ?? component.role })) });

test('draft retries with the last misses, stops at three attempts, and keeps the attempt with fewest misses for later entries', (t) => {
  const reversed = { components: [...GOOD['occasion-components'].components].reverse() };
  const { root, fake, status, out } = draft(t, { answers: { 'occasion-components': [reversed, components([longRole]), components([longRole, longRole])] } });
  assert.equal(status, 0, out);
  const tries = calls(fake, 'occasion-components');
  assert.equal(tries.length, 3);
  assert.doesNotMatch(tries[0].prompt, /Your last answer missed/);
  assert.match(tries[1].prompt, /^- components must be "Race distance card", "Registration call-out", in that order and keeping their names; found "Registration call-out", "Race distance card"$/m);
  assert.match(tries[2].prompt, /^- "components\.0\.role" has 15 words; the target is 1–8$/m);
  // Attempt 2 has one miss and attempt 3 two: entries after it, and the brief, take attempt 2.
  for (const name of ['preset-dos-donts', 'layout', 'example-prompts']) assert.equal(calls(fake, name).length, 1, name);
  assert.deepEqual(promptInputs(calls(fake, 'example-prompts')[0].prompt)['occasion-components.components'], components([longRole]).components);
  assert.deepEqual(promptInputs(calls(fake, 'layout')[0].prompt)['occasion-components.names'], ['Race distance card', 'Registration call-out']);
  assert.match(readFileSync(join(root, BRIEF), 'utf8'), new RegExp(`^### Race distance card\\n\\*\\*Role:\\*\\* ${longRole}$`, 'm'));
  const record = JSON.parse(readFileSync(join(root, RECORD), 'utf8'));
  assert.deepEqual(record.entries['occasion-components'].attempts, [{ hard: 1, soft: 0 }, { hard: 0, soft: 1 }, { hard: 0, soft: 2 }]);
  assert.equal(record.entries['occasion-components'].kept, 2);
});

test('an answer that is not JSON counts as an attempt and is sent back', (t) => {
  const { fake, status, out } = draft(t, { answers: { tagline: [{ $raw: 'Race day on an open canvas' }, GOOD.tagline] } });
  assert.equal(status, 0, out);
  const tries = calls(fake, 'tagline');
  assert.equal(tries.length, 2);
  assert.match(tries[1].prompt, /^- the answer is not JSON$/m);
});

// Fixture files with the drafted outputs left out: what must be unchanged after a run that writes nothing.
const withoutLocal = (files) => Object.fromEntries(Object.entries(files).filter(([path]) => !path.startsWith('/.local/')));
const untouched = (t, root) => snapshot(fixture(t, { ...THEME_TEXTS, ...libraryFiles() }));

test('a persistent hard failure leaves a marked local draft, writes no brief or record, and exits 1', (t) => {
  const hex = { paragraph: GOOD.layout.paragraph.replace('as equal cards', 'as equal #e6eef2 cards') };
  const { root, fake, status, out } = draft(t, { answers: { layout: [hex] } });
  assert.equal(status, 1, out);
  assert.match(out, /^club-run: checks failed; not written\. Draft \.local\/theme-briefs\/club-run\/draft\.md; review \.local\/theme-briefs\/club-run\/review\.md$/m);
  assert.equal(calls(fake, 'layout').length, 3);
  const text = readFileSync(local(root, 'draft.md'), 'utf8');
  assert.match(text, /^## Layout\n\n\*\*Hard checks failed — layout:\*\* prose holds #e6eef2; prose names colors by variable or role, never by value\n\n\| # \| Section \| Ground \| Fill \| Text \|\n[^]*?\n\nRows are in page order\.[^\n]*\n\n\[not drafted\]$/m);
  const report = readFileSync(local(root, 'review.md'), 'utf8');
  assert.match(report, /No attempt of 3 passed its hard checks\./);
  assert.match(report, /^Scripted sections not compared: the draft has failed sections\.$/m);
  assert.deepEqual(withoutLocal(snapshot(root)), untouched(t, root));
});

test('entries after a failed entry are not run, and the draft says what they wait on', (t) => {
  const { root, fake, status, out } = draft(t, { answers: { 'occasion-components': [{ components: 'Race distance card' }] } });
  assert.equal(status, 1, out);
  for (const name of ['preset-dos-donts', 'layout', 'example-prompts']) assert.equal(calls(fake, name).length, 0, name);
  for (const name of ['tagline', 'mood-occasion', 'imagery']) assert.equal(calls(fake, name).length, 1, name);
  const text = readFileSync(local(root, 'draft.md'), 'utf8');
  assert.match(text, /^## Components\n\n\*\*Hard checks failed — occasion-components:\*\* "components" must be an array$/m);
  assert.match(text, /^## Layout\n\n\*\*Not drafted — layout:\*\* it waits on occasion-components, which did not pass its hard checks\.$/m);
  assert.match(text, /^### Registration call-out\n\*\*Role:\*\* \[not drafted\]$/m);
  assert.ok(!statSafe(join(root, BRIEF)) && !statSafe(join(root, RECORD)));
});

function statSafe(path) {
  try {
    return statSync(path);
  } catch {
    return undefined;
  }
}

// Answers refused by a hard check, by entry, and the marker each leaves in the local draft.
const mood = GOOD['mood-occasion'];
const imagery = GOOD.imagery.paragraph;
const DRAFT_REFUSALS = {
  'an answer missing a key': ['tagline', { line: 'Race day' }, /— tagline:\*\* unknown key "line"; missing key "tagline"/],
  'a heading in prose': ['imagery', { paragraph: `## ${imagery}` }, /— imagery:\*\* "paragraph" starts like a Markdown heading or fence/],
  'imagery that opens like the Brand Floor': ['imagery', { paragraph: `Imagery never carries another brand's look. ${imagery}` }, /— imagery:\*\* "paragraph" opens like the Brand Floor sentence, which the tool adds/],
  'a variable the theme does not define': ['occasion-components', components([]), /— occasion-components:\*\* names --immersive-support-50, which Club does not define/, (answer) => { answer.components[0].paragraph = answer.components[0].paragraph.replace('palette-50) with var(--immersive-on-palette-50)', 'support-50) with var(--immersive-on-support-50)'); }],
  'a px value no table holds': ['example-prompts', { prompts: GOOD['example-prompts'].prompts.map((prompt) => prompt.replace('var(--space-4) padding', '11px padding')) }, /— example-prompts:\*\* prose gives 11px, which no table in the brief holds/],
  'a type size off the scale': ['example-prompts', { prompts: GOOD['example-prompts'].prompts.map((prompt) => prompt.replace('the distance in display3', 'the distance at 17px/23px')) }, /prose gives 17px\/23px, which is not a Type Scale size and line height/],
  'a foreign font name': ['example-prompts', { prompts: GOOD['example-prompts'].prompts.map((prompt) => prompt.replace('the distance in display3', 'the distance in Inter')) }, /— example-prompts:\*\* prose names "Inter", a font other than IBM Plex Sans Thai; type comes from the theme/],
  'text from another fill': ['occasion-components', components([]), /— occasion-components:\*\* names --immersive-accent-100 as a fill with --immersive-on-palette-50 text; text on it is --immersive-on-accent-100/, (answer) => { answer.components[1].paragraph = answer.components[1].paragraph.replace('on-accent-100', 'on-palette-50'); }],
  'a gradient': ['imagery', { paragraph: imagery.replace('never tinted with the accent', 'never under a gradient') }, /— imagery:\*\* prose names a gradient; Immersive Themes have none/],
  'motion beyond the level': ['layout', { paragraph: GOOD.layout.paragraph.replace('keeping a comfortable rhythm', 'with staggered entrances, keeping a comfortable rhythm') }, /— layout:\*\* prose names "staggered", which the subtle motion level does not allow/],
  'a duration beyond the level': ['layout', { paragraph: GOOD.layout.paragraph.replace('from top to bottom', 'from top to bottom over 600ms') }, /— layout:\*\* prose gives 600ms, more than the subtle motion level's 250ms/],
  'a value in the tagline': ['tagline', { tagline: 'Race day on var(--immersive-canvas) — every member invited to one shared start line' }, /— tagline:\*\* "tagline" holds a value \(var\(\), a variable or px\); this part names none/],
  'a px value in Layout': ['layout', { paragraph: GOOD.layout.paragraph.replace('at var(--space-10) gaps', 'at 64px gaps') }, /— layout:\*\* "paragraph" holds 64px; Layout names spacing by step, never in px/],
  'words copied from the example': ['imagery', { paragraph: `${imagery} Close photographs of hands at the wheel lead, cropped tight.` }, /— imagery:\*\* copies eight or more words from the example \("close photographs of hands at the wheel lead"\)/],
  'a Do for no intent': ['preset-dos-donts', { ...GOOD['preset-dos-donts'], dos: [...GOOD['preset-dos-donts'].dos, GOOD['preset-dos-donts'].dos[0]] }, /— preset-dos-donts:\*\* "dos" must have 1 bullets, one per intent; has 2/],
  'an accent placement not in the brief': ['mood-occasion', { ...mood, accentPlacement: 'Race distance card' }, /— mood-occasion:\*\* "accentPlacement" must be one of "Registration call-out", "Brand Pattern section"/],
  'a mood that does not name its accent placement': ['mood-occasion', { ...mood, accentPlacement: 'Brand Pattern section' }, /— mood-occasion:\*\* the mood paragraph does not name its accent placement "Brand Pattern section"/],
};

for (const [name, [entryName, answer, expected, change]] of Object.entries(DRAFT_REFUSALS)) {
  test(`draft refuses ${name}`, (t) => {
    const bad = structuredClone(answer);
    change?.(bad);
    const { root, fake, status, out } = draft(t, { answers: { [entryName]: [bad] } });
    assert.equal(status, 1, out);
    assert.equal(calls(fake, entryName).length, 3);
    assert.match(readFileSync(local(root, 'draft.md'), 'utf8'), expected);
    assert.ok(!statSafe(join(root, RECORD)));
  });
}

test('draft refuses prose that names a preset source', (t) => {
  const named = { paragraph: GOOD.layout.paragraph.replace('A full-bleed page', 'An Example-Run style full-bleed page') };
  const { root, status, out } = draft(t, { answers: { layout: [named] }, changes: thirdParty('reviewed') });
  assert.equal(status, 1, out);
  assert.match(readFileSync(local(root, 'draft.md'), 'utf8'), /— layout:\*\* names "example-run", a preset source; no source name ships/);
});

test('each entry receives only the inputs it declares, and never a source or review record', (t) => {
  const partial = { ...review('partially-reviewed'), approved_properties: ['structure'], reviewer: 'Pat Reviewer' };
  const changes = {
    ...edit(LAYOUT, (p) => ({ ...p, source: source('https://www.example-run.com/events') })),
    ...edit(IMAGERY, (p) => ({ ...p, source: source('https://photos.example-run.com/gallery') })),
    ...edit(PICKS, (p) => ({ ...p, review: partial })),
  };
  const { fake, status, out } = draft(t, { changes });
  assert.equal(status, 0, out);
  const library = libraryFiles();
  for (const { entry: name, prompt, args } of fake.calls()) {
    const declared = JSON.parse(library[`${LIBRARY}/${name}.json`]).inputs;
    assert.deepEqual(Object.keys(promptInputs(prompt)).sort(), [...declared].sort(), name);
    for (const leak of ['example-run', 'https://', 'Pat Reviewer', 'measuredOn', 'robotsDisallowed', 'approved_properties', 'partially-reviewed']) {
      assert.ok(!prompt.includes(leak) && !args.some((arg) => arg.includes(leak)), `${name} prompt carries ${leak}`);
    }
  }
});

const sha256 = (text) => createHash('sha256').update(text).digest('hex');

test('the authoring record holds versions, labels and hashes, and nothing about the account or machine', (t) => {
  const { root, fake, status, out } = draft(t, { args: ['--model', 'claude-sonnet-5-5', '--account', 'neutral-account'] });
  assert.equal(status, 0, out);
  const text = readFileSync(join(root, RECORD), 'utf8');
  const record = JSON.parse(text);
  assert.deepEqual(Object.keys(record), ['brief', 'tool', 'claudeCode', 'account', 'entries', 'accentPlacement']);
  // Each entry carries the hash of shared.json as committed, so the record shows which briefs used an older one.
  const shared = JSON.parse(libraryFiles()[`${LIBRARY}/shared.json`]);
  for (const [name, entry] of Object.entries(record.entries)) assert.equal(entry.shared, sha256(JSON.stringify(Object.fromEntries(Object.entries(shared).sort()))), name);
  assert.equal(record.tool.commit, null);
  assert.match(record.tool.version, /^[0-9a-f]{64}$/);
  assert.deepEqual(record.claudeCode, { version: '2.1.316', model: 'claude-sonnet-5-5', effort: 'high', modelOverride: true });
  assert.equal(record.account, 'neutral-account');
  // An output hash is the SHA-256 of the prose read back from the brief, as JSON with sorted keys.
  assert.equal(record.entries.layout.output, sha256(JSON.stringify({ paragraph: GOOD.layout.paragraph })));
  assert.equal(record.entries.tagline.output, sha256(JSON.stringify({ tagline: GOOD.tagline.tagline })));
  assert.equal(record.entries['mood-occasion'].output, sha256(JSON.stringify({ paragraph: mood.paragraph })));
  for (const leak of ['maintainer@example.com', '5f0c-session-77', '0.42', fake.path, root, tmpdir(), 'Race day']) assert.ok(!text.includes(leak), `record carries ${leak}`);
  for (const { args } of fake.calls()) {
    assert.deepEqual(args.slice(0, 15), ['-p', '--model', 'claude-sonnet-5-5', '--effort', 'high', '--tools', '', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}', '--setting-sources', 'local', '--no-session-persistence', '--system-prompt', args[14]]);
  }
});

test('a Claude Code that cannot answer stops the run before anything is written', (t) => {
  const { root, fake, status, out } = draft(t, { answers: { imagery: [{ $exit: 1 }] } });
  assert.equal(status, 1, out);
  assert.match(out, /^Claude Code exited with 1: Invalid API key · Please run \/login\. Nothing was written\.$/m);
  assert.equal(calls(fake, 'imagery').length, 1);
  assert.deepEqual(snapshot(root), untouched(t, root));
});

test('a missing Claude Code stops the run before anything is written', (t) => {
  const root = fixture(t, { ...THEME_TEXTS, ...libraryFiles() });
  const { status, out } = run(['club-run', '--root', root], { CLAUDE_PATH: join(root, 'no-claude-here') });
  assert.equal(status, 1, out);
  assert.match(out, /^Claude Code was not found; install it or set CLAUDE_PATH\. Nothing was written\.$/m);
  assert.deepEqual(snapshot(root), untouched(t, root));
});

// CI on committed briefs: check 4 on the prose read back from the brief, and check 10 against its record.
const proseBrief = (prose) => renderBrief({ [BRIEF]: staleBrief({ ...PROSE, ...prose }) });
const withRecord = (accentPlacement) => ({ ...published(), [RECORD]: { brief: 'club-run', accentPlacement } });
const COMMITTED_REFUSALS = {
  'prose with a px value no table holds': [{ ...published(), [BRIEF]: proseBrief({ layout: `${PROSE.layout} Cards keep 11px padding.` }) }, /^registry\/theme-briefs\/club-run\.md: prose gives 11px, which no table in the brief holds$/m],
  'prose that names a foreign font': [{ ...published(), [BRIEF]: proseBrief({ layout: `${PROSE.layout} Headlines are set in Finnomena Trek, not IBM Plex Sans.` }) }, [
    /^registry\/theme-briefs\/club-run\.md: prose names "Finnomena Trek", a font other than IBM Plex Sans Thai; type comes from the theme$/m,
    /^registry\/theme-briefs\/club-run\.md: prose names "IBM Plex Sans", a font other than IBM Plex Sans Thai; type comes from the theme$/m,
  ]],
  'a fill paired with another family\'s text': [{ ...published(), [BRIEF]: proseBrief({ prompts: [PROSE.prompts[0], 'Build the registration call-out on var(--immersive-accent-100) with var(--immersive-on-palette-100) text.'] }) },
    /^registry\/theme-briefs\/club-run\.md: names --immersive-accent-100 as a fill with --immersive-on-palette-100 text; text on it is --immersive-on-accent-100$/m],
  'a fill paired with another step\'s text': [{ ...published(), [BRIEF]: proseBrief({ layout: `${PROSE.layout} Detail rows sit on var(--immersive-palette-50) with var(--immersive-on-palette-75) labels.` }) },
    /^registry\/theme-briefs\/club-run\.md: names --immersive-palette-50 as a fill with --immersive-on-palette-75 text; text on it is --immersive-on-palette-50$/m],
  'a filled block with the canvas text': [{ ...published(), [BRIEF]: proseBrief({ layout: `${PROSE.layout} The form sits on var(--immersive-palette-25) in var(--immersive-text).` }) },
    /^registry\/theme-briefs\/club-run\.md: names --immersive-palette-25 as a fill with --immersive-text text; text on it is --immersive-on-palette-25$/m],
  'the canvas paired with a block\'s text': [{ ...published(), [BRIEF]: proseBrief({ layout: `${PROSE.layout} The footer sits on var(--immersive-canvas) with var(--immersive-on-palette-50) links.` }) },
    /^registry\/theme-briefs\/club-run\.md: names --immersive-canvas as a fill with --immersive-on-palette-50 text; text on it is --immersive-text$/m],
  'a paired fill beside another block\'s text': [{ ...published(), [BRIEF]: proseBrief({ layout: `${PROSE.layout} Detail rows sit on var(--immersive-palette-50) with var(--immersive-on-palette-50) titles and var(--immersive-on-accent-100) links.` }) },
    /^registry\/theme-briefs\/club-run\.md: names --immersive-on-accent-100 text beside --immersive-palette-50, whose text is --immersive-on-palette-50$/m],
  'a paired fill beside the canvas text': [{ ...published(), [BRIEF]: proseBrief({ layout: `${PROSE.layout} Cards sit on var(--immersive-palette-50) with var(--immersive-text) captions and var(--immersive-on-palette-50) titles.` }) },
    /^registry\/theme-briefs\/club-run\.md: names --immersive-text text beside --immersive-palette-50, whose text is --immersive-on-palette-50$/m],
  'prose that names a gradient': [{ ...published(), [BRIEF]: proseBrief({ imagery: `${PROSE.imagery} Photos fade into a gradient.` }) }, /^registry\/theme-briefs\/club-run\.md: prose names a gradient; Immersive Themes have none$/m],
  'prose with motion beyond its level': [{ ...published(), [BRIEF]: proseBrief({ layout: `${PROSE.layout} Cards stagger in.` }) }, /^registry\/theme-briefs\/club-run\.md: prose names "stagger", which the subtle motion level does not allow$/m],
  'a record whose accent placement is not the brief\'s': [withRecord('Race distance card'), /^registry\/theme-briefs\/club-run\.md: accent placement "Race distance card" is not one of Registration call-out, Brand Pattern section$/m],
  'a record with no accent placement': [{ ...published(), [RECORD]: { brief: 'club-run' } }, /^registry\/theme-briefs\/club-run\.md: accent placement null is not one of Registration call-out, Brand Pattern section$/m],
  'a mood that does not name its recorded accent placement': [withRecord('Brand Pattern section'), /^registry\/theme-briefs\/club-run\.md: the mood paragraph does not name its accent placement "Brand Pattern section"$/m],
};

for (const [name, [changes, expected]] of Object.entries(COMMITTED_REFUSALS)) {
  test(`check-only refuses ${name}`, (t) => assertRefused(t, changes, expected));
}

test('check-only reports a variable the theme lacks once, though prose and color checks both find it', (t) => {
  const prose = { components: [[PROSE.components[0][0], PROSE.components[0][1], 'It sits on var(--immersive-support-50) with var(--immersive-on-support-50) text.'], PROSE.components[1]] };
  const { status, out } = checkOnly(fixture(t, { ...published(), [BRIEF]: proseBrief(prose) }));
  assert.equal(status, 1, out);
  assert.equal(out.match(/names --immersive-support-50, which Club does not define$/gm)?.length, 1, out);
});

test('prose may name the theme\'s own typeface', (t) => {
  const { status, out } = checkOnly(fixture(t, { ...published(), [BRIEF]: proseBrief({ layout: `${PROSE.layout} Every headline stays in IBM Plex Sans Thai.` }) }));
  assert.equal(status, 0, out);
});

test('a sentence may pair several fills, each with its own text, beside the canvas text', (t) => {
  const prompt = 'Build a hero on the canvas with a var(--immersive-text) headline, a var(--immersive-accent-100) badge with var(--immersive-on-accent-100) text, and one main action on var(--immersive-action) with a var(--immersive-on-action) label.';
  const { status, out } = checkOnly(fixture(t, { ...published(), [BRIEF]: proseBrief({ prompts: [...PROSE.prompts, prompt] }) }));
  assert.equal(status, 0, out);
});

test('a fill with no text named is sent back, then kept as a review warning, and CI passes it', (t) => {
  const lone = { prompts: GOOD['example-prompts'].prompts.map((prompt, index) => index ? prompt : prompt.replace(' with var(--immersive-on-palette-50) text', '')) };
  const { root, fake, status, out } = draft(t, { answers: { 'example-prompts': [lone] } });
  assert.equal(status, 0, out);
  const sent = calls(fake, 'example-prompts');
  assert.equal(sent.length, 3);
  assert.match(sent[1].prompt, /^- names --immersive-palette-50 as a fill with no text; name --immersive-on-palette-50 in the same sentence$/m);
  assert.match(readFileSync(local(root, 'review.md'), 'utf8'), /^- Warning: names --immersive-palette-50 as a fill with no text; name --immersive-on-palette-50 in the same sentence$/m);
  assert.ok(readFileSync(join(root, BRIEF), 'utf8').includes(lone.prompts[0]));
  writeFileSync(join(root, 'registry/registry.json'), JSON.stringify({ name: 'neon', homepage: 'https://example.invalid', items: [{ name: 'theme-brief-club-run', type: 'registry:item' }] }));
  const check = checkOnly(root);
  assert.equal(check.status, 0, check.out);
});

test('a font whose name starts with another listed font is reported once', (t) => {
  const { status, out } = checkOnly(fixture(t, { ...published(), [BRIEF]: proseBrief({ layout: `${PROSE.layout} Thai captions use Noto Sans Thai.` }) }));
  assert.equal(status, 1, out);
  assert.match(out, /^registry\/theme-briefs\/club-run\.md: prose names "Noto Sans Thai", a font other than IBM Plex Sans Thai; type comes from the theme$/m);
  assert.doesNotMatch(out, /prose names "Noto Sans",/);
});

test('an abbreviation does not end the sentence that pairs a fill with its text', (t) => {
  const abbreviated = { prompts: [...GOOD['example-prompts'].prompts.slice(0, 2), 'Create a sold-out Race distance card: a small var(--immersive-accent-100) badge, e.g. one short word in var(--immersive-on-accent-100) text, sits above the start time in body, with var(--space-4) padding and no select action.'] };
  const { fake, status, out } = draft(t, { answers: { 'example-prompts': [abbreviated] } });
  assert.equal(status, 0, out);
  assert.equal(calls(fake, 'example-prompts').length, 1);
});

// Redraft and accept run on a brief drafted with GOOD answers. Each later run gets a fresh fake, so its
// attempts count from 1.
function drafted(t) {
  const first = draft(t);
  assert.equal(first.status, 0, first.out);
  return first.root;
}
function again(t, root, args, answers = {}) {
  const fake = fakeClaude(t, answers);
  return { fake, ...run([...args, '--root', root], fake.env) };
}
function handEdit(path, from, to) {
  const text = readFileSync(path, 'utf8');
  assert.ok(text.includes(from), `${path} lacks ${from}`);
  writeFileSync(path, text.replace(from, to));
}
const STEADY = ['keeping a comfortable rhythm from top to bottom', 'keeping a steady rhythm from top to bottom'];

test('redraft refuses to overwrite a hand-edited section after the named entry, before any model call', (t) => {
  const root = drafted(t);
  handEdit(join(root, BRIEF), ...STEADY);
  const before = snapshot(root);
  const { fake, status, out } = again(t, root, ['redraft', 'club-run', 'occasion-components']);
  assert.equal(status, 1, out);
  assert.match(out, /^club-run: layout is hand-edited; add --discard layout to overwrite it$/m);
  assert.match(out, /^Redraft: nothing redrafted; fix the problems above$/m);
  assert.equal(fake.calls().length, 0);
  assert.deepEqual(snapshot(root), before);
});

test('redraft with --discard regenerates the named entry and those after it, and keeps every other section and its record entry', (t) => {
  const root = drafted(t);
  const tagline = ['every member invited to one shared start line', 'every member welcome at one shared start line'];
  handEdit(join(root, BRIEF), ...tagline);
  handEdit(join(root, BRIEF), ...STEADY);
  const before = JSON.parse(readFileSync(join(root, RECORD), 'utf8'));
  const calm = { paragraph: GOOD.layout.paragraph.replace('a comfortable rhythm', 'a calm rhythm') };
  const { fake, status, out } = again(t, root, ['redraft', 'club-run', 'occasion-components', '--discard', 'layout'], { layout: [calm] });
  assert.equal(status, 0, out);
  assert.match(out, /^club-run: written to registry\/theme-briefs\/club-run\.md; review \.local\/theme-briefs\/club-run\/review\.md$/m);
  assert.deepEqual(fake.calls().map(({ entry }) => entry).sort(), ['example-prompts', 'layout', 'occasion-components', 'preset-dos-donts']);
  const brief = readFileSync(join(root, BRIEF), 'utf8');
  assert.ok(brief.includes(tagline[1]) && brief.includes(calm.paragraph) && !brief.includes(STEADY[1]));
  const after = JSON.parse(readFileSync(join(root, RECORD), 'utf8'));
  // The kept tagline keeps its record entry, so it still reads as hand-edited.
  for (const name of ['tagline', 'mood-occasion', 'imagery']) assert.deepEqual(after.entries[name], before.entries[name], name);
  assert.equal(after.entries.layout.output, sha256(JSON.stringify(calm)));
  assert.match(readFileSync(local(root, 'review.md'), 'utf8'), /^## tagline\n\nEntry [0-9a-f]{64}\.\n\nNot redrafted: kept from the committed brief\.$/m);
  const check = again(t, root, ['redraft', 'club-run', 'tagline']);
  assert.match(check.out, /^club-run: tagline is hand-edited; add --discard tagline to overwrite it$/m);
});

test('redrafted entries take kept sections as the brief reads now, hand edits included', (t) => {
  const root = drafted(t);
  handEdit(join(root, BRIEF), '**Role:** Compare the distances on offer', '**Role:** Compare every distance on offer');
  const { fake, status, out } = again(t, root, ['redraft', 'club-run', 'example-prompts']);
  assert.equal(status, 0, out);
  assert.deepEqual(fake.calls().map(({ entry }) => entry), ['example-prompts']);
  assert.equal(promptInputs(fake.calls()[0].prompt)['occasion-components.components'][0].role, 'Compare every distance on offer');
});

test('a changed entry file triggers no redraft, and redraft names the kept sections drafted from an older entry', (t) => {
  const root = drafted(t);
  const imagery = join(root, LIBRARY, 'imagery.json');
  const data = JSON.parse(readFileSync(imagery, 'utf8'));
  writeFileSync(imagery, JSON.stringify({ ...data, rules: [...data.rules, 'Keep each image beside its section.'] }));
  const before = JSON.parse(readFileSync(join(root, RECORD), 'utf8')).entries.imagery;
  const { fake, status, out } = again(t, root, ['redraft', 'club-run', 'tagline']);
  assert.equal(status, 0, out);
  assert.deepEqual(fake.calls().map(({ entry }) => entry), ['tagline']);
  assert.match(out, /^club-run: kept imagery, drafted from an older entry or shared\.json; name it to redraft it$/m);
  assert.equal(out.match(/drafted from an older entry/g).length, 1, out);
  assert.deepEqual(JSON.parse(readFileSync(join(root, RECORD), 'utf8')).entries.imagery, before);
});

test('redraft refuses an unknown entry, a discard it would not rewrite, and a brief with no record', (t) => {
  const root = drafted(t);
  const unknown = again(t, root, ['redraft', 'club-run', 'hero']);
  assert.equal(unknown.status, 1, unknown.out);
  assert.match(unknown.out, /^"hero" is not a prompt library entry \(tagline, mood-occasion, /m);
  const stray = again(t, root, ['redraft', 'club-run', 'layout', '--discard', 'tagline']);
  assert.match(stray.out, /^club-run: --discard tagline names an entry this redraft does not rewrite$/m);
  rmSync(join(root, RECORD));
  const before = snapshot(root);
  const { fake, status, out } = again(t, root, ['redraft', 'club-run', 'layout']);
  assert.equal(status, 1, out);
  assert.match(out, /^club-run: redraft needs the committed brief registry\/theme-briefs\/club-run\.md and its authoring record theme-briefs\/records\/club-run\.json; run draft first$/m);
  assert.equal(fake.calls().length, 0);
  assert.deepEqual(snapshot(root), before);
});

// A draft whose layout failed its hard checks: a marker and a placeholder under ## Layout.
function failedLayout(t) {
  const hex = { paragraph: GOOD.layout.paragraph.replace('as equal cards', 'as equal #e6eef2 cards') };
  const { root, status, out } = draft(t, { answers: { layout: [hex] } });
  assert.equal(status, 1, out);
  return root;
}
// The marker sits under the heading and the placeholder under the scripted section table.
const FAILED_LAYOUT = /\*\*Hard checks failed — layout:\*\*[^\n]*\n\n/;
function fixLayout(root, paragraph) {
  const path = local(root, 'draft.md');
  writeFileSync(path, readFileSync(path, 'utf8').replace(FAILED_LAYOUT, '').replace('[not drafted]', paragraph));
}
const accept = (root) => run(['accept', 'club-run', '--root', root]);

test('accept writes a hand-fixed draft once every check passes, and records the section as hand-edited', (t) => {
  const root = failedLayout(t);
  const fixed = GOOD.layout.paragraph.replace(...STEADY);
  fixLayout(root, fixed);
  const { status, out } = accept(root);
  assert.equal(status, 0, out);
  assert.match(out, /^club-run: accepted; written to registry\/theme-briefs\/club-run\.md; hand-edited: layout$/m);
  const brief = readFileSync(join(root, BRIEF), 'utf8');
  assert.equal(brief, readFileSync(local(root, 'draft.md'), 'utf8'));
  assert.ok(brief.includes(fixed));
  const record = JSON.parse(readFileSync(join(root, RECORD), 'utf8'));
  assert.equal(record.entries.layout.handEdited, true);
  // The model produced no layout, so the record has no output hash for it.
  assert.equal(record.entries.layout.output, null);
  assert.deepEqual(Object.keys(record.entries).filter((name) => record.entries[name].handEdited), ['layout']);
  assert.equal(record.accentPlacement, 'Registration call-out');
  writeFileSync(join(root, 'registry/registry.json'), JSON.stringify({ name: 'neon', homepage: 'https://example.invalid', items: [{ name: 'theme-brief-club-run', type: 'registry:item' }] }));
  const check = checkOnly(root);
  assert.equal(check.status, 0, check.out);
  // An accepted hand edit is protected from a later redraft.
  const redraft = again(t, root, ['redraft', 'club-run', 'layout']);
  assert.match(redraft.out, /^club-run: layout is hand-edited; add --discard layout to overwrite it$/m);
});

test('accept refuses a draft with a remaining hard failure, and writes nothing', (t) => {
  const root = failedLayout(t);
  fixLayout(root, GOOD.layout.paragraph.replace('as equal cards', 'as equal #e6eef2 cards'));
  const before = snapshot(root);
  const { status, out } = accept(root);
  assert.equal(status, 1, out);
  assert.match(out, /^\.local\/theme-briefs\/club-run\/draft\.md: layout: prose holds #e6eef2; prose names colors by variable or role, never by value$/m);
  assert.match(out, /^club-run: not accepted; nothing written$/m);
  assert.deepEqual(snapshot(root), before);
});

test('accept refuses a draft that still holds a marker or placeholder', (t) => {
  const root = failedLayout(t);
  const before = snapshot(root);
  const { status, out } = accept(root);
  assert.equal(status, 1, out);
  assert.match(out, /^\.local\/theme-briefs\/club-run\/draft\.md: still holds "\*\*Hard checks failed —"; replace the marker with the section's prose$/m);
  assert.match(out, /^\.local\/theme-briefs\/club-run\/draft\.md: still holds "\[not drafted\]"; replace the placeholder with the section's prose$/m);
  assert.deepEqual(snapshot(root), before);
});

test('accept checks each entry as the draft reads, and passes soft misses on as warnings', (t) => {
  const root = drafted(t);
  const path = local(root, 'draft.md');
  handEdit(path, 'every member invited to one shared start line', 'every member invited to one shared start line on a Sunday Morning');
  handEdit(path, '### Registration call-out', '### Registration panel');
  const { status, out } = accept(root);
  assert.equal(status, 1, out);
  assert.match(out, /: occasion-components: components must be "Race distance card", "Registration call-out", in that order/);
  handEdit(path, '### Registration panel', '### Registration call-out');
  const second = accept(root);
  assert.equal(second.status, 0, second.out);
  assert.match(second.out, /^club-run: warning — tagline: "tagline" capitalizes "Sunday"; taglines are sentence case$/m);
  assert.match(second.out, /hand-edited: tagline$/m);
});

test('a redraft record describes the latest run: its model, effort and account label', (t) => {
  const root = drafted(t);
  const plain = again(t, root, ['redraft', 'club-run', 'tagline']);
  assert.equal(plain.status, 0, plain.out);
  const record = JSON.parse(readFileSync(join(root, RECORD), 'utf8'));
  assert.deepEqual(Object.keys(record), ['brief', 'tool', 'claudeCode', 'account', 'entries', 'accentPlacement']);
  assert.equal(record.account, 'maintainer-sign-in');
  const flagged = again(t, root, ['redraft', 'club-run', 'tagline', '--model', 'claude-sonnet-5-5', '--account', 'neutral-key']);
  assert.equal(flagged.status, 0, flagged.out);
  const after = JSON.parse(readFileSync(join(root, RECORD), 'utf8'));
  assert.deepEqual(after.claudeCode, { version: '2.1.316', model: 'claude-sonnet-5-5', effort: 'high', modelOverride: true });
  assert.equal(after.account, 'neutral-key');
});

// Check 11, theme coverage. Fixture trees cover one theme, so their check-only skips it; these run it.
const covered = (root, ...args) => run(['check-only', '--root', root, ...args]);

test('check-only refuses a theme with no theme text or no published brief', (t) => {
  const { status, out } = covered(fixture(t));
  assert.equal(status, 1, out);
  for (const id of ['exclusive', 'private', 'ultra']) assert.match(out, new RegExp(`^theme-briefs/themes/${id}\\.json: missing; every Immersive Theme needs a theme text$`, 'm'));
  assert.doesNotMatch(out, /^theme-briefs\/themes\/club\.json: missing/m);
  for (const label of ['Club', 'Exclusive', 'Private', 'Ultra']) assert.match(out, new RegExp(`^registry/theme-briefs: ${label} has no published brief; every Immersive Theme needs at least one$`, 'm'));
});

test('theme coverage counts a theme\'s published brief, in the folder --out names', (t) => {
  const { status, out } = covered(fixture(t, published()));
  assert.equal(status, 1, out);
  assert.doesNotMatch(out, /: missing; every Immersive Theme needs a theme text$/m);
  assert.doesNotMatch(out, /Club has no published brief/);
  assert.equal(out.match(/has no published brief/g).length, 3, out);
  const moved = fixture(t, { ...published(), [BRIEF]: null, 'elsewhere/club-run.md': briefText });
  assert.match(covered(moved, '--out', join(moved, 'elsewhere')).out, /^elsewhere: Exclusive has no published brief; every Immersive Theme needs at least one$/m);
});

// On the Neon base the theme reaches shadcn's slots through ImmersiveLayout, whose stylesheet maps them;
// an attribute set by hand on another root gets the variables and no mapping.
test('a brief themes the page through ImmersiveLayout, never an attribute set by hand on the page root', () => {
  const section = (heading) => briefText.split(`\n## ${heading}\n`)[1].split('\n## ')[0];
  assert.match(section('Quick Start'), /^Build on the Neon base\. Add `@neon\/theme`, `@neon\/immersive-themes` and this brief's item, `@neon\/theme-brief-club-run`, then pass `immersiveTheme="club"` to `ImmersiveLayout`\./m);
  assert.match(section("Do's and Don'ts"), /^- Pass `immersiveTheme="club"` to `ImmersiveLayout`/m);
  assert.doesNotMatch(briefText, /on the page root/);
});
