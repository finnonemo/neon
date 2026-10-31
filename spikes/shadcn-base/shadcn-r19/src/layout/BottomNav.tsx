import "./layout.css";
import { useBreakpointTier } from "./useBreakpointTier";
import type { NavItem } from "./navItems";

export function BottomNav({ navigation = [] }: { navigation?: NavItem[] }) {
  const tier = useBreakpointTier();
  if (tier !== "sm" || navigation.length === 0) return null;
  return (
    <nav aria-label="Primary navigation"
      className="neon-bottom-nav fixed inset-x-0 bottom-0 z-10 flex items-center justify-around border-t bg-primary text-primary-foreground">
      {navigation.map(({ icon: Icon, ...item }) => (
        <a key={item.href} href={item.href}
          target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}
          aria-label={item.label} aria-current={item.active ? "page" : undefined}
          className="flex items-center justify-center text-inherit no-underline">
          <Icon className="size-6" />
        </a>
      ))}
    </nav>
  );
}
