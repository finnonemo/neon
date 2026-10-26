import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { withoutFences } from './markdown-links.mjs';

// Catches prose and comment mentions of repository files that Markdown link
// checks cannot see: bare Markdown filenames, backticked top-level directories,
// parent-relative paths and repository paths with an extension. Prose with a
// slash but no extension, and paths starting with a single dot (app-relative
// examples), stay out of scope.
const PATH_TOKEN = /(?<![\w@$.\/-])((?:\.\.\/)+[\w.\/-]*[\w\/]|[\w.-]+\/[\w.\/-]*[\w\/]|[A-Za-z][\w-]*\.md\b)/g;
const INLINE_DIRECTORY = /`([\w.-]+)\/`/g;
const CODE_COMMENTS = /\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;

export async function listFiles(directory, root = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory()
    ? (entry.name === 'node_modules' || entry.name === '.git' ? [] : listFiles(join(directory, entry.name), root))
    : [relative(root, join(directory, entry.name))]));
  return nested.flat();
}

// Keep only comment text, replacing everything else with its newlines so line numbers survive.
function commentsOnly(source) {
  let kept = '';
  let last = 0;
  for (const match of source.matchAll(CODE_COMMENTS)) {
    kept += source.slice(last, match.index).replace(/[^\n]/g, '') + match[0];
    last = match.index + match[0].length;
  }
  return kept + source.slice(last).replace(/[^\n]/g, '');
}

function isIgnored(path, ignored) {
  return ignored.some(pattern => {
    const trimmed = pattern.replace(/^\/|\/$/g, '');
    return path === trimmed || path.startsWith(`${trimmed}/`) || path.split('/').includes(trimmed);
  });
}

export async function checkPlainTextReferences(root, files, { ignored = [] } = {}) {
  const topLevel = new Set(await readdir(root));
  const basenames = new Set((await listFiles(root)).filter(file => !isIgnored(file, ignored)).map(file => basename(file)));
  const missing = [];
  for (const file of files) {
    const source = await readFile(join(root, file), 'utf8');
    const text = file.endsWith('.md') ? withoutFences(source) : commentsOnly(source);
    text.split('\n').forEach((line, index) => {
      const fail = token => missing.push(`${file}:${index + 1}: ${token}`);
      for (const [, name] of line.matchAll(INLINE_DIRECTORY)) {
        if (!isIgnored(name, ignored) && !existsSync(join(root, name))) fail(`${name}/`);
      }
      for (const [, token] of line.matchAll(PATH_TOKEN)) {
        if (token.startsWith('./')) continue;
        if (token.startsWith('../')) {
          const target = relative(root, join(root, dirname(file), token));
          if (!isIgnored(target, ignored) && !existsSync(join(root, target))) fail(token);
          continue;
        }
        const segments = token.split('/');
        const namesFile = /\.\w+$/.test(token) || token.endsWith('/');
        if (segments.length > 1 && topLevel.has(segments[0]) && namesFile) {
          if (!isIgnored(token, ignored) && !existsSync(join(root, token))) fail(token);
        } else if (token.endsWith('.md') && !isIgnored(token, ignored) && !basenames.has(basename(token))) {
          fail(token);
        }
      }
    });
  }
  if (missing.length) {
    throw new Error(`Missing plain-text references:\n${missing.join('\n')}\nPoint at an existing file, write an app-relative path with a leading ./, or describe the artifact instead of naming a file.`);
  }
}
