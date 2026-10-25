#!/usr/bin/env node
/**
 * install.mjs — deploys Finnomena's CDS theme into a target project. A thin
 * CLI over the installer module (./lib/install.mjs), which owns the
 * behaviour and its preflight guarantee: every check runs before the first
 * write, so a refused install leaves the target untouched.
 *
 * Usage:
 *   node install.mjs <target-dir> --new         # scaffold a new project
 *                                                # (starter + canonical theme)
 *   node install.mjs <target-dir>                # theme an existing project
 *                                                # (full CDS)
 *   node install.mjs <target-dir> --css-only     # copy theme.css only
 *                                                # (no CDS install)
 *
 * --new:          assembles templates/vitejs-cds/ + the 4 canonical CDS
 *                 files (theme/cds/) into <target-dir>, then installs the
 *                 assembled app's declared dependencies. Refuses to run
 *                 into a non-empty directory.
 *
 * (default):      copies the 4 canonical CDS files (theme/cds/) into
 *                 <target-dir>/src/theme/ (or --theme-dir, if given),
 *                 installs @coinbase/cds-web (pinned to the version range
 *                 declared in templates/vitejs-cds/package.json) if not
 *                 already a dependency. Never touches provider wiring or
 *                 component code. Refuses a target without package.json.
 *
 * --css-only:     copies only theme/css/theme.css into <target-dir>/src/theme/
 *                 (or --theme-dir). No @coinbase/cds-web install, no React
 *                 provider needed — just CSS custom properties.
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
 *                 used. Not accepted with --new: the scaffolded starter
 *                 imports theme files from a fixed "src/theme" path.
 *
 * --package-manager <npm|pnpm|yarn|bun>: overrides package-manager
 *                 detection. Otherwise the manager comes from a declared
 *                 "packageManager" field or lockfiles, found in the target or
 *                 its parent directories up to the first containing .git
 *                 (for --new, the starter's own lockfile, so npm); npm when
 *                 there is no evidence. Conflicting lockfiles are refused.
 *                 An invalid value is refused in every mode, including ones
 *                 that would never run a package manager.
 *
 * --skip-install: scaffold/copy files but never invoke a package manager.
 *                 Applies to --new and (default). The output explicitly
 *                 reports dependencies as not installed — this flag never
 *                 produces an unqualified "Done" success message.
 *
 * Exits 1 on any refusal, or with the package manager's own exit status if
 * its install fails.
 */
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { install } from "./lib/install.mjs";

const USAGE =
  "Usage: node install.mjs <target-dir> [--new | --css-only] [--theme-dir <dir>] [--package-manager <npm|pnpm|yarn|bun>] [--skip-install]";

function fail(message, exitCode = 1) {
  console.error(message);
  process.exit(exitCode);
}

let parsed;
try {
  parsed = parseArgs({
    options: {
      new: { type: "boolean" },
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
if (values.new && values["css-only"]) {
  fail("--new and --css-only are mutually exclusive.");
}
if (positionals.length !== 1) {
  fail(USAGE);
}

const mode = values.new ? "new" : values["css-only"] ? "css-only" : "cds";
const skipInstall = values["skip-install"] === true;

let result;
try {
  result = await install({
    mode,
    target: resolve(positionals[0]),
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
  if (skipInstall) {
    console.log(
      `\n--skip-install: dependencies were NOT installed. Run \`${result.packageManager} install\` in ${result.destination} yourself.`
    );
    console.log(`Files copied into ${result.destination}. Dependencies not installed.`);
  } else {
    console.log(`\nDone. Next: cd ${result.destination} && ${result.packageManager} run dev`);
  }
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
    `\nDone. Theme files copied into ${result.themeDir}. Wire up MediaQueryProvider -> ThemeProvider -> PortalProvider next.${installedNote}`
  );
}
