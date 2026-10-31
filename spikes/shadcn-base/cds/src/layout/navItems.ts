/**
 * Shared `NavItem` shape for the starter's Sidebar/BottomNav renderers (see
 * ./SidebarNav.tsx and ./BottomNav.tsx). Ships with no default navigation —
 * each layout's `navigation` prop defaults to an empty list, and the
 * scaffolded ../app/App.tsx supplies its own array (local anchors, or none)
 * so a fresh scaffold never ships dead links.
 *
 * `finnomenaEcosystemNav` below is an explicit, opt-in preset for apps that
 * want to link out to Finnomena's own ecosystem — the same 5 destinations
 * shown on the left icon rail at trade.finnomena.com, confirmed against the
 * live production site. It is never wired in automatically; pass it to a
 * layout's `navigation` prop yourself. Icon names are real
 * @coinbase/cds-icons glyphs, checked against the installed
 * @coinbase/cds-web@9.26.1's icon set, not invented.
 */
import type { ComponentProps } from "react";
import { Icon } from "@coinbase/cds-web/icons";

export type NavIconName = ComponentProps<typeof Icon>["name"];

export interface NavItem {
  label: string;
  icon: NavIconName;
  href: string;
  /** Opens in a new tab with rel="noopener noreferrer" when true. */
  external?: boolean;
  /** Marks the item as the current page (aria-current="page"). */
  active?: boolean;
}

export const finnomenaEcosystemNav: NavItem[] = [
  { label: "Home", icon: "home", href: "https://www.finnomena.com", external: true },
  {
    label: "Search",
    icon: "search",
    href: "https://www.finnomena.com/fund/filter",
    external: true,
  },
  {
    label: "Portfolio",
    icon: "barChartSimple",
    href: "https://port.finnomena.com/dashboard",
    external: true,
  },
  { label: "Profile", icon: "avatar", href: "https://auth.finnomena.com/profile", external: true },
  {
    label: "Notifications",
    icon: "bell",
    href: "https://www.finnomena.com/notification/hub",
    external: true,
  },
];
