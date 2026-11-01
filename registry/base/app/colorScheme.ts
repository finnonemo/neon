import { createContext, useContext } from "react"

export type ColorScheme = "light" | "dark"
export const ColorSchemeContext = createContext<ColorScheme>("light")
/** The active color scheme, for the rare component that must branch on it. */
export const useColorScheme = () => useContext(ColorSchemeContext)
