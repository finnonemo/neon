// Neon's colors come from Core's Theme (ADR 0009). The Core snapshot holds the
// Theme; from it writeCoreTheme writes the Theme token export and the CSS
// adapter's colors, and checkCoreTheme is the repository check that refuses
// either when it no longer equals the snapshot.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SNAPSHOT_DIR } from './core-snapshot.mjs';

const SNAPSHOT_THEME = `${SNAPSHOT_DIR}/theme.json`;
const PALETTE = 'theme/tokens/colors.json';
export const THEME_EXPORT = 'theme/tokens/theme.json';
export const ADAPTER = 'theme/css/theme.css';
// Which Core Theme token each of the adapter's color roles takes, per mode. Hand-maintained.
export const ROLES_FILE = 'theme/css/core-roles.json';
const MODES = ['light', 'dark'];
const RESYNC = 'Re-run node scripts/sync-core.mjs --from <Core checkout>; neither file is edited by hand.';

const json = async (root, path) => JSON.parse(await readFile(join(root, path), 'utf8'));
const serialized = value => `${JSON.stringify(value, null, 2)}\n`;
const sameHex = (a, b) => a.toUpperCase().padEnd(9, 'F') === b.toUpperCase().padEnd(9, 'F');

/**
 * The Theme token export in the raw export's own shape: mode, then the token's path, then an alias to
 * its primitive (`{Black.85A}`). Refuses a primitive the palette lacks or holds at another value, since
 * the alias would then resolve to a color Core does not mean.
 */
function themeExport(theme, palette) {
  const out = { light: {}, dark: {} };
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

/** `#RRGGBBAA` as the adapter writes a color: `rgb(1, 23, 43)`, or `rgba(0, 0, 0, 0.851)` when it is not opaque. */
function cssColor(hex) {
  const [r, g, b, a = 255] = hex.slice(1).match(/../g).map(pair => parseInt(pair, 16));
  return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${Math.round((a / 255) * 1000) / 1000})`;
}

/** A role's Core token per mode: `"Text/text-primary"` for both, or `{ light, dark, why }` where null keeps the written value. */
const roleTokens = entry => (typeof entry === 'string' ? { light: entry, dark: entry } : entry);

/**
 * The CSS adapter with every mapped role's color taken from Core's Theme. The light block and the two
 * dark blocks (OS preference, data-theme) are rewritten in place; a role whose dark color differs from
 * light is added to a dark block that lacks it. Everything else in the file is left as written.
 */
function adapterColors(css, roles, theme) {
  const split = css.indexOf('/* --- Colors (dark)');
  if (split < 0) throw new Error(`${ADAPTER} has no "Colors (dark)" block.`);
  const color = (role, mode) => {
    const token = roleTokens(roles[role])[mode];
    if (token === null) return null;
    if (!theme[token]) throw new Error(`${ROLES_FILE} gives ${role} (${mode}) the token ${token}, which the Core snapshot's Theme does not have.`);
    return cssColor(theme[token][mode].hex);
  };
  const written = [...css.matchAll(/^\s*--color-([\w-]+):/gm)].map(match => match[1]);
  const unmapped = [...new Set(written)].filter(role => !(role in roles));
  if (unmapped.length) throw new Error(`${ADAPTER} has color roles ${ROLES_FILE} does not list: ${unmapped.join(', ')}. Name each one's Core Theme token, or say why it has none.`);
  const unwritten = Object.keys(roles).filter(role => !written.includes(role));
  if (unwritten.length) throw new Error(`${ROLES_FILE} lists roles ${ADAPTER} does not have: ${unwritten.join(', ')}.`);

  const rewrite = (text, mode) => text.replace(/^(\s*--color-([\w-]+): )([^;]+);/gm, (line, lead, role) => {
    const value = color(role, mode);
    return value === null ? line : `${lead}${value};`;
  });
  const light = rewrite(css.slice(0, split), 'light');
  const lightRoles = [...light.matchAll(/^\s*--color-([\w-]+):/gm)].map(match => match[1]);
  // Each dark block: its present roles rewritten, then the roles Core darkens that it does not have yet.
  const dark = css.slice(split).replace(/(\{\n)((?:\s*--color-[^\n]*\n|\s*\n)+)(\s*\})/g, (block, open, body, close) => {
    const lines = rewrite(body, 'dark').split('\n');
    const indent = lines.find(line => line.trim()).match(/^\s*/)[0];
    const has = role => lines.some(line => line.trimStart().startsWith(`--color-${role}:`));
    for (const [index, role] of lightRoles.entries()) {
      const value = color(role, 'dark');
      if (has(role) || value === null || value === color(role, 'light')) continue;
      // After the nearest earlier role the block already has, so the block keeps the light block's order.
      const before = lightRoles.slice(0, index).reverse().find(has);
      const at = before ? lines.findIndex(line => line.trimStart().startsWith(`--color-${before}:`)) + 1 : 0;
      lines.splice(at, 0, `${indent}--color-${role}: ${value};`);
    }
    return `${open}${lines.join('\n')}${close}`;
  });
  return light + dark;
}

async function compiled(root) {
  const [theme, palette, roles, css] = await Promise.all([json(root, SNAPSHOT_THEME), json(root, PALETTE), json(root, ROLES_FILE), readFile(join(root, ADAPTER), 'utf8')]);
  return { export: serialized(themeExport(theme, palette)), adapter: adapterColors(css, roles, theme) };
}

/** Writes the Theme token export and the CSS adapter's colors from the Core snapshot in `root`. */
export async function writeCoreTheme(root) {
  const files = await compiled(root);
  await writeFile(join(root, THEME_EXPORT), files.export);
  await writeFile(join(root, ADAPTER), files.adapter);
}

/** Refuses a Theme token export or CSS adapter that does not equal the Core snapshot's Theme. */
export async function checkCoreTheme(root) {
  const files = await compiled(root);
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
