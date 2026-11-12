// Neon's type roles take the size and line height of Core's text styles (ADR 0009). The Core snapshot
// holds the text styles; from them writeCoreType writes the CSS adapter's type sizes and line heights,
// and checkCoreType is the repository check that refuses them when they no longer equal the snapshot.
// Family and weight are not Core's: Neon keeps IBM Plex Sans Thai and its own weights.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SNAPSHOT_DIR } from './core-snapshot.mjs';
import { ADAPTER } from './core-theme.mjs';

const SNAPSHOT_TEXT_STYLES = `${SNAPSHOT_DIR}/text-styles.json`;
// The Type role table: which Core text style each of the adapter's type roles takes. Hand-maintained.
export const TYPE_ROLES_FILE = 'theme/css/core-type-roles.json';
// What a role takes from its text style, by the adapter variable that holds it.
const METRICS = { fontSize: 'size', lineHeight: 'lineHeight' };
// A type metric as the adapter declares it: alone on its line, so a rewrite and the check see every one.
const DECLARATION = /^(\s*--(fontSize|lineHeight)-([\w-]+): )([^;]+);\s*$/;

// The design contract restates the table for the skills; its rows are `| \`<role>\` | <Core text style> |`.
const CONTRACT = 'skills/INSTRUCTION.md';
const CONTRACT_HEADING = '| Type role | Core text style |';
const RESYNC = 'Re-run node scripts/sync-core.mjs --from <Core checkout>; a size or line height is not edited by hand.';

const json = async (root, path) => JSON.parse(await readFile(join(root, path), 'utf8'));

/**
 * The CSS adapter with every type role's size and line height taken from the Core text style the Type
 * role table names for it, in px as Core states them. Everything else in the file is left as written.
 */
function adapterFromCore(css, roles, textStyles) {
  const lines = css.split('\n');
  const stray = lines.findIndex(line => /--(?:fontSize|lineHeight)-[\w-]+\s*:/.test(line) && !DECLARATION.test(line));
  if (stray > -1) throw new Error(`${ADAPTER}:${stray + 1} must hold one type size or line height alone on its line, as "--fontSize-<role>: <value>;".`);
  const declarations = lines.map(line => line.match(DECLARATION)).filter(Boolean);
  const declared = [...new Set(declarations.map(([, , , role]) => role))];
  const unlisted = declared.filter(role => !(role in roles));
  if (unlisted.length) throw new Error(`${ADAPTER} has type roles ${TYPE_ROLES_FILE} does not list: ${unlisted.join(', ')}. Name each one's Core text style.`);
  const undeclared = Object.keys(roles).filter(role => !declared.includes(role));
  if (undeclared.length) throw new Error(`${TYPE_ROLES_FILE} lists type roles ${ADAPTER} does not have: ${undeclared.join(', ')}.`);
  for (const role of declared) {
    const style = roles[role];
    if (typeof style !== 'string') throw new Error(`${TYPE_ROLES_FILE} must give ${role} one Core text style, by its name in ${SNAPSHOT_TEXT_STYLES}.`);
    if (!textStyles[style]) throw new Error(`${TYPE_ROLES_FILE} gives ${role} the text style ${style}, which the Core snapshot does not have.`);
    for (const variable of Object.keys(METRICS)) {
      if (!declarations.some(([, , held, of]) => of === role && held === variable)) throw new Error(`${ADAPTER} gives ${role} no --${variable}-${role}; a type role holds a size and a line height.`);
    }
  }
  return lines.map(line => {
    const [, lead, variable, role] = line.match(DECLARATION) ?? [];
    return role ? `${lead}${textStyles[roles[role]][METRICS[variable]]}px;` : line;
  }).join('\n');
}

async function fromSnapshot(root) {
  const [textStyles, roles, css] = await Promise.all([json(root, SNAPSHOT_TEXT_STYLES), json(root, TYPE_ROLES_FILE), readFile(join(root, ADAPTER), 'utf8')]);
  return adapterFromCore(css, roles, textStyles);
}

/** Writes the CSS adapter's type sizes and line heights from the Core snapshot's text styles in `root`. */
export async function writeCoreType(root) {
  await writeFile(join(root, ADAPTER), await fromSnapshot(root));
}

/** The role → text style rows of the design contract's table. */
function contractTable(contract) {
  const lines = contract.split('\n');
  const heading = lines.findIndex(line => line.trim() === CONTRACT_HEADING);
  if (heading < 0) throw new Error(`${CONTRACT} has no "${CONTRACT_HEADING}" table.`);
  const rows = {};
  for (const line of lines.slice(heading + 2)) {
    const [, role, style] = line.match(/^\|\s*`([\w-]+)`\s*\|\s*([^|]+?)\s*\|/) ?? [];
    if (!role) break;
    rows[role] = style;
  }
  return rows;
}

/** Refuses a design contract whose type role table does not say what the Type role table says. */
function checkContract(contract, roles) {
  const rows = contractTable(contract);
  for (const [role, style] of Object.entries(roles)) {
    if (rows[role] !== style) throw new Error(`${CONTRACT} maps ${role} to ${rows[role] ?? 'nothing'}, but ${TYPE_ROLES_FILE} gives it ${style}.`);
  }
  const extra = Object.keys(rows).find(role => !(role in roles));
  if (extra) throw new Error(`${CONTRACT} maps ${extra}, a type role ${TYPE_ROLES_FILE} does not list.`);
}

/**
 * Refuses a CSS adapter whose type sizes and line heights do not equal the Core snapshot's text styles,
 * and a design contract that maps a type role to another text style than the Type role table does.
 */
export async function checkCoreType(root) {
  const expected = (await fromSnapshot(root)).split('\n');
  const css = (await readFile(join(root, ADAPTER), 'utf8')).split('\n');
  const line = css.findIndex((text, index) => text !== expected[index]);
  if (line > -1) {
    throw new Error(`${ADAPTER}:${line + 1} does not hold what ${TYPE_ROLES_FILE} and the Core snapshot's text styles give it: expected "${expected[line].trim()}". ${RESYNC}`);
  }
  checkContract(await readFile(join(root, CONTRACT), 'utf8'), await json(root, TYPE_ROLES_FILE));
}
