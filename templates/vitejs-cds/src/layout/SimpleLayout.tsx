/**
 * Simple Layout (Figma node 732:4002) — Sidebar + a single Content pane,
 * filling the remaining width. No Inspector at all (Figma's Inspector View
 * for this pattern has real dimensions but is `hidden="true"` at every
 * breakpoint checked — it's not a pane this pattern ever shows).
 *
 * Confirmed at xxxl: Sidebar 360 (matches breakpoints.config.ts), Content
 * 1080 (= 1440 viewport − 360 sidebar, filling exactly). Only the xxxl
 * frame was read — narrower tiers extrapolated using the same sidebar
 * hidden/rail/full progression as the other patterns; re-verify before
 * treating as pixel-final.
 */
import type { ReactNode } from "react";
import { Box } from "@coinbase/cds-web/layout";
import "./layout.css";
import { useBreakpointTier } from "./useBreakpointTier";
import { breakpoints } from "../theme/breakpoints.config";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { InspectorView } from "./InspectorView";
import type { NavItem } from "./navItems";

export function SimpleLayout({
  sidebar,
  navigation = [],
  content,
}: {
  sidebar: ReactNode;
  navigation?: NavItem[];
  content: ReactNode;
}) {
  const tier = useBreakpointTier();
  const sidebarWidth = breakpoints.find((b) => b.name === tier)!.sidebarWidth;

  return (
    <Box background="bg" color="fg" font="body" className="neon-layout" data-bottom-nav={navigation.length > 0}>
      <Sidebar width={sidebarWidth} navigation={navigation}>
        {sidebar}
      </Sidebar>
      {/* InspectorView is the generic "fill" pane component (Toolbar + scrollable body) — reused here for the sole content pane, since Simple Layout has no fixed-width pane at all. */}
      <InspectorView pane={{}}>{content}</InspectorView>
      <BottomNav navigation={navigation} />
    </Box>
  );
}
