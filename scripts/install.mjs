#!/usr/bin/env node
/**
 * install.mjs — deploys Finnomena's CDS theme into a target project.
 *
 * Usage:
 *   node install.mjs <target-dir> --new         # scaffold a new project
 *                                                # (starter + canonical theme,
 *                                                # via assemble-starter.mjs)
 *   node install.mjs <target-dir>                # theme an existing project
 *                                                # (full CDS)
 *   node install.mjs <target-dir> --css-only     # copy theme.css only
 *                                                # (no CDS install)
 *
 * --new:          assembles templates/vitejs-cds/ + the 4 canonical CDS
 *                 files (theme/cds/) into <target-dir> via
 *                 scripts/lib/assemble-starter.mjs, then installs the
 *                 assembled app's declared dependencies. Refuses to run
 *                 into a non-empty directory (assembleStarter's own check).
 *
 * (default):      copies the 4 canonical CDS files (theme/cds/) into
 *                 <target-dir>/src/theme/ (or --theme-dir, if given),
 *                 installs @coinbase/cds-web (pinned to the version range
 *                 declared in templates/vitejs-cds/package.json) if not
 *                 already a dependency. Never touches provider wiring or
 *                 component code.
 *
 * --css-only:     copies only theme/css/theme.css into <target-dir>/src/theme/
 *                 (or --theme-dir, or wherever the project keeps global
 *                 styles). No @coinbase/cds-web install, no React provider
 *                 needed — just CSS custom properties.
 *
 * --sync-starter: RETIRED. templates/vitejs-cds/ has no tracked theme files
 *                 of its own to sync — assemble-starter.mjs supplies them
 *                 fresh at assembly time from theme/cds/. Exits nonzero
 *                 without touching the filesystem.
 *
 * --theme-dir <project-relative-dir>: overrides the default "src/theme"
 *                 destination for (default)/--css-only. Both the default
 *                 destination and an explicit override go through the same
 *                 resolveThemeDir check, which validates the resolved path
 *                 stays inside <target-dir> before anything is written —
 *                 rejects absolute paths, paths that resolve outside
 *                 <target-dir>, and paths that pass through a symlinked
 *                 ancestor that resolves outside <target-dir>. This applies
 *                 even when --theme-dir is never passed (e.g. a symlinked
 *                 default "src/theme"), so a failure here does not always
 *                 mean --theme-dir was used. Not accepted with --new: the
 *                 scaffolded starter's own source (AppRoot.tsx etc.) imports
 *                 theme files from a fixed "src/theme" path, so moving that
 *                 destination would silently break the scaffolded app.
 *
 * --package-manager <npm|pnpm|yarn|bun>: overrides package-manager
 *                 detection (see project-config.mjs's selectPackageManager)
 *                 for --new's post-scaffold install and (default)'s CDS
 *                 install. An explicit value's shape is validated up front,
 *                 before any filesystem mutation, in every mode — including
 *                 --css-only, an existing CDS dependency, and --skip-install,
 *                 none of which ever invoke a package manager themselves —
 *                 so an invalid value is rejected even in modes that would
 *                 otherwise just copy files and exit cleanly.
 *
 * --skip-install: scaffold/copy files but never invoke a package manager.
 *                 Applies to --new and (default), the only modes that ever
 *                 run an install. The console output explicitly reports
 *                 dependencies as not installed — this flag must never
 *                 produce an unqualified "Done" success message.
 */
import {
  constants,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  copyFileSync,
  realpathSync,
} from "node:fs";
import { dirname, join, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { parseArgs } from "node:util";
import { selectPackageManager, dependencyCommand } from "./lib/project-config.mjs";
import { assembleStarter } from "./lib/assemble-starter.mjs";
import { CDS_FILES } from "./lib/assets.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const CDS_DIR = join(REPO_ROOT, "theme", "cds");
const CSS_DIR = join(REPO_ROOT, "theme", "css");
const STARTER_DIR = join(REPO_ROOT, "templates", "vitejs-cds");

const LOCKFILE_NAMES = ["package-lock.json", "npm-shrinkwrap.json", "pnpm-lock.yaml", "yarn.lock", "bun.lockb", "bun.lock"];

/**
 * Builds the spawnSync options for a given platform, kept as a small pure
 * function — with no dependency on parsed CLI state — so the win32-vs-other
 * branch is independently unit-testable by
 * importing this module and calling it directly, without actually running
 * on Windows or triggering the CLI logic below (guarded by isMainModule).
 * This is unit-level verification of the branch logic only — it does not
 * exercise a real Windows launch.
 *
 * Only Windows needs `shell: true` for spawnSync to correctly resolve
 * managers installed as .cmd shims (npm, pnpm, yarn, bun all ship this way
 * there).
 */
export function buildSpawnOptions(cwd, platform) {
  return { cwd, stdio: "inherit", shell: platform === "win32" };
}

/**
 * Validates that a project-relative theme directory stays inside
 * targetDir before anything is written. Rejects (throws):
 *   - an absolute themeDirRelative
 *   - a resolved path outside targetDir (via path.relative)
 *   - a path that passes through an existing ancestor symlink resolving
 *     outside targetDir
 * Returns the resolved absolute destination directory on success. Exported
 * (alongside buildSpawnOptions) purely so tests can exercise it directly.
 */
export function resolveThemeDir(baseTargetDir, themeDirRelative) {
  if (isAbsolute(themeDirRelative)) {
    throw new Error(`Theme destination path must be project-relative, got an absolute path: ${themeDirRelative}`);
  }
  const resolved = resolve(baseTargetDir, themeDirRelative);
  const rel = relative(baseTargetDir, resolved);
  if (rel === "") {
    throw new Error(`Theme destination must not resolve to the target directory itself: ${themeDirRelative}`);
  }
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(`Theme destination escapes the target directory: ${themeDirRelative}`);
  }

  // Walk up from the resolved path to find the deepest ancestor that
  // actually exists on disk, then realpath it — if that realpath falls
  // outside targetDir, some ancestor component is a symlink escaping the
  // target directory.
  let ancestor = resolved;
  while (!existsSync(ancestor)) {
    const parent = dirname(ancestor);
    if (parent === ancestor) break; // reached filesystem root, safety net
    ancestor = parent;
  }
  if (existsSync(ancestor) && existsSync(baseTargetDir)) {
    const realAncestor = realpathSync(ancestor);
    const realTarget = realpathSync(baseTargetDir);
    const realRel = relative(realTarget, realAncestor);
    if (realRel.startsWith("..") || isAbsolute(realRel)) {
      throw new Error(
        `Theme destination resolves outside the target directory via a symlinked ancestor: ${themeDirRelative}`
      );
    }
  }

  return resolved;
}

/** Copies `filenames` from `srcDir` into `destThemeDir`, refusing to overwrite a customized file. */
function copyThemeFiles(srcDir, destThemeDir, filenames) {
  // Validate every source and destination before making any changes.
  const pending = [];
  for (const file of filenames) {
    const src = join(srcDir, file);
    const dest = join(destThemeDir, file);
    const source = readFileSync(src);
    if (existsSync(dest)) {
      if (!source.equals(readFileSync(dest))) {
        throw new Error(`Refusing to overwrite customized file: ${dest}`);
      }
      continue;
    }
    pending.push({ src, dest });
  }
  mkdirSync(destThemeDir, { recursive: true });
  for (const { src, dest } of pending) {
    copyFileSync(src, dest, constants.COPYFILE_EXCL);
  }
  console.log(`Copied ${pending.length} theme files into ${destThemeDir}`);
}

function run(cmd, cmdArgs, cwd) {
  console.log(`> ${cmd} ${cmdArgs.join(" ")}`);
  const result = spawnSync(cmd, cmdArgs, buildSpawnOptions(cwd, process.platform));
  if (result.error) {
    console.error(`Failed to run "${cmd}": ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`Command failed (exit ${result.status}): ${cmd} ${cmdArgs.join(" ")}`);
    process.exit(result.status ?? 1);
  }
}

/** Reads the CDS dependency's declared version range from the starter's own package.json. */
function declaredCdsVersion() {
  const starterPkg = JSON.parse(readFileSync(join(STARTER_DIR, "package.json"), "utf8"));
  const version = starterPkg.dependencies?.["@coinbase/cds-web"];
  if (!version) {
    throw new Error(`templates/vitejs-cds/package.json does not declare a @coinbase/cds-web version.`);
  }
  return version;
}

/** Lists lockfile basenames present directly in dir (non-recursive, missing dir is fine). */
function findLockfiles(dir) {
  if (!existsSync(dir)) return [];
  let entries;
  try {
    entries = new Set(readdirSync(dir));
  } catch {
    // Exists but unreadable (e.g. a permissions-restricted ancestor) —
    // treat it as having no lockfile evidence rather than crashing the walk.
    return [];
  }
  return LOCKFILE_NAMES.filter((name) => entries.has(name));
}

/**
 * Walks up from startDir through parent directories looking for
 * package-manager evidence (a lockfile, or a package.json declaring
 * "packageManager") — the same technique npm/yarn/pnpm/corepack use to
 * discover a workspace root. An individual monorepo app directory (e.g.
 * apps/portal/) typically has neither on its own: the lockfile and the
 * packageManager field usually live only at the workspace root, so
 * checking only the app directory itself finds nothing and silently falls
 * back to npm — which would plant a stray npm-generated lockfile inside a
 * pnpm-managed monorepo. Intermediate grouping directories (e.g. a bare
 * apps/ with no package.json of its own) are common too, so this climbs
 * through directories with no manifest at all rather than stopping there.
 *
 * Checks startDir itself first, then each parent in turn. At each
 * directory: if it carries ANY evidence (a lockfile, or a declared
 * packageManager), returns it immediately. Otherwise, if the directory
 * itself contains a `.git` entry (a directory for a normal repo, or a file
 * for a git-worktree checkout), stops and gives up — `.git` is used purely
 * as a walk boundary here, not as a check that this is actually the
 * project's workspace root; it never validates workspace membership, it
 * just marks a point past which the walk won't climb. Otherwise continues
 * to the parent directory, giving up once the filesystem root is reached
 * (parent === dir).
 *
 * This only widens where evidence is *gathered* — it does not change
 * where a dependency install actually *runs* (still startDir, via this
 * function's caller, resolveManager).
 */
function findPackageManagerEvidence(startDir) {
  let dir = startDir;
  for (;;) {
    const lockfiles = findLockfiles(dir);
    const pkgPath = join(dir, "package.json");
    let declared;
    if (existsSync(pkgPath)) {
      try {
        declared = JSON.parse(readFileSync(pkgPath, "utf8")).packageManager;
      } catch {
        // Malformed package.json at this ancestor — no declared evidence here.
      }
    }
    if (lockfiles.length > 0 || declared) {
      return { lockfiles, declared };
    }
    if (existsSync(join(dir, ".git"))) {
      return { lockfiles: [], declared: undefined };
    }
    const parent = dirname(dir);
    if (parent === dir) {
      return { lockfiles: [], declared: undefined };
    }
    dir = parent;
  }
}

/**
 * Resolves the package manager to use for `dir`'s dependency install,
 * walking up to a workspace root for evidence if `dir` itself has none
 * (see findPackageManagerEvidence). The install itself still runs in
 * `dir` — only evidence-gathering walks up.
 */
function resolveManager(dir, packageManagerOverride) {
  const evidence = findPackageManagerEvidence(dir);
  return selectPackageManager({
    declared: evidence.declared,
    lockfiles: evidence.lockfiles,
    override: packageManagerOverride,
  });
}

// Only run the CLI when this file is executed directly (`node install.mjs
// ...`, including the existing tests' spawnSync subprocess invocations) —
// not when it's imported as a module (e.g. by tests importing
// buildSpawnOptions/resolveThemeDir directly), which would otherwise run
// parseArgs against the importing process's own argv. Compared via
// realpathSync (not a bare path.resolve) because Node's module loader
// realpath-resolves import.meta.url, so an invocation through a symlinked
// path (e.g. macOS's /tmp -> /private/tmp) would otherwise never match.
function isRunAsScript() {
  if (!process.argv[1]) return false;
  try {
    return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
  } catch {
    return false;
  }
}
if (isRunAsScript()) {
  await main();
}

async function main() {
  const { values, positionals } = parseArgs({
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
  const isNew = values.new === true;
  const isCssOnly = values["css-only"] === true;
  const isSyncStarter = values["sync-starter"] === true;
  const themeDirOverride = values["theme-dir"];
  const packageManagerOverride = values["package-manager"];
  const skipInstall = values["skip-install"] === true;

  if (isSyncStarter) {
    console.error(
      "Starter themes are assembled from canonical assets. Run node scripts/assemble-starter.mjs <empty-output-dir>."
    );
    process.exit(1);
  }

  if ([isNew, isCssOnly].filter(Boolean).length > 1) {
    console.error("--new and --css-only are mutually exclusive.");
    process.exit(1);
  }

  if (positionals.length !== 1) {
    console.error(
      "Usage: node install.mjs <target-dir> [--new | --css-only] [--theme-dir <dir>] [--package-manager <npm|pnpm|yarn|bun>] [--skip-install]"
    );
    process.exit(1);
  }

  if (isNew && themeDirOverride !== undefined) {
    console.error(
      "--theme-dir is not supported with --new: the scaffolded starter's own source imports theme files " +
        "from a fixed src/theme path, so moving that destination would break the scaffolded app."
    );
    process.exit(1);
  }

  // Validate an explicit --package-manager value's shape alone, before any
  // mode-specific logic (and therefore before any filesystem mutation)
  // runs. Covers --css-only, existing-CDS, and --new uniformly, and
  // --skip-install combinations too since this runs before those branches
  // are even reached. selectPackageManager already throws a clear error on
  // an unsupported override — that's allowed to propagate uncaught here,
  // exiting non-zero with no partial writes, matching declaredCdsVersion's
  // established uncaught-throw pattern elsewhere in this file.
  if (packageManagerOverride !== undefined) {
    selectPackageManager({ override: packageManagerOverride });
  }

  const targetDir = resolve(positionals[0]);

  if (isCssOnly) {
    // CSS-only mode: copy just theme.css, no CDS install
    const destThemeDir = resolveThemeDirOrExit(targetDir, themeDirOverride ?? "src/theme");
    copyThemeFiles(CSS_DIR, destThemeDir, ["theme.css"]);
    console.log(
      `\nDone. Import it once (e.g. \`import "./theme/theme.css"\`) and use var(--color-fg), var(--space-2), etc.`
    );
  } else if (isNew) {
    // Determine manager evidence for the future app BEFORE assembling
    // it — assembleStarterOrExit is a real mutation (creates targetDir and
    // copies the whole starter + theme into it), so an invalid override or
    // conflicting evidence must be caught first. Read the starter's OWN
    // manifest/lockfiles directly (not via findPackageManagerEvidence,
    // which would walk upward past STARTER_DIR into the plugin checkout);
    // only fall back to evidence discovery rooted at the future
    // destination (targetDir — it doesn't exist yet, but
    // findPackageManagerEvidence only does existsSync checks and climbs to
    // real parents, so that's fine) when the starter itself carries none.
    // A malformed starter package.json throws here, uncaught, before
    // anything has been written — leaving the target directory absent,
    // matching declaredCdsVersion's established uncaught-throw pattern.
    const starterPkg = JSON.parse(readFileSync(join(STARTER_DIR, "package.json"), "utf8"));
    const starterEvidence = {
      declared: starterPkg.packageManager,
      lockfiles: findLockfiles(STARTER_DIR),
    };
    const evidence =
      starterEvidence.declared || starterEvidence.lockfiles.length
        ? starterEvidence
        : findPackageManagerEvidence(targetDir);
    const manager = selectPackageManager({ ...evidence, override: packageManagerOverride });
    // The starter's own package-lock.json presence predicts the assembled
    // destination's, since assembleStarter copies the whole starter tree
    // through unchanged (aside from node_modules/dist/.git/.DS_Store/src/theme).
    const commandSpec = skipInstall
      ? null
      : dependencyCommand(manager, [], { ci: existsSync(join(STARTER_DIR, "package-lock.json")) });

    const { destination } = await assembleStarterOrExit(targetDir);
    if (skipInstall) {
      console.log(
        `\n--skip-install: dependencies were NOT installed. Run \`${manager} install\` in ${destination} yourself.`
      );
      console.log(`Files copied into ${destination}. Dependencies not installed.`);
    } else {
      run(commandSpec.command, commandSpec.args, destination);
      console.log(`\nDone. Next: cd ${destination} && ${manager} run dev`);
    }
  } else {
    const pkgPath = join(targetDir, "package.json");
    if (!existsSync(pkgPath)) {
      console.error(`No package.json found at ${pkgPath} — is this an existing project?`);
      process.exit(1);
    }
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const hasCds = Boolean(pkg.dependencies?.["@coinbase/cds-web"] || pkg.devDependencies?.["@coinbase/cds-web"]);
    const destThemeDir = resolveThemeDirOrExit(targetDir, themeDirOverride ?? "src/theme");
    // Resolve manager evidence — and, when an install will actually run,
    // the dependency command too — BEFORE copyThemeFiles, even when CDS is
    // already a dependency or --skip-install is set. This intentionally
    // rejects ambiguous manager configuration consistently before
    // mutation, computed once here and reused below.
    const manager = resolveManager(targetDir, packageManagerOverride);
    // Read the declared CDS version once, up front — before copyThemeFiles —
    // for every sub-branch that needs it (the actual-install command and the
    // --skip-install message), rather than calling declaredCdsVersion() again
    // later inside the --skip-install log line. A malformed starter manifest
    // (missing the version declaration) then fails consistently before
    // copyThemeFiles regardless of which sub-branch (hasCds/skipInstall/
    // actual-install) is taken.
    const cdsVersion = hasCds ? null : declaredCdsVersion();
    const commandSpec = !hasCds && !skipInstall ? dependencyCommand(manager, [`@coinbase/cds-web@${cdsVersion}`]) : null;
    copyThemeFiles(CDS_DIR, destThemeDir, CDS_FILES);
    if (hasCds) {
      console.log("@coinbase/cds-web already a dependency — skipping install.");
    } else if (skipInstall) {
      console.log(
        `\n--skip-install: dependencies were NOT installed. @coinbase/cds-web@${cdsVersion} still needs to be added.`
      );
    } else {
      run(commandSpec.command, commandSpec.args, targetDir);
    }
    const installedNote = skipInstall && !hasCds ? " Dependencies not installed (--skip-install)." : "";
    console.log(
      `\nDone. Theme files copied into ${destThemeDir}. Wire up MediaQueryProvider -> ThemeProvider -> PortalProvider next.${installedNote}`
    );
  }
}

/** Runs assembleStarter for --new, exiting with a clear message on any validation failure. */
async function assembleStarterOrExit(targetDir) {
  try {
    return await assembleStarter({ sourceRoot: REPO_ROOT, destination: targetDir });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

/**
 * Calls resolveThemeDir, exiting with a clean console.error message (no
 * stack trace) on any validation failure, matching assembleStarterOrExit's
 * pattern above and every other user-facing refusal in main(). resolveThemeDir
 * itself keeps throwing (tests call it directly and expect that) — only this
 * caller converts the throw into a clean exit.
 */
function resolveThemeDirOrExit(baseTargetDir, themeDirRelative) {
  try {
    return resolveThemeDir(baseTargetDir, themeDirRelative);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
