#!/usr/bin/env node
/**
 * DEPRECATED forwarding shim — the canonical installer now lives at
 * scripts/install.mjs (repo root). This file exists only so callers still
 * invoking the old theme/finnomena/scripts/install.mjs path keep working
 * for one more release; it forwards argv and exit status unchanged and
 * implements no installer logic of its own. Remove in a later announced
 * compatibility change — do not add a second implementation here.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const canonicalInstaller = join(__dirname, "..", "..", "..", "scripts", "install.mjs");

console.error(
  "Deprecation notice: theme/finnomena/scripts/install.mjs has moved to scripts/install.mjs. " +
    "Update callers to use the new path."
);

const result = spawnSync(process.execPath, [canonicalInstaller, ...process.argv.slice(2)], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
