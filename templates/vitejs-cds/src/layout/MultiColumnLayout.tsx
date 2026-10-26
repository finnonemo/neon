/**
 * Multi-column Layout (Figma node 732:2079) — Sidebar + a horizontally-
 * scrolling board of fixed-400px content columns (kanban-style). No
 * Inspector (`hidden="true"` in Figma at every checked tier).
 *
 * Confirmed at its 1440px frame ("Max 1440px" — note this pattern's own
 * frame naming differs from the other 4, which all use "XXXL 1440px"; same
 * viewport size, likely just inconsistent labeling in the source file):
 * Sidebar 320 (see ./layoutPanes.ts's header on the observed sidebar-width
 * discrepancy — using the shared breakpoints.config.ts value here too),
 * then six repeated 400px-wide "Content" sub-frames side by side inside a
 * 2520px-wide Content View.
 *
 * Deliberately does NOT try to compute how many 400px columns "fit" the
 * viewport and hide the rest — a kanban-style board's column count is
 * caller/data-driven (however many columns the board has), and partial
 * visibility of the next column is the normal, correct affordance that
 * something more is scrollable. This renders every column passed in,
 * fixed-width, in a horizontally scrollable row — it doesn't hide data
 * based on viewport width.
 */
import type { ReactNode } from "react";
import { Box } from "@coinbase/cds-web/layout";
import "./layout.css";
import { useBreakpointTier } from "./useBreakpointTier";
import { breakpoints } from "../theme/breakpoints.config";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { ContentView } from "./ContentView";
import type { NavItem } from "./navItems";

const COLUMN_WIDTH = 400;

export function MultiColumnLayout({
  sidebar,
  navigation = [],
  columns,
}: {
  sidebar: ReactNode;
  navigation?: NavItem[];
  columns: ReactNode[];
}) {
  const tier = useBreakpointTier();
  const sidebarWidth = breakpoints.find((b) => b.name === tier)!.sidebarWidth;

  return (
    <Box background="bg" color="fg" font="body" className="neon-layout" data-bottom-nav={navigation.length > 0}>
      <Sidebar width={sidebarWidth} navigation={navigation}>
        {sidebar}
      </Sidebar>
      <div style={{ display: "flex", flex: 1, minWidth: 0, height: "100%", overflowX: "auto" }}>
        {columns.map((column, i) => (
          <ContentView key={i} width={COLUMN_WIDTH}>
            {column}
          </ContentView>
        ))}
      </div>
      <BottomNav navigation={navigation} />
    </Box>
  );
}
