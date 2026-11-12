import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { checkCoreTheme, writeCoreTheme } from '../../scripts/lib/core-theme.mjs';

// A small Core Theme: one token per shape the export has to carry.
const THEME = {
  'Text/text-primary': { light: { primitive: 'Black/85A', hex: '#000000D9' }, dark: { primitive: 'White/100', hex: '#FFFFFFFF' } },
  'Support/support-warning': { light: { primitive: 'Orange/115', hex: '#D3540CFF' }, dark: { primitive: 'Orange/100', hex: '#F26414FF' } },
  'Button/button-primary': { light: { primitive: 'Navy/100', hex: '#01172BFF' }, dark: { primitive: 'Navy/75', hex: '#415160FF' } },
  'Tag/Light Grey/Primary/background': { light: { primitive: 'Light Grey/100', hex: '#E6E8EAFF' }, dark: { primitive: 'Light Grey/100', hex: '#E6E8EAFF' } },
  Transparent: { light: { primitive: 'White/0', hex: '#FFFFFF00' }, dark: { primitive: 'White/0', hex: '#FFFFFF00' } },
};
const primitive = value => ({ value, type: 'color', prefix: 'colors' });
const PALETTE = {
  Black: { '85A': primitive('#000000d9') },
  White: { 0: primitive('#ffffff00'), 100: primitive('#ffffff') },
  Orange: { 100: primitive('#f26414'), 115: primitive('#d3540c') },
  Navy: { 75: primitive('#415160'), 100: primitive('#01172b') },
  'Light Grey': { 100: primitive('#e6e8ea') },
};
const ROLES = {
  currentColor: { light: null, dark: null, why: 'A CSS keyword, not a color.' },
  fg: 'Text/text-primary',
  fgWarning: 'Support/support-warning',
  bgPrimary: 'Button/button-primary',
  bgLineHeavy: { light: null, dark: null, why: 'Core has no token for it.' },
};
// The adapter as it stands before a sync: stale colors, and a dark block that lacks fgWarning.
const ADAPTER = `/* Colors come from Core. */
:root {
  /* --- Colors (light — default) --- */
  --color-currentColor: currentColor;
  --color-fg: rgb(9, 9, 9);
  --color-fgWarning: rgb(9, 9, 9);

  --color-bgPrimary: rgb(9, 9, 9);
  --color-bgLineHeavy: rgba(91, 97, 110, 0.66);

  --space-2: 16px;
}

/* --- Colors (dark) — OS preference --- */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --color-fg: rgb(9, 9, 9);

    --color-bgPrimary: rgb(9, 9, 9);
    --color-bgLineHeavy: rgba(138, 145, 158, 0.66);
  }
}

/* --- Colors (dark) — manual override via data-theme="dark" --- */
:root[data-theme='dark'] {
  --color-fg: rgb(9, 9, 9);

  --color-bgPrimary: rgb(9, 9, 9);
  --color-bgLineHeavy: rgba(138, 145, 158, 0.66);
}
`;

async function repository(t, files = {}) {
  const root = await mkdtemp(join(tmpdir(), 'neon-core-theme-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const all = {
    'core/theme.json': JSON.stringify(THEME),
    'theme/tokens/colors.json': JSON.stringify(PALETTE),
    'theme/css/core-roles.json': JSON.stringify(ROLES),
    'theme/css/theme.css': ADAPTER,
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

test('writes the Theme token export from the Core snapshot, as aliases to primitives', async t => {
  const root = await repository(t);
  await writeCoreTheme(root);
  const written = JSON.parse(await read(root, 'theme/tokens/theme.json'));
  assert.deepEqual(written.light.Text['text-primary'], { value: '{Black.85A}', type: 'color', prefix: 'color' });
  assert.deepEqual(written.dark.Text['text-primary'], { value: '{White.100}', type: 'color', prefix: 'color' });
  assert.equal(written.dark.Button['button-primary'].value, '{Navy.75}');
  // A token three groups deep, in a family whose name has a space.
  assert.equal(written.light.Tag['Light Grey'].Primary.background.value, '{Light Grey.100}');
  // A token with no group sits at the top of its mode.
  assert.equal(written.light.Transparent.value, '{White.0}');
  assert.deepEqual(Object.keys(written), ['light', 'dark']);
});

test('refuses a Theme token whose primitive the palette lacks or holds at another value', async t => {
  const missing = await repository(t, { 'theme/tokens/colors.json': JSON.stringify({ ...PALETTE, Orange: { 100: primitive('#f26414') } }) });
  await assert.rejects(writeCoreTheme(missing), /Support\/support-warning \(light\) is Orange\/115, a primitive .*colors\.json does not have/);
  const moved = await repository(t, { 'theme/tokens/colors.json': JSON.stringify({ ...PALETTE, Navy: { 75: primitive('#415160'), 100: primitive('#000000') } }) });
  await assert.rejects(writeCoreTheme(moved), /Button\/button-primary \(light\) is Navy\/100 = #01172BFF in Core, but .*colors\.json has #000000/);
  await assert.rejects(read(moved, 'theme/tokens/theme.json'), /ENOENT/);
});

test('writes the color of each role the Role table gives a token, in the light block and both dark blocks', async t => {
  const root = await repository(t);
  await writeCoreTheme(root);
  const [light, osDark, manualDark] = (await read(root, 'theme/css/theme.css')).split('/* --- Colors (dark)');
  assert.match(light, /--color-fg: rgba\(0, 0, 0, 0\.851\);/);
  assert.match(light, /--color-fgWarning: rgb\(211, 84, 12\);/);
  assert.match(light, /--color-bgPrimary: rgb\(1, 23, 43\);/);
  for (const dark of [osDark, manualDark]) {
    assert.match(dark, /--color-fg: rgb\(255, 255, 255\);/);
    assert.match(dark, /--color-bgPrimary: rgb\(65, 81, 96\);/);
  }
});

test('adds a role Core darkens to a dark block that lacks it, after the role before it', async t => {
  const root = await repository(t);
  await writeCoreTheme(root);
  const css = await read(root, 'theme/css/theme.css');
  assert.match(css, /    --color-fg: rgb\(255, 255, 255\);\n    --color-fgWarning: rgb\(242, 100, 20\);\n\n    --color-bgPrimary/);
  assert.match(css, /\n  --color-fg: rgb\(255, 255, 255\);\n  --color-fgWarning: rgb\(242, 100, 20\);\n\n  --color-bgPrimary/);
});

test('leaves a role with no Core token, and everything that is not a color, as written', async t => {
  const root = await repository(t);
  await writeCoreTheme(root);
  const css = await read(root, 'theme/css/theme.css');
  assert.match(css, /--color-currentColor: currentColor;/);
  assert.match(css, /--color-bgLineHeavy: rgba\(91, 97, 110, 0\.66\);/);
  assert.equal(css.match(/--color-bgLineHeavy: rgba\(138, 145, 158, 0\.66\);/g).length, 2);
  assert.match(css, /--space-2: 16px;/);
  assert.match(css, /^\/\* Colors come from Core\. \*\/\n:root \{\n  \/\* --- Colors \(light — default\) --- \*\//);
});

test('refuses an adapter role the Role table does not list, and a listed role the adapter lacks', async t => {
  const unlisted = await repository(t, { 'theme/css/theme.css': ADAPTER.replace('  --space-2', '  --color-bgNew: rgb(1, 2, 3);\n  --space-2') });
  await assert.rejects(writeCoreTheme(unlisted), /color roles .*core-roles\.json does not list: bgNew/);
  const gone = await repository(t, { 'theme/css/core-roles.json': JSON.stringify({ ...ROLES, fgGone: 'Text/text-primary' }) });
  await assert.rejects(writeCoreTheme(gone), /lists roles .*theme\.css does not have: fgGone/);
  const unknown = await repository(t, { 'theme/css/core-roles.json': JSON.stringify({ ...ROLES, fg: 'Text/text-missing' }) });
  await assert.rejects(writeCoreTheme(unknown), /fg \(light\) the token Text\/text-missing, which the Core snapshot's Theme does not have/);
});

test('writes and adds colors in a dark block that also holds a comment', async t => {
  const root = await repository(t, { 'theme/css/theme.css': ADAPTER.replace(":root[data-theme='dark'] {\n", ":root[data-theme='dark'] {\n  /* Same as the block above. */\n") });
  await writeCoreTheme(root);
  const manualDark = (await read(root, 'theme/css/theme.css')).split('/* --- Colors (dark)')[2];
  assert.match(manualDark, /\/\* Same as the block above\. \*\/\n  --color-fg: rgb\(255, 255, 255\);\n  --color-fgWarning: rgb\(242, 100, 20\);/);
});

test('refuses a Role table entry that keeps a value without saying why, or leaves a mode out', async t => {
  const silent = await repository(t, { 'theme/css/core-roles.json': JSON.stringify({ ...ROLES, bgLineHeavy: { light: null, dark: null } }) });
  await assert.rejects(writeCoreTheme(silent), /core-roles\.json must give bgLineHeavy .* why/);
  const half = await repository(t, { 'theme/css/core-roles.json': JSON.stringify({ ...ROLES, fg: { light: 'Text/text-primary', why: 'Dark is not decided.' } }) });
  await assert.rejects(writeCoreTheme(half), /core-roles\.json must give fg /);
});

test('the check passes what the sync wrote, and writing again changes nothing', async t => {
  const root = await repository(t);
  await writeCoreTheme(root);
  await checkCoreTheme(root);
  const before = [await read(root, 'theme/tokens/theme.json'), await read(root, 'theme/css/theme.css')];
  await writeCoreTheme(root);
  assert.deepEqual([await read(root, 'theme/tokens/theme.json'), await read(root, 'theme/css/theme.css')], before);
});

test('the check refuses a token export that differs from the snapshot\'s Theme', async t => {
  const root = await repository(t);
  await writeCoreTheme(root);
  await edit(root, 'theme/tokens/theme.json', text => text.replace('{Black.85A}', '{Black.65A}'));
  await assert.rejects(checkCoreTheme(root), /theme\/tokens\/theme\.json does not equal the Core snapshot's Theme/);
});

test('the check refuses an adapter color edited by hand, naming the line', async t => {
  const root = await repository(t);
  await writeCoreTheme(root);
  await edit(root, 'theme/css/theme.css', text => text.replace('--color-bgPrimary: rgb(1, 23, 43);', '--color-bgPrimary: rgb(0, 0, 0);'));
  await assert.rejects(checkCoreTheme(root), /theme\/css\/theme\.css:8 does not hold the color .* expected "--color-bgPrimary: rgb\(1, 23, 43\);"/);
});

test('the check refuses a snapshot Theme that moved on without a sync', async t => {
  const root = await repository(t);
  await writeCoreTheme(root);
  const moved = { ...THEME, 'Text/text-primary': { ...THEME['Text/text-primary'], dark: { primitive: 'White/0', hex: '#FFFFFF00' } } };
  await writeFile(join(root, 'core/theme.json'), JSON.stringify(moved));
  await assert.rejects(checkCoreTheme(root), /theme\/tokens\/theme\.json does not equal/);
});

test('the check refuses a color declared in a shape the sync does not write', async t => {
  const written = '  --color-bgPrimary: rgb(1, 23, 43);';
  // No space after the colon; a second declaration on the line: neither is a line the sync rewrites.
  for (const edited of ['  --color-bgPrimary:rgb(0, 0, 0);', `${written} --color-fg: red;`]) {
    const root = await repository(t);
    await writeCoreTheme(root);
    await edit(root, 'theme/css/theme.css', text => text.replace(written, edited));
    await assert.rejects(checkCoreTheme(root), /theme\/css\/theme\.css:8 .* alone on its line/);
  }
});
