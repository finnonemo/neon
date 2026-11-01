// The app's one provider root. theme.css reads data-theme on <html>, so the
// color scheme is a single attribute; no theme provider is needed.
import { useLayoutEffect, type ReactNode } from "react"
import { ColorSchemeContext, type ColorScheme } from "./colorScheme"

export function AppRoot({ children, colorScheme = "light" }: { children: ReactNode; colorScheme?: ColorScheme }) {
  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = colorScheme
    root.style.colorScheme = colorScheme
  }, [colorScheme])
  return <ColorSchemeContext.Provider value={colorScheme}>{children}</ColorSchemeContext.Provider>
}
