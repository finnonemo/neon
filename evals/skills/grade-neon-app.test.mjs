import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { neonRegistryFiles } from './grade-rebuild.mjs';
import { gradeNeonApp, paneCheck, paneProblems } from './grade-neon-app.mjs';

test('gradeNeonApp passes a Neon-base app and names stock utilities in its own sources', async () => {
  const files = await neonRegistryFiles();
  const app = mkdtempSync(join(tmpdir(), 'neon-app-'));
  try {
    const write = (path, text) => {
      mkdirSync(join(app, path, '..'), { recursive: true });
      writeFileSync(join(app, path), text);
    };
    write('components.json', JSON.stringify({ registries: { '@neon': 'http://127.0.0.1:1/r/{name}.json' } }));
    write('package.json', JSON.stringify({ dependencies: { react: '19' } }));
    for (const path of ['src/components/ui/button.tsx', 'src/layout/AppShell.tsx', 'src/theme/neon.css']) write(path, files.get(path));
    write('src/screens/Report.tsx', 'export const Report = () => <p className="text-body text-muted-foreground">Ready</p>;\n');
    const verdict = checks => Object.fromEntries(checks.map(({ name, pass }) => [name, pass]));
    assert.deepEqual(verdict(await gradeNeonApp(app, { neonFiles: files, build: false })), {
      'Neon base and items only': true, 'stylesheet selectors': true, 'stock utilities': true,
    });

    write('src/screens/Report.tsx', 'export const Report = () => <p className="text-gray-600 dark:text-white font-medium">Ready</p>;\n');
    write('src/screens/report.css', 'body { margin: 0; }\n');
    const checks = await gradeNeonApp(app, { neonFiles: files, build: false });
    assert.deepEqual(verdict(checks), { 'Neon base and items only': true, 'stylesheet selectors': false, 'stock utilities': false });
    const stock = checks.find(({ name }) => name === 'stock utilities').detail;
    for (const found of ['text-gray-600', 'dark:text-white', 'font-medium']) assert.match(stock, new RegExp(`src/screens/Report\\.tsx.*${found}`));
  } finally {
    rmSync(app, { recursive: true, force: true });
  }
});

test('paneProblems names each width\'s wide pane and a page wider than the viewport', () => {
  assert.deepEqual(paneProblems([
    { width: 375, result: { horizontalOverflow: true, documentScrollWidth: 420, viewportWidth: 375, widePanes: [] } },
    { width: 1440, result: { horizontalOverflow: false, widePanes: [{ element: 'section#list', scrollWidth: 700, clientWidth: 400 }] } },
  ]), ['375px: page 420 > 375', '1440px: section#list 700 > 400']);
});

test('the browser step serves the build and fails a pane wider than itself at a breakpoint', async t => {
  const app = mkdtempSync(join(tmpdir(), 'neon-app-'));
  try {
    mkdirSync(join(app, 'dist'));
    copyFileSync(join(import.meta.dirname, 'probe-fixture-wide-pane.html'), join(app, 'dist/index.html'));
    const check = await paneCheck(app, { widths: [375] });
    if (/not run.*(Chrome|timed out)/.test(check.detail) && !/section#/.test(check.detail)) return t.skip(check.detail);
    assert.equal(check.pass, false);
    assert.match(check.detail, /^375px: section#wide\.pane "One Two Three" \d+ > \d+$/);
  } finally {
    rmSync(app, { recursive: true, force: true });
  }
});

test('the browser step is not run without a build', async () => {
  const app = mkdtempSync(join(tmpdir(), 'neon-app-'));
  try {
    const check = await paneCheck(app);
    assert.equal(check.pass, false);
    assert.match(check.detail, /^not run: .*dist has no index\.html$/);
  } finally {
    rmSync(app, { recursive: true, force: true });
  }
});
