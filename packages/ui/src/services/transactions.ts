/** Minimal shape of a transaction signature result from getSignaturesForAddress. */
export type TxInfo = Readonly<{
  signature: string;
  slot: number;
  err: unknown | null;
  blockTime: number | null;
}>;

/**
 * Fetches recent transaction signatures for a Solana address via JSON-RPC.
 *
 * @param endpoint - RPC endpoint URL
 * @param address  - Base58-encoded wallet address
 * @param limit    - Maximum number of signatures to return
 * @returns Array of transaction info, or empty array on failure
 */
export async function fetchRecentTxs(
  endpoint: string,
  address: string,
  limit: number,
): Promise<TxInfo[]> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getSignaturesForAddress",
      params: [address, { limit }],
    }),
  });
  const json = (await response.json()) as { result?: TxInfo[] };
  return json.result ?? [];
}
