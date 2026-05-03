import { getReverseLookupAddress, parseDomainFromAccountData } from "@/services/sns";
import { useAccount } from "@solana/react-hooks";
import { useEffect, useState } from "react";

/**
 * Resolves a Solana wallet address to its `.sol` SNS reverse-lookup name.
 *
 * Derives the on-chain reverse-lookup PDA for `walletAddress`, fetches it via
 * `useAccount`, and parses the domain name from the raw account data.
 *
 * @param walletAddress - base58-encoded wallet address to resolve
 * @param enabled       - set to `false` to skip resolution entirely
 * @returns "name.sol" string, or `null` while loading / not found / disabled
 */
export function useSnsName(
  walletAddress: string | undefined,
  enabled = true,
  onError?: (error: Error, source: string) => void,
): string | null {
  const [pda, setPda] = useState<string | undefined>(undefined);

  // biome-ignore lint/correctness/useExhaustiveDependencies: onError is a callback prop — including it would re-trigger the effect on every render when passed inline
  useEffect(() => {
    if (!walletAddress || !enabled) {
      setPda(undefined);
      return;
    }

    let cancelled = false;

    getReverseLookupAddress(walletAddress)
      .then((addr) => {
        if (!cancelled) setPda(addr);
      })
      .catch((err) => {
        if (!cancelled) {
          setPda(undefined);
          onError?.(err instanceof Error ? err : new Error(String(err)), "sns");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [walletAddress, enabled]);

  const account = useAccount(pda, { skip: !pda || !enabled });

  if (!account || !enabled) return null;
  return parseDomainFromAccountData(account.data);
}
