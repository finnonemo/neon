import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { grade, preservedDeclarations, themeInlineBlocks } from './grade-restyle.mjs';
import { neonRegistryFiles } from './grade-rebuild.mjs';

const css = ({ primary = 'oklch(0.205 0 0)', chart = 'oklch(0.646 0.222 41.116)', mapping = 'var(--primary)' } = {}) => `@import "tailwindcss";
:root {
  --radius: 0.625rem;
  --primary: ${primary};
  --chart-1: ${chart};
}
.dark {
  --primary: oklch(0.922 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
}
@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --color-primary: ${mapping};
  --color-chart-1: var(--chart-1);
}
`;

function apps(source, result) {
  const root = mkdtempSync(join(tmpdir(), 'neon-restyle-'));
  for (const [dir, files] of [['source', source], ['result', result]]) {
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(join(root, dir, path, '..'), { recursive: true });
      writeFileSync(join(root, dir, path), text);
    }
  }
  return { root, source: join(root, 'source'), result: join(root, 'result') };
}

const verdicts = checks => Object.fromEntries(checks.map(({ name, pass }) => [name, pass]));

test('preservedDeclarations keys chart and radius by selector, not @theme mappings', () => {
  assert.deepEqual(preservedDeclarations(css()), {
    ':root --radius': '0.625rem',
    ':root --chart-1': 'oklch(0.646 0.222 41.116)',
    '.dark --chart-1': 'oklch(0.488 0.243 264.376)',
  });
  assert.equal(themeInlineBlocks(css()).length, 1);
});

test('restyle grader passes a palette-only change', () => {
  const app = { 'package.json': '{}', 'src/App.tsx': 'export {}' };
  const { root, source, result } = apps(
    { ...app, 'src/index.css': css() },
    { ...app, 'src/index.css': css({ primary: 'oklch(0.199 0.050 247.2)' }), 'node_modules/x/index.js': 'installed', 'tsconfig.tsbuildinfo': 'built' },
  );
  try {
    assert.deepEqual(verdicts(grade({ source, result, build: false })), {
      'only stylesheets changed': true,
      '@theme inline unchanged': true,
      '--chart-* and --radius unchanged': true,
      'base kept': true,
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('restyle grader fails component, @theme inline and chart edits', () => {
  const { root, source, result } = apps(
    { 'package.json': '{}', 'src/App.tsx': 'export {}', 'src/index.css': css() },
    { 'package.json': '{"dependencies":{"x":"1"}}', 'src/App.tsx': 'export {}', 'src/theme.ts': 'export {}', 'src/index.css': css({ chart: 'oklch(0.5 0.1 250)', mapping: 'var(--color-bgPrimary)' }) },
  );
  try {
    const checks = grade({ source, result, build: false });
    assert.deepEqual(verdicts(checks), {
      'only stylesheets changed': false,
      '@theme inline unchanged': false,
      '--chart-* and --radius unchanged': false,
      'base kept': true,
    });
    assert.equal(checks[0].detail, 'package.json (changed)\nsrc/theme.ts (added)');
    assert.equal(checks[2].detail, 'src/index.css: :root --chart-1 oklch(0.646 0.222 41.116) → oklch(0.5 0.1 250)');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('restyle grader inspects stylesheets the result adds', () => {
  const { root, source, result } = apps(
    { 'package.json': '{}', 'src/index.css': css() },
    { 'package.json': '{}', 'src/index.css': css(), 'src/finnomena.css': ':root { --chart-1: oklch(0.5 0.1 250); }\n' },
  );
  try {
    const checks = grade({ source, result, build: false });
    assert.deepEqual(verdicts(checks), {
      'only stylesheets changed': true,
      '@theme inline unchanged': true,
      '--chart-* and --radius unchanged': false,
      'base kept': true,
    });
    assert.equal(checks[2].detail, 'src/finnomena.css: :root --chart-1 added as oklch(0.5 0.1 250)');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// A Neon-base app as the registry installs it, with the overlays whose Radix
// behavior ADR 0006 accepts: Select closes on a pick, the toast is polite, and
// Dialog hides its siblings with aria-hidden instead of setting aria-modal.
const neonFiles = await neonRegistryFiles();
const neonApp = (app = {}) => ({
  'components.json': JSON.stringify({ registries: { '@neon': 'http://127.0.0.1:1/r/{name}.json' } }),
  'package.json': JSON.stringify({ dependencies: { react: '19', 'radix-ui': '1', sonner: '2' } }),
  ...Object.fromEntries(['src/index.css', 'src/theme/neon.css', 'src/theme/theme.css', 'src/lib/utils.ts', 'src/app/AppRoot.tsx', ...['button', 'select', 'sonner', 'dialog'].map(name => `src/components/ui/${name}.tsx`)].map(path => [path, neonFiles.get(path)])),
  'src/App.tsx': 'export const Header = () => <header className="bg-secondary text-foreground" />\n',
  ...app,
});

test('restyle grader passes a Neon-base restyle through role utilities, Radix overlays included', () => {
  const { root, source, result } = apps(neonApp(), neonApp({ 'src/App.tsx': 'export const Header = () => <header className="bg-primary text-primary-foreground" />\n' }));
  try {
    assert.deepEqual(verdicts(grade({ source, result, build: false, neonFiles })), {
      'base kept': true,
      'Neon base and items only': true,
      'theme and manifests unchanged': true,
      '@theme inline unchanged': true,
      '--chart-* and --radius unchanged': true,
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('restyle grader fails a Neon-base restyle that edits the theme, adds CDS or a stock item', () => {
  const stock = 'import { cn } from "@/lib/utils"\nexport const Card = () => <div className={cn("font-medium dark:bg-input/30")} />\n';
  const { root, source, result } = apps(neonApp(), neonApp({
    'package.json': JSON.stringify({ dependencies: { react: '19', '@coinbase/cds-web': '9' } }),
    'src/theme/neon.css': `${neonFiles.get('src/theme/neon.css')}\n:root { --primary: #001e61; }\n`,
    'src/components/ui/card.tsx': stock,
  }));
  try {
    const checks = grade({ source, result, build: false, neonFiles });
    assert.deepEqual(verdicts(checks), {
      'base kept': false,
      'Neon base and items only': false,
      'theme and manifests unchanged': false,
      '@theme inline unchanged': true,
      '--chart-* and --radius unchanged': true,
    });
    const detail = name => checks.find(check => check.name === name).detail;
    assert.equal(detail('base kept'), 'neon → mixed');
    assert.equal(detail('theme and manifests unchanged'), 'package.json (changed)\nsrc/theme/neon.css (changed)');
    assert.match(detail('Neon base and items only'), /card\.tsx is not a Neon registry item/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('restyle grader keeps a CDS app on CDS and stylesheets only', () => {
  const cdsApp = (app = {}) => ({ 'package.json': JSON.stringify({ dependencies: { react: '19', '@coinbase/cds-web': '9' } }), 'src/App.tsx': 'export {}', 'src/App.css': '.app-header { color: #333; }\n', ...app });
  const restyled = cdsApp({ 'src/App.css': '.app-header { color: var(--color-fgPrimary); }\n' });
  for (const [result, expected] of [
    [restyled, { 'only stylesheets changed': true, 'base kept': true }],
    [{ ...restyled, 'components.json': JSON.stringify({ registries: { '@neon': 'http://127.0.0.1:1/r/{name}.json' } }) }, { 'only stylesheets changed': false, 'base kept': false }],
  ]) {
    const { root, source, result: app } = apps(cdsApp(), result);
    try {
      const got = verdicts(grade({ source, result: app, build: false }));
      assert.deepEqual({ 'only stylesheets changed': got['only stylesheets changed'], 'base kept': got['base kept'] }, expected);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});
