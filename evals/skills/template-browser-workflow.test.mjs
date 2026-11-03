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

// Playwright clears its output folders per run, so a shared folder lets the
// Neon run wipe the CDS report before upload.
test('each browser target keeps its own report and CI checks both survive', async () => {
  const config = await readFile(new URL('../templates/playwright.config.mjs', import.meta.url), 'utf8');
  const workflow = await readFile(new URL('../../.github/workflows/template-browser.yml', import.meta.url), 'utf8');
  assert.match(config, /resolve\('\.\.\/\.\.\/\.local\/evals\/templates', process\.env\.NEON_TARGET \?\? 'cds'\)/);
  assert.match(workflow, /if: \$\{\{ !cancelled\(\) \}\}\n\s+run: npm test --prefix evals\/templates -- --target neon\n/);
  const check = workflow.indexOf('test -f .local/evals/templates/cds/report/index.html && test -f .local/evals/templates/neon/report/index.html');
  assert.ok(check > workflow.indexOf('--target neon') && check < workflow.indexOf('actions/upload-artifact'));
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
