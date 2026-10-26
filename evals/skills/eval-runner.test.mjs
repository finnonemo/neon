import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { diffTrees, isCapacityFailure, newEntries } from './run-codex-case.mjs';
import { differingExports, leftoverUiLibraries, pairMockFiles, withEvalShots } from './grade-rebuild.mjs';

test('diffTrees reports packaged files the plugin cache lacks or changed', () => {
  const root = mkdtempSync(join(tmpdir(), 'neon-diff-'));
  try {
    for (const [dir, files] of [['want', { 'skills/a.md': 'a', 'skills/b.md': 'b', 'c.md': 'c' }], ['have', { 'skills/a.md': 'a', 'skills/b.md': 'stale', 'extra.md': 'x' }]]) {
      for (const [path, text] of Object.entries(files)) {
        mkdirSync(join(root, dir, path, '..'), { recursive: true });
        writeFileSync(join(root, dir, path), text);
      }
    }
    assert.deepEqual(diffTrees(join(root, 'want'), join(root, 'have')), { missing: ['c.md'], changed: ['skills/b.md'] });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('runner retries only capacity failures and reports new entries', () => {
  assert.equal(isCapacityFailure('{"type":"error","message":"Model is at capacity, try again"}'), true);
  assert.equal(isCapacityFailure('{"type":"turn.completed"}'), false);
  assert.deepEqual(newEntries(['a', 'b'], ['a', 'b', 'hc-npm-cache']), ['hc-npm-cache']);
});

test('grader flags source UI libraries left in package.json or imports', () => {
  const packageJson = { dependencies: { '@carbon/react': '1', react: '18' }, devDependencies: { 'sass-embedded': '1', '@coinbase/cds-web': '8' } };
  const sources = [
    { path: 'src/a.tsx', source: 'import { Button } from "@carbon/react";\nimport { Box } from "@coinbase/cds-web/layout";' },
    { path: 'src/b.css', source: '@import "tailwindcss";' },
  ];
  assert.deepEqual(leftoverUiLibraries(packageJson, sources), [
    'package.json: @carbon/react',
    'package.json: sass-embedded',
    'src/a.tsx: @carbon/react',
    'src/b.css: tailwindcss',
  ]);
});

test('grader pairs mock files by stem and compares exports through JSON', () => {
  assert.deepEqual(pairMockFiles(['/s/src/data/mockData.js', '/s/src/mockUsers.js'], ['/r/src/data/mockData.ts']), [
    { name: 'mockData', source: '/s/src/data/mockData.js', rebuild: '/r/src/data/mockData.ts' },
    { name: 'mockUsers', source: '/s/src/mockUsers.js', rebuild: undefined },
  ]);
  assert.deepEqual(differingExports({ a: [1, { x: 'ไทย' }], b: 2, c: 3 }, { a: [1, { x: 'ไทย' }], b: 3, d: 4 }), ['b', 'c', 'd']);
});

test('eval-shots launch entry replaces itself and keeps other servers', () => {
  const launch = { version: '0.0.1', configurations: [{ name: 'dev', port: 5173 }, { name: 'eval-shots', port: 1 }] };
  const updated = withEvalShots(launch);
  assert.deepEqual(updated.configurations.map(({ name, port }) => [name, port]), [['dev', 5173], ['eval-shots', 4793]]);
  assert.deepEqual(withEvalShots(undefined).configurations.map(({ name }) => name), ['eval-shots']);
});
