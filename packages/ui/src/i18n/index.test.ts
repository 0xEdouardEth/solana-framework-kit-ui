import { describe, expect, test } from "bun:test";
import { resolveLabels, resolveLocale } from "./index";
import { en } from "./locales/en";

describe("resolveLocale", () => {
  test("returns a supported locale string", () => {
    const locale = resolveLocale();
    expect(typeof locale).toBe("string");
    expect(locale.length).toBeGreaterThan(0);
  });

  test("returns a locale from the supported set", () => {
    const supported = ["en", "fr", "es", "de", "zh", "ja", "pt", "ru", "ko", "ar"];
    const locale = resolveLocale();
    expect(supported).toContain(locale);
  });
});

describe("resolveLabels", () => {
  test("returns English labels for 'en' locale", () => {
    const labels = resolveLabels("en");
    expect(labels.connectWallet).toBe("Connect Wallet");
    expect(labels.disconnect).toBe("Disconnect");
  });

  test("returns exact English labels object", () => {
    const labels = resolveLabels("en");
    expect(labels).toEqual(en);
  });

  test("falls back to English for unknown locale", () => {
    const labels = resolveLabels("xx");
    expect(labels.connectWallet).toBe("Connect Wallet");
  });

  test("merges overrides on top of base labels", () => {
    const labels = resolveLabels("en", { connectWallet: "Sign In" });
    expect(labels.connectWallet).toBe("Sign In");
    // Other labels remain unchanged
    expect(labels.disconnect).toBe("Disconnect");
  });

  test("returns base labels when overrides is undefined", () => {
    const labels = resolveLabels("en", undefined);
    expect(labels).toEqual(en);
  });

  test("returns base labels when overrides is empty", () => {
    const labels = resolveLabels("en", {});
    expect(labels.connectWallet).toBe("Connect Wallet");
    expect(labels.balance).toBe("Balance");
  });

  test("all expected label keys are present", () => {
    const labels = resolveLabels("en");
    const expectedKeys = [
      "connectWallet",
      "connecting",
      "disconnect",
      "disconnecting",
      "connectAWallet",
      "closeModal",
      "noWalletsDetected",
      "getPhantom",
      "notInstalled",
      "install",
      "balance",
      "copyAddress",
      "addressCopied",
      "viewOnExplorer",
      "recentTransactions",
      "noRecentTransactions",
      "lastUsed",
      "agreeToTerms",
      "termsOfService",
      "network",
      "mainnet",
      "devnet",
      "testnet",
    ];

    for (const key of expectedKeys) {
      expect(labels).toHaveProperty(key);
      expect(typeof labels[key as keyof typeof labels]).toBe("string");
    }
  });
});
