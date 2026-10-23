/**
 * install.mjs — the installer: puts canonical theme assets into a target
 * project and, unless told to skip, installs the dependencies they need.
 * scripts/install.mjs is its CLI; skills invoke that, tests call install().
 *
 * Interface: one call, `install({ mode, target, ...options })`, where mode
 * is one of
 *   "new"      — assemble the starter + canonical CDS files into an empty
 *                target (via ./assemble-starter.mjs), then install the
 *                starter's declared dependencies
 *   "cds"      — copy the 4 canonical CDS files into <target>/src/theme (or
 *                themeDir) and add @coinbase/cds-web at the starter's
 *                declared version if the project lacks it
 *   "css-only" — copy theme/css/theme.css into <target>/src/theme (or
 *                themeDir); never installs anything
 * It resolves to a result describing what happened, or rejects with an
 * InstallError carrying the exit code the CLI should use. It never prints
 * (other than through the injected `log`) and never exits the process.
 *
 * Preflight: every check — mode/option compatibility, the package-manager
 * override, package-manager evidence, the theme destination, the starter's
 * manifest and CDS version, customized destination files — runs before the
 * first write. A refused install leaves the target untouched, even in modes
 * or option combinations that would never actually run a package manager.
 * Only an unexpected I/O failure mid-copy can leave partial writes.
 *
 * Seams: `runCommand(command, args, cwd)` runs the package-manager command
 * (default: createCommandRunner(), the real spawnSync adapter; tests pass a
 * recording fake). `sourceRoot` points at a Neon root other than this one.
 */
import { constants, copyFileSync, existsSync, mkdirSync, readFileSync, realpathSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { assembleStarter } from "./assemble-starter.mjs";
import { CDS_FILES, CSS_FILE } from "./assets.mjs";
import { assertSupportedOverride, choosePackageManager, dependencyCommand, hasNpmLockfile } from "./package-manager.mjs";

const DEFAULT_SOURCE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DEFAULT_THEME_DIR = "src/theme";
const CDS_PACKAGE = "@coinbase/cds-web";

/** An installer refusal or failure; `exitCode` is what the CLI should exit with. */
export class InstallError extends Error {
  constructor(message, { exitCode = 1, cause } = {}) {
    super(message, { cause });
    this.name = "InstallError";
    this.exitCode = exitCode;
  }
}

/**
 * The real runCommand adapter. Windows needs `shell: true` so spawnSync
 * resolves managers installed as .cmd shims (npm, pnpm, yarn and bun all
 * ship that way there). Throws an InstallError carrying the child's exit
 * status when the command fails.
 */
export function createCommandRunner({ platform = process.platform, spawn = spawnSync, log = console.log } = {}) {
  return (command, args, cwd) => {
    log(`> ${command} ${args.join(" ")}`);
    const result = spawn(command, args, { cwd, stdio: "inherit", shell: platform === "win32" });
    if (result.error) {
      throw new InstallError(`Failed to run "${command}": ${result.error.message}`);
    }
    if (result.status !== 0) {
      throw new InstallError(`Command failed (exit ${result.status}): ${command} ${args.join(" ")}`, {
        exitCode: result.status ?? 1,
      });
    }
  };
}

export async function install({
  mode,
  target,
  themeDir,
  packageManager,
  skipInstall = false,
  sourceRoot = DEFAULT_SOURCE_ROOT,
  runCommand = createCommandRunner(),
  log = () => {},
}) {
  try {
    const neon = { sourceRoot, starterDir: join(sourceRoot, "templates", "vitejs-cds") };
    const options = { target: resolve(target), themeDir, packageManager, skipInstall, runCommand, log };
    if (mode === "new") return await installNew(neon, options);
    // Shape-check an explicit override before any mode-specific work, so it
    // is rejected even where no package manager would ever run.
    assertSupportedOverride(packageManager);
    if (mode === "cds") return await installCds(neon, options);
    if (mode === "css-only") return installCssOnly(neon, options);
    throw new Error(`Unknown install mode "${mode}". Expected new, cds or css-only.`);
  } catch (err) {
    throw err instanceof InstallError ? err : new InstallError(err.message, { cause: err });
  }
}

async function installNew(neon, { target, themeDir, packageManager, skipInstall, runCommand }) {
  if (themeDir !== undefined) {
    throw new Error(
      "--theme-dir is not supported with --new: the scaffolded starter's own source imports theme files " +
        "from a fixed src/theme path, so moving that destination would break the scaffolded app."
    );
  }
  assertSupportedOverride(packageManager);
  readStarterManifest(neon); // a malformed bundled starter fails here, before the target exists
  const manager = choosePackageManager({ projectDir: target, starterDir: neon.starterDir, override: packageManager });
  // assembleStarter copies the starter tree through unchanged, so the
  // starter's own lockfile predicts the assembled app's.
  const command = skipInstall ? null : dependencyCommand(manager, [], { ci: hasNpmLockfile(neon.starterDir) });

  const { destination } = await assembleStarter({ sourceRoot: neon.sourceRoot, destination: target });
  if (command) runCommand(command.command, command.args, destination);
  return result({ mode: "new", destination, packageManager: manager, dependenciesInstalled: !skipInstall });
}

async function installCds(neon, { target, themeDir, packageManager, skipInstall, runCommand, log }) {
  const pkgPath = join(target, "package.json");
  if (!existsSync(pkgPath)) {
    throw new Error(`No package.json found at ${pkgPath} — is this an existing project?`);
  }
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const cdsAlreadyPresent = Boolean(pkg.dependencies?.[CDS_PACKAGE] || pkg.devDependencies?.[CDS_PACKAGE]);
  const destThemeDir = resolveThemeDir(target, themeDir ?? DEFAULT_THEME_DIR);
  // Resolved even when nothing will be installed, so ambiguous manager
  // configuration is rejected consistently before any write.
  const manager = choosePackageManager({ projectDir: target, override: packageManager });
  const cdsVersion = cdsAlreadyPresent ? null : declaredCdsVersion(neon);
  const command =
    cdsAlreadyPresent || skipInstall ? null : dependencyCommand(manager, [`${CDS_PACKAGE}@${cdsVersion}`]);

  const copiedFiles = copyThemeFiles(join(neon.sourceRoot, "theme", "cds"), destThemeDir, CDS_FILES, log);
  if (command) runCommand(command.command, command.args, target);
  return result({
    mode: "cds",
    destination: target,
    themeDir: destThemeDir,
    copiedFiles,
    packageManager: manager,
    cdsAlreadyPresent,
    cdsVersion,
    dependenciesInstalled: Boolean(command) || cdsAlreadyPresent,
  });
}

function installCssOnly(neon, { target, themeDir, log }) {
  const destThemeDir = resolveThemeDir(target, themeDir ?? DEFAULT_THEME_DIR);
  const cssPath = join(neon.sourceRoot, CSS_FILE);
  const copiedFiles = copyThemeFiles(dirname(cssPath), destThemeDir, [basename(cssPath)], log);
  return result({ mode: "css-only", destination: target, themeDir: destThemeDir, copiedFiles });
}

function result(fields) {
  return {
    destination: null,
    themeDir: null,
    copiedFiles: 0,
    packageManager: null,
    cdsAlreadyPresent: false,
    cdsVersion: null,
    dependenciesInstalled: false,
    ...fields,
  };
}

function readStarterManifest({ starterDir }) {
  return JSON.parse(readFileSync(join(starterDir, "package.json"), "utf8"));
}

/** The CDS version range the starter declares — the version every install pins to. */
function declaredCdsVersion(neon) {
  const version = readStarterManifest(neon).dependencies?.[CDS_PACKAGE];
  if (!version) {
    throw new Error(`templates/vitejs-cds/package.json does not declare a ${CDS_PACKAGE} version.`);
  }
  return version;
}

/**
 * Resolves a project-relative theme directory, refusing (throwing) one that
 * is absolute, resolves to the target itself or outside it, or passes
 * through an existing ancestor symlink resolving outside it. Applies to the
 * default "src/theme" too, so a refusal here does not always mean
 * --theme-dir was used.
 */
function resolveThemeDir(targetDir, themeDirRelative) {
  if (isAbsolute(themeDirRelative)) {
    throw new Error(`Theme destination path must be project-relative, got an absolute path: ${themeDirRelative}`);
  }
  const resolved = resolve(targetDir, themeDirRelative);
  const rel = relative(targetDir, resolved);
  if (rel === "") {
    throw new Error(`Theme destination must not resolve to the target directory itself: ${themeDirRelative}`);
  }
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(`Theme destination escapes the target directory: ${themeDirRelative}`);
  }

  // Realpath the deepest existing ancestor: if it lands outside the target,
  // some ancestor component is a symlink escaping the target directory.
  let ancestor = resolved;
  while (!existsSync(ancestor)) {
    const parent = dirname(ancestor);
    if (parent === ancestor) break;
    ancestor = parent;
  }
  if (existsSync(ancestor) && existsSync(targetDir)) {
    const realRel = relative(realpathSync(targetDir), realpathSync(ancestor));
    if (realRel.startsWith("..") || isAbsolute(realRel)) {
      throw new Error(
        `Theme destination resolves outside the target directory via a symlinked ancestor: ${themeDirRelative}`
      );
    }
  }
  return resolved;
}

/**
 * Copies `filenames` from `srcDir` into `destThemeDir`. Identical existing
 * files are kept; any customized one refuses the whole copy before a single
 * file is written. Returns how many files were copied.
 */
function copyThemeFiles(srcDir, destThemeDir, filenames, log) {
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
  log(`Copied ${pending.length} theme files into ${destThemeDir}`);
  return pending.length;
}
