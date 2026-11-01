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
async function check(root, { includeReadme = false } = {}) {
  const manifest = JSON.parse(await readFile(join(root, '.claude-plugin/plugin.json'), 'utf8'));
  for (const skill of manifest.skills) {
    await checkSkillMetadata(join(root, skill, 'SKILL.md'));
    await checkStepReads(join(root, skill, 'SKILL.md'));
  }
  await checkCodexManifest(root);
  const files = [...await markdownFiles(join(root, 'skills'))];
  if (includeReadme) files.push(join(root, 'README.md'));
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
  if (includeReadme) {
    for (const file of [join(root, 'evals/skills/README.md'), ...await markdownFiles(join(root, 'evals/skills/records'))]) await checkMarkdownLinks(file);
  }
  await checkPlainTextReferences(root, await referenceFiles(root, ignored), { ignored });
}
await check(sourceRoot, { includeReadme: true });
await checkAdrNumbers(join(sourceRoot, 'docs/adr'));
const destination = await mkdtemp(join(tmpdir(), 'neon-check-'));
await packagePlugin({ sourceRoot, destination });
await check(destination);
// Everything in the packaged artifact ships, including theme and starter Markdown.
for (const file of await markdownFiles(destination)) await checkMarkdownEncoding(file);
console.log('Skill metadata, Markdown encoding, resource links and ADR numbers pass in source and packaged artifact.');
