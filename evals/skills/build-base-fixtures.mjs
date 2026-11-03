#!/usr/bin/env node
// Builds one app on each base for skill evals (records/base-detection.md):
// `cds-app` from the assembled CDS starter, and `neon-app` from this
// checkout's registry through scripts/smoke-new-app.mjs (real install, needs
// network). Plain shadcn needs no build: use fixtures/shadcn-v4-app.
//
//   node evals/skills/build-base-fixtures.mjs [directory]
//
// The directory defaults to .local/fixtures/<timestamp>. Copy an app before
// planting a case's problems in it.
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { assembleStarter } from '../../scripts/lib/assemble-starter.mjs';

const repositoryRoot = resolve(import.meta.dirname, '../..');

export async function buildCdsFixture(directory) {
  return (await assembleStarter({ sourceRoot: repositoryRoot, destination: directory })).destination;
}

if (import.meta.filename === resolve(process.argv[1] ?? '')) {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const directory = resolve(process.argv[2] ?? join(repositoryRoot, '.local/fixtures', stamp));
  console.log(`CDS: ${await buildCdsFixture(join(directory, 'cds-app'))}`);
  const neon = spawnSync(process.execPath, [join(repositoryRoot, 'scripts/smoke-new-app.mjs'), join(directory, 'neon-app')], { stdio: 'inherit' });
  if (neon.status !== 0) process.exit(neon.status ?? 1);
  console.log(`Neon base: ${join(directory, 'neon-app')}`);
}
