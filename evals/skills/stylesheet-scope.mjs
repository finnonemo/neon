#!/usr/bin/env node
// Grades a CDS rebuild's stylesheets against the cds-integration rule that
// every selector starts with an app class and names app elements by their own
// class. A selector ending on an anonymous `div`, `span`, `button`, `input` or
// `*` (`.field > div`, `.nav button`) reaches into component markup. With
// `--src`, a selector naming a class the TSX puts on a CDS component
// (`<Toast className="x">`) styles that component through CSS, not props.
// Layout primitives (`Box`, `VStack`) render one plain root the app owns, so
// classes on them stay allowed.
//
//   node evals/skills/stylesheet-scope.mjs [--src <app>/src] <file.css>...
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// At-rules whose blocks hold rules rather than declarations or keyframes.
const groupingAtRules = /^@(media|supports|layer|container|scope)\b/;

// Last compound is a plain element CDS components render, or `*`, at most
// with pseudo-classes.
const anonymousWrapper = /(^|[\s>+~])(div|span|button|input|\*)(:[\w-]+(\([^)]*\))?)*$/;

function splitTopLevel(prelude) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const char of prelude) {
    if (char === '(' || char === '[') depth++;
    else if (char === ')' || char === ']') depth--;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else current += char;
  }
  parts.push(current.trim());
  return parts.filter(Boolean);
}

// Every selector in style-rule preludes, with whether it is nested in another style rule.
function selectorsOf(css) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const found = [];
  // Each open block is 'group', 'rule' or 'skip' (keyframes, font-face, declarations).
  const stack = [];
  let prelude = '';
  for (const char of source) {
    if (char === '{') {
      const text = prelude.trim();
      prelude = '';
      const parent = stack.at(-1);
      if (parent === 'skip') stack.push('skip');
      else if (text.startsWith('@')) stack.push(groupingAtRules.test(text) ? 'group' : 'skip');
      else {
        for (const selector of splitTopLevel(text)) found.push({ selector, nested: parent === 'rule' });
        stack.push('rule');
      }
    } else if (char === '}') {
      stack.pop();
      prelude = '';
    } else if (char === ';') prelude = '';
    else prelude += char;
  }
  return found;
}

export function unscopedSelectors(css) {
  return selectorsOf(css)
    .filter(({ selector, nested }) => {
      // Nested rules inside a style rule may lead with `&`.
      const ledByClass = /^\.[A-Za-z_-]/.test(selector) || (nested && selector.startsWith('&'));
      return !ledByClass || anonymousWrapper.test(selector);
    })
    .map(({ selector }) => selector);
}

// Opening tags of capitalized JSX elements, scanning past `>` inside `{…}`.
function componentTags(source) {
  const tags = [];
  for (const match of source.matchAll(/<([A-Z][\w.]*)/g)) {
    let depth = 0;
    let end = match.index;
    for (; end < source.length; end++) {
      const char = source[end];
      if (char === '{') depth++;
      else if (char === '}') depth--;
      else if (char === '>' && depth === 0) break;
    }
    tags.push({ name: match[1], text: source.slice(match.index, end + 1) });
  }
  return tags;
}

function cdsImports(source) {
  const names = new Set();
  for (const [, list, module] of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*["'](@coinbase\/cds-web[^"']*)["']/g)) {
    if (module === '@coinbase/cds-web/layout') continue;
    for (const part of list.split(',')) {
      const local = part.trim().split(/\s+as\s+/).at(-1);
      if (local && !local.startsWith('type ')) names.add(local);
    }
  }
  return names;
}

// Class names in a `className` value: string literals, plus template-literal
// text with each `${…}` read as an expression of its own.
function classTokens(value) {
  const literals = [];
  const rest = value.replace(/`([^`]*)`/g, (_, body) => {
    literals.push(body.replace(/\$\{([^}]*)\}/g, (__, expression) => {
      for (const [, text] of expression.matchAll(/["']([^"']*)["']/g)) literals.push(text);
      return ' ';
    }));
    return ' ';
  });
  for (const [, text] of rest.matchAll(/["']([^"']*)["']/g)) literals.push(text);
  return literals.flatMap(text => text.split(/\s+/)).filter(name => /^-?[A-Za-z_][\w-]*$/.test(name));
}

// Class name → CDS components (`file: Tag`) that receive it through `className`.
export function cdsHostedClasses(files) {
  const hosts = new Map();
  for (const { path, source } of files) {
    const cds = cdsImports(source);
    for (const tag of componentTags(source)) {
      if (!cds.has(tag.name)) continue;
      const value = tag.text.match(/\bclassName=(\{[\s\S]*?\}(?=\s|\/?>)|"[^"]*"|'[^']*')/)?.[1];
      if (!value) continue;
      for (const name of classTokens(value)) hosts.set(name, [...(hosts.get(name) ?? []), `${path}: ${tag.name}`]);
    }
  }
  return hosts;
}

export function selectorsOnCdsHosts(css, hosts) {
  const offenders = [];
  for (const { selector } of selectorsOf(css)) {
    for (const [, name] of selector.matchAll(/\.([A-Za-z_-][\w-]*)/g)) {
      if (hosts.has(name)) offenders.push(`${selector} (on ${hosts.get(name).join(', ')})`);
    }
  }
  return offenders;
}

async function filesUnder(directory, pattern) {
  const entries = await readdir(directory, { withFileTypes: true, recursive: true });
  return entries
    .filter(entry => entry.isFile() && pattern.test(entry.name) && !join(entry.parentPath, entry.name).includes('node_modules'))
    .map(entry => join(entry.parentPath, entry.name));
}

// Every offending selector in an app's stylesheets, keyed `file: selector`.
export async function gradeStylesheets(srcDirectory) {
  const scripts = await filesUnder(srcDirectory, /\.(t|j)sx$/);
  const hosts = cdsHostedClasses(await Promise.all(scripts.map(async path => ({ path: path.slice(srcDirectory.length + 1), source: await readFile(path, 'utf8') }))));
  const offenders = [];
  for (const file of await filesUnder(srcDirectory, /\.s?css$/)) {
    const css = await readFile(file, 'utf8');
    const name = file.slice(srcDirectory.length + 1);
    for (const selector of [...unscopedSelectors(css), ...selectorsOnCdsHosts(css, hosts)]) offenders.push(`${name}: ${selector}`);
  }
  return offenders;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const args = process.argv.slice(2);
  const srcIndex = args.indexOf('--src');
  const offenders = [];
  if (srcIndex !== -1) {
    offenders.push(...await gradeStylesheets(args[srcIndex + 1]));
    args.splice(srcIndex, 2);
  }
  for (const file of args) {
    for (const selector of unscopedSelectors(await readFile(file, 'utf8'))) offenders.push(`${file}: ${selector}`);
  }
  for (const line of offenders) console.log(line);
  process.exitCode = offenders.length ? 1 : 0;
}
