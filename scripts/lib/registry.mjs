// The Neon registry: registry/registry.json lists the items, and the build
// inlines each item's files into registry/r/<name>.json, the format `shadcn
// add` reads. Item URLs in the source are written {{registry}}; the tracked
// build pins them to the release tag, and the browser runner builds against a
// local server instead. Built here rather than with `shadcn build` so
// validation needs no network or packages.
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';
export const REGISTRY_DIR = 'registry';
export const BUILD_DIR = 'registry/r';

/** The base URL tracked items use: raw files at the release tag for plugin.json's version. */
export async function pinnedRegistryUrl(root) {
  const { version } = JSON.parse(await readFile(join(root, '.claude-plugin/plugin.json'), 'utf8'));
  return `https://raw.githubusercontent.com/finnonemo/neon/neon--v${version}/${BUILD_DIR}`;
}

/** The base URL `install.mjs --new` and `--add` read: `registry`, then `env.NEON_REGISTRY_URL`, then the pinned release. */
export async function neonRegistryUrl({ registry, env = process.env, root }) {
  return registry ?? env.NEON_REGISTRY_URL ?? (await pinnedRegistryUrl(root));
}

/** Reads one registry file as JSON. */
export async function fetchRegistryJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return response.json();
}

/** Built files by name: one JSON per item plus registry.json, each ending in a newline. */
export async function buildRegistry({ root, url }) {
  const source = await readFile(join(root, REGISTRY_DIR, 'registry.json'), 'utf8');
  const registry = JSON.parse(source.replaceAll('{{registry}}', url));
  const built = new Map([['registry.json', `${JSON.stringify(registry, null, 2)}\n`]]);
  for (const item of registry.items) {
    const files = await Promise.all(item.files.map(async (file) => ({
      path: file.path,
      content: await readFile(resolve(root, REGISTRY_DIR, file.path), 'utf8'),
      type: file.type,
      ...(file.target ? { target: file.target } : {}),
    })));
    built.set(`${item.name}.json`, `${JSON.stringify({ $schema: ITEM_SCHEMA, ...item, files }, null, 2)}\n`);
  }
  return built;
}

// Guards. Each takes file contents, so the tests can feed failing fixtures.

/** Imports of the bare `cn` package, which skip Neon's type roles. Only lib/utils.ts may import cn/config. */
export function bareCnImports(files) {
  const problems = [];
  for (const [path, content] of files) {
    if (/from\s+["']cn["']/.test(content)) problems.push(`${path} imports cn from the bare "cn" package; import it from "@/lib/utils"`);
    if (/from\s+["']cn\/config["']/.test(content) && !path.endsWith('lib/utils.ts')) problems.push(`${path} imports cn/config outside lib/utils.ts`);
  }
  return problems;
}

/**
 * A component reads a role named after itself (--sheet-border-width) only
 * with a fallback: shadcn add @neon/<item> does not pull the theme, so an app
 * whose neon.css predates the role would get border-width's initial "medium".
 */
export function unguardedItemRoles(files) {
  const problems = [];
  for (const [path, content] of files) {
    const item = path.match(/(?:^|\/)ui\/([\w-]+)\.tsx$/)?.[1];
    if (!item) continue;
    const role = new RegExp(`(?:var\\(|\\((?:\\w+:)?)(--${item}-[\\w-]+)\\)`, 'g');
    for (const match of content.matchAll(role)) problems.push(`${path} reads ${match[1]} without a fallback; write var(${match[1]},<value>)`);
  }
  return problems;
}

/** dark: classes in component source. Neon roles switch with data-theme, so a dark: class is stock shadcn's own opinion. */
export function darkClasses(files) {
  const problems = [];
  for (const [path, content] of files) {
    if (!/\.(tsx?|jsx?)$/.test(path)) continue;
    for (const match of content.matchAll(/(?<![\w-])dark:[\w[\]/.()-]+/g)) problems.push(`${path} uses ${match[0]}; use Neon roles instead of dark: classes`);
  }
  return problems;
}

/** Item and registry URLs that point anywhere but the pinned release. */
export function unpinnedUrls(items, pinned) {
  const problems = [];
  for (const item of items) {
    const urls = [...(item.registryDependencies ?? []), ...Object.values(item.config?.registries ?? {})]
      .filter((value) => /^https?:/.test(value));
    for (const url of urls) if (!url.startsWith(`${pinned}/`)) problems.push(`${item.name} names ${url}, not the pinned ${pinned}`);
  }
  return problems;
}

/** Type roles theme.css defines that cn's font-size group or the text-<role> utilities leave out. */
export function missingTypeRoles({ themeCss, utils, adapter }) {
  const roles = [...new Set([...themeCss.matchAll(/--fontSize-(\w+):/g)].map((match) => match[1]))];
  const group = utils.match(/"font-size":\s*\[\{\s*text:\s*\[([^\]]*)\]/)?.[1] ?? '';
  const listed = new Set([...group.matchAll(/["'](\w+)["']/g)].map((match) => match[1]));
  const problems = [];
  for (const role of roles) {
    if (!listed.has(role)) problems.push(`lib/utils.ts: cn's font-size group lacks ${role}`);
    if (!adapter.includes(`--text-${role}:`)) problems.push(`theme/neon.css lacks --text-${role}`);
  }
  return problems;
}

/** Weight utilities beside type roles: a component's font-medium beats text-label1's own weight (spike trap 2). */
export function weightOverrides(files) {
  const problems = [];
  for (const [path, content] of files) {
    if (!/\.(tsx?|jsx?)$/.test(path)) continue;
    for (const match of content.matchAll(/(?<![\w-])(?:[\w-]+:)*font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)(?![\w-])/g)) {
      problems.push(`${path} uses ${match[0]}; each type role carries its own weight`);
    }
  }
  return problems;
}

/** Tabs standing in for a segmented control: tab roles without tab panels fail axe (spike trap 8). */
export function tabsAsSegmented(files) {
  const problems = [];
  for (const [path, content] of files) {
    const tabs = /\bTabs\b[^;]*from\s+["'](?:radix-ui|@radix-ui\/react-tabs|@\/components\/ui\/tabs)["']/.test(content);
    if (tabs && /segment/i.test(content)) problems.push(`${path} builds a segmented control on Tabs; use the segmented-control item (a radio group)`);
  }
  return problems;
}

/** next-themes in a registry item: AppRoot owns the color scheme and passes it to the Toaster (spike trap 9). */
export function nextThemes(files, items = []) {
  const problems = [];
  for (const [path, content] of files) {
    if (/from\s+["']next-themes["']/.test(content)) problems.push(`${path} imports next-themes; take the color scheme from AppRoot`);
  }
  for (const item of items) {
    if ((item.dependencies ?? []).some((dep) => /^next-themes(@|$)/.test(dep))) problems.push(`${item.name} depends on next-themes`);
  }
  return problems;
}

/**
 * Neon components an item's files import without the item declaring them, so
 * shadcn add leaves a broken import or installs stock shadcn's. Every item
 * type counts (the base's AppRoot, the layouts); a dependency is declared as
 * @neon/<name> or {{registry}}/<name>.json.
 */
export function undeclaredSiblings(items, readFile) {
  const problems = [];
  for (const item of items) {
    const declared = new Set((item.registryDependencies ?? []).map((dependency) => dependency.split('/').pop().replace(/\.json$/, '')));
    for (const file of item.files ?? []) {
      for (const [, name] of readFile(file.path).matchAll(/from\s+["']@\/components\/ui\/([a-z-]+)["']/g)) {
        if (!declared.has(name)) problems.push(`${item.name} imports ${name} without declaring it`);
      }
    }
  }
  return problems;
}

/**
 * Components the CDS-match suite never measures (#164: no component without a
 * Counterpart). A registry:ui item is measured when the approval or extras
 * screen does (`screenMeasured`), when it only supports another item
 * (meta.supporting), or when the expansion screen has its module with a screen
 * and both fixtures. `expansion.screens(name)` counts the screens in
 * evals/templates/expansion/<name>.mjs; `expansion.fixture(path)` says whether
 * evals/templates/fixtures/<path> exists.
 */
export function unmeasuredComponents(items, screenMeasured, expansion) {
  const problems = [];
  for (const item of items) {
    if (item.type !== 'registry:ui' || screenMeasured.includes(item.name) || item.meta?.supporting) continue;
    if (!expansion.screens(item.name)) problems.push(`${item.name}: no screen in evals/templates/expansion/${item.name}.mjs`);
    for (const path of [`expansion/${item.name}.tsx`, `neon/expansion/${item.name}.tsx`]) {
      if (!expansion.fixture(path)) problems.push(`${item.name}: no evals/templates/fixtures/${path}`);
    }
  }
  return problems;
}

/**
 * Supporting items (ADR 0008) against `expected`, name → the items that use
 * it. Each is marked meta.supporting, which also keeps it off the component
 * lists; each user declares it as @neon/<name>, so shadcn add pulls it in; and
 * it is measured only through its users, with no screen or fixture of its own.
 * The marker on any other item is a problem, since unmeasuredComponents skips it.
 */
export function supportingProblems(items, expected, expansion) {
  const byName = new Map(items.map((item) => [item.name, item]));
  const problems = [];
  for (const [name, users] of Object.entries(expected)) {
    const item = byName.get(name);
    if (!item) problems.push(`${name}: not in registry.json`);
    else if (item.meta?.supporting !== true) problems.push(`${name}: not marked meta.supporting`);
    for (const user of users) {
      if (!byName.has(user)) problems.push(`${user}: not in registry.json`);
      else if (!(byName.get(user).registryDependencies ?? []).includes(`@neon/${name}`)) problems.push(`${user} does not declare @neon/${name}`);
    }
    if (expansion.screens(name)) problems.push(`${name}: a Supporting item has no screen of its own; remove evals/templates/expansion/${name}.mjs`);
    for (const path of [`expansion/${name}.tsx`, `neon/expansion/${name}.tsx`]) {
      if (expansion.fixture(path)) problems.push(`${name}: a Supporting item has no fixture of its own; remove evals/templates/fixtures/${path}`);
    }
  }
  for (const item of items) {
    if (item.meta?.supporting && !(item.name in expected)) problems.push(`${item.name}: marked meta.supporting but no item is named to use it`);
  }
  return problems;
}

/**
 * Theme Brief items (`theme-brief-<theme>-<slug>`) against their briefs, by `<theme>-<slug>`: each brief's
 * picks file, theme label and Markdown. An item ships one Markdown file into the app's ./docs/theme-briefs/,
 * titled and described as the brief is, with the meta neon-create lists briefs by.
 */
export function themeBriefItemProblems(items, briefs) {
  const problems = [];
  for (const item of items) {
    if (!item.name?.startsWith('theme-brief-')) continue;
    const name = item.name.slice('theme-brief-'.length);
    const brief = briefs.get(name);
    const problem = (message) => problems.push(`${item.name}: ${message}`);
    if (!brief) {
      problem(`no picks file and Markdown for ${name}`);
      continue;
    }
    const { picks, label, markdown } = brief;
    const tagline = markdown.split('\n').find((line) => line.startsWith('> '))?.slice(2);
    const meta = { immersiveTheme: picks.theme, briefName: picks.briefName, presets: picks.presets, status: 'provisional' };
    const categories = ['theme-brief', picks.theme];
    if (item.type !== 'registry:item') problem('type must be "registry:item"');
    if (item.title !== `${label} · ${picks.briefName}`) problem(`title must be "${label} · ${picks.briefName}"`);
    if (tagline === undefined || item.description !== tagline) problem("description must be the brief's tagline");
    if (JSON.stringify(item.categories) !== JSON.stringify(categories)) problem(`categories must be ${JSON.stringify(categories)}`);
    if (JSON.stringify(item.meta) !== JSON.stringify(meta)) problem(`meta must be ${JSON.stringify(meta)}`);
    for (const dependency of ['@neon/theme', '@neon/immersive-themes']) {
      if (!(item.registryDependencies ?? []).includes(dependency)) problem(`registryDependencies must include ${dependency}`);
    }
    const [file, ...more] = item.files ?? [];
    if (more.length || file?.path !== `theme-briefs/${name}.md` || file.type !== 'registry:file' || file.target !== `~/docs/theme-briefs/${name}.md`) {
      problem(`its one file must be theme-briefs/${name}.md, a registry:file targeting ~/docs/theme-briefs/${name}.md`);
    }
  }
  return problems;
}

// Installing. The New and Add install modes run shadcn's CLI against the
// registry; it is pinned because its init and registry formats change between
// releases.

export const SHADCN = 'shadcn@4.23.0';

// The browser suite runs shadcn init from neon-base, then adds these: every
// component, and the Theme Briefs, which no other item depends on. Supporting
// items come in through the components that use them, as in an app.
export function browserSuiteItems(items) {
  return items.filter((item) => (item.type === 'registry:ui' && !item.meta?.supporting) || item.name.startsWith('theme-brief-')).map((item) => item.name);
}

// Items that neither neon-base nor the added items reach through
// registryDependencies, so none of their files land in the app.
export function unreachedItems(items, added) {
  const byName = new Map(items.map((item) => [item.name, item]));
  const reached = new Set();
  const visit = (name) => {
    if (reached.has(name) || !byName.has(name)) return;
    reached.add(name);
    for (const dependency of byName.get(name).registryDependencies ?? []) visit(dependency.split('/').pop().replace(/\.json$/, ''));
  };
  for (const item of items.filter((item) => item.type === 'registry:base')) visit(item.name);
  for (const name of added) visit(name);
  return items.map((item) => item.name).filter((name) => !reached.has(name));
}

/**
 * The files the named items and their registry dependencies write, as
 * app-relative path → content. Items are fetched from `url` with
 * `fetchJson`, since the shipped package carries no registry source.
 */
export async function resolveItemFiles({ url, names, fetchJson }) {
  const files = new Map();
  const seen = new Set();
  async function visit(address) {
    const itemUrl = address.startsWith('@neon/') ? `${url}/${address.slice('@neon/'.length)}.json` : address;
    if (!itemUrl.startsWith(`${url}/`)) throw new Error(`${address} is not a Neon registry item; add Neon's own item instead.`);
    if (seen.has(itemUrl)) return;
    seen.add(itemUrl);
    const item = await fetchJson(itemUrl).catch((err) => { throw new Error(`No Neon registry item at ${itemUrl}: ${err.message}`); });
    for (const dependency of item.registryDependencies ?? []) await visit(dependency);
    for (const file of item.files) files.set(file.target.replace(/^~\//, ''), file.content);
  }
  for (const name of names) await visit(`@neon/${name}`);
  return files;
}
