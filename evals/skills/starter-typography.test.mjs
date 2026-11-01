import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

// Static guards for the starter's typography defaults. The real evidence is
// an assembled app checked in a browser; see records/cds-rebuild.md.
const starterSrc = new URL('../../templates/vitejs-cds/src/', import.meta.url).pathname;

async function sourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  }));
  return files.flat();
}

// Opening tags of `<Box …>`, scanning past `>` inside `{…}` expressions.
function boxOpeningTags(source) {
  const tags = [];
  for (let start = source.indexOf('<Box'); start !== -1; start = source.indexOf('<Box', start + 1)) {
    let depth = 0;
    let end = start;
    for (; end < source.length; end++) {
      const char = source[end];
      if (char === '{') depth++;
      else if (char === '}') depth--;
      else if (char === '>' && depth === 0) break;
    }
    tags.push(source.slice(start, end + 1));
  }
  return tags;
}

test('every starter link Box clears the browser link underline', async () => {
  const offenders = [];
  for (const file of await sourceFiles(starterSrc)) {
    const source = await readFile(file, 'utf8');
    for (const tag of boxOpeningTags(source)) {
      if (/\bas="a"/.test(tag) && !/\btextDecoration="none"/.test(tag)) offenders.push(relative(starterSrc, file));
    }
  }
  assert.deepEqual(offenders, []);
});

test('AppRoot gives <body> the theme body font, so bare Text and portals inherit it', async () => {
  const source = await readFile(join(starterSrc, 'app/AppRoot.tsx'), 'utf8');
  assert.match(source, /document\.body\.style/);
  for (const property of ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight']) {
    assert.match(source, new RegExp(`${property}: appTheme\\.${property}\\.body`));
  }
});

test('AppRoot paints <body> with the active scheme colors and declares the scheme', async () => {
  const source = await readFile(join(starterSrc, 'app/AppRoot.tsx'), 'utf8');
  assert.match(source, /appTheme\.darkColor : appTheme\.lightColor/);
  assert.match(source, /document\.documentElement\.style\.colorScheme = colorScheme/);
  assert.match(source, /backgroundColor: color\.bg, color: color\.fg/);
});
