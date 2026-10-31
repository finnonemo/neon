// PROTOTYPE (spike): replaces CDS useTheme().activeColorScheme.
import { createContext, useContext } from "react";
export type ColorScheme = "light" | "dark";
export const ColorSchemeContext = createContext<ColorScheme>("light");
export const useColorScheme = () => useContext(ColorSchemeContext);
