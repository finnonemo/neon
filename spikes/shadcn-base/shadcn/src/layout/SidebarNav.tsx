import { cn } from "@/lib/utils";
import type { NavItem } from "./navItems";

export function SidebarNav({ items, isRail }: { items: NavItem[]; isRail: boolean }) {
  if (items.length === 0) return null;
  return (
    <nav className="flex flex-col gap-1 p-2">
      {items.map(({ icon: Icon, ...item }) => (
        <a
          key={item.href} href={item.href}
          target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}
          aria-label={item.label} aria-current={item.active ? "page" : undefined}
          className={cn("flex items-center gap-2 rounded-md p-2 text-foreground no-underline", isRail ? "justify-center" : "justify-start")}
        >
          <Icon className="size-6" />
          {!isRail && <span>{item.label}</span>}
        </a>
      ))}
    </nav>
  );
}
