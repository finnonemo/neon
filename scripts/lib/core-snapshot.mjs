// The Core snapshot (GLOSSARY): the compiled copy of Core that Neon carries,
// pinned to one Core commit (ADR 0009). syncCore compiles it from a Core
// checkout; checkCoreSnapshot is the repository check that refuses a hand edit.
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';

export const SNAPSHOT_DIR = 'core';
const CORE_REPOSITORY = 'pawisssh/design-system';
export const COUNTERPARTS_FILE = 'registry/core-counterparts.json';
const MANIFEST = 'snapshot.json';

/** The registry items a Counterpart is decided for: the components, not the base, theme or layouts. */
export async function registryItems(root) {
  const { items } = JSON.parse(await readFile(join(root, 'registry/registry.json'), 'utf8'));
  return items.filter(item => item.type === 'registry:ui').map(item => item.name);
}
// What the sync reads in a Core checkout.
const CORE_SOURCES = ['GLOSSARY.md', 'docs/architecture.md', 'docs/hierarchy.md', 'docs/theme/theme.json', 'docs/components'];
const sha256 = content => createHash('sha256').update(content).digest('hex');

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

/** A Core doc's standing, from its `> Status:` line: only live docs enter the snapshot. */
export function docStatus(text) {
  const status = text.match(/^> Status: (.*)$/m)?.[1];
  if (!status) return null;
  const plain = status.replace(/[*_`]/g, '').trimStart();
  if (/^Deprecated/i.test(plain)) return 'deprecated';
  if (/^Draft/i.test(plain)) return 'draft';
  return 'live';
}

// ---- Web-focused component docs.

// The sections of a Core doc the web uses; the rest is Figma build history and native handling.
const WEB_SECTIONS = ['Anatomy and layer tree', 'Axes', 'Component variables and Theme tokens', 'Icon records',
  'Variant axes', 'Layer tree', 'Layer tree (target)', '`Components` variables', '`Theme` tokens',
  'Text styles, wrapping and truncation', 'Hit target and Skeleton', 'Ring', 'Scrubbing', 'Motion', 'Accessibility', 'Usage'];
// A clause that names any of these describes Figma placement, the iOS=True look, a Revision or Dynamic Type.
const NATIVE_ONLY = [/iOS\s*=\s*True/, /Liquid Glass/i, /\bglass\b/i, /\bmaterial\b/i, /Dynamic Type/i, /\bxxxLarge\b/, /\bAX[1-5]\b/,
  /\bRevisions?\b/, /figma\.com/i, /\b\d{2,}:\d{2,}\b/, /\b[0-9a-f]{40}\b/, /\bUsage frame\b/];
const nativeOnly = text => NATIVE_ONLY.some(pattern => pattern.test(text));
const NATIVE_COLUMNS = /^`?(iOS|Android)`?$/;

/** A Core doc's name, from its `# Button — proposal` heading. */
const docTitle = text => (text.match(/^# (.+)$/m)?.[1] ?? '').split(' — ')[0].trim();

/** `## ` sections of a Markdown doc, in order, as [title, body lines]. Fenced lines never start a section. */
function sections(text) {
  const found = [];
  let fence = false;
  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (!fence && /^## /.test(line)) found.push([line.slice(3).trim(), []]);
    else found.at(-1)?.[1].push(line);
  }
  return found;
}

// A link to a component doc, as written from a component doc (`button.md`) or from Core's docs root (`components/button.md`).
const docLink = (file, root) => file.match(root ? /^components\/([\w-]+)\.md$/ : /^([\w-]+)\.md$/)?.[1];

/** Links a reader of the snapshot can follow stay links; links into the rest of Core's repository become their text. */
function relink(text, { live, root }) {
  return text.replace(/\[([^\]]*)\]\(([^)\s]*)\)/g, (whole, label, target) => {
    if (/^Revisions?\b/.test(label) || /^#revision-/.test(target)) return '';
    if (/^https?:/.test(target)) return /github\.com\/pawisssh\/|figma\.com/.test(target) ? label : whole;
    const file = target.split('#')[0];
    if (!root && file === '../hierarchy.md') return `[${label}](../hierarchy.md)`;
    return live.has(docLink(file, root)) ? `[${label}](${file})` : label;
  });
}

/** One run of prose with its native-only clauses removed and the gaps their links left closed. */
function webProse(text, links) {
  const linked = relink(text, links)
    .replace(/\s*\((?:\s|,|·|–|-|and|to)*\)/g, '')
    .replace(/ {2,}/g, ' ');
  return linked.split(/(?<=[.;:][*_"”)]{0,2})\s+/).filter(clause => !nativeOnly(clause)).join(' ').trim();
}

const cells = row => row.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(cell => cell.trim());

/** A kept section's lines for the web: native rows, columns and clauses out, links relinked. */
function webLines(lines, links) {
  const out = [];
  let fence = false;
  let dropColumns = null;
  for (const [index, line] of lines.entries()) {
    if (/^\s*(```|~~~)/.test(line)) { fence = !fence; out.push(line); continue; }
    if (fence) { if (!nativeOnly(line)) out.push(line); continue; }
    if (/^\s*\|/.test(line)) {
      const indent = line.match(/^\s*/)[0];
      let row = cells(line);
      if (dropColumns === null) dropColumns = /^\s*\|[\s:|-]+\|\s*$/.test(lines[index + 1] ?? '') ? row.map(cell => NATIVE_COLUMNS.test(cell)) : [];
      row = row.filter((_, column) => !dropColumns[column]);
      if (row.every(cell => /^:?-+:?$/.test(cell))) { out.push(`${indent}| ${row.join(' | ')} |`); continue; }
      if (/^`?iOS`?$/.test(row[0])) continue;
      // A row about a doc the snapshot leaves out has nothing left to point at.
      if (links.root && [...line.matchAll(/\]\(([^)#\s]*)/g)].some(([, file]) => docLink(file, true) && !links.live.has(docLink(file, true)))) continue;
      const web = row.map(cell => webProse(cell, links).replace(/[:;]$/, ''));
      if (web.slice(1).every(cell => !cell) && row.slice(1).some(Boolean)) continue;
      out.push(`${indent}| ${web.join(' | ')} |`);
      continue;
    }
    dropColumns = null;
    const [, lead, body] = line.match(/^(\s*(?:[-*+]|\d+\.)\s+(?:\[[ x]\]\s+)?|\s*#{3,6}\s+|\s*>\s*)?(.*)$/);
    if (!body.trim()) { out.push(line); continue; }
    const web = webProse(body, links);
    // A checklist item reduced to its number said only native things.
    if (web && !/^\d+\.?$/.test(web)) out.push(`${lead ?? ''}${web}`);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// A doc writes a Component variable's alias as `→Spacing/spacing-05`: the web needs the number the step holds.
const STEP_ALIAS = /→(`?)((?:Spacing|Sizing|Radius)\/[\w-]+(?: \(radius-[\w-]+\))?)/g;
const stepNumbers = (text, number) => text.replace(STEP_ALIAS, (whole, tick, target) => {
  const value = number(target);
  return value === undefined ? `${tick}${target}` : `${tick}${target} = ${value}`;
});

/** A Core component doc compiled for the web: its `iOS=False` look and rules, without Figma or native detail. */
export function webDoc(text, { live, number }) {
  const title = docTitle(text);
  const parts = [`# ${title}`, `> Core's ${title}, compiled for the web: the \`iOS=False\` look at the Large text size. Generated by the Core sync; do not edit.`];
  for (const [heading, lines] of sections(text)) {
    if (!WEB_SECTIONS.includes(heading)) continue;
    const body = stepNumbers(webLines(lines, { live }), number);
    if (body) parts.push(`## ${heading}`, body);
  }
  return `${parts.join('\n\n')}\n`;
}

/** Core's hierarchy rules for the web, with links re-rooted at the snapshot. */
export function webHierarchy(text, live) {
  const parts = [`# ${docTitle(text)}`, '> Core\'s hierarchy rules, compiled for the web. Generated by the Core sync; do not edit.'];
  for (const [heading, lines] of sections(text)) {
    const body = webLines(lines, { live, root: true });
    if (body) parts.push(`## ${heading}`, body);
  }
  return `${parts.join('\n\n')}\n`;
}

// ---- Scale steps and text styles. Core keeps these as prose, not data, so each is read from the sentence or table that states it.

// Core's `Round` radius step, which draws a Capsule (its GLOSSARY: "a shape whose corner radius is half its height").
// Core keeps the number only in prose: its Button, Avatar and Badge docs write the step as "200 (Capsule)".
export const ROUND_RADIUS = 200;

function stated(text, pattern, what) {
  const match = text.match(pattern);
  if (!match) throw new Error(`Core no longer states ${what} where the sync reads it (${pattern}).`);
  return match;
}
const numbers = list => list.split(/[,/]/).map(value => Number(value.trim()));

/** Scale steps by alias target, e.g. `Spacing/spacing-05` → 16. */
export function readScales({ architecture, glossary }) {
  const scales = {};
  numbers(stated(architecture, /`spacing-00`–`13`: ([\d, ]+)\)/, 'the Spacing steps')[1])
    .forEach((value, step) => { scales[`Spacing/spacing-${String(step).padStart(2, '0')}`] = value; });
  const [, controls, hitTarget] = stated(architecture, /`control-xsmall` … `control-xlarge` \(([\d /]+)\) and `hit-target` \((\d+)\)/, 'the Sizing control steps');
  ['xsmall', 'small', 'medium', 'large', 'xlarge'].forEach((size, index) => { scales[`Sizing/control-${size}`] = numbers(controls)[index]; });
  scales['Sizing/hit-target'] = Number(hitTarget);
  const strokes = [...glossary.matchAll(/`(stroke-[\w-]+|focus-ring)` (\d+)/g)];
  if (!strokes.length) throw new Error('Core no longer states the stroke steps where the sync reads them (GLOSSARY, Scale step).');
  for (const [, name, value] of strokes) scales[`Sizing/${name}`] = Number(value);
  return scales;
}

/** Text styles at the Large text size, by step: `Body` → { size, lineHeight }, `Icon/Large` → … */
export function readTextStyles(architecture) {
  const styles = {};
  const table = stated(architecture, /\| Step \| `Large` \|[^\n]*\n[^\n]*\n((?:\s*\|[^\n]*\n?)+)/, 'the text style values table')[1];
  for (const row of table.split('\n').filter(line => line.trim())) {
    const [label, large] = cells(row);
    const family = label.match(/^(Icon) /)?.[1];
    const names = label.replace(/^Icon /, '').split(/, | \/ /).map((name, index, all) =>
      (/^\d+$/.test(name) ? `${all[0].replace(/ \d+$/, '')} ${name}` : name));
    const values = large.split(', ');
    names.forEach((name, index) => {
      const [size, lineHeight] = numbers(values[values.length === 1 ? 0 : index]);
      styles[family ? `${family}/${name}` : name] = { size, lineHeight };
    });
  }
  return styles;
}

// ---- Specs at the web look.

const WEB_LOOK = /\{\{iOS=(?:False|\*|True, False|False, True)\}\}/g;
const nativeLook = condition => /\{\{iOS=True\}\}/.test(condition ?? '');
const atWebLook = condition => (condition ?? '').replace(WEB_LOOK, '');

export function resolver({ scales, textStyles, theme }) {
  // Core keeps no list of Radius steps: the ones its specs and docs alias are collected as they resolve.
  const radii = {};
  const number = target => {
    if (target in scales) return scales[target];
    const radius = target.match(/^Radius\/(?:(\d+)px|(None)|(Round)) \((radius-[\w-]+)\)$/);
    if (radius) return (radii[`Radius/${radius[4]}`] = radius[3] ? ROUND_RADIUS : Number(radius[1] ?? 0));
    const type = target.match(/^Dynamic Type\/(.+)\/(Line height|Size)$/);
    const style = type && textStyles[type[1]];
    if (style) return type[2] === 'Size' ? style.size : style.lineHeight;
    return undefined;
  };
  const color = (target, mode) => {
    const hex = themeColor(theme, target, mode)?.hex;
    return hex ? { ref: target, hex } : undefined;
  };
  return { number, color, radii };
}

/** What a Theme token, a primitive or a hex comes to in one mode: { via?, primitive?, hex }. A token may name another token. */
function themeColor({ tokens, primitives }, name, mode, seen = []) {
  if (/^#[0-9A-Fa-f]{6,8}$/.test(name)) return { hex: name };
  if (name in primitives) return { primitive: name, hex: primitives[name] };
  if (!(name in tokens) || seen.includes(name)) return undefined;
  const next = tokens[name][mode === 'light' ? 0 : 1];
  const end = themeColor({ tokens, primitives }, next, mode, [...seen, name]);
  return end && next in tokens ? { via: next, primitive: end.primitive, hex: end.hex } : end;
}

// Figma's own editor colors and the Mode switch sit in the Theme collection but are not Theme colors.
const NOT_A_COLOR = /^(Figma\/|Mode$)/;

/** Core's Theme for the web: what each token comes to in light and dark. */
export function webTheme(theme) {
  const side = (token, mode) => themeColor(theme, token, mode)
    ?? (() => { throw new Error(`docs/theme/theme.json: ${token} names ${theme.tokens[token][mode === 'light' ? 0 : 1]}, which is neither a primitive, a token nor a hex.`); })();
  return Object.fromEntries(Object.keys(theme.tokens).filter(token => !NOT_A_COLOR.test(token))
    .map(token => [token, { light: side(token, 'light'), dark: side(token, 'dark') }]));
}

/** One Core spec for the web: variables as numbers and hexes, bindings without the iOS=True look. */
export function webSpec(spec, { number, color }, file) {
  const fail = (variable, target) => { throw new Error(`${file}: ${variable.name} aliases ${target}, which Core records no value for where the sync reads it.`); };
  const alias = value => (typeof value === 'string' && value.startsWith('→') ? value.slice(1) : null);
  const variables = {};
  for (const variable of spec.variables ?? []) {
    if (variable.type === 'COLOR') {
      const targets = { light: alias(variable.values?.Light ?? variable.value), dark: alias(variable.values?.Dark ?? variable.value) };
      variables[variable.name] = Object.fromEntries(Object.entries(targets).map(([mode, target]) =>
        [mode, (target && color(target, mode)) ?? fail(variable, target ?? JSON.stringify(variable.values ?? variable.value))]));
    } else {
      const target = alias(variable.value);
      variables[variable.name] = target === null ? variable.value : number(target) ?? fail(variable, target);
    }
  }
  const bindings = [];
  for (const layer of spec.layers ?? []) {
    for (const [property, automations] of Object.entries(layer.automations ?? {})) {
      if (property === 'componentProperties.iOS') continue;
      for (const { condition, value, literal } of automations) {
        if (nativeLook(condition)) continue;
        // A binding straight to a Scale step or a text style's metric is that number on the web.
        const step = !literal && /^(Spacing|Sizing|Radius|Dynamic Type)\//.test(value);
        if (step && number(value) === undefined) throw new Error(`${file}: ${layer.layerPath.join(' / ')} binds ${property} to ${value}, which Core records no value for where the sync reads it.`);
        bindings.push({ layer: layer.layerPath.join(' / ') || '(root)', property, when: atWebLook(condition), value: step ? number(value) : value, ...(literal || step ? { literal: true } : {}) });
      }
    }
  }
  return {
    name: spec.componentSet?.name ?? spec.baseNodeName,
    axes: (spec.axes ?? []).filter(axis => axis.name !== 'iOS'),
    exclude: (spec.exclude ?? []).filter(condition => !nativeLook(condition)).map(atWebLook),
    // An instance-swap default is a Figma node id.
    properties: (spec.properties ?? []).map(({ name, type, default: initial }) => ({ name, type, ...(type === 'INSTANCE_SWAP' ? {} : { default: initial }) })),
    variables,
    bindings,
  };
}

// Bindings are many and short: one per line keeps the file readable and its diffs small.
function specJson(component, sets) {
  const set = ({ bindings, ...rest }) => `${JSON.stringify(rest, null, 2).slice(0, -2)},\n  "bindings": [\n${bindings.map(binding => `    ${JSON.stringify(binding)}`).join(',\n')}\n  ]\n}`;
  return `{\n"component": ${JSON.stringify(component)},\n"sets": [\n${sets.map(set).join(',\n')}\n]\n}\n`;
}

/**
 * Which doc owns each spec: the docs whose `> Spec:` line names it, else the doc it is named after
 * (`table-cell` belongs to `table`). A spec owned by a draft or deprecated doc stays out with it.
 */
function specOwners(entries, docs) {
  const specs = entries.filter(name => name.endsWith('.spec.json')).map(name => name.slice(0, -'.spec.json'.length));
  const named = new Map();
  for (const [doc, { text }] of docs) {
    for (const [, spec] of (text.match(/^> Spec: .*$/m)?.[0] ?? '').matchAll(/([\w-]+)\.spec\.json/g)) {
      if (specs.includes(spec)) named.set(spec, [...new Set([...(named.get(spec) ?? []), doc])]);
    }
  }
  const owned = new Map();
  for (const spec of specs) {
    const namesake = [...docs.keys()].filter(doc => spec === doc || spec.startsWith(`${doc}-`)).sort((a, b) => b.length - a.length)[0];
    for (const doc of named.get(spec) ?? (namesake ? [namesake] : [])) {
      if (docs.get(doc).status === 'live') owned.set(doc, [...(owned.get(doc) ?? []), spec]);
    }
  }
  // The spec named after the doc leads; the rest follow by name.
  for (const [doc, list] of owned) owned.set(doc, [...list.filter(spec => spec === doc), ...list.filter(spec => spec !== doc)]);
  return owned;
}

/**
 * The index: each registry item's Counterpart (GLOSSARY) with the snapshot files that hold it, or why it has none.
 * `counterparts` is Neon's own table, { item: { core: '<doc>' } | { core: null, why } }; it must cover `items` exactly.
 */
function counterpartIndex({ items, counterparts, docs, files }) {
  const missing = items.filter(item => !(item in counterparts));
  if (missing.length) throw new Error(`The Counterpart table has no Counterpart entry for: ${missing.join(', ')}.`);
  const stale = Object.keys(counterparts).filter(item => !items.includes(item));
  if (stale.length) throw new Error(`The Counterpart table names items that are not registry items: ${stale.join(', ')}.`);
  return Object.fromEntries(items.map(item => {
    const { core, why } = counterparts[item];
    if (core === null) {
      if (!why) throw new Error(`${item}: an item with no Counterpart needs a why.`);
      return [item, { counterpart: null, why }];
    }
    const doc = docs.get(core);
    if (!doc) throw new Error(`${item}: its Counterpart ${core}: no such doc in Core.`);
    if (doc.status !== 'live') throw new Error(`${item}: its Counterpart ${core} is a ${doc.status ?? 'guide, not a component'} doc in Core, which the snapshot leaves out.`);
    const values = `components/${core}.json`;
    return [item, { counterpart: docTitle(doc.text), doc: `components/${core}.md`, ...(files.has(values) ? { values } : {}), ...(why ? { why } : {}) }];
  }));
}

/** Compiles the snapshot from the Core checkout at `from` into `out`, replacing what was there. */
export async function syncCore({ from, out, items, counterparts }) {
  const commit = git(from, 'rev-parse', 'HEAD');
  const uncommitted = git(from, 'status', '--porcelain', '--', ...CORE_SOURCES);
  if (uncommitted) throw new Error(`The Core checkout at ${from} has uncommitted changes, so no commit names what would be compiled:\n${uncommitted}`);
  const files = new Map();
  const componentsDir = join(from, 'docs/components');
  const entries = (await readdir(componentsDir)).filter(name => !name.startsWith('_')).sort();
  const docs = new Map();
  for (const name of entries.filter(name => name.endsWith('.md'))) {
    const text = await readFile(join(componentsDir, name), 'utf8');
    docs.set(name.slice(0, -3), { text, status: docStatus(text) });
  }
  const live = new Set([...docs].filter(([, doc]) => doc.status === 'live').map(([name]) => name));
  const read = path => readFile(join(from, path), 'utf8');
  const architecture = await read('docs/architecture.md');
  const scales = readScales({ architecture, glossary: await read('GLOSSARY.md') });
  const textStyles = readTextStyles(architecture);
  const theme = JSON.parse(await read('docs/theme/theme.json'));
  const resolve = resolver({ scales, textStyles, theme });
  const owned = specOwners(entries, docs);
  for (const name of live) {
    const { text } = docs.get(name);
    files.set(`components/${name}.md`, webDoc(text, { live, number: resolve.number }));
    const specs = owned.get(name);
    if (!specs) continue;
    const sets = [];
    for (const spec of specs) sets.push(webSpec(JSON.parse(await read(`docs/components/${spec}.spec.json`)), resolve, `docs/components/${spec}.spec.json`));
    files.set(`components/${name}.json`, specJson(docTitle(text), sets));
  }
  const byName = record => Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true })));
  const data = value => `${JSON.stringify(value, null, 2)}\n`;
  files.set('hierarchy.md', webHierarchy(await read('docs/hierarchy.md'), live));
  files.set('theme.json', data(webTheme(theme)));
  files.set('scales.json', data({ ...scales, ...byName(resolve.radii) }));
  files.set('text-styles.json', data(textStyles));
  files.set('index.json', data(counterpartIndex({ items, counterparts, docs, files })));
  // The manifest: where the snapshot came from, the look it was compiled at, and each file's hash for the repository check.
  const hashes = Object.fromEntries([...files].sort(([a], [b]) => (a < b ? -1 : 1)).map(([path, content]) => [path, sha256(content)]));
  files.set(MANIFEST, data({ core: { repository: CORE_REPOSITORY, commit }, look: { iOS: false, textSize: 'Large' }, files: hashes }));
  await rm(out, { recursive: true, force: true });
  for (const [path, content] of files) {
    await mkdir(dirname(join(out, path)), { recursive: true });
    await writeFile(join(out, path), content);
  }
  return { commit, files: [...files.keys()] };
}

async function filesUnder(directory, prefix = '') {
  const entries = await readdir(join(directory, prefix), { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => (entry.isDirectory() ? filesUnder(directory, `${prefix}${entry.name}/`) : [`${prefix}${entry.name}`])));
  return nested.flat();
}

/**
 * The repository check for the snapshot at `directory`: every file is the one the sync wrote, the index points
 * only at docs the snapshot holds, and, where the registry is at hand, the index covers `items` exactly.
 */
export async function checkCoreSnapshot(directory, { items } = {}) {
  const problems = [];
  const read = path => readFile(join(directory, path), 'utf8');
  const { files } = JSON.parse(await read(MANIFEST));
  const present = (await filesUnder(directory)).filter(path => path !== MANIFEST);
  for (const path of present.filter(path => !(path in files))) problems.push(`${path} is not a file the sync wrote.`);
  for (const [path, hash] of Object.entries(files)) {
    if (!present.includes(path)) problems.push(`${path} is missing.`);
    else if (sha256(await read(path)) !== hash) problems.push(`${path} does not match what the sync wrote.`);
  }
  if (present.includes('index.json')) {
    const index = JSON.parse(await read('index.json'));
    for (const [item, entry] of Object.entries(index)) {
      for (const path of [entry.doc, entry.values].filter(Boolean)) {
        if (!present.includes(path)) problems.push(`The index sends ${item} to ${path}, which the snapshot does not hold.`);
      }
    }
    if (items) {
      const uncovered = items.filter(item => !(item in index));
      if (uncovered.length) problems.push(`The index has no entry for registry items: ${uncovered.join(', ')}.`);
      const stale = Object.keys(index).filter(item => !items.includes(item));
      if (stale.length) problems.push(`The index names items the registry does not have: ${stale.join(', ')}.`);
    }
  }
  if (problems.length) {
    throw new Error(`The Core snapshot in ${directory} is not the one the sync wrote:\n${problems.join('\n')}\nThe snapshot is never edited by hand: change Core, or the Counterpart table, and re-run node scripts/sync-core.mjs --from <Core checkout>.`);
  }
}
