import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { section as markdownSection } from './markdown-section.mjs';

// Static guards for how neon-redesign, neon-review and neon-audit recognize the
// app's base (records/base-detection.md). They check each skill states the rule
// for the Neon base, CDS and neither, not that a run follows it.
const read = path => readFile(new URL(`../../skills/${path}`, import.meta.url), 'utf8');
const inspection = await read('neon-audit/references/project-inspection.md');
const base = markdownSection(inspection, 'Base');

test('project inspection tells the three bases apart as neon-create does', async () => {
  assert.ok(base, 'project-inspection.md has a ## Base section');
  // Neon base, CDS and neither, by the same markers neon-create's step 1 uses.
  assert.match(base, /\*\*Neon base:\*\* `components\.json` has an `@neon` registry entry/);
  assert.match(base, /\*\*CDS:\*\* `package\.json` depends on `@coinbase\/cds-web`/);
  assert.match(base, /\*\*Neither:\*\* no `@neon` entry and no CDS/);
  const create = await read('neon-create/SKILL.md');
  assert.match(create, /`@coinbase\/cds-web` is CDS/);
  assert.match(create, /`@neon` registry entry marks the Neon base/);
  // A v0 or Lovable app has components.json without @neon: plain shadcn, so neither.
  assert.match(base, /`components\.json` without `@neon` is plain shadcn/);
  assert.match(base, /both .* is mixed/i);
  assert.match(base, /keep the app on its base/);
  assert.match(base, /not a finding/);
});

test('neon-audit recommends a path from the base', async () => {
  const skill = await read('neon-audit/SKILL.md');
  assert.match(skill, /\[base\]\(references\/project-inspection\.md#base\)/);
  // New React work starts on the Neon base; CDS is never offered to an app not already on it.
  assert.match(skill, /new React app starts on the Neon base/);
  assert.match(skill, /an app already on CDS stays on CDS/);
  assert.match(skill, /plain shadcn takes `@neon\/` items only for requested components/);
  assert.match(skill, /or CDS to an app not already on it/);
  assert.doesNotMatch(skill, /Full CDS/);
  assert.match(markdownSection(skill, 'Done'), /the app's base/);
  assert.doesNotMatch(inspection, /CDS is the React implementation path/);
});

test('neon-redesign keeps the app on its base and styles it by that base', async () => {
  const skill = await read('neon-redesign/SKILL.md');
  assert.match(skill, /\[base\]\(\.\.\/neon-audit\/references\/project-inspection\.md#base\)/);
  assert.match(skill, /Restyle keeps it: never add CDS, Neon items or another base/);
  const refs = markdownSection(skill, 'Conditional references');
  // Neon base: role utilities and item props, installed theme untouched.
  assert.match(refs, /Neon base: .*\(\.\.\/neon-create\/references\/neon-base\.md\)/);
  assert.match(refs, /`index\.css`, `src\/theme\/` and Neon item files stay as installed/);
  // Already on CDS: the app's own CSS here, the colors of its CDS components in neon-create.
  assert.match(refs, /App already on CDS: .*the colors of its CDS components go to \[neon-create\]/);
  // Neither, plain shadcn included: the CSS path, no Neon items.
  assert.match(refs, /Neither: .*no Neon items/);
  assert.doesNotMatch(skill.match(/^description: .*$/m)[0], /CDS adoption/);
});

test('neon-review applies the checks of the app\'s base and stays read-only', async () => {
  const skill = await read('neon-review/SKILL.md');
  assert.match(skill, /\[base\]\(\.\.\/neon-audit\/references\/project-inspection\.md#base\)/);
  assert.match(skill, /\[checks\]\(references\/review-checks\.md#checks-by-base\)/);
  const checks = markdownSection(await read('neon-review/references/review-checks.md'), 'Checks by base');
  assert.ok(checks, 'review-checks.md has a ## Checks by base section');
  // Neon base: registry items, type roles, no stock dark classes.
  assert.match(checks, /\*\*Neon base:\*\* every file in `src\/components\/ui\/` is a Neon item/);
  assert.match(checks, /type roles/);
  assert.match(checks, /no `dark:` class/);
  assert.match(checks, /bare `cn`/);
  // ADR 0006 keeps these Radix behaviors.
  assert.match(checks, /Select closes on a pick/);
  assert.match(checks, /announced politely/);
  assert.match(checks, /`aria-hidden` instead of setting `aria-modal`/);
  assert.match(checks, /\*\*Already on CDS \(frozen\):\*\*.*never a Neon item/);
  assert.match(checks, /\*\*Neither:\*\*.*not a finding/);
  assert.match(checks, /no installer and no `shadcn add`/);
});

test('review habits name Neon items, and the CDS names sit in the CDS reference', async () => {
  const habits = markdownSection(await read('neon-review/references/review-checks.md'), 'Functional screen habits');
  for (const item of ['tag', 'list-row', 'table', 'segmented-control']) assert.match(habits, new RegExp(`\`${item}\``), item);
  assert.doesNotMatch(habits, /emphasis=|justifyContent|tabularNumbers|9\.26\.1/);
  const cds = markdownSection(await read('neon-create/references/cds-integration.md'), 'Functional screen habits');
  for (const name of ['emphasis="low"', 'tabularNumbers', 'TableHeader']) assert.ok(cds.includes(name), name);
});
