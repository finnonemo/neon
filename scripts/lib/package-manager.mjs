/**
 * package-manager.mjs — everything the installer knows about package
 * managers: gathering package-manager evidence from disk, choosing a
 * manager from it, and building the argv-array command to run. Internal to
 * the installer (./install.mjs); tested only through its interface.
 *
 * Commands are always argv arrays, never shell strings, so callers can pass
 * them straight to spawnSync without interpolating anything into a shell.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const SUPPORTED_MANAGERS = ["npm", "pnpm", "yarn", "bun"];

const LOCKFILE_TO_MANAGER = {
  "package-lock.json": "npm",
  "npm-shrinkwrap.json": "npm",
  "pnpm-lock.yaml": "pnpm",
  "yarn.lock": "yarn",
  "bun.lockb": "bun",
  "bun.lock": "bun",
};
const LOCKFILE_NAMES = Object.keys(LOCKFILE_TO_MANAGER);

const ADD_SUBCOMMAND = { npm: "install", pnpm: "add", yarn: "add", bun: "add" };

/** Throws unless `override` is undefined or names a supported manager. */
export function assertSupportedOverride(override) {
  if (override !== undefined && !SUPPORTED_MANAGERS.includes(override)) {
    throw new Error(`Unsupported --package-manager "${override}". Supported: ${SUPPORTED_MANAGERS.join(", ")}.`);
  }
}

/**
 * Chooses the manager for an install that will run in `projectDir`.
 *
 * Priority: an explicit override; then evidence. With `starterDir` (the
 * --new case) the starter's own manifest/lockfiles are read first, without
 * walking upward — the walk would otherwise climb out of the starter into
 * the Neon checkout. Only when the starter carries no evidence does the walk
 * start from `projectDir` (which need not exist yet: the walk only checks
 * existence and climbs to real parents).
 *
 * Throws on an unsupported override or on lockfiles naming different
 * managers, rather than planting a second lockfile beside a stale one.
 */
export function choosePackageManager({ projectDir, starterDir, override }) {
  assertSupportedOverride(override);
  if (override !== undefined) return override;

  let evidence = starterDir ? readEvidence(starterDir) : null;
  if (!evidence || (!evidence.declared && evidence.lockfiles.length === 0)) {
    evidence = findEvidence(projectDir);
  }
  return selectFromEvidence(evidence);
}

/**
 * Builds the command that adds `packages`, or — when `packages` is empty —
 * installs a project's already-declared dependencies (`npm ci` when `ci`
 * is set and the manager is npm).
 */
export function dependencyCommand(manager, packages = [], { ci = false } = {}) {
  if (packages.length === 0) {
    return manager === "npm" && ci ? { command: "npm", args: ["ci"] } : { command: manager, args: ["install"] };
  }
  return { command: manager, args: [ADD_SUBCOMMAND[manager], ...packages] };
}

/** True if `dir` directly contains an npm lockfile (predicts `npm ci` viability). */
export function hasNpmLockfile(dir) {
  return existsSync(join(dir, "package-lock.json"));
}

function selectFromEvidence({ declared, lockfiles }) {
  if (declared) {
    const declaredName = String(declared).split("@")[0].trim();
    // An unrecognized declared value is ignored, falling through to lockfiles.
    if (SUPPORTED_MANAGERS.includes(declaredName)) return declaredName;
  }

  const managers = new Set(lockfiles.map((lockfile) => LOCKFILE_TO_MANAGER[lockfile]));
  if (managers.size > 1) {
    throw new Error(
      `Conflicting package manager evidence from lockfiles: ${lockfiles.join(", ")}. ` +
        `Resolve by removing the stale lockfile or passing --package-manager explicitly.`
    );
  }
  return managers.size === 1 ? [...managers][0] : "npm";
}

/** Lockfiles and declared packageManager directly in `dir`; a missing or unreadable dir has none. */
function readEvidence(dir) {
  let lockfiles = [];
  if (existsSync(dir)) {
    try {
      const entries = new Set(readdirSync(dir));
      lockfiles = LOCKFILE_NAMES.filter((name) => entries.has(name));
    } catch {
      // Exists but unreadable (e.g. a permissions-restricted ancestor).
    }
  }
  let declared;
  const pkgPath = join(dir, "package.json");
  if (existsSync(pkgPath)) {
    try {
      declared = JSON.parse(readFileSync(pkgPath, "utf8")).packageManager;
    } catch {
      // Malformed package.json at this directory — no declared evidence here.
    }
  }
  return { lockfiles, declared };
}

/**
 * Walks up from `startDir` for package-manager evidence, the way
 * npm/yarn/pnpm/corepack discover a workspace root. A monorepo app (e.g.
 * apps/portal/) usually has no lockfile or packageManager of its own, and
 * grouping directories (a bare apps/) have no manifest at all, so the walk
 * climbs through both. It returns the first directory with any evidence,
 * and stops empty-handed at a directory containing `.git` (a walk limit,
 * not a workspace-membership check) or at the filesystem root.
 *
 * This only widens where evidence is gathered; the install still runs in
 * the original directory.
 */
function findEvidence(startDir) {
  let dir = startDir;
  for (;;) {
    const evidence = readEvidence(dir);
    if (evidence.lockfiles.length > 0 || evidence.declared) return evidence;
    const parent = dirname(dir);
    if (existsSync(join(dir, ".git")) || parent === dir) return { lockfiles: [], declared: undefined };
    dir = parent;
  }
}
