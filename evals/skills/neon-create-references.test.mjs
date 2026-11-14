import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Static guards for neon-create reference rules that came from rebuild samples
// (records/cds-rebuild.md, records/neon-rebuild.md). They check the rule is stated, not that a run follows it.
const references = new URL('../../skills/neon-create/references/', import.meta.url).pathname;

test('the rebuild inventory records responsive rules and carries them over', async () => {
  const source = await readFile(`${references}rebuild.md`, 'utf8');
  const inventory = source.match(/3\. \*\*Write the parity inventory\*\*.*$/m)?.[0] ?? '';
  // Health-check samples kept an add-column zone the source hides at 375px.
  assert.match(inventory, /responsive rules/);
  assert.match(inventory, /hides, resizes or rearranges at a breakpoint/);
  assert.match(source, /[Cc]arry each responsive rule into the rebuild/);
  // A copied scroll-to-end effect loaded the column container scrolled sideways.
  assert.match(source, /effects? that (?:depends?|reads?) (?:on )?layout/);
});

test('CDS integration warns that Box lays children out in a flex row', async () => {
  const source = await readFile(`${references}cds-integration.md`, 'utf8');
  // bs-s1's <Box as="section"> laid its fund cards side by side, 1882px wide at 375px.
  assert.match(source, /`Box` computes to `display: flex` in a row/);
  assert.match(source, /flexDirection="column"/);
  assert.match(source, /`VStack`/);
});

test('the rebuild reference builds on the Neon base from Neon items only', async () => {
  const source = await readFile(`${references}rebuild.md`, 'utf8');
  const build = source.match(/## Build\n([\s\S]*?)\n## /)?.[1] ?? '';
  // ADR 0006: a rebuild targets the Neon base, even when the request names CDS, and adds @neon items only.
  assert.match(source, /always targets the Neon base/);
  assert.match(source, /`<app>-neon`/);
  assert.match(build, /no source shadcn component and no CDS/);
  assert.match(build, /never a stock shadcn item/);
  assert.match(build, /\(neon-base\.md#add-neon-items\)/);
  // The base is Tailwind v4, so Tailwind is no longer a source library to leave behind.
  assert.doesNotMatch(build, /Carbon, Tailwind/);
  // CDS's Box rule belongs to apps already on CDS.
  assert.doesNotMatch(build, /`Box`|VStack/);
});

test('the scaffold creates a new app with --new from the Neon registry', async () => {
  const source = await readFile(`${references}scaffold.md`, 'utf8');
  assert.match(source, /install\.mjs" <target-dir> --new/);
  // shadcn installs with npm; the installer refuses --skip-install with --new.
  assert.doesNotMatch(source, /--skip-install|createNeonTheme/);
  assert.match(source, /inside a repository too/);
  assert.match(source, /`@\/layout\/<name>`/);
});

test('neon-create adds only @neon items, through the installer', async () => {
  const files = ['SKILL.md', ...['neon-base.md', 'scaffold.md', 'rebuild.md', 'new-ui-workflow.md'].map(name => `references/${name}`)];
  for (const name of files) {
    const source = await readFile(new URL(`../../skills/neon-create/${name}`, import.meta.url), 'utf8');
    // Any shadcn add the skill shows names a Neon item.
    for (const [command] of source.matchAll(/shadcn(?:@[\w.]+)? add [^\n`]*/g)) assert.match(command, /add @neon\//, `${name}: ${command}`);
  }
  const base = await readFile(`${references}neon-base.md`, 'utf8');
  assert.match(base, /install\.mjs" <app-dir> --add <item>/);
  assert.match(base, /Never run `shadcn add` with a stock item or another registry, and never install CDS/);
});

test('the Neon base reference lists every Neon component item', async () => {
  const { items } = JSON.parse(await readFile(new URL('../../registry/registry.json', import.meta.url), 'utf8'));
  const base = await readFile(`${references}neon-base.md`, 'utf8');
  const listed = base.match(/^Items: (.*)$/m)?.[1] ?? '';
  const names = [...listed.matchAll(/`([\w-]+)`/g)].map(match => match[1]).sort();
  const shipped = items.filter(item => (item.type === 'registry:ui' && !item.meta?.supporting) || ['logo', 'layouts', 'immersive-themes'].includes(item.name)).map(item => item.name).sort();
  assert.deepEqual(names, shipped);
});

test('neon-create keeps the two bases apart and names the items it added', async () => {
  const skill = await readFile(new URL('../../skills/neon-create/SKILL.md', import.meta.url), 'utf8');
  // The components tier: Neon items on a new or Neon-base app, CDS components on an app already on CDS.
  assert.match(skill, /Neon registry items \(`@neon\/<item>`\) in a new or Neon-base app, CDS components in an app already on CDS\. One app never mixes the two/);
  assert.match(skill, /`@neon` registry entry marks the Neon base/);
  assert.match(skill, /In an app already on CDS use verified CDS exports and prop types, never a Neon or shadcn item/);
  assert.match(skill.split('## Done')[1], /Name every `@neon\/` item the work added, in the Handoff Summary/);
  // Routing for apps already on CDS stays with neon-create.
  assert.match(skill.match(/^description: .*$/m)[0], /already on Coinbase Design System/);
});

test('the contract themes a Neon-base Campaign Page through ImmersiveLayout', async () => {
  const contract = await readFile(new URL('../../skills/INSTRUCTION.md', import.meta.url), 'utf8');
  assert.match(contract, /pass the theme as `ImmersiveLayout`'s `immersiveTheme` \(the `@neon\/immersive-themes` registry item\)/);
  assert.match(contract, /Elsewhere, copy the \[generated theme CSS\]/);
  assert.match(contract, /build on the Neon base with Neon registry items; an app already on CDS keeps CDS/);
});

test('neon-create links the Campaign Page content reference behind one condition', async () => {
  const skill = await readFile(new URL('../../skills/neon-create/SKILL.md', import.meta.url), 'utf8');
  const lines = skill.split('\n').filter(line => line.includes('references/campaign-content.md'));
  assert.equal(lines.length, 1);
  assert.match(lines[0], /new or rebuilt Campaign Page/);
});

test('the Campaign Page content reference keeps its four rules', async () => {
  const source = await readFile(`${references}campaign-content.md`, 'utf8');
  // records/campaign-page-content.md: claims first, first screen, rendered headline lines, no invented proof.
  assert.match(source, /claim list.*Done report/);
  assert.match(source, /map the claims onto its section order/);
  assert.match(source, /date and place appear there/);
  assert.match(source, /rendered line count at 375px and 1440px/);
  assert.match(source, /report the headline check as unverified/);
  assert.match(source, /Never invent testimonials/);
  assert.match(source, /pre-launch to-do/);
  assert.match(source, /Brand Intensity and the Brand Floor are unchanged/);
});

test('neon-create recognises a Theme Brief before the Reference Design route', async () => {
  const skill = await readFile(new URL('../../skills/neon-create/SKILL.md', import.meta.url), 'utf8');
  const conditional = skill.split('## Conditional references')[1].split('\n## ')[0].split('\n');
  const briefLine = conditional.findIndex(line => line.includes('(references/theme-brief.md)'));
  const referenceLine = conditional.findIndex(line => line.includes('references/reference-design.md'));
  assert.ok(briefLine >= 0 && briefLine < referenceLine, 'the Theme Brief line comes before the reference-design line');
  assert.match(conditional[briefLine], /Campaign Page with no Reference Design, or a file headed `… — Theme Brief`/);
  assert.match(conditional[referenceLine], /not a recognised Theme Brief/);

  const source = await readFile(`${references}theme-brief.md`, 'utf8');
  const recognise = source.match(/## Recognise a brief\n([\s\S]*?)\n## /)?.[1] ?? '';
  // records/theme-briefs.md cases 3, 4 and 7: header plus registry match, by content, never by path.
  assert.match(recognise, /theme-brief\.mjs" match <file>/);
  assert.match(recognise, /header and status paragraph/);
  assert.match(recognise, /content equals/);
  assert.match(recognise, /never by (?:its )?path/);
  assert.match(recognise, /before (?:any|the) Reference Design/);
  assert.match(recognise, /re-add/);
  assert.match(recognise, /declines.*Reference Design/);
  assert.match(recognise, /state the reason/i);
  // --add keeps an app's own differing file, so a re-add removes it first.
  assert.match(recognise, /remove the copy at `\.\/docs\/theme-briefs\/<theme>-<slug>\.md`.*--add/s);
  const list = source.match(/## List briefs\n([\s\S]*?)\n## /)?.[1] ?? '';
  assert.match(list, /theme-brief\.mjs" list/);
  assert.match(list, /theme-only/);
  assert.match(list, /[Nn]ever guess a brief name/);
  // Case 2: with a Reference Design the procedure and dial govern; the brief gives theme colors only.
  assert.match(source, /Brand Intensity governs the Reference Design.*only its Immersive Theme's colors/s);
  assert.match(source, /`themeBrief`/);
  assert.match(source, /input data/);
});

test('the shared routing sends brief-only Campaign Pages down the Theme Brief path', async () => {
  const design = await readFile(new URL('../../skills/neon-audit/references/reference-design.md', import.meta.url), 'utf8');
  const readWhen = design.split('\n').find(line => line.startsWith('Read when'));
  assert.match(readWhen, /not a Theme Brief/);
  assert.match(readWhen, /theme-brief\.md#recognise-a-brief/);

  const contract = await readFile(new URL('../../skills/neon-audit/references/workflow-contract.md', import.meta.url), 'utf8');
  assert.match(contract, /\| New Campaign Page, no Reference Design \| `neon-create`, Theme Brief path \|/);
  assert.match(contract, /themeBrief\?: string;/);
  assert.match(contract, /`referenceDesign` and `brandIntensity` stay unset on a brief-only page/);

  const instruction = await readFile(new URL('../../skills/INSTRUCTION.md', import.meta.url), 'utf8');
  assert.match(instruction, /A themed Campaign Page starts from a Theme Brief when the employee brings no Reference Design/);
});

test('neon-create reaches campaign direction from the thesis, the checklist, the contract and a brief', async () => {
  const skill = await readFile(new URL('../../skills/neon-create/SKILL.md', import.meta.url), 'utf8');
  const lines = skill.split('## Conditional references')[1].split('\n').filter(line => line.includes('(references/campaign-direction.md)'));
  assert.equal(lines.length, 1);
  assert.match(lines[0], /new or rebuilt Campaign Page on an Immersive Theme/);
  assert.match(lines[0], /looks plain/);
  assert.match(skill.match(/\*\*Design thesis\.\*\*.*$/m)[0], /\(references\/campaign-direction\.md#direction-lines\)/);

  const verification = await readFile(new URL('../../skills/neon-redesign/references/verification.md', import.meta.url), 'utf8');
  assert.match(verification.split('## Look and fix')[1].split('\n## ')[0], /campaign-direction\.md#look-at-it/);
  const contract = await readFile(new URL('../../skills/INSTRUCTION.md', import.meta.url), 'utf8');
  assert.match(contract, /contrast from scale, ground and position.*\(neon-create\/references\/campaign-direction\.md\)/);
  // A brief fixes values and section order; composing stays with the build.
  const brief = await readFile(`${references}theme-brief.md`, 'utf8');
  assert.match(brief, /not its composition.*\(campaign-direction\.md\).*inside the brief's picks and motion level/);
});

test('campaign direction keeps its direction lines, composition moves and motion budget', async () => {
  const source = await readFile(`${references}campaign-direction.md`, 'utf8');
  const part = heading => source.split(`\n## ${heading}\n`)[1]?.split('\n## ')[0] ?? '';
  // The four published briefs gave every occasion component one radius, one padding and title2 at most: values alone made one page in four colors.
  for (const line of ['Register', 'Scale', 'Grounds', 'Motion', 'Assets']) assert.match(part('Direction lines'), new RegExp('- `' + line + ': <'));
  assert.match(part('Direction lines'), /before the first component file/);
  const composition = part('Composition');
  assert.match(composition, /One dominant element per screenful/);
  assert.match(composition, /`display1` to `display3` are for the page's facts/);
  assert.match(composition, /runs edge to edge on a saturated step/);
  assert.match(composition, /row of equal cards for true peers.*once per page/);
  assert.match(composition, /accent family's strongest step.*action/);
  // The moves stay inside the theme's rules and the type roles as shipped.
  assert.match(composition, /text White or Navy, tints by step, one color family per block, no gradient/);
  assert.match(composition, /No letter-spacing.*no tightened line height/);
  // A brief's picks stand; a value it did not pick is a reported departure.
  assert.match(composition, /radius and padding picks stand/);
  assert.match(composition, /departure from the brief/);
  const motion = part('Motion');
  assert.match(motion, /Up to three moments on a `lively` page and two on a `subtle` page, at most one of them a Pinned story/);
  for (const pattern of ['Pinned story', 'Scrubbed reveal', 'Count-up figure', 'Progress rail']) assert.match(motion, new RegExp(`\\*\\*${pattern}\\*\\*`));
  assert.match(motion, /Never go above the brief's level/);
  assert.match(motion, /what moves, what that tells the reader.*its limit.*reduced motion/);
  assert.match(motion, /`transform` and `opacity` only/);
  assert.match(motion, /nothing animates a Brand Pattern/);
  assert.match(part('Look at it'), /verification\.md#look-and-fix/);
  assert.match(part('When it misses'), /changes a direction line first/);
  // A Reference Design's geometry and motion outrank the moves here.
  assert.match(source, /Reference Design at Blended or Reference-led, its geometry and motion replace/);
});
