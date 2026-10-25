/**
 * Pane specs for the 5 named layout patterns from Figma (file
 * C9Usn2yP1dRpE9iTxyW3B2, Core Components), by breakpoint tier. Renamed
 * from appShellPanes.ts (which held only the Detailed Layout spec) when
 * the other 4 patterns were added.
 *
 * Sourced from Figma get_metadata reads at the 1440px (xxxl) frame for
 * each pattern — NOT from theme/tokens/breakpoint.json's own per-variant
 * numbers, which model a different, single-active-pane concept (only one
 * of Content/Inspector is ever nonzero per variant) and don't reliably
 * predict actual pane VISIBILITY in Figma (confirmed: e.g. Simple Layout's
 * token data has Inspector as the nonzero pane, but the real frame shows
 * Content visible and Inspector `hidden="true"`). Pane visibility below
 * comes from Figma's own `hidden` attribute, not the token export.
 *
 * Sidebar width is NOT duplicated here — read it from
 * ../theme/breakpoints.config.ts's `sidebarWidth` field. Note: the raw
 * Figma frames for Content Layout and Multi-column Layout showed a
 * slightly different sidebar width at the 1440px frame (320px) than
 * Detailed/Simple Layout's 360px, which matches breakpoints.config.ts's
 * xxxl value — likely minor drift between component variants in the
 * source file, not an intentional per-pattern difference. Using the
 * shared breakpoints.config.ts value everywhere for a visually consistent
 * app shell across patterns; flag to the design owner if this should
 * actually vary per pattern.
 *
 * Only the 1440px (xxxl) frame was read per pattern — other breakpoints
 * are extrapolated using the same sidebar hidden/rail/full progression and
 * "hide non-essential panes on narrow viewports" pattern already
 * established and verified for Detailed Layout. Re-verify against fresh
 * screenshots at other breakpoints before treating as pixel-final.
 */
import type { BreakpointName } from "../theme/breakpoints.config";

export interface InspectorPane {
  /** From this tier up, Inspector's own content caps at this width and centers. */
  capAt?: number;
}

export interface DetailedPaneSpec {
  /** Desktop Content width; "hidden" marks compact mode, where ResponsivePanes switches views. */
  content: number | "hidden";
  inspector: InspectorPane;
}

export interface ContentPaneSpec {
  /** Inspector pane is always either a fixed width or hidden — Content is the one that fills. */
  inspector: number | "hidden";
  content: InspectorPane;
}

/**
 * Detailed Layout (node 732:842/732:843) — Sidebar + Content + Inspector,
 * all 3 simultaneous, inspector-weighted (inspector gets the larger share
 * at desktop widths: 680px vs. content's 400px at xxxl).
 */
export const detailedLayoutPanes: Record<BreakpointName, DetailedPaneSpec> = {
  sm: { content: "hidden", inspector: {} },
  md: { content: "hidden", inspector: {} },
  lg: { content: 360, inspector: {} },
  xl: { content: 360, inspector: {} },
  xxl: { content: 360, inspector: {} },
  xxxl: { content: 400, inspector: {} },
  max: { content: 560, inspector: { capAt: 980 } },
};

/**
 * Content Layout (node 732:4929) — Sidebar + Content + Inspector, all 3
 * simultaneous, content-weighted (inverse of Detailed: Content is the
 * "fill" pane, Inspector is the fixed-width one — opposite of Detailed
 * Layout's roles). Confirmed at xxxl: Sidebar 320 (see header caveat
 * above), Inspector 400 (fixed), Content 720 (= 1440 viewport − 320
 * sidebar − 400 inspector, confirmed exact). This exactly matches
 * Detailed Layout's own confirmed xxxl content width (400) used in the
 * opposite role — so rather than inventing new per-tier numbers for the
 * other 6 breakpoints, this reuses Detailed Layout's already-verified
 * fixed-width sequence for Inspector here, since the one confirmed data
 * point shows Content Layout is Detailed Layout's structural mirror, not
 * an independently-designed scale.
 */
export const contentLayoutPanes: Record<BreakpointName, ContentPaneSpec> = {
  sm: { inspector: "hidden", content: {} },
  md: { inspector: "hidden", content: {} },
  lg: { inspector: 360, content: {} },
  xl: { inspector: 360, content: {} },
  xxl: { inspector: 360, content: {} },
  xxxl: { inspector: 400, content: {} },
  max: { inspector: 560, content: { capAt: 980 } },
};
