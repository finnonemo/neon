import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { diffTrees, isCapacityFailure, newEntries } from './run-codex-case.mjs';
import { appBase, appStylesheetProblems, differingExports, leftoverUiLibraries, neonBaseCheck, neonBaseProblems, neonRegistryFiles, pairMockFiles, withEvalShots } from './grade-rebuild.mjs';

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

test('grader flags source UI libraries left in package.json or imports, but not the Neon base\'s Tailwind', () => {
  const packageJson = { dependencies: { '@carbon/react': '1', react: '19', tailwindcss: '4', '@tailwindcss/vite': '4' }, devDependencies: { 'sass-embedded': '1' } };
  const sources = [
    { path: 'src/a.tsx', source: 'import { Button } from "@carbon/react";' },
    { path: 'src/b.css', source: '@import "tailwindcss";' },
  ];
  assert.deepEqual(leftoverUiLibraries(packageJson, sources), [
    'package.json: @carbon/react',
    'package.json: sass-embedded',
    'src/a.tsx: @carbon/react',
  ]);
});

// A Neon-base rebuild: shadcn manages it through the @neon registry entry, and
// its ui folder holds only Neon items, tuned or not.
const neonFiles = new Map([
  ['src/components/ui/button.tsx', 'import { cn } from "@/lib/utils"\nexport function Button() { return <button className={cn("h-[54px] bg-primary text-headline")} /> }\n'],
  ['src/components/ui/dialog.tsx', 'import { cn } from "@/lib/utils"\nexport function Dialog() { return null }\n'],
]);
const neonApp = (changes = {}) => ({
  componentsJson: { registries: { '@neon': 'https://raw.githubusercontent.com/finnonemo/neon/neon--v0.5.0/registry/r/{name}.json' } },
  packageJson: { dependencies: { react: '19', 'radix-ui': '1', tailwindcss: '4' } },
  sources: [...neonFiles].map(([path, source]) => ({ path, source })).concat({ path: 'src/App.tsx', source: 'import { Button } from "@/components/ui/button"\n' }),
  neonFiles,
  ...changes,
});

test('a Neon-base rebuild passes, including a Neon item the app tuned', () => {
  assert.deepEqual(neonBaseProblems(neonApp()), []);
  const tuned = neonApp().sources.map(file => file.path.endsWith('button.tsx') ? { ...file, source: file.source.replace('h-[54px]', 'h-[54px] w-full') } : file);
  assert.deepEqual(neonBaseProblems(neonApp({ sources: tuned })), []);
});

test('a rebuild that adds a stock shadcn item fails', () => {
  const hoverCard = { path: 'src/components/ui/hover-card.tsx', source: 'import { cn } from "@/lib/utils"\nexport function HoverCard() { return <div className={cn("rounded-xl border bg-popover")} /> }\n' };
  assert.deepEqual(neonBaseProblems(neonApp({ sources: [...neonApp().sources, hoverCard] })), [
    'src/components/ui/hover-card.tsx is not a Neon registry item; add @neon/<item> items only',
  ]);
  // Stock shadcn's own button, written over Neon's: its dark: class and weight utility give it away.
  const stock = neonApp().sources.map(file => file.path.endsWith('button.tsx') ? { ...file, source: 'import { cn } from "@/lib/utils"\nconst b = cn("font-medium dark:bg-input/30")\n' } : file);
  assert.deepEqual(neonBaseProblems(neonApp({ sources: stock })), [
    'src/components/ui/button.tsx uses dark:bg-input/30; use Neon roles instead of dark: classes',
    'src/components/ui/button.tsx uses font-medium; each type role carries its own weight',
  ]);
});

test('a rebuild on CDS, or off the Neon registry, fails', () => {
  const cds = neonApp({
    packageJson: { dependencies: { react: '19', '@coinbase/cds-web': '9' } },
    sources: [...neonApp().sources, { path: 'src/Screen.tsx', source: 'import { Button } from "@coinbase/cds-web/buttons";\n' }],
  });
  assert.deepEqual(neonBaseProblems(cds), [
    'package.json: @coinbase/cds-web is CDS; a rebuild targets the Neon base',
    'src/Screen.tsx imports @coinbase/cds-web/buttons; a rebuild targets the Neon base',
  ]);
  assert.deepEqual(neonBaseProblems(neonApp({ componentsJson: undefined })), ['no components.json: the rebuild was not started from the Neon base']);
  assert.deepEqual(neonBaseProblems(neonApp({ componentsJson: { registries: {} } })), ['components.json has no @neon registry: the rebuild was not started from the Neon base']);
});

test('the Neon base check reads a rebuild against the real registry', async () => {
  const files = await neonRegistryFiles();
  for (const path of ['src/components/ui/button.tsx', 'src/lib/utils.ts', 'src/layout/AppShell.tsx', 'src/theme/neon.css']) assert.ok(files.has(path), path);
  const app = mkdtempSync(join(tmpdir(), 'neon-rebuild-'));
  try {
    const write = (path, text) => {
      mkdirSync(join(app, path, '..'), { recursive: true });
      writeFileSync(join(app, path), text);
    };
    write('components.json', JSON.stringify({ registries: { '@neon': 'http://127.0.0.1:1/r/{name}.json' } }));
    write('package.json', JSON.stringify({ dependencies: { react: '19' } }));
    write('src/components/ui/button.tsx', files.get('src/components/ui/button.tsx'));
    assert.deepEqual(neonBaseCheck(app, files), []);
    write('src/components/ui/command.tsx', readFileSync(new URL('./fixtures/shadcn-v4-app/src/components/ui/button.tsx', import.meta.url), 'utf8'));
    assert.match(neonBaseCheck(app, files).join('\n'), /command\.tsx is not a Neon registry item/);
    // The registry's own stylesheets set :root, body and theme attributes; only the app's own are graded.
    write('src/theme/neon.css', files.get('src/theme/neon.css'));
    write('src/layout/layout.css', files.get('src/layout/layout.css'));
    write('src/screens/report.css', 'body { margin: 0; }\n.fr-table th { text-align: right; }\n');
    assert.deepEqual(await appStylesheetProblems(app, files), ['screens/report.css: body']);
  } finally {
    rmSync(app, { recursive: true, force: true });
  }
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

test('appBase tells the Neon base, CDS and neither apart, and names a mixed app', () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/shadcn-v4-app/components.json', import.meta.url), 'utf8'));
  assert.equal(appBase(neonApp()), 'neon');
  assert.equal(appBase({ packageJson: { dependencies: { '@coinbase/cds-web': '9' } } }), 'cds');
  // A plain shadcn app (v0, Lovable) takes Neon items when asked, but is not on the Neon base.
  assert.equal(appBase({ componentsJson: fixture, packageJson: { dependencies: { react: '19' } } }), 'neither');
  assert.equal(appBase({ packageJson: {} }), 'neither');
  // CDS is @coinbase/cds-web, as neon-create and project-inspection name it; icons alone are not a base.
  assert.equal(appBase({ packageJson: { dependencies: { '@coinbase/cds-icons': '9' } } }), 'neither');
  // One app never mixes the two, so the grader reports it rather than picking one.
  assert.equal(appBase(neonApp({ packageJson: { dependencies: { '@coinbase/cds-web': '9' } } })), 'mixed');
});
