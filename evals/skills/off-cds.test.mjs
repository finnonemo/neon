import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';

// Static guards for finnonemo/neon#220 (records/skills-off-cds.md) and finnonemo/neon#258
// (ADR 0016): the skills build on the Neon base, and Neon no longer themes CDS, so CDS appears
// only to say so, to tell an app on it apart, or to keep it out. They check where the words sit,
// not what a run reads, and they read a line at a time: a line is a paragraph or a table row.
const root = new URL('../../', import.meta.url).pathname;

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
// A line names CDS when it says the word or one of its paths.
const NAMES_CDS = /\bCDS\b|cds-web|vitejs-cds|theme\/cds/;
// Saying Neon no longer themes it, telling an app on it apart, or keeping it out of an app.
const AS_RETIRED = /no longer themes CDS|Neon 2\.0\.0 removed|has no Counterpart recorded|\bon CDS\b|\bis mixed\b|\b(?:no|not|never|nor)\b[^.;:]*\bCDS\b|`@coinbase\/cds-web` is CDS/;
// Names only CDS has: a skill that holds one is carrying CDS guidance.
const CDS_ONLY_NAMES = /ListCell|\bTray\b|ComponentConfigProvider|MediaQueryProvider|PortalProvider|activeColorScheme|tabularNumbers|justifyContent|emphasis="low"|9\.26\.1|createNeonTheme|CSS-to-CDS|CDS adoption|cds-integration/;

test('the skills name CDS only to say Neon no longer themes it, to tell it apart or to keep it out', async () => {
  assert.deepEqual(await strayLines(await skillFiles(), text => NAMES_CDS.test(text) && !AS_RETIRED.test(text)), []);
});

test('no skill carries CDS component names or setup, and the CDS reference is gone', async () => {
  assert.deepEqual(await strayLines(await skillFiles(), text => text.match(CDS_ONLY_NAMES)?.[0]), []);
  assert.equal(existsSync(join(root, 'skills/neon-create/references/cds-integration.md')), false);
});

test('neon-create describes what it builds with as shadcn/ui matched to Core', async () => {
  const create = await readFile(join(root, 'skills/neon-create/SKILL.md'), 'utf8');
  assert.match(create.match(/^description: .*$/m)[0], /shadcn\/ui matched to Core/);
});

test('an app on CDS hears that Neon no longer themes CDS and is offered a Rebuild, from every skill that meets one', async () => {
  for (const path of ['neon-create/SKILL.md', 'neon-audit/references/project-inspection.md', 'neon-audit/references/workflow-contract.md', 'neon-redesign/SKILL.md', 'neon-redesign/references/css-integration.md', 'neon-review/references/review-checks.md', 'neon-create/references/neon-base.md']) {
    const offers = (await lines(`skills/${path}`)).filter(({ text }) => /no longer themes CDS/.test(text) && /\[Rebuild\]\([^)]*rebuild\.md\)/.test(text));
    assert.ok(offers.length >= 1, `${path} says Neon no longer themes CDS and links a Rebuild`);
  }
  // The alternative to a Rebuild is component adoption (GLOSSARY), not a restyle.
  const rebuild = await readFile(join(root, 'skills/neon-create/references/rebuild.md'), 'utf8');
  assert.match(rebuild, /rebuild, or keep the app and add Neon's components to it screen by screen/);
  assert.match(rebuild, /an app on CDS is offered|what an app on CDS is offered/);
});

test('the components tier is not named after CDS', async () => {
  const contract = await readFile(join(root, 'skills/neon-audit/references/workflow-contract.md'), 'utf8');
  assert.match(contract, /tier: 'colors' \| 'visual-system' \| 'components';/);
  assert.match(contract, /`components` uses the base's real components and the Finnomena theme/);
  // Neon no longer themes CDS (ADR 0016): a request to add it routes to the Neon base.
  assert.doesNotMatch(contract, /Explicit CDS adoption/);
  assert.match(contract, /Request to add CDS to an app \| `neon-create` on the Neon base/);
  for (const path of await skillFiles()) assert.doesNotMatch(await readFile(join(root, path), 'utf8'), /tier: 'cds'/, path);
});

test('provisional stays on what does not trace to Core: Immersive Themes, gradient recipes and roles without a Core token', async () => {
  const KEPT = /Immersive Theme|gradient|recipe|no Core (?:Theme )?token|not matched to Core/i;
  assert.deepEqual(await strayLines([...(await skillFiles()), 'README.md'], text => /provisional/i.test(text) && !KEPT.test(text)), []);
  const contract = await readFile(join(root, 'skills/INSTRUCTION.md'), 'utf8');
  assert.match(contract, /a color role with no Core token stays provisional/);
  assert.match(contract.split('\n')[2], /the Immersive Themes, the gradient recipes and a color role with no Core token are provisional, with no design approval claimed/);
});

test('the README offers the Neon base and says Neon no longer themes CDS', async () => {
  const readme = await readFile(join(root, 'README.md'), 'utf8');
  assert.doesNotMatch(readme, /real CDS|Full CDS|CDS required|adopting CDS|themed CDS app|already on CDS|frozen CDS/);
  assert.match(readme, /\| Components \| Finnomena theme plus Neon's components on the Neon base \|/);
  assert.match(readme.match(/^\| \[`\/neon:neon-create`\].*$/m)[0], /Neon components \(shadcn\/ui matched to Core\)/);
  assert.match(readme, /Neon no longer themes CDS/);
});

test('the contributor instructions no longer say the skills carry CDS tuning', async () => {
  const agents = await readFile(join(root, 'AGENTS.md'), 'utf8');
  assert.doesNotMatch(agents, /still carry CDS tuning|skills still/);
  assert.match(agents, /Neon matches Core, not CDS/);
});

test('the CDS deprecation notices went with the mode', async () => {
  // finnonemo/neon#287 gave one release of notice; finnonemo/neon#258 removed the mode in Neon 2.0.0.
  for (const path of [...(await skillFiles()), 'README.md', 'GLOSSARY.md']) {
    assert.doesNotMatch(await readFile(join(root, path), 'utf8'), /Neon 2\.0\.0 removes|CDS Install mode[^.]* is deprecated/, path);
  }
});
