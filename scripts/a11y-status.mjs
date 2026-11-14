#!/usr/bin/env node
// Each registry UI item's accessibility testing status, read from what the
// browser suite actually does, never written by hand. It reads files and runs
// nothing:
//
//   node scripts/a11y-status.mjs [--json]
//
// Columns, after Carbon's per-component testing status:
//   axe      the item is imported by a screen neon-a11y.spec.mjs runs axe on
//            (fixtures/neon/{Approval,Extras,Expansion}.tsx and expansion/)
//   checks   neon-a11y.spec.mjs tests whose title names the item, plus the
//            item's own checks when its expansion module exports `a11y`
//   reader   manual screen-reader passes from registry/screen-reader-passes.json,
//            "Not tested" until someone runs one
//
// The browser suite passing is what makes these "Tested": run it before quoting
// the table for a release.
import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const templates = 'evals/templates';

// The words a test title uses for an item whose name it does not spell out.
// The segmented control's title calls it "one radio group", so Radio group's own tests are its expansion checks.
const titleWords = { 'dropdown-menu': ['menu'], sonner: ['toast'], 'date-picker': ['datepicker'], 'list-row': ['list row'], 'radio-group': [] };

export function uiItems() {
  return JSON.parse(read('registry/registry.json')).items
    .filter(item => item.type === 'registry:ui' && !item.meta?.supporting)
    .map(item => item.name);
}

// Items a fixture screen imports, from `@/components/ui/<item>` and, for the toast, `sonner`.
function importedBy(paths) {
  const found = new Set();
  for (const path of paths) {
    const source = read(path);
    for (const [, name] of source.matchAll(/@\/components\/ui\/([a-z-]+)/g)) found.add(name);
    if (/from "sonner"/.test(source)) found.add('sonner');
  }
  return found;
}

/** The spec's test titles, template literals included, lowercased. */
function specTitles(source) {
  return [...source.matchAll(/\btest\((['"`])((?:\\.|(?!\1).)*)\1/g)].map(([, , title]) => title.toLowerCase());
}

export function status() {
  const fixtures = `${templates}/fixtures/neon`;
  const screens = ['Approval.tsx', 'Extras.tsx', 'Expansion.tsx'].map(file => `${fixtures}/${file}`)
    .concat(readdirSync(join(root, fixtures, 'expansion')).map(file => `${fixtures}/expansion/${file}`));
  const axe = importedBy(screens);
  const titles = specTitles(read(`${templates}/neon-a11y.spec.mjs`));
  const ownChecks = new Set(readdirSync(join(root, templates, 'expansion'))
    .filter(file => /\bexport (const|function|async function) a11y\b/.test(read(`${templates}/expansion/${file}`)))
    .map(file => file.replace(/\.mjs$/, '')));
  const passesPath = 'registry/screen-reader-passes.json';
  const passes = existsSync(join(root, passesPath)) ? JSON.parse(read(passesPath)).passes : [];

  return uiItems().map(item => {
    const words = titleWords[item] ?? [item.replace(/-/g, ' ')];
    const named = titles.filter(title => words.some(word => new RegExp(`\\b${word}`).test(title))).length;
    const reader = passes.filter(pass => pass.item === item).map(({ reader, browser, date }) => `${reader} + ${browser}, ${date}`);
    return {
      item,
      axe: axe.has(item) ? 'Tested' : 'Not tested',
      checks: named + (ownChecks.has(item) ? 1 : 0),
      ownChecks: ownChecks.has(item),
      reader: reader.length ? reader.join('; ') : 'Not tested',
    };
  });
}

export function formatTable(rows) {
  const lines = ['| Item | axe (light and dark) | Behavior checks | Screen reader |', '|---|---|---|---|'];
  for (const { item, axe, checks, ownChecks, reader } of rows) {
    const named = checks - (ownChecks ? 1 : 0);
    const what = [named && `${named} spec test${named === 1 ? '' : 's'}`, ownChecks && 'expansion checks'].filter(Boolean).join(' + ') || 'None';
    lines.push(`| ${item} | ${axe} | ${what} | ${reader} |`);
  }
  return lines.join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const rows = status();
  console.log(process.argv.includes('--json') ? JSON.stringify(rows) : formatTable(rows));
}
