// The Core snapshot (GLOSSARY): the compiled copy of Core that Neon carries,
// pinned to one Core commit (ADR 0009). syncCore compiles it from a Core
// checkout; checkCoreSnapshot is the repository check that refuses a hand edit.
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { listFiles } from './plain-text-references.mjs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, join, sep } from 'node:path';

export const SNAPSHOT_DIR = 'core';
const CORE_REPOSITORY = 'pawisssh/design-system';
export const COUNTERPARTS_FILE = 'registry/core-counterparts.json';
const MANIFEST = 'snapshot.json';

// What the sync reads in a Core checkout.
const CORE_SOURCES = ['GLOSSARY.md', 'docs/architecture.md', 'docs/hierarchy.md', 'docs/adr/0003-hit-target-on-root.md', 'docs/theme/theme.json', 'docs/components'];
const sha256 = content => createHash('sha256').update(content).digest('hex');

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

/**
 * A Core doc's standing, from its `> Status:` line: only approved docs enter the snapshot (ADR 0009).
 * Core writes a built doc as "Built …" and a changed one as "Changed … approved … and built", so approval
 * is read from the line saying approved or built; a line that says neither is not taken on trust.
 */
function docStatus(text) {
  const status = text.match(/^> Status: (.*)$/m)?.[1];
  if (!status) return null;
  const plain = status.replace(/[*_`]/g, '').trimStart();
  if (/^Deprecated/i.test(plain)) return 'deprecated';
  if (/^Draft/i.test(plain)) return 'draft';
  return /\b(approved|built)\b/i.test(plain) ? 'approved' : 'unread';
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
// Columns the web has no use for: the native looks, and Figma's count of variants (which counts both looks).
const LEFT_OUT_COLUMNS = /^`?(iOS|Android|Variants)`?$|iOS\s*=\s*True/;
// "Revision 1 R2 (a):" cites the Revision a rule came from. The rule stays; the citation goes.
const CITATION = /\bRevisions? \d+(?: [A-Z]+\d+)?(?: \([a-z]\))?:?\s*/g;
// The look axis as one term of an axes list: `Detent` Medium · Large × `iOS` True · False.
const LOOK_AXIS = /^`iOS` (?:True · False|False · True)\b/;

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
function relink(text, { approved, root }) {
  return text.replace(/\[([^\]]*)\]\(([^)\s]*)\)/g, (whole, label, target) => {
    if (/^Revisions?\b/.test(label) || /^#revision-/.test(target)) return '';
    if (/^https?:/.test(target)) return /github\.com\/pawisssh\/|figma\.com/.test(target) ? label : whole;
    const file = target.split('#')[0];
    if (!root && file === '../hierarchy.md') return `[${label}](../hierarchy.md)`;
    return approved.has(docLink(file, root)) ? `[${label}](${file})` : label;
  });
}

/** A run of prose as its text outside parentheses and its balanced parentheticals, in order. Code spans open nothing. */
function parentheticals(text) {
  const parts = [];
  let depth = 0;
  let start = 0;
  let code = false;
  for (let at = 0; at < text.length; at += 1) {
    if (text[at] === '`') code = !code;
    if (code) continue;
    if (text[at] === '(') {
      if (depth === 0) { parts.push({ text: text.slice(start, at) }); start = at; }
      depth += 1;
    } else if (text[at] === ')' && depth > 0) {
      depth -= 1;
      if (depth === 0) { parts.push({ inside: text.slice(start + 1, at) }); start = at + 1; }
    }
  }
  // A parenthesis that never closes is plain text.
  parts.push({ text: text.slice(start) });
  return parts;
}

/**
 * Prose with its native-only clauses out. A parenthetical loses its native-only and superseded ("was …") parts,
 * and goes whole when nothing is left, so a sentence is never cut open inside one.
 */
function webClauses(text, inside = false) {
  const kept = [];
  let flat = '';
  for (const part of parentheticals(text)) {
    if ('text' in part) { flat += part.text; continue; }
    const web = webClauses(part.inside, true);
    if (web) { flat += `\u0001${kept.length}\u0001`; kept.push(`(${web})`); } else flat = flat.trimEnd();
  }
  const clauses = inside ? flat.split(/;\s+/) : flat.split(/(?<=[.;][*_"”]{0,2})\s+/);
  const web = clauses.filter(clause => clause.trim() && !nativeOnly(clause) && !(inside && /^was\b/.test(clause.trim())));
  return web.join(inside ? '; ' : ' ').replace(/\u0001(\d+)\u0001/g, (_, index) => kept[index]).trim();
}

/** One run of prose for the web: links relinked, Revision citations and the look axis out, native-only clauses out. */
function webProse(text, links) {
  const cited = relink(text, links).replace(CITATION, '');
  const axes = /`iOS` (?:True|False) · /.test(cited) ? cited.split(' × ').filter(term => !LOOK_AXIS.test(term.trim())).join(' × ') : cited;
  return webClauses(axes).replace(/\(\s*[,;·]\s*/g, '(').replace(/\s*\((?:\s|,|·|–|-|and|to)*\)/g, '').replace(/ {2,}/g, ' ').trim();
}

const cells = row => row.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(cell => cell.trim());

const ruleRow = row => row.every(cell => /^:?-+:?$/.test(cell));

/**
 * One table for the web. A variables table that splits its values into `True` and `False` columns keys them by
 * the look on the rows that say `iOS`, and by something else on the rest: the look's rows keep their `False` value,
 * the rest keep both, in one `Values` column.
 */
function webTable(lines, links) {
  const indent = lines[0].match(/^\s*/)[0];
  let rows = lines.map(cells);
  const headed = rows[1] && ruleRow(rows[1]);
  if (headed) {
    const [key, native, web] = ['Keyed by', 'True', 'False'].map(name => rows[0].indexOf(name));
    if (key > -1 && native > -1 && web > -1) {
      let keyedBy = '';
      rows = rows.map((row, index) => {
        if (index === 0) return row.map((cell, column) => (column === web ? 'Values' : cell));
        if (index === 1) return row;
        if (row[0] || row[key]) keyedBy = row[key];
        const look = /^`?iOS`?$/.test(keyedBy);
        const value = look ? (/^same$/i.test(row[web]) ? row[native] : row[web]) : [row[native], row[web]].filter(Boolean).join('; ');
        return row.map((cell, column) => (column === web ? value : cell));
      }).map(row => row.filter((_, column) => column !== native));
    }
    const left = rows[0].map(cell => LEFT_OUT_COLUMNS.test(cell));
    rows = rows.map(row => row.filter((_, column) => !left[column]));
  }
  const out = [];
  for (const [index, row] of rows.entries()) {
    if (ruleRow(row)) { out.push(`${indent}| ${row.join(' | ')} |`); continue; }
    // A row for the look axis, or one whose subject is native, has nothing to say to the web.
    if (/^`?iOS`?$/.test(row[0]) || nativeOnly(row[0])) continue;
    // A row about a doc the snapshot leaves out has nothing left to point at.
    if (links.root && [...lines[index].matchAll(/\]\(([^)#\s]*)/g)].some(([, file]) => docLink(file, true) && !links.approved.has(docLink(file, true)))) continue;
    const web = row.map(cell => webProse(cell, links).replace(/[:;]$/, ''));
    if (web.slice(1).every(cell => !cell) && row.slice(1).some(Boolean)) continue;
    out.push(`${indent}| ${web.join(' | ')} |`);
  }
  // A table left with only its heading says nothing.
  return headed && out.length <= 2 ? [] : out;
}

/** A kept section's lines for the web: native rows, columns and clauses out, links relinked. */
function webLines(lines, links) {
  const out = [];
  let fence = false;
  let table = [];
  const closeTable = () => { if (table.length) out.push(...webTable(table, links)); table = []; };
  for (const line of lines) {
    if (!fence && /^\s*\|/.test(line)) { table.push(line); continue; }
    closeTable();
    if (/^\s*(```|~~~)/.test(line)) { fence = !fence; out.push(line); continue; }
    if (fence) { if (!nativeOnly(line)) out.push(line); continue; }
    const [, lead, body] = line.match(/^(\s*(?:[-*+]|\d+\.)\s+(?:\[[ x]\]\s+)?|\s*#{3,6}\s+|\s*>\s*)?(.*)$/);
    if (!body.trim()) { out.push(line); continue; }
    const web = webProse(body, links);
    // A checklist item reduced to its number, or a lead-in left with only its label, said only native things. A bold sentence is a rule of its own and stays.
    if (web && !/^\d+\.?$/.test(web) && !/^\*\*[^*]*[^*.!?]\*\*:?$/.test(web)) out.push(`${lead ?? ''}${web}`);
  }
  closeTable();
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// A doc writes a Component variable's alias as `→Spacing/spacing-05`: the web needs the number the step holds.
const STEP_ALIAS = /→(`?)((?:Spacing|Sizing|Radius)\/[\w-]+(?: \(radius-[\w-]+\))?)/g;
const stepNumbers = (text, number) => text.replace(STEP_ALIAS, (whole, tick, target) => {
  const value = number(target);
  return value === undefined ? `${tick}${target}` : `${tick}${target} = ${value}`;
});

/** A Core component doc compiled for the web: its `iOS=False` look and rules, without Figma or native detail. */
function webDoc(text, { approved, number }) {
  const title = docTitle(text);
  const parts = [`# ${title}`, `> Core's ${title}, compiled for the web: the \`iOS=False\` look at the Large text size. Generated by the Core sync; do not edit.`];
  for (const [heading, lines] of sections(text)) {
    if (!WEB_SECTIONS.includes(heading)) continue;
    const body = stepNumbers(webLines(lines, { approved }), number);
    if (body) parts.push(`## ${heading}`, body);
  }
  return `${parts.join('\n\n')}\n`;
}

/** Core's hierarchy rules for the web, with links re-rooted at the snapshot. */
function webHierarchy(text, approved) {
  const parts = [`# ${docTitle(text)}`, '> Core\'s hierarchy rules, compiled for the web. Generated by the Core sync; do not edit.'];
  for (const [heading, lines] of sections(text)) {
    const body = webLines(lines, { approved, root: true });
    if (body) parts.push(`## ${heading}`, body);
  }
  return `${parts.join('\n\n')}\n`;
}

// ---- Scale steps and text styles. Core keeps these as prose, not data, so each is read from the sentence or table that states it.

function stated(text, pattern, what) {
  const match = text.match(pattern);
  if (!match) throw new Error(`Core no longer states ${what} where the sync reads it (${pattern}).`);
  return match;
}
const numbers = list => list.split(/[,/]/).map(value => Number(value.trim()));

/**
 * Scale steps by alias target, e.g. `Spacing/spacing-05` → 16. The `Round` radius, which draws a Capsule, has its
 * number only in Button's variables table.
 */
function readScales({ architecture, glossary, button }) {
  const scales = {};
  numbers(stated(architecture, /`spacing-00`–`13`: ([\d, ]+)\)/, 'the Spacing steps')[1])
    .forEach((value, step) => { scales[`Spacing/spacing-${String(step).padStart(2, '0')}`] = value; });
  const [, controls, hitTarget] = stated(architecture, /`control-xsmall` … `control-xlarge` \(([\d /]+)\) and `hit-target` \((\d+)\)/, 'the Sizing control steps');
  ['xsmall', 'small', 'medium', 'large', 'xlarge'].forEach((size, index) => { scales[`Sizing/control-${size}`] = numbers(controls)[index]; });
  scales['Sizing/hit-target'] = Number(hitTarget);
  const strokes = [...glossary.matchAll(/`(stroke-[\w-]+|focus-ring)` (\d+)/g)];
  if (!strokes.length) throw new Error('Core no longer states the stroke steps where the sync reads them (GLOSSARY, Scale step).');
  for (const [, name, value] of strokes) scales[`Sizing/${name}`] = Number(value);
  scales['Radius/radius-round'] = Number(stated(button, /\| Radius \| (\d+) \(Capsule\)/, 'the Round radius (Button, its variables table)')[1]);
  return scales;
}

/** The Hit target each control size holds, as the shared variables every control's Root binds: `Interactive/Large/Interactive min-height` → 56. */
function readHitTargets(adr) {
  const sizes = stated(adr, /`Interactive\/<Size>\/Interactive min-height` \(((?:\w+ \d+(?:, )?)+)\)/, 'the Hit target sizes (ADR 0003)')[1];
  return Object.fromEntries(sizes.split(', ').map(entry => entry.split(' ')).map(([size, value]) => [`Interactive/${size}/Interactive min-height`, Number(value)]));
}

/** Text styles at the Large text size, by step: `Body` → { size, lineHeight }, `Icon/Large` → … */
function readTextStyles(architecture) {
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
// A spec may carry the sets nested in its component (Toggle's `_Toggle Item`), each with its own axes and bindings.
const withNested = spec => [spec, ...(spec.nested ?? []).map(set => ({ ...set, componentSet: { name: set.name } }))];
const boundVariable = ({ value, literal }) => !literal && typeof value === 'string' && value.startsWith('Components/');

/**
 * The variable names a binding reaches at one look. A binding writes its path once for every variant it covers
 * (`Components/Toggle/Thumb/{{iOS=*}}/Radius`): the look's placeholder takes the look, any other takes one path segment.
 */
function reach(value, look) {
  const path = value.slice('Components/'.length).replace(/\{\{iOS=\*\}\}/g, look);
  return new RegExp(`^${path.split(/\{\{[^}]*\}\}/).map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[^/]+')}$`);
}

function resolver({ scales, textStyles, theme }) {
  // Core keeps no list of Radius steps: the ones its specs and docs alias are collected as they resolve.
  const radii = {};
  const number = target => {
    if (target in scales) return scales[target];
    const radius = target.match(/^Radius\/(?:(\d+)px|(None)|(Round)) \((radius-[\w-]+)\)$/);
    if (radius) return (radii[`Radius/${radius[4]}`] = radius[3] ? scales['Radius/radius-round'] : Number(radius[1] ?? 0));
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
function webTheme(theme) {
  const side = (token, mode) => themeColor(theme, token, mode)
    ?? (() => { throw new Error(`docs/theme/theme.json: ${token} names ${theme.tokens[token][mode === 'light' ? 0 : 1]}, which is neither a primitive, a token nor a hex.`); })();
  return Object.fromEntries(Object.keys(theme.tokens).filter(token => !NOT_A_COLOR.test(token))
    .map(token => [token, { light: side(token, 'light'), dark: side(token, 'dark') }]));
}

/**
 * What Core's specs say across components: every Component variable by name (a spec may bind another spec's, and
 * every control binds the shared Hit target), and the names only the `iOS=True` look reaches.
 */
function specRecord(specs, hitTargets) {
  const variables = new Map(Object.entries(hitTargets).map(([name, value]) => [name, { name, type: 'FLOAT', value }]));
  const web = new Map();
  const native = new Map();
  for (const spec of specs) {
    for (const variable of spec.variables ?? []) if (!variables.has(variable.name)) variables.set(variable.name, variable);
    for (const layer of withNested(spec).flatMap(set => set.layers ?? [])) {
      for (const binding of Object.values(layer.automations ?? {}).flat().filter(boundVariable)) {
        const both = !nativeLook(binding.condition);
        if (both) web.set(binding.value, reach(binding.value, 'False'));
        if (!both || binding.value.includes('{{iOS=*}}')) native.set(binding.value, reach(binding.value, 'True'));
      }
    }
  }
  const reached = (patterns, name) => [...patterns.values()].some(pattern => pattern.test(name));
  const names = [...variables.keys()];
  const onWeb = new Set(names.filter(name => reached(web, name)));
  const nativeOnly = new Set(names.filter(name => !onWeb.has(name) && reached(native, name)));
  // A group only the native look binds (`Toggle/Track/True`) is native whole: its unbound records (`Layout horizontal`) go with it.
  const group = name => name.slice(0, name.lastIndexOf('/'));
  const webGroups = new Set([...onWeb].map(group));
  const nativeGroups = new Set([...nativeOnly].map(group).filter(path => !webGroups.has(path)));
  for (const name of names) if (nativeGroups.has(group(name))) nativeOnly.add(name);
  return { variables, nativeOnly };
}

/** One Core spec for the web: its variables, and the ones its bindings reach, as numbers and hexes; bindings without the iOS=True look. */
function webSpec(spec, { number, color }, { variables: recorded, nativeOnly }, file) {
  const alias = value => (typeof value === 'string' && value.startsWith('→') ? value.slice(1) : null);
  const resolved = variable => {
    const fail = target => { throw new Error(`${file}: ${variable.name} aliases ${target}, which Core records no value for where the sync reads it.`); };
    if (variable.type !== 'COLOR') {
      const target = alias(variable.value);
      return target === null ? variable.value : number(target) ?? fail(target);
    }
    const targets = { light: alias(variable.values?.Light ?? variable.value), dark: alias(variable.values?.Dark ?? variable.value) };
    return Object.fromEntries(Object.entries(targets).map(([mode, target]) =>
      [mode, (target && color(target, mode)) ?? fail(target ?? JSON.stringify(variable.values ?? variable.value))]));
  };
  const variables = {};
  for (const variable of spec.variables ?? []) if (!nativeOnly.has(variable.name)) variables[variable.name] = resolved(variable);
  const bindings = [];
  for (const layer of spec.layers ?? []) {
    const where = layer.layerPath.join(' / ') || '(root)';
    for (const [property, automations] of Object.entries(layer.automations ?? {})) {
      if (/^componentProperties\.iOS\b/.test(property)) continue;
      for (const binding of automations) {
        if (nativeLook(binding.condition)) continue;
        const value = typeof binding.value === 'string' ? binding.value.replace(/\{\{iOS=\*\}\}/g, 'False') : binding.value;
        if (boundVariable(binding)) {
          // A binding to a variable kept in another spec, or to the shared Hit target, brings that variable's value here.
          const pattern = reach(binding.value, 'False');
          const names = Object.keys(variables).some(name => pattern.test(name)) ? [] : [...recorded.keys()].filter(name => pattern.test(name) && !nativeOnly.has(name));
          for (const name of names) variables[name] = resolved(recorded.get(name));
          if (!names.length && !Object.keys(variables).some(name => pattern.test(name))) throw new Error(`${file}: ${where} binds ${property} to ${value}, a variable no Core spec records.`);
        }
        // A binding straight to a Scale step or a text style's metric is that number on the web.
        const step = !binding.literal && /^(Spacing|Sizing|Radius|Dynamic Type)\//.test(value);
        if (step && number(value) === undefined) throw new Error(`${file}: ${where} binds ${property} to ${value}, which Core records no value for where the sync reads it.`);
        bindings.push({ layer: where, property, when: atWebLook(binding.condition), value: step ? number(value) : value, ...(binding.literal || step ? { literal: true } : {}) });
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
      if (docs.get(doc).status === 'approved') owned.set(doc, [...(owned.get(doc) ?? []), spec]);
    }
  }
  // The spec named after the doc leads; the rest follow by name.
  for (const [doc, list] of owned) owned.set(doc, [...list.filter(spec => spec === doc), ...list.filter(spec => spec !== doc)]);
  return owned;
}

/**
 * The index: each registry item's Counterpart (GLOSSARY) with the snapshot files that hold it, or why it has none.
 * `counterparts` is the Counterpart table, { item: { core: '<doc>', why? } | { core: null, why } }; it must cover
 * `items` exactly. A Supporting item (GLOSSARY) has no Counterpart of its own.
 */
function counterpartIndex({ items, counterparts, docs, files }) {
  const names = items.map(item => item.name);
  const missing = names.filter(name => !(name in counterparts));
  if (missing.length) throw new Error(`The Counterpart table has no Counterpart entry for: ${missing.join(', ')}.`);
  const stale = Object.keys(counterparts).filter(name => !names.includes(name));
  if (stale.length) throw new Error(`The Counterpart table names items that are not registry items: ${stale.join(', ')}.`);
  return Object.fromEntries(items.map(({ name, supporting }) => {
    const { core, why } = counterparts[name];
    if (supporting && core !== null) throw new Error(`${name} is a Supporting item, which has no Counterpart of its own: the Counterpart table gives it ${core}.`);
    if (core === null) {
      if (!why) throw new Error(`${name}: an item with no Counterpart needs a why.`);
      return [name, { counterpart: null, ...(supporting ? { supporting: true } : {}), why }];
    }
    const doc = docs.get(core);
    if (!doc) throw new Error(`${name}: its Counterpart ${core}: no such doc in Core.`);
    if (doc.status !== 'approved') throw new Error(`${name}: its Counterpart ${core} is ${{ draft: 'a draft', deprecated: 'a deprecated', unread: 'a doc whose Status says neither approved nor built,' }[doc.status] ?? 'a guide, not a component'} doc in Core, which the snapshot leaves out.`);
    const values = `components/${core}.json`;
    return [name, { counterpart: docTitle(doc.text), doc: `components/${core}.md`, ...(files.has(values) ? { values } : {}), ...(why ? { why } : {}) }];
  }));
}

// What the snapshot leaves out (ADR 0009), as it would show in a compiled file. The sync refuses to write one.
// A doc may still say a nested part follows the look ("{{iOS=*}}"); a value never does.
const LEFT_OUT = [[/iOS\s*=\s*True/, 'the iOS=True look'], [/\{\{iOS/, 'a value that depends on the look', /\.json$/], [/→`?(Spacing|Sizing|Radius|Dynamic Type)\//, 'a Scale alias with no number'],
  [/Dynamic Type/, 'Dynamic Type'], [/\bRevisions?\b/, 'Revision history'], [/figma\.com|\b\d{2,}:\d{2,}\b/, 'a Figma link or node id']];
const leftOutOf = (path, content) => LEFT_OUT.flatMap(([pattern, what, only]) => {
  const line = (!only || only.test(path)) && content.split('\n').find(candidate => pattern.test(candidate));
  return !line ? [] : [`${what}: ${line.trim().slice(0, 160)}`];
});
const sealOf = ({ core, look, files }) => sha256(JSON.stringify({ core, look, files }));

/**
 * Compiles the snapshot from the Core checkout at `from` into `out`, replacing what was there.
 * `items` are the registry's components, as { name, supporting }. Returns the commit, the files written and the Core docs left out, by status.
 */
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
  const approved = new Set([...docs].filter(([, doc]) => doc.status === 'approved').map(([name]) => name));
  const read = path => readFile(join(from, path), 'utf8');
  const architecture = await read('docs/architecture.md');
  const scales = readScales({ architecture, glossary: await read('GLOSSARY.md'), button: docs.get('button')?.text ?? '' });
  const textStyles = readTextStyles(architecture);
  const theme = JSON.parse(await read('docs/theme/theme.json'));
  const resolve = resolver({ scales, textStyles, theme });
  const owned = specOwners(entries, docs);
  const specs = new Map();
  for (const name of entries.filter(name => name.endsWith('.spec.json'))) specs.set(name.slice(0, -'.spec.json'.length), JSON.parse(await read(`docs/components/${name}`)));
  const record = specRecord([...specs.values()], readHitTargets(await read('docs/adr/0003-hit-target-on-root.md')));
  for (const name of approved) {
    const { text } = docs.get(name);
    files.set(`components/${name}.md`, webDoc(text, { approved, number: resolve.number }));
    const sets = (owned.get(name) ?? []).flatMap(spec => withNested(specs.get(spec)).map(set => webSpec(set, resolve, record, `docs/components/${spec}.spec.json`)));
    if (sets.length) files.set(`components/${name}.json`, specJson(docTitle(text), sets));
  }
  const byName = record => Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true })));
  const data = value => `${JSON.stringify(value, null, 2)}\n`;
  files.set('hierarchy.md', webHierarchy(await read('docs/hierarchy.md'), approved));
  files.set('theme.json', data(webTheme(theme)));
  files.set('scales.json', data({ ...scales, ...byName(resolve.radii) }));
  files.set('text-styles.json', data(textStyles));
  files.set('index.json', data(counterpartIndex({ items, counterparts, docs, files })));
  const leaks = [...files].flatMap(([path, content]) => leftOutOf(path, content).map(what => `${path} would hold ${what}`));
  if (leaks.length) throw new Error(`The sync left in what the snapshot leaves out, so nothing was written:\n${leaks.join('\n')}`);
  // The manifest: where the snapshot came from, the look it was compiled at, each file's hash for the repository check, and a seal over all three.
  const hashes = Object.fromEntries([...files].sort(([a], [b]) => (a < b ? -1 : 1)).map(([path, content]) => [path, sha256(content)]));
  const manifest = { core: { repository: CORE_REPOSITORY, commit }, look: { iOS: false, textSize: 'Large' }, files: hashes };
  files.set(MANIFEST, data({ ...manifest, seal: sealOf(manifest) }));
  await rm(out, { recursive: true, force: true });
  for (const [path, content] of files) {
    await mkdir(dirname(join(out, path)), { recursive: true });
    await writeFile(join(out, path), content);
  }
  const leftOut = Object.fromEntries([...docs].filter(([, doc]) => doc.status && doc.status !== 'approved').map(([name, doc]) => [name, doc.status]));
  return { commit, files: [...files.keys()], leftOut };
}

/**
 * The repository check for the snapshot at `directory`: every file is the one the sync wrote, the index points
 * only at docs the snapshot holds, and, where the registry is at hand, the index covers `items` exactly.
 */
export async function checkCoreSnapshot(directory, { items } = {}) {
  const problems = [];
  const read = path => readFile(join(directory, path), 'utf8');
  const manifest = JSON.parse(await read(MANIFEST));
  const { files } = manifest;
  if (manifest.seal !== sealOf(manifest)) problems.push(`${MANIFEST} does not match what the sync wrote.`);
  const present = (await listFiles(directory)).map(path => path.split(sep).join('/')).filter(path => path !== MANIFEST);
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
