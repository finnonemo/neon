/**
 * Sidebar pane: Header (64px, Finnomena logo) + scrollable Content Area
 * (nav rail) + Footer (64px, reserved). Width comes from
 * ../theme/breakpoints.config.ts's `sidebarWidth` per tier (0 = hidden,
 * 64 = icon-rail, >64 = full sidebar) — see AppShell.tsx for how the tier
 * is picked. These widths are structural pane geometry, not
 * color/spacing/radius, so they're read as plain numbers rather than routed
 * through Neon's roles.
 *
 * `navigation` (see ./navItems.ts's `NavItem`) drives the nav rail and
 * defaults to an empty list — no items render until a layout is given one.
 * `children` (the `sidebar` prop threaded in from App.tsx) renders below
 * the nav — use it for anything app-specific.
 */
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Logo } from "./Logo"
import { SidebarNav } from "./SidebarNav"
import type { NavItem } from "./navItems"

const HEADER_FOOTER_HEIGHT = 64

export function Sidebar({
  width,
  navigation = [],
  children,
}: {
  width: number
  navigation?: NavItem[]
  children: ReactNode
}) {
  if (width === 0) return null
  const isRail = width === 64

  return (
    <div style={{ width, flexShrink: 0, display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{ height: HEADER_FOOTER_HEIGHT, flexShrink: 0 }}
        className={cn("flex items-center", isRail ? "justify-center" : "justify-start ps-4")}
      >
        <Logo variant={isRail ? "icon" : "full"} />
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <SidebarNav items={navigation} isRail={isRail} />
        {!isRail && children}
      </div>
      <div style={{ height: HEADER_FOOTER_HEIGHT, flexShrink: 0 }} />
    </div>
  )
}
