import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { findApp, listCases, markDone, recordVerdict } from '../review/review-server.mjs';

const cases = JSON.parse(await readFile(new URL('../review/cases.json', import.meta.url), 'utf8'));

test('the review set has eight neutral cases on their own ports', () => {
  assert.equal(cases.length, 8);
  assert.deepEqual(cases.map(item => item.case), Array.from({ length: 8 }, (_, index) => `review-0${index + 1}`));
  const ports = cases.map(item => item.prompt.match(/port (\d+)/)?.[1]);
  assert.equal(new Set(ports).size, 8);
  for (const item of cases) {
    assert.deepEqual(Object.keys(item).sort(), ['case', 'fixture', 'prompt'], `${item.case} carries only the runner's fields`);
    assert.match(item.prompt, /^\/neon:neon-create /);
  }
  assert.equal(cases.filter(item => /Campaign Page/.test(item.prompt)).length, 4, 'half are Campaign Pages');
});

test('a verdict replaces the earlier one for its case, and done is stamped', async () => {
  const file = join(await mkdtemp(join(tmpdir(), 'review-')), 'verdicts.json');
  await recordVerdict({ round: 'r1', case: 'review-01', verdict: 'fail', tags: ['story', 'story'], note: ' flat ' }, file, new Date('2026-11-14T10:00:00Z'));
  await recordVerdict({ round: 'r1', case: 'review-01', verdict: 'pass', tags: ['motion'] }, file, new Date('2026-11-14T10:05:00Z'));
  await markDone('r1', file, new Date('2026-11-14T11:00:00Z'));
  assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), {
    version: 1,
    rounds: { r1: { done: '2026-11-14T11:00:00.000Z', cases: { 'review-01': { verdict: 'pass', tags: ['motion'], note: '', at: '2026-11-14T10:05:00.000Z' } } } },
  });
  await assert.rejects(recordVerdict({ round: 'r1', case: '../x', verdict: 'pass' }, file));
  await assert.rejects(recordVerdict({ round: 'r1', case: 'review-02', verdict: 'maybe' }, file));
});

test('a case finds the app its run built, below the fixture folder', async () => {
  const round = await mkdtemp(join(tmpdir(), 'round-'));
  const app = join(round, 'review-01', 'empty', 'club-run');
  await mkdir(join(app, 'dist'), { recursive: true });
  await writeFile(join(app, 'package.json'), JSON.stringify({ scripts: { build: 'vite build' } }));
  await writeFile(join(app, 'dist', 'index.html'), '<!doctype html>');
  await mkdir(join(round, 'review-02', 'empty'), { recursive: true });
  assert.equal(findApp(join(round, 'review-01')), app);
  assert.deepEqual(listCases(round), [
    { case: 'review-01', app, dist: join(app, 'dist') },
    { case: 'review-02', app: null, dist: null },
  ]);
});
