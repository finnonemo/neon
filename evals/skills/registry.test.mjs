import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expansionItem, expansionItems } from '../templates/expansion.mjs';
import { loadImmersiveThemes, resolveColor } from '../../theme/scripts/generate-immersive-themes.mjs';
import { contrast } from '../../scripts/lib/colors.mjs';
import { BUILD_DIR, bareCnImports, browserSuiteItems, buildRegistry, darkClasses, unguardedItemRoles, missingTypeRoles, nextThemes, pinnedRegistryUrl, supportingProblems, tabsAsSegmented, themeBriefItemProblems, undeclaredSiblings, unmeasuredComponents, unpinnedUrls, unreachedItems, weightOverrides } from '../../scripts/lib/registry.mjs';

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

test('the browser suite installs every registry item', () => {
  const { items } = JSON.parse(read('registry/registry.json'));
  assert.deepEqual(unreachedItems(items, browserSuiteItems(items)), [], 'add the item kind to browserSuiteItems, or make neon-base depend on it');
  const extra = { name: 'extra', type: 'registry:item', files: [] };
  assert.deepEqual(unreachedItems([...items, extra], browserSuiteItems(items)), ['extra'], 'an item outside init and the additions is reported');
  assert.deepEqual(unreachedItems([...items, extra, { name: 'needs-extra', type: 'registry:ui', registryDependencies: ['@neon/extra'], files: [] }], [...browserSuiteItems(items), 'needs-extra']), [], 'a dependency of an added item is reached');
  // A Supporting item arrives only through the item that uses it, as `shadcn add` gives it to an app.
  assert.deepEqual(browserSuiteItems([{ name: 'toggle', type: 'registry:ui', meta: { supporting: true } }, { name: 'toggle-group', type: 'registry:ui' }]), ['toggle-group']);
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

test('a component reads a role named after itself only with a fallback', () => {
  assert.deepEqual(unguardedItemRoles(sourceFiles('registry')), []);
  assert.equal(unguardedItemRoles([['ui/sheet.tsx', 'className="border-(length:--sheet-border-width)"']]).length, 1);
  assert.equal(unguardedItemRoles([['ui/sheet.tsx', 'style={{ width: "var(--sheet-width)" }}']]).length, 1);
  assert.deepEqual(unguardedItemRoles([['ui/sheet.tsx', 'className="border-[length:var(--sheet-border-width,0px)]"']]), []);
  assert.deepEqual(unguardedItemRoles([['ui/sheet.tsx', 'className="rounded-(--borderRadius-600)"']]), [], 'base theme roles need none');
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

// An item that builds on another Neon item (input-group on button, input and
// textarea; the base's AppRoot on sonner and tooltip) must pull it in, or
// shadcn add leaves a broken import or installs stock shadcn's.
test('every registry item that imports a Neon component declares it as a registry dependency', () => {
  const { items } = JSON.parse(read('registry/registry.json'));
  assert.deepEqual(undeclaredSiblings(items, (path) => read(join('registry', path))), []);
  const item = (type, registryDependencies) => ({ name: 'input-group', type, registryDependencies, files: [{ path: 'ui/input-group.tsx' }] });
  const source = (quote) => `import { Button } from ${quote}@/components/ui/button${quote}\nimport { Input } from ${quote}@/components/ui/input${quote}`;
  assert.deepEqual(undeclaredSiblings([item('registry:ui', ['@neon/utils', '@neon/button'])], () => source('"')), ['input-group imports input without declaring it']);
  assert.deepEqual(undeclaredSiblings([item('registry:ui', ['@neon/utils', '@neon/button'])], () => source("'")), ['input-group imports input without declaring it'], 'single-quoted imports count');
  assert.deepEqual(undeclaredSiblings([item('registry:item', ['@neon/button'])], () => source("'")), ['input-group imports input without declaring it'], 'every item type is checked, not only components');
  assert.deepEqual(undeclaredSiblings([item('registry:base', ['{{registry}}/button.json', '{{registry}}/input.json'])], () => source("'")), [], 'a {{registry}} URL dependency declares the item');
});

// The components the approval and extras screens measure. Every later
// component is measured on the expansion screen (#164), unless it only
// supports another item (meta.supporting).
const SCREEN_MEASURED = ['button', 'input', 'textarea', 'label', 'checkbox', 'avatar', 'tag', 'list-row', 'segmented-control', 'tooltip', 'sonner', 'popover', 'select', 'dropdown-menu', 'dialog', 'calendar', 'date-picker', 'table'];

test('every Neon component is measured against its Counterpart', () => {
  const { items } = JSON.parse(read('registry/registry.json'));
  const expansion = {
    screens: (name) => expansionItems.find((item) => item.name === name)?.screens.length ?? 0,
    fixture: (path) => existsSync(join(root, 'evals/templates/fixtures', path)),
  };
  assert.deepEqual(unmeasuredComponents(items, SCREEN_MEASURED, expansion), []);

  const combobox = { name: 'combobox', type: 'registry:ui', files: [] };
  const fake = (screens, fixtures) => ({ screens: (name) => screens[name] ?? 0, fixture: (path) => fixtures.includes(path) });
  const both = ['expansion/combobox.tsx', 'neon/expansion/combobox.tsx'];
  assert.deepEqual(unmeasuredComponents([combobox], [], fake({ combobox: 1 }, both)), []);
  assert.deepEqual(unmeasuredComponents([combobox], [], fake({}, both)), ['combobox: no screen in evals/templates/expansion/combobox.mjs']);
  assert.deepEqual(unmeasuredComponents([combobox], [], fake({ combobox: 1 }, [both[0]])), ['combobox: no evals/templates/fixtures/neon/expansion/combobox.tsx']);
  assert.deepEqual(unmeasuredComponents([combobox], [], fake({ combobox: 1 }, [both[1]])), ['combobox: no evals/templates/fixtures/expansion/combobox.tsx']);
  assert.deepEqual(unmeasuredComponents([combobox], ['combobox'], fake({}, [])), [], 'a component the approval or extras screen measures');
  assert.deepEqual(unmeasuredComponents([{ ...combobox, meta: { supporting: true } }], [], fake({}, [])), [], 'a supporting component');
  assert.deepEqual(unmeasuredComponents([{ ...combobox, type: 'registry:item' }], [], fake({}, [])), [], 'not a component');
});

// Supporting items (ADR 0008) and the items that pull them in. A Supporting
// item has no Counterpart, so unmeasuredComponents skips it: the marker is
// allowed only on the items named here, each declared by its users and never
// measured on a screen of its own.
const SUPPORTING = { toggle: ['toggle-group'] };

test('every Supporting item is marked, pulled in by the items that use it, and measured only through them', () => {
  const { items } = JSON.parse(read('registry/registry.json'));
  const expansion = {
    screens: (name) => expansionItems.find((item) => item.name === name)?.screens.length ?? 0,
    fixture: (path) => existsSync(join(root, 'evals/templates/fixtures', path)),
  };
  assert.deepEqual(supportingProblems(items, SUPPORTING, expansion), []);

  // The real registry, changed one way at a time.
  const changed = (name, change) => items.map((item) => (item.name === name ? change(structuredClone(item)) : item));
  const unmarked = changed('toggle', (item) => { delete item.meta; return item; });
  assert.deepEqual(supportingProblems(unmarked, SUPPORTING, expansion), ['toggle: not marked meta.supporting']);
  assert.ok(unmeasuredComponents(unmarked, SCREEN_MEASURED, expansion).length, 'an unmarked toggle is a component with no Counterpart screen');
  const undeclared = changed('toggle-group', (item) => ({ ...item, registryDependencies: item.registryDependencies.filter((dependency) => dependency !== '@neon/toggle') }));
  assert.deepEqual(supportingProblems(undeclared, SUPPORTING, expansion), ['toggle-group does not declare @neon/toggle']);

  const fake = (screens, fixtures) => ({ screens: (name) => screens[name] ?? 0, fixture: (path) => fixtures.includes(path) });
  const skeleton = { name: 'skeleton', type: 'registry:ui', meta: { supporting: true }, files: [] };
  const sidebar = { name: 'sidebar', type: 'registry:ui', registryDependencies: ['@neon/utils', '@neon/skeleton'], files: [] };
  assert.deepEqual(supportingProblems([skeleton, sidebar], { skeleton: ['sidebar'] }, fake({}, [])), []);
  assert.deepEqual(supportingProblems([skeleton, sidebar], {}, fake({}, [])), ['skeleton: marked meta.supporting but no item is named to use it'], 'the marker cannot excuse a component from measurement');
  assert.deepEqual(supportingProblems([sidebar], { skeleton: ['sidebar'] }, fake({}, [])), ['skeleton: not in registry.json']);
  assert.deepEqual(supportingProblems([{ ...skeleton, meta: { supporting: 'yes' } }, sidebar], { skeleton: ['sidebar'] }, fake({}, [])), ['skeleton: not marked meta.supporting']);
  assert.deepEqual(supportingProblems([skeleton, sidebar], { skeleton: ['sidebar', 'carousel'] }, fake({}, [])), ['carousel: not in registry.json']);
  assert.deepEqual(supportingProblems([skeleton, sidebar], { skeleton: ['sidebar'] }, fake({ skeleton: 1 }, ['expansion/skeleton.tsx', 'neon/expansion/skeleton.tsx'])), [
    'skeleton: a Supporting item has no screen of its own; remove evals/templates/expansion/skeleton.mjs',
    'skeleton: a Supporting item has no fixture of its own; remove evals/templates/fixtures/expansion/skeleton.tsx',
    'skeleton: a Supporting item has no fixture of its own; remove evals/templates/fixtures/neon/expansion/skeleton.tsx',
  ]);
});

test('an expansion module without a screen fails loudly, and its screens take the expansion defaults', () => {
  assert.throws(() => expansionItem('combobox', {}), /expansion\/combobox\.mjs exports no screens/);
  assert.throws(() => expansionItem('combobox', { screens: [] }), /exports no screens/);
  const [screen] = expansionItem('combobox', { screens: [{ targets: {}, gaps: [] }] }).screens;
  assert.deepEqual([screen.name, screen.query], ['expansion-combobox', 'layout=expansion']);
  const [open] = expansionItem('combobox', { screens: [{ name: 'expansion-combobox-open', targets: {}, gaps: [] }] }).screens;
  assert.equal(open.name, 'expansion-combobox-open', 'an entry may name itself');
});

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

// Framework-free layout geometry stays shared. Pane views render each base's
// own borders and are checked by the browser geometry baseline.
test('the layouts item shares framework-free starter geometry and includes every layout', () => {
  const layouts = registryItem('layouts');
  const unchanged = ['layout.css', 'layoutPanes.ts', 'useBreakpointTier.ts'];
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

// On a themed ImmersiveLayout every fill a component paints must come from the
// theme: an app slot left behind drew white text on Neon's light grey on Ultra.
// Components put the theme's text (foreground) on secondary, muted and accent,
// as well as the slot's own foreground, so each pair must read in every theme.
test('the Immersive Themes adapter maps every fill the components paint, readable in every theme', () => {
  const adapter = read('registry/theme/immersive.css');
  const block = adapter.match(/:root\[data-immersive-theme\],\s*\[data-immersive-theme\] \{([^}]*)\}/)[1];
  const mapped = Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, slot, value]) => [slot, value.trim()]));
  // Slots behind a bg- utility: @theme inline's --color-<name>: var(--<slot>), skipping theme.css roles.
  const slots = Object.fromEntries([...read('registry/theme/neon.css').matchAll(/--color-([\w-]+):\s*var\(--(?!color-)([\w-]+)\)/g)].map(([, name, slot]) => [name, slot]));
  const painted = new Set(sourceFiles('registry/ui').flatMap(([, source]) => [...source.matchAll(/\bbg-([a-z-]+)/g)].map((match) => match[1])).filter((name) => slots[name]).map((name) => slots[name]));
  // Borders, inputs and destructive keep the app's roles; immersive.css says so.
  const kept = ['border', 'input', 'destructive', 'destructive-disabled'];
  assert.deepEqual([...painted].filter((slot) => !kept.includes(slot) && !mapped[slot]).sort(), [], 'immersive.css maps every slot a registry component fills');
  for (const slot of ['secondary', 'muted', 'accent', 'inverse']) assert.ok(mapped[slot], `immersive.css maps --${slot}`);
  // Components read inverse through the slot, never theme.css's role, so the adapter reaches the pressed Toggle.
  assert.deepEqual(sourceFiles('registry/ui').filter(([, source]) => /--color-(bgInverse|fgInverse|bgSecondary|bgAlternate)\b/.test(source)).map(([path]) => path), []);

  const generated = read('theme/css/immersive-themes.css');
  const declared = (selector) => Object.fromEntries([...generated.match(new RegExp(`${selector.replace(/[[\]]/g, '\\$&')} \\{([^}]*)\\}`))[1].matchAll(/--immersive-([\w-]+):\s*(#[0-9a-f]{6})/g)].map(([, key, hex]) => [key, hex]));
  const shared = declared('[data-immersive-theme]');
  const { themes } = loadImmersiveThemes();
  const pairs = { secondary: ['secondary-foreground', 'foreground'], muted: ['foreground', 'muted-foreground'], accent: ['accent-foreground', 'foreground', 'secondary-foreground'], inverse: ['inverse-foreground'] };
  for (const name of Object.keys(themes)) {
    const vars = { ...shared, ...declared(`[data-immersive-theme="${name}"]`) };
    const value = (slot) => {
      const ref = mapped[slot]?.match(/^var\(--immersive-([\w-]+)\)$/)?.[1];
      assert.ok(ref && vars[ref], `${name}: --${slot} is a plain --immersive-* property the theme declares`);
      return vars[ref];
    };
    for (const [fill, texts] of Object.entries(pairs)) {
      for (const text of texts) {
        const ratio = contrast(value(text), value(fill));
        assert.ok(ratio >= 4.5, `${name}: --${text} on --${fill} is ${ratio.toFixed(2)}:1`);
      }
    }
    // The guideline allows text in White or Navy only.
    for (const text of new Set(Object.values(pairs).flat())) assert.ok(['#ffffff', '#01172b'].includes(value(text)), `${name}: --${text} is White or Navy`);
  }
});

// A themed ImmersiveLayout scrolls the window, so its content must sit in no
// scroll container of its own, or a pinned (sticky) section never engages.
// Other layouts keep InspectorView's independently scrollable body.
test('themed ImmersiveLayout content sits in no scroll container; other layouts keep the pane scroll', () => {
  const inspector = read('registry/layout/InspectorView.tsx');
  assert.match(inspector, /scroll = "pane"/, 'InspectorView scrolls its own body by default');
  const body = inspector.match(/style=\{scroll === "pane" \? (\{[^}]*\}) : (\{[^}]*\})\}>\{children\}/);
  assert.ok(body, 'InspectorView styles its body by scroll mode');
  assert.match(body[1], /overflowY: "auto"/, 'the pane mode scrolls');
  assert.doesNotMatch(body[2], /overflow/i, 'the window mode is no scroll container');
  assert.match(read('registry/layout/ImmersiveLayout.tsx'), /<InspectorView [^>]*scroll=\{immersiveTheme \? "window" : "pane"\}/, 'ImmersiveLayout scrolls the window only when themed');
  for (const layout of ['SimpleLayout', 'ResponsivePanes']) assert.doesNotMatch(read(`registry/layout/${layout}.tsx`), /scroll="window"/, `${layout} keeps the pane scroll`);
});

test('the toast takes its theme from AppRoot, never next-themes', () => {
  const { items } = JSON.parse(read(join(BUILD_DIR, 'registry.json')));
  assert.deepEqual(nextThemes(sourceFiles('registry'), items), []);
  assert.ok(read('registry/base/app/AppRoot.tsx').includes('<Toaster theme={colorScheme}'), 'AppRoot passes its color scheme to the Toaster');
  assert.equal(nextThemes([['ui/sonner.tsx', 'import { useTheme } from "next-themes"']]).length, 1);
  assert.equal(nextThemes([], [{ name: 'sonner', dependencies: ['sonner@^2.0.8', 'next-themes'] }]).length, 1);
});

// Theme Brief items (#122): one Markdown file each, added to the employee app's docs/theme-briefs/.
const BRIEF_ITEM = {
  name: 'theme-brief-club-run',
  type: 'registry:item',
  title: 'Club · Run',
  description: 'Race day on an open canvas, with every member invited to the start line',
  categories: ['theme-brief', 'club'],
  meta: { immersiveTheme: 'club', briefName: 'Run', presets: { occasion: 'run', layout: 'event-landing', imagery: 'people-in-action' }, status: 'provisional' },
  registryDependencies: ['@neon/theme', '@neon/immersive-themes'],
  files: [{ path: 'theme-briefs/club-run.md', type: 'registry:file', target: '~/docs/theme-briefs/club-run.md' }],
};
const BRIEF_MARKDOWN = '# Finnomena Club · Run — Theme Brief\n> Race day on an open canvas, with every member invited to the start line\n\n**Theme:** light\n';
const briefInputs = (markdown = BRIEF_MARKDOWN) => new Map([['club-run', {
  label: 'Club',
  markdown,
  picks: { theme: 'club', briefName: 'Run', presets: { occasion: 'run', layout: 'event-landing', imagery: 'people-in-action' }, brandPattern: { colourway: 'accent', ground: 50 } },
}]]);

test('a Theme Brief item carries its title, tagline, categories, meta, dependencies and docs target', () => {
  assert.deepEqual(themeBriefItemProblems([BRIEF_ITEM], briefInputs()), []);
  const refused = (change, expected) => assert.deepEqual(themeBriefItemProblems([{ ...structuredClone(BRIEF_ITEM), ...change }], briefInputs()), [expected]);
  refused({ type: 'registry:ui' }, 'theme-brief-club-run: type must be "registry:item"');
  refused({ title: 'Club Run' }, 'theme-brief-club-run: title must be "Club · Run"');
  refused({ description: 'Race day' }, "theme-brief-club-run: description must be the brief's tagline");
  refused({ categories: ['theme-brief'] }, 'theme-brief-club-run: categories must be ["theme-brief","club"]');
  refused({ meta: { ...BRIEF_ITEM.meta, presets: { ...BRIEF_ITEM.meta.presets, layout: 'editorial' } } }, 'theme-brief-club-run: meta must be {"immersiveTheme":"club","briefName":"Run","presets":{"occasion":"run","layout":"event-landing","imagery":"people-in-action"},"status":"provisional"}');
  refused({ registryDependencies: ['@neon/theme'] }, 'theme-brief-club-run: registryDependencies must include @neon/immersive-themes');
  refused({ files: [{ ...BRIEF_ITEM.files[0], target: 'src/docs/club-run.md' }] }, 'theme-brief-club-run: its one file must be theme-briefs/club-run.md, a registry:file targeting ~/docs/theme-briefs/club-run.md');
  refused({ files: [...BRIEF_ITEM.files, BRIEF_ITEM.files[0]] }, 'theme-brief-club-run: its one file must be theme-briefs/club-run.md, a registry:file targeting ~/docs/theme-briefs/club-run.md');
  assert.deepEqual(themeBriefItemProblems([{ ...BRIEF_ITEM, name: 'theme-brief-ultra-run' }], briefInputs()), ['theme-brief-ultra-run: no picks file and Markdown for ultra-run']);
  assert.deepEqual(themeBriefItemProblems([{ name: 'button', type: 'registry:ui' }], new Map()), [], 'other items are not briefs');
});

// Every published brief's item, read from the repository: empty until the first briefs are drafted.
test('every Theme Brief item in the registry matches its picks file and Markdown', () => {
  const { themes } = JSON.parse(read('theme/immersive-themes.json'));
  const items = JSON.parse(read('registry/registry.json')).items.filter((item) => item.name.startsWith('theme-brief-'));
  const briefs = new Map(items.map((item) => item.name.slice('theme-brief-'.length)).map((name) => {
    const picks = JSON.parse(read(`theme-briefs/picks/${name}.json`));
    return [name, { picks, label: themes[picks.theme].label, markdown: read(`registry/theme-briefs/${name}.md`) }];
  }));
  assert.deepEqual(themeBriefItemProblems(items, briefs), []);
});

test('a Theme Brief item builds byte-identically at the pinned release, with its Markdown inlined at its docs target', async (t) => {
  const temp = mkdtempSync(join(tmpdir(), 'neon-brief-registry-'));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  mkdirSync(join(temp, 'registry/theme-briefs'), { recursive: true });
  writeFileSync(join(temp, 'registry/registry.json'), JSON.stringify({ name: 'neon', homepage: 'https://example.invalid', items: [BRIEF_ITEM] }));
  writeFileSync(join(temp, 'registry/theme-briefs/club-run.md'), BRIEF_MARKDOWN);
  const url = await pinnedRegistryUrl(root);
  const [first, second] = await Promise.all([buildRegistry({ root: temp, url }), buildRegistry({ root: temp, url })]);
  assert.deepEqual([...first], [...second]);
  const built = JSON.parse(first.get('theme-brief-club-run.json'));
  assert.deepEqual(built.files, [{ path: 'theme-briefs/club-run.md', content: BRIEF_MARKDOWN, type: 'registry:file', target: '~/docs/theme-briefs/club-run.md' }]);
  assert.deepEqual([built.categories, built.meta, built.registryDependencies], [BRIEF_ITEM.categories, BRIEF_ITEM.meta, BRIEF_ITEM.registryDependencies]);
});
