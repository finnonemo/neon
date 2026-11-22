#!/usr/bin/env node
// Builds the Neon-base app for skill evals (records/base-detection.md):
// `neon-app` from this checkout's registry through scripts/smoke-new-app.mjs
// (real install, needs network). Plain shadcn needs no build: use
// fixtures/shadcn-v4-app. The CDS starter went with Neon 2.0.0 (ADR 0016).
//
//   node evals/skills/build-base-fixtures.mjs [directory]
//
// The directory defaults to .local/fixtures/<timestamp>. Copy an app before
// planting a case's problems in it.
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const repositoryRoot = resolve(import.meta.dirname, '../..');

if (import.meta.filename === resolve(process.argv[1] ?? '')) {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const directory = resolve(process.argv[2] ?? join(repositoryRoot, '.local/fixtures', stamp));
  const neon = spawnSync(process.execPath, [join(repositoryRoot, 'scripts/smoke-new-app.mjs'), join(directory, 'neon-app')], { stdio: 'inherit' });
  if (neon.status !== 0) process.exit(neon.status ?? 1);
  console.log(`Neon base: ${join(directory, 'neon-app')}`);
}
