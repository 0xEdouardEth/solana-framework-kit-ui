import { getAddressEncoder, getProgramDerivedAddress } from "@solana/addresses";
import type { Address } from "@solana/addresses";

/** SPL Name Service program address */
const SNS_PROGRAM_ID = "namesLPaMjFpixi738THAMi738nLsPiwFJLCPLfxmcix" as Address;

/**
 * Bonfida reverse lookup class — the "owner class" that scopes all reverse records.
 * Each wallet's reverse-lookup registry account is derived using this as a seed.
 */
const REVERSE_LOOKUP_CLASS = "33m47vH6Eav6jr5Ry86XjhRx2zsLJmYZJ72tzkDnbLkZ" as Address;

/** Prefix prepended before hashing per the SPL Name Service spec */
const SNS_HASH_PREFIX = "SPL Name Service";

/** Number of bytes in the NameRegistryState header (parentName + owner + class) */
const HEADER_LENGTH = 96;

/**
 * Computes SHA-256("SPL Name Service" + name) — the canonical hash used by the
 * SPL Name Service to derive all name account PDAs.
 */
async function hashSnsName(name: string): Promise<Uint8Array> {
  const input = new TextEncoder().encode(SNS_HASH_PREFIX + name);
  const digest = await crypto.subtle.digest("SHA-256", input);
  return new Uint8Array(digest);
}

/**
 * Derives the reverse-lookup PDA for `walletAddress`.
 *
 * The PDA is found from three seeds (all 32 bytes each):
 *   1. SHA256("SPL Name Service" + base58(walletAddress))
 *   2. bytes of REVERSE_LOOKUP_CLASS
 *   3. 32 zero bytes (no parent domain)
 *
 * @returns base58-encoded address of the on-chain reverse-lookup account
 */
export async function getReverseLookupAddress(walletAddress: string): Promise<string> {
  const encoder = getAddressEncoder();

  const hashedName = await hashSnsName(walletAddress);
  const classBytes = encoder.encode(REVERSE_LOOKUP_CLASS);
  const parentBytes = new Uint8Array(32);

  const [pda] = await getProgramDerivedAddress({
    programAddress: SNS_PROGRAM_ID,
    seeds: [hashedName, classBytes, parentBytes],
  });

  return pda;
}

/**
 * Parses the `.sol` domain name from an `AccountCacheEntry.data` value as returned
 * by `@solana/react-hooks`' `useAccount`.
 *
 * The raw RPC response stores account bytes as `[base64string, "base64"]`.
 * The NameRegistryState layout is:
 *   - bytes 0–95  : header (parentName 32 + owner 32 + class 32)
 *   - bytes 96+   : raw data (the domain name string, e.g. "alice")
 *
 * @returns "name.sol" or `null` if data is absent / unparseable
 */
export function parseDomainFromAccountData(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const rpcValue = data as { data?: [string, string] };
  const base64 = rpcValue.data?.[0];
  if (typeof base64 !== "string") return null;

  try {
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    if (bytes.length <= HEADER_LENGTH) return null;

    const nameBytes = bytes.slice(HEADER_LENGTH);
    const name = new TextDecoder().decode(nameBytes).replace(/\0/g, "").trim();

    return name.length > 0 ? `${name}.sol` : null;
  } catch {
    return null;
  }
}
