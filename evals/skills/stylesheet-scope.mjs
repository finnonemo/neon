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
import { cdsHostedClasses, selectorsOnCdsHosts, unscopedSelectors } from '../../scripts/lib/source-rules.mjs';

export { cdsHostedClasses, selectorsOnCdsHosts, unscopedSelectors };

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
