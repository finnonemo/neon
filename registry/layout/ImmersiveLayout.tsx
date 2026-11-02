/**
 * Immersive Layout (Figma node 732:1461) — full-bleed Content only. No
 * Sidebar (the Sidebar View itself is `hidden="true"` in Figma, not just
 * zero-width), no Inspector (also `hidden="true"`). For focus/distraction-
 * free screens — a full-screen editor, a walkthrough, a single-task flow.
 *
 * Confirmed directly against Figma frames at every tier's boundary widths
 * (sm 320/499, md 500/987, lg 988/1079, xl 1080/1271, xxl 1272/1439, xxxl
 * 1440, max 1920 — 2560/3840 not yet checked). Sidebar/Inspector stay
 * hidden and the 64px logo-only header is constant at every tier, but two
 * things are NOT constant, contradicting what this file used to claim
 * from reading only the xxxl frame:
 *
 * - Bottom Navigation is visible at sm (full width; the starter uses 56px plus safe area) — hidden at
 *   every other tier. Same sm-only handoff SimpleLayout/ContentLayout's
 *   consumers already use; this pattern needs it too since Sidebar is
 *   hidden here at every tier, not just sm.
 * - Content stops being full-bleed at max: at 1920px it caps at 1440px
 *   and centers (240px side margins), rather than filling the viewport.
 *   Not yet confirmed whether that cap holds at 2560/3840 or grows further.
 *
 * With an `immersiveTheme`, the page is a Campaign Page in that Immersive
 * Theme: the theme attribute goes on the root and on <html> (immersive.css
 * maps it to canvas, text, action and focus ring, and sets color-scheme),
 * the page scrolls with the window instead of its own pane, and the logo
 * takes the theme's tone.
 */
import { useLayoutEffect, type ReactNode } from "react"
import { ColorSchemeContext, useColorScheme, type ColorScheme } from "@/app/colorScheme"
import "./layout.css"
import "../theme/immersive.css"
import { InspectorView } from "./InspectorView"
import { BottomNav } from "./BottomNav"
import { Logo } from "./Logo"
import { useBreakpointTier } from "./useBreakpointTier"
import type { NavItem } from "./navItems"

export type ImmersiveTheme = "club" | "exclusive" | "private" | "ultra"

/** Each theme's color scheme, from its canvas luminance: only Ultra's navy is dark. immersive.css sets the same color-scheme. */
const THEME_SCHEMES: Record<ImmersiveTheme, ColorScheme> = { club: "light", exclusive: "light", private: "light", ultra: "dark" }

const HEADER_HEIGHT = 64
const MAX_CONTENT_WIDTH = 1440

export function ImmersiveLayout({
  content,
  navigation = [],
  immersiveTheme,
}: {
  content: ReactNode
  navigation?: NavItem[]
  immersiveTheme?: ImmersiveTheme
}) {
  const tier = useBreakpointTier()
  const appScheme = useColorScheme()

  useLayoutEffect(() => {
    if (!immersiveTheme) return
    const root = document.documentElement
    root.dataset.immersiveTheme = immersiveTheme
    return () => { delete root.dataset.immersiveTheme }
  }, [immersiveTheme])

  // A themed page grows with its content, so the window scrolls and overscroll shows the canvas painted on <html>.
  const scroll = immersiveTheme ? { height: "auto", minHeight: "100dvh", overflow: "visible" } : {}

  return (
    <ColorSchemeContext.Provider value={immersiveTheme ? THEME_SCHEMES[immersiveTheme] : appScheme}>
    <div className="neon-layout bg-background font-sans text-body text-foreground" data-bottom-nav={navigation.length > 0} data-immersive-theme={immersiveTheme} style={{ flexDirection: "column", ...scroll }}>
      <header style={{ height: HEADER_HEIGHT, flexShrink: 0 }} className="flex items-center ps-4">
        <Logo />
      </header>
      <div style={{ flex: 1, minHeight: 0, display: "flex", justifyContent: "center" }}>
        {/* InspectorView is the generic "fill" pane component (Toolbar + scrollable body) — reused here since Immersive Layout is a single full-width pane with no fixed-width sibling. Capped/centered at `max` per the Figma frame; full-bleed at every other tier. */}
        <div className="neon-immersive-content" style={{ width: "100%", maxWidth: tier === "max" ? MAX_CONTENT_WIDTH : undefined, display: "flex" }}>
          <InspectorView pane={{}}>{content}</InspectorView>
        </div>
      </div>
      <BottomNav navigation={navigation} />
    </div>
    </ColorSchemeContext.Provider>
  )
}
