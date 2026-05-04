import { describe, expect, test } from "bun:test";
import { DEFAULT_SPL_TOKENS } from "./index";

describe("DEFAULT_SPL_TOKENS", () => {
  test("contains USDC mint address", () => {
    expect(DEFAULT_SPL_TOKENS).toContain("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
  });

  test("contains USDT mint address", () => {
    expect(DEFAULT_SPL_TOKENS).toContain("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
  });

  test("has exactly 2 entries", () => {
    expect(DEFAULT_SPL_TOKENS).toHaveLength(2);
  });

  test("is readonly", () => {
    // TypeScript enforces this at compile time, but we verify the values are stable
    expect(DEFAULT_SPL_TOKENS[0]).toBe("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    expect(DEFAULT_SPL_TOKENS[1]).toBe("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
  });
});
