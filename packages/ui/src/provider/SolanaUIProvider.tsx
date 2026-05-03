import { ConfigContext, type SFKConfig } from "@/config";
import type { CSSProperties, ReactNode } from "react";
import { ThemeContext } from "./ThemeContext";

type Theme = Readonly<{
  /** Primary accent color. @default "#9945FF" (Solana purple) */
  accent?: string;
  /** Hover variant of accent. Defaults to `accent` if not provided. */
  accentHover?: string;
  /** Foreground color on accent backgrounds. @default "#ffffff" */
  accentForeground?: string;
  /** Modal / surface background color. @default "#0f1117" */
  surface?: string;
  /** Hover state for surface elements. @default "#1e1b2e" */
  surfaceHover?: string;
  /** Primary text color. @default "#e8eaf6" */
  text?: string;
  /** Muted / secondary text color. @default "#7b82a8" */
  textMuted?: string;
  /** Border color. @default "#2e3248" */
  border?: string;
  /** Border radius for cards and modals. @default "14px" */
  radius?: string;
  /** Border radius for buttons and smaller elements. @default "8px" */
  radiusSm?: string;
  /** Overlay background. @default "rgba(0,0,0,0.65)" */
  overlay?: string;
  /** Font family. @default "inherit" */
  fontFamily?: string;
}>;

type SolanaUIProviderProps = Readonly<{
  children: ReactNode;
  /**
   * Theme overrides. All values are optional — unset variables
   * fall back to the library defaults.
   */
  theme?: Theme;
  /**
   * HTML `data-sfk-theme` attribute value.
   * Use `"light"` for the light variant. @default "dark"
   */
  colorScheme?: "dark" | "light";
  /**
   * Global configuration for all child components.
   * Feature flags default to `true` when not specified.
   */
  config?: SFKConfig;
}>;

/**
 * Converts a 6-digit hex color to rgba().
 * Returns the original string unchanged if it can't be parsed.
 */
function hexToRgba(hex: string, alpha: number): string {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return hex;
  return `rgba(${Number.parseInt(match[1], 16)}, ${Number.parseInt(match[2], 16)}, ${Number.parseInt(match[3], 16)}, ${alpha})`;
}

/**
 * Root provider for solana-framework-kit-ui.
 *
 * Injects CSS custom properties for theming and provides config context to all
 * child components. Must be placed inside `SolanaProvider` from `@solana/react-hooks`.
 *
 * @example
 * ```tsx
 * import { autoDiscover, createClient } from "@solana/client";
 * import { SolanaProvider } from "@solana/react-hooks";
 * import { SolanaUIProvider, ConnectButton } from "solana-framework-kit-ui";
 *
 * const client = createClient({ walletConnectors: autoDiscover() });
 *
 * export default function App() {
 *   return (
 *     <SolanaProvider client={client}>
 *       <SolanaUIProvider config={{ locale: "fr" }}>
 *         <ConnectButton />
 *       </SolanaUIProvider>
 *     </SolanaProvider>
 *   );
 * }
 * ```
 */
export function SolanaUIProvider({
  children,
  theme = {},
  colorScheme = "dark",
  config = {},
}: SolanaUIProviderProps) {
  // CSS custom properties aren't part of the CSSProperties type, so we build
  // the vars map as a plain Record and spread into the style prop.
  const vars: Record<string, string> = {};

  if (theme.accent) {
    vars["--sfk-accent"] = theme.accent;
    vars["--sfk-accent-hover"] = theme.accentHover ?? theme.accent;
    vars["--sfk-accent-glow"] = hexToRgba(theme.accent, 0.18);
    vars["--sfk-border-accent"] = hexToRgba(theme.accent, 0.5);
  } else if (theme.accentHover) {
    vars["--sfk-accent-hover"] = theme.accentHover;
  }

  if (theme.accentForeground) vars["--sfk-accent-foreground"] = theme.accentForeground;
  if (theme.surface) vars["--sfk-surface"] = theme.surface;
  if (theme.surfaceHover) vars["--sfk-surface-hover"] = theme.surfaceHover;
  if (theme.text) vars["--sfk-text"] = theme.text;
  if (theme.textMuted) vars["--sfk-text-muted"] = theme.textMuted;
  if (theme.border) vars["--sfk-border"] = theme.border;
  if (theme.radius) vars["--sfk-radius"] = theme.radius;
  if (theme.radiusSm) vars["--sfk-radius-sm"] = theme.radiusSm;
  if (theme.overlay) vars["--sfk-overlay-bg"] = theme.overlay;
  if (theme.fontFamily) vars["--sfk-font"] = theme.fontFamily;

  const cssVars = vars as CSSProperties;
  const style = Object.keys(vars).length > 0 ? cssVars : undefined;

  return (
    <ConfigContext.Provider value={config}>
      <ThemeContext.Provider value={{ colorScheme, cssVars }}>
        <div className="sfk-root" data-sfk-theme={colorScheme} style={style}>
          {children}
        </div>
      </ThemeContext.Provider>
    </ConfigContext.Provider>
  );
}
