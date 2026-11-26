// Inputs loader for the Theme Brief authoring tool: reads presets, picks
// files, theme texts and prompt library entries under theme-briefs/, and the
// theme facts they are checked against, from a repository root. Every problem
// is collected as "<repo-relative path>: <message>"; nothing stops at the first.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { bans, briefSlug, COLOURWAYS, ENTRIES, entryOrder, entryProblems, entrySchema, picksProblems, picksSchema, presetProblems, presetSchema, sharedProblems, sharedSchema, themeTextProblems, themeTextSchema, validate } from './schemas.mjs';

export const PRESET_KINDS = ['occasion', 'imagery'];

function readJson(root, path, problems) {
  try {
    return JSON.parse(readFileSync(join(root, path), 'utf8'));
  } catch (error) {
    problems.push(`${path}: ${error instanceof SyntaxError ? `not valid JSON (${error.message})` : 'missing'}`);
    return undefined;
  }
}

function jsonFiles(root, dir) {
  const full = join(root, dir);
  return existsSync(full) ? readdirSync(full).filter((name) => name.endsWith('.json')).sort().map((name) => `${dir}/${name}`) : [];
}

const base = (path) => path.split('/').at(-1).replace(/\.json$/, '');

function check(path, data, schema, problems, extra = []) {
  if (data === undefined) return;
  for (const message of [...extra, ...validate(data, schema), ...bans(data)]) problems.push(`${path}: ${message}`);
}

// Theme facts: families, light/dark, roles, variables and steps, from the Immersive Themes data and theme CSS.
function themeFacts(root, problems) {
  const data = readJson(root, 'theme/immersive-themes.json', problems) ?? { themes: {} };
  const css = existsSync(join(root, 'theme/css/immersive-themes.css')) ? readFileSync(join(root, 'theme/css/immersive-themes.css'), 'utf8') : '';
  const themeCss = existsSync(join(root, 'theme/css/theme.css')) ? readFileSync(join(root, 'theme/css/theme.css'), 'utf8') : '';
  const blocks = {};
  const tokens = new Map();
  for (const [, id, body] of css.matchAll(/\[data-immersive-theme(?:="([\w-]+)")?\]\s*\{([^}]*)\}/g)) {
    const vars = [...body.matchAll(/--immersive-([\w-]+):\s*(#[0-9a-f]{6});(?:[ \t]*\/\*\s*(.+?)\s*\*\/)?/gi)];
    blocks[id ?? '*'] = new Map(vars.map(([, name, hex]) => [name, hex.toLowerCase()]));
    tokens.set(id ?? '*', new Map(vars.map(([, name, , token]) => [name, token?.replace('.', ' ')])));
  }
  // The first declaration of each variable in theme.css.
  const declared = new Map();
  for (const [, name, value] of themeCss.matchAll(/--([\w-]+):\s*([^;]+);/g)) if (!declared.has(name)) declared.set(name, value.trim());
  const typeface = declared.get('fontFamily-body')?.match(/^'([^']+)'/)?.[1];
  const themes = {};
  for (const [id, theme] of Object.entries(data.themes ?? {})) {
    const families = COLOURWAYS.filter((family) => theme[family]);
    themes[id] = {
      id,
      label: theme.label,
      kind: String(theme.text).startsWith('White') ? 'dark' : 'light',
      canvas: theme.canvas,
      text: theme.text,
      action: theme.action?.bg ?? theme.text,
      canvasIsPalette: theme.palette?.['100']?.bg === theme.canvas,
      ratio: theme.ratio ?? {},
      families,
      steps: Object.fromEntries(families.map((family) => [family, theme[family]])),
      familyLabels: Object.fromEntries(families.map((family) => [family, String(Object.values(theme[family])[0]?.bg).split('.')[0]])),
      vars: new Map([...(blocks['*'] ?? []), ...(blocks[id] ?? [])]),
      own: [...(blocks[id] ?? new Map()).keys()],
      tokens: new Map([...(tokens.get('*') ?? []), ...(tokens.get(id) ?? [])]),
    };
  }
  return {
    themes,
    secondary: Object.fromEntries(Object.entries(data.secondary ?? {}).map(([family, familySteps]) => [family, Object.keys(familySteps)])),
    type: { typeface, weights: [...new Set([...declared].filter(([name]) => name.startsWith('fontWeight-')).map(([, value]) => value))].sort() },
  };
}

export function loadInputs(root) {
  const problems = [];
  const facts = themeFacts(root, problems);
  const presets = Object.fromEntries(PRESET_KINDS.map((kind) => [kind, {}]));
  for (const kind of PRESET_KINDS) {
    for (const path of jsonFiles(root, `theme-briefs/presets/${kind}`)) {
      const data = readJson(root, path, problems);
      if (data === undefined) continue;
      check(path, data, presetSchema(kind, base(path)), problems, presetProblems(kind, data));
      presets[kind][base(path)] = { path, data };
    }
  }
  const picks = jsonFiles(root, 'theme-briefs/picks').map((path) => ({ path, name: base(path), data: readJson(root, path, problems) }));
  const themeTexts = jsonFiles(root, 'theme-briefs/themes').map((path) => ({ path, id: base(path), data: readJson(root, path, problems) }));
  const library = jsonFiles(root, 'theme-briefs/prompt-library').map((path) => ({ path, name: base(path), data: readJson(root, path, problems) }));
  for (const { path, name, data } of picks) {
    const expected = typeof data?.theme === 'string' && typeof data?.briefName === 'string' ? `${data.theme}-${briefSlug(data.briefName)}` : name;
    check(path, data, picksSchema(facts), problems, [...(expected === name ? [] : [`file name must be "${expected}.json" (theme and brief name)`]), ...picksProblems(data)]);
  }
  for (const { path, id, data } of themeTexts) {
    if (facts.themes[id]) check(path, data, themeTextSchema, problems, themeTextProblems(data, id, facts));
    else problems.push(`${path}: no Immersive Theme "${id}"`);
  }
  for (const { path, name, data } of library) {
    if (name === 'shared') check(path, data, sharedSchema, problems, sharedProblems(data));
    else if (!ENTRIES.includes(name)) problems.push(...entryProblems(name, data).map((message) => `${path}: ${message}`));
    else check(path, data, entrySchema, problems, entryProblems(name, data));
  }
  const afters = Object.fromEntries(library.filter(({ name, data }) => ENTRIES.includes(name) && Array.isArray(data?.after)).map(({ name, data }) => [name, data.after]));
  const { cycle } = entryOrder(afters);
  for (const name of cycle) problems.push(`theme-briefs/prompt-library/${name}.json: "after" makes a cycle through ${cycle.join(', ')}`);
  return { facts, presets, picks, themeTexts, library, problems };
}
