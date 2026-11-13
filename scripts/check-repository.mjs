#!/usr/bin/env node
import { readdir, readFile, access, mkdtemp } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { packagePlugin } from './package-plugin.mjs';
import { checkMarkdownLinks } from './lib/markdown-links.mjs';
import { checkPlainTextReferences, referenceFiles } from './lib/plain-text-references.mjs';
import { checkAdrNumbers } from './lib/adr-numbers.mjs';
import { checkMarkdownEncoding, checkSkillMetadata, checkStepReads } from './lib/skill-files.mjs';
import { checkCoreSnapshot, SNAPSHOT_DIR } from './lib/core-snapshot.mjs';
import { checkBlockSnapshot, BLOCK_SNAPSHOT_DIR } from './lib/block-snapshot.mjs';
import { checkCoreTheme } from './lib/core-theme.mjs';
import { checkCoreType } from './lib/core-type.mjs';
import { registryComponents } from './lib/registry.mjs';

const SKILLS = ['neon-create', 'neon-redesign', 'neon-audit', 'neon-review', 'neon-block'];
const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Ignored paths are local or generated, so naming them in prose is expected.
const ignored = (await readFile(join(sourceRoot, '.gitignore'), 'utf8'))
  .split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory()
    ? markdownFiles(join(directory, entry.name))
    : entry.name.endsWith('.md') ? [join(directory, entry.name)] : []));
  return nested.flat();
}
async function checkCodexManifest(root) {
  const manifestPath = join(root, '.codex-plugin/plugin.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  for (const field of ['name', 'version', 'description', 'author', 'skills']) {
    if (!manifest[field]) throw new Error(`Missing "${field}" in ${manifestPath}`);
  }
  await access(join(root, manifest.skills)).catch(() => {
    throw new Error(`Missing codex plugin skills directory: ${manifest.skills}`);
  });
}
async function check(root, { sourceTree = false } = {}) {
  const manifest = JSON.parse(await readFile(join(root, '.claude-plugin/plugin.json'), 'utf8'));
  // Adding a skill or the tool server must never drop one employees already call (ADR 0010).
  for (const skill of SKILLS) {
    if (!manifest.skills.includes(`./skills/${skill}`)) throw new Error(`.claude-plugin/plugin.json no longer lists the ${skill} skill`);
    await access(join(root, 'skills', skill, 'SKILL.md')).catch(() => { throw new Error(`Missing skill: skills/${skill}/SKILL.md`); });
  }
  const server = manifest.mcpServers?.finno;
  if (!server || !server.args?.some(argument => argument.endsWith('/scripts/finno.mjs'))) throw new Error('.claude-plugin/plugin.json must start the finno tool server from scripts/finno.mjs');
  await access(join(root, 'scripts/finno.mjs')).catch(() => { throw new Error('Missing scripts/finno.mjs, which the plugin starts as its tool server'); });
  for (const skill of manifest.skills) {
    await checkSkillMetadata(join(root, skill, 'SKILL.md'));
    await checkStepReads(join(root, skill, 'SKILL.md'));
  }
  await checkCodexManifest(root);
  // The registry does not ship, so only the source tree can say which items the index must cover.
  await checkCoreSnapshot(join(root, SNAPSHOT_DIR), sourceTree ? { items: (await registryComponents(root)).map(item => item.name) } : {});
  await checkBlockSnapshot(join(root, BLOCK_SNAPSHOT_DIR));
  await checkCoreTheme(root);
  await checkCoreType(root);
  const files = [...await markdownFiles(join(root, 'skills')), ...await markdownFiles(join(root, SNAPSHOT_DIR))];
  if (sourceTree) files.push(join(root, 'README.md'));
  for (const file of files) {
    await checkMarkdownEncoding(file);
    const content = await readFile(file, 'utf8');
    await checkMarkdownLinks(file);
    // GLOSSARY: "Neon root", never CLAUDE_PLUGIN_ROOT; a host may not set it.
    if (content.includes('${CLAUDE_PLUGIN_ROOT}')) throw new Error(`${file} names \${CLAUDE_PLUGIN_ROOT}; write <Neon root> instead`);
    for (const match of content.matchAll(/<Neon root>\/([\w./-]+)/g)) {
      await access(join(root, match[1])).catch(() => { throw new Error(`Missing plugin resource in ${file}: ${match[1]}`); });
    }
  }
  // Eval records are maintainer-only, so they are checked in the source tree but never shipped.
  if (sourceTree) {
    for (const file of [join(root, 'evals/skills/README.md'), ...await markdownFiles(join(root, 'evals/skills/records'))]) await checkMarkdownLinks(file);
  }
  await checkPlainTextReferences(root, await referenceFiles(root, ignored), { ignored });
}
await check(sourceRoot, { sourceTree: true });
await checkAdrNumbers(join(sourceRoot, 'docs/adr'));
const destination = await mkdtemp(join(tmpdir(), 'neon-check-'));
await packagePlugin({ sourceRoot, destination });
await check(destination);
// Everything in the packaged artifact ships, including theme and starter Markdown.
for (const file of await markdownFiles(destination)) await checkMarkdownEncoding(file);
console.log('Skill metadata, Markdown encoding, resource links, the Core and Block snapshots and ADR numbers pass in source and packaged artifact.');
