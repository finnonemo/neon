#!/usr/bin/env node
// Lists where installed CDS reads a theme token, before claiming which
// components a token change affects:
//   node scripts/cds-consumers.mjs blue60 fgInverse [--app <dir>]
// <dir> is any app with @coinbase/cds-web installed (default: the current
// directory, then templates/vitejs-cds). Searches cds-web and cds-common,
// whose token maps (Tag's colors, for one) name spectrum steps that cds-web
// then reads.
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cdsPackageDirs, findConsumers } from './lib/cds-consumers.mjs';

const args = process.argv.slice(2);
const appIndex = args.indexOf('--app');
const tokens = appIndex === -1 ? args : args.filter((_, i) => i !== appIndex && i !== appIndex + 1);
if (!tokens.length) {
  console.error('Usage: node scripts/cds-consumers.mjs <token>... [--app <dir>]');
  process.exit(2);
}

// Without --app, the current directory and then the repository's starter.
const starter = fileURLToPath(new URL('../templates/vitejs-cds', import.meta.url));
const apps = appIndex === -1 ? [resolve('.'), starter] : [resolve(args[appIndex + 1] ?? '.')];
const found = cdsPackageDirs(apps);
if (!found) {
  console.error(appIndex === -1
    ? `No @coinbase/cds-web under ${apps[0]} or the starter. Run \`npm ci --prefix ${relative('.', starter) || '.'}\`, or pass --app <dir> for an app with CDS installed.`
    : `No @coinbase/cds-web under ${apps[0]}. Pass --app <dir> for an app with CDS installed, or run \`npm ci --prefix ${relative('.', starter) || '.'}\` and omit --app.`);
  process.exit(2);
}
if (found.app !== apps[0]) console.error(`Reading CDS from ${found.app}`);
const { packageDirs } = found;

const matches = await findConsumers(packageDirs, tokens);
for (const { token, file, line, snippet } of matches) console.log(`${token}  ${file}:${line}\n    ${snippet}`);
if (!matches.length) console.log(`No CDS source names ${tokens.join(', ')}.`);
