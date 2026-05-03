import { fetchRecentTxs } from "@/services/transactions";
import type { TxInfo } from "@/services/transactions";
import { useClientStore } from "@solana/react-hooks";
import { useCallback, useEffect, useState } from "react";

export type { TxInfo };

export type UseRecentTxsReturn = {
  /** List of recent transactions, ordered newest first. */
  txs: TxInfo[];
  /**
   * Imperatively re-fetch the transaction list.
   * Call this after sending a transaction to get an up-to-date list immediately.
   *
   * @example
   * const { txs, refresh } = useRecentTxs(address);
   * await sendTransaction(...);
   * refresh();
   */
  refresh: () => void;
};

/**
 * Fetches recent transaction signatures for a Solana address via JSON-RPC.
 *
 * Data is fetched once on mount and whenever `address`, `enabled`, or the
 * active RPC endpoint changes. Call `refresh()` to trigger a manual re-fetch
 * (e.g. right after sending a transaction).
 *
 * @param address - Base58-encoded wallet address (or undefined to disable)
 * @param enabled - Set to false to skip fetching entirely
 * @param limit   - Maximum number of signatures to return — default: 5
 *
 * @example
 * const { txs, refresh } = useRecentTxs(wallet.account.address);
 *
 * // After sending a transaction:
 * await sendTransaction(...);
 * refresh(); // triggers an immediate re-fetch
 */
export function useRecentTxs(
  address: string | undefined,
  enabled = true,
  limit = 5,
  onError?: (error: Error, source: string) => void,
): UseRecentTxsReturn {
  const [txs, setTxs] = useState<TxInfo[]>([]);
  const [tick, setTick] = useState(0);
  const endpoint = useClientStore((s) => s.cluster.endpoint);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: tick is intentional — incrementing it triggers a re-fetch when refresh() is called
  useEffect(() => {
    if (!address || !enabled || !endpoint) return;

    let cancelled = false;

    fetchRecentTxs(endpoint, address, limit)
      .then((result) => {
        if (!cancelled) setTxs(result);
      })
      .catch((err) => {
        if (!cancelled) {
          onError?.(err instanceof Error ? err : new Error(String(err)), "recentTxs");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [address, enabled, endpoint, limit, tick]);

  return { txs, refresh };
}

/**
 * Formats a UNIX timestamp into a human-readable relative time string.
 * Returns an empty string if blockTime is null.
 */
export function relativeTime(blockTime: number | null): string {
  if (!blockTime) return "";
  const delta = Math.floor(Date.now() / 1000 - blockTime);
  if (delta < 60) return `${delta}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}
