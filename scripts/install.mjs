#!/usr/bin/env node
/**
 * install.mjs — the installer's CLI. A thin layer over the installer module
 * (./lib/install.mjs), which owns the behaviour and its preflight guarantee:
 * every check runs before the first write, so a refused install leaves the
 * target untouched.
 *
 * Usage:
 *   node install.mjs <target-dir> --new               # start an app from the
 *                                                      # Neon base
 *   node install.mjs <app-dir> --add <item>...         # add Neon registry
 *                                                      # items to an app
 *   node install.mjs <target-dir> --css-only           # copy theme.css only
 *
 * One of --new, --add and --css-only is required. Without one the installer
 * refuses: it used to run the CDS Install mode, which Neon 2.0.0 removed, so
 * it says Neon no longer themes CDS and points to a Rebuild on the Neon base.
 *
 * --new:          runs the pinned shadcn CLI's init from the Neon base item
 *                 of the Neon registry pinned to this package's release, in
 *                 <target-dir>'s parent, so <target-dir> may sit anywhere,
 *                 inside a repository too. It must be missing or empty.
 *                 shadcn installs the dependencies with npm. The vite
 *                 template's stock theme provider is removed, since AppRoot
 *                 owns the color scheme.
 *
 * --add:          runs the pinned shadcn CLI's add for each named item
 *                 (`dialog` or `@neon/dialog`) in an app with a
 *                 components.json, adding the @neon registry entry for this
 *                 release if the app has none. Neon files the app already
 *                 has in its own form, such as a tuned button.tsx under
 *                 dialog, are kept and reported. Refuses an @neon entry that
 *                 names another release.
 *
 * Both check that every file the items ship landed as the registry has it:
 * shadcn can exit 0 having written nothing. Neither accepts --theme-dir,
 * which shadcn would not honour.
 *
 * --css-only:     copies only theme/css/theme.css into <target-dir>/src/theme/
 *                 (or --theme-dir). No dependency install, no React
 *                 provider needed — just CSS custom properties.
 *
 * Existing destination files identical to the canonical ones are kept; a
 * customized one refuses the whole copy ("Refusing to overwrite customized
 * file"). There is no force flag.
 *
 * --theme-dir <project-relative-dir>: overrides the default "src/theme"
 *                 destination for --css-only. The destination —
 *                 default or overridden — must stay inside <target-dir>:
 *                 absolute paths, paths resolving outside it, and paths
 *                 through a symlinked ancestor resolving outside it are
 *                 refused, so a refusal does not always mean --theme-dir was
 *                 used.
 *
 * --registry <url>: maintainers only. Serves --new and --add from another
 *                 build of the registry, such as one served locally from
 *                 this checkout, instead of the release. Without it, the
 *                 NEON_REGISTRY_URL environment variable does the same.
 *
 * Exits 1 on any refusal, or with the failing command's own exit status.
 */
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { install } from "./lib/install.mjs";

const USAGE =
  "Usage: node install.mjs <target-dir> (--new | --add <item>... | --css-only) [--theme-dir <dir>]";

function fail(message, exitCode = 1) {
  console.error(message);
  process.exit(exitCode);
}

let parsed;
try {
  parsed = parseArgs({
    options: {
      new: { type: "boolean" },
      add: { type: "boolean" },
      registry: { type: "string" },
      "css-only": { type: "boolean" },
      "theme-dir": { type: "string" },
    },
    strict: true,
    allowPositionals: true,
  });
} catch (err) {
  fail(`${err.message}\n${USAGE}`);
}
const { values, positionals } = parsed;

if ([values.new, values.add, values["css-only"]].filter(Boolean).length > 1) {
  fail("--new, --add and --css-only are mutually exclusive.");
}
// --add takes its items as the positionals after the app.
if (positionals.length < 1 || (!values.add && positionals.length !== 1)) {
  fail(USAGE);
}

const mode = values.new ? "new" : values.add ? "add" : values["css-only"] ? "css-only" : "cds";

let result;
try {
  result = await install({
    mode,
    target: resolve(positionals[0]),
    items: positionals.slice(1),
    registry: values.registry,
    themeDir: values["theme-dir"],
    log: console.log,
  });
} catch (err) {
  console.error(err.message);
  process.exit(err.exitCode ?? 1);
}

if (mode === "css-only") {
  console.log(`\nDone. Import it once (e.g. \`import "./theme/theme.css"\`) and use var(--color-fg), var(--space-2), etc.`);
} else if (mode === "new") {
  console.log(`\nDone. Next: cd ${result.destination} && npm run dev`);
} else if (mode === "add") {
  const kept = result.keptFiles.length ? ` Kept the app's own ${result.keptFiles.join(", ")}.` : "";
  console.log(`\nDone. Added ${positionals.slice(1).join(", ")} to ${result.destination}.${kept}`);
}
