// PROTOTYPE (spike): no provider stack; theme.css + shadcn variables do the work.
import { useLayoutEffect, type ReactNode } from "react";
import { ColorSchemeContext, type ColorScheme } from "./colorScheme";

export function AppRoot({ children, colorScheme = "light" }: { children: ReactNode; colorScheme?: ColorScheme }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = colorScheme; // theme.css roles
    root.classList.toggle("dark", colorScheme === "dark"); // shadcn dark: variant
    root.style.colorScheme = colorScheme;
  }, [colorScheme]);
  return <ColorSchemeContext.Provider value={colorScheme}>{children}</ColorSchemeContext.Provider>;
}
