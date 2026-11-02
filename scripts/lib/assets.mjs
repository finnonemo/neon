/**
 * assets.mjs — explicit ownership list for the canonical theme assets, so
 * install.mjs and assemble-starter.mjs share one definition of "the 4 CDS
 * files" instead of each hardcoding it. Paths are relative to the resolved
 * plugin root (theme/) — no directory guessing.
 */
export const CDS_FILES = ["theme.config.ts", "color-overrides.ts", "createTheme.ts", "breakpoints.config.ts"];
export const CSS_FILE = "theme/css/theme.css";
/** The Finnomena logo SVGs, kept once in theme/logo/; the starter assembles them into src/assets/logo/ and the Neon registry's logo item ships them. */
export const LOGO_DIR = "theme/logo";
export const LOGO_FILES = ["logo-finnomena-icon-dark.svg", "logo-finnomena-icon-light.svg", "logo-finnomena-text-dark.svg", "logo-finnomena-text-light.svg"];
