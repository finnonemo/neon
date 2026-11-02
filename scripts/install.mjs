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
 *   node install.mjs <target-dir>                      # CDS theme (frozen)
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
 * --package-manager or --skip-install, which shadcn would not honour.
 *
 * --css-only:     copies only theme/css/theme.css into <target-dir>/src/theme/
 *                 (or --theme-dir). No dependency install, no React
 *                 provider needed — just CSS custom properties.
 *
 * (default):      the CDS install mode, frozen for apps already on CDS.
 *                 Copies the 4 canonical CDS files (theme/cds/) into
 *                 <target-dir>/src/theme/ (or --theme-dir, if given),
 *                 installs @coinbase/cds-web (pinned to the version range
 *                 declared in templates/vitejs-cds/package.json) if not
 *                 already a dependency. Never touches provider wiring or
 *                 component code. Refuses a target without package.json.
 *
 * Existing destination files identical to the canonical ones are kept; a
 * customized one refuses the whole copy ("Refusing to overwrite customized
 * file"). There is no force flag.
 *
 * --sync-starter: RETIRED. templates/vitejs-cds/ has no tracked theme files
 *                 of its own to sync — starter assembly supplies them fresh
 *                 from theme/cds/. Exits nonzero without touching the
 *                 filesystem.
 *
 * --theme-dir <project-relative-dir>: overrides the default "src/theme"
 *                 destination for (default)/--css-only. The destination —
 *                 default or overridden — must stay inside <target-dir>:
 *                 absolute paths, paths resolving outside it, and paths
 *                 through a symlinked ancestor resolving outside it are
 *                 refused, so a refusal does not always mean --theme-dir was
 *                 used.
 *
 * --package-manager <npm|pnpm|yarn|bun>: overrides package-manager
 *                 detection for (default). Otherwise the manager comes from
 *                 a declared "packageManager" field or lockfiles, found in
 *                 the target or its parent directories up to the first
 *                 containing .git; npm when there is no evidence.
 *                 Conflicting lockfiles are refused. An invalid value is
 *                 refused in every mode, including ones that would never run
 *                 a package manager.
 *
 * --skip-install: copy files but never invoke a package manager. Applies to
 *                 (default). The output explicitly reports dependencies as
 *                 not installed — this flag never produces an unqualified
 *                 "Done" success message.
 *
 * --registry <url>: maintainers only. Serves --new and --add from another
 *                 build of the registry, such as the local one
 *                 scripts/smoke-new-app.mjs serves, instead of the release.
 *
 * Exits 1 on any refusal, or with the failing command's own exit status.
 */
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { install } from "./lib/install.mjs";

const USAGE =
  "Usage: node install.mjs <target-dir> [--new | --add <item>... | --css-only] [--theme-dir <dir>] [--package-manager <npm|pnpm|yarn|bun>] [--skip-install]";

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
      "sync-starter": { type: "boolean" },
      "theme-dir": { type: "string" },
      "package-manager": { type: "string" },
      "skip-install": { type: "boolean" },
    },
    strict: true,
    allowPositionals: true,
  });
} catch (err) {
  fail(`${err.message}\n${USAGE}`);
}
const { values, positionals } = parsed;

if (values["sync-starter"]) {
  fail("Starter themes are assembled from canonical assets. Run node scripts/assemble-starter.mjs <empty-output-dir>.");
}
if ([values.new, values.add, values["css-only"]].filter(Boolean).length > 1) {
  fail("--new, --add and --css-only are mutually exclusive.");
}
// --add takes its items as the positionals after the app.
if (positionals.length < 1 || (!values.add && positionals.length !== 1)) {
  fail(USAGE);
}

const mode = values.new ? "new" : values.add ? "add" : values["css-only"] ? "css-only" : "cds";
const skipInstall = values["skip-install"] === true;

let result;
try {
  result = await install({
    mode,
    target: resolve(positionals[0]),
    items: positionals.slice(1),
    registry: values.registry,
    themeDir: values["theme-dir"],
    packageManager: values["package-manager"],
    skipInstall,
    log: console.log,
  });
} catch (err) {
  fail(err.message, err.exitCode ?? 1);
}

if (mode === "css-only") {
  console.log(`\nDone. Import it once (e.g. \`import "./theme/theme.css"\`) and use var(--color-fg), var(--space-2), etc.`);
} else if (mode === "new") {
  console.log(`\nDone. Next: cd ${result.destination} && npm run dev`);
} else if (mode === "add") {
  const kept = result.keptFiles.length ? ` Kept the app's own ${result.keptFiles.join(", ")}.` : "";
  console.log(`\nDone. Added ${positionals.slice(1).join(", ")} to ${result.destination}.${kept}`);
} else {
  if (result.cdsAlreadyPresent) {
    console.log("@coinbase/cds-web already a dependency — skipping install.");
  } else if (skipInstall) {
    console.log(
      `\n--skip-install: dependencies were NOT installed. @coinbase/cds-web@${result.cdsVersion} still needs to be added.`
    );
  }
  const installedNote = result.dependenciesInstalled ? "" : " Dependencies not installed (--skip-install).";
  console.log(
    `\nDone. Theme files copied into ${result.themeDir}. Wire up MediaQueryProvider -> ThemeProvider -> ComponentConfigProvider -> PortalProvider next.${installedNote}`
  );
}
