import { WalletPlaceholderIcon } from "@/icons";
import s from "./WalletIcon.module.css";

type WalletIconProps = Readonly<{
  /** Data URI or URL from the wallet connector metadata. */
  icon?: string;
  /** Wallet name, used for alt text and fallback initial. */
  name: string;
  /** Icon size in pixels. @default 40 */
  size?: number;
  className?: string;
}>;

/**
 * Renders a wallet icon image with a placeholder SVG fallback when no icon is available.
 */
export function WalletIcon({ icon, name, size = 40, className }: WalletIconProps) {
  if (icon) {
    return (
      <img
        src={icon}
        alt={`${name} icon`}
        width={size}
        height={size}
        className={[s.icon, className].filter(Boolean).join(" ")}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={[s.icon, s.fallback, className].filter(Boolean).join(" ")}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <WalletPlaceholderIcon size={size * 0.55} />
    </span>
  );
}
