import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { assembleStarter } from '../../scripts/lib/assemble-starter.mjs';
import { appBase, appManifests } from './grade-rebuild.mjs';
import { buildCdsFixture } from './build-base-fixtures.mjs';

const repositoryRoot = resolve(import.meta.dirname, '../..');

// AGENTS.md keeps local evaluation artifacts in .local/; the starter used to refuse it.
test('the CDS starter assembles into .local/ but nowhere else in the checkout', async t => {
  await import('node:fs/promises').then(fs => fs.mkdir(join(repositoryRoot, '.local'), { recursive: true }));
  const directory = await mkdtemp(join(repositoryRoot, '.local/starter-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await assembleStarter({ sourceRoot: repositoryRoot, destination: join(directory, 'app') });
  assert.ok(existsSync(join(directory, 'app/src/theme/createTheme.ts')));
  await assert.rejects(assembleStarter({ sourceRoot: repositoryRoot, destination: join(repositoryRoot, 'evals/skills/fixtures/cds-app') }), /inside the source tree/);
});

test('buildCdsFixture writes an app on the CDS base', async t => {
  const directory = await mkdtemp(join(repositoryRoot, '.local/starter-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const app = await buildCdsFixture(join(directory, 'cds-app'));
  assert.equal(appBase(appManifests(app)), 'cds');
  assert.match(readFileSync(join(app, 'src/app/AppRoot.tsx'), 'utf8'), /createNeonTheme/);
});
