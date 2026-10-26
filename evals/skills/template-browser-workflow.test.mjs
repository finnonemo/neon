import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// The container ships the browsers for one Playwright release; a different
// @playwright/test version can't find them and the job fails.
test('template-browser container matches the pinned Playwright version', async () => {
  const workflow = await readFile(new URL('../../.github/workflows/template-browser.yml', import.meta.url), 'utf8');
  const { devDependencies } = JSON.parse(await readFile(new URL('../templates/package.json', import.meta.url), 'utf8'));
  const image = workflow.match(/mcr\.microsoft\.com\/playwright:v([\d.]+)-/)?.[1];
  assert.equal(image, devDependencies['@playwright/test']);
});
