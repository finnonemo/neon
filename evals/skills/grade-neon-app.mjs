#!/usr/bin/env node
// Grades the mechanical half of a new-app case (records/neon-create-base.md):
// on the Neon base with Neon registry items only, stylesheet selectors, no
// stock palette, `dark:` or weight utility in the app's own sources, typecheck
// and build. Then it serves the build and, at every breakpoint, fails a pane
// whose content is wider than the pane, or a page wider than the viewport
// ("Grids inside a pane", skills/neon-audit/references/functional-patterns.md).
// The shell clips the page, so a pane is the scroller that scrolls down
// without being asked to scroll sideways. Other browser checks stay manual.
//
//   node evals/skills/grade-neon-app.mjs <app>... [--json] [--no-browser]
//
// Files byte-identical to the registry's are Neon's, so only the app's own
// sources are searched for stock utilities. The browser step needs an
// installed Chrome (scripts/probe-page.mjs finds it); without one it fails as
// not run, and --no-browser leaves it out.
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { appSources, appStylesheetProblems, neonBaseCheck, neonRegistryFiles, typecheckAndBuild } from './grade-rebuild.mjs';
import { darkClasses, weightOverrides } from '../../scripts/lib/registry.mjs';
import { stockPaletteUtilities } from '../../scripts/lib/source-rules.mjs';
import { probePage, serve } from '../../scripts/probe-page.mjs';

/** The app's breakpoints, with a 375 phone. */
export const BREAKPOINT_WIDTHS = [320, 375, 500, 768, 988, 1080, 1272, 1440, 1920];

/** Where the probe found a pane, or the page, wider than it should be, one line per width and element. */
export function paneProblems(measured) {
  return measured.flatMap(({ width, result }) => [
    ...(result.horizontalOverflow ? [`${width}px: page ${result.documentScrollWidth} > ${result.viewportWidth}`] : []),
    ...(result.widePanes ?? []).map(({ element, scrollWidth, clientWidth }) => `${width}px: ${element} ${scrollWidth} > ${clientWidth}`),
  ]);
}

/** Serves the app's build and probes it at every breakpoint. */
export async function paneCheck(app, { widths = BREAKPOINT_WIDTHS, chrome } = {}) {
  const name = 'panes fit at every breakpoint';
  const build = join(app, 'dist');
  if (!existsSync(join(build, 'index.html'))) return { name, pass: false, detail: `not run: ${build} has no index.html` };
  const out = mkdtempSync(join(tmpdir(), 'neon-grade-probe-'));
  const server = await serve(build);
  try {
    const { measured, notRun } = await probePage(`http://127.0.0.1:${server.address().port}/`, { widths, out, chrome, timeout: 30 + 10 * widths.length });
    const problems = paneProblems(measured);
    if (notRun) problems.push(`not run${measured.length ? ` after ${measured.map(({ width }) => `${width}px`).join(', ')}` : ''}: ${notRun}; --no-browser leaves this check out`);
    return { name, pass: problems.length === 0, detail: problems.join('\n') };
  } finally {
    server.close();
    rmSync(out, { recursive: true, force: true });
  }
}

export async function gradeNeonApp(app, { neonFiles, build = true, browser = build, chrome } = {}) {
  neonFiles ??= await neonRegistryFiles();
  const checks = [];
  const add = (name, problems) => checks.push({ name, pass: problems.length === 0, detail: problems.join('\n') });

  add('Neon base and items only', neonBaseCheck(app, neonFiles));
  add('stylesheet selectors', await appStylesheetProblems(app, neonFiles));
  const own = appSources(app)
    .filter(({ path, source }) => /\.[jt]sx?$/.test(path) && neonFiles.get(path) !== source)
    .map(({ path, source }) => [path, source]);
  const palette = own.flatMap(([path, source]) => stockPaletteUtilities(source).map(({ match, line }) => `${path}:${line} uses ${match}; use a Neon color role`));
  add('stock utilities', [...palette, ...darkClasses(own), ...weightOverrides(own)]);
  if (build) checks.push(...typecheckAndBuild(app));
  if (browser && checks.every(check => check.name !== 'build' || check.pass)) checks.push(await paneCheck(app, { chrome }));
  return checks;
}

async function main() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: { json: { type: 'boolean', default: false }, 'no-browser': { type: 'boolean', default: false } } });
  if (!positionals.length) throw new Error('Usage: grade-neon-app.mjs <app>... [--json] [--no-browser]');
  const neonFiles = await neonRegistryFiles();
  const graded = [];
  for (const app of positionals.map(path => resolve(path))) graded.push({ app, checks: await gradeNeonApp(app, { neonFiles, browser: !values['no-browser'] }) });
  if (values.json) console.log(JSON.stringify(graded, null, 2));
  else {
    for (const { app, checks } of graded) {
      console.log(app);
      for (const { name, pass, detail } of checks) {
        console.log(`${pass ? 'pass' : 'FAIL'}  ${name}`);
        if (detail) console.log(detail.replace(/^/gm, '      '));
      }
    }
  }
  process.exitCode = graded.every(({ checks }) => checks.every(check => check.pass)) ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
