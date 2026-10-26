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

// Every pull request and merge group gets a template-browser result so it can
// be a required check; the changes job skips the browser job by path.
test('template-browser runs on every pull request and filters browser paths in the changes job', async () => {
  const workflow = await readFile(new URL('../../.github/workflows/template-browser.yml', import.meta.url), 'utf8');
  const triggers = workflow.slice(workflow.indexOf('on:\n'), workflow.indexOf('permissions:'));
  assert.doesNotMatch(triggers, /paths:/);
  assert.match(triggers, /^  merge_group:$/m);
  assert.match(workflow, /needs: changes\n[\s\S]*?if: needs\.changes\.outputs\.browser == 'true'/);
  assert.match(workflow, /run: node evals\/skills\/run-probe\.mjs --fixture/);
  assert.match(workflow, /run: node evals\/skills\/grade-restyle\.mjs --source evals\/skills\/fixtures\/shadcn-v4-app .*--shots shadcn-v4\n/);
  assert.match(workflow, /run: node evals\/skills\/run-probe\.mjs shadcn-v4 .*--dark-class\n/);
  assert.match(workflow, /run: node \.github\/scripts\/browser-changes\.mjs "\$BASE" "\$HEAD"/);
});

test('validate runs on merge groups for a merge queue', async () => {
  const workflow = await readFile(new URL('../../.github/workflows/validate.yml', import.meta.url), 'utf8');
  assert.match(workflow.slice(0, workflow.indexOf('permissions:')), /^  merge_group:$/m);
});

test('validate lints every workflow with a pinned actionlint', async () => {
  const workflow = await readFile(new URL('../../.github/workflows/validate.yml', import.meta.url), 'utf8');
  assert.match(workflow, /ACTIONLINT_VERSION: \d+\.\d+\.\d+\n/);
  assert.match(workflow, /sha256sum -c -/);
  assert.match(workflow, /"\$RUNNER_TEMP\/actionlint" -color\n/);
});
