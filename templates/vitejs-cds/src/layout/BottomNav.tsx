/** Mobile navigation reserves matching space through layout.css, including the device safe area. */
import { useTheme } from "@coinbase/cds-web/hooks/useTheme";
import "./layout.css";
import { Box } from "@coinbase/cds-web/layout";
import { Icon } from "@coinbase/cds-web/icons";
import { useBreakpointTier } from "./useBreakpointTier";
import type { NavItem } from "./navItems";

export function BottomNav({ navigation = [] }: { navigation?: NavItem[] }) {
  const tier = useBreakpointTier();
  const { activeColorScheme } = useTheme();
  const foreground = activeColorScheme === "dark" ? "fg" : "fgInverse";
  if (tier !== "sm" || navigation.length === 0) return null;

  return (
    <Box
      as="nav"
      className="neon-bottom-nav"
      aria-label="Primary navigation"
      color={foreground}
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={10}
      background="bgPrimary"
      borderedTop
      display="flex"
      alignItems="center"
      justifyContent="space-around"
    >
      {navigation.map((item) => (
        <Box
          as="a"
          key={item.href}
          href={item.href}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
          aria-label={item.label}
          aria-current={item.active ? "page" : undefined}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon name={item.icon} size="m" color={foreground} />
        </Box>
      ))}
    </Box>
  );
}
