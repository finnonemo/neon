import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

// Static guards for finnonemo/neon#220 (records/skills-off-cds.md): the skills default to the
// Neon base, and CDS guidance sits in one reference read only in an app already on CDS.
// They check where the words sit, not what a run reads.
const root = new URL('../../', import.meta.url).pathname;
const CDS_REFERENCE = 'skills/neon-create/references/cds-integration.md';

const skillFiles = async () =>
  (await readdir(join(root, 'skills'), { recursive: true }))
    .filter(name => name.endsWith('.md'))
    .map(name => relative(root, join(root, 'skills', name)));
const lines = async path => (await readFile(join(root, path), 'utf8')).split('\n').map((text, index) => ({ at: `${path}:${index + 1}`, text }));

// A line names CDS when it says the word or one of its paths.
const NAMES_CDS = /\bCDS\b|cds-web|vitejs-cds|theme\/cds/;
// The frozen base for apps already on it: saying so, the dependency that marks it, or keeping it out of other apps.
const AS_FROZEN_BASE = /already on (?:Coinbase Design System \()?CDS|\bfrozen\b|@coinbase\/cds|\b(?:no|not|never|nor)\b[^.;:]*\bCDS\b/;
// Names only CDS has: a shared reference that holds one is carrying CDS guidance.
const CDS_ONLY_NAMES = /ListCell|\bTray\b|useBreakpointTier|ComponentConfigProvider|MediaQueryProvider|PortalProvider|activeColorScheme|tabularNumbers|justifyContent|emphasis="low"|9\.26\.1|createNeonTheme|CSS-to-CDS|CDS adoption/;

test('outside the CDS reference, the skills name CDS only as the frozen base for apps already on it', async () => {
  const stray = [];
  for (const path of await skillFiles()) {
    if (path === CDS_REFERENCE) continue;
    for (const { at, text } of await lines(path)) {
      if (NAMES_CDS.test(text) && !AS_FROZEN_BASE.test(text)) stray.push(`${at}: ${text.slice(0, 120)}`);
    }
  }
  assert.deepEqual(stray, []);
});

test('CDS component names and setup live in the CDS reference alone', async () => {
  const stray = [];
  for (const path of await skillFiles()) {
    if (path === CDS_REFERENCE) continue;
    for (const { at, text } of await lines(path)) {
      const name = text.match(CDS_ONLY_NAMES)?.[0];
      if (name) stray.push(`${at}: ${name}`);
    }
  }
  assert.deepEqual(stray, []);
  // What left the shared references is still there for an app on CDS.
  const reference = await readFile(join(root, CDS_REFERENCE), 'utf8');
  for (const name of ['ListCell', 'Tray', 'useBreakpointTier', 'tabularNumbers', 'multiline', 'colorScheme', 'MediaQueryProvider']) assert.match(reference, new RegExp(name), name);
  for (const heading of ['Functional patterns', 'Functional screen habits', 'Moving CSS-styled UI to CDS components']) assert.match(reference, new RegExp(`^## ${heading}$`, 'm'), heading);
});

test('each entrypoint reaches the CDS reference only behind "already on CDS"', async () => {
  for (const path of await skillFiles()) {
    if (path === CDS_REFERENCE) continue;
    for (const { at, text } of await lines(path)) {
      if (text.includes('cds-integration.md')) assert.match(text, /already on (?:CDS|it)\b/i, at);
    }
  }
  const create = await readFile(join(root, 'skills/neon-create/SKILL.md'), 'utf8');
  assert.match(create.match(/^description: .*$/m)[0], /shadcn\/ui matched to Core/);
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

test('provisional stays on Immersive Themes, gradient recipes and roles without a Core token', async () => {
  const KEPT = /Immersive Theme|gradient|recipe|no Core (?:Theme )?token/i;
  const stray = [];
  for (const path of [...(await skillFiles()), 'README.md']) {
    for (const { at, text } of await lines(path)) {
      if (/provisional/i.test(text) && !KEPT.test(text)) stray.push(`${at}: ${text.slice(0, 120)}`);
    }
  }
  assert.deepEqual(stray, []);
  const contract = await readFile(join(root, 'skills/INSTRUCTION.md'), 'utf8');
  assert.match(contract, /a color role with no Core token stays provisional/);
});

test('the contributor instructions no longer say the skills carry CDS tuning', async () => {
  const agents = await readFile(join(root, 'AGENTS.md'), 'utf8');
  assert.doesNotMatch(agents, /still carry CDS tuning|skills still/);
  assert.match(agents, /Neon matches Core, not CDS/);
});
