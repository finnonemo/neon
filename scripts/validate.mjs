#!/usr/bin/env node
/**
 * validate.mjs — the repository's one validation command, run by CI and by
 * maintainers: the repository check (scripts/check-repository.mjs) and the
 * eval tests (evals/skills/*.test.mjs). Both always run. Each step prints a
 * line as it starts, and the tests name each test file as it finishes, so a
 * run that is still going shows where it is. A passing step ends with one
 * summary line; a failing step or test file prints its full output. Exits 1
 * if either fails, so its status is safe to trust without reading the log.
 * Runs on one machine queue behind the checks lock (scripts/lib/checks-lock.mjs),
 * which the browser suite takes too; a waiting run prints the run it waits for.
 *
 * Usage: node scripts/validate.mjs
 */
import { readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { takeChecksLock } from "./lib/checks-lock.mjs";
import { runTestFiles } from "./lib/test-files.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const testFiles = readdirSync(join(root, "evals/skills"))
  .filter((name) => name.endsWith(".test.mjs"))
  .sort()
  .map((name) => join("evals/skills", name));

function repositoryCheck() {
  console.log("▶ repository check");
  const result = spawnSync(process.execPath, ["scripts/check-repository.mjs"], { cwd: root, encoding: "utf8" });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.status === 0) {
    console.log(`✔ repository check: ${output.trim().split("\n").at(-1)}`);
    return true;
  }
  console.log(output.trimEnd());
  console.log(`✖ repository check: failed (exit ${result.status ?? result.error?.message})`);
  return false;
}

async function tests() {
  console.log(`▶ tests: ${testFiles.length} files`);
  const { pass, fail, failed } = await runTestFiles({ files: testFiles, cwd: root });
  if (fail === 0) {
    console.log(`✔ tests: ${pass} pass, 0 fail`);
    return true;
  }
  console.log(`✖ tests: ${pass} pass, ${fail} fail, in ${failed.join(", ")}`);
  return false;
}

// Released when the process exits.
await takeChecksLock({ label: "validate", worktree: root });
// The repository check takes under a second and the tests half a minute, so it runs first.
const results = [repositoryCheck(), await tests()];
process.exit(results.every(Boolean) ? 0 : 1);
