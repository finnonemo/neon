/**
 * Reference pattern: correct provider setup for any Finnomena app using
 * @coinbase/cds-web with the neonTheme override.
 *
 * Provider order matters and must not be changed:
 *   MediaQueryProvider → ThemeProvider → PortalProvider
 *
 * Import paths verified against the real published @coinbase/cds-web@9.26.1
 * package: MediaQueryProvider/ThemeProvider live under "./system",
 * PortalProvider under "./overlays".
 *
 * `createNeonTheme()` merges neonTheme's overrides onto CDS's own
 * `defaultTheme` and returns a complete ThemeConfig (see
 * ../theme/createTheme.ts for why that merge is necessary:
 * ThemeProvider requires a full ThemeConfig, not a partial one, and
 * @coinbase/cds-web has no first-party merge helper).
 *
 * Font: Finnomena uses IBM Plex Sans Thai company-wide. It is NOT part of
 * the Figma token export, so it's loaded here directly rather than through
 * theme.config.ts's token pipeline. Prefer self-hosting (via @fontsource) in
 * production apps instead of the Google Fonts <link> shown as the quick-start
 * option below.
 *
 * When integrating into a project that ALREADY loads fonts some other way
 * (a framework font loader, an existing self-hosted @font-face), reuse that
 * mechanism instead of adding this one as a second, competing loader — and
 * only request the weights the affected UI actually renders (400/500/600/700
 * cover this theme's own type scale; check theme.config.ts's fontWeight
 * export before assuming a different set). See
 * ${CLAUDE_PLUGIN_ROOT}/skills/neon-audit/references/theme-integration.md
 * §1 for the full inspect-and-verify procedure — "loaded" by family name is
 * not sufficient; verify with real Thai sample text too.
 *
 * colorScheme defaults to "light" for this minimal example.
 * In a real app, derive it from whatever already controls dark/light there
 * (an existing toggle/hook/stored preference) rather than hardcoding it or
 * defaulting to prefers-color-scheme — see theme-integration.md §2.
 */
// Load once in the framework's global-style entrypoint; move these there if
// global CSS imports are not permitted in this provider module.
import "@coinbase/cds-web/globalStyles";
import "@coinbase/cds-web/defaultFontStyles";
import "@coinbase/cds-icons/fonts/web/icon-font.css";

import type { ReactNode } from "react";
import { MediaQueryProvider, ThemeProvider } from "@coinbase/cds-web/system";
import { PortalProvider } from "@coinbase/cds-web/overlays";

import { createNeonTheme } from "../theme/createTheme";

// Created once, at module scope — ThemeProvider is memoized on theme
// identity, so calling createNeonTheme() inline in JSX would create a new
// object every render and defeat that.
const appTheme = createNeonTheme();

// Quick-start font loading (swap for a self-hosted @fontsource import before
// shipping to production):
//
//   <link rel="preconnect" href="https://fonts.googleapis.com" />
//   <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
//   <link
//     href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap"
//     rel="stylesheet"
//   />
//
// Self-hosted alternative:
//   npm install @fontsource/ibm-plex-sans-thai
//   import "@fontsource/ibm-plex-sans-thai/400.css";
//   import "@fontsource/ibm-plex-sans-thai/500.css";
//   import "@fontsource/ibm-plex-sans-thai/600.css";
//   import "@fontsource/ibm-plex-sans-thai/700.css";

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

/**
 * DO NOT do this anywhere in app code — always go through theme tokens:
 *
 *   // ❌ forbidden
 *   <div style={{ color: "#1F3344", padding: 16, borderRadius: 8 }} />
 *
 *   // ✅ correct — real CDS token keys (verified against
 *   // dts/styles/styleProps.d.ts: color -> ThemeVars.Color, padding ->
 *   // ThemeVars.Space, borderRadius -> ThemeVars.BorderRadius)
 *   <Box color="fg" padding={2} borderRadius="200" />
 *
 * See SKILL.md for the full rule, the full token-key reference, and how
 * it's enforced.
 */
