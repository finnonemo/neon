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
      { name: 'Race distance card', role: 'compare the distances on offer', contentNotes: 'distance, start time, one select action' },
      { name: 'Registration call-out', role: 'carry the main registration action', contentNotes: 'deadline and the main action' },
    ],
    dos: ['show the registration deadline next to every main action'],
    donts: ['use the route map as a decorative background'],
    secondaryHighlights: ['green'],
  },
  'theme-briefs/presets/imagery/people-in-action.json': {
    kind: 'imagery', slug: 'people-in-action',
    leads: 'photography of members taking part', subject: 'real members, candid', illustration: 'spot illustrations for what a photo cannot explain',
  },
  'theme-briefs/picks/club-run.json': {
    theme: 'club', briefName: 'Run',
    presets: { occasion: 'run', imagery: 'people-in-action' },
    brandPattern: { blockColourway: 'white__yellow-100' },
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
  assert.match(out, /^Theme Brief check: 4 themes, 2 presets, 1 picks file, 1 theme text, 0 prompt library entries, 0 briefs; no problems$/m);
  assert.deepEqual(snapshot(root), before);
});

const OCCASION = 'theme-briefs/presets/occasion/run.json';
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
  'an unknown nested key': [edit(PICKS, (p) => ({ ...p, brandPattern: { ...p.brandPattern, tone: 'warm' } })), /^theme-briefs\/picks\/club-run\.json: unknown key "brandPattern\.tone"$/m],
  'a missing key': [edit(IMAGERY, ({ subject, ...p }) => p), /^theme-briefs\/presets\/imagery\/people-in-action\.json: missing key "subject"$/m],
  'a hex-like string': [edit(OCCASION, (p) => ({ ...p, moodIntent: 'a navy #01172b evening' })), /^theme-briefs\/presets\/occasion\/run\.json: "moodIntent" holds a hex-like value$/m],
  'a short hex in a nested list': [edit(OCCASION, (p) => { p.components[0].contentNotes = 'price in #fc0'; return p; }), /^theme-briefs\/presets\/occasion\/run\.json: "components\.0\.contentNotes" holds a hex-like value$/m],
  'a font field': [edit(IMAGERY, (p) => ({ ...p, fontFamily: 'Inter' })), /^theme-briefs\/presets\/imagery\/people-in-action\.json: "fontFamily" is a font field; type comes from the theme$/m],
  'a px value': [edit(IMAGERY, (p) => ({ ...p, leads: 'a 640px photograph' })), /^theme-briefs\/presets\/imagery\/people-in-action\.json: "leads" holds a px value$/m],
  'a layout preset': [edit(PICKS, (p) => ({ ...p, presets: { ...p.presets, layout: 'event-landing' } })), /^theme-briefs\/picks\/club-run\.json: unknown key "presets\.layout"$/m],
  'a Brand Pattern ground': [edit(PICKS, (p) => ({ ...p, brandPattern: { ...p.brandPattern, ground: 50 } })), /^theme-briefs\/picks\/club-run\.json: unknown key "brandPattern\.ground"$/m],
  'a component look': [edit(OCCASION, (p) => { p.components[0].roles = ['palette']; return p; }), /run\.json: unknown key "components\.0\.roles"$/m],
  'a secondary highlight': [edit(OCCASION, (p) => ({ ...p, secondaryHighlights: ['teal'] })), /"secondaryHighlights\.0" must be one of green, blue, purple, red, orange$/m],
  'a Block Colourway Block does not draw': [edit(PICKS, (p) => ({ ...p, brandPattern: { ...p.brandPattern, blockColourway: 'yellow__navy-100' } })), /"brandPattern\.blockColourway" must be one of navy__yellow-100, .*white__navy-100$/m],
  'too few components': [edit(OCCASION, (p) => ({ ...p, components: p.components.slice(0, 1) })), /"components" must have 2–6 items, has 1$/m],
  'too many components': [edit(OCCASION, (p) => ({ ...p, components: Array(7).fill(p.components[0]) })), /"components" must have 2–6 items, has 7$/m],
  'too many dos': [edit(OCCASION, (p) => ({ ...p, dos: ['a', 'b', 'c', 'd'] })), /"dos" must have 1–3 items, has 4$/m],
  'no donts': [edit(OCCASION, (p) => ({ ...p, donts: [] })), /"donts" must have 1–3 items, has 0$/m],
  'a wrong type': [edit(PICKS, (p) => ({ ...p, brandPattern: 'white__yellow-100' })), /club-run\.json: "brandPattern" must be an object$/m],
  'a kind that does not match its folder': [edit(IMAGERY, (p) => ({ ...p, kind: 'occasion' })), /people-in-action\.json: "kind" must be one of imagery$/m],
  'a slug that does not match its file name': [edit(IMAGERY, (p) => ({ ...p, slug: 'people' })), /people-in-action\.json: "slug" must match the file name "people-in-action"$/m],
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
  'a prompt library entry that takes a source': [{ [ENTRY]: { ...entry, inputs: [...entry.inputs, 'imagery.source'] } }, /tagline\.json: "inputs\.3" names a preset source, which is never an input$/m],
  'a prompt library entry after itself': [{ [ENTRY]: { ...entry, after: ['tagline'] } }, /tagline\.json: "after" names the entry itself$/m],
  'a prompt library target that is not a band': [{ [ENTRY]: { ...entry, targets: { words: [10] } } }, /tagline\.json: "targets\.words" must have 2 items, has 1$/m],
  'a prompt library example with a hex': [{ [ENTRY]: { ...entry, example: { input: {}, output: { tagline: 'Clay on #f5e6d3' } } } }, /tagline\.json: "example\.output\.tagline" holds a hex-like value$/m],
  'a shared file with an unknown key': [{ 'theme-briefs/prompt-library/shared.json': { preamble: ['Write in English.'], bans: [], model: 'x' } }, /shared\.json: unknown key "model"$/m],
  'malformed JSON': [{ [IMAGERY]: '{ "kind": "imagery", ' }, /^theme-briefs\/presets\/imagery\/people-in-action\.json: not valid JSON/m],
  'a prompt library input the tool does not supply': [{ [ENTRY]: { ...entry, inputs: [...entry.inputs, 'picks.review'] } }, /tagline\.json: "inputs\.3" is not an input the tool supplies$/m],
  'a prompt library input from an entry not run before it': [{ [ENTRY]: { ...entry, inputs: [...entry.inputs, 'occasion-components.names'] } }, /tagline\.json: "inputs\.3" takes the output of "occasion-components", which "after" does not name$/m],
  'a prompt library target the entry does not check': [{ [ENTRY]: { ...entry, targets: { ...entry.targets, sentences: [1, 2] } } }, /tagline\.json: "targets\.sentences" is not a band tagline checks; its bands are words, firstClauseWords$/m],
  'prompt library entries that wait on each other': [{ [ENTRY]: { ...entry, after: ['imagery'] }, 'theme-briefs/prompt-library/imagery.json': { ...entry, targets: {}, after: ['tagline'] } }, [/tagline\.json: "after" makes a cycle through tagline, imagery$/m, /imagery\.json: "after" makes a cycle through tagline, imagery$/m]],
  'a shared placeholder': [{ 'theme-briefs/prompt-library/shared.json': { preamble: ['Use {{variables}}.'], bans: [] } }, /shared\.json: "preamble\.0" has the placeholder \{\{variables\}\}; the tool fills none$/m],
});

const source = (url) => ({ url, measuredOn: '2026-10-30', kept: ['structure', 'geometry'], robotsDisallowed: false });
const review = (status) => ({ status, source_revision: '2026-10-30', reviewer: status === 'illustrative' ? null : 'Design owner', reviewed_on: status === 'illustrative' ? null : '2026-11-01', approved_properties: [] });

const COMPATIBILITY_REFUSALS = {
  'a missing preset': [edit(PICKS, (p) => ({ ...p, presets: { ...p.presets, imagery: 'still-life' } })), /^theme-briefs\/picks\/club-run\.json: imagery preset "still-life" not found under theme-briefs\/presets\/imagery$/m],
  'a third-party source with no review record': [edit(IMAGERY, (p) => ({ ...p, source: source('https://www.example-run.com/events') })), /^theme-briefs\/picks\/club-run\.json: imagery "people-in-action" has a third-party source, so the picks file needs a review record$/m],
  'a source URL that does not parse, as a third party': [edit(IMAGERY, (p) => ({ ...p, source: source('https://[x]/events') })), /^theme-briefs\/picks\/club-run\.json: imagery "people-in-action" has a third-party source, so the picks file needs a review record$/m],
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
  'two picks files of one theme with the same presets': [twin(), /^theme-briefs\/picks\/club-run\.json: has the same occasion and imagery presets as theme-briefs\/picks\/club-race\.json; briefs on one theme differ in at least one preset$/m],
  'two picks files of one theme that differ only in Block Colourway': [twin((p) => ({ ...p, brandPattern: { blockColourway: 'white__navy-100' } })), /^theme-briefs\/picks\/club-run\.json: has the same occasion and imagery presets as theme-briefs\/picks\/club-race\.json; briefs on one theme differ in at least one preset$/m],
};

for (const [name, [changes, expected]] of Object.entries(DISTINCTNESS_REFUSALS)) {
  test(`check-only refuses ${name}`, (t) => assertRefused(t, changes, expected));
}

test('the same presets may serve two themes, and one changed preset makes a distinct brief', (t) => {
  const otherImagery = { ...valid[IMAGERY], slug: 'portraits' };
  const root = fixture(t, {
    'theme-briefs/picks/ultra-run.json': { ...valid[PICKS], theme: 'ultra', brandPattern: { blockColourway: 'navy__grey-100' } },
    'theme-briefs/presets/imagery/portraits.json': otherImagery,
    ...twin((p) => ({ ...p, presets: { ...p.presets, imagery: 'portraits' } })),
  });
  const { status, out } = checkOnly(root);
  assert.equal(status, 0, out);
  assert.match(out, /3 picks files/);
});

test('a Finnomena source needs no review', (t) => {
  const root = fixture(t, {
    ...edit(IMAGERY, (p) => ({ ...p, source: source('https://www.finnomena.com/campaign/run') })),
  });
  const { status, out } = checkOnly(root);
  assert.equal(status, 0, out);
});

test('check-only refuses a third-party source whose review is illustrative, before any brief is published', (t) => assertRefused(t, {
  ...edit(IMAGERY, (p) => ({ ...p, source: source('https://www.example-run.com/events') })),
  ...edit(PICKS, (p) => ({ ...p, review: review('illustrative') })),
}, /^theme-briefs\/picks\/club-run\.json: imagery "people-in-action" has a third-party source and its review status is "illustrative"; it ships only after a Finnomena design review$/m));

test('a third-party source with a partial review passes the input checks', (t) => {
  const root = fixture(t, {
    ...edit(IMAGERY, (p) => ({ ...p, source: source('https://www.example-run.com/events') })),
    ...edit(PICKS, (p) => ({ ...p, review: { ...review('partially-reviewed'), approved_properties: ['imagery'] } })),
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
  mood: 'Members train together for one weekend race.\nThe start line is friendly.',
  components: [
    ['Race distance card', 'Compare the distances on offer', 'The distance, its start time and one action to select it.\nA full distance says so.'],
    ['Registration call-out', 'Carry the main registration action', 'The deadline and the main action.'],
  ],
  dos: ['Show the registration deadline beside every main action, so members never hunt for the date.'],
  donts: ['Do not use the route map as a decorative background — it hides the distances members compare.'],
  imagery: 'Photography of members running together leads, candid and unposed.\n\nSpot illustrations explain what a photo cannot.',
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
    '## Occasion content',
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
    '## Agent Prompt Guide',
    '',
    '**Quick Color Reference**',
    '- stale',
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
  ...edit(IMAGERY, (p) => ({ ...p, source: source('https://www.example-run.com/events') })),
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
  'a brief that names its source site': [{ ...thirdParty('reviewed'), [BRIEF]: `${briefText}Photography in the Example-Run style.\n` }, /^registry\/theme-briefs\/club-run\.md: names "example-run", a preset source; no source name ships$/m],
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

const SECTIONS = ['Tokens — Colors', 'Tokens — Typography', 'Components', 'Occasion content', "Do's and Don'ts", 'Surfaces', 'Imagery', 'Brand Pattern', 'Agent Prompt Guide', 'Sibling Themes', 'Quick Start'];

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
    "This is a Finnomena Theme Brief, not a Reference Design: skip Brand Intensity and apply the whole Brand Contract. Colors come from the Club Immersive Theme and the typeface from Neon's theme. It gives no layout, type size, spacing, shape or motion: design the page yourself. Provisional pending design owner review.",
    '',
    valid[CLUB_TEXT].mood,
    PROSE.mood,
    'Membership ratio: White 60%, Light Grey 15%, Yellow 15%, Navy 10%.',
    '',
  ].join('\n'));
  assert.deepEqual([...brief.matchAll(/^## (.+)$/gm)].map(([, heading]) => heading), SECTIONS);
  for (const text of [PROSE.imagery, ...PROSE.dos, ...PROSE.donts, ...PROSE.components.flat()]) assert.ok(brief.includes(text), text);
  assert.doesNotMatch(brief, /Stale/);
});

// A weight added to theme.css.
const extraWeight = () => {
  const css = readFileSync(join(repo, 'theme/css/theme.css'), 'utf8');
  const changed = css.replace(/(--fontWeight-[\w-]+: )700;/, '$1800;');
  assert.notEqual(changed, css);
  return changed;
};

test('check-only refuses a brief whose scripted section drifted from the theme', (t) => {
  const root = fixture(t, { ...published(), 'theme/css/theme.css': extraWeight() });
  const { status, out } = checkOnly(root);
  assert.equal(status, 1, out);
  assert.match(out, /^registry\/theme-briefs\/club-run\.md: section "Tokens — Typography" differs from fresh scripted output \(found ".*", expected ".*"\); run scripted-only$/m);
  assert.doesNotMatch(out, /section "Components"/);
});

test('check-only refuses a hand edit to a scripted line and allows one to prose', (t) => {
  const scripted = checkOnly(fixture(t, { ...published(), [BRIEF]: briefText.replace('Build emphasis with tint steps', 'Build emphasis with opacity') }));
  assert.equal(scripted.status, 1, scripted.out);
  assert.match(scripted.out, /section "Do's and Don'ts" differs from fresh scripted output \(found "- Build emphasis with opacity, never with opacity\.", expected "- Build emphasis with tint steps, never with opacity\."\)/);
  const prose = checkOnly(fixture(t, { ...published(), [BRIEF]: briefText.replace('candid and unposed', 'candid') }));
  assert.equal(prose.status, 0, prose.out);
});

test('scripted-only fixes a drifted brief, keeps its prose, and a second run changes nothing', (t) => {
  const root = fixture(t, { ...published(), 'theme/css/theme.css': extraWeight(), [BRIEF]: briefText.replace('candid and unposed', 'candid') });
  const first = scriptedOnly(root);
  assert.equal(first.status, 0, first.out);
  assert.match(first.out, /^registry\/theme-briefs\/club-run\.md: rewrote Tokens — Typography$/m);
  const brief = readFileSync(join(root, BRIEF), 'utf8');
  assert.match(brief, /^- \*\*Weights:\*\* .*800$/m);
  assert.equal(brief.replace(/^- \*\*Weights:.*$/m, ''), briefText.replace('candid and unposed', 'candid').replace(/^- \*\*Weights:.*$/m, ''));
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

// Every theme, rendered in one scripted-only run.
const LABELS = { club: 'Club', exclusive: 'Exclusive', private: 'Private', ultra: 'Ultra' };
const BLOCK_COLOURWAY = { club: 'white__yellow-100', exclusive: 'grey__yellow-100', private: 'grey__yellow-100', ultra: 'navy__grey-100' };
const THEMES = Object.keys(LABELS).map((theme) => ({ theme, slug: `${theme}-run` }));

function renderThemes(t) {
  const files = { ...THEME_TEXTS };
  for (const { theme, slug } of THEMES) {
    files[`theme-briefs/picks/${slug}.json`] = { ...valid[PICKS], theme, brandPattern: { blockColourway: BLOCK_COLOURWAY[theme] } };
    files[`theme-briefs/records/${slug}.json`] = { brief: slug };
    files[`registry/theme-briefs/${slug}.md`] = staleBrief(PROSE, { theme: LABELS[theme] });
  }
  files['registry/registry.json'] = { name: 'neon', homepage: 'https://example.invalid', items: THEMES.map(({ slug }) => ({ name: `theme-brief-${slug}`, type: 'registry:item' })) };
  const root = fixture(t, files);
  const { status, out } = scriptedOnly(root);
  assert.equal(status, 0, out);
  return { root, briefs: THEMES.map((cell) => ({ ...cell, text: readFileSync(join(root, `registry/theme-briefs/${cell.slug}.md`), 'utf8') })) };
}

const section = (text, heading) => text.split(/^## /m).find((part) => part.startsWith(`${heading}\n`)) ?? '';

// ADR 0018: the agent designs the page, so a brief gives its colors, typeface and occasion and no design.
function assertNoDesign(text, at) {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map(([, heading]) => heading), SECTIONS, at);
  assert.doesNotMatch(text, /\d\s?(?:px|ms)\b/, at);
  assert.doesNotMatch(text, /--(?:space|borderRadius|layout|shadow|duration)-/, at);
  assert.doesNotMatch(text, /\b(?:display|title|label)[1-4]\b/, at);
  assert.doesNotMatch(text, /\b(?:scroll pattern|parallax|stagger|hero|full-bleed)/i, at);
}

test('scripted rendering holds for every theme, and passes check-only', (t) => {
  const { root, briefs } = renderThemes(t);
  for (const { theme, slug, text } of briefs) {
    const at = `${slug}: `;
    assertNoDesign(text, at);
    assert.match(text, new RegExp(`^\\*\\*Theme:\\*\\* ${theme === 'ultra' ? 'dark' : 'light'}$`, 'm'), at);
    assert.match(text, /^This is a Finnomena Theme Brief, not a Reference Design: .* Provisional pending design owner review\.$/m, at);
    assert.match(section(text, 'Components'), theme === 'ultra' ? /the dark-surface mark/ : /the light-surface mark/, at);
    assert.equal(/^### Support Block$/m.test(text), theme === 'ultra', at);
    assert.equal(/^\| — \| Light Grey 100 \| `#a6bfcc` \| `--immersive-support-100` \| Support block \|$/m.test(section(text, 'Surfaces')), theme === 'ultra', at);
    assert.match(section(text, 'Brand Pattern'), new RegExp(`^- \\*\\*Block Colourway:\\*\\* \`${BLOCK_COLOURWAY[theme]}\`, `, 'm'), at);
    assert.match(section(text, 'Brand Pattern'), /^Optional unless the request asks for one\. .*Where it goes and how large it is are the page design's\.$/m, at);
    // Only where the main action's color is not the text of a block fill does its entry name the swap.
    assert.equal(/`--immersive-action` does not read/.test(section(text, 'Components')), theme === 'ultra', at);
    assert.match(section(text, 'Components'), /^Neon `Button` in its `secondary` variant: `--immersive-palette-75` fill with its label in `--immersive-on-palette-75`\./m, at);
    assert.match(section(text, 'Components'), theme === 'ultra' ? /On an accent or support fill, or on a block that already has that fill, the `ghost` variant/ : /On an accent fill, or on a block that already has that fill, the `ghost` variant/, at);
    assert.doesNotMatch(text.replace('Neon has no outlined button.', ''), /outline/i, at);
  }
  assert.match(section(briefs.find((brief) => brief.theme === 'club').text, 'Components'), /^`--immersive-palette-100` to `--immersive-palette-25` fills/m);
  assert.match(section(briefs.find((brief) => brief.theme === 'private').text, 'Components'), /^`--immersive-palette-75` to `--immersive-palette-25` fills/m);
  const { status, out } = checkOnly(root);
  assert.equal(status, 0, out);
  assert.match(out, /, 4 briefs; no problems$/m);
});

test('no published brief designs the page, its theme text and occasion prose included', () => {
  const dir = join(repo, 'registry/theme-briefs');
  const briefs = readdirSync(dir).filter((name) => name.endsWith('.md'));
  assert.ok(briefs.length >= 4);
  for (const name of briefs) assertNoDesign(readFileSync(join(dir, name), 'utf8'), name);
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
  const root = fixture(t, { ...THEME_TEXTS, 'registry/theme-briefs/ultra-run.md': staleBrief(PROSE, { theme: 'Ultra' }), [PICKS]: null, 'theme-briefs/picks/ultra-run.json': { ...valid[PICKS], theme: 'ultra', brandPattern: { blockColourway: 'navy__grey-100' } } });
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
    paragraph: 'Race weekend is steady rather than loud, the way a long run settles after the first kilometre. Members have trained for it together since the rains, and the week before is easy miles, early nights and messages about who is bringing the coffee. At dawn they gather at the start line with bibs pinned, shaking out their legs before the horn.',
  },
  'occasion-components': {
    components: [
      { name: 'Race distance card', role: 'Compare the distances on offer', paragraph: 'The distance, its start time and one action to select it. A distance that has filled up says so in words and offers no action.' },
      { name: 'Registration call-out', role: 'Carry the main registration action', paragraph: 'The registration deadline, what a member gets for signing up early, and the one main action of the whole page.' },
    ],
  },
  'preset-dos-donts': {
    dos: ['Show the registration deadline beside every main action on the Race distance card, so members never hunt for the date.'],
    donts: ['Do not use the route map as a decorative background — it hides the distances members came to compare.'],
  },
  imagery: {
    paragraph: 'Photography of members running together leads, so faces and stride carry the energy. The subjects are real members in candid moments on the course, never posed stock. Spot illustrations explain what a photo cannot, such as where a water station stands.',
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
  assert.ok(brief.includes(GOOD.imagery.paragraph));
  assert.equal(readFileSync(local(root, 'draft.md'), 'utf8'), brief);
  const record = JSON.parse(readFileSync(join(root, RECORD), 'utf8'));
  // Once the maintainer adds its registry entry, CI passes the brief.
  writeFileSync(join(root, 'registry/registry.json'), JSON.stringify({ name: 'neon', homepage: 'https://example.invalid', items: [{ name: 'theme-brief-club-run', type: 'registry:item' }] }));
  const check = checkOnly(root);
  assert.equal(check.status, 0, check.out);
});

test('every prompt library entry takes the theme mood', () => {
  for (const [path, text] of Object.entries(libraryFiles())) {
    if (path.endsWith('/shared.json')) continue;
    const { inputs } = JSON.parse(text);
    assert.ok(inputs.includes('theme.mood'), path);
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
  assert.match(report, /^- club-trail-run: Header 1\.00, Occasion content 1\.00, Do's and Don'ts 1\.00, Imagery 1\.00$/m);
});

test('soft checks send back a Do longer than one sentence', (t) => {
  const twoSentences = { ...GOOD['preset-dos-donts'], dos: ['Show the deadline beside every main action on the Race distance card. Members should never hunt for the date at all.'] };
  const { fake, status, out } = draft(t, { answers: { 'preset-dos-donts': [twoSentences, GOOD['preset-dos-donts']] } });
  assert.equal(status, 0, out);
  assert.match(calls(fake, 'preset-dos-donts')[1].prompt, /^- "dos\.0" has 2 sentences; each bullet is one$/m);
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
  assert.equal(calls(fake, 'preset-dos-donts').length, 1);
  assert.deepEqual(promptInputs(calls(fake, 'preset-dos-donts')[0].prompt)['occasion-components.names'], ['Race distance card', 'Registration call-out']);
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
  const hex = { paragraph: GOOD.imagery.paragraph.replace('real members', 'real #e6eef2 members') };
  const { root, fake, status, out } = draft(t, { answers: { imagery: [hex] } });
  assert.equal(status, 1, out);
  assert.match(out, /^club-run: checks failed; not written\. Draft \.local\/theme-briefs\/club-run\/draft\.md; review \.local\/theme-briefs\/club-run\/review\.md$/m);
  assert.equal(calls(fake, 'imagery').length, 3);
  const text = readFileSync(local(root, 'draft.md'), 'utf8');
  assert.match(text, /^## Imagery\n\n\*\*Hard checks failed — imagery:\*\* prose holds #e6eef2; prose names colors by role, never by value\n\n\[not drafted\]$/m);
  const report = readFileSync(local(root, 'review.md'), 'utf8');
  assert.match(report, /No attempt of 3 passed its hard checks\./);
  assert.match(report, /^Scripted sections not compared: the draft has failed sections\.$/m);
  assert.deepEqual(withoutLocal(snapshot(root)), untouched(t, root));
});

test('entries after a failed entry are not run, and the draft says what they wait on', (t) => {
  const { root, fake, status, out } = draft(t, { answers: { 'occasion-components': [{ components: 'Race distance card' }] } });
  assert.equal(status, 1, out);
  assert.equal(calls(fake, 'preset-dos-donts').length, 0);
  for (const name of ['tagline', 'mood-occasion', 'imagery']) assert.equal(calls(fake, name).length, 1, name);
  const text = readFileSync(local(root, 'draft.md'), 'utf8');
  assert.match(text, /^## Occasion content\n\n\*\*Hard checks failed — occasion-components:\*\* "components" must be an array$/m);
  assert.match(text, /^## Do's and Don'ts\n\n\*\*Not drafted — preset-dos-donts:\*\* it waits on occasion-components, which did not pass its hard checks\.$/m);
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
  'a variable': ['occasion-components', components([]), /— occasion-components:\*\* prose names --immersive-support-50; prose names no variable/, (answer) => { answer.components[0].paragraph += ' It sits on var(--immersive-support-50).'; }],
  'a px value': ['imagery', { paragraph: imagery.replace('real members', 'real 11px members') }, /— imagery:\*\* prose gives 11px; size and timing are the page's design/],
  'a duration': ['imagery', { paragraph: imagery.replace('real members', 'real 600ms members') }, /— imagery:\*\* prose gives 600ms; size and timing are the page's design/],
  'a foreign font name': ['imagery', { paragraph: imagery.replace('posed stock', 'posed stock in Inter') }, /— imagery:\*\* prose names "Inter", a font other than IBM Plex Sans Thai; type comes from the theme/],
  'prose that prescribes layout': ['imagery', { paragraph: imagery.replace('posed stock', 'posed stock in the hero') }, /— imagery:\*\* prose prescribes layout \("hero"\); a brief leaves it to the page's design/],
  'prose that prescribes size or shape': ['occasion-components', components([]), /— occasion-components:\*\* prose prescribes size or shape \("display3"\); a brief leaves it to the page's design/, (answer) => { answer.components[0].paragraph = answer.components[0].paragraph.replace('The distance,', 'The distance in display3,'); }],
  'prose that prescribes motion': ['mood-occasion', { paragraph: mood.paragraph.replace('gather', 'gather, staggered,') }, /— mood-occasion:\*\* prose prescribes motion \("staggered"\); a brief leaves it to the page's design/],
  'words copied from the example': ['imagery', { paragraph: `${imagery} Wet clay, rolled sleeves and the quiet concentration of people.` }, /— imagery:\*\* copies eight or more words from the example \("wet clay rolled sleeves and the quiet concentration"\)/],
  'a Do for no intent': ['preset-dos-donts', { ...GOOD['preset-dos-donts'], dos: [...GOOD['preset-dos-donts'].dos, GOOD['preset-dos-donts'].dos[0]] }, /— preset-dos-donts:\*\* "dos" must have 1 bullets, one per intent; has 2/],
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
  const named = { paragraph: GOOD.imagery.paragraph.replace('Photography', 'Example-Run photography') };
  const { root, status, out } = draft(t, { answers: { imagery: [named] }, changes: thirdParty('reviewed') });
  assert.equal(status, 1, out);
  assert.match(readFileSync(local(root, 'draft.md'), 'utf8'), /— imagery:\*\* names "example-run", a preset source; no source name ships/);
});

test('each entry receives only the inputs it declares, and never a source or review record', (t) => {
  const partial = { ...review('partially-reviewed'), approved_properties: ['imagery'], reviewer: 'Pat Reviewer' };
  const changes = {
    ...edit(IMAGERY, (p) => ({ ...p, source: source('https://www.example-run.com/events') })),
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
  assert.deepEqual(Object.keys(record), ['brief', 'tool', 'claudeCode', 'account', 'entries']);
  // Each entry carries the hash of shared.json as committed, so the record shows which briefs used an older one.
  const shared = JSON.parse(libraryFiles()[`${LIBRARY}/shared.json`]);
  for (const [name, entry] of Object.entries(record.entries)) assert.equal(entry.shared, sha256(JSON.stringify(Object.fromEntries(Object.entries(shared).sort()))), name);
  assert.equal(record.tool.commit, null);
  assert.match(record.tool.version, /^[0-9a-f]{64}$/);
  assert.deepEqual(record.claudeCode, { version: '2.1.316', model: 'claude-sonnet-5-5', effort: 'high', modelOverride: true });
  assert.equal(record.account, 'neutral-account');
  // An output hash is the SHA-256 of the prose read back from the brief, as JSON with sorted keys.
  assert.equal(record.entries.imagery.output, sha256(JSON.stringify({ paragraph: GOOD.imagery.paragraph })));
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

// CI on committed briefs: check 4 on the prose read back from the brief.
const proseBrief = (prose) => renderBrief({ [BRIEF]: staleBrief({ ...PROSE, ...prose }) });
const withImagery = (line) => ({ ...published(), [BRIEF]: proseBrief({ imagery: `${PROSE.imagery} ${line}` }) });
const COMMITTED_REFUSALS = {
  'prose with a px value': [withImagery('Photos stand 11px apart.'), /^registry\/theme-briefs\/club-run\.md: prose gives 11px; size and timing are the page's design$/m],
  'prose that names a variable': [withImagery('Photos sit on var(--immersive-palette-50).'), /^registry\/theme-briefs\/club-run\.md: prose names --immersive-palette-50; prose names no variable$/m],
  'prose that names a foreign font': [withImagery('Captions are set in Finnomena Trek, not IBM Plex Sans.'), [
    /^registry\/theme-briefs\/club-run\.md: prose names "Finnomena Trek", a font other than IBM Plex Sans Thai; type comes from the theme$/m,
    /^registry\/theme-briefs\/club-run\.md: prose names "IBM Plex Sans", a font other than IBM Plex Sans Thai; type comes from the theme$/m,
  ]],
  'prose that prescribes layout': [withImagery('One photo opens each section.'), /^registry\/theme-briefs\/club-run\.md: prose prescribes layout \("section"\); a brief leaves it to the page's design$/m],
  'prose that prescribes shape': [withImagery('Photos have rounded corners.'), /^registry\/theme-briefs\/club-run\.md: prose prescribes size or shape \("rounded"\); a brief leaves it to the page's design$/m],
  'prose that prescribes motion': [withImagery('Photos fade in on scroll.'), /^registry\/theme-briefs\/club-run\.md: prose prescribes motion \("on scroll"\); a brief leaves it to the page's design$/m],
};

for (const [name, [changes, expected]] of Object.entries(COMMITTED_REFUSALS)) {
  test(`check-only refuses ${name}`, (t) => assertRefused(t, changes, expected));
}

test('check-only reports a variable the theme lacks once, though prose and color checks both find it', (t) => {
  const prose = { imagery: `${PROSE.imagery} It sits on var(--immersive-support-50).` };
  const { status, out } = checkOnly(fixture(t, { ...published(), [BRIEF]: proseBrief(prose) }));
  assert.equal(status, 1, out);
  assert.equal(out.match(/names --immersive-support-50, which Club does not define$/gm)?.length, 1, out);
});

test('prose may name the theme\'s own typeface', (t) => {
  const { status, out } = checkOnly(fixture(t, withImagery('Every caption stays in IBM Plex Sans Thai.')));
  assert.equal(status, 0, out);
});

test('a font whose name starts with another listed font is reported once', (t) => {
  const { status, out } = checkOnly(fixture(t, withImagery('Thai captions use Noto Sans Thai.')));
  assert.equal(status, 1, out);
  assert.match(out, /^registry\/theme-briefs\/club-run\.md: prose names "Noto Sans Thai", a font other than IBM Plex Sans Thai; type comes from the theme$/m);
  assert.doesNotMatch(out, /prose names "Noto Sans",/);
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
const DATE = ['so members never hunt for the date', 'so no member ever hunts for the date'];

test('redraft refuses to overwrite a hand-edited section after the named entry, before any model call', (t) => {
  const root = drafted(t);
  handEdit(join(root, BRIEF), ...DATE);
  const before = snapshot(root);
  const { fake, status, out } = again(t, root, ['redraft', 'club-run', 'occasion-components']);
  assert.equal(status, 1, out);
  assert.match(out, /^club-run: preset-dos-donts is hand-edited; add --discard preset-dos-donts to overwrite it$/m);
  assert.match(out, /^Redraft: nothing redrafted; fix the problems above$/m);
  assert.equal(fake.calls().length, 0);
  assert.deepEqual(snapshot(root), before);
});

test('redraft with --discard regenerates the named entry and those after it, and keeps every other section and its record entry', (t) => {
  const root = drafted(t);
  const tagline = ['every member invited to one shared start line', 'every member welcome at one shared start line'];
  handEdit(join(root, BRIEF), ...tagline);
  handEdit(join(root, BRIEF), ...DATE);
  const before = JSON.parse(readFileSync(join(root, RECORD), 'utf8'));
  const calm = { ...GOOD['preset-dos-donts'], dos: ['Show the registration deadline beside every main action, so each member plans around the date.'] };
  const { fake, status, out } = again(t, root, ['redraft', 'club-run', 'occasion-components', '--discard', 'preset-dos-donts'], { 'preset-dos-donts': [calm] });
  assert.equal(status, 0, out);
  assert.match(out, /^club-run: written to registry\/theme-briefs\/club-run\.md; review \.local\/theme-briefs\/club-run\/review\.md$/m);
  assert.deepEqual(fake.calls().map(({ entry }) => entry).sort(), ['occasion-components', 'preset-dos-donts']);
  const brief = readFileSync(join(root, BRIEF), 'utf8');
  assert.ok(brief.includes(tagline[1]) && brief.includes(calm.dos[0]) && !brief.includes(DATE[1]));
  const after = JSON.parse(readFileSync(join(root, RECORD), 'utf8'));
  // The kept tagline keeps its record entry, so it still reads as hand-edited.
  for (const name of ['tagline', 'mood-occasion', 'imagery']) assert.deepEqual(after.entries[name], before.entries[name], name);
  assert.equal(after.entries['preset-dos-donts'].output, sha256(JSON.stringify({ donts: calm.donts, dos: calm.dos })));
  assert.match(readFileSync(local(root, 'review.md'), 'utf8'), /^## tagline\n\nEntry [0-9a-f]{64}\.\n\nNot redrafted: kept from the committed brief\.$/m);
  const check = again(t, root, ['redraft', 'club-run', 'tagline']);
  assert.match(check.out, /^club-run: tagline is hand-edited; add --discard tagline to overwrite it$/m);
});

test('a redraft takes its inputs from the kept sections and leaves their hand edits', (t) => {
  const root = drafted(t);
  handEdit(join(root, BRIEF), '**Role:** Compare the distances on offer', '**Role:** Compare every distance on offer');
  const { fake, status, out } = again(t, root, ['redraft', 'club-run', 'preset-dos-donts']);
  assert.equal(status, 0, out);
  assert.deepEqual(fake.calls().map(({ entry }) => entry), ['preset-dos-donts']);
  assert.deepEqual(promptInputs(fake.calls()[0].prompt)['occasion-components.names'], ['Race distance card', 'Registration call-out']);
  assert.match(readFileSync(join(root, BRIEF), 'utf8'), /^\*\*Role:\*\* Compare every distance on offer$/m);
});

test('a changed entry file triggers no redraft, and redraft names the kept sections drafted from an older entry', (t) => {
  const root = drafted(t);
  const imagery = join(root, LIBRARY, 'imagery.json');
  const data = JSON.parse(readFileSync(imagery, 'utf8'));
  writeFileSync(imagery, JSON.stringify({ ...data, rules: [...data.rules, 'Keep each image honest.'] }));
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
  const stray = again(t, root, ['redraft', 'club-run', 'imagery', '--discard', 'tagline']);
  assert.match(stray.out, /^club-run: --discard tagline names an entry this redraft does not rewrite$/m);
  rmSync(join(root, RECORD));
  const before = snapshot(root);
  const { fake, status, out } = again(t, root, ['redraft', 'club-run', 'imagery']);
  assert.equal(status, 1, out);
  assert.match(out, /^club-run: redraft needs the committed brief registry\/theme-briefs\/club-run\.md and its authoring record theme-briefs\/records\/club-run\.json; run draft first$/m);
  assert.equal(fake.calls().length, 0);
  assert.deepEqual(snapshot(root), before);
});

// A draft whose imagery failed its hard checks: a marker and a placeholder under ## Imagery.
function failedImagery(t) {
  const hex = { paragraph: GOOD.imagery.paragraph.replace('real members', 'real #e6eef2 members') };
  const { root, status, out } = draft(t, { answers: { imagery: [hex] } });
  assert.equal(status, 1, out);
  return root;
}
const FAILED_IMAGERY = /\*\*Hard checks failed — imagery:\*\*[^\n]*\n\n/;
function fixImagery(root, paragraph) {
  const path = local(root, 'draft.md');
  writeFileSync(path, readFileSync(path, 'utf8').replace(FAILED_IMAGERY, '').replace('[not drafted]', paragraph));
}
const accept = (root) => run(['accept', 'club-run', '--root', root]);

test('accept writes a hand-fixed draft once every check passes, and records the section as hand-edited', (t) => {
  const root = failedImagery(t);
  const fixed = GOOD.imagery.paragraph.replace('real members', 'club members');
  fixImagery(root, fixed);
  const { status, out } = accept(root);
  assert.equal(status, 0, out);
  assert.match(out, /^club-run: accepted; written to registry\/theme-briefs\/club-run\.md; hand-edited: imagery$/m);
  const brief = readFileSync(join(root, BRIEF), 'utf8');
  assert.equal(brief, readFileSync(local(root, 'draft.md'), 'utf8'));
  assert.ok(brief.includes(fixed));
  const record = JSON.parse(readFileSync(join(root, RECORD), 'utf8'));
  assert.equal(record.entries.imagery.handEdited, true);
  // The model produced no imagery, so the record has no output hash for it.
  assert.equal(record.entries.imagery.output, null);
  assert.deepEqual(Object.keys(record.entries).filter((name) => record.entries[name].handEdited), ['imagery']);
  writeFileSync(join(root, 'registry/registry.json'), JSON.stringify({ name: 'neon', homepage: 'https://example.invalid', items: [{ name: 'theme-brief-club-run', type: 'registry:item' }] }));
  const check = checkOnly(root);
  assert.equal(check.status, 0, check.out);
  // An accepted hand edit is protected from a later redraft.
  const redraft = again(t, root, ['redraft', 'club-run', 'imagery']);
  assert.match(redraft.out, /^club-run: imagery is hand-edited; add --discard imagery to overwrite it$/m);
});

test('accept refuses a draft with a remaining hard failure, and writes nothing', (t) => {
  const root = failedImagery(t);
  fixImagery(root, GOOD.imagery.paragraph.replace('real members', 'real #e6eef2 members'));
  const before = snapshot(root);
  const { status, out } = accept(root);
  assert.equal(status, 1, out);
  assert.match(out, /^\.local\/theme-briefs\/club-run\/draft\.md: imagery: prose holds #e6eef2; prose names colors by role, never by value$/m);
  assert.match(out, /^club-run: not accepted; nothing written$/m);
  assert.deepEqual(snapshot(root), before);
});

test('accept refuses a draft that still holds a marker or placeholder', (t) => {
  const root = failedImagery(t);
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
  assert.deepEqual(Object.keys(record), ['brief', 'tool', 'claudeCode', 'account', 'entries']);
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

// ADR 0018: ImmersiveLayout is an option; a page that skips it sets the theme on its own root and on <html>.
test('a brief offers ImmersiveLayout and the theme attribute on the page\'s own root', () => {
  assert.match(section(briefText, 'Quick Start'), /^Build on the Neon base\. Add `@neon\/theme`, `@neon\/immersive-themes` and this brief's item, `@neon\/theme-brief-club-run`\. `ImmersiveLayout` is optional: pass it `immersiveTheme="club"`, or, on the page's own root, .*`data-immersive-theme="club"` on that root and on `<html>`/m);
});

test('the Block Colourways a picks file may name are the ones Block\'s engine draws in its primary group', async () => {
  const { BLOCK_COLOURWAYS, blockColourway } = await import(join(repo, 'scripts/theme-briefs/schemas.mjs'));
  const { COLOURWAYS_LIST } = await import(join(repo, 'block/block-engine.mjs'));
  assert.deepEqual(BLOCK_COLOURWAYS, COLOURWAYS_LIST.filter(({ group }) => group === 'primary').map(({ id }) => id));
  assert.deepEqual(blockColourway('grey__yellow-100'), { ground: 'Light Grey.100', blocks: 'Yellow.100' });
});

test('check-only refuses a Block Colourway that draws in a color the theme lacks', (t) => {
  const exclusive = { ...valid[PICKS], theme: 'exclusive', brandPattern: { blockColourway: 'white__navy-100' } };
  assertRefused(t, { ...THEME_TEXTS, [PICKS]: null, 'theme-briefs/picks/exclusive-run.json': exclusive },
    /^theme-briefs\/picks\/exclusive-run\.json: Block Colourway "white__navy-100" draws its ground in White, which is not one of Exclusive's colors at full strength$/m);
});
