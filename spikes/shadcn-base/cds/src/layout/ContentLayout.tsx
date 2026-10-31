/** ContentLayout: desktop panes retain their geometry; below lg, content opens details as a separate view. */
import type { ReactNode } from "react";
import { Box } from "@coinbase/cds-web/layout";
import { useBreakpointTier } from "./useBreakpointTier";
import { contentLayoutPanes } from "./layoutPanes";
import { breakpoints } from "../theme/breakpoints.config";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { ResponsivePanes, type PaneNavigationProps } from "./ResponsivePanes";
import type { NavItem } from "./navItems";
import "./layout.css";

export function ContentLayout({
  sidebar, navigation = [], content, inspector, ...paneNavigation
}: PaneNavigationProps & {
  sidebar: ReactNode;
  navigation?: NavItem[];
  content: ReactNode;
  inspector: ReactNode;
}) {
  const tier = useBreakpointTier();
  const sidebarWidth = breakpoints.find((b) => b.name === tier)!.sidebarWidth;
  const pane = contentLayoutPanes[tier];

  return (
    <Box background="bg" color="fg" font="body" className="neon-layout" data-bottom-nav={navigation.length > 0}>
      <Sidebar width={sidebarWidth} navigation={navigation}>{sidebar}</Sidebar>
      <ResponsivePanes
        {...paneNavigation} content={content} inspector={inspector}
        compact={tier === "sm" || tier === "md"}
        inspectorWidth={pane.inspector === "hidden" ? undefined : pane.inspector}
        contentCapAt={pane.content.capAt}
      />
      <BottomNav navigation={navigation} />
    </Box>
  );
}
