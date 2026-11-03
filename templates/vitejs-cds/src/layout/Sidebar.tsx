/**
 * Sidebar pane: Header (64px, Finnomena logo) + scrollable Content Area
 * (nav rail) + Footer (64px, reserved). Width comes from
 * ../theme/breakpoints.config.ts's `sidebarWidth` per tier (0 = hidden,
 * 64 = icon-rail, >64 = full sidebar) — see AppShell.tsx for how the tier
 * is picked. Three-pane workspace callers opt into CSS geometry (0/64/240px)
 * from the order-history reference; other layouts keep the exported widths.
 * These widths are structural pane geometry, not
 * color/spacing/radius, so they're read as plain numbers rather than routed
 * through neonTheme's style tokens.
 *
 * `navigation` (see ./navItems.ts's `NavItem`) drives the nav rail and
 * defaults to an empty list — no items render until a layout is given one.
 * `children` (the `sidebar` prop threaded in from App.tsx) renders below
 * the nav — use it for anything app-specific.
 */
import type { ReactNode } from "react";
import { Box } from "@coinbase/cds-web/layout";
import { Logo } from "./Logo";
import { SidebarNav } from "./SidebarNav";
import type { NavItem } from "./navItems";

const HEADER_FOOTER_HEIGHT = 64;

export function Sidebar({
  width,
  workspace = false,
  navigation = [],
  children,
}: {
  width: number;
  /** Three-pane workspace chrome follows the live order-history reference. */
  workspace?: boolean;
  navigation?: NavItem[];
  children: ReactNode;
}) {
  if (width === 0) return null;
  const isRail = !workspace && width === 64;

  return (
    <Box borderedEnd
      className={workspace ? "neon-sidebar neon-workspace-sidebar" : "neon-sidebar"}
      style={{
        width: workspace ? undefined : width,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        borderedBottom
        style={{ height: HEADER_FOOTER_HEIGHT, flexShrink: 0 }}
        display="flex"
        alignItems="center"
        justifyContent={isRail ? "center" : "flex-start"}
        paddingStart={isRail ? 0 : 2}
      >
        {workspace ? <>
          <span className="neon-sidebar-symbol"><Logo variant="icon" /></span>
          <span className="neon-sidebar-wordmark"><Logo variant="full" /></span>
        </> : <Logo variant={isRail ? "icon" : "full"} />}
      </Box>
      <div className={workspace ? "neon-sidebar-body" : undefined} style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <SidebarNav items={navigation} isRail={isRail} />
        {!isRail && <div className="neon-sidebar-content">{children}</div>}
      </div>
      <div style={{ height: HEADER_FOOTER_HEIGHT, flexShrink: 0 }} />
    </Box>
  );
}
