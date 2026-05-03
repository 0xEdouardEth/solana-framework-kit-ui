/**
 * Generates a deterministic pair of HSL hues from a Solana address.
 * Uses a simple multiplicative hash over char codes for quick computation.
 */
function addressToHues(address: string): [number, number] {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash << 5) - hash + address.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 137) % 360; // Golden angle complement for pleasing contrast
  return [h1, h2];
}

type IdenticonProps = Readonly<{
  /** Base58-encoded Solana address to generate the avatar for. */
  address: string;
  /** Size in pixels for both width and height. @default 20 */
  size?: number;
}>;

/**
 * Renders a deterministic gradient circle avatar from a Solana address.
 * No external dependencies — computes two complementary hues from the address
 * using a fast hash and renders them as an SVG linear gradient circle.
 *
 * @example
 * ```tsx
 * <Identicon address="7xKXtg2CW..." size={20} />
 * ```
 */
export function Identicon({ address, size = 20 }: IdenticonProps) {
  const [h1, h2] = addressToHues(address);
  // Unique gradient ID scoped to the first 8 chars to avoid collisions
  const gradId = `sfk-grad-${address.slice(0, 8)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={`hsl(${h1}, 80%, 60%)`} />
          <stop offset="100%" stopColor={`hsl(${h2}, 75%, 55%)`} />
        </linearGradient>
      </defs>
      <circle cx="10" cy="10" r="10" fill={`url(#${gradId})`} />
    </svg>
  );
}
