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
  const browserPaths = new RegExp(workflow.match(/BROWSER_PATHS: '([^']+)'/)[1]);
  for (const path of [
    'templates/vitejs-cds/src/main.tsx', 'evals/templates/layouts.spec.mjs', 'theme/css/theme.css',
    'scripts/lib/assemble-starter.mjs', 'scripts/lib/assets.mjs', 'evals/skills/browser-probe.js',
    'evals/skills/probe-fixture.html', 'evals/skills/run-probe.mjs', '.github/workflows/template-browser.yml',
  ]) assert.match(path, browserPaths, `${path} runs the browser job`);
  for (const path of ['README.md', 'docs/agents/domain.md', 'skills/neon-create/SKILL.md', 'evals/skills/README.md', 'scripts/lib/install.mjs', 'mytheme/x.css']) {
    assert.doesNotMatch(path, browserPaths, `${path} skips the browser job`);
  }
});

test('validate runs on merge groups for a merge queue', async () => {
  const workflow = await readFile(new URL('../../.github/workflows/validate.yml', import.meta.url), 'utf8');
  assert.match(workflow.slice(0, workflow.indexOf('permissions:')), /^  merge_group:$/m);
});
