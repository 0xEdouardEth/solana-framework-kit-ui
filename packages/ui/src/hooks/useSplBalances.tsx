import { DEFAULT_SPL_TOKENS } from "@/config";

/** Known token metadata for display. Keyed by mint address. */
export const TOKEN_META: Record<string, { symbol: string; decimals: number }> = {
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: { symbol: "USDC", decimals: 6 },
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: { symbol: "USDT", decimals: 6 },
};

/**
 * Returns the resolved mint list from the `splTokens` config option.
 * - `true` or `undefined` → USDC + USDT
 * - `false` → empty array (disabled)
 * - `string[]` → custom mints
 */
export function resolveSplMints(
  splTokens: boolean | readonly string[] | undefined,
): readonly string[] {
  if (splTokens === false) return [];
  if (splTokens === true || splTokens === undefined) return DEFAULT_SPL_TOKENS;
  return splTokens;
}
