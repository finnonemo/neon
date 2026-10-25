/**
 * Immersive Layout (Figma node 732:1461) — full-bleed Content only. No
 * Sidebar (the Sidebar View itself is `hidden="true"` in Figma, not just
 * zero-width), no Inspector (also `hidden="true"`). For focus/distraction-
 * free screens — a full-screen editor, a walkthrough, a single-task flow.
 *
 * Confirmed directly against Figma frames at every tier's boundary widths
 * (sm 320/499, md 500/987, lg 988/1079, xl 1080/1271, xxl 1272/1439, xxxl
 * 1440, max 1920 — 2560/3840 not yet checked). Sidebar/Inspector stay
 * hidden and the 64px logo-only header is constant at every tier, but two
 * things are NOT constant, contradicting what this file used to claim
 * from reading only the xxxl frame:
 *
 * - Bottom Navigation is visible at sm (full width; the starter uses 56px plus safe area) — hidden at
 *   every other tier. Same sm-only handoff SimpleLayout/ContentLayout's
 *   consumers already use; this pattern needs it too since Sidebar is
 *   hidden here at every tier, not just sm.
 * - Content stops being full-bleed at max: at 1920px it caps at 1440px
 *   and centers (240px side margins), rather than filling the viewport.
 *   Not yet confirmed whether that cap holds at 2560/3840 or grows further.
 */
import type { ReactNode } from "react";
import "./layout.css";
import { Box } from "@coinbase/cds-web/layout";
import { InspectorView } from "./InspectorView";
import { BottomNav } from "./BottomNav";
import { Logo } from "./Logo";
import { useBreakpointTier } from "./useBreakpointTier";
import type { NavItem } from "./navItems";

const HEADER_HEIGHT = 64;
const MAX_CONTENT_WIDTH = 1440;

export function ImmersiveLayout({
  content,
  navigation = [],
}: {
  content: ReactNode;
  navigation?: NavItem[];
}) {
  const tier = useBreakpointTier();

  return (
    <Box background="bg" color="fg" font="body" className="neon-layout" data-bottom-nav={navigation.length > 0} style={{ flexDirection: "column" }}>
      <Box
        as="header"
        style={{ height: HEADER_HEIGHT, flexShrink: 0 }}
        display="flex"
        alignItems="center"
        paddingStart={2}
      >
        <Logo />
      </Box>
      <div style={{ flex: 1, minHeight: 0, display: "flex", justifyContent: "center" }}>
        {/* InspectorView is the generic "fill" pane component (Toolbar + scrollable body) — reused here since Immersive Layout is a single full-width pane with no fixed-width sibling. Capped/centered at `max` per the Figma frame; full-bleed at every other tier. */}
        <div style={{ width: "100%", maxWidth: tier === "max" ? MAX_CONTENT_WIDTH : undefined, display: "flex" }}>
          <InspectorView pane={{}}>{content}</InspectorView>
        </div>
      </div>
      <BottomNav navigation={navigation} />
    </Box>
  );
}
