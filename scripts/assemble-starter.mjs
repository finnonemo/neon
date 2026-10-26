#!/usr/bin/env node
/**
 * assemble-starter.mjs — maintainer CLI over assembleStarter(). Never
 * invokes a package manager; just combines starter source with the
 * canonical CDS theme files at <destination>. Use this to preview the
 * starter after editing canonical theme assets, or as a manual alternative
 * to install.mjs --new.
 *
 * Usage: node scripts/assemble-starter.mjs <destination>
 */
import { realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { assembleStarter } from "./lib/assemble-starter.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultSourceRoot = resolve(__dirname, "..");

// Run-as-script guard — safe to import this module
// (e.g. from tests) without triggering the CLI against the importing
// process's own argv.
function isRunAsScript() {
  if (!process.argv[1]) return false;
  try {
    return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
  } catch {
    return false;
  }
}

if (isRunAsScript()) {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: node scripts/assemble-starter.mjs <destination>");
    process.exit(1);
  }
  try {
    const result = await assembleStarter({ sourceRoot: defaultSourceRoot, destination: target });
    console.log(`Assembled starter into ${result.destination}`);
    console.log(`Theme files: ${result.themeFiles.join(", ")}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
