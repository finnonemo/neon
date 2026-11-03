#!/usr/bin/env node
/**
 * preview-app.mjs — serves an app's production build and prints its URL only
 * once the page answers. It checks <app dir> has a package.json with build
 * and preview scripts and installed dependencies, runs the build to
 * completion, starts `npm run preview`, reads the first local URL the preview
 * prints and polls it until it returns HTTP 200. Then it prints
 * `Ready: <url>` on stdout and keeps serving until stopped; build and server
 * output go to stderr. Run it in the background and wait for the Ready line.
 *
 * Usage: node scripts/preview-app.mjs <app dir> [--port <n>] [--timeout <seconds>]
 *
 * --port passes `--host 127.0.0.1 --port <n> --strictPort` to a Vite preview;
 * leave it out when the app's preview script already fixes the port.
 * --timeout bounds the wait for HTTP 200 after the preview starts, default 60.
 * Exits 2 on a usage error or an app directory that cannot be previewed, and 1
 * when the build fails, the preview exits or the page never answers.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { parseArgs } from "node:util";

const usage = "Usage: node scripts/preview-app.mjs <app dir> [--port <n>] [--timeout <seconds>]";
function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

let values, positionals;
try {
  ({ values, positionals } = parseArgs({
    allowPositionals: true,
    options: { port: { type: "string" }, timeout: { type: "string", default: "60" } },
  }));
} catch (error) {
  fail(`${error.message}\n${usage}`, 2);
}
if (positionals.length !== 1) fail(usage, 2);
const app = resolve(positionals[0]);
const timeout = Number(values.timeout) * 1000;
if (!(timeout > 0) || (values.port && !/^\d+$/.test(values.port))) fail(usage, 2);

const manifest = join(app, "package.json");
if (!existsSync(manifest)) fail(`${app} has no package.json; pass the app's own directory.`, 2);
const { scripts = {} } = JSON.parse(readFileSync(manifest, "utf8"));
const missing = ["build", "preview"].filter((name) => !scripts[name]);
if (missing.length) fail(`${manifest} has no ${missing.join(" or ")} script.`, 2);
if (!existsSync(join(app, "node_modules"))) fail(`${app} has no node_modules; run npm ci there first.`, 2);

const build = spawn("npm", ["run", "build"], { cwd: app, stdio: ["ignore", process.stderr, process.stderr] });
const built = await new Promise((done) => {
  build.on("error", () => done(false));
  build.on("exit", (code) => done(code === 0));
});
if (!built) fail("Build failed; no preview started.");

const extra = values.port ? ["--", "--host", "127.0.0.1", "--port", values.port, "--strictPort"] : [];
const preview = spawn("npm", ["run", "preview", ...extra], { cwd: app, stdio: ["ignore", "pipe", "pipe"], detached: true });
const stop = () => {
  try { process.kill(-preview.pid, "SIGTERM"); } catch {}
};
process.on("SIGINT", () => { stop(); process.exit(130); });
process.on("SIGTERM", () => { stop(); process.exit(143); });
preview.on("exit", (code) => fail(`Preview exited (${code ?? "signal"}) before it was stopped.`));

// The URL is the first local address the preview prints, colour codes removed.
const url = await new Promise((found) => {
  let output = "";
  const read = (chunk) => {
    process.stderr.write(chunk);
    output += chunk.toString().replace(/\x1b\[[0-9;]*m/g, "");
    const match = output.match(/https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\]):\d+\/?\S*/);
    if (match) found(match[0]);
  };
  preview.stdout.on("data", read);
  preview.stderr.on("data", read);
  setTimeout(() => found(null), timeout);
});
if (!url) {
  stop();
  fail(`Preview printed no local URL within ${values.timeout}s.`);
}
// Keep relaying server output after the URL is found.
preview.stdout.removeAllListeners("data").on("data", (chunk) => process.stderr.write(chunk));
preview.stderr.removeAllListeners("data").on("data", (chunk) => process.stderr.write(chunk));

const deadline = Date.now() + timeout;
let status;
while (Date.now() < deadline) {
  status = await fetch(url, { signal: AbortSignal.timeout(2000) }).then((response) => response.status, () => null);
  if (status === 200) break;
  await new Promise((wait) => setTimeout(wait, 250));
}
if (status !== 200) {
  stop();
  fail(`${url} did not return HTTP 200 within ${values.timeout}s (last: ${status ?? "no response"}).`);
}
console.log(`Ready: ${url}`);
