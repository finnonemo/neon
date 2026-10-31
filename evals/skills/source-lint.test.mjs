import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as rules from '../../scripts/lib/source-rules.mjs';
import * as grader from './stylesheet-scope.mjs';

const repo = join(import.meta.dirname, '../..');
const cli = join(repo, 'scripts/source-lint.mjs');

function write(root, files) {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), text);
  }
}

function git(root, ...args) {
  const result = spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-C', root, ...args], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}

// A temporary git repository with `committed` as its first commit.
function repository(t, committed) {
  const root = mkdtempSync(join(tmpdir(), 'neon-lint-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  write(root, { '.gitignore': 'node_modules\n', ...committed });
  git(root, 'init', '-q');
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'init');
  return root;
}

function lint(...args) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
  return { status: result.status, lines: result.stdout.trim().split('\n'), stderr: result.stderr };
}

test('the stylesheet grader uses the shipped selector rules instead of a copy', async () => {
  for (const name of ['unscopedSelectors', 'cdsHostedClasses', 'selectorsOnCdsHosts']) assert.equal(grader[name], rules[name], name);
  const source = await readFile(join(repo, 'evals/skills/stylesheet-scope.mjs'), 'utf8');
  assert.match(source, /from '\.\.\/\.\.\/scripts\/lib\/source-rules\.mjs'/);
  assert.doesNotMatch(source, /function selectorsOf|anonymousWrapper\s*=/);
});

test('finds stock Tailwind palette utilities with variants, opacity and @apply, by line', () => {
  const source = [
    '<p className="text-slate-300 hover:bg-blue-600/50 md:!border-green-200">',
    '<div className="bg-(--color-bgPrimary) text-[var(--color-fg)] bg-white text-sm" data-x="my-text-slate-300" />',
    '.note { @apply ring-indigo-500 divide-gray-100; }',
  ].join('\n');
  assert.deepEqual(rules.stockPaletteUtilities(source), [
    { match: 'text-slate-300', line: 1 },
    { match: 'bg-blue-600', line: 1 },
    { match: 'border-green-200', line: 1 },
    { match: 'ring-indigo-500', line: 3 },
    { match: 'divide-gray-100', line: 3 },
  ]);
});

test('finds lorem, Acme and John Doe placeholders but not words that contain them', () => {
  const source = [
    '<p>Lorem ipsum dolor sit amet</p>',
    "const owner = { name: 'John Doe', company: 'ACME Corp' };",
    "const fund = 'Jane Doe'; const help = 'acmeist placeholder Doeville';",
  ].join('\n');
  assert.deepEqual(rules.placeholderText(source), [
    { match: 'Lorem', line: 1 },
    { match: 'John Doe', line: 2 },
    { match: 'ACME', line: 2 },
    { match: 'Jane Doe', line: 3 },
  ]);
});

test('finds emoji used as UI but not digits, #, *, symbols such as © or Thai text', () => {
  const source = [
    '<span>🚀 Launch</span> <b>⚠️</b>',
    '<footer>© 2026 Finnomena ® ™ #1 * 2 กองทุนรวม ✓</footer>',
    "const done = '✅';",
  ].join('\n');
  assert.deepEqual(rules.emojiText(source), [
    { match: '🚀', line: 1 },
    { match: '⚠️', line: 1 },
    { match: '✅', line: 3 },
  ]);
});

test('skips emoji and placeholder words inside code comments, keeping line numbers', () => {
  const source = [
    '/* ✅ space: populated for the Acme export',
    ' * ⛔ COLOR: not populated */',
    '<!-- 🚀 lorem -->',
    '  // ⚠️ legacy sample from Jane Doe',
    "const link = 'https://example.com/🚀'; <p>Lorem</p>",
  ].join('\n');
  assert.deepEqual(rules.emojiText(source), [{ match: '🚀', line: 5 }]);
  assert.deepEqual(rules.placeholderText(source), [{ match: 'Lorem', line: 5 }]);
});

test('finds transitions on all properties in CSS, inline styles and Tailwind', () => {
  const source = [
    '.card { transition: all 0.2s ease; }',
    '.chip { transition: opacity 0.2s, all 1s; transition-property: all; }',
    "<div style={{ transition: 'all 150ms' }} className=\"transition-all duration-200\" />",
    '.ok { transition: opacity 0.2s, transform 0.2s; } .tall { transition: background-color 1s; }',
  ].join('\n');
  assert.deepEqual(rules.transitionAll(source).map(({ line }) => line), [1, 2, 2, 3, 3]);
});

test('lints only changed and untracked UI files, warns and exits 0', t => {
  const root = repository(t, {
    'src/Old.tsx': '<span>🚀</span>\n',
    'src/Gone.tsx': 'export {}\n',
    'src/App.tsx': 'export const App = () => <p>Hi</p>;\n',
  });
  write(root, {
    'src/App.tsx': 'export const App = () => <p>Lorem ipsum</p>;\n',
    'src/New.css': '.card { transition: all 0.2s; }\n',
    'notes.md': 'Lorem ipsum\n',
    'node_modules/x/index.js': 'const a = "🚀";\n',
  });
  unlinkSync(join(root, 'src/Gone.tsx'));
  const { status, lines } = lint(root);
  assert.equal(status, 0);
  assert.deepEqual(lines.map(line => line.split('  ')[0]), ['src/App.tsx:1', 'src/New.css:1', lines.at(-1)]);
  assert.match(lines[0], /placeholder.*Lorem/);
  assert.match(lines[1], /transition-all/);
  assert.equal(lines.at(-1), 'Source lint: 2 warnings in 2 files (2 changed files checked)');
});

test('warns on stock palette utilities only once the change uses Neon color variables, from an app inside a larger repository', t => {
  const app = 'apps/web';
  const root = repository(t, { [`${app}/src/App.tsx`]: '<p className="text-slate-900">Hi</p>\n', 'other/x.tsx': 'export {}\n' });
  write(root, { [`${app}/src/App.tsx`]: '<p className="text-slate-900 font-bold">Hi</p>\n', 'other/x.tsx': '<p>Lorem</p>\n' });
  assert.deepEqual(lint(join(root, app)).lines, ['Source lint: clean (1 changed file checked)']);

  write(root, {
    [`${app}/src/App.tsx`]: '<p className="text-(--color-fg)">Hi</p>\n<p className="text-slate-300" disabled>Off</p>\n<p className="text-slate-300">Also</p>\n',
  });
  assert.deepEqual(lint(join(root, app)).lines, [
    `src/App.tsx:2,3  stock-palette  text-slate-300: ${'stock Tailwind color in a Neon restyle; map it by role or say why it stays (lighter than fgMuted, pale shade with no token, chart or category color)'}`,
    'Source lint: 1 warning in 1 file (1 changed file checked)',
  ]);
});

test('outside git it lints the files named after the app directory, or says it did not run', t => {
  const root = mkdtempSync(join(tmpdir(), 'neon-lint-plain-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  write(root, { 'index.html': '<h1>✅ Acme</h1>\n' });
  const named = lint(root, 'index.html');
  assert.equal(named.status, 0);
  assert.deepEqual(named.lines.map(line => line.split('  ').slice(0, 2).join(' ')), ['index.html:1 placeholder', 'index.html:1 emoji', named.lines.at(-1)]);
  const bare = lint(root);
  assert.equal(bare.status, 0);
  assert.match(bare.lines.at(-1), /^Source lint: not run; .* is not a git repository/);
  assert.equal(lint(join(root, 'missing')).status, 0);
});

test('flags selectors reaching into CDS only in CDS apps, including classes on CDS components in unchanged files', t => {
  const plain = repository(t, { 'package.json': '{"dependencies":{"react":"19"}}', 'src/index.css': '' });
  write(plain, { 'src/index.css': 'body { margin: 0; } * { box-sizing: border-box; }\n' });
  assert.deepEqual(lint(plain).lines, ['Source lint: clean (1 changed file checked)']);

  const cds = repository(t, {
    'package.json': '{"dependencies":{"@coinbase/cds-web":"8"}}',
    'src/Save.tsx': 'import { Button } from "@coinbase/cds-web/buttons";\nexport const Save = () => <Button className="app-save">Save</Button>;\n',
    'src/app.css': '',
  });
  write(cds, { 'src/app.css': '.app-row { gap: 4px; }\n.app-row > div { flex: 1; }\n.app-save:hover { opacity: 0.8; }\n' });
  assert.deepEqual(lint(cds).lines.map(line => line.split(':').slice(0, 2).join(':')), [
    'src/app.css:2  cds-selector  .app-row > div',
    'src/app.css:3  cds-selector  .app-save',
    'Source lint: 2 warnings in 1 file (1 changed file checked)',
  ]);
});

test('every file of the assembled CDS starter lints clean, so a new app warns only on what the agent wrote', () => {
  const starter = join(mkdtempSync(join(tmpdir(), 'neon-lint-starter-')), 'app');
  const assembled = spawnSync(process.execPath, [join(repo, 'scripts/assemble-starter.mjs'), starter], { encoding: 'utf8' });
  assert.equal(assembled.status, 0, assembled.stderr);
  const files = readdirSync(starter, { recursive: true }).filter(path => statSync(join(starter, path)).isFile());
  const { lines } = lint(starter, ...files);
  assert.match(lines.at(-1), /^Source lint: clean \(\d+ changed files checked\)$/, lines.join('\n'));
});
