/**
 * Provider setup for @coinbase/cds-web with Finnomena's neonTheme.
 *
 * Provider order matters and must not be changed:
 *   MediaQueryProvider → ThemeProvider → PortalProvider
 *
 * Import paths verified against the real published @coinbase/cds-web@9.26.1
 * package: MediaQueryProvider/ThemeProvider live under the "./system"
 * subpath, PortalProvider under "./overlays".
 *
 * `createNeonTheme()` merges neonTheme's overrides onto CDS's own
 * `defaultTheme` and returns a complete ThemeConfig (see
 * ../theme/createTheme.ts for why that merge is necessary:
 * ThemeProvider requires a full ThemeConfig, not a partial one, and
 * @coinbase/cds-web has no first-party merge helper).
 *
 * colorScheme defaults to light; pass the app's existing mode state when needed.
 */
import { useLayoutEffect, type ReactNode } from "react";
import { MediaQueryProvider, ThemeProvider } from "@coinbase/cds-web/system";
import { PortalProvider } from "@coinbase/cds-web/overlays";

import { createNeonTheme } from "../theme/createTheme";

// Created once, at module scope — ThemeProvider is memoized on theme
// identity, so calling createNeonTheme() inline in JSX would create a new
// object every render and defeat that.
const appTheme = createNeonTheme();

// CDS's <Text> defaults to font="inherit" and CDS sets no document font, so
// text without a `font` prop would fall back to the browser serif. Give
// <body> the theme's body typography before the first render; CDS portals
// (modals, toasts, tooltips) mount on <body>, outside this provider tree.
if (typeof document !== "undefined") {
  Object.assign(document.body.style, {
    fontFamily: appTheme.fontFamily.body,
    fontSize: appTheme.fontSize.body,
    fontWeight: appTheme.fontWeight.body,
    lineHeight: appTheme.lineHeight.body,
  });
}

export function AppRoot({
  children,
  colorScheme = "light",
}: {
  children: ReactNode;
  colorScheme?: "light" | "dark";
}) {
  // Paint <body> with the active scheme's theme colors and declare that
  // scheme to the browser before first paint, so an OS dark preference
  // never shows its default canvas behind light-theme text.
  useLayoutEffect(() => {
    const color = colorScheme === "dark" ? appTheme.darkColor : appTheme.lightColor;
    if (!color) return; // ThemeProvider throws for a scheme without colors.
    document.documentElement.style.colorScheme = colorScheme;
    Object.assign(document.body.style, { backgroundColor: color.bg, color: color.fg });
  }, [colorScheme]);

  return (
    <MediaQueryProvider>
      <ThemeProvider theme={appTheme} activeColorScheme={colorScheme}>
        <PortalProvider>{children}</PortalProvider>
      </ThemeProvider>
    </MediaQueryProvider>
  );
}
