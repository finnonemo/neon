import { readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

// This is a focused checker for the repository's inline links and ATX headings,
// not a general Markdown renderer. Preserve newlines when hiding fenced examples.
export function withoutFences(markdown) {
  let fence;
  return markdown.split('\n').map(line => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
      return '';
    }
    if (marker) {
      fence = marker[1];
      return '';
    }
    return line;
  }).join('\n');
}

function headingAnchors(markdown) {
  const anchors = new Set();
  for (const match of withoutFences(markdown).matchAll(/^ {0,3}#{1,6}[ \t]+(.+?)\s*$/gm)) {
    const text = match[1].replace(/[ \t]+#+$/, '')
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/`+/g, '')
      .replace(/\*+/g, '');
    const base = text.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
    let anchor = base;
    let suffix = 0;
    while (anchors.has(anchor)) anchor = `${base}-${++suffix}`;
    anchors.add(anchor);
  }
  return anchors;
}

export async function checkMarkdownLinks(file) {
  const content = withoutFences(await readFile(file, 'utf8'))
    .replace(/(`+)[\s\S]*?\1/g, '');
  for (const match of content.matchAll(/\[[^\]]*\]\((<[^>]+>|(?:[^()\s]|\([^()]*\))+)(?:\s+"[^"]*")?\)/g)) {
    const target = match[1].replace(/^<|>$/g, '');
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target)) continue;
    const hash = target.indexOf('#');
    const path = hash < 0 ? target : target.slice(0, hash);
    const anchor = hash < 0 ? '' : decodeURIComponent(target.slice(hash + 1));
    let destination = path ? resolve(dirname(file), decodeURIComponent(path)) : file;
    let info;
    try {
      info = await stat(destination);
    } catch {
      throw new Error(`Broken link in ${file}: ${target}`);
    }
    if (!anchor) continue;
    if (info.isDirectory()) destination = join(destination, 'README.md');
    // Fragments in assets such as SVGs are not Markdown heading anchors.
    if (!/\.md$/i.test(destination)) continue;
    let markdown;
    try {
      markdown = await readFile(destination, 'utf8');
    } catch {
      throw new Error(`Broken link in ${file}: ${target} (missing directory README)`);
    }
    if (!headingAnchors(markdown).has(anchor)) {
      throw new Error(`Missing anchor in ${file}: ${target}`);
    }
  }
}
