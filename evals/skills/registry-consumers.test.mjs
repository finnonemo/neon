import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { findRegistryConsumers } from '../../scripts/lib/registry-consumers.mjs';

const THEME_CSS = ':root {\n  --color-bgPrimary: rgb(0, 0, 80);\n  --color-bgPrimaryWash: rgb(230, 230, 255);\n  --color-fg: rgb(0, 0, 0);\n  --color-fgInverse: rgb(255, 255, 255);\n}\n';
const NEON_CSS = `@import "./theme.css";
@theme inline {
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-wash: var(--color-bgPrimaryWash);
}
:root {
  --primary: var(--color-bgPrimary);
  --primary-foreground: var(--color-fgInverse);
  --primary-disabled: color-mix(in srgb, var(--primary) 75%, white);
}
:root[data-theme="dark"] { --primary-foreground: var(--color-fg); }
@layer base {
  body { @apply bg-primary text-foreground; }
}
`;

const item = (name, ...paths) => ({ name, type: 'registry:ui', files: paths.map(path => ({ path, type: 'registry:ui' })) });

async function fakeRegistry(t, files, items) {
  const root = await mkdtemp(join(tmpdir(), 'neon-registry-consumers-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [path, content] of Object.entries({
    'theme/css/theme.css': THEME_CSS,
    'registry/theme/neon.css': NEON_CSS,
    'registry/registry.json': JSON.stringify({ name: 'neon', items: [item('theme', '../theme/css/theme.css', 'theme/neon.css'), ...items] }),
    ...files,
  })) {
    await mkdir(join(root, path, '..'), { recursive: true });
    await writeFile(join(root, path), content);
  }
  return join(root, 'registry');
}

const summary = found => found.map(({ token, item, file, line, via }) => `${token} ${item} ${file}:${line} ${via}`).sort();

test('follows a token through slot aliases to the utilities components use', async t => {
  const registry = await fakeRegistry(t, {
    'registry/ui/button.tsx': 'const a = "rounded-full";\nconst b = "bg-primary text-label1 hover:bg-primary/90 focus-visible:ring-ring/50";\n',
    'registry/ui/link.tsx': 'const c = "disabled:bg-primary-disabled";\n',
  }, [item('button', 'ui/button.tsx'), item('link', 'ui/link.tsx')]);
  assert.deepEqual(summary(await findRegistryConsumers(registry, ['bgPrimary'])), [
    'bgPrimary button registry/ui/button.tsx:2 bg-primary',
    'bgPrimary theme registry/theme/neon.css:14 bg-primary',
  ]);
});

test('counts aliases from every block, dark included, and direct var() use', async t => {
  const registry = await fakeRegistry(t, {
    'registry/ui/tag.tsx': 'const a = "text-primary-foreground";\nconst b = "[color:var(--color-fg)]";\n',
  }, [item('tag', 'ui/tag.tsx')]);
  const found = await findRegistryConsumers(registry, ['fg']);
  assert.deepEqual(summary(found), [
    'fg tag registry/ui/tag.tsx:1 text-primary-foreground',
    'fg tag registry/ui/tag.tsx:2 --color-fg',
  ]);
  assert.match(found.find(m => m.line === 2).snippet, /\[color:var\(--color-fg\)\]/);
});

test('matches whole names only and never counts a declaration as a use', async t => {
  const registry = await fakeRegistry(t, {
    'registry/ui/wash.tsx': 'const a = "bg-wash";\nconst b = "bg-primary-foreground";\n',
    'registry/ui/local.css': '.x {\n  --local: var(--primary);\n}\n',
  }, [item('wash', 'ui/wash.tsx', 'ui/local.css')]);
  assert.deepEqual(summary(await findRegistryConsumers(registry, ['bgPrimary'])), [
    'bgPrimary theme registry/theme/neon.css:14 bg-primary',
  ]);
  assert.deepEqual(summary(await findRegistryConsumers(registry, ['bgPrimaryWash'])), [
    'bgPrimaryWash wash registry/ui/wash.tsx:1 bg-wash',
  ]);
});

test('a width-only class takes its color from the base layer default', async t => {
  const registry = await fakeRegistry(t, {
    'theme/css/theme.css': ':root {\n  --color-bgLine: rgb(200, 200, 200);\n  --color-bgLinePrimary: rgb(0, 0, 200);\n}\n',
    'registry/theme/neon.css': '@theme inline {\n  --color-border: var(--border);\n  --color-ring: var(--ring);\n}\n:root {\n  --border: var(--color-bgLine);\n  --ring: var(--color-bgLinePrimary);\n}\n* { @apply border-border outline-ring/50; }\n',
    'registry/ui/nav.tsx': 'const a = "border-t bg-primary";\nconst b = "divide-y-2 rounded-t";\nconst c = "focus-visible:outline-2";\nconst d = "border border-ring";\n',
  }, [item('nav', 'ui/nav.tsx')]);
  assert.deepEqual(summary(await findRegistryConsumers(registry, ['bgLine'])), [
    'bgLine nav registry/ui/nav.tsx:1 border-t',
    'bgLine nav registry/ui/nav.tsx:2 divide-y-2',
    'bgLine theme registry/theme/neon.css:9 border-border',
  ]);
  assert.deepEqual(summary(await findRegistryConsumers(registry, ['bgLinePrimary'])), [
    'bgLinePrimary nav registry/ui/nav.tsx:3 outline-2',
    'bgLinePrimary nav registry/ui/nav.tsx:4 border-ring',
    'bgLinePrimary theme registry/theme/neon.css:9 outline-ring',
  ]);
});

test('an unknown token has no consumers', async t => {
  const registry = await fakeRegistry(t, {}, []);
  assert.deepEqual(await findRegistryConsumers(registry, ['blue60']), []);
});

test("the repository's registry: Button reads bgLineHeavy, Input its invalid stroke through a slot, Button the headline role", async () => {
  const registry = fileURLToPath(new URL('../../registry', import.meta.url));
  const items = async token => new Set((await findRegistryConsumers(registry, [token])).map(m => m.item));
  assert.ok((await items('bgLineHeavy')).has('button'));
  // Checkbox took Core's Checkbox (#261): its Box has no stroke, so it reads no bgLineHeavy but the icon role.
  assert.ok(!(await items('bgLineHeavy')).has('checkbox'));
  assert.ok((await items('fgIcon')).has('checkbox'));
  // Calendar took Core's Date and time (#275): a range's band is the highlight role, the picked day's
  // disc the role the switch's On track reads, and no day takes the primary fill.
  assert.deepEqual([...await items('bgHighlight')], ['calendar']);
  assert.ok((await items('bgToggleOn')).has('calendar'));
  assert.ok(!(await items('bgPrimary')).has('calendar'));
  // Date picker took Core's Date picker (#276): its field is the Field roles with no stroke at rest, its
  // glyph the icon role, and its text no muted ink.
  for (const token of ['bgField', 'bgFieldHover', 'bgFieldDisabled', 'fgPlaceholder', 'fgIcon', 'fgIconDisabled']) assert.ok((await items(token)).has('date-picker'), token);
  assert.ok(!(await items('fgMuted')).has('date-picker'));
  // Input took Core's Field (#216): it reads no bgLineHeavy, and its invalid stroke is the invalid slot.
  assert.ok(!(await items('bgLineHeavy')).has('input'));
  assert.ok((await items('bgLineNegative')).has('input'));
  assert.ok((await items('fontSize-headline')).has('button'));
  assert.ok(!(await items('fontSize-headline')).has('immersive-themes'));
});
