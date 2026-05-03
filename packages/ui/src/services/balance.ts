/** Number of lamports in one SOL */
const LAMPORTS_PER_SOL = 1_000_000_000n;

/**
 * Formats a lamport amount as a human-readable SOL string.
 *
 * @example
 * formatSol(1_500_000_000n) // "1.5000"
 * formatSol(0n)             // "0.0000"
 * formatSol(null)           // null
 */
export function formatSol(lamports: bigint | null | undefined): string | null {
  if (lamports === null || lamports === undefined) return null;

  const whole = lamports / LAMPORTS_PER_SOL;
  const frac = lamports % LAMPORTS_PER_SOL;

  // 4 decimal places
  const fracStr = frac.toString().padStart(9, "0").slice(0, 4);
  return `${whole}.${fracStr}`;
}
