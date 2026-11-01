#!/usr/bin/env node
import { readdir, readFile, access, mkdtemp } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { packagePlugin } from './package-plugin.mjs';
import { checkMarkdownLinks } from './lib/markdown-links.mjs';
import { checkPlainTextReferences, listFiles } from './lib/plain-text-references.mjs';
import { checkMarkdownEncoding, checkSkillMetadata } from './lib/skill-files.mjs';

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Ignored paths are local or generated, so naming them in prose is expected.
const ignored = (await readFile(join(sourceRoot, '.gitignore'), 'utf8'))
  .split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
// Starter and example code resolve their relative paths inside an assembled app, not this tree.
const APP_CODE = ['templates/', 'theme/examples/'];
async function referenceFiles(root) {
  return (await listFiles(root)).filter(file => !ignored.some(pattern => file.startsWith(pattern.replace(/^\//, '')))
    && !APP_CODE.some(prefix => file.startsWith(prefix))
    && (file.endsWith('.md') || (/^(theme|scripts)\//.test(file) && /\.(ts|tsx|mjs|css)$/.test(file))));
}
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
  }
  await checkCodexManifest(root);
  const files = [...await markdownFiles(join(root, 'skills'))];
  if (includeReadme) files.push(join(root, 'README.md'));
  for (const file of files) {
    await checkMarkdownEncoding(file);
    const content = await readFile(file, 'utf8');
    await checkMarkdownLinks(file);
    for (const match of content.matchAll(/(?:\$\{CLAUDE_PLUGIN_ROOT\}|<Neon root>)\/([\w./-]+)/g)) {
      await access(join(root, match[1])).catch(() => { throw new Error(`Missing plugin resource in ${file}: ${match[1]}`); });
    }
  }
  await checkPlainTextReferences(root, await referenceFiles(root), { ignored });
}
await check(sourceRoot, { includeReadme: true });
const destination = await mkdtemp(join(tmpdir(), 'neon-check-'));
await packagePlugin({ sourceRoot, destination });
await check(destination);
// Everything in the packaged artifact ships, including theme and starter Markdown.
for (const file of await markdownFiles(destination)) await checkMarkdownEncoding(file);
console.log('Skill metadata, Markdown encoding and resource links pass in source and packaged artifact.');
