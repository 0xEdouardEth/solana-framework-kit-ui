import { createContext, useContext } from "react";
import type { CSSProperties } from "react";

type ThemeContextValue = Readonly<{
  colorScheme: "dark" | "light";
  cssVars: CSSProperties;
}>;

export const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: "dark",
  cssVars: {},
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
