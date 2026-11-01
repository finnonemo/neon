import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { checkSkillMetadata, checkMarkdownEncoding, checkStepReads } from '../../scripts/lib/skill-files.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
// Thai text saved as UTF-8, read back as Latin-1 and saved as UTF-8 again.
const doubleEncodedThai = Buffer.from('ภาษาไทย', 'utf8').toString('latin1');

async function fixture(t, content) {
  const directory = await mkdtemp(join(tmpdir(), 'neon-skill-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, 'SKILL.md');
  await writeFile(file, content);
  return file;
}

const skill = (description, body = '# Skill\n') => `---\nname: demo-skill\ndescription: ${description}\n---\n\n${body}`;
const naming = file => error => error.message.includes(file);

test('rejects an unquoted ": " in a plain-scalar description, naming the file', async t => {
  const file = await fixture(t, skill('Use when: x'));
  await assert.rejects(checkSkillMetadata(file), naming(file));
  await assert.rejects(checkSkillMetadata(file), /": "/);
});

test('rejects a double-encoded Thai line, naming the file', async t => {
  const file = await fixture(t, skill('Use when building Thai screens.', `ภาษาไทย is fine.\n${doubleEncodedThai} is not.\n`));
  await checkSkillMetadata(file);
  await assert.rejects(checkMarkdownEncoding(file), naming(file));
  await assert.rejects(checkMarkdownEncoding(file), /line 7/);
});

test('rejects bytes that are not UTF-8 and replacement characters', async t => {
  const file = await fixture(t, Buffer.concat([Buffer.from('# Title\n'), Buffer.from([0xff, 0x0a])]));
  await assert.rejects(checkMarkdownEncoding(file), naming(file));
  const replaced = await fixture(t, '# Title �\n');
  await assert.rejects(checkMarkdownEncoding(replaced), naming(replaced));
});

test('accepts clean UTF-8 Thai text and typographic punctuation', async t => {
  await checkMarkdownEncoding(await fixture(t, skill('ใช้เมื่อสร้างหน้าจอภาษาไทย', 'ราคา 100 บาท — “quoted” ✓\n')));
});

test('accepts quoted descriptions that contain ": "', async t => {
  await checkSkillMetadata(await fixture(t, skill('"Use when: x"')));
  await checkSkillMetadata(await fixture(t, skill("'Use when: x, or it''s y'")));
});

test('rejects other plain scalars a YAML parser would misread', async t => {
  for (const description of ['Use when x #comment', 'Use when:', '[Use] when x', '- Use when x', '"Use when x', "'Use when x", '"Use" when x']) {
    const file = await fixture(t, skill(description));
    await assert.rejects(checkSkillMetadata(file), naming(file), description);
  }
});

test('enforces the description length limit in characters', async t => {
  await checkSkillMetadata(await fixture(t, skill('ท'.repeat(1024))));
  const file = await fixture(t, skill('ท'.repeat(1025)));
  await assert.rejects(checkSkillMetadata(file), /1024/);
});

test('requires name and a single-line description, and allows other keys', async t => {
  for (const content of [
    '---\ndescription: Use when x\n---\n',
    '---\nname: Demo\ndescription: Use when x\n---\n',
    '---\nname: demo\n---\n',
    '---\nname: demo\ndescription: >\n  Use when x\n---\n',
    '---\nname: demo\nname: demo\ndescription: Use when x\n---\n',
    '---\nname: demo\ndescription: Use when x\n',
    'name: demo\ndescription: Use when x\n',
  ]) {
    const file = await fixture(t, content);
    await assert.rejects(checkSkillMetadata(file), naming(file), content);
  }
  await checkSkillMetadata(await fixture(t, '---\nname: demo\ndescription: Use when x\nlicense: MIT\nmetadata:\n  owner: neon\n---\n'));
});

test('accepts every distributed skill', async () => {
  const manifest = JSON.parse(await readFile(join(root, '.claude-plugin/plugin.json'), 'utf8'));
  for (const skill of manifest.skills) {
    const file = join(root, skill, 'SKILL.md');
    await checkSkillMetadata(file);
    await checkMarkdownEncoding(file);
    await checkStepReads(file);
  }
});

// Evals showed agents skip a reference a step only links ("Verify with the shared checklist").
test('rejects a numbered step that links a Markdown reference without a read verb', async t => {
  const file = await fixture(t, skill('Use when x', '## Steps\n\n1. Plan.\n2. Verify with the [shared checklist](references/verification.md).\n'));
  await assert.rejects(checkStepReads(file), naming(file));
  await assert.rejects(checkStepReads(file), /line 9/);
});

test('accepts read, use and follow pointers, and links outside numbered steps', async t => {
  await checkStepReads(await fixture(t, skill('Use when x', [
    '1. Before reporting, read the [shared checklist](references/verification.md).',
    '2. Use the [shared contract](references/contract.md) if routing is unresolved.',
    '3. Follow [readiness](references/readiness.md#ship-ready).',
    '4. Check with the [probe](references/probe.js).',
    '- New project: [scaffold](references/scaffold.md).',
  ].join('\n'))));
});
