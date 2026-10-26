import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BROWSER_PATHS, browserChanges } from '../../.github/scripts/browser-changes.mjs';

const script = fileURLToPath(new URL('../../.github/scripts/browser-changes.mjs', import.meta.url));

// A repository with a base commit and two branches off it: one touching docs
// only, one touching the theme.
function fixtureRepository(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'browser-changes-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...args], { cwd, encoding: 'utf8' }).trim();
  const commit = (path, message) => {
    mkdirSync(join(cwd, dirname(path)), { recursive: true });
    writeFileSync(join(cwd, path), message);
    git('add', '.');
    git('commit', '-qm', message);
    return git('rev-parse', 'HEAD');
  };
  git('init', '-q');
  const base = commit('README.md', 'base');
  git('switch', '-qc', 'docs');
  const docs = commit('docs/agents/domain.md', 'docs');
  git('switch', '-q', '-');
  git('switch', '-qc', 'theme');
  const theme = commit('theme/css/theme.css', 'theme');
  return { cwd, base, docs, theme };
}

test('browser job skips only when the diff proves no browser path changed', t => {
  const { cwd, base, docs, theme } = fixtureRepository(t);
  assert.deepEqual(browserChanges(base, docs, cwd), { browser: false, matched: [] });
  assert.deepEqual(browserChanges(base, theme, cwd), { browser: true, matched: ['theme/css/theme.css'] });
  // A new branch push has an all-zero before SHA; any doubt means run.
  for (const [label, from, to] of [
    ['all-zero base', '0'.repeat(40), docs],
    ['unknown SHA', 'f'.repeat(40), docs],
    ['empty diff', docs, docs],
    ['missing base', '', docs],
  ]) assert.deepEqual(browserChanges(from, to, cwd), { browser: true, matched: null }, label);
});

test('browser-changes writes the job output the workflow reads', t => {
  const { cwd, base, docs } = fixtureRepository(t);
  const output = join(cwd, 'github-output');
  execFileSync(process.execPath, [script, base, docs], { cwd, env: { ...process.env, GITHUB_OUTPUT: output } });
  assert.equal(readFileSync(output, 'utf8'), 'browser=false\n');
});

test('browser paths cover the starter, theme, browser suite, assembler and probe', () => {
  for (const path of [
    'templates/vitejs-cds/src/main.tsx', 'evals/templates/layouts.spec.mjs', 'theme/css/theme.css',
    'scripts/lib/assemble-starter.mjs', 'scripts/lib/assets.mjs', 'evals/skills/browser-probe.js',
    'evals/skills/probe-fixture.html', 'evals/skills/run-probe.mjs', '.github/workflows/template-browser.yml',
    '.github/scripts/browser-changes.mjs',
  ]) assert.match(path, BROWSER_PATHS, `${path} runs the browser job`);
  for (const path of ['README.md', 'docs/agents/domain.md', 'skills/neon-create/SKILL.md', 'evals/skills/README.md', 'scripts/lib/install.mjs', 'mytheme/x.css', '.github/workflows/validate.yml']) {
    assert.doesNotMatch(path, BROWSER_PATHS, `${path} skips the browser job`);
  }
});
