import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { section } from './markdown-section.mjs';

// Static guards for how the skills read component rules from the Core snapshot
// (records/core-component-rules.md). They check the rule is stated and reachable,
// not that a run follows it.
const root = new URL('../../', import.meta.url).pathname;
const read = path => readFile(`${root}${path}`, 'utf8');
const linesNaming = (source, name) => source.split('\n').filter(line => line.includes(name));

test('each skill reaches the Core rules behind one read condition, outside its workflow steps', async () => {
  const conditions = {
    'neon-create': /About to choose a Neon item or one of its prop values/,
    'neon-redesign': /`composition: 'adapt'` on the Neon base/,
    'neon-review': /On the Neon base, a finding about how a component is used/,
    'neon-audit': /which of the app's components have a Counterpart/,
  };
  for (const [skill, condition] of Object.entries(conditions)) {
    const source = await read(`skills/${skill}/SKILL.md`);
    const lines = linesNaming(source, 'core-rules.md');
    assert.equal(lines.length, 1, `${skill} links the reference once`);
    assert.match(lines[0], condition, skill);
    // A read condition, not a mandatory step: the numbered workflow never sends a run to Core.
    assert.doesNotMatch(section(source, 'Workflow'), /core-rules\.md|core\/(?:index|hierarchy|components)/, skill);
    assert.ok(section(source, 'Conditional references').includes(lines[0]), `${skill}: the link is a conditional reference`);
    // An entrypoint names no Core doc of its own.
    assert.doesNotMatch(source, /core\/components\//, skill);
  }
});

test('colors-only and visual-system work reads no component doc', async () => {
  const rules = await read('skills/neon-audit/references/core-rules.md');
  assert.match(rules, /Colors-only and visual-system work reads no component doc/);
  assert.match(rules, /`composition: 'preserve'`/);
  const create = linesNaming(await read('skills/neon-create/SKILL.md'), 'core-rules.md')[0];
  assert.match(create, /[Cc]olors-only work reads none/);
  const redesign = linesNaming(await read('skills/neon-redesign/SKILL.md'), 'core-rules.md')[0];
  assert.match(redesign, /`colors` and `visual-system` restyles read no component doc/);
  const review = await read('skills/neon-review/references/review-checks.md');
  assert.match(review, /colors-only review reads no component doc/);
});

test('the Core rules reference reads the snapshot through its index, one component at a time', async () => {
  const rules = await read('skills/neon-audit/references/core-rules.md');
  assert.match(rules, /\]\(\.\.\/\.\.\/\.\.\/core\/index\.json\)/);
  assert.match(rules, /\]\(\.\.\/\.\.\/\.\.\/core\/hierarchy\.md\)/);
  assert.match(rules, /Start from the index/);
  assert.match(rules, /only the items the task is about to use/);
  assert.match(rules, /`## Usage`/);
  assert.match(rules, /`### Hierarchy`/);
  // The web look is the only one Neon draws (ADR 0009).
  assert.match(rules, /`iOS=False`/);
  // A Core doc never widens scope.
  assert.match(rules, /does not license restructuring/);
  // The sections the reference tells a run to read exist in the snapshot.
  const index = JSON.parse(await read('core/index.json'));
  const button = await read(`core/${index.button.doc}`);
  assert.match(button, /^## Usage$/m);
  assert.match(button, /^### Hierarchy$/m);
  assert.match(await read('core/hierarchy.md'), /^## Rules every component keeps$/m);
  // "Read from that heading to the end" holds for every Counterpart's doc.
  assert.match(rules, /read from it to the end of the file/);
  for (const doc of new Set(Object.values(index).map(entry => entry.doc).filter(Boolean))) {
    const headings = [...(await read(`core/${doc}`)).matchAll(/^## (.*)$/gm)].map(match => match[1]);
    assert.equal(headings.at(-1), 'Usage', doc);
  }
});

test('a review finding on a component names the Core rule it breaks', async () => {
  const rules = await read('skills/neon-audit/references/core-rules.md');
  const cite = section(rules, 'Cite a rule');
  assert.match(cite, /the doc, the section and the rule/);
  assert.match(cite, /no Counterpart/);
  const checks = await read('skills/neon-review/references/review-checks.md');
  assert.match(checks, /names the Core rule it breaks/);
  const example = section(checks, 'Finding example');
  // The worked finding cites a rule the snapshot holds, by number.
  assert.match(example, /Core `hierarchy\.md`, rule 1/);
  assert.match(await read('core/hierarchy.md'), /^1\. \*\*One Primary per context\.\*\*/m);
  const skill = await read('skills/neon-review/SKILL.md');
  assert.match(section(skill, 'Done'), /on the Neon base, a finding on a component names the Core rule it breaks/);
});

test('the audit report says which components have a Counterpart', async () => {
  const rules = await read('skills/neon-audit/references/core-rules.md');
  const coverage = section(rules, 'Counterpart coverage');
  assert.match(coverage, /`src\/components\/ui\/`/);
  assert.match(coverage, /`why`/);
  // The index is keyed by item name: a stock file of the same name is not that item.
  assert.match(coverage, /even under a matching file name/);
  // Coverage comes from the index alone.
  assert.match(coverage, /reads no component doc/);
  const skill = await read('skills/neon-audit/SKILL.md');
  assert.match(section(skill, 'Done'), /which of its components have a Counterpart/);
});

test('the contract links Core for component rules instead of restating them', async () => {
  const contract = await read('skills/INSTRUCTION.md');
  assert.match(contract, /\*\*Core snapshot/);
  assert.match(contract, /\]\(\.\.\/core\/hierarchy\.md\)/);
  assert.match(contract, /\]\(neon-audit\/references\/core-rules\.md\)/);
  // Core's hierarchy rules 1, 3 and 4.
  assert.doesNotMatch(contract, /one primary action per screen/);
  assert.doesNotMatch(contract, /row and other actions are secondary or tertiary/);
  // Rule 5: rejecting a request removes no data, so it is not destructive.
  assert.doesNotMatch(contract, /reject action uses the appropriate destructive treatment/);
  // Core's Sheet is not for a confirmation or a menu of actions.
  assert.doesNotMatch(contract, /secondary tasks open in a bottom sheet/);

  const base = await read('skills/neon-create/references/neon-base.md');
  // The Neon base names which prop value is which Core value; when to use each is Core's.
  assert.doesNotMatch(base, /for the one action the screen is for|for most other actions|for the way out/);
  assert.match(base, /\]\(\.\.\/\.\.\/neon-audit\/references\/core-rules\.md\)/);
  const buttonItem = await read('registry/ui/button.tsx');
  for (const [variant, core] of [['default', 'Primary Default'], ['secondary', 'Secondary Default'], ['ghost', 'Tertiary Default'], ['destructive', 'Primary Danger'], ['brand', 'Primary Brand'], ['inverse', 'Primary Inverse']]) {
    assert.match(buttonItem, new RegExp(`//.*\\b${variant}\\s+${core}`), `button.tsx: ${variant}`);
    assert.match(base, new RegExp(`\`${variant}\` (?:is )?${core}`), `neon-base.md: ${variant}`);
  }
});

test('where the patterns differed from Core, they link Core', async () => {
  const patterns = await read('skills/neon-audit/references/functional-patterns.md');
  // Core's Button dock puts Cancel at the bottom of a stack and allows two labels side by side.
  assert.doesNotMatch(patterns, /primary nearest the bottom edge|never holds side-by-side buttons/);
  assert.match(patterns, /\]\(\.\.\/\.\.\/\.\.\/core\/components\/button-dock\.md#usage\)/);
  // Core's sheet has 16px corners and no side sheet; a wide screen anchors a Popover or centres a sheet.
  assert.doesNotMatch(patterns, /largest shipped radius|side panel or dialog/);
  // Core's Alert is not for a form, its Sheet not for a menu of actions, and its empty state takes one or two sentences.
  assert.doesNotMatch(patterns, /centered dialog|a record's actions|one short sentence/);
  assert.match(await read('core/components/alert.md'), /^- Not for: a form, long content or several steps/m);
  assert.match(await read('core/components/sheet.md'), /^- Not for: .*a menu of actions/m);
  assert.match(patterns, /\]\(\.\.\/\.\.\/\.\.\/core\/components\/sheet\.md#usage\)/);
  assert.match(patterns, /\]\(\.\.\/\.\.\/\.\.\/core\/components\/popover\.md#usage\)/);
  assert.match(patterns, /\]\(\.\.\/\.\.\/\.\.\/core\/hierarchy\.md\)/);
  // Each pattern link lands on the section that holds the rule.
  for (const doc of ['button-dock', 'sheet', 'popover', 'alert', 'empty-state']) {
    assert.match(patterns, new RegExp(`core/components/${doc}\\.md#usage\\)`), doc);
    assert.match(await read(`core/components/${doc}.md`), /^## Usage$/m, doc);
  }
  assert.match(patterns, /Read \[Core rules\]\(core-rules\.md\) before opening one/);
});
