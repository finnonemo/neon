/**
 * Renders the caller-supplied nav list (see ./navItems.ts's `NavItem`)
 * inside the Sidebar's scrollable content slot. `isRail` switches between
 * icon-only (64px tier) and icon+label (full-width tiers) — see
 * ./Sidebar.tsx. `items` is empty by default; nothing renders until a
 * layout is given a `navigation` array.
 */
import { cn } from "@/lib/utils"
import type { NavItem } from "./navItems"

export function SidebarNav({ items, isRail }: { items: NavItem[]; isRail: boolean }) {
  if (items.length === 0) return null

  return (
    <nav className="flex flex-col gap-1 p-2">
      {items.map(({ icon: Icon, ...item }) => (
        <a
          key={item.href}
          href={item.href}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
          aria-label={item.label}
          aria-current={item.active ? "page" : undefined}
          className={cn("flex items-center gap-2 rounded-md p-2 text-foreground no-underline", isRail ? "justify-center" : "justify-start")}
        >
          <Icon className="size-6" />
          {!isRail && <span className="neon-sidebar-label">{item.label}</span>}
        </a>
      ))}
    </nav>
  )
}
