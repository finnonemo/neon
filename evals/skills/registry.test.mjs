import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadImmersiveThemes, resolveColor } from '../../theme/scripts/generate-immersive-themes.mjs';
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

const registryItem = (name) => JSON.parse(read('registry/registry.json')).items.find((item) => item.name === name);

test('the Finnomena logo SVGs are tracked once, in theme/logo/', () => {
  const tracked = execFileSync('git', ['ls-files', '*.svg'], { cwd: root, encoding: 'utf8' }).split('\n').filter((path) => /logo-finnomena/.test(path));
  assert.deepEqual(tracked.sort(), ['icon-dark', 'icon-light', 'text-dark', 'text-light'].map((v) => `theme/logo/logo-finnomena-${v}.svg`));
});

test('the logo item ships the canonical SVGs with the Logo the layouts use, and the base pulls it in', () => {
  const logo = registryItem('logo');
  const svgs = readdirSync(join(root, 'theme/logo')).filter((name) => name.endsWith('.svg')).sort();
  assert.deepEqual(
    logo.files.filter((file) => file.path.endsWith('.svg')).map((file) => [file.path, file.target]),
    svgs.map((name) => [`../theme/logo/${name}`, `src/assets/logo/${name}`]),
  );
  assert.ok(logo.files.some((file) => file.path === 'layout/Logo.tsx' && file.target === 'src/layout/Logo.tsx'));
  // shadcn add @neon/logo outside the base still resolves Logo's color scheme.
  assert.ok(logo.files.some((file) => file.path === 'base/app/colorScheme.ts' && file.target === 'src/app/colorScheme.ts'), 'the logo item ships the color scheme its Logo reads');
  for (const name of svgs) assert.ok(read('registry/layout/Logo.tsx').includes(`../assets/logo/${name}`), `Logo.tsx imports ${name}`);
  const base = registryItem('neon-base');
  for (const name of ['logo', 'layouts']) assert.ok(base.registryDependencies.includes(`{{registry}}/${name}.json`), `the base pulls in ${name}`);
});

// Only the files that touch CDS components or providers are rewritten; the
// layout logic is the starter's, byte for byte (#95).
test('the layouts item carries the starter layout logic unchanged', () => {
  const layouts = registryItem('layouts');
  const unchanged = ['ContentView.tsx', 'InspectorView.tsx', 'layout.css', 'layoutPanes.ts', 'useBreakpointTier.ts'];
  for (const name of unchanged) {
    assert.ok(layouts.files.some((file) => file.path === `layout/${name}` && file.target === `src/layout/${name}`), `layouts ships ${name}`);
    assert.equal(read(`registry/layout/${name}`), read(`templates/vitejs-cds/src/layout/${name}`), `registry/layout/${name} differs from the starter's`);
  }
  assert.ok(layouts.files.some((file) => file.path === '../theme/cds/breakpoints.config.ts' && file.target === 'src/theme/breakpoints.config.ts'));
  const starterLayouts = readdirSync(join(root, 'templates/vitejs-cds/src/layout')).filter((name) => name !== 'Logo.tsx').sort();
  assert.deepEqual(layouts.files.map((file) => file.path.replace(/^layout\//, '')).filter((name) => !name.includes('/')).sort(), starterLayouts, 'every starter layout file has a Neon counterpart');
  assert.ok(layouts.registryDependencies.includes('@neon/logo'));
});

// Theme Briefs (#122) build on the item's name and the generated --immersive-*
// properties, so it ships the generator's own file, not a copy (#96).
test('the Immersive Themes item ships the generated themes, and ImmersiveLayout pulls it in', () => {
  const themes = registryItem('immersive-themes');
  assert.ok(themes, 'registry.json has an immersive-themes item');
  assert.ok(themes.files.some((file) => file.path === '../theme/css/immersive-themes.css' && file.target === 'src/theme/immersive-themes.css'), 'it ships theme/css/immersive-themes.css as generated');
  for (const file of themes.files) assert.ok(read(join('registry', file.path)), `${file.path} exists`);
  assert.ok(registryItem('layouts').registryDependencies.includes('@neon/immersive-themes'), 'the layouts item depends on it');
  const imports = [...read('registry/layout/ImmersiveLayout.tsx').matchAll(/^import\s+["'](\.\.\/theme\/[^"']+)["']/gm)].map((match) => match[1]);
  assert.ok(imports.some((path) => themes.files.some((file) => file.target === `src/${path.replace(/^\.\.\//, '')}`)), 'ImmersiveLayout imports a stylesheet the item ships');
});

// A theme added to immersive-themes.json must reach ImmersiveLayout's type and
// color schemes, each scheme following its canvas: dark where white text
// contrasts more than black (relative luminance below 0.179).
test('ImmersiveLayout names every Immersive Theme, each with the color scheme its canvas implies', () => {
  const { themes, colors } = loadImmersiveThemes();
  const source = read('registry/layout/ImmersiveLayout.tsx');
  const union = [...source.match(/export type ImmersiveTheme = ([^\n]+)/)[1].matchAll(/"(\w+)"/g)].map((match) => match[1]);
  const schemes = Object.fromEntries([...source.match(/THEME_SCHEMES[^=]*= \{([^}]*)\}/)[1].matchAll(/(\w+): "(\w+)"/g)].map((match) => [match[1], match[2]]));
  assert.deepEqual(union.sort(), Object.keys(themes).sort(), 'ImmersiveTheme lists the themes in immersive-themes.json');
  const luminance = (hex) => {
    const [r, g, b] = hex.slice(1).match(/../g).map((v) => parseInt(v, 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const expected = Object.fromEntries(Object.entries(themes).map(([name, theme]) => [name, luminance(resolveColor(colors, theme.canvas)) < 0.179 ? 'dark' : 'light']));
  assert.deepEqual(schemes, expected);
  const css = read('registry/theme/immersive.css');
  for (const [name, scheme] of Object.entries(expected)) {
    if (scheme === 'dark') assert.match(css, new RegExp(`:root\\[data-immersive-theme="${name}"\\] \\{ color-scheme: dark !important; \\}`), `immersive.css sets ${name} dark`);
  }
});

test('the toast takes its theme from AppRoot, never next-themes', () => {
  const { items } = JSON.parse(read(join(BUILD_DIR, 'registry.json')));
  assert.deepEqual(nextThemes(sourceFiles('registry'), items), []);
  assert.ok(read('registry/base/app/AppRoot.tsx').includes('<Toaster theme={colorScheme}'), 'AppRoot passes its color scheme to the Toaster');
  assert.equal(nextThemes([['ui/sonner.tsx', 'import { useTheme } from "next-themes"']]).length, 1);
  assert.equal(nextThemes([], [{ name: 'sonner', dependencies: ['sonner@^2.0.8', 'next-themes'] }]).length, 1);
});
