import { afterEach, describe, expect, mock, test } from "bun:test";
import { fetchRecentTxs } from "./transactions";

const MOCK_TXS = [
  { signature: "abc123", slot: 100, err: null, blockTime: 1700000000 },
  {
    signature: "def456",
    slot: 99,
    err: { InstructionError: [0, "Custom"] },
    blockTime: 1699999000,
  },
];

describe("fetchRecentTxs", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("returns transactions on success", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: MOCK_TXS }))),
    ) as unknown as typeof fetch;

    const txs = await fetchRecentTxs("https://rpc.test", "SomeAddress", 5);

    expect(txs).toHaveLength(2);
    expect(txs[0].signature).toBe("abc123");
    expect(txs[1].err).not.toBeNull();
  });

  test("sends correct JSON-RPC payload", async () => {
    let capturedBody = "";

    globalThis.fetch = mock((_: unknown, init: unknown) => {
      capturedBody = (init as RequestInit).body as string;
      return Promise.resolve(new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: [] })));
    }) as unknown as typeof fetch;

    await fetchRecentTxs("https://rpc.test", "WalletAddr", 10);

    const parsed = JSON.parse(capturedBody);
    expect(parsed.method).toBe("getSignaturesForAddress");
    expect(parsed.params[0]).toBe("WalletAddr");
    expect(parsed.params[1].limit).toBe(10);
  });

  test("returns empty array when result is missing", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify({ jsonrpc: "2.0", id: 1 }))),
    ) as unknown as typeof fetch;

    const txs = await fetchRecentTxs("https://rpc.test", "Addr", 5);
    expect(txs).toEqual([]);
  });

  test("propagates fetch errors", async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error("Network error")),
    ) as unknown as typeof fetch;

    expect(fetchRecentTxs("https://rpc.test", "Addr", 5)).rejects.toThrow("Network error");
  });
});
