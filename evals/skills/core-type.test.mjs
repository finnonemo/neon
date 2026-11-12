import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkCoreType, writeCoreType } from '../../scripts/lib/core-type.mjs';

// A small set of Core text styles: one a role keeps its size on, one that changes it, one no role takes.
const TEXT_STYLES = {
  'Title 1': { size: 28, lineHeight: 40 },
  Body: { size: 17, lineHeight: 24 },
  Subheadline: { size: 15, lineHeight: 24 },
  'Caption 2': { size: 11, lineHeight: 16 },
};
const TYPE_ROLES = { title1: 'Title 1', body: 'Body', label1: 'Subheadline', label2: 'Subheadline' };
// The adapter as it stands before a sync: the CDS capture, in px and in rem.
const ADAPTER = `:root {
  --color-fg: rgb(9, 9, 9);

  /* --- Typography (mode-independent) --- */
  --fontFamily-title1: 'IBM Plex Sans Thai', sans-serif;
  --fontFamily-body: 'IBM Plex Sans Thai', sans-serif;
  --fontFamily-label1: 'IBM Plex Sans Thai', sans-serif;
  --fontFamily-label2: 'IBM Plex Sans Thai', sans-serif;

  --fontSize-title1: 28px;
  --fontSize-body: 17px;
  --fontSize-label1: 0.875rem;
  --fontSize-label2: 0.875rem;

  --fontWeight-title1: 400;
  --fontWeight-body: 400;
  --fontWeight-label1: 600;
  --fontWeight-label2: 400;

  --lineHeight-title1: 34px;
  --lineHeight-body: 22px;
  --lineHeight-label1: 1.25rem;
  --lineHeight-label2: 1.25rem;

  --space-2: 16px;
}
`;
const CONTRACT = `# Design contract

## Typography

| Type role | Core text style |
|---|---|
| \`title1\` | Title 1 |
| \`body\` | Body |
| \`label1\` | Subheadline |
| \`label2\` | Subheadline |

Use the roles.
`;

async function repository(t, files = {}) {
  const root = await mkdtemp(join(tmpdir(), 'neon-core-type-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const all = {
    'core/text-styles.json': JSON.stringify(TEXT_STYLES),
    'theme/css/core-type-roles.json': JSON.stringify(TYPE_ROLES),
    'theme/css/theme.css': ADAPTER,
    'skills/INSTRUCTION.md': CONTRACT,
    ...files,
  };
  for (const [path, text] of Object.entries(all)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), text);
  }
  return root;
}
const read = (root, path) => readFile(join(root, path), 'utf8');
const edit = async (root, path, change) => writeFile(join(root, path), change(await read(root, path)));

test('writes each type role\'s size and line height from the Core text style its table entry names', async t => {
  const root = await repository(t);
  await writeCoreType(root);
  const css = await read(root, 'theme/css/theme.css');
  assert.match(css, /--fontSize-title1: 28px;/);
  assert.match(css, /--lineHeight-title1: 40px;/);
  assert.match(css, /--fontSize-body: 17px;/);
  assert.match(css, /--lineHeight-body: 24px;/);
  // Two roles may take one text style; they still differ by weight.
  for (const role of ['label1', 'label2']) {
    assert.match(css, new RegExp(`--fontSize-${role}: 15px;`));
    assert.match(css, new RegExp(`--lineHeight-${role}: 24px;`));
  }
});

test('leaves family, weight and everything that is not a type size or line height as written', async t => {
  const root = await repository(t);
  await writeCoreType(root);
  const css = await read(root, 'theme/css/theme.css');
  assert.match(css, /--fontFamily-label1: 'IBM Plex Sans Thai', sans-serif;/);
  assert.match(css, /--fontWeight-label1: 600;/);
  assert.match(css, /--fontWeight-label2: 400;/);
  assert.match(css, /--color-fg: rgb\(9, 9, 9\);/);
  assert.match(css, /--space-2: 16px;/);
  assert.equal(css.split('\n').length, ADAPTER.split('\n').length);
});

test('refuses a type role the Type role table does not list, and a listed role the adapter lacks', async t => {
  const unlisted = await repository(t, { 'theme/css/theme.css': ADAPTER.replace('  --fontWeight-title1', '  --fontSize-legal: 13px;\n\n  --fontWeight-title1').replace('  --space-2', '  --lineHeight-legal: 16px;\n\n  --space-2') });
  await assert.rejects(writeCoreType(unlisted), /type roles .*core-type-roles\.json does not list: legal/);
  const gone = await repository(t, { 'theme/css/core-type-roles.json': JSON.stringify({ ...TYPE_ROLES, caption: 'Caption 2' }) });
  await assert.rejects(writeCoreType(gone), /lists type roles .*theme\.css does not have: caption/);
});

test('refuses a table entry that is not one text style the Core snapshot has', async t => {
  const unknown = await repository(t, { 'theme/css/core-type-roles.json': JSON.stringify({ ...TYPE_ROLES, body: 'Body Large' }) });
  await assert.rejects(writeCoreType(unknown), /gives body the text style Body Large, which the Core snapshot does not have/);
  const two = await repository(t, { 'theme/css/core-type-roles.json': JSON.stringify({ ...TYPE_ROLES, body: ['Body', 'Subheadline'] }) });
  await assert.rejects(writeCoreType(two), /core-type-roles\.json must give body one Core text style/);
  assert.equal(await read(two, 'theme/css/theme.css'), ADAPTER);
});

test('refuses a type role that has a size without a line height', async t => {
  const half = await repository(t, { 'theme/css/theme.css': ADAPTER.replace('  --lineHeight-body: 22px;\n', '') });
  await assert.rejects(writeCoreType(half), /theme\.css gives body no --lineHeight-body/);
});

test('the check passes what the sync wrote, and writing again changes nothing', async t => {
  const root = await repository(t);
  await writeCoreType(root);
  await checkCoreType(root);
  const before = await read(root, 'theme/css/theme.css');
  await writeCoreType(root);
  assert.equal(await read(root, 'theme/css/theme.css'), before);
});

test('the check refuses a size or line height edited by hand, naming the line', async t => {
  const root = await repository(t);
  await writeCoreType(root);
  await edit(root, 'theme/css/theme.css', text => text.replace('--lineHeight-body: 24px;', '--lineHeight-body: 22px;'));
  await assert.rejects(checkCoreType(root), /theme\/css\/theme\.css:21 does not hold what .*core-type-roles\.json and the Core snapshot's text styles give it: expected "--lineHeight-body: 24px;"/);
});

test('the check refuses text styles that moved on in the snapshot without a sync', async t => {
  const root = await repository(t);
  await writeCoreType(root);
  await writeFile(join(root, 'core/text-styles.json'), JSON.stringify({ ...TEXT_STYLES, Body: { size: 17, lineHeight: 28 } }));
  await assert.rejects(checkCoreType(root), /expected "--lineHeight-body: 28px;"/);
});

test('the check refuses a size declared in a shape the sync does not write', async t => {
  const written = '  --fontSize-body: 17px;';
  // No space after the colon; a second declaration on the line: neither is a line the sync rewrites.
  for (const edited of ['  --fontSize-body:18px;', `${written} --lineHeight-body: 22px;`]) {
    const root = await repository(t);
    await writeCoreType(root);
    await edit(root, 'theme/css/theme.css', text => text.replace(written, edited));
    await assert.rejects(checkCoreType(root), /theme\/css\/theme\.css:11 .* alone on its line/);
  }
});

test('the check refuses a design contract whose table differs from the Type role table', async t => {
  const moved = await repository(t);
  await writeCoreType(moved);
  await edit(moved, 'skills/INSTRUCTION.md', text => text.replace('| `label1` | Subheadline |', '| `label1` | Footnote |'));
  await assert.rejects(checkCoreType(moved), /skills\/INSTRUCTION\.md maps label1 to Footnote, but .*core-type-roles\.json gives it Subheadline/);
  const missing = await repository(t);
  await writeCoreType(missing);
  await edit(missing, 'skills/INSTRUCTION.md', text => text.replace('| `label2` | Subheadline |\n', ''));
  await assert.rejects(checkCoreType(missing), /skills\/INSTRUCTION\.md maps label2 to nothing, but .*core-type-roles\.json gives it Subheadline/);
  const extra = await repository(t);
  await writeCoreType(extra);
  await edit(extra, 'skills/INSTRUCTION.md', text => text.replace('| `body` | Body |\n', '| `body` | Body |\n| `callout` | Subheadline |\n'));
  await assert.rejects(checkCoreType(extra), /skills\/INSTRUCTION\.md maps callout, a type role .*core-type-roles\.json does not list/);
  const none = await repository(t, { 'skills/INSTRUCTION.md': '# Design contract\n\nUse the roles.\n' });
  await writeCoreType(none);
  await assert.rejects(checkCoreType(none), /skills\/INSTRUCTION\.md has no "\| Type role \| Core text style \|" table/);
});

// ---- This repository: the type roles apps already use keep their names (ADR 0009: 1.0 only adds).

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url));
const NEON_TYPE_ROLES = ['display1', 'display2', 'display3', 'title1', 'title2', 'title3', 'title4', 'headline', 'body', 'label1', 'label2', 'caption', 'legal'];

test('every Neon type role keeps its name in the Type role table, the adapter and the Neon base', async () => {
  const table = JSON.parse(await read(repositoryRoot, 'theme/css/core-type-roles.json'));
  assert.deepEqual(Object.keys(table), NEON_TYPE_ROLES);
  const adapter = await read(repositoryRoot, 'theme/css/theme.css');
  const base = await read(repositoryRoot, 'registry/theme/neon.css');
  for (const role of NEON_TYPE_ROLES) {
    for (const variable of ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight']) assert.match(adapter, new RegExp(`--${variable}-${role}: `), `${role} lacks --${variable}-${role}`);
    assert.ok(base.includes(`--text-${role}: var(--fontSize-${role}); --text-${role}--line-height: var(--lineHeight-${role});`), `the Neon base lacks text-${role}`);
  }
});

test('the adapter\'s type roles hold Core\'s Thai line heights, and IBM Plex Sans Thai', async () => {
  await checkCoreType(repositoryRoot);
  const adapter = await read(repositoryRoot, 'theme/css/theme.css');
  // Worked from Core's ADR 0012: 1.4 × size, rounded up to a multiple of 4.
  for (const [role, size, lineHeight] of [['title1', 28, 40], ['body', 17, 24], ['label1', 15, 24], ['caption', 13, 20]]) {
    assert.match(adapter, new RegExp(`--fontSize-${role}: ${size}px;`));
    assert.match(adapter, new RegExp(`--lineHeight-${role}: ${lineHeight}px;`));
    assert.match(adapter, new RegExp(`--fontFamily-${role}: 'IBM Plex Sans Thai', sans-serif;`));
  }
});
