import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUILD_DIR, bareCnImports, buildRegistry, darkClasses, missingTypeRoles, nextThemes, pinnedRegistryUrl, tabsAsSegmented, unpinnedUrls, weightOverrides } from '../../scripts/lib/registry.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const sourceFiles = (dir) => readdirSync(join(root, dir), { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => relative(root, join(entry.parentPath, entry.name)))
  .filter((path) => !path.startsWith(BUILD_DIR))
  .map((path) => [path, read(path)]);

test('the tracked registry/r/ is a fresh pinned build', async () => {
  const built = await buildRegistry({ root, url: await pinnedRegistryUrl(root) });
  const tracked = readdirSync(join(root, BUILD_DIR)).sort();
  assert.deepEqual(tracked, [...built.keys()].sort(), 'registry/r/ holds exactly the built files; run node scripts/build-registry.mjs');
  for (const [name, content] of built) assert.equal(read(join(BUILD_DIR, name)), content, `registry/r/${name} is stale; run node scripts/build-registry.mjs`);
});

test('two builds are byte-identical', async () => {
  const url = 'http://127.0.0.1:1/r';
  const [first, second] = await Promise.all([buildRegistry({ root, url }), buildRegistry({ root, url })]);
  assert.deepEqual([...first], [...second]);
});

test('every item URL names the pinned release', async () => {
  const pinned = await pinnedRegistryUrl(root);
  const { items } = JSON.parse(read(join(BUILD_DIR, 'registry.json')));
  assert.deepEqual(unpinnedUrls(items, pinned), []);
  assert.deepEqual(unpinnedUrls([{ name: 'base', registryDependencies: ['http://127.0.0.1:4400/r/theme.json'] }], pinned).length, 1);
  assert.deepEqual(unpinnedUrls([{ name: 'base', config: { registries: { '@neon': 'https://raw.githubusercontent.com/finnonemo/neon/main/registry/r/{name}.json' } } }], pinned).length, 1);
  assert.deepEqual(unpinnedUrls([{ name: 'button', registryDependencies: ['@neon/utils'] }], pinned), [], 'namespaced dependencies resolve through the pinned registry');
});

test('registry source imports cn only through lib/utils.ts', () => {
  assert.deepEqual(bareCnImports(sourceFiles('registry')), []);
  assert.equal(bareCnImports([['ui/badge.tsx', 'import { cn } from "cn"']]).length, 1);
  assert.equal(bareCnImports([['ui/badge.tsx', "import { createCn } from 'cn/config'"]]).length, 1);
  assert.deepEqual(bareCnImports([['ui/badge.tsx', 'import { cn } from "@/lib/utils"']]), []);
});

test('registry components use Neon roles, not dark: classes', () => {
  assert.deepEqual(darkClasses(sourceFiles('registry')), []);
  assert.equal(darkClasses([['ui/input.tsx', 'className="dark:bg-input/30 border-input"']]).length, 1);
  assert.deepEqual(darkClasses([['theme/neon.css', '@custom-variant dark (&:where([data-theme="dark"]));']]), [], 'CSS may define the variant');
});

test('every theme.css type role is a text utility cn keeps apart from text colors', () => {
  const inputs = { themeCss: read('theme/css/theme.css'), utils: read('registry/lib/utils.ts'), adapter: read('registry/theme/neon.css') };
  assert.ok([...inputs.themeCss.matchAll(/--fontSize-(\w+):/g)].length >= 13, 'theme.css still names its type roles');
  assert.deepEqual(missingTypeRoles(inputs), []);
  assert.deepEqual(
    missingTypeRoles({ ...inputs, utils: inputs.utils.replace('"legal"', '') }),
    ['lib/utils.ts: cn\'s font-size group lacks legal'],
  );
  assert.deepEqual(
    missingTypeRoles({ ...inputs, adapter: inputs.adapter.replace('--text-caption:', '--text-cap:') }),
    ['theme/neon.css lacks --text-caption'],
  );
});

test('registry components let each type role carry its own weight', () => {
  assert.deepEqual(weightOverrides(sourceFiles('registry')), []);
  assert.equal(weightOverrides([['ui/tag.tsx', 'className="text-label1 font-medium"']]).length, 1);
  assert.equal(weightOverrides([['ui/tabs.tsx', 'className="data-[state=active]:font-semibold"']]).length, 1);
  assert.deepEqual(weightOverrides([['ui/tag.tsx', 'className="font-sans text-label1"']]), [], 'font family is not a weight');
});

test('a segmented control is never built on Tabs', () => {
  assert.deepEqual(tabsAsSegmented(sourceFiles('registry')), []);
  assert.equal(tabsAsSegmented([['ui/segmented.tsx', 'import { Tabs as TabsPrimitive } from "radix-ui"\nexport function Segmented() {}']]).length, 1);
  assert.equal(tabsAsSegmented([['app/Filter.tsx', 'import { Tabs, TabsList } from "@/components/ui/tabs"\n// segmented status filter']]).length, 1);
  assert.deepEqual(tabsAsSegmented([['ui/segmented-control.tsx', 'import { RadioGroup as RadioGroupPrimitive } from "radix-ui"']]), []);
});

test('the toast takes its theme from AppRoot, never next-themes', () => {
  const { items } = JSON.parse(read(join(BUILD_DIR, 'registry.json')));
  assert.deepEqual(nextThemes(sourceFiles('registry'), items), []);
  assert.ok(read('registry/base/app/AppRoot.tsx').includes('<Toaster theme={colorScheme}'), 'AppRoot passes its color scheme to the Toaster');
  assert.equal(nextThemes([['ui/sonner.tsx', 'import { useTheme } from "next-themes"']]).length, 1);
  assert.equal(nextThemes([], [{ name: 'sonner', dependencies: ['sonner@^2.0.8', 'next-themes'] }]).length, 1);
});
