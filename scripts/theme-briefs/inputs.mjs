// Inputs loader for the Theme Brief authoring tool: reads presets, picks
// files, theme texts and prompt library entries under theme-briefs/, and the
// theme facts they are checked against, from a repository root. Every problem
// is collected as "<repo-relative path>: <message>"; nothing stops at the first.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { bans, briefSlug, ENTRIES, entryProblems, layoutProblems, entrySchema, picksSchema, presetSchema, sharedSchema, themeTextProblems, themeTextSchema, validate } from './schemas.mjs';

export const PRESET_KINDS = ['occasion', 'layout', 'imagery'];

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
export function themeFacts(root, problems = []) {
  const data = readJson(root, 'theme/immersive-themes.json', problems) ?? { themes: {} };
  const css = existsSync(join(root, 'theme/css/immersive-themes.css')) ? readFileSync(join(root, 'theme/css/immersive-themes.css'), 'utf8') : '';
  const themeCss = existsSync(join(root, 'theme/css/theme.css')) ? readFileSync(join(root, 'theme/css/theme.css'), 'utf8') : '';
  const blocks = {};
  for (const [, id, body] of css.matchAll(/\[data-immersive-theme(?:="([\w-]+)")?\]\s*\{([^}]*)\}/g)) {
    blocks[id ?? '*'] = new Map([...body.matchAll(/--immersive-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, name, hex]) => [name, hex.toLowerCase()]));
  }
  const steps = (prefix) => new Set([...themeCss.matchAll(new RegExp(`--(${prefix}-[\\w]+):`, 'g'))].map(([, name]) => name));
  const themes = {};
  for (const [id, theme] of Object.entries(data.themes ?? {})) {
    const families = ['palette', 'accent', 'support'].filter((family) => theme[family]);
    themes[id] = {
      id,
      label: theme.label,
      kind: String(theme.text).startsWith('White') ? 'dark' : 'light',
      canvas: theme.canvas,
      families,
      roles: ['action', ...families],
      steps: Object.fromEntries(families.map((family) => [family, theme[family]])),
      vars: new Map([...(blocks['*'] ?? []), ...(blocks[id] ?? [])]),
    };
  }
  return { themes, space: steps('space'), borderRadius: steps('borderRadius') };
}

export function loadInputs(root) {
  const problems = [];
  const facts = themeFacts(root, problems);
  const presets = Object.fromEntries(PRESET_KINDS.map((kind) => [kind, {}]));
  for (const kind of PRESET_KINDS) {
    for (const path of jsonFiles(root, `theme-briefs/presets/${kind}`)) {
      const data = readJson(root, path, problems);
      if (data === undefined) continue;
      check(path, data, presetSchema(kind, base(path), facts), problems, kind === 'layout' ? layoutProblems(data) : []);
      presets[kind][base(path)] = { path, data };
    }
  }
  const picks = jsonFiles(root, 'theme-briefs/picks').map((path) => ({ path, name: base(path), data: readJson(root, path, problems) }));
  const themeTexts = jsonFiles(root, 'theme-briefs/themes').map((path) => ({ path, id: base(path), data: readJson(root, path, problems) }));
  const library = jsonFiles(root, 'theme-briefs/prompt-library').map((path) => ({ path, name: base(path), data: readJson(root, path, problems) }));
  for (const { path, name, data } of picks) {
    const expected = typeof data?.theme === 'string' && typeof data?.briefName === 'string' ? `${data.theme}-${briefSlug(data.briefName)}` : name;
    check(path, data, picksSchema(facts), problems, expected === name ? [] : [`file name must be "${expected}.json" (theme and brief name)`]);
  }
  for (const { path, id, data } of themeTexts) {
    const extra = themeTextProblems(data, id, facts);
    if (facts.themes[id]) check(path, data, themeTextSchema, problems, extra);
    else if (data !== undefined) problems.push(...extra.map((message) => `${path}: ${message}`));
  }
  for (const { path, name, data } of library) {
    if (name === 'shared') check(path, data, sharedSchema, problems);
    else if (data !== undefined) {
      const extra = entryProblems(name, data);
      if (extra.length && !ENTRIES.includes(name)) problems.push(`${path}: ${extra[0]}`);
      else check(path, data, entrySchema, problems, extra);
    }
  }
  return { facts, presets, picks, themeTexts, library, problems };
}
