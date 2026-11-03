#!/usr/bin/env node
/**
 * cdp-status.mjs — reports whether a running Chrome exposes a DevTools (CDP)
 * endpoint that REA's browser tools can attach to, without changing anything.
 * It reads each profile's DevToolsActivePort file (port, then the browser
 * WebSocket path), opens a TCP connection to that port on 127.0.0.1 and asks
 * GET /json/version with a short timeout. It never enables remote debugging,
 * launches a browser or opens a WebSocket.
 *
 * Usage: node scripts/cdp-status.mjs [--user-data-dir <dir>]... [--timeout <ms>]
 *
 * Without --user-data-dir it checks the default Chrome, Chrome Canary and
 * Chromium profiles for this platform. Per profile it prints one line:
 *   live   — /json/version answered; give REA the http://127.0.0.1:<port> endpoint.
 *   ws-only — the port listens but serves no /json/version (remote debugging
 *            enabled from chrome://inspect); give REA the browser WebSocket URL.
 *   stale  — the port file names a port nothing listens on; debugging is off.
 *   off    — no port file; debugging was never enabled for this profile.
 * Enabling remote debugging is the user's decision; when nothing is reachable,
 * say so and ask. When REA's MCP discovery times out against a reachable
 * endpoint, the installed REA CLI takes the same endpoint.
 * Exits 0 when any profile is live or ws-only, 1 when none is, 2 on a usage error.
 */
import { readFile } from "node:fs/promises";
import { connect } from "node:net";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";

const usage = "Usage: node scripts/cdp-status.mjs [--user-data-dir <dir>]... [--timeout <ms>]";
let values;
try {
  ({ values } = parseArgs({
    options: { "user-data-dir": { type: "string", multiple: true }, timeout: { type: "string", default: "1500" } },
  }));
} catch (error) {
  console.error(`${error.message}\n${usage}`);
  process.exit(2);
}
const timeout = Number(values.timeout);
if (!(timeout > 0)) {
  console.error(usage);
  process.exit(2);
}

function defaultProfiles() {
  const home = homedir();
  if (platform() === "darwin") {
    const support = join(home, "Library/Application Support");
    return ["Google/Chrome", "Google/Chrome Canary", "Chromium"].map((name) => join(support, name));
  }
  if (platform() === "win32") {
    const local = process.env.LOCALAPPDATA ?? join(home, "AppData/Local");
    return ["Google/Chrome/User Data", "Google/Chrome SxS/User Data", "Chromium/User Data"].map((name) => join(local, name));
  }
  return ["google-chrome", "google-chrome-unstable", "chromium"].map((name) => join(home, ".config", name));
}

function listening(port) {
  return new Promise((done) => {
    const socket = connect({ host: "127.0.0.1", port });
    const finish = (open) => { socket.destroy(); done(open); };
    socket.setTimeout(timeout, () => finish(false));
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
  });
}

async function status(profile) {
  const file = join(profile, "DevToolsActivePort");
  const text = await readFile(file, "utf8").catch(() => null);
  if (text === null) return { state: "off", detail: `${profile}: no DevToolsActivePort; remote debugging is not enabled.` };
  const [port, path = ""] = text.split(/\r?\n/);
  if (!/^\d+$/.test(port)) return { state: "stale", detail: `${file}: unreadable port ${JSON.stringify(port)}.` };
  if (!(await listening(Number(port)))) {
    return { state: "stale", detail: `${profile}: DevToolsActivePort names port ${port}, but nothing listens; remote debugging is off.` };
  }
  const socketUrl = `ws://127.0.0.1:${port}${path}`;
  const version = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(timeout) })
    .then((response) => (response.ok ? response.json() : null), () => null)
    .catch(() => null);
  if (version) {
    return { state: "live", detail: `${profile}: http://127.0.0.1:${port} (${version.Browser ?? "unknown browser"}), browser WebSocket ${version.webSocketDebuggerUrl ?? socketUrl}` };
  }
  return { state: "ws-only", detail: `${profile}: port ${port} listens without /json/version; browser WebSocket ${socketUrl}` };
}

const results = await Promise.all((values["user-data-dir"] ?? defaultProfiles()).map(status));
for (const { state, detail } of results) console.log(`${state.padEnd(7)} ${detail}`);
const reachable = results.some(({ state }) => state === "live" || state === "ws-only");
console.log(reachable
  ? "Give REA the reachable endpoint; if its MCP discovery times out, the installed REA CLI takes the same endpoint."
  : "No CDP endpoint is reachable, for REA's MCP tools or its CLI. Enabling remote debugging is the user's call; ask before any browser inspection.");
process.exit(reachable ? 0 : 1);
