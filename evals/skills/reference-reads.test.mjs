import test from 'node:test';
import assert from 'node:assert/strict';
import { coreReads, expandBraces, referenceReads, skillPaths, status } from './reference-reads.mjs';

const home = '/private/hc-s1/codex-home/plugins/cache/neon/skills';
const files = {
  [`${home}/neon-create/references/rebuild.md`]: '# Rebuild\n\nInventory every screen, state and interaction before building.\n',
  [`${home}/neon-create/references/cds-integration.md`]: '# CDS integration\n\n## Component APIs and tokens\n\nStyle CDS components through their props.\n',
  [`${home}/neon-create/references/scaffold.md`]: '# Scaffold\n\nCopy the starter into a sibling directory first.\n',
};
const read = async path => {
  if (!(path in files)) throw new Error(`ENOENT ${path}`);
  return files[path];
};
const command = (text, output) => ({ type: 'item.completed', item: { type: 'command_execution', command: text, aggregated_output: output } });

test('expands nested and sequential brace groups', () => {
  assert.deepEqual(expandBraces('r/{a,b{1,2}}.md'), ['r/a.md', 'r/b1.md', 'r/b2.md']);
  assert.deepEqual(expandBraces('{x,y}/{p,q}.md'), ['x/p.md', 'x/q.md', 'y/p.md', 'y/q.md']);
  assert.deepEqual(expandBraces('plain.md'), ['plain.md']);
});

// hc-s1, hc-s3 and bs-s1 of the 26 October re-sample read three references in one
// brace-path `cat`; a substring count of `cds-integration.md` missed it.
test('counts every file a brace-path cat printed', async () => {
  const cat = `/bin/zsh -lc 'cat ${home}/neon-create/references/{rebuild,cds-integration,scaffold}.md'`;
  assert.deepEqual(skillPaths(cat).map(path => path.split('references/')[1]), ['rebuild.md', 'cds-integration.md', 'scaffold.md']);
  const reads = await referenceReads([command(cat, Object.values(files).join('\n'))], read);
  assert.deepEqual(reads.map(entry => [entry.file, status(entry.coverage)]), [
    ['neon-create/references/cds-integration.md', 'read'],
    ['neon-create/references/rebuild.md', 'read'],
    ['neon-create/references/scaffold.md', 'read'],
  ]);
});

test('separates a named path from a printed one', async () => {
  const path = `${home}/neon-create/references/cds-integration.md`;
  const reads = await referenceReads([
    command(`/bin/zsh -lc "ls ${path}"`, `${path}\n`),
    command(`/bin/zsh -lc "sed -n '1,3p' ${home}/neon-create/references/rebuild.md"`, '# Rebuild\n\nInventory every screen, state and interaction before building.\n'),
  ], read);
  assert.deepEqual(reads.map(entry => [entry.file, status(entry.coverage), entry.commands]), [
    ['neon-create/references/cds-integration.md', 'named only', 1],
    ['neon-create/references/rebuild.md', 'read', 1],
  ]);
});

test('ignores commands outside the skills directory and started items', async () => {
  const reads = await referenceReads([
    command(`/bin/zsh -lc "rg --files -g 'SKILL.md'"`, 'SKILL.md\n'),
    { type: 'item.started', item: { type: 'command_execution', command: `cat ${home}/neon-create/references/rebuild.md`, aggregated_output: '' } },
  ], read);
  assert.deepEqual(reads, []);
});

// Claude Code logs a Read call and its result as separate stream-json events.
test('counts the skill files a Claude run read through Read and Bash', async () => {
  const plugin = '/case/plugin/skills';
  const claudeFiles = { [`${plugin}/neon-create/references/rebuild.md`]: files[`${home}/neon-create/references/rebuild.md`], [`${plugin}/neon-create/references/scaffold.md`]: files[`${home}/neon-create/references/scaffold.md`] };
  const readClaude = async path => {
    if (!(path in claudeFiles)) throw new Error(`ENOENT ${path}`);
    return claudeFiles[path];
  };
  const use = (id, name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input }] } });
  const result = (id, content) => ({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: id, content }] } });
  const numbered = text => text.split('\n').map((line, index) => `${String(index + 1).padStart(6)}\t${line}`).join('\n');
  const reads = await referenceReads([
    use('r1', 'Read', { file_path: `${plugin}/neon-create/references/rebuild.md` }),
    result('r1', numbered(claudeFiles[`${plugin}/neon-create/references/rebuild.md`])),
    use('b1', 'Bash', { command: `ls ${plugin}/neon-create/references/scaffold.md` }),
    result('b1', [{ type: 'text', text: `${plugin}/neon-create/references/scaffold.md` }]),
    use('g1', 'Grep', { pattern: 'skills/' }),
  ], readClaude);
  assert.deepEqual(reads.map(entry => [entry.file, status(entry.coverage)]), [
    ['neon-create/references/rebuild.md', 'read'],
    ['neon-create/references/scaffold.md', 'named only'],
  ]);
});

// finnonemo/neon#219: a run reads the Core doc of the component it uses, and from `## Usage` on.
test('lists the Core snapshot files a run read, apart from an app path named core', async () => {
  const neonRoot = '/case/plugin';
  const doc = '# Button\n\n## Anatomy and layer tree\n\nA Capsule holding a label and an optional glyph.\n\n## Usage\n\nBrand only on Primary, for a branded moment.\n';
  const installed = { [`${neonRoot}/core/index.json`]: '{\n  "button": { "counterpart": "Button", "doc": "components/button.md" }\n}\n', [`${neonRoot}/core/components/button.md`]: doc, [`${neonRoot}/core/components/alert.md`]: '# Alert\n\n## Usage\n\nNot for a form or long content.\n', [`${neonRoot}/core/components/sheet.md`]: '# Sheet\n\n## Usage\n\nA short task that keeps the page behind it.\n', [`${neonRoot}/core/hierarchy.md`]: '## Rules every component keeps\n\n1. **One Primary per context.** Context means a screen, a sheet or a dialog.\n' };
  const readInstalled = async path => {
    if (!(path in installed)) throw new Error(`ENOENT ${path}`);
    return installed[path];
  };
  const use = (id, name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input }] } });
  const result = (id, content) => ({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: id, content }] } });
  const rules = '# Core component rules\n\nLook up only the items the task is about to use.\n';
  installed[`${neonRoot}/skills/neon-audit/references/core-rules.md`] = rules;
  const events = [
    use('c0', 'Read', { file_path: `${neonRoot}/skills/neon-audit/references/core-rules.md` }),
    result('c0', rules),
    // The path as the skill's own link spells it.
    use('c1', 'Bash', { command: `cat ${neonRoot}/skills/neon-audit/references/../../../core/index.json` }),
    result('c1', installed[`${neonRoot}/core/index.json`]),
    use('c2', 'Bash', { command: `sed -n '/^## Usage/,$p' ${neonRoot}/core/components/button.md` }),
    result('c2', '## Usage\n\nBrand only on Primary, for a branded moment.\n'),
    use('c3', 'Bash', { command: `ls ${neonRoot}/core/components/alert.md /app/src/core/components/widget.md` }),
    result('c3', `${neonRoot}/core/components/alert.md`),
    use('c4', 'Read', { file_path: '/app/src/core/index.json' }),
    result('c4', '{}'),
    // The Grep tool reads too: a file by its path, several by a path and a glob.
    use('c5', 'Grep', { pattern: 'Primary', path: `${neonRoot}/core/hierarchy.md`, output_mode: 'content' }),
    result('c5', '34:1. **One Primary per context.** Context means a screen, a sheet or a dialog.'),
    use('c6', 'Grep', { pattern: '^## Usage', path: `${neonRoot}/core/components`, glob: '{alert,sheet}.md', output_mode: 'content' }),
    result('c6', `${neonRoot}/core/components/alert.md:3:## Usage`),
  ];
  const reads = await coreReads(events, readInstalled);
  assert.deepEqual(reads.map(entry => [entry.file, status(entry.coverage)]), [
    ['core/components/alert.md', 'named only'],
    ['core/components/button.md', 'partial'],
    ['core/components/sheet.md', 'named only'],
    ['core/hierarchy.md', 'partial'],
    ['core/index.json', 'read'],
  ]);
  // Skill files stay a separate list.
  assert.deepEqual((await referenceReads(events, readInstalled)).map(entry => entry.file), ['neon-audit/references/core-rules.md']);
});
