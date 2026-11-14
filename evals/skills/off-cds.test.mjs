import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

// Static guards for finnonemo/neon#220 (records/skills-off-cds.md): the skills default to the
// Neon base, and CDS guidance sits in one reference read only in an app already on CDS.
// They check where the words sit, not what a run reads, and they read a line at a time: a line
// is a paragraph or a table row, so a stray sentence beside a qualifying one passes.
const root = new URL('../../', import.meta.url).pathname;
const CDS_REFERENCE = 'skills/neon-create/references/cds-integration.md';

const skillFiles = async () =>
  (await readdir(join(root, 'skills'), { recursive: true }))
    .filter(name => name.endsWith('.md'))
    .map(name => relative(root, join(root, 'skills', name)));
const lines = async path => (await readFile(join(root, path), 'utf8')).split('\n').map((text, index) => ({ at: `${path}:${index + 1}`, text }));
// Every line of the given files the predicate calls stray, as "path:line: what".
const strayLines = async (paths, stray) => {
  const found = [];
  for (const path of paths) {
    for (const { at, text } of await lines(path)) {
      const what = stray(text);
      if (what) found.push(`${at}: ${what === true ? text.slice(0, 120) : what}`);
    }
  }
  return found;
};
const sharedSkillFiles = async () => (await skillFiles()).filter(path => path !== CDS_REFERENCE);

// A line names CDS when it says the word or one of its paths.
const NAMES_CDS = /\bCDS\b|cds-web|vitejs-cds|theme\/cds/;
// The frozen base for apps already on it: saying so, telling the two bases apart, or keeping it out of other apps.
const AS_FROZEN_BASE = /already on (?:Coinbase Design System \()?CDS|\bfrozen\b|\bis mixed\b|\b(?:no|not|never|nor)\b[^.;:]*\bCDS\b/;
// Names only CDS has: a shared reference that holds one is carrying CDS guidance.
const CDS_ONLY_NAMES = /ListCell|\bTray\b|useBreakpointTier|ComponentConfigProvider|MediaQueryProvider|PortalProvider|activeColorScheme|tabularNumbers|justifyContent|emphasis="low"|9\.26\.1|createNeonTheme|CSS-to-CDS|CDS adoption/;

test('outside the CDS reference, the skills name CDS only as the frozen base for apps already on it', async () => {
  assert.deepEqual(await strayLines(await sharedSkillFiles(), text => NAMES_CDS.test(text) && !AS_FROZEN_BASE.test(text)), []);
});

test('CDS component names and setup live in the CDS reference alone', async () => {
  assert.deepEqual(await strayLines(await sharedSkillFiles(), text => text.match(CDS_ONLY_NAMES)?.[0]), []);
  // What left the shared references is still there for an app on CDS.
  const reference = await readFile(join(root, CDS_REFERENCE), 'utf8');
  for (const name of ['ListCell', 'Tray', 'useBreakpointTier', 'tabularNumbers', 'multiline', 'colorScheme', 'MediaQueryProvider']) assert.match(reference, new RegExp(name), name);
  for (const heading of ['Functional patterns', 'Functional screen habits', 'Moving CSS-styled UI to CDS components']) assert.match(reference, new RegExp(`^## ${heading}$`, 'm'), heading);
});

test('every link to the CDS reference sits behind "already on CDS"', async () => {
  assert.deepEqual(await strayLines(await sharedSkillFiles(), text => text.includes('cds-integration.md') && !/already on (?:CDS|it)\b/i.test(text)), []);
});

test('neon-create describes what it builds with as shadcn/ui matched to Core', async () => {
  const create = await readFile(join(root, 'skills/neon-create/SKILL.md'), 'utf8');
  assert.match(create.match(/^description: .*$/m)[0], /shadcn\/ui matched to Core/);
});

test('an app already on CDS still reaches CDS from a restyle and from a rebuild question', async () => {
  const css = await readFile(join(root, 'skills/neon-redesign/references/css-integration.md'), 'utf8');
  assert.match(css, /CDS components in an app already on CDS, after the \[checks for moving CSS-styled UI\]\(\.\.\/\.\.\/neon-create\/references\/cds-integration\.md#moving-css-styled-ui-to-cds-components\)/);
  // The alternative to a Rebuild is component adoption (GLOSSARY), not a restyle.
  const rebuild = await readFile(join(root, 'skills/neon-create/references/rebuild.md'), 'utf8');
  assert.match(rebuild, /rebuild, or keep the app and add Neon's components to it screen by screen/);
});

test('the components tier is not named after CDS', async () => {
  const contract = await readFile(join(root, 'skills/neon-audit/references/workflow-contract.md'), 'utf8');
  assert.match(contract, /tier: 'colors' \| 'visual-system' \| 'components';/);
  assert.match(contract, /`components` uses the base's real components and the Finnomena theme/);
  // CDS is frozen (ADR 0006): a request to add it routes to the Neon base.
  assert.doesNotMatch(contract, /Explicit CDS adoption/);
  assert.match(contract, /Request to add CDS to an app without it \| `neon-create` on the Neon base/);
  for (const path of await skillFiles()) assert.doesNotMatch(await readFile(join(root, path), 'utf8'), /tier: 'cds'/, path);
});

test('provisional stays on what does not trace to Core: Immersive Themes, gradient recipes, roles without a Core token and the frozen CDS mapping', async () => {
  const KEPT = /Immersive Theme|gradient|recipe|no Core (?:Theme )?token|not matched to Core|frozen CDS theme's color mapping/i;
  assert.deepEqual(await strayLines([...(await skillFiles()), 'README.md'], text => /provisional/i.test(text) && !KEPT.test(text)), []);
  const contract = await readFile(join(root, 'skills/INSTRUCTION.md'), 'utf8');
  assert.match(contract, /a color role with no Core token stays provisional/);
  // The frozen CDS mapping never traced to Core (theme/cds/color-overrides.ts still says so): it keeps the word.
  assert.match(contract.split('\n')[2], /the frozen CDS theme's color mapping are provisional, with no design approval claimed/);
  assert.match(await readFile(join(root, CDS_REFERENCE), 'utf8'), /is not matched to Core and stays provisional, with no design approval claimed/);
  assert.match(await readFile(join(root, 'theme/cds/color-overrides.ts'), 'utf8'), /PROVISIONAL/);
});

test('the README offers the Neon base, and CDS only to an app already on it', async () => {
  const readme = await readFile(join(root, 'README.md'), 'utf8');
  assert.doesNotMatch(readme, /real CDS|Full CDS|CDS required|adopting CDS|themed CDS app/);
  assert.match(readme, /\| Components \| Finnomena theme plus the real components of the app's base: Neon items, or CDS in an app already on it \|/);
  assert.match(readme.match(/^\| \[`\/neon:neon-create`\].*$/m)[0], /Neon components \(shadcn\/ui matched to Core\)/);
});

test('the contributor instructions no longer say the skills carry CDS tuning', async () => {
  const agents = await readFile(join(root, 'AGENTS.md'), 'utf8');
  assert.doesNotMatch(agents, /still carry CDS tuning|skills still/);
  assert.match(agents, /Neon matches Core, not CDS/);
});

test('every file that offers the CDS Install mode says it is deprecated, names the next major and offers a Rebuild', async () => {
  // finnonemo/neon#287: one release of notice before finnonemo/neon#258 removes the mode.
  const { version } = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  const removedIn = `${Number(version.split('.')[0]) + 1}.0.0`;
  for (const path of ['skills/neon-create/SKILL.md', CDS_REFERENCE, 'skills/neon-audit/SKILL.md', 'skills/neon-audit/references/theme-integration.md', 'README.md', 'GLOSSARY.md']) {
    const notice = (await lines(path)).filter(({ text }) => /CDS Install mode[^.]* is deprecated/.test(text));
    assert.equal(notice.length, 1, `${path} carries the notice once`);
    assert.ok(notice[0].text.includes(`Neon ${removedIn} removes it`), `${notice[0].at} names Neon ${removedIn}`);
    assert.match(notice[0].text, /\bRebuild\b.* on the Neon base/, `${notice[0].at} offers a Rebuild`);
  }
});
