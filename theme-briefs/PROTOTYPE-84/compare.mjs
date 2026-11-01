#!/usr/bin/env node
// PROTOTYPE for finnonemo/neon#84: judges the drafted briefs.
//   node theme-briefs/PROTOTYPE-84/compare.mjs > theme-briefs/PROTOTYPE-84/out/compare.md
// 1. Section-by-section sameness between pairs of briefs (what must stay fixed, what differs).
// 2. scripts/token-lookup.mjs on every hex in each brief, scripts/contrast.mjs on every
//    fill/text pair it names, and every var(--…) checked against that theme's CSS.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const here = import.meta.dirname;
const root = resolve(here, '../..');
const read = (path) => readFileSync(path, 'utf8');
const briefs = ['club-run', 'club-seminar', 'ultra-run'];
const md = Object.fromEntries(briefs.map((b) => [b, read(join(here, 'out', `${b}.md`))]));
const sections = (text) => {
  const parts = text.split(/^(?=## )/m);
  return Object.fromEntries([['Header', parts[0]], ...parts.slice(1).map((p) => [p.split('\n')[0].replace('## ', ''), p])]);
};
const words = (text) => text.toLowerCase().match(/[a-z][a-z'-]+/g) ?? [];
const overlap = (a, b) => { const A = new Set(words(a)), B = new Set(words(b)); return [...A].filter((w) => B.has(w)).length / new Set([...A, ...B]).size; };

const out = ['# Prototype 84: comparison', ''];
for (const [a, b] of [['club-run', 'club-seminar'], ['club-run', 'ultra-run']]) {
  const A = sections(md[a]), B = sections(md[b]);
  out.push(`## ${a} vs ${b}`, '', '| Section | Same? | Word overlap (Jaccard) |', '|---|---|---|');
  for (const name of Object.keys(A)) out.push(`| ${name} | ${A[name] === B[name] ? 'identical' : 'differs'} | ${A[name] === B[name] ? '1.00' : overlap(A[name], B[name]).toFixed(2)} |`);
  out.push('');
}

const css = read(join(root, 'theme/css/immersive-themes.css'));
const base = read(join(root, 'theme/css/theme.css'));
for (const b of briefs) {
  const theme = md[b].match(/\*\*Immersive Theme:\*\* (\w+)/)[1];
  const block = css.match(new RegExp(`\\[data-immersive-theme="${theme}"\\]\\s*\\{([^}]*)\\}`))[1] + css.match(/\[data-immersive-theme\]\s*\{([^}]*)\}/)[1];
  const defined = new Set([...block.matchAll(/--([\w-]+):/g), ...base.matchAll(/--([\w-]+):/g)].map((m) => m[1]));
  const hexes = [...new Set(md[b].match(/#[0-9a-f]{6}\b/g))];
  const lookup = execFileSync(process.execPath, [join(root, 'scripts/token-lookup.mjs'), ...hexes], { encoding: 'utf8' }).trim().split('\n');
  const off = lookup.filter((l) => l.includes('off-token'));
  const valueOf = (name) => block.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`))?.[1];
  const named = [...new Set([...md[b].matchAll(/--(immersive-[\w-]+)/g)].map((m) => m[1]))];
  const undefinedVars = [...new Set([...md[b].matchAll(/--([A-Za-z][\w-]*[\w])(?!-\*)(?![\w-])/g)].map((m) => m[1]).filter((n) => /^(immersive|space|borderRadius|fontSize|lineHeight|fontWeight|fontFamily)-/.test(n) && !n.endsWith('-') && !defined.has(n)))];
  const pairs = named.filter((n) => !n.includes('-on-') && valueOf(n.replace('immersive-', `immersive-on-`))).map((n) => [n, n.replace('immersive-', 'immersive-on-')]);
  pairs.push(['immersive-action', 'immersive-on-action'], ['immersive-canvas', 'immersive-text']);
  const contrastLines = pairs.filter(([f, t]) => valueOf(f) && valueOf(t)).map(([f, t]) => `${f} / ${t}: ${execFileSync(process.execPath, [join(root, 'scripts/contrast.mjs'), valueOf(t), valueOf(f)], { encoding: 'utf8' }).trim()}`);
  const failing = contrastLines.filter((l) => !l.endsWith('passes'));
  out.push(`## ${b} (${theme})`, '',
    `- token-lookup.mjs: ${hexes.length} hex values, ${off.length} off-token${off.length ? `: ${off.join('; ')}` : ''}`,
    `- contrast.mjs: ${contrastLines.length} fill/text pairs named in the brief, ${failing.length} below 4.5:1${failing.length ? `: ${failing.join('; ')}` : ''}`,
    `- variables named but not defined for ${theme}: ${undefinedVars.length ? undefinedVars.join(', ') : 'none'}`, '');
}
console.log(out.join('\n'));
