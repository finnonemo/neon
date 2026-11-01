// Rules shared by Neon's shipped source lint (scripts/source-lint.mjs) and the
// maintainer graders in evals/skills. Each rule reads source text only.

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

// Each selector naming a class a CDS component receives, as `{ selector, on }`
// with `on` the components (`file: Tag`) that receive it.
export function cdsHostSelectors(css, hosts) {
  const offenders = [];
  for (const { selector } of selectorsOf(css)) {
    for (const [, name] of selector.matchAll(/\.([A-Za-z_-][\w-]*)/g)) {
      if (hosts.has(name)) offenders.push({ selector, on: hosts.get(name) });
    }
  }
  return offenders;
}

export function selectorsOnCdsHosts(css, hosts) {
  return cdsHostSelectors(css, hosts).map(({ selector, on }) => `${selector} (on ${on.join(', ')})`);
}

// Every match of a global pattern as `{ match, line }`, line 1-based.
function findAll(source, pattern) {
  return [...source.matchAll(pattern)].map(match => ({ match: match[0], line: source.slice(0, match.index).split('\n').length }));
}

// A stock Tailwind palette color on a color utility (`text-slate-300`,
// `hover:bg-blue-600/50`). `white` and `black` are left out: they usually are
// the plain surface and text they read as.
const stockPalette = /(?<![\w-])(?:bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|divide|outline|from|via|to|fill|stroke|placeholder|accent|caret|decoration|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)(?![\w-])/g;

export function stockPaletteUtilities(source) {
  return findAll(source, stockPalette);
}

// Blanks block, HTML and whole-line `//` comments, keeping newlines so line
// numbers hold. Only what renders can be content; generated files such as the
// starter's theme.config.ts mark statuses with emoji in comments.
function withoutComments(source) {
  return source.replace(/(?<![\w*.])\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|^[ \t]*\/\/.*$/gm, comment => comment.replace(/[^\n]/g, ' '));
}

// Filler a screen should not ship (new-ui-workflow "Plausible samples").
export function placeholderText(source) {
  return findAll(withoutComments(source), /\b(?:lorem|acme|(?:john|jane) doe)\b/gi);
}

// Emoji drawn as pictures. `\p{Emoji}` alone also matches digits, `#` and
// `*`, and `\p{Extended_Pictographic}` alone matches © ® ™, so a
// pictographic counts only with the emoji variation selector (`⚠️`).
export function emojiText(source) {
  return findAll(withoutComments(source), /\p{Emoji_Presentation}|\p{Extended_Pictographic}️/gu);
}

// `transition: all` (CSS or an inline style object) and Tailwind's `transition-all`.
export function transitionAll(source) {
  return findAll(source, /transition(?:-property)?\s*:\s*['"]?[^;'"}]*?(?<![\w-])all(?![\w-])|(?<![\w-])transition-all(?![\w-])/g);
}
