#!/usr/bin/env node
/**
 * smoke-new-app.mjs — the disposable app build that AGENTS.md requires for
 * app, template and theme changes: runs the installer with --new (real
 * dependency install, needs network), then the app's production build.
 * A passing step prints one summary line; a failing step prints its full
 * output and stops. Exits with the failing step's status.
 *
 * Usage: node scripts/smoke-new-app.mjs [destination]
 *
 * The destination must be missing or empty and should sit outside the
 * repository (default: a fresh directory under the OS temp dir). It is
 * kept afterwards so the app can be previewed or inspected.
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destination = process.argv[2] ? resolve(process.argv[2]) : join(mkdtempSync(join(tmpdir(), "neon-smoke-")), "app");

function step(label, command, args, cwd, summarize) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", shell: process.platform === "win32" });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.status !== 0) {
    console.log(output.trimEnd());
    console.log(`✖ ${label}: failed (exit ${result.status ?? result.error?.message})`);
    process.exit(result.status ?? 1);
  }
  console.log(`✔ ${label}: ${summarize(output)}`);
  return output;
}

function lastMatch(output, pattern) {
  return output.split("\n").filter((line) => pattern.test(line)).at(-1)?.trim() ?? "ok";
}

const installed = step("install --new", process.execPath, [join(root, "scripts/install.mjs"), destination, "--new"], root, (out) =>
  lastMatch(out, /^added \d+ packages/)
);
// The installer's closing line names the manager it chose.
const manager = installed.match(/&& (\w+) run dev/)?.[1] ?? "npm";
step("build", manager, ["run", "build"], destination, (out) => lastMatch(out, /built in/));
console.log(`App kept at ${destination}`);
