#!/usr/bin/env node
// Grades a CDS rebuild's stylesheets against the cds-integration rule that
// every selector starts with an app class and names app elements by their own
// class. A selector ending on an anonymous `div`, `span`, `button`, `input` or
// `*` (`.field > div`, `.nav button`) reaches into component markup; other
// reaches need the rendered DOM.
//
//   node evals/skills/stylesheet-scope.mjs <file.css>...
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// At-rules whose blocks hold rules rather than declarations or keyframes.
const groupingAtRules = /^@(media|supports|layer|container|scope)\b/;

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

// Last compound is a plain element CDS components render, or `*`, at most
// with pseudo-classes.
const anonymousWrapper = /(^|[\s>+~])(div|span|button|input|\*)(:[\w-]+(\([^)]*\))?)*$/;

export function unscopedSelectors(css) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const offenders = [];
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
        for (const selector of splitTopLevel(text)) {
          // Nested rules inside a style rule may lead with `&`.
          const ledByClass = /^\.[A-Za-z_-]/.test(selector) || (parent === 'rule' && selector.startsWith('&'));
          if (!ledByClass || anonymousWrapper.test(selector)) offenders.push(selector);
        }
        stack.push('rule');
      }
    } else if (char === '}') {
      stack.pop();
      prelude = '';
    } else if (char === ';') prelude = '';
    else prelude += char;
  }
  return offenders;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  let failed = false;
  for (const file of process.argv.slice(2)) {
    for (const selector of unscopedSelectors(await readFile(file, 'utf8'))) {
      console.log(`${file}: ${selector}`);
      failed = true;
    }
  }
  process.exitCode = failed ? 1 : 0;
}
