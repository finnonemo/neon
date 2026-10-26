#!/usr/bin/env node
/**
 * validate.mjs — the repository's one validation command, run by CI and by
 * maintainers: the eval tests (evals/skills/*.test.mjs) and the repository
 * check (scripts/check-repository.mjs). Both always run. A passing step
 * prints one summary line; a failing step prints its full output. Exits 1
 * if either fails, so its status is safe to trust without reading the log.
 *
 * Usage: node scripts/validate.mjs
 */
import { readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const testFiles = readdirSync(join(root, "evals/skills"))
  .filter((name) => name.endsWith(".test.mjs"))
  .sort()
  .map((name) => join("evals/skills", name));

function run(label, args, summarize) {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.status === 0) {
    console.log(`✔ ${label}: ${summarize(output)}`);
    return true;
  }
  console.log(output.trimEnd());
  console.log(`✖ ${label}: failed (exit ${result.status ?? result.error?.message})`);
  return false;
}

function count(output, name) {
  return output.match(new RegExp(`^(?:ℹ|#) ${name} (\\d+)`, "m"))?.[1] ?? "?";
}

const results = [
  run("tests", ["--test", "--test-reporter=spec", ...testFiles], (out) => `${count(out, "pass")} pass, ${count(out, "fail")} fail`),
  run("repository check", ["scripts/check-repository.mjs"], (out) => out.trim().split("\n").at(-1)),
];
process.exit(results.every(Boolean) ? 0 : 1);
