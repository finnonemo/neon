import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { grade, preservedDeclarations, themeInlineBlocks } from './grade-restyle.mjs';

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
    });
    assert.equal(checks[0].detail, 'package.json (changed)\nsrc/theme.ts (added)');
    assert.equal(checks[2].detail, 'src/index.css: :root --chart-1 oklch(0.646 0.222 41.116) → oklch(0.5 0.1 250)');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
