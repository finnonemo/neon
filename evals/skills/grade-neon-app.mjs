#!/usr/bin/env node
// Grades the mechanical half of a new-app case (records/neon-create-base.md):
// on the Neon base with Neon registry items only, stylesheet selectors, no
// stock palette, `dark:` or weight utility in the app's own sources, typecheck
// and build. Browser checks stay manual.
//
//   node evals/skills/grade-neon-app.mjs <app>... [--json]
//
// Files byte-identical to the registry's are Neon's, so only the app's own
// sources are searched for stock utilities.
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { appSources, appStylesheetProblems, neonBaseCheck, neonRegistryFiles, typecheckAndBuild } from './grade-rebuild.mjs';
import { darkClasses, weightOverrides } from '../../scripts/lib/registry.mjs';
import { stockPaletteUtilities } from '../../scripts/lib/source-rules.mjs';

export async function gradeNeonApp(app, { neonFiles, build = true } = {}) {
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
  return checks;
}

async function main() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: { json: { type: 'boolean', default: false } } });
  if (!positionals.length) throw new Error('Usage: grade-neon-app.mjs <app>... [--json]');
  const neonFiles = await neonRegistryFiles();
  const graded = [];
  for (const app of positionals.map(path => resolve(path))) graded.push({ app, checks: await gradeNeonApp(app, { neonFiles }) });
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
