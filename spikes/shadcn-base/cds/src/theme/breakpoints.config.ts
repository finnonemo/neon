/**
 * Finnomena responsive breakpoint/grid tiers — projected from
 * tokens/breakpoint.json's "Detailed Layout" variant.
 *
 * GENERATED FILE — do not hand-edit. Regenerate with:
 *   node theme/scripts/sync-tokens.mjs && node theme/scripts/generate-breakpoints-config.mjs
 *
 * This file covers viewport ranges, sidebar rail/full width, and grid
 * rhythm (gutter/end-margins/columns) only. It does NOT cover Content/
 * Inspector pane widths for the 3-pane app shell — those come from a
 * separate Figma frame read, not this token export (see
 * templates/vitejs-cds/src/layout/layoutPanes.ts for that data
 * and why it's kept separate).
 */
export interface BreakpointTier {
  name: "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl" | "max";
  minWidth: number;
  maxWidth: number;
  /** Sidebar width at this tier: 0 = hidden, 64 = icon-rail, >64 = full sidebar. */
  sidebarWidth: number;
  gutter: number;
  endMargins: number;
  columns: number;
}

export const breakpoints: readonly BreakpointTier[] = [
  { name: "sm", minWidth: 320, maxWidth: 499, sidebarWidth: 0, gutter: 16, endMargins: 16, columns: 4 },
  { name: "md", minWidth: 500, maxWidth: 987, sidebarWidth: 64, gutter: 16, endMargins: 16, columns: 8 },
  { name: "lg", minWidth: 988, maxWidth: 1079, sidebarWidth: 64, gutter: 16, endMargins: 16, columns: 12 },
  { name: "xl", minWidth: 1080, maxWidth: 1271, sidebarWidth: 240, gutter: 16, endMargins: 16, columns: 12 },
  { name: "xxl", minWidth: 1272, maxWidth: 1439, sidebarWidth: 320, gutter: 16, endMargins: 16, columns: 12 },
  { name: "xxxl", minWidth: 1440, maxWidth: 1919, sidebarWidth: 360, gutter: 24, endMargins: 24, columns: 12 },
  { name: "max", minWidth: 1920, maxWidth: 3840, sidebarWidth: 360, gutter: 24, endMargins: 24, columns: 12 },
] as const;

export type BreakpointName = BreakpointTier["name"];
