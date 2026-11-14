// Neon's colors come from Core's Theme (ADR 0009). The Core snapshot holds the
// Theme; from it writeCoreTheme writes the Theme token export and the CSS
// adapter's colors, and checkCoreTheme is the repository check that refuses
// either when it no longer equals the snapshot.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { refuseUnseenDeclarations } from './adapter-declarations.mjs';
import { cssColor } from './colors.mjs';
import { SNAPSHOT_DIR } from './core-snapshot.mjs';

const SNAPSHOT_THEME = `${SNAPSHOT_DIR}/theme.json`;
const PALETTE = 'theme/tokens/colors.json';
export const THEME_EXPORT = 'theme/tokens/theme.json';
export const ADAPTER = 'theme/css/theme.css';
// The Role table: which Core Theme token each of the adapter's color roles takes, per mode. Hand-maintained.
const ROLES_FILE = 'theme/css/core-roles.json';
const MODES = ['light', 'dark'];
const RESYNC = 'Re-run node scripts/sync-core.mjs --from <Core checkout>; neither file is edited by hand.';
// A color role as the adapter declares it: alone on its line, so a rewrite and the check see every one.
const DECLARATION = /^(\s*--color-([\w-]+): )([^;]+);\s*$/;
const DARK_BLOCKS = '/* --- Colors (dark)';

const json = async (root, path) => JSON.parse(await readFile(join(root, path), 'utf8'));
const serialized = value => `${JSON.stringify(value, null, 2)}\n`;
const sameHex = (a, b) => a.toUpperCase().padEnd(9, 'F') === b.toUpperCase().padEnd(9, 'F');

/**
 * The Theme token export in the raw export's own shape: mode, then the token's path, then an alias to
 * its primitive (`{Black.85A}`). Refuses a primitive the palette lacks or holds at another value, since
 * the alias would then resolve to a color Core does not mean.
 */
function themeExport(theme, palette) {
  const out = Object.fromEntries(MODES.map(mode => [mode, {}]));
  for (const [name, modes] of Object.entries(theme)) {
    for (const mode of MODES) {
      const { primitive, hex } = modes[mode];
      const [family, step] = primitive.split('/');
      const held = palette[family]?.[step]?.value;
      if (!held) throw new Error(`${name} (${mode}) is ${primitive}, a primitive ${PALETTE} does not have.`);
      if (!sameHex(held, hex)) throw new Error(`${name} (${mode}) is ${primitive} = ${hex} in Core, but ${PALETTE} has ${held}.`);
      const path = name.split('/');
      let node = out[mode];
      for (const part of path.slice(0, -1)) node = node[part] ??= {};
      node[path.at(-1)] = { value: `{${family}.${step}}`, type: 'color', prefix: 'color' };
    }
  }
  return out;
}

/**
 * A Role table entry as a Core Theme token per mode. The entry is `"Text/text-primary"` for both modes,
 * or `{ light, dark, why }`, where null keeps the adapter's written value and `why` says the reason.
 */
function roleTokens(role, entry) {
  if (typeof entry === 'string') return { light: entry, dark: entry };
  const perMode = entry && MODES.every(mode => typeof entry[mode] === 'string' || entry[mode] === null);
  if (!perMode || typeof entry.why !== 'string' || !entry.why.trim()) {
    throw new Error(`${ROLES_FILE} must give ${role} a Core Theme token, or { light, dark, why }: a token or null for each mode, and the reason in why.`);
  }
  return entry;
}

/**
 * The CSS adapter with the color of every role the Role table gives a token taken from Core's Theme.
 * Each color line is rewritten in place, with the light value above the first dark block and the dark
 * value from there on; a role whose dark color differs from light is added to a dark block that lacks
 * it. Everything else in the file is left as written.
 */
function adapterFromCore(css, roles, theme) {
  const lines = css.split('\n');
  const firstDark = lines.findIndex(line => line.includes(DARK_BLOCKS));
  if (firstDark < 0) throw new Error(`${ADAPTER} has no "Colors (dark)" block.`);
  refuseUnseenDeclarations(ADAPTER, css, '--color-', DECLARATION, 'one color role alone on its line, as "--color-<role>: <value>;".');
  const roleOf = line => line.match(DECLARATION)?.[2];
  const declared = [...new Set(lines.map(roleOf).filter(Boolean))];
  const unlisted = declared.filter(role => !(role in roles));
  if (unlisted.length) throw new Error(`${ADAPTER} has color roles ${ROLES_FILE} does not list: ${unlisted.join(', ')}. Name each one's Core Theme token, or say why it has none.`);
  const undeclared = Object.keys(roles).filter(role => !declared.includes(role));
  if (undeclared.length) throw new Error(`${ROLES_FILE} lists roles ${ADAPTER} does not have: ${undeclared.join(', ')}.`);

  const tokens = Object.fromEntries(declared.map(role => [role, roleTokens(role, roles[role])]));
  const color = (role, mode) => {
    const token = tokens[role][mode];
    if (token === null) return null;
    if (!theme[token]) throw new Error(`${ROLES_FILE} gives ${role} (${mode}) the token ${token}, which the Core snapshot's Theme does not have.`);
    return cssColor(theme[token][mode].hex);
  };
  const lightRoles = lines.slice(0, firstDark).map(roleOf).filter(Boolean);
  // The roles Core darkens that a dark block does not declare yet, each after the nearest earlier role
  // the block has, so the block keeps the light block's order.
  const addDarkened = (block, indent) => {
    for (const [index, role] of lightRoles.entries()) {
      const value = color(role, 'dark');
      if (value === null || value === color(role, 'light') || block.some(line => roleOf(line) === role)) continue;
      const before = lightRoles.slice(0, index).reverse().find(earlier => block.some(line => roleOf(line) === earlier));
      block.splice(before ? block.findIndex(line => roleOf(line) === before) + 1 : 0, 0, `${indent}--color-${role}: ${value};`);
    }
  };

  const out = [];
  let blockStart = null;
  for (const [index, line] of lines.entries()) {
    const mode = index < firstDark ? 'light' : 'dark';
    const [, lead, role] = line.match(DECLARATION) ?? [];
    if (role) {
      const value = color(role, mode);
      out.push(value === null ? line : `${lead}${value};`);
      continue;
    }
    // The innermost block closes: add to it only if it declares colors (the @media wrapper does not).
    if (mode === 'dark' && blockStart !== null && line.trim() === '}') {
      const block = out.splice(blockStart);
      const first = block.find(roleOf);
      if (first) addDarkened(block, first.match(/^\s*/)[0]);
      out.push(...block);
      blockStart = null;
    }
    out.push(line);
    if (line.trimEnd().endsWith('{')) blockStart = out.length;
  }
  return out.join('\n');
}

/**
 * The color of every role the adapter `css` declares, per mode: { light: { role: value }, dark: { role: value } }.
 * A role's dark color is the one the first dark block gives it (the OS-preference block and the manual one hold
 * the same), and its light color where no dark block declares it.
 */
export function adapterColors(css) {
  const lines = css.split('\n');
  const firstDark = lines.findIndex(line => line.includes(DARK_BLOCKS));
  const declared = block => block.flatMap(line => { const [, , role, value] = line.match(DECLARATION) ?? []; return role ? [[role, value]] : []; });
  const light = Object.fromEntries(declared(firstDark < 0 ? lines : lines.slice(0, firstDark)));
  const dark = { ...light };
  const seen = new Set();
  for (const [role, value] of declared(firstDark < 0 ? [] : lines.slice(firstDark))) {
    if (!seen.has(role)) dark[role] = value;
    seen.add(role);
  }
  return { light, dark };
}

/** The color roles whose value differs between two adapters, as [{ role, light?: [was, is], dark?: [was, is] }]. */
function changedRoles(before, after) {
  const [was, is] = [adapterColors(before), adapterColors(after)];
  return Object.keys(is.light).flatMap(role => {
    const moved = MODES.filter(mode => was[mode][role] !== is[mode][role]).map(mode => [mode, [was[mode][role], is[mode][role]]]);
    return moved.length ? [{ role, ...Object.fromEntries(moved) }] : [];
  });
}

/** What the sync prints about the color roles it changed (writeCoreTheme's result), as lines: the pull request names each one and its contrast. */
export function changedRolesReport(changed) {
  if (!changed.length) return [`No color role of ${ADAPTER} changed.`];
  const width = Math.max(...changed.map(({ role }) => role.length));
  return [
    `Color roles of ${ADAPTER} that changed: ${changed.length}.`,
    ...changed.map(change => `  ${change.role.padEnd(width)}  ${MODES.filter(mode => change[mode]).map(mode => `${mode} ${change[mode][0]} → ${change[mode][1]}`).join('  ')}`),
    'Measure each against what it is drawn on or under, in both modes: node scripts/contrast.mjs <text role> <background role>...',
  ];
}

/** The Theme token export and the CSS adapter as the Core snapshot in `root` gives them. */
async function fromSnapshot(root) {
  const [theme, palette, roles, css] = await Promise.all([json(root, SNAPSHOT_THEME), json(root, PALETTE), json(root, ROLES_FILE), readFile(join(root, ADAPTER), 'utf8')]);
  return { export: serialized(themeExport(theme, palette)), adapter: adapterFromCore(css, roles, theme) };
}

/**
 * Writes the Theme token export and the CSS adapter's colors from the Core snapshot in `root`. Returns the color
 * roles whose value it changed (changedRolesReport).
 */
export async function writeCoreTheme(root) {
  const files = await fromSnapshot(root);
  const before = await readFile(join(root, ADAPTER), 'utf8');
  await writeFile(join(root, THEME_EXPORT), files.export);
  await writeFile(join(root, ADAPTER), files.adapter);
  return { changed: changedRoles(before, files.adapter) };
}

/** Refuses a Theme token export or CSS adapter that does not equal the Core snapshot's Theme. */
export async function checkCoreTheme(root) {
  const files = await fromSnapshot(root);
  if (await readFile(join(root, THEME_EXPORT), 'utf8') !== files.export) {
    throw new Error(`${THEME_EXPORT} does not equal the Core snapshot's Theme (${SNAPSHOT_THEME}). ${RESYNC}`);
  }
  const css = await readFile(join(root, ADAPTER), 'utf8');
  if (css !== files.adapter) {
    const expected = files.adapter.split('\n');
    const line = css.split('\n').findIndex((text, index) => text !== expected[index]);
    throw new Error(`${ADAPTER}:${line + 1} does not hold the color ${ROLES_FILE} and the Core snapshot's Theme give it: expected "${(expected[line] ?? '').trim()}". ${RESYNC}`);
  }
}
