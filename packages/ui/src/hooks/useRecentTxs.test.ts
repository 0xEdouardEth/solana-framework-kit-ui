import { describe, expect, test } from "bun:test";
import { relativeTime } from "./useRecentTxs";

describe("relativeTime", () => {
  test("returns empty string for null", () => {
    expect(relativeTime(null)).toBe("");
  });

  test("returns empty string for 0", () => {
    expect(relativeTime(0)).toBe("");
  });

  test("returns seconds ago for < 60s", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(relativeTime(now - 30)).toBe("30s ago");
  });

  test("returns minutes ago for < 1h", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(relativeTime(now - 300)).toBe("5m ago");
  });

  test("returns hours ago for < 24h", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(relativeTime(now - 7200)).toBe("2h ago");
  });

  test("returns days ago for >= 24h", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(relativeTime(now - 172800)).toBe("2d ago");
  });

  test("floors fractional values", () => {
    const now = Math.floor(Date.now() / 1000);
    // 90 seconds = 1.5 minutes → should floor to 1m
    expect(relativeTime(now - 90)).toBe("1m ago");
  });
});
