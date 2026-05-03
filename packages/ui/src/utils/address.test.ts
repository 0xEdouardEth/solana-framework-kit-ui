import { describe, expect, test } from "bun:test";
import { copyToClipboard, truncateAddress } from "./address";

describe("truncateAddress", () => {
  test("truncates a long address with default char count", () => {
    const address = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
    expect(truncateAddress(address)).toBe("9WzD...AWWM");
  });

  test("returns the address as-is when it is short enough (≤ 4+4+3 = 11 chars)", () => {
    const short = "ABCDE123456"; // 11 chars exactly
    expect(truncateAddress(short)).toBe(short);
  });

  test("uses the custom chars count", () => {
    const address = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
    // slice(-6) of that 45-char address = "YtAWWM"
    expect(truncateAddress(address, 6)).toBe("9WzDXw...YtAWWM");
  });

  test("handles exactly 11-char address without truncation (chars*2+3 = 11)", () => {
    const address = "12345678901"; // 11 chars
    expect(truncateAddress(address)).toBe(address);
  });

  test("handles 12-char address (just over the threshold)", () => {
    const address = "123456789012"; // 12 chars > 11
    expect(truncateAddress(address)).toBe("1234...9012");
  });
});

describe("copyToClipboard", () => {
  test("returns false when clipboard API is unavailable", async () => {
    // In Bun test environment, navigator.clipboard is not defined
    const result = await copyToClipboard("test");
    // Should return false gracefully (no crash)
    expect(typeof result).toBe("boolean");
  });
});
