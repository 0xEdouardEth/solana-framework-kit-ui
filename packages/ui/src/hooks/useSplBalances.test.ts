import { describe, expect, test } from "bun:test";
import { DEFAULT_SPL_TOKENS } from "@/config";
import { TOKEN_META, resolveSplMints } from "./useSplBalances";

describe("resolveSplMints", () => {
  test("returns default tokens for undefined", () => {
    expect(resolveSplMints(undefined)).toEqual(DEFAULT_SPL_TOKENS);
  });

  test("returns default tokens for true", () => {
    expect(resolveSplMints(true)).toEqual(DEFAULT_SPL_TOKENS);
  });

  test("returns empty array for false", () => {
    expect(resolveSplMints(false)).toEqual([]);
  });

  test("returns custom mints when array is provided", () => {
    const custom = ["mint1", "mint2"];
    expect(resolveSplMints(custom)).toEqual(custom);
  });

  test("returns readonly array (same reference) for custom mints", () => {
    const custom = ["mint1"] as const;
    expect(resolveSplMints(custom)).toBe(custom);
  });
});

describe("TOKEN_META", () => {
  test("has USDC metadata", () => {
    expect(TOKEN_META.EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v).toEqual({
      symbol: "USDC",
      decimals: 6,
    });
  });

  test("has USDT metadata", () => {
    expect(TOKEN_META.Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB).toEqual({
      symbol: "USDT",
      decimals: 6,
    });
  });
});
