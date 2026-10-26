import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const escape = token => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function sourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => {
    const path = join(dir, entry.name);
    // Theme files define every token rather than consume one.
    if (entry.isDirectory()) return entry.name === 'themes' ? [] : sourceFiles(path);
    return /\.(js|css)$/.test(entry.name) ? [path] : [];
  }));
  return files.flat();
}

/**
 * Every place the published CDS build names a token, with the code around it.
 * CDS's CSS is minified onto one line, so each match carries a window of
 * `context` characters rather than its whole line.
 */
export async function findConsumers(packageDirs, tokens, { context = 70 } = {}) {
  const matches = [];
  for (const packageDir of packageDirs) {
    for (const file of await sourceFiles(join(packageDir, 'esm'))) {
      const text = await readFile(file, 'utf8');
      for (const token of tokens) {
        for (const match of text.matchAll(new RegExp(`(?<!\\w)${escape(token)}(?!\\w)`, 'g'))) {
          const line = text.slice(0, match.index).split('\n').length;
          const snippet = text.slice(Math.max(0, match.index - context), match.index + token.length + context)
            .replace(/\s+/g, ' ').trim();
          matches.push({ token, file: relative(join(packageDir, '..'), file), line, snippet });
        }
      }
    }
  }
  return matches;
}
