import { readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';

// Tailwind utilities each @theme namespace creates, as prefixes of the key.
const SIDES = ['', 't-', 'r-', 'b-', 'l-', 'x-', 'y-', 's-', 'e-', 'ss-', 'se-', 'es-', 'ee-', 'tl-', 'tr-', 'br-', 'bl-'];
const COLOR_UTILITIES = ['bg', 'text', 'border', 'border-t', 'border-r', 'border-b', 'border-l', 'border-x', 'border-y', 'border-s', 'border-e',
  'ring', 'ring-offset', 'outline', 'fill', 'stroke', 'divide', 'from', 'via', 'to', 'placeholder', 'caret', 'accent', 'decoration', 'shadow', 'inset-shadow'];
const NAMESPACES = {
  color: key => COLOR_UTILITIES.map(utility => `${utility}-${key}`),
  text: key => [`text-${key}`],
  radius: key => SIDES.map(side => `rounded-${side}${key}`),
  font: key => [`font-${key}`],
};
const THEMED = new RegExp(`^--(${Object.keys(NAMESPACES).join('|')})-(.+)$`);
// Width-only classes that take their color from a `* { @apply … }` default, as
// shadcn's `* { @apply border-border }` colors every bare `border-t`.
const BARE_WIDTHS = {
  border: /^(border(-[trblxyse]{1,2})?|divide-[xy])(-\d+)?$/,
  outline: /^outline(-\d+)?$/,
};

// Comments become blank lines, so line numbers still match the file.
const stripComments = css => css.replace(/\/\*[\s\S]*?\*\//g, comment => comment.replace(/[^\n]/g, ''));
const DECLARATION = /(--[\w-]+)\s*:\s*([^;}]*)/g;

// Bodies of the @theme blocks, whose custom properties create utilities.
function themeBlocks(css) {
  const blocks = [];
  for (const match of css.matchAll(/@theme[^{]*\{/g)) {
    let depth = 1, end = match.index + match[0].length;
    while (depth && end < css.length) depth += { '{': 1, '}': -1 }[css[end++]] ?? 0;
    blocks.push(css.slice(match.index + match[0].length, end - 1));
  }
  return blocks;
}

function utilitiesOf(name) {
  const [, namespace, key] = name.match(THEMED) ?? [];
  // --text-headline--line-height still belongs to text-headline.
  return namespace ? NAMESPACES[namespace](key.split('--')[0]) : [];
}

// The custom property, utility or bare word a class-list word names: no variant
// prefix, no opacity modifier, no important flag.
const bareWord = word => word.slice(word.lastIndexOf(':') + 1).replace(/^!|!$/g, '').replace(/\/[\w.[\]%-]+$/, '');

/**
 * Every place a registry item's own source uses a theme token, through any
 * chain of custom-property aliases (light, dark and immersive blocks alike) and
 * the @theme utilities they feed. Declarations are links in the chain, not uses,
 * and files an item copies from outside registry/ (theme.css and other canonical
 * theme assets) define tokens rather than consume them.
 */
export async function findRegistryConsumers(registryDir, tokens, { context = 70 } = {}) {
  const registry = JSON.parse(await readFile(join(registryDir, 'registry.json'), 'utf8'));
  const owners = new Map();
  for (const item of registry.items) {
    for (const { path } of item.files) {
      const file = resolve(registryDir, path);
      owners.set(file, [...(owners.get(file) ?? []), item.name]);
    }
  }
  const texts = new Map();
  for (const file of owners.keys()) {
    if (!/\.(css|tsx?)$/.test(file)) continue;
    const text = await readFile(file, 'utf8');
    texts.set(file, file.endsWith('.css') ? stripComments(text) : text);
  }

  // Who reads whom: --primary-foreground reads --color-fgInverse, and so on.
  const readers = new Map();
  const declared = new Set();
  const themed = new Set();
  const defaults = new Set();
  for (const [file, text] of texts) {
    if (!file.endsWith('.css')) continue;
    for (const [, name, value] of text.matchAll(DECLARATION)) {
      declared.add(name);
      for (const [, read] of value.matchAll(/var\(\s*(--[\w-]+)/g)) readers.set(read, new Set([...(readers.get(read) ?? []), name]));
    }
    for (const block of themeBlocks(text)) for (const [, name] of block.matchAll(DECLARATION)) themed.add(name);
    for (const [, applied] of text.matchAll(/(?:^|[\s}])\*\s*\{[^}]*@apply([^;}]*)/g)) {
      for (const utility of applied.trim().split(/\s+/).map(bareWord)) defaults.add(utility);
    }
  }

  const colors = new Set([...themed].filter(name => name.startsWith('--color-')).flatMap(utilitiesOf));
  const registryPrefix = `${resolve(registryDir)}${sep}`;
  const matches = [];
  for (const token of tokens) {
    const bare = token.replace(/^--/, '');
    const seeds = declared.has(`--${bare}`) ? [`--${bare}`] : [...declared].filter(name => name.endsWith(`-${bare}`));
    if (!seeds.length) continue;
    const names = new Set(seeds);
    for (const name of names) for (const reader of readers.get(name) ?? []) names.add(reader);
    const via = new Set(names);
    for (const name of names) if (themed.has(name)) for (const utility of utilitiesOf(name)) via.add(utility);
    const widths = Object.entries(BARE_WIDTHS)
      .filter(([property]) => [...defaults].some(utility => utility.startsWith(`${property}-`) && via.has(utility)));

    for (const [file, text] of texts) {
      if (!file.startsWith(registryPrefix)) continue;
      text.split('\n').forEach((line, index) => {
        // A custom property's own declaration links the chain; other words on the line can still use a token.
        const used = file.endsWith('.css') ? line.replace(DECLARATION, '') : line;
        const all = used.split(/[\s"'`(),;{}]+/).map(bareWord);
        // A width keeps the default color only where the line names no other color for it.
        const defaulted = widths.filter(([property]) => !all.some(word => word.startsWith(`${property}-`) && colors.has(word) && !via.has(word)));
        const words = all.filter(word => via.has(word) || defaulted.some(([, width]) => width.test(word)));
        if (!words.length) return;
        const at = line.indexOf(words[0]);
        const snippet = line.slice(Math.max(0, at - context), at + words[0].length + context).replace(/\s+/g, ' ').trim();
        for (const item of owners.get(file)) {
          matches.push({ token, item, file: relative(dirname(registryDir), file), line: index + 1, via: [...new Set(words)].join(', '), snippet });
        }
      });
    }
  }
  return matches;
}
