import { describe, expect, test } from "bun:test";
import { formatSol } from "./balance";

const TEST_ADDRESS = "7cjEct8b9jCAyQaCTefikqXkh9iU3j8BaUVdX7pWf3Lc";
const MAINNET_RPC = "https://api.mainnet-beta.solana.com";

// ---------------------------------------------------------------------------
// formatSol — pure unit tests
// ---------------------------------------------------------------------------

describe("formatSol", () => {
  test("returns null for null", () => {
    expect(formatSol(null)).toBeNull();
  });

  test("returns null for undefined", () => {
    expect(formatSol(undefined)).toBeNull();
  });

  test("formats 0 lamports", () => {
    expect(formatSol(0n)).toBe("0.0000");
  });

  test("formats 1 SOL exactly", () => {
    expect(formatSol(1_000_000_000n)).toBe("1.0000");
  });

  test("formats 1.5 SOL", () => {
    expect(formatSol(1_500_000_000n)).toBe("1.5000");
  });

  test("formats 0.054 SOL (test-address value)", () => {
    // 54_223_350 lamports → "0.0542"
    expect(formatSol(54_223_350n)).toBe("0.0542");
  });

  test("formats fractional < 0.001 SOL", () => {
    // 100_000 lamports = 0.0001 SOL
    expect(formatSol(100_000n)).toBe("0.0001");
  });
});

// ---------------------------------------------------------------------------
// Raw JSON-RPC — verifies network reachability and response shape
// ---------------------------------------------------------------------------

describe("Solana RPC – raw fetch", () => {
  test("getBalance returns non-null value for test address", async () => {
    const res = await fetch(MAINNET_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [TEST_ADDRESS],
      }),
    });

    expect(res.ok).toBe(true);

    const json = (await res.json()) as {
      result?: { value: number; context: { slot: number } };
      error?: { code: number; message: string };
    };

    console.log("Raw RPC response:", JSON.stringify(json, null, 2));

    expect(json.error).toBeUndefined();
    expect(json.result).toBeDefined();
    // biome-ignore lint/style/noNonNullAssertion: guarded by toBeDefined() assertion above
    expect(typeof json.result!.value).toBe("number");
    // biome-ignore lint/style/noNonNullAssertion: guarded by toBeDefined() assertion above
    expect(json.result!.value).toBeGreaterThan(0);
  });

  test("formatSol round-trip: raw lamports → formatted string", async () => {
    const res = await fetch(MAINNET_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "getBalance",
        params: [TEST_ADDRESS],
      }),
    });

    const json = (await res.json()) as { result: { value: number } };
    const lamports = BigInt(json.result.value);
    const formatted = formatSol(lamports);

    console.log(`Lamports: ${lamports} → "${formatted} SOL"`);

    expect(formatted).not.toBeNull();
    expect(formatted).toMatch(/^\d+\.\d{4}$/);
  });
});

// ---------------------------------------------------------------------------
// @solana/client — same client used by the React hooks
// ---------------------------------------------------------------------------

describe("Solana RPC – @solana/client", () => {
  test("createClient + fetchBalance returns lamports for test address", async () => {
    const { createClient, toAddress } = await import("@solana/client");

    const client = createClient({ cluster: "mainnet-beta" });
    const addr = toAddress(TEST_ADDRESS);

    // fetchBalance returns the raw Lamports bigint (not an AccountCacheEntry)
    const lamports = await client.actions.fetchBalance(addr);

    console.log("@solana/client fetchBalance result (raw bigint):", lamports);
    console.log("typeof lamports:", typeof lamports);

    expect(typeof lamports).toBe("bigint");
    expect(lamports).toBeGreaterThan(0n);

    // The store entry is updated separately
    const entry = client.store.getState().accounts[addr.toString()];
    console.log(
      "Store entry after fetch:",
      JSON.stringify(entry, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    );
    expect(entry?.fetching).toBe(false);
    expect(entry?.lamports).toBeGreaterThan(0n);
    expect(entry?.error).toBeUndefined();

    const formatted = formatSol(lamports);
    console.log(`Formatted: ${formatted} SOL`);
    expect(formatted).not.toBeNull();
  });

  test("store key and selector key match (no address mismatch)", async () => {
    const { createClient, toAddress } = await import("@solana/client");

    const client = createClient({ cluster: "mainnet-beta" });
    const addr = toAddress(TEST_ADDRESS);
    const addrStr = addr.toString();

    console.log("addrStr:", addrStr);
    console.log("TEST_ADDRESS:", TEST_ADDRESS);
    console.log("addrStr === TEST_ADDRESS:", addrStr === TEST_ADDRESS);

    // Simulate exactly what useBalance does: toAddress(e).toString()
    const selectorKey = toAddress(TEST_ADDRESS).toString();
    console.log("selectorKey:", selectorKey);
    console.log("keys match:", addrStr === selectorKey);

    await client.actions.fetchBalance(addr);

    const storeEntry = client.store.getState().accounts[selectorKey];
    console.log("Store entry via selectorKey:", storeEntry);

    expect(storeEntry).toBeDefined();
    expect(storeEntry?.lamports).not.toBeNull();
    expect(storeEntry?.lamports).toBeGreaterThan(0n);
  });

  test("Zustand store subscription fires after fetchBalance (v5 API)", async () => {
    const { createClient, toAddress } = await import("@solana/client");

    const client = createClient({ cluster: "mainnet-beta" });
    const addr = toAddress(TEST_ADDRESS);
    const addrStr = addr.toString();

    const updates: unknown[] = [];

    // Zustand v5: subscribe takes a single listener (no selector overload)
    const unsubscribe = client.store.subscribe((state) => {
      const entry = state.accounts[addrStr];
      if (entry !== undefined) {
        updates.push(entry);
      }
    });

    await client.actions.fetchBalance(addr);

    unsubscribe();

    console.log("Total store updates received:", updates.length);
    console.log(
      "Updates:",
      JSON.stringify(updates, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2),
    );

    // Should receive at least 2 updates: fetching:true then fetching:false + lamports
    expect(updates.length).toBeGreaterThanOrEqual(2);

    const last = updates.at(-1) as { lamports: bigint | null; fetching: boolean } | undefined;
    expect(last?.fetching).toBe(false);
    expect(last?.lamports).not.toBeNull();
    expect(last?.lamports).toBeGreaterThan(0n);
  });

  test("watchBalance does NOT overwrite lamports with null after fetchBalance", async () => {
    const { createClient, toAddress } = await import("@solana/client");

    const client = createClient({ cluster: "mainnet-beta" });
    const addr = toAddress(TEST_ADDRESS);
    const addrStr = addr.toString();

    // First fetch to populate the store
    await client.actions.fetchBalance(addr);

    const afterFetch = client.store.getState().accounts[addrStr];
    console.log(
      "After fetchBalance:",
      JSON.stringify(afterFetch, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    );
    expect(afterFetch?.lamports).toBeGreaterThan(0n);

    // Set up watchBalance (as useBalance does) and wait briefly for any WebSocket writes
    const handle = client.watchers.watchBalance({ address: addr }, () => {});

    // Give the WebSocket time to fire an initial notification (if any)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    handle.abort();

    const afterWatch = client.store.getState().accounts[addrStr];
    console.log(
      "After watchBalance + 2s wait:",
      JSON.stringify(afterWatch, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    );

    // The watchBalance WebSocket must NOT have clobbered the lamports
    expect(afterWatch?.lamports).not.toBeNull();
    expect(afterWatch?.lamports).toBeGreaterThan(0n);
  });
});
