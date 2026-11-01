import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, access, readdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
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

test('distribution ships the source lint the shared checklist runs, and it runs from the package', async () => {
  const destination = await mkdtemp(join(tmpdir(), 'neon-package-test-'));
  await packagePlugin({ destination });
  for (const file of ['scripts/source-lint.mjs', 'scripts/lib/source-rules.mjs']) {
    assert.equal(await readFile(join(destination, file), 'utf8'), await readFile(join(import.meta.dirname, '../..', file), 'utf8'));
  }
  const verification = await readFile(join(destination, 'skills/neon-redesign/references/verification.md'), 'utf8');
  assert.ok(verification.includes('<Neon root>/scripts/source-lint.mjs'), 'verification.md must run the lint');
  const app = await mkdtemp(join(tmpdir(), 'neon-package-lint-'));
  await writeFile(join(app, 'index.html'), '<p>Lorem</p>\n');
  const run = spawnSync(process.execPath, [join(destination, 'scripts/source-lint.mjs'), app, 'index.html'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /^Source lint: 1 warning in 1 file/m);
});

test('distribution ships the browser probe runner with no npm dependencies, runnable from the package alone', async () => {
  const destination = await mkdtemp(join(tmpdir(), 'neon-package-test-'));
  await packagePlugin({ destination });
  const runner = join(destination, 'scripts/probe-page.mjs');
  // Every import, followed through shipped relative files, is a Node built-in.
  const pending = [runner];
  for (const seen = new Set(); pending.length;) {
    const file = pending.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    const source = await readFile(file, 'utf8');
    for (const [, specifier] of source.matchAll(/(?:\bfrom\s+|\bimport\s*\(\s*|^\s*import\s+)['"]([^'"]+)['"]/gm)) {
      if (specifier.startsWith('.')) pending.push(resolve(dirname(file), specifier));
      else assert.ok(specifier.startsWith('node:'), `${file} imports ${specifier}`);
    }
  }
  // The packaged copy finds the shipped probe and degrades without Chrome.
  const result = spawnSync(process.execPath, [runner, 'http://127.0.0.1:9/', '--chrome', join(destination, 'no-chrome')], { cwd: destination, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^Browser probe: not run; recheck at 375px and 1440px$/m);
});

test('missing required payload fails before writing destination', async () => {
  const sourceRoot = await mkdtemp(join(tmpdir(), 'neon-empty-source-'));
  const destination = await mkdtemp(join(tmpdir(), 'neon-empty-dest-'));
  await assert.rejects(packagePlugin({ sourceRoot, destination }));
  assert.deepEqual(await readdir(destination), []);
});
