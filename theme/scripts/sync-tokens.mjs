#!/usr/bin/env node
/**
 * sync-tokens.mjs
 *
 * Resolves the raw Figma Variables/Token export in theme/tokens/*.json into a
 * flat, alias-resolved token map, then writes:
 *   - ../tokens.resolved.json   (every token that resolved, with hex colors
 *                                converted to CDS's "r,g,b" string format)
 *   - ../tokens.report.json     (counts + a list of every unresolved alias,
 *                                grouped by the missing root collection name)
 * Both land at theme/tokens.resolved.json / theme/tokens.report.json —
 * gitignored intermediates, not source of truth.
 *
 * This is intentionally generic: it does not hardcode Finnomena's token names,
 * so re-running it after new Figma collections are exported into
 * theme/tokens/ will pick them up automatically (this doubles as the seed
 * for the Phase 4 "token sync automation" step in the project brief).
 *
 * Usage (full regeneration pipeline — run all three in order after changing
 * anything in theme/tokens/*.json):
 *   node theme/scripts/sync-tokens.mjs && node theme/scripts/generate-theme-config.mjs && node theme/scripts/generate-breakpoints-config.mjs
 *
 * Nothing needs to sync a starter copy afterward — templates/vitejs-cds/ has
 * no tracked theme files of its own. scripts/assemble-starter.mjs pulls the
 * regenerated theme/cds/*.ts files in fresh at assembly time.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = join(__dirname, "..", "tokens");
const OUT_RESOLVED = join(__dirname, "..", "tokens.resolved.json");
const OUT_REPORT = join(__dirname, "..", "tokens.report.json");

/** Flatten a token JSON tree into { "a.b.c": {value, type} } leaf entries. */
function flatten(node, pathParts, out) {
  if (node && typeof node === "object" && "value" in node && "type" in node) {
    out[pathParts.join(".")] = { value: node.value, type: node.type };
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, child] of Object.entries(node)) {
      flatten(child, [...pathParts, key], out);
    }
  }
}

/**
 * Convert #rgb / #rgba / #rrggbb / #rrggbbaa to "r,g,b" (opaque) or
 * "r,g,b,a" (a as a 0-1 fraction) when an alpha channel is present.
 * Dropping alpha here would silently turn every translucent primitive
 * shade (the many "*A" opacity variants used throughout theme.json for
 * overlays, hover/disabled states, and subtle borders) into a fully
 * opaque color — a real, easy-to-miss correctness bug, not a style choice.
 */
function hexToRgbString(hex) {
  const m = hex.replace("#", "");
  const full = m.length === 3 || m.length === 4 ? m.split("").map((c) => c + c).join("") : m;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (full.length >= 8) {
    const aByte = parseInt(full.slice(6, 8), 16);
    const a = Math.round((aByte / 255) * 1000) / 1000;
    return `${r},${g},${b},${a}`;
  }
  return `${r},${g},${b}`;
}

// 1. Load every token file into: a global merged pool (exact-path keyed),
//    plus a filename-namespaced pool (e.g. modal.json's "small.min-width"
//    is also indexed as "modal.small.min-width"). Non-file entries (e.g. the
//    _archive/ subfolder of retired token exports) are skipped rather than
//    fed to JSON.parse.
const files = readdirSync(TOKENS_DIR, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith(".json"))
  .map((e) => e.name);
const pool = {}; // exact path -> {value, type, sourceFile}
const rawByFile = {};

for (const file of files) {
  const name = basename(file, ".json");
  const json = JSON.parse(readFileSync(join(TOKENS_DIR, file), "utf8"));
  rawByFile[name] = json;
  const flat = {};
  flatten(json, [], flat);
  for (const [path, entry] of Object.entries(flat)) {
    pool[path] = { ...entry, sourceFile: file };
    pool[`${name}.${path}`] = { ...entry, sourceFile: file };
  }
}

const NUMERIC_LITERAL = /^\{(-?\d+(?:\.\d+)?)(px)?\}$/;
const ALIAS = /^\{([^}]+)\}$/;

const missingByRoot = {}; // rootName -> Set of full alias strings that needed it
const resolved = {};
const unresolvedList = [];

function resolveValue(raw, seen = new Set()) {
  if (typeof raw !== "string") return { ok: true, value: raw };

  const numMatch = raw.match(NUMERIC_LITERAL);
  if (numMatch) return { ok: true, value: Number(numMatch[1]) };

  const aliasMatch = raw.match(ALIAS);
  if (!aliasMatch) return { ok: true, value: raw };

  const ref = aliasMatch[1];
  if (seen.has(ref)) return { ok: false, reason: "circular", ref };
  seen.add(ref);

  const segs = ref.split(".");
  const reportMissing = () => {
    const root = segs[0];
    (missingByRoot[root] ??= new Set()).add(ref);
    return { ok: false, reason: "missing", ref, root };
  };

  // A pool entry whose own raw value is textually identical to the alias
  // string pointing at it is a self-referential placeholder, not a genuine
  // circular reference between two different aliases — seen throughout this
  // export (e.g. theme.json's Colors.Navy.25 -> "{Navy.25}",
  // typography.json's "Large Title".Size -> "{Large Title.Size}"). Recursing
  // into it would just immediately hit the `seen` guard above and get
  // reported as "circular", which hides which root collection is actually
  // missing. Treat it as missing instead, right here, so the real gap
  // surfaces in tokens.report.json.
  const isSelfReference = (hitRaw) => hitRaw === raw;

  // Try: exact path, then mode-stripped ("light."/"dark." prefix removed),
  // then last-2-segments suffix match as a last resort.
  const candidates = [ref, ref.replace(/^light\./, ""), ref.replace(/^dark\./, "")];
  for (const c of candidates) {
    if (pool[c]) {
      if (isSelfReference(pool[c].value)) return reportMissing();
      return resolveValue(pool[c].value, seen);
    }
  }
  const suffix2 = segs.slice(-2).join(".");
  const suffixHit = Object.entries(pool).find(([p]) => p.endsWith("." + suffix2) || p === suffix2);
  if (suffixHit) {
    if (isSelfReference(suffixHit[1].value)) return reportMissing();
    return resolveValue(suffixHit[1].value, seen);
  }

  return reportMissing();
}

for (const [path, entry] of Object.entries(pool)) {
  const r = resolveValue(entry.value);
  if (r.ok) {
    let value = r.value;
    if (entry.type === "color" && typeof value === "string" && value.startsWith("#")) {
      value = hexToRgbString(value);
    }
    resolved[path] = { value, type: entry.type, sourceFile: entry.sourceFile };
  } else {
    unresolvedList.push({ path, type: entry.type, sourceFile: entry.sourceFile, blockedBy: r.ref, reason: r.reason, root: r.root });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    tokensSeen: Object.keys(pool).length,
    resolved: Object.keys(resolved).length,
    unresolved: unresolvedList.length,
  },
  missingRootCollections: Object.fromEntries(
    Object.entries(missingByRoot).map(([root, refs]) => [root, refs.size])
  ),
  unresolved: unresolvedList,
};

writeFileSync(OUT_RESOLVED, JSON.stringify(resolved, null, 2));
writeFileSync(OUT_REPORT, JSON.stringify(report, null, 2));

console.log(`Resolved ${report.totals.resolved} / ${report.totals.tokensSeen} tokens.`);
if (Object.keys(missingByRoot).length) {
  console.log("Blocked by missing root collections (export these from Figma to unblock):");
  // Different exports have used different casing for the same family
  // (e.g. old "navy" vs. new "Navy") — group case-insensitively for this
  // printed summary only. The JSON report above stays keyed by the literal
  // root string so it remains a faithful, ungrouped record.
  const displayGroups = new Map(); // lowercase root -> { label, count }
  for (const [root, refs] of Object.entries(missingByRoot)) {
    const key = root.toLowerCase();
    const g = displayGroups.get(key) ?? { label: root, count: 0 };
    g.count += refs.size;
    displayGroups.set(key, g);
  }
  for (const { label, count } of [...displayGroups.values()].sort((a, b) => b.count - a.count)) {
    console.log(`  - ${label}  (${count} references)`);
  }
}
