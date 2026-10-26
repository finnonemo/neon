#!/usr/bin/env node
// Lists where installed CDS reads a theme token, before claiming which
// components a token change affects:
//   node scripts/cds-consumers.mjs blue60 fgInverse [--app <dir>]
// <dir> is any app with @coinbase/cds-web installed (default: the current
// directory). Searches cds-web and cds-common, whose token maps (Tag's
// colors, for one) name spectrum steps that cds-web then reads.
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { findConsumers } from './lib/cds-consumers.mjs';

const args = process.argv.slice(2);
const appIndex = args.indexOf('--app');
const app = resolve(appIndex === -1 ? '.' : args[appIndex + 1] ?? '.');
const tokens = appIndex === -1 ? args : args.filter((_, i) => i !== appIndex && i !== appIndex + 1);
if (!tokens.length) {
  console.error('Usage: node scripts/cds-consumers.mjs <token>... [--app <dir>]');
  process.exit(2);
}

const require = createRequire(resolve(app, 'package.json'));
let packageDirs;
try {
  packageDirs = ['@coinbase/cds-web', '@coinbase/cds-common']
    .map(name => dirname(require.resolve(`${name}/package.json`)));
} catch {
  console.error(`No @coinbase/cds-web under ${app}. Pass --app <dir> for an app with CDS installed, or assemble one with scripts/assemble-starter.mjs and npm ci.`);
  process.exit(2);
}

const matches = await findConsumers(packageDirs, tokens);
for (const { token, file, line, snippet } of matches) console.log(`${token}  ${file}:${line}\n    ${snippet}`);
if (!matches.length) console.log(`No CDS source names ${tokens.join(', ')}.`);
