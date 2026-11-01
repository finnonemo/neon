import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, access, readdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { packagePlugin } from '../../scripts/package-plugin.mjs';

test('distribution contains the shared design contract and conditional CDS guide', async () => {
  const destination = await mkdtemp(join(tmpdir(), 'neon-package-test-'));
  await packagePlugin({ destination });
  await access(join(destination, 'skills/INSTRUCTION.md'));
  await access(join(destination, 'templates/vitejs-cds/src/layout/ResponsivePanes.tsx'));
  await access(join(destination, 'templates/vitejs-cds/src/layout/layout.css'));
  await access(join(destination, 'skills/neon-create/references/cds-integration.md'));
  await assert.rejects(access(join(destination, 'evals')));
});

test('distribution ships the reference design and readiness procedures both implementation skills link to', async () => {
  const destination = await mkdtemp(join(tmpdir(), 'neon-package-test-'));
  await packagePlugin({ destination });
  for (const reference of ['reference-design.md', 'readiness.md']) {
    await access(join(destination, 'skills/neon-audit/references', reference));
    for (const skill of ['neon-create', 'neon-redesign']) {
      const entrypoint = await readFile(join(destination, 'skills', skill, 'SKILL.md'), 'utf8');
      assert.ok(entrypoint.includes(`../neon-audit/references/${reference}`), `${skill} must link ${reference}`);
    }
  }
});

test('distribution ships the browser probe the shared checklist measures with, and evals keep no copy', async () => {
  const destination = await mkdtemp(join(tmpdir(), 'neon-package-test-'));
  await packagePlugin({ destination });
  const probe = 'skills/neon-redesign/references/browser-probe.js';
  assert.equal(await readFile(join(destination, probe), 'utf8'), await readFile(join(import.meta.dirname, '../..', probe), 'utf8'));
  const verification = await readFile(join(destination, 'skills/neon-redesign/references/verification.md'), 'utf8');
  assert.ok(verification.includes('](browser-probe.js)'), 'verification.md must link the probe');
  await assert.rejects(access(join(import.meta.dirname, 'browser-probe.js')));
});

test('missing required payload fails before writing destination', async () => {
  const sourceRoot = await mkdtemp(join(tmpdir(), 'neon-empty-source-'));
  const destination = await mkdtemp(join(tmpdir(), 'neon-empty-dest-'));
  await assert.rejects(packagePlugin({ sourceRoot, destination }));
  assert.deepEqual(await readdir(destination), []);
});
