#!/usr/bin/env node
/**
 * smoke-new-app.mjs — the disposable app build that AGENTS.md requires for
 * registry, template and theme changes. It builds this checkout's Neon registry,
 * serves it locally, and through the installer creates an app with --new
 * (shadcn init from the Neon base; real dependency install, needs network),
 * tunes a Neon file, adds an item and a Theme Brief with --add, then runs the
 * app's production build. It checks that no source imports the bare `cn` and that the add
 * changed nothing but the item's own new file.
 *
 * A passing step prints one summary line; a failing step prints its full
 * output and stops. Exits with the failing step's status.
 *
 * Usage: node scripts/smoke-new-app.mjs [destination]
 *
 * Without a destination it builds twice: outside any repository (a fresh
 * directory under the OS temp dir) and inside one (under this checkout's
 * gitignored .local/smoke/). A destination must be missing or empty. Apps
 * are kept afterwards so they can be previewed or inspected.
 */
import { createHash } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { appendFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { bareCnImports, buildRegistry } from "./lib/registry.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const destinations = process.argv[2]
  ? [resolve(process.argv[2])]
  : [join(mkdtempSync(join(tmpdir(), "neon-smoke-")), "app"), join(root, ".local/smoke", stamp, "app")];
// The item --add puts beside the base, and the Neon file it depends on that
// the smoke tunes first: Dialog uses Button.
const ADD_ITEM = "dialog";
const TUNED = "src/components/ui/button.tsx";
// A Theme Brief item, whose one file installs outside src, to the app's ./docs/theme-briefs/.
const BRIEF = "club-run";

// Async, so the registry server in this process keeps answering.
function step(label, command, args, cwd, summarize) {
  return new Promise((done) => {
    const child = spawn(command, args, { cwd, shell: process.platform === "win32" });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("close", (status) => {
      if (status !== 0) {
        console.log(output.trimEnd());
        console.log(`✖ ${label}: failed (exit ${status})`);
        process.exit(status ?? 1);
      }
      console.log(`✔ ${label}: ${summarize(output)}`);
      done(output);
    });
  });
}

function check(label, problems) {
  if (problems.length) {
    console.log(problems.join("\n"));
    console.log(`✖ ${label}: failed`);
    process.exit(1);
  }
  console.log(`✔ ${label}`);
}

function lastMatch(output, pattern) {
  return output.split("\n").filter((line) => pattern.test(line)).at(-1)?.trim() ?? "ok";
}

/** Every file under src by app-relative path, with its content. */
async function sources(app) {
  const entries = await readdir(join(app, "src"), { recursive: true, withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile()).map((entry) => join(entry.parentPath, entry.name));
  return new Map(await Promise.all(files.map(async (path) => [relative(app, path), await readFile(path, "utf8")])));
}

const digest = (files) => new Map([...files].map(([path, content]) => [path, createHash("sha256").update(content).digest("hex")]));

const registryDir = mkdtempSync(join(tmpdir(), "neon-smoke-registry-"));
const server = createServer(async (request, response) => {
  try {
    const body = await readFile(join(registryDir, decodeURIComponent(new URL(request.url, "http://x").pathname)));
    response.writeHead(200, { "content-type": "application/json" }).end(body);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((listening) => server.listen(0, "127.0.0.1", listening));
const url = `http://127.0.0.1:${server.address().port}/r`;
await mkdir(join(registryDir, "r"));
for (const [name, content] of await buildRegistry({ root, url })) await writeFile(join(registryDir, "r", name), content);
const installArgs = (...args) => [join(root, "scripts/install.mjs"), ...args, "--registry", url];

for (const destination of destinations) {
  console.log(`\n${destination}`);
  await mkdir(dirname(destination), { recursive: true });
  await step("install --new", process.execPath, installArgs(destination, "--new"), root, (out) => lastMatch(out, /^added \d+ packages|^Done/));
  check("no bare cn import after --new", bareCnImports(await sources(destination)));

  await appendFile(join(destination, TUNED), "// tuned by the smoke build\n");
  const before = digest(await sources(destination));
  await step(`install --add ${ADD_ITEM}`, process.execPath, installArgs(destination, "--add", ADD_ITEM), root, (out) => lastMatch(out, /^Done/));
  const after = await sources(destination);
  const changed = [...digest(after)].filter(([path, hash]) => before.get(path) !== hash).map(([path]) => path);
  const removed = [...before.keys()].filter((path) => !after.has(path));
  const added = `src/components/ui/${ADD_ITEM}.tsx`;
  check(`--add ${ADD_ITEM} added only ${added}, keeping the tuned ${TUNED}`, [
    ...changed.filter((path) => path !== added).map((path) => `${path} changed`),
    ...removed.map((path) => `${path} removed`),
    ...(changed.includes(added) ? [] : [`${added} was not added`]),
  ]);
  check("no bare cn import after --add", bareCnImports(after));

  await step(`install --add theme-brief-${BRIEF}`, process.execPath, installArgs(destination, "--add", `theme-brief-${BRIEF}`), root, (out) => lastMatch(out, /^Done/));
  const briefPath = `docs/theme-briefs/${BRIEF}.md`;
  const brief = await readFile(join(destination, briefPath), "utf8").catch(() => null);
  check(`--add theme-brief-${BRIEF} put the brief at ${briefPath}`, brief === (await readFile(join(root, "registry/theme-briefs", `${BRIEF}.md`), "utf8")) ? [] : [`${briefPath} ${brief === null ? "is missing" : "differs from the published brief"}`]);

  await step("build", "npm", ["run", "build"], destination, (out) => lastMatch(out, /built in/));
  console.log(`App kept at ${destination}`);
}
server.close();
