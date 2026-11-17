// The palette, theme/tokens/colors.json: every Primitive of Core's Colors library, which every color token resolves
// against (ADR 0012). Core records the library in its docs/theme/theme.json, as `primitives`, a flat map of
// "Hue/Step": "#RRGGBBAA" in the library's order. Core's Web compile does not carry it, so the Core sync reads it from
// the commit it compiled and writes the palette from it; the manifest records the palette's hash, and the repository
// check (checkCorePalette in core-snapshot.mjs) refuses a palette that no longer has it.
import { execFileSync } from 'node:child_process';

export const PALETTE_FILE = 'theme/tokens/colors.json';
// Where Core records the Colors library, in a Core checkout.
export const CORE_THEME_DOC = 'docs/theme/theme.json';
const NAME = /^([^/]+)\/([^/]+)$/;
const HEX = /^#[0-9a-f]{8}$/i;

/**
 * The palette file from Core's theme record `text`, in the shape its readers take: hue, then step, then
 * { value, type: "color", prefix: "colors" }. The value is lowercase hex, with the alpha left off when it is ff.
 * Hues keep the library's order; steps keep it too, except that a step named by a whole number comes first, as
 * JavaScript orders an object's keys. The file has no newline at its end, as the export it replaces had none, so a
 * sync of the same library leaves it byte for byte as it was. Refuses a record with no `primitives`, a name that is
 * not "Hue/Step" and a value that is not "#RRGGBBAA".
 */
export function paletteFromCore(text, where = CORE_THEME_DOC) {
  let primitives;
  try {
    ({ primitives } = JSON.parse(text));
  } catch {
    throw new Error(`${where} is not JSON that can be read, so the palette was not written.`);
  }
  if (!primitives || typeof primitives !== 'object' || !Object.keys(primitives).length) {
    throw new Error(`${where} has no \`primitives\`, Core's record of the Colors library, so the palette was not written. Core records it from 44c9cab on: sync a Core commit at or after it.`);
  }
  const palette = {};
  for (const [name, value] of Object.entries(primitives)) {
    const [, hue, step] = name.match(NAME) ?? [];
    if (!hue) throw new Error(`${where}: the primitive ${JSON.stringify(name)} is not named "Hue/Step", so the palette was not written.`);
    if (typeof value !== 'string' || !HEX.test(value)) throw new Error(`${where}: ${name} is ${JSON.stringify(value)}, not a color written "#RRGGBBAA", so the palette was not written.`);
    const hex = value.toLowerCase();
    (palette[hue] ??= {})[step] = { value: hex.endsWith('ff') ? hex.slice(0, 7) : hex, type: 'color', prefix: 'colors' };
  }
  return JSON.stringify(palette, null, 2);
}

/** The palette file from Core's theme record at `commit` of the Core checkout at `from`. */
export function corePalette(from, commit) {
  let text;
  try {
    text = execFileSync('git', ['-C', from, 'show', `${commit}:${CORE_THEME_DOC}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
  } catch {
    throw new Error(`Core ${commit.slice(0, 8)} has no ${CORE_THEME_DOC}, Core's record of the Colors library, so nothing was written.`);
  }
  return paletteFromCore(text, `${CORE_THEME_DOC} at Core ${commit.slice(0, 8)}`);
}

const values = text => {
  let palette;
  try { palette = JSON.parse(text); } catch { return new Map(); }
  return new Map(Object.entries(palette).flatMap(([hue, steps]) => Object.entries(steps ?? {}).map(([step, entry]) => [`${hue}/${step}`, entry?.value])));
};

/** The primitives whose value differs between two palette files, as [{ name, was, is }]; null stands for one a side lacks. */
export function paletteChanges(before, after) {
  const [was, is] = [values(before ?? ''), values(after)];
  const names = [...is.keys(), ...[...was.keys()].filter(name => !is.has(name))];
  return names.flatMap(name => (was.get(name) === is.get(name) ? [] : [{ name, was: was.get(name) ?? null, is: is.get(name) ?? null }]));
}

/** What the sync prints about the palette (paletteChanges' result), as lines: the pull request lists each value that moved. */
export function paletteReport(changes, { count, written }) {
  if (!changes.length) return [`${PALETTE_FILE}: the ${count} primitives of Core's Colors library are the values it ${written ? 'already held' : 'holds'}.`];
  const width = Math.max(...changes.map(({ name }) => name.length));
  return [
    `Primitives of ${PALETTE_FILE} that ${written ? 'changed' : 'would change'}: ${changes.length} of ${count}.`,
    ...changes.map(({ name, was, is }) => `  ${name.padEnd(width)}  ${was ?? '(none)'} → ${is ?? '(removed)'}`),
    'Each Theme token, Immersive Theme and gradient recipe that names one moves with it: list them before the pull request.',
  ];
}

/** How many primitives a palette file holds. */
export const paletteCount = text => values(text).size;
