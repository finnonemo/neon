#!/usr/bin/env node
/**
 * theme-brief.mjs — Theme Briefs from the Neon registry, for neon-create.
 * A thin CLI over ./lib/theme-brief.mjs.
 *
 * Usage:
 *   node theme-brief.mjs list            # the briefs in the registry index
 *   node theme-brief.mjs match <file>    # is this file a Theme Brief?
 *
 * Both read the registry `install.mjs --new` and `--add` read: the release
 * this package pins, or --registry <url> / NEON_REGISTRY_URL (maintainers
 * and the eval runner).
 *
 * list:  one line per brief: item name, title, theme, occasion and tagline.
 *        Exits 2 when the index is unreachable.
 * match: the first line is the verdict, `Theme Brief: <item>`,
 *        `Differs: <item>` or `Reference Design: <reason>`. Exits 0 for
 *        every verdict.
 *
 * Exits 1 on a usage error.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { neonRegistryUrl } from './lib/registry.mjs';
import { listThemeBriefs, matchThemeBrief } from './lib/theme-brief.mjs';

const USAGE = 'Usage: node theme-brief.mjs list | match <file> [--registry <url>]';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

let parsed;
try {
  parsed = parseArgs({ allowPositionals: true, options: { registry: { type: 'string' } } });
} catch (err) {
  console.error(`${err.message}\n${USAGE}`);
  process.exit(1);
}
const [command, file, ...extra] = parsed.positionals;
if (!((command === 'list' && !file) || (command === 'match' && file)) || extra.length > 0) {
  console.error(USAGE);
  process.exit(1);
}
const url = await neonRegistryUrl({ registry: parsed.values.registry, root });

if (command === 'list') {
  try {
    const briefs = await listThemeBriefs({ url });
    if (briefs.length === 0) console.log('The registry lists no Theme Briefs.');
    for (const brief of briefs) console.log(`${brief.name}: ${brief.title} (theme ${brief.theme}, occasion ${brief.occasion}) — ${brief.tagline}`);
  } catch (err) {
    console.log(`${err.message}.`);
    process.exit(2);
  }
} else {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`Cannot read ${file}: ${err.message}`);
    process.exit(1);
  }
  const result = await matchThemeBrief({ text, url });
  if (result.verdict === 'brief') {
    console.log(`Theme Brief: ${result.item}\nIts content equals the registry item. Immersive Theme: ${result.theme}.`);
  } else if (result.verdict === 'differs') {
    console.log(`Differs: ${result.item}\nIts header names ${result.item}, but its content differs from the registry item: an older release or a hand edit.`);
  } else {
    console.log(`Reference Design: ${result.reason}.`);
  }
}
