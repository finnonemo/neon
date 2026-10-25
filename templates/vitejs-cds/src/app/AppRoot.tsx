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
import type { ReactNode } from "react";
import { MediaQueryProvider, ThemeProvider } from "@coinbase/cds-web/system";
import { PortalProvider } from "@coinbase/cds-web/overlays";

import { createNeonTheme } from "../theme/createTheme";

// Created once, at module scope — ThemeProvider is memoized on theme
// identity, so calling createNeonTheme() inline in JSX would create a new
// object every render and defeat that.
const appTheme = createNeonTheme();

export function AppRoot({
  children,
  colorScheme = "light",
}: {
  children: ReactNode;
  colorScheme?: "light" | "dark";
}) {
  return (
    <MediaQueryProvider>
      <ThemeProvider theme={appTheme} activeColorScheme={colorScheme}>
        <PortalProvider>{children}</PortalProvider>
      </ThemeProvider>
    </MediaQueryProvider>
  );
}
