#!/usr/bin/env node
import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { existsSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const defaultSourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const PAYLOAD_ENTRIES = [
  ".claude-plugin",
  ".codex-plugin",
  "skills",
  "theme",
  "templates/vitejs-cds",

  "scripts/install.mjs",
  "scripts/assemble-starter.mjs",
  "scripts/source-lint.mjs",
  "scripts/lib",
  "LICENSE",
];

const EXCLUDED_NAMES = new Set([
  "node_modules",
  ".git",
  "dist",
  ".DS_Store",
  "tokens.report.json",
  "tokens.resolved.json",
  "notes",
]);

function copyFilter(src) {
  const parts = src.split(/[\\/]/);
  return !parts.some((part) => EXCLUDED_NAMES.has(part));
}

export async function packagePlugin({ sourceRoot = defaultSourceRoot, destination } = {}) {
  if (!destination) {
    throw new Error("packagePlugin: destination is required");
  }

  // Validate all required assets before creating or populating an output directory.
  for (const entry of PAYLOAD_ENTRIES) {
    if (!existsSync(join(sourceRoot, entry))) {
      throw new Error(`packagePlugin: missing required payload: ${entry}`);
    }
  }

  const resolvedDest = resolve(destination);

  if (existsSync(resolvedDest)) {
    const s = await stat(resolvedDest);
    if (!s.isDirectory()) {
      throw new Error(`packagePlugin: destination is not a directory: ${resolvedDest}`);
    }
    const files = await readdir(resolvedDest);
    if (files.length > 0) {
      throw new Error(`packagePlugin: destination is not empty: ${resolvedDest}`);
    }
  } else {
    await mkdir(resolvedDest, { recursive: true });
  }

  // Copy allowlisted payload entries
  for (const entry of PAYLOAD_ENTRIES) {
    const srcPath = join(sourceRoot, entry);
    const destPath = join(resolvedDest, entry);
    if (existsSync(srcPath)) {
      await cp(srcPath, destPath, {
        recursive: true,
        filter: copyFilter,
      });
    }
  }

  return {
    sourceRoot,
    destination: resolvedDest,
    entries: PAYLOAD_ENTRIES,
  };
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: node package-plugin.mjs <destination>");
    process.exit(1);
  }
  try {
    const res = await packagePlugin({ destination: target });
    console.log(`Plugin successfully packaged to: ${res.destination}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
