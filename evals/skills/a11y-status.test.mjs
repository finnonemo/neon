// The accessibility testing status is read from the browser suite, so it can only claim what the suite does.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { formatTable, status, uiItems } from '../../scripts/a11y-status.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));

test('every registry UI item has one row, and the table prints one line per row', () => {
  const rows = status();
  assert.deepEqual(rows.map(({ item }) => item), uiItems());
  assert.equal(formatTable(rows).split('\n').length, rows.length + 2);
});

test('an item counts as axe-tested only when a screen the spec checks imports it', async () => {
  const screens = await Promise.all(['Approval', 'Extras', 'Expansion'].map(name => readFile(`${root}evals/templates/fixtures/neon/${name}.tsx`, 'utf8')));
  const expansion = new Set(readdirSync(`${root}evals/templates/fixtures/neon/expansion`).map(file => file.replace(/\.tsx$/, '')));
  for (const { item, axe } of status().filter(row => row.axe === 'Tested')) {
    const imported = expansion.has(item) || screens.some(source => source.includes(`@/components/ui/${item}"`) || (item === 'sonner' && source.includes('from "sonner"')));
    assert.ok(imported, `${item} is marked ${axe} but no checked screen imports it`);
  }
});

test('no screen-reader pass is claimed without its reader, browser and date', async () => {
  const { passes } = JSON.parse(await readFile(`${root}registry/screen-reader-passes.json`, 'utf8'));
  const items = new Set(uiItems());
  for (const pass of passes) {
    assert.ok(items.has(pass.item), `${pass.item} is not a registry UI item`);
    for (const key of ['reader', 'browser', 'date']) assert.ok(pass[key], `${pass.item} pass has no ${key}`);
    assert.match(pass.date, /^\d{4}-\d{2}-\d{2}$/);
  }
});
