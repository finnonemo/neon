#!/usr/bin/env node
// Warn-only Neon source lint for the UI files a change touched. It reads files
// and never writes, and it always exits 0: each warning is for the agent to fix
// or to justify in its report, not a gate.
//
//   node scripts/source-lint.mjs [<app-dir>] [<file>...]
//
// In a git repository it checks the files changed against HEAD plus untracked
// files under <app-dir> (default: the current directory). Files named after
// <app-dir>, relative to it, are checked instead; outside git they are required.
//
// Rules: stock Tailwind palette utilities in a CDS app or once the change uses
// Neon color variables, selectors reaching into CDS components (CDS apps only),
// lorem/Acme/John Doe placeholders, emoji used as UI, and transitions on all
// properties.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  cdsHostedClasses,
  cdsHostSelectors,
  emojiText,
  placeholderText,
  stockPaletteUtilities,
  transitionAll,
  unscopedSelectors,
} from './lib/source-rules.mjs';

const uiSource = /\.(css|scss|sass|less|html?|[cm]?[jt]sx?|vue|svelte|astro)$/;
const notUi = /(^|\/)(node_modules|dist|build|\.git)\/|\.(test|spec)\.[^/]+$/;
const stylesheet = /\.(css|scss|sass|less)$/;
// A Neon adapter color variable (`--color-fgMuted`, `--color-bgLinePrimary`).
const neonColor = /--color-(?:fg|bg|accent)(?:[A-Z]\w*)?\b/;

const messages = {
  'stock-palette': 'stock Tailwind color in a Neon restyle; map it by role or say why it stays (lighter than fgMuted, pale shade with no token, chart or category color)',
  'cds-selector': 'selector reaches into CDS component markup; start it with an app class and style CDS through props',
  placeholder: 'placeholder content; use plausible, fictitious names in the app\'s language',
  emoji: 'emoji used as UI; use a CDS icon or text',
  'transition-all': 'transition on all properties; name the properties that change',
};

function git(dir, ...args) {
  const result = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.split('\n').filter(Boolean) : null;
}

// Changed and untracked files relative to dir, or null outside a git repository.
function changedFiles(dir) {
  if (!git(dir, 'rev-parse', '--is-inside-work-tree')) return null;
  const tracked = git(dir, 'rev-parse', '--verify', '-q', 'HEAD')
    ? git(dir, 'diff', '--name-only', '--relative', '--diff-filter=d', 'HEAD')
    : git(dir, 'ls-files', '--cached');
  return [...new Set([...(tracked ?? []), ...(git(dir, 'ls-files', '--others', '--exclude-standard') ?? [])])];
}

function read(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

// The app's .jsx and .tsx files, without descending into node_modules, build output or .git.
function jsxFilesUnder(dir, sub = '') {
  return readdirSync(join(dir, sub), { withFileTypes: true }).flatMap(entry => {
    const path = sub ? `${sub}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return notUi.test(`${path}/`) ? [] : jsxFilesUnder(dir, path);
    return entry.isFile() && /\.[jt]sx$/.test(entry.name) && !notUi.test(path) ? [path] : [];
  });
}

export function lintChanged(dir, paths = []) {
  const changed = paths.length ? paths : changedFiles(dir);
  if (!changed) return { notRun: `${dir} is not a git repository; pass the changed files after the app directory` };
  const files = changed
    .filter(path => uiSource.test(path) && !notUi.test(path))
    .map(path => ({ path, source: read(join(dir, path)) }))
    .filter(file => file.source !== null);

  const manifest = read(join(dir, 'package.json')) ?? '';
  const cds = /"@coinbase\/cds-web"/.test(manifest);
  // A CDS app takes Neon colors from the CDS theme, not from `--color-*`
  // variables, and the starter has no Tailwind: any stock palette utility there
  // is a leftover (a rebuild keeps no source UI library) or bypasses the theme.
  const restyled = cds || files.some(({ source }) => neonColor.test(source));
  const hosts = cds ? cdsHostedClasses(jsxFilesUnder(dir).map(path => ({ path, source: read(join(dir, path)) ?? '' }))) : new Map();

  const warnings = [];
  const add = (path, rule, found) => {
    const grouped = new Map();
    for (const { match, line } of found) grouped.set(match, [...(grouped.get(match) ?? []), line]);
    for (const [match, lines] of grouped) warnings.push({ path, rule, match, lines: [...new Set(lines)] });
  };
  for (const { path, source } of files) {
    if (restyled) add(path, 'stock-palette', stockPaletteUtilities(source));
    if (cds && stylesheet.test(path)) {
      const unscoped = unscopedSelectors(source).map(selector => ({ match: selector, line: lineOf(source, selector) }));
      const onHosts = cdsHostSelectors(source, hosts).map(({ selector, on }) => ({ match: `${selector} (on ${on.join(', ')})`, line: lineOf(source, selector) }));
      add(path, 'cds-selector', [...unscoped, ...onHosts]);
    }
    add(path, 'placeholder', placeholderText(source));
    add(path, 'emoji', emojiText(source));
    add(path, 'transition-all', transitionAll(source));
  }
  return { checked: files.length, warnings };
}

function lineOf(source, selector) {
  const index = source.indexOf(selector);
  return index === -1 ? 1 : source.slice(0, index).split('\n').length;
}

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

export function formatReport({ notRun, checked, warnings }) {
  if (notRun) return `Source lint: not run; ${notRun}`;
  const lines = warnings.map(({ path, rule, match, lines }) => `${path}:${lines.join(',')}  ${rule}  ${match}: ${messages[rule]}`);
  const files = new Set(warnings.map(({ path }) => path)).size;
  const scope = `(${plural(checked, 'changed file')} checked)`;
  lines.push(warnings.length ? `Source lint: ${plural(warnings.length, 'warning')} in ${plural(files, 'file')} ${scope}` : `Source lint: clean ${scope}`);
  return lines.join('\n');
}

// Real path, so a symlinked plugin or temp directory still runs as a script.
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  try {
    const [dirArgument = '.', ...paths] = process.argv.slice(2);
    const dir = resolve(dirArgument);
    if (!existsSync(dir) || !statSync(dir).isDirectory()) console.log(`Source lint: not run; ${dirArgument} is not a directory`);
    else console.log(formatReport(lintChanged(dir, paths)));
  } catch (error) {
    console.log(`Source lint: not run; ${error.message}`);
  }
  process.exitCode = 0;
}
