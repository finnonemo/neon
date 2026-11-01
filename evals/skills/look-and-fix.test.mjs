import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { numericScore, section } from './markdown-section.mjs';

// Static guards for the shared checklist's Look and fix loop (#53; README "Look and fix").
// They check the loop is stated and linked, not that a run follows it.
const skills = new URL('../../skills/', import.meta.url).pathname;
const read = path => readFile(join(skills, path), 'utf8');

test('verification places Look and fix between the shared checklist and the creation additions', async () => {
  const source = await read('neon-redesign/references/verification.md');
  const headings = [...source.matchAll(/^## (.+)$/gm)].map(match => match[1]);
  assert.deepEqual(headings.slice(0, 3), ['Shared checklist', 'Look and fix', 'Creation additions']);
});

test('the loop screenshots both widths, critiques in the review finding shape and stops after three rounds', async () => {
  const loop = section(await read('neon-redesign/references/verification.md'), 'Look and fix');
  assert.match(loop, /375px and 1440px/);
  // neon-review's Done defines the finding shape the critique reuses.
  assert.match(loop, /\(\.\.\/\.\.\/neon-review\/SKILL\.md#done\)/);
  for (const part of ['severity', 'location', 'evidence', 'fix', 'recheck']) assert.match(loop, new RegExp(part));
  assert.match(loop, /one-question-first-screen/);
  assert.match(loop, /Thai text/);
  assert.match(loop, /top three/);
  assert.match(loop, /three rounds/);
  assert.match(loop, /task hierarchy.*composition and edges.*typography and wrapping.*color roles.*states and focus.*motion/s);
});

test('colors-only work fixes only color problems', async () => {
  const loop = section(await read('neon-redesign/references/verification.md'), 'Look and fix');
  assert.match(loop, /[Cc]olors-only.*only color problems/);
});

test('without visible screenshots the loop is reported as not run, never critiqued from source', async () => {
  const loop = section(await read('neon-redesign/references/verification.md'), 'Look and fix');
  assert.match(loop, /`Look and fix, round \d \(375px, 1440px\): /);
  assert.match(loop, /`Look and fix: not run; recheck at 375px and 1440px`/);
  assert.match(loop, /[Nn]ever critique from source/);
});

test('no skill file gives the UI a numeric score', async () => {
  const loop = section(await read('neon-redesign/references/verification.md'), 'Look and fix');
  assert.match(loop, /[Dd]o not score/);
  const files = (await readdir(skills, { recursive: true })).filter(name => name.endsWith('.md'));
  for (const file of files) {
    const source = await read(file);
    assert.doesNotMatch(source, numericScore, file);
  }
});

test('neon-create and neon-redesign reach the loop from step 5 and from Done', async () => {
  for (const [skill, link] of [
    ['neon-create/SKILL.md', '../neon-redesign/references/verification.md#look-and-fix'],
    ['neon-redesign/SKILL.md', 'references/verification.md#look-and-fix'],
  ]) {
    const source = await read(skill);
    const step5 = source.match(/^5\. .*$/m)?.[0] ?? '';
    assert.ok(step5.includes(`](${link})`), `${skill} step 5 links Look and fix`);
    assert.match(step5, /read/);
    assert.ok(section(source, 'Done').includes(`](${link})`), `${skill} Done links Look and fix`);
  }
});
