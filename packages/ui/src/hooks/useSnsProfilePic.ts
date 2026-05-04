import { useEffect, useState } from "react";

/**
 * Fetches the profile picture URL from Bonfida SNS record v2 for a resolved ".sol" domain.
 *
 * Looks up the "pic" record stored on-chain via the Bonfida SNS SDK proxy. Returns `null`
 * while loading, if the domain has no picture set, or if the request fails.
 *
 * @param snsName - Resolved ".sol" name (e.g. "alice.sol"), or `null`
 * @returns An image URL string, or `null`
 *
 * @example
 * const name = useSnsName(address);
 * const pic  = useSnsProfilePic(name);
 * // pic === "https://..." | null
 */
export function useSnsProfilePic(
  snsName: string | null,
  onError?: (error: Error, source: string) => void,
): string | null {
  const [pic, setPic] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: onError is a callback prop — including it would re-trigger the effect on every render when passed inline
  useEffect(() => {
    if (!snsName) {
      setPic(null);
      return;
    }

    const domain = snsName.replace(/\.sol$/, "");
    let cancelled = false;

    fetch(`https://sns-sdk-proxy.bonfida.workers.dev/record/v2/${domain}/pic`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (cancelled) return;
        const url = (data as { result?: string } | null)?.result ?? null;
        setPic(typeof url === "string" && url.length > 0 ? url : null);
      })
      .catch((err) => {
        if (!cancelled) {
          setPic(null);
          onError?.(err instanceof Error ? err : new Error(String(err)), "snsProfilePic");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [snsName]);

  return pic;
}
