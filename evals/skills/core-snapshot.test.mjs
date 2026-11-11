import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { syncCore, checkCoreSnapshot } from '../../scripts/lib/core-snapshot.mjs';

// A Core checkout small enough to read here: one approved component with a spec,
// one draft, one deprecated, and the records the sync resolves numbers from.
const ARCHITECTURE = `# Core component architecture

## Sizing and scales

- **Scales**: \`Spacing\` is Carbon's 14 steps (\`spacing-00\`–\`13\`: 0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160). \`Sizing\` holds dimensions by role.
- **Scales fixed** (2026-11-01): \`Spacing\` holds Carbon's \`spacing-00\`–\`13\` and \`Sizing\` holds \`control-xsmall\` … \`control-xlarge\` (28 / 36 / 48 / 56 / 64) and \`hit-target\` (48), so Component variables can alias them.

## Accessibility

  - **Values**, size / line height:

    | Step | \`Large\` | \`xxxLarge\` | \`AX3\` |
    |---|---|---|---|
    | Headline, Body | 17/24 | 23/36 | 40/56 |
    | Subheadline | 15/24 | 21/32 | 36/52 |
    | Footnote | 13/20 | 19/28 | 33/48 |
    | Icon Medium, Large, XLarge | 15/24, 17/24, 20/28 | 21/34, 23/34, 26/38 | 36/58, 40/58, 43/62 |
`;
const GLOSSARY = `# Glossary

**Scale step**:
One shared number in a scale collection: a stroke step (\`Sizing\`, by role: \`stroke-default\` 1 for a plain border, \`stroke-selected\` 2 for a selected control, \`stroke-field\` 3 for a field while edited, \`focus-ring\` 2 for the **Focus ring**), or a radius step (\`Radius\`, e.g. \`radius-md\`).
`;
const BUTTON_DOC = `# Button — proposal

> Status: Approved by the map; [Revision 8](#revision-8--container-grows) built 2026-11-10.
> Figma: [Buttons](https://www.figma.com/design/C9Usn2yP1dRpE9iTxyW3B2/-v3--Components---Core?node-id=18-19) · set \`Button\` (\`299:16756\`, key \`23bef581cf5d062d0bfdfde3b91fcd12b22540fd\`)
> Spec: [\`button.spec.json\`](button.spec.json); \`_Rect\`: \`rect-button.gen.mjs\` → \`rect-button.spec.json\`. The builder follows [\`alert.gen.mjs\`](alert.gen.mjs).

## Revision 8 — Container grows

The Container grows with Dynamic Type.

## Kind and route

- **Kind**: app-drawn.

## Anatomy and layer tree

\`\`\`
Button (variant root)
└─ Container      HORIZONTAL, Hug × Hug
   ├─ Background  Button only, iOS=True: material instance
   └─ Label       TEXT
\`\`\`

## Axes

| Axis | Values (default first) | Drives |
|---|---|---|
| \`Hierarchy\` | Primary · Secondary · Tertiary | fill |
| \`Size\` | Small · Large | Container 36 / 56 |
| \`iOS\` | True · False | the glass material (True) or the token fill (False) |

## Component variables and Theme tokens

| Group | Fields | Values |
|---|---|---|
| \`Button/Container/<Size>\` | Padding left, Radius | 16 (\`→Spacing/spacing-05\`), \`→Radius/Round (radius-round)\` |
| \`Button/button-glow\` | Light | →\`Navy/100\` |

## \`iOS\` handling and pass-down

\`iOS=True\` puts the material as \`Background\`.

## Accessibility

- [x] 6. Reflows at xxxLarge and AX3 since [Revision 8](#revision-8--container-grows).
- [x] 7. No text under 11 pt.

| | iOS | Android | Web |
|---|---|---|---|
| Role | button trait | \`Role.Button\` | \`<button>\` |

## Usage

- The Usage frame (\`64:7934\`) holds the Dynamic Type check frame.
- Brand only on Primary. See [hierarchy.md](../hierarchy.md) and [Alert](alert.md); the map is [architecture](../architecture.md#visuals).
- Secondary Inverse is the regular glass on \`iOS=True\`.

### Hierarchy

Primary is the one action the user is most likely to take. Liquid Glass tints it on iOS. Secondary handles most actions.

## Build log

- Built 2026-11-01 on node \`299:16756\`.
`;
const BUTTON_SPEC = {
  version: 2,
  status: 'approved',
  baseNodeName: 'Button',
  base: { nodeId: '299:16756' },
  componentSet: { name: 'Button', page: 'Buttons', nodeId: '299:16756' },
  axes: [
    { name: 'Hierarchy', values: ['Primary', 'Secondary', 'Tertiary'] },
    { name: 'Size', values: ['Small', 'Large'] },
    { name: 'iOS', values: ['True', 'False'] },
  ],
  exclude: ['{{Hierarchy=Tertiary}}{{iOS=True}}'],
  layers: [
    { layerPath: ['Container'], automations: {
      paddingLeft: [{ id: 'Container:paddingLeft:1', condition: '{{Size=*}}', value: 'Components/Button/Container/Round/{{Size=*}}/Padding left' }],
      'fills.0': [
        { id: 'Container:fills.0:1', condition: '{{Hierarchy=Primary}}{{iOS=False}}', value: 'Theme/Button/button-primary' },
        { id: 'Container:fills.0:2', condition: '{{Hierarchy=Primary}}{{iOS=True}}', value: 'Theme/Button/button-glass' },
      ],
    } },
    // A layer may bind a Scale step or a text style's line height with no Component variable between.
    { layerPath: ['Container', 'Label'], automations: {
      minHeight: [{ id: 'Label:minHeight:1', condition: '{{Size=*}}', value: 'Dynamic Type/Body/Line height' }],
      itemSpacing: [{ id: 'Label:itemSpacing:1', condition: '{{Size=*}}', value: 'Spacing/spacing-03' }],
    } },
    { layerPath: ['Container', 'Background'], kind: 'INSTANCE', automations: {
      'componentProperties.Tint': [{ id: 'bg:1', condition: '{{Hierarchy=Primary}}{{iOS=True}}', value: 'Primary' }],
    } },
  ],
  properties: [
    { name: 'Label Text', type: 'TEXT', default: 'Label', layer: ['Container', 'Label'] },
    { name: 'Leading artwork', type: 'INSTANCE_SWAP', default: '2070:2695', layer: ['Container', 'Artwork'] },
  ],
  variables: [
    { collection: 'Components', name: 'Button/Container/Round/Small/Layout height', type: 'FLOAT', value: 36 },
    { collection: 'Components', name: 'Button/Container/Round/Small/Padding left', type: 'FLOAT', value: '→Spacing/spacing-05' },
    { collection: 'Components', name: 'Button/Container/Round/Small/Radius', type: 'FLOAT', value: '→Radius/8px (radius-sm)' },
    { collection: 'Components', name: 'Button/Container/Round/Large/Radius', type: 'FLOAT', value: '→Radius/Round (radius-round)' },
    { collection: 'Components', name: 'Button/Container/Round/Large/Layout height', type: 'FLOAT', value: '→Sizing/control-large' },
    { collection: 'Components', name: 'Button/Container/Round/Large/Stroke', type: 'FLOAT', value: '→Sizing/focus-ring' },
    { collection: 'Components', name: 'Button/Icon/Large/Box', type: 'FLOAT', value: '→Dynamic Type/Icon/Large/Line height' },
    { collection: 'Components', name: 'Button/Label/Small/Text style', type: 'STRING', value: 'Body/Subheadline' },
    { collection: 'Theme', name: 'Button/button-outline', type: 'COLOR', value: '→Text/text-primary' },
    { collection: 'Theme', name: 'Button/button-glow', type: 'COLOR', values: { Light: '→Navy/100', Dark: '→Text/text-primary' } },
    { collection: 'Theme', name: 'Button/button-done', type: 'COLOR', value: '→Status/status-success' },
  ],
};
const THEME = {
  tokens: {
    'Text/text-primary': ['Black/85A', 'White/100'],
    'Button/button-primary': ['Navy/100', 'White/100'],
    // A token may name another token, or a hex of its own; Figma's editor colors and the Mode switch are not Theme colors.
    'Status/status-success': ['Text/text-primary', 'Text/text-primary'],
    'Layer/overlay': ['#00000080', 'Black/85A'],
    'Figma/Variant border': ['#9747FFFF', '#9747FFFF'],
    Mode: ['Light', 'Dark'],
  },
  primitives: { 'Black/85A': '#000000D9', 'White/100': '#FFFFFFFF', 'Navy/100': '#001A4DFF' },
};
const HIERARCHY = `# Hierarchy — what each value is for

## Rules every component keeps

1. **One Primary per context.** Liquid Glass tints it on iOS.

## Components

| Component | Values | Doc | Open |
|---|---|---|---|
| Button | Primary · Secondary | [button.md](components/button.md#hierarchy) | none: pins verified on \`989:11332\` 2026-11-10 |
| Sidebar | Header on Secondary | [sidebar.md](components/sidebar.md#hierarchy) | |
`;
const CORE_FILES = {
  'GLOSSARY.md': GLOSSARY,
  'docs/architecture.md': ARCHITECTURE,
  'docs/hierarchy.md': HIERARCHY,
  'docs/theme/theme.json': JSON.stringify(THEME),
  'docs/components/button.md': BUTTON_DOC,
  'docs/components/button.spec.json': JSON.stringify(BUTTON_SPEC),
  'docs/components/rect-button.spec.json': JSON.stringify({ componentSet: { name: 'Rect button' } }),
  'docs/components/button-badge.spec.json': JSON.stringify({ componentSet: { name: 'Button badge' } }),
  'docs/components/alert.spec.json': JSON.stringify({ componentSet: { name: 'Alert' } }),
  'docs/components/checkbox.spec.json': JSON.stringify({ componentSet: { name: 'Checkbox' } }),
  'docs/components/alert.md': '# Alert — proposal\n\n> Status: Approved 2026-11-09 by the owner.\n\n## Usage\n\n- One Alert at a time.\n',
  'docs/components/checkbox.md': '# Checkbox — proposal\n\n> Status: Draft, built 2026-11-02.\n\n## Usage\n\n- Draft rule.\n',
  'docs/components/sidebar.md': '# Sidebar — proposal\n\n> Status: **Deprecated 2026-11-10**: Navigation replaces it.\n\n## Usage\n\n- Old rule.\n',
  'docs/components/structure.md': '# Structure\n\nA guide with no Status line.\n',
};
const ITEMS = ['button', 'dialog', 'card'];
const COUNTERPARTS = {
  button: { core: 'button' },
  dialog: { core: 'alert' },
  card: { core: null, why: 'Core has no Card.' },
};

const git = (cwd, ...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...args], { cwd, encoding: 'utf8' }).trim();

async function coreCheckout(t, files = CORE_FILES) {
  const from = await mkdtemp(join(tmpdir(), 'neon-core-'));
  t.after(() => rm(from, { recursive: true, force: true }));
  for (const [path, content] of Object.entries(files)) {
    await mkdir(dirname(join(from, path)), { recursive: true });
    await writeFile(join(from, path), content);
  }
  git(from, 'init', '-q');
  git(from, 'add', '-A');
  git(from, 'commit', '-q', '-m', 'core');
  return from;
}

async function synced(t, { files, items = ITEMS, counterparts = COUNTERPARTS, uncommitted = {} } = {}) {
  const from = await coreCheckout(t, files);
  for (const [path, content] of Object.entries(uncommitted)) await writeFile(join(from, path), content);
  const out = join(await mkdtemp(join(tmpdir(), 'neon-snapshot-')), 'core');
  t.after(() => rm(dirname(out), { recursive: true, force: true }));
  const result = await syncCore({ from, out, items, counterparts });
  const read = path => readFile(join(out, path), 'utf8');
  const json = async path => JSON.parse(await read(path));
  return { from, out, result, read, json };
}

test('sync writes the snapshot and records the Core commit it came from', async t => {
  const { from, out, json } = await synced(t);
  const snapshot = await json('snapshot.json');
  assert.equal(snapshot.core.commit, git(from, 'rev-parse', 'HEAD'));
  assert.deepEqual((await readdir(join(out, 'components'))).filter(name => name.endsWith('.md')).sort(), ['alert.md', 'button.md']);
});

test('sync refuses a Core checkout with uncommitted docs: the commit it records must be what it compiled', async t => {
  await assert.rejects(synced(t, { uncommitted: { 'docs/components/alert.md': '# Alert — proposal\n\n> Status: Approved.\n\n## Usage\n\n- Two Alerts at a time.\n' } }),
    /uncommitted.*docs\/components\/alert\.md/s);
});

// What the web does not use (ADR 0009): Figma placement, the iOS=True look, Revision history, Dynamic Type.
const NATIVE_ONLY = [/iOS\s*=\s*True/, /Liquid Glass/i, /Dynamic Type/i, /\bRevision\b/, /figma\.com/, /\b\d{2,}:\d{2,}\b/, /\b[0-9a-f]{40}\b/, /\bxxxLarge\b|\bAX3\b/];

test('a component doc keeps the web rules and drops what only Figma and iOS use', async t => {
  const { read } = await synced(t);
  const doc = await read('components/button.md');
  for (const pattern of NATIVE_ONLY) assert.doesNotMatch(doc, pattern);
  for (const dropped of ['Kind and route', 'Build log', 'pass-down']) assert.ok(!doc.includes(dropped), `${dropped} is not a web rule`);
  for (const kept of [
    '# Button',
    '└─ Container      HORIZONTAL, Hug × Hug',
    '| `Hierarchy` | Primary · Secondary · Tertiary | fill |',
    '| Role | `<button>` |',
    '- [x] 7. No text under 11 pt.',
    'Primary is the one action the user is most likely to take. Secondary handles most actions.',
  ]) assert.ok(doc.includes(kept), `missing: ${kept}`);
  assert.doesNotMatch(doc, /^\| `iOS` \|/m, 'the iOS axis is not a web axis');
});

test('links follow the snapshot: kept to docs it holds, plain text to the rest of Core', async t => {
  const { read } = await synced(t);
  const doc = await read('components/button.md');
  assert.ok(doc.includes('- Brand only on Primary. See [hierarchy.md](../hierarchy.md) and [Alert](alert.md); the map is architecture.'), doc);
});

test('a spec resolves to numbers at the web look: no alias, no iOS=True binding, no Figma node', async t => {
  const { json } = await synced(t);
  const { sets: [button] } = await json('components/button.json');
  assert.deepEqual(button.variables, {
    'Button/Container/Round/Small/Layout height': 36,
    'Button/Container/Round/Small/Padding left': 16,
    'Button/Container/Round/Small/Radius': 8,
    'Button/Container/Round/Large/Radius': 200,
    'Button/Container/Round/Large/Layout height': 56,
    'Button/Container/Round/Large/Stroke': 2,
    'Button/Icon/Large/Box': 24,
    'Button/Label/Small/Text style': 'Body/Subheadline',
    'Button/button-outline': { light: { ref: 'Text/text-primary', hex: '#000000D9' }, dark: { ref: 'Text/text-primary', hex: '#FFFFFFFF' } },
    'Button/button-glow': { light: { ref: 'Navy/100', hex: '#001A4DFF' }, dark: { ref: 'Text/text-primary', hex: '#FFFFFFFF' } },
    'Button/button-done': { light: { ref: 'Status/status-success', hex: '#000000D9' }, dark: { ref: 'Status/status-success', hex: '#FFFFFFFF' } },
  });
  assert.deepEqual(button.axes, [
    { name: 'Hierarchy', values: ['Primary', 'Secondary', 'Tertiary'] },
    { name: 'Size', values: ['Small', 'Large'] },
  ]);
  assert.deepEqual(button.exclude, []);
  assert.deepEqual(button.bindings, [
    { layer: 'Container', property: 'paddingLeft', when: '{{Size=*}}', value: 'Components/Button/Container/Round/{{Size=*}}/Padding left' },
    { layer: 'Container', property: 'fills.0', when: '{{Hierarchy=Primary}}', value: 'Theme/Button/button-primary' },
    { layer: 'Container / Label', property: 'minHeight', when: '{{Size=*}}', value: 24, literal: true },
    { layer: 'Container / Label', property: 'itemSpacing', when: '{{Size=*}}', value: 8, literal: true },
  ]);
  // An instance-swap default is a Figma node, which the web cannot follow.
  assert.deepEqual(button.properties, [{ name: 'Label Text', type: 'TEXT', default: 'Label' }, { name: 'Leading artwork', type: 'INSTANCE_SWAP' }]);
});

test('a doc owns the specs its Spec line names and the ones named after it; a draft doc\'s spec stays out', async t => {
  const { out, json } = await synced(t);
  assert.deepEqual((await json('components/button.json')).sets.map(set => set.name), ['Button', 'Button badge', 'Rect button']);
  assert.deepEqual((await json('components/alert.json')).sets.map(set => set.name), ['Alert']);
  assert.deepEqual((await readdir(join(out, 'components'))).filter(name => name.endsWith('.json')).sort(), ['alert.json', 'button.json']);
});

test('a doc states each Scale step it aliases as a number', async t => {
  const { read } = await synced(t);
  const doc = await read('components/button.md');
  assert.ok(doc.includes('| `Button/Container/<Size>` | Padding left, Radius | 16 (`Spacing/spacing-05 = 16`), `Radius/Round (radius-round) = 200` |'), doc);
  assert.ok(doc.includes('| `Button/button-glow` | Light | →`Navy/100` |'), 'an arrow to a color names a primitive the Theme record resolves');
});

test('sync refuses a Theme token that names neither a primitive, a token nor a hex', async t => {
  const theme = { ...THEME, tokens: { ...THEME.tokens, 'Text/text-lost': ['Grey/55', 'Grey/55'] } };
  await assert.rejects(synced(t, { files: { ...CORE_FILES, 'docs/theme/theme.json': JSON.stringify(theme) } }), /theme\.json.*Text\/text-lost.*Grey\/55/s);
});

test('sync refuses an alias Core records no number for, and names it', async t => {
  const spec = { ...BUTTON_SPEC, variables: [{ collection: 'Components', name: 'Button/Gap', type: 'FLOAT', value: '→Sizing/control-huge' }] };
  await assert.rejects(synced(t, { files: { ...CORE_FILES, 'docs/components/button.spec.json': JSON.stringify(spec) } }),
    /button\.spec\.json.*Button\/Gap.*Sizing\/control-huge/s);
});

test('the snapshot carries Theme tokens, Scale steps and text styles as values', async t => {
  const { json } = await synced(t);
  assert.deepEqual(await json('theme.json'), {
    'Text/text-primary': { light: { primitive: 'Black/85A', hex: '#000000D9' }, dark: { primitive: 'White/100', hex: '#FFFFFFFF' } },
    'Button/button-primary': { light: { primitive: 'Navy/100', hex: '#001A4DFF' }, dark: { primitive: 'White/100', hex: '#FFFFFFFF' } },
    'Status/status-success': { light: { via: 'Text/text-primary', primitive: 'Black/85A', hex: '#000000D9' }, dark: { via: 'Text/text-primary', primitive: 'White/100', hex: '#FFFFFFFF' } },
    'Layer/overlay': { light: { hex: '#00000080' }, dark: { primitive: 'Black/85A', hex: '#000000D9' } },
  });
  const scales = await json('scales.json');
  assert.equal(Object.keys(scales).filter(step => step.startsWith('Spacing/')).length, 14);
  for (const [step, value] of Object.entries({
    'Spacing/spacing-00': 0, 'Spacing/spacing-05': 16, 'Spacing/spacing-13': 160,
    'Sizing/control-xsmall': 28, 'Sizing/control-xlarge': 64, 'Sizing/hit-target': 48, 'Sizing/stroke-field': 3, 'Sizing/focus-ring': 2,
    // Radius steps are the ones Core's specs alias: Core keeps no list of them.
    'Radius/radius-sm': 8, 'Radius/radius-round': 200,
  })) assert.equal(scales[step], value, step);
  assert.deepEqual(await json('text-styles.json'), {
    Headline: { size: 17, lineHeight: 24 }, Body: { size: 17, lineHeight: 24 }, Subheadline: { size: 15, lineHeight: 24 }, Footnote: { size: 13, lineHeight: 20 },
    'Icon/Medium': { size: 15, lineHeight: 24 }, 'Icon/Large': { size: 17, lineHeight: 24 }, 'Icon/XLarge': { size: 20, lineHeight: 28 },
  });
});

test('the hierarchy rules come along, without rows for docs the snapshot leaves out', async t => {
  const { read } = await synced(t);
  const hierarchy = await read('hierarchy.md');
  assert.ok(hierarchy.includes('1. **One Primary per context.**'), hierarchy);
  assert.ok(hierarchy.includes('| Button | Primary · Secondary | [button.md](components/button.md) | none |'), hierarchy);
  assert.doesNotMatch(hierarchy, /Sidebar/);
});

test('the index names each registry item\'s Counterpart, or says why it has none', async t => {
  const { json } = await synced(t);
  assert.deepEqual(await json('index.json'), {
    button: { counterpart: 'Button', doc: 'components/button.md', values: 'components/button.json' },
    dialog: { counterpart: 'Alert', doc: 'components/alert.md', values: 'components/alert.json' },
    card: { counterpart: null, why: 'Core has no Card.' },
  });
});

test('sync refuses a Counterpart table that misses a registry item, names a stale one, or points at a doc Core has not approved', async t => {
  await assert.rejects(synced(t, { items: [...ITEMS, 'tabs'] }), /no Counterpart entry.*tabs/s);
  await assert.rejects(synced(t, { items: ['button', 'card'] }), /not registry items.*dialog/s);
  await assert.rejects(synced(t, { counterparts: { ...COUNTERPARTS, card: { core: 'checkbox' } } }), /card.*checkbox.*draft/s);
  await assert.rejects(synced(t, { counterparts: { ...COUNTERPARTS, card: { core: 'tile' } } }), /card.*tile.*no such doc/s);
  await assert.rejects(synced(t, { counterparts: { ...COUNTERPARTS, card: { core: null } } }), /card.*why/s);
});

async function snapshotFiles(directory, prefix = '') {
  const entries = await readdir(join(directory, prefix), { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory() ? snapshotFiles(directory, `${prefix}${entry.name}/`) : [`${prefix}${entry.name}`]));
  return nested.flat();
}

test('nothing in the snapshot carries an alias, a Figma id, the iOS=True look, a Revision or Dynamic Type', async t => {
  const { out, read } = await synced(t);
  // The manifest holds the Core commit and each file's hash, which are hex by nature.
  for (const file of (await snapshotFiles(out)).filter(file => file !== 'snapshot.json')) {
    const content = await read(file);
    for (const pattern of [...NATIVE_ONLY, /→`?(Spacing|Sizing|Radius|Dynamic Type)\//, /nodeId/]) assert.doesNotMatch(content, pattern, file);
    if (file.endsWith('.json')) assert.doesNotMatch(content, /→/, file);
  }
});

// The repository check: a snapshot is only what the sync wrote (ADR 0009: Core changes arrive by a re-sync).
test('the repository check passes a snapshot as the sync wrote it', async t => {
  const { out } = await synced(t);
  await checkCoreSnapshot(out, { items: ITEMS });
  await checkCoreSnapshot(out);
});

test('the repository check refuses a snapshot file edited by hand', async t => {
  const { out, read } = await synced(t);
  await writeFile(join(out, 'components/button.md'), `${await read('components/button.md')}\n- Brand on Secondary is fine.\n`);
  await assert.rejects(checkCoreSnapshot(out, { items: ITEMS }), /components\/button\.md.*does not match.*sync-core/s);
});

test('the repository check refuses an index entry that points at a missing doc', async t => {
  const { out } = await synced(t);
  await rm(join(out, 'components/alert.md'));
  await assert.rejects(checkCoreSnapshot(out, { items: ITEMS }), /dialog.*components\/alert\.md, which the snapshot does not hold/s);
});

test('the repository check refuses a file the sync did not write and a registry item the index leaves out', async t => {
  const { out } = await synced(t);
  await assert.rejects(checkCoreSnapshot(out, { items: [...ITEMS, 'tabs'] }), /index.*tabs/s);
  await writeFile(join(out, 'components/notes.md'), '# Notes\n');
  await assert.rejects(checkCoreSnapshot(out, { items: ITEMS }), /components\/notes\.md.*not.*the sync wrote/s);
});
