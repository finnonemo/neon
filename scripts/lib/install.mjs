/**
 * install.mjs — the installer: puts canonical theme assets into a target
 * project and, unless told to skip, installs the dependencies they need.
 * scripts/install.mjs is its CLI; skills invoke that, tests call install().
 *
 * Interface: one call, `install({ mode, target, ...options })`, where mode
 * is one of
 *   "new"      — run the pinned shadcn init from the Neon base item into a
 *                missing or empty target; shadcn installs the dependencies
 *   "add"      — run the pinned shadcn add for `items` in an app with a
 *                components.json, keeping Neon files the app has in its own
 *                form (reported as `keptFiles`)
 *   "cds"      — frozen for apps already on CDS: copy the 4 canonical CDS
 *                files into <target>/src/theme (or themeDir) and add
 *                @coinbase/cds-web at the starter's declared version if the
 *                project lacks it
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
 * New and Add read their items from the Neon registry pinned to this
 * package's release (`registry` overrides it, as the smoke build does with a
 * local server; failing that, `env.NEON_REGISTRY_URL`, which the eval runner
 * sets so the agent under test runs the plain command), and check after
 * shadcn that every item file landed.
 *
 * Seams: `runCommand(command, args, cwd)` runs the package-manager or shadcn
 * command (default: createCommandRunner(), the real spawnSync adapter; tests
 * pass a recording fake). `fetchJson(url)` reads one registry item (default:
 * fetch). `sourceRoot` points at a Neon root other than this one.
 */
import { constants, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, rmdirSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { CDS_FILES, CSS_FILE } from "./assets.mjs";
import { assertSupportedOverride, choosePackageManager, dependencyCommand } from "./package-manager.mjs";
import { SHADCN, fetchRegistryJson, neonRegistryUrl, resolveItemFiles } from "./registry.mjs";

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
  items = [],
  themeDir,
  packageManager,
  skipInstall = false,
  sourceRoot = DEFAULT_SOURCE_ROOT,
  runCommand = createCommandRunner(),
  registry,
  fetchJson = fetchRegistryJson,
  env = process.env,
  log = () => {},
}) {
  try {
    const neon = { sourceRoot, starterDir: join(sourceRoot, "templates", "vitejs-cds") };
    const options = { target: resolve(target), themeDir, packageManager, skipInstall, runCommand, registry, fetchJson, log };
    const neonRegistry = { ...options, env };
    if (mode === "new") return await installNew(neon, neonRegistry);
    if (mode === "add") return await installAdd(neon, { ...neonRegistry, items });
    // Shape-check an explicit override before any mode-specific work, so it
    // is rejected even where no package manager would ever run.
    assertSupportedOverride(packageManager);
    if (registry !== undefined) throw new Error("--registry applies only to --new and --add, which install from the Neon registry.");
    if (mode === "cds") return await installCds(neon, options);
    if (mode === "css-only") return installCssOnly(neon, options);
    throw new Error(`Unknown install mode "${mode}". Expected new, add, cds or css-only.`);
  } catch (err) {
    throw err instanceof InstallError ? err : new InstallError(err.message, { cause: err });
  }
}

async function installNew(neon, { target, themeDir, packageManager, skipInstall, runCommand, registry, env, fetchJson }) {
  // shadcn init installs as it creates, with the manager it detects, and the
  // base imports its theme from src/theme, so these would be silently ignored.
  refuseShadcnOptions("--new: shadcn init creates the Neon base app as it ships", { themeDir, packageManager, skipInstall });
  if (existsSync(target) && readdirSync(target).length > 0) throw new Error(`New: destination is not empty: ${target}`);
  const url = await neonRegistryUrl({ registry, env, root: neon.sourceRoot });
  const files = await resolveItemFiles({ url, names: ["neon-base"], fetchJson });

  // Vite refuses an existing destination, even an empty one, so an empty one
  // is removed for init and put back if init fails before creating the app.
  const emptied = existsSync(target);
  if (emptied) rmdirSync(target);
  mkdirSync(dirname(target), { recursive: true });
  const args = ["init", "-t", "vite", "-b", "radix", "-n", basename(target), "--no-monorepo", `${url}/neon-base.json`];
  try {
    runCommand("npx", ["--yes", SHADCN, ...args], dirname(target));
  } catch (err) {
    if (emptied && !existsSync(target)) mkdirSync(target);
    throw err;
  }
  assertLanded(target, files);
  // The vite template's provider would be a second color scheme beside AppRoot's.
  rmSync(join(target, "src/components/theme-provider.tsx"), { force: true });
  return result({ mode: "new", destination: target, dependenciesInstalled: true });
}

async function installAdd(neon, { target, items, themeDir, packageManager, skipInstall, runCommand, registry, env, fetchJson, log }) {
  // shadcn add installs as it adds, with the manager the app's lockfile names,
  // and writes each item where the item targets it.
  refuseShadcnOptions("--add: shadcn add installs each item as the registry has it", { themeDir, packageManager, skipInstall });
  if (items.length === 0) throw new Error("Name at least one Neon item to add, e.g. --add dialog.");
  const configPath = join(target, "components.json");
  if (!existsSync(configPath)) {
    throw new Error(`No components.json at ${configPath}: --add needs an app shadcn manages. Start one with --new, or use --css-only.`);
  }
  const url = await neonRegistryUrl({ registry, env, root: neon.sourceRoot });
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const neonRegistry = `${url}/{name}.json`;
  const current = config.registries?.["@neon"];
  if (current !== undefined && current !== neonRegistry) {
    throw new Error(`components.json's @neon registry is ${current}, not this release's ${neonRegistry}. Point it at this release to add from it.`);
  }
  const names = items.map((item) => item.replace(/^@neon\//, ""));
  const files = await resolveItemFiles({ url, names, fetchJson });
  if (current === undefined) {
    writeFileSync(configPath, `${JSON.stringify({ ...config, registries: { ...config.registries, "@neon": neonRegistry } }, null, 2)}\n`);
  }

  // shadcn has no "keep existing" choice: it prompts on every differing file
  // and, without a terminal, writes nothing. Each Neon file the app already
  // has in its own form gets the registry's content while shadcn runs, which
  // shadcn skips as identical, and is put back afterwards, even on failure.
  const kept = new Map();
  for (const [path, content] of files) {
    const own = existsSync(join(target, path)) ? readFileSync(join(target, path), "utf8") : null;
    if (own !== null && own !== content) kept.set(path, own);
  }
  try {
    for (const path of kept.keys()) writeFileSync(join(target, path), files.get(path));
    runCommand("npx", ["--yes", SHADCN, "add", ...names.map((name) => `@neon/${name}`), "-y"], target);
  } finally {
    for (const [path, own] of kept) writeFileSync(join(target, path), own);
  }
  assertLanded(target, files, kept);
  if (kept.size > 0) log(`Kept the app's own ${[...kept.keys()].join(", ")}`);
  if (kept.has(NEON_CN) && !/["']label1["']/.test(kept.get(NEON_CN))) {
    log(`Warning: ${NEON_CN} keeps a cn without Neon's type roles, so Neon components can lose a text size or color when classes merge. Compare it with the Neon registry's lib/utils.ts.`);
  }
  return result({ mode: "add", destination: target, keptFiles: [...kept.keys()], dependenciesInstalled: true });
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

// Neon's cn, which knows Neon's type roles (text-label1, ...) as font sizes.
const NEON_CN = "src/lib/utils.ts";

/** Refuses the CDS-mode options shadcn would silently ignore. */
function refuseShadcnOptions(reason, { themeDir, packageManager, skipInstall }) {
  const given = { "--theme-dir": themeDir !== undefined, "--skip-install": skipInstall, "--package-manager": packageManager !== undefined };
  for (const [flag, isGiven] of Object.entries(given)) {
    if (isGiven) throw new Error(`${flag} is not supported with ${reason}.`);
  }
}

/**
 * Checks that shadcn wrote each registry file as the registry has it. shadcn
 * can exit 0 having written nothing (a prompt it cannot show), so its exit
 * status alone proves nothing. `kept` maps paths to the app's own content.
 */
function assertLanded(app, files, kept = new Map()) {
  for (const [path, content] of files) {
    const installed = existsSync(join(app, path)) ? readFileSync(join(app, path), "utf8") : null;
    const expected = kept.get(path) ?? content;
    if (installed !== expected) {
      throw new Error(`${path} is not the Neon registry's${kept.has(path) ? " (nor the app's own)" : ""}; shadcn did not finish the install.`);
    }
  }
}

/** The default fetchJson: one registry item from the pinned release. */
function result(fields) {
  return {
    destination: null,
    themeDir: null,
    copiedFiles: 0,
    keptFiles: [],
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
