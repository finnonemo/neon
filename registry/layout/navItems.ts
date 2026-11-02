/**
 * Shared `NavItem` shape for the Sidebar/BottomNav renderers (see
 * ./SidebarNav.tsx and ./BottomNav.tsx). Ships with no default navigation —
 * each layout's `navigation` prop defaults to an empty list, and the app's
 * App.tsx supplies its own array (local anchors, or none) so a fresh app
 * never ships dead links.
 *
 * `finnomenaEcosystemNav` below is an explicit, opt-in preset for apps that
 * want to link out to Finnomena's own ecosystem — the same 5 destinations as
 * the CDS starter's preset, with lucide icons in place of CDS icon names. It
 * is never wired in automatically; pass it to a layout's `navigation` prop
 * yourself.
 */
import { Bell, ChartNoAxesColumn, House, Search, UserRound, type LucideIcon } from "lucide-react"

export interface NavItem {
  label: string
  icon: LucideIcon
  href: string
  /** Opens in a new tab with rel="noopener noreferrer" when true. */
  external?: boolean
  /** Marks the item as the current page (aria-current="page"). */
  active?: boolean
}

export const finnomenaEcosystemNav: NavItem[] = [
  { label: "Home", icon: House, href: "https://www.finnomena.com", external: true },
  { label: "Search", icon: Search, href: "https://www.finnomena.com/fund/filter", external: true },
  { label: "Portfolio", icon: ChartNoAxesColumn, href: "https://port.finnomena.com/dashboard", external: true },
  { label: "Profile", icon: UserRound, href: "https://auth.finnomena.com/profile", external: true },
  { label: "Notifications", icon: Bell, href: "https://www.finnomena.com/notification/hub", external: true },
]
