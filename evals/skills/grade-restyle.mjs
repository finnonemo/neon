#!/usr/bin/env node
// Grades the mechanical half of a restyle case
// (records/shadcn-on-tailwind-v4-restyle.md): stylesheets are the only files changed, `@theme inline` blocks
// are byte-identical, `--chart-*` and `--radius` keep their values, and the
// result builds. Contrast and surfaces stay with the browser probe.
//
//   node evals/skills/grade-restyle.mjs --source <app> --result <app> [--shots <name>] [--json]
//
// <source> is the untouched fixture; <result> is the restyled copy with its
// dependencies installed. `--shots <name>` also builds the result into
// .local/shots/<name>, as grade-rebuild.mjs does, for
// `run-probe.mjs <name> --dark-class`.
import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { buildShots } from './grade-rebuild.mjs';

// Installed or built output, not the app's source.
const ignored = /(^|\/)(node_modules|\.git|dist)(\/|$)|\.tsbuildinfo$/;

export function listFiles(app) {
  return readdirSync(app, { withFileTypes: true, recursive: true })
    .filter(entry => entry.isFile())
    .map(entry => relative(app, join(entry.parentPath, entry.name)))
    .filter(path => !ignored.test(path))
    .sort();
}

// Files added, removed or changed between two apps, as `path (added)` and so on.
export function changedFiles(source, result) {
  const before = new Set(listFiles(source));
  const after = new Set(listFiles(result));
  const changes = [];
  for (const path of new Set([...before, ...after])) {
    if (!after.has(path)) changes.push({ path, change: 'removed' });
    else if (!before.has(path)) changes.push({ path, change: 'added' });
    else if (!readFileSync(join(source, path)).equals(readFileSync(join(result, path)))) changes.push({ path, change: 'changed' });
  }
  return changes.sort((a, b) => a.path.localeCompare(b.path));
}

export const themeInlineBlocks = css => [...css.matchAll(/@theme\s+inline\s*\{[^}]*\}/g)].map(([block]) => block);

// `--chart-N` and `--radius` declarations keyed by `<selector> <name>`.
export function preservedDeclarations(css) {
  const found = {};
  for (const [, selector, body] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
    for (const declaration of body.split(';')) {
      const match = declaration.match(/^\s*(--chart-\d+|--radius)\s*:\s*([\s\S]+?)\s*$/);
      if (match) found[`${selector.trim()} ${match[1]}`] = match[2];
    }
  }
  return found;
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', env: { ...process.env, CI: '1' } });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim().split('\n').slice(-8).join('\n');
  return { pass: result.status === 0, detail: result.status === 0 ? '' : output };
}

export function grade({ source, result, build = true }) {
  const checks = [];
  const add = (name, pass, detail = '') => checks.push({ name, pass, detail });

  const changes = changedFiles(source, result);
  const outside = changes.filter(({ path }) => !path.endsWith('.css'));
  add('only stylesheets changed', outside.length === 0, outside.map(({ path, change }) => `${path} (${change})`).join('\n'));

  // A stylesheet the result adds can redeclare a token or a second @theme inline.
  const stylesheets = [...new Set([...listFiles(source), ...listFiles(result)])].filter(path => path.endsWith('.css'));
  const read = (app, path) => {
    try {
      return readFileSync(join(app, path), 'utf8');
    } catch {
      return '';
    }
  };
  const themeProblems = [];
  const tokenProblems = [];
  for (const path of stylesheets) {
    const [before, after] = [read(source, path), read(result, path)];
    if (themeInlineBlocks(before).join('\n') !== themeInlineBlocks(after).join('\n')) themeProblems.push(path);
    const [kept, now] = [preservedDeclarations(before), preservedDeclarations(after)];
    for (const key of new Set([...Object.keys(kept), ...Object.keys(now)])) {
      if (!(key in kept)) tokenProblems.push(`${path}: ${key} added as ${now[key]}`);
      else if (kept[key] !== now[key]) tokenProblems.push(`${path}: ${key} ${kept[key]} → ${now[key] ?? 'removed'}`);
    }
  }
  add('@theme inline unchanged', themeProblems.length === 0, themeProblems.join('\n'));
  add('--chart-* and --radius unchanged', tokenProblems.length === 0, tokenProblems.join('\n'));

  if (build) checks.push({ name: 'build', ...run('npm', ['run', 'build', '--silent'], result) });
  return checks;
}

function main() {
  const { values } = parseArgs({
    options: {
      source: { type: 'string' },
      result: { type: 'string' },
      shots: { type: 'string' },
      json: { type: 'boolean', default: false },
    },
  });
  if (!values.source || !values.result) throw new Error('Usage: grade-restyle.mjs --source <app> --result <app> [--shots <name>] [--json]');
  const checks = grade({ source: resolve(values.source), result: resolve(values.result) });
  if (values.shots) checks.push(buildShots(resolve(values.result), values.shots));
  if (values.json) console.log(JSON.stringify(checks, null, 2));
  else {
    for (const { name, pass, detail } of checks) {
      console.log(`${pass ? 'pass' : 'FAIL'}  ${name}`);
      if (detail) console.log(detail.replace(/^/gm, '      '));
    }
  }
  process.exitCode = checks.every(check => check.pass) ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
