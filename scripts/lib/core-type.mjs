// Neon's type roles take the size and line height of Core's text styles (ADR 0009). The Core snapshot
// holds the text styles; from them writeCoreType writes the CSS adapter's type sizes and line heights,
// and checkCoreType is the repository check that refuses them when they no longer equal the snapshot.
// Family and weight are not Core's: Neon keeps IBM Plex Sans Thai and its own weights. Tracking is not
// written: the snapshot's text styles state a size and a line height only.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { codeLines, refuseUnseenDeclarations } from './adapter-declarations.mjs';
import { SNAPSHOT_DIR } from './core-snapshot.mjs';
import { ADAPTER } from './core-theme.mjs';

const SNAPSHOT_TEXT_STYLES = `${SNAPSHOT_DIR}/text-styles.json`;
// The Type role table: which Core text style each of the adapter's type roles takes. Hand-maintained.
const TYPE_ROLES_FILE = 'theme/css/core-type-roles.json';
// What a role takes from its text style, by the category of the adapter variable that holds it
// (`--{category}-{role}`).
const FROM_TEXT_STYLE = { fontSize: 'size', lineHeight: 'lineHeight' };
const CATEGORIES = Object.keys(FROM_TEXT_STYLE);
// The variables the sync writes, and one as the adapter declares it: alone on its line, so a rewrite
// and the check see every one.
const FAMILY = `--(?:${CATEGORIES.join('|')})-`;
const DECLARATION = new RegExp(`^(?<lead>\\s*--(?<category>${CATEGORIES.join('|')})-(?<role>[\\w-]+): )[^;]+;\\s*$`);

// The design contract restates the table for the skills; its rows are `| \`<role>\` | <Core text style> |`.
const CONTRACT = 'skills/INSTRUCTION.md';
const CONTRACT_HEADING = '| Type role | Core text style |';
const RESYNC = 'Re-run node scripts/sync-core.mjs --from-snapshot; a size or line height is not edited by hand.';

const json = async (root, path) => JSON.parse(await readFile(join(root, path), 'utf8'));

/**
 * The CSS adapter with every type role's size and line height taken from the Core text style the Type
 * role table names for it, in px as Core states them. Everything else in the file is left as written.
 */
function adapterFromCore(css, roles, textStyles) {
  const lines = css.split('\n');
  refuseUnseenDeclarations(ADAPTER, css, FAMILY, DECLARATION, 'one type size or line height alone on its line, as "--fontSize-<role>: <value>;".');
  const tracking = codeLines(css).findIndex(line => /letter-?spacing/i.test(line));
  if (tracking > -1) throw new Error(`${ADAPTER}:${tracking + 1} sets tracking, which the Core snapshot's text styles do not state. The Core sync writes it once they do.`);
  const declarations = lines.map(line => line.match(DECLARATION)?.groups).filter(Boolean);
  const declared = [...new Set(declarations.map(declaration => declaration.role))];
  const unlisted = declared.filter(role => !(role in roles));
  if (unlisted.length) throw new Error(`${ADAPTER} has type roles ${TYPE_ROLES_FILE} does not list: ${unlisted.join(', ')}. Name each one's Core text style.`);
  const undeclared = Object.keys(roles).filter(role => !declared.includes(role));
  if (undeclared.length) throw new Error(`${TYPE_ROLES_FILE} lists type roles ${ADAPTER} does not have: ${undeclared.join(', ')}.`);
  for (const role of declared) {
    const style = roles[role];
    if (typeof style !== 'string') throw new Error(`${TYPE_ROLES_FILE} must give ${role} one Core text style, by its name in ${SNAPSHOT_TEXT_STYLES}.`);
    if (!textStyles[style]) throw new Error(`${TYPE_ROLES_FILE} gives ${role} the text style ${style}, which the Core snapshot does not have.`);
    for (const category of CATEGORIES) {
      if (!declarations.some(declaration => declaration.role === role && declaration.category === category)) throw new Error(`${ADAPTER} gives ${role} no --${category}-${role}; a type role holds a size and a line height.`);
    }
  }
  return lines.map(line => {
    const { lead, category, role } = line.match(DECLARATION)?.groups ?? {};
    return role ? `${lead}${textStyles[roles[role]][FROM_TEXT_STYLE[category]]}px;` : line;
  }).join('\n');
}

/** The CSS adapter in `root` as the Core snapshot's text styles and the Type role table there give it. */
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
    if (role in rows) throw new Error(`${CONTRACT} maps ${role} twice; its table gives a type role one row.`);
    rows[role] = style;
  }
  return rows;
}

/** Refuses a design contract whose table gives a type role another text style than the Type role table does. */
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
