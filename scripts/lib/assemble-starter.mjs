/**
 * assemble-starter.mjs — combines starter source (application wiring,
 * layouts, providers) with the canonical CDS theme files into a complete,
 * runnable app on the frozen CDS starter. Used by the maintainer CLI
 * (scripts/assemble-starter.mjs) and the browser runner's CDS target; the
 * installer's --new starts from the Neon registry instead.
 *
 * Never launches npm/pnpm/yarn/bun — assembly is a pure filesystem
 * operation. The caller is responsible for any post-assembly dependency
 * install.
 */
import { cp, mkdir, readdir, lstat, copyFile, constants } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative, resolve, isAbsolute } from "node:path";
import { CDS_FILES, LOGO_DIR, LOGO_FILES } from "./assets.mjs";

const EXCLUDED_NAMES = new Set(["node_modules", "dist", ".git", ".DS_Store"]);

/** True if relPath (starter-relative, "/"-or-"\\"-separated) should be skipped when copying starter source. */
function isExcludedStarterEntry(relPath) {
  const parts = relPath.split(/[\\/]/).filter(Boolean);
  if (parts.some((part) => EXCLUDED_NAMES.has(part))) return true;
  // Legacy tracked theme copy — assembly supplies destination/src/theme
  // itself from the canonical CDS files below, so any src/theme carried in
  // the starter source (stale, pre-migration) must never be copied through.
  if (parts[0] === "src" && parts[1] === "theme") return true;
  return false;
}

/** existsSync follows symlinks; this checks whether *anything* (even a broken symlink) sits at p. */
async function pathLexists(p) {
  try {
    await lstat(p);
    return true;
  } catch {
    return false;
  }
}

async function validateDestination(sourceRoot, destination) {
  const resolvedSource = resolve(sourceRoot);
  const resolvedDest = resolve(destination);

  const destRel = relative(resolvedSource, resolvedDest);
  // The checkout's gitignored .local/ holds disposable apps and eval fixtures.
  const inLocal = /^\.local[\\/]./.test(destRel);
  if (destRel === "" || (!inLocal && !destRel.startsWith("..") && !isAbsolute(destRel))) {
    throw new Error(`assembleStarter: destination is inside the source tree: ${resolvedDest}`);
  }

  if (await pathLexists(resolvedDest)) {
    const stat = await lstat(resolvedDest);
    if (stat.isSymbolicLink()) {
      throw new Error(`assembleStarter: destination must not be a symlink: ${resolvedDest}`);
    }
    if (!stat.isDirectory()) {
      throw new Error(`assembleStarter: destination is not a directory: ${resolvedDest}`);
    }
    const entries = await readdir(resolvedDest);
    if (entries.length > 0) {
      throw new Error(`assembleStarter: destination is not empty: ${resolvedDest}`);
    }
  }

  return resolvedDest;
}

function validateCanonicalSource(sourceRoot) {
  const starterDir = join(sourceRoot, "templates", "vitejs-cds");
  if (!existsSync(join(starterDir, "package.json"))) {
    throw new Error(`assembleStarter: no starter manifest found at ${join(starterDir, "package.json")}`);
  }
  const cdsDir = join(sourceRoot, "theme", "cds");
  for (const file of CDS_FILES) {
    if (!existsSync(join(cdsDir, file))) {
      throw new Error(`assembleStarter: missing canonical theme file ${join(cdsDir, file)}`);
    }
  }
  const logoDir = join(sourceRoot, LOGO_DIR);
  for (const file of LOGO_FILES) {
    if (!existsSync(join(logoDir, file))) {
      throw new Error(`assembleStarter: missing canonical logo ${join(logoDir, file)}`);
    }
  }
  return { starterDir, cdsDir, logoDir };
}

/**
 * Assembles a complete, runnable app at `destination` by combining
 * `sourceRoot`'s starter source with its canonical CDS theme files.
 * Validates everything before writing anything. Never launches a package
 * manager. Returns { destination, themeFiles }.
 */
export async function assembleStarter({ sourceRoot, destination }) {
  if (!sourceRoot) throw new Error("assembleStarter: sourceRoot is required");
  if (!destination) throw new Error("assembleStarter: destination is required");

  const { starterDir, cdsDir, logoDir } = validateCanonicalSource(sourceRoot);
  const resolvedDest = await validateDestination(sourceRoot, destination);

  await mkdir(resolvedDest, { recursive: true });
  await cp(starterDir, resolvedDest, {
    recursive: true,
    filter: (src) => !isExcludedStarterEntry(relative(starterDir, src)),
  });

  const destThemeDir = join(resolvedDest, "src", "theme");
  await mkdir(destThemeDir, { recursive: true });
  for (const file of CDS_FILES) {
    await copyFile(join(cdsDir, file), join(destThemeDir, file), constants.COPYFILE_EXCL);
  }

  // The starter's Logo imports its SVGs from src/assets/logo; they live once, in theme/logo/.
  const destLogoDir = join(resolvedDest, "src", "assets", "logo");
  await mkdir(destLogoDir, { recursive: true });
  for (const file of LOGO_FILES) {
    await copyFile(join(logoDir, file), join(destLogoDir, file), constants.COPYFILE_EXCL);
  }

  return { destination: resolvedDest, themeFiles: [...CDS_FILES] };
}
