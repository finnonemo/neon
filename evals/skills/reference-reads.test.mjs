import test from 'node:test';
import assert from 'node:assert/strict';
import { expandBraces, referenceReads, skillPaths, status } from './reference-reads.mjs';

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
