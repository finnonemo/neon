#!/usr/bin/env node
// Grades the mechanical half of a CDS rebuild case (README "CDS rebuild"):
// source untouched, stylesheet selectors, no leftover source UI library,
// tests, typecheck, build and mock data unchanged. Browser checks stay manual.
//
//   node evals/skills/grade-rebuild.mjs --source <app> --rebuild <app>-cds [--shots <name>] [--json]
//
// `--shots <name>` also builds the rebuild into .local/shots/<name> with a
// relative base, copies the shipped browser-probe.js beside it and adds an
// `eval-shots` server for .local/shots to .claude/launch.json. The preview opens
// http://localhost:4793/<name>/ and runs the probe with
// `eval(await (await fetch('/browser-probe.js')).text())`.
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, extname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { gradeStylesheets } from './stylesheet-scope.mjs';

const repositoryRoot = resolve(import.meta.dirname, '../..');

// Packages that carry the source app's own UI system rather than CDS.
const sourceUiLibrary = /^(@carbon\/|tailwindcss$|@tailwindcss\/|sass(-embedded)?$|@mui\/|antd$|bootstrap$|@chakra-ui\/)/;

export function leftoverUiLibraries(packageJson, sources) {
  const found = new Set();
  for (const field of ['dependencies', 'devDependencies']) {
    for (const name of Object.keys(packageJson[field] ?? {})) if (sourceUiLibrary.test(name)) found.add(`package.json: ${name}`);
  }
  for (const { path, source } of sources) {
    for (const [, specifier] of source.matchAll(/(?:from\s*|import\s*\(?\s*|@import\s+)["']([^"']+)["']/g)) {
      if (sourceUiLibrary.test(specifier)) found.add(`${path}: ${specifier}`);
    }
  }
  return [...found];
}

// Mock-data files paired by name without extension (`mockData.js` ↔ `mockData.ts`).
export function pairMockFiles(sourceFiles, rebuildFiles) {
  const stem = path => basename(path, extname(path));
  const pairs = [];
  for (const source of sourceFiles) {
    const match = rebuildFiles.find(file => stem(file) === stem(source));
    pairs.push({ name: stem(source), source, rebuild: match });
  }
  return pairs;
}

// Exports whose values differ after a JSON round trip.
export function differingExports(expected, actual) {
  const names = new Set([...Object.keys(expected), ...Object.keys(actual)]);
  return [...names].filter(name => JSON.stringify(expected[name]) !== JSON.stringify(actual[name])).sort();
}

export function withEvalShots(launch) {
  const entry = {
    name: 'eval-shots',
    runtimeExecutable: 'python3',
    runtimeArgs: ['-m', 'http.server', '4793', '--directory', '.local/shots'],
    port: 4793,
  };
  const configurations = (launch?.configurations ?? []).filter(configuration => configuration.name !== entry.name);
  return { version: launch?.version ?? '0.0.1', configurations: [...configurations, entry] };
}

function sourceFiles(directory, pattern) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true, recursive: true })
    .filter(entry => entry.isFile() && pattern.test(entry.name) && !join(entry.parentPath, entry.name).includes('node_modules'))
    .map(entry => join(entry.parentPath, entry.name));
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', env: { ...process.env, CI: '1' } });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim().split('\n').slice(-8).join('\n');
  return { pass: result.status === 0, detail: result.status === 0 ? '' : output };
}

// Bundles with the app's esbuild when it has one. Otherwise copies the file
// alone and lets Node strip its types, which covers mock files whose only
// imports are `import type`.
async function loadMock(file, esbuild, workDirectory) {
  const typed = /\.(m?ts|tsx)$/.test(file);
  const outfile = join(workDirectory, `${basename(file)}-${Math.random().toString(36).slice(2)}.${esbuild || !typed ? 'mjs' : 'mts'}`);
  if (esbuild) execFileSync(esbuild, [file, '--bundle', '--format=esm', '--platform=node', '--log-level=error', `--outfile=${outfile}`]);
  else copyFileSync(file, outfile);
  return import(pathToFileURL(outfile).href);
}

async function grade({ source, rebuild }) {
  const checks = [];
  const add = (name, pass, detail = '') => checks.push({ name, pass, detail });

  if (existsSync(join(source, '.git'))) {
    const status = execFileSync('git', ['-C', source, 'status', '--porcelain'], { encoding: 'utf8' }).trim();
    add('source unchanged', status === '', status);
  } else add('source unchanged', false, 'source is not a git repository, so changes cannot be checked');

  const styles = await gradeStylesheets(join(rebuild, 'src'));
  add('stylesheet selectors', styles.length === 0, styles.join('\n'));

  const packageJson = JSON.parse(readFileSync(join(rebuild, 'package.json'), 'utf8'));
  const scripts = sourceFiles(join(rebuild, 'src'), /\.(m?[jt]sx?|s?css)$/).map(path => ({ path: path.slice(rebuild.length + 1), source: readFileSync(path, 'utf8') }));
  const leftovers = leftoverUiLibraries(packageJson, scripts);
  add('no source UI library', leftovers.length === 0, leftovers.join('\n'));

  if (packageJson.scripts?.test) checks.push({ name: 'tests', ...run('npm', ['test', '--silent'], rebuild) });
  else add('tests', false, 'no test script');
  if (existsSync(join(rebuild, 'tsconfig.json'))) checks.push({ name: 'typecheck', ...run('npx', ['--no-install', 'tsc', '--noEmit'], rebuild) });
  checks.push({ name: 'build', ...run('npm', ['run', 'build', '--silent'], rebuild) });

  // Vite 8 ships no esbuild, so try the source app's copy before Node.
  const esbuild = [rebuild, source].map(app => join(app, 'node_modules/.bin/esbuild')).find(existsSync);
  const mocks = /mock/i;
  const pairs = pairMockFiles(sourceFiles(join(source, 'src'), mocks), sourceFiles(join(rebuild, 'src'), mocks));
  if (!pairs.length) add('mock data', true, 'source has no mock files');
  else {
    const workDirectory = mkdtempSync(join(tmpdir(), 'neon-mocks-'));
    try {
      const problems = [];
      for (const pair of pairs) {
        if (!pair.rebuild) {
          problems.push(`${pair.name}: no rebuild counterpart`);
          continue;
        }
        const differing = differingExports(await loadMock(pair.source, esbuild, workDirectory), await loadMock(pair.rebuild, esbuild, workDirectory));
        if (differing.length) problems.push(`${pair.name}: ${differing.join(', ')}`);
      }
      add('mock data', problems.length === 0, problems.join('\n'));
    } finally {
      rmSync(workDirectory, { recursive: true, force: true });
    }
  }
  return checks;
}

export function buildShots(rebuild, name) {
  const outDir = join(repositoryRoot, '.local/shots', name);
  mkdirSync(outDir, { recursive: true });
  const result = run('npx', ['--no-install', 'vite', 'build', '--base', './', '--outDir', outDir, '--emptyOutDir'], rebuild);
  copyFileSync(join(repositoryRoot, 'skills/neon-redesign/references/browser-probe.js'), join(repositoryRoot, '.local/shots/browser-probe.js'));
  const launchPath = join(repositoryRoot, '.claude/launch.json');
  const launch = existsSync(launchPath) ? JSON.parse(readFileSync(launchPath, 'utf8')) : undefined;
  mkdirSync(join(repositoryRoot, '.claude'), { recursive: true });
  writeFileSync(launchPath, `${JSON.stringify(withEvalShots(launch), null, 2)}\n`);
  return { name: 'shots build', ...result, detail: result.pass ? `http://localhost:4793/${name}/ (preview "eval-shots")` : result.detail };
}

async function main() {
  const { values } = parseArgs({
    options: {
      source: { type: 'string' },
      rebuild: { type: 'string' },
      shots: { type: 'string' },
      json: { type: 'boolean', default: false },
    },
  });
  if (!values.source || !values.rebuild) throw new Error('Usage: grade-rebuild.mjs --source <app> --rebuild <app>-cds [--shots <name>] [--json]');
  const source = resolve(values.source);
  const rebuild = resolve(values.rebuild);
  const checks = await grade({ source, rebuild });
  if (values.shots) checks.push(buildShots(rebuild, values.shots));
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
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
