import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { checkPlainTextReferences } from '../../scripts/lib/plain-text-references.mjs';

async function fixture(t, files) {
  const root = await mkdtemp(join(tmpdir(), 'neon-plain-refs-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'skills/demo'), { recursive: true });
  await mkdir(join(root, 'theme/cds'), { recursive: true });
  await writeFile(join(root, 'skills/INSTRUCTION.md'), '# Contract\n');
  await writeFile(join(root, 'theme/cds/colors.ts'), 'export {};\n');
  for (const [path, content] of Object.entries(files)) await writeFile(join(root, path), content);
  return root;
}

test('rejects a bare Markdown filename that no longer exists anywhere in the root', async t => {
  const root = await fixture(t, { 'skills/demo/SKILL.md': 'See DESIGN.md for the palette.\n' });
  await assert.rejects(checkPlainTextReferences(root, ['skills/demo/SKILL.md']), /skills\/demo\/SKILL.md:1.*DESIGN.md[\s\S]*leading \.\//);
});

test('rejects a removed top-level directory named in inline code', async t => {
  const root = await fixture(t, { 'README.md': 'Keep `skills/`, `theme/` and `design/` together.\n' });
  await assert.rejects(checkPlainTextReferences(root, ['README.md']), /README.md:1.*design\//);
});

test('rejects a stale relative path inside a code comment', async t => {
  const root = await fixture(t, {
    'theme/cds/map.ts': '/**\n * See ../../design-md/finnomena/DESIGN.md for roles.\n */\nexport {};\n',
  });
  await assert.rejects(checkPlainTextReferences(root, ['theme/cds/map.ts']), /theme\/cds\/map.ts:2.*design-md/);
});

test('rejects a missing repository path with an extension', async t => {
  const root = await fixture(t, { 'skills/demo/SKILL.md': 'Mapping lives in theme/cds/color-overrides.ts.\n' });
  await assert.rejects(checkPlainTextReferences(root, ['skills/demo/SKILL.md']), /theme\/cds\/color-overrides.ts/);
});

test('accepts existing references, prose slashes, URLs, packages and app-relative paths', async t => {
  const root = await fixture(t, {
    'skills/demo/SKILL.md': [
      'Read skills/INSTRUCTION.md and INSTRUCTION.md; edit `theme/cds/colors.ts` under `theme/`.',
      'Reuse existing theme/providers wiring and theme/notification preferences.',
      'Install @coinbase/cds-web from https://github.com/coinbase/cds/blob/main/README.md.',
      'Import `./theme/theme.css` in the target app.',
      'The rebuild writes ./PARITY.md beside its README.',
      '```md',
      'Fenced example: see MISSING.md',
      '```',
    ].join('\n'),
    'theme/cds/map.ts': "import x from '../missing/module';\n// see ../../skills/INSTRUCTION.md\nexport {};\n",
  });
  await checkPlainTextReferences(root, ['skills/demo/SKILL.md', 'theme/cds/map.ts']);
});

test('does not resolve a bare filename against an ignored local copy', async t => {
  const root = await fixture(t, { 'skills/demo/SKILL.md': 'See DESIGN.md for the palette.\n' });
  await mkdir(join(root, '.local/design'), { recursive: true });
  await writeFile(join(root, '.local/design/DESIGN.md'), '# Local draft\n');
  await assert.rejects(checkPlainTextReferences(root, ['skills/demo/SKILL.md'], { ignored: ['.local/'] }), /DESIGN.md/);
});

test('ignores paths covered by ignore patterns', async t => {
  const root = await fixture(t, { 'AGENTS.md': 'Keep artifacts in `.local/` and see theme/tokens.resolved.json.\n' });
  await assert.rejects(checkPlainTextReferences(root, ['AGENTS.md']));
  await checkPlainTextReferences(root, ['AGENTS.md'], { ignored: ['.local/', 'theme/tokens.resolved.json'] });
});
