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
