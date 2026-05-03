import { useSplToken } from "@solana/react-hooks";
import s from "./AccountDisplay.module.css";

type SplTokenRowProps = Readonly<{
  mint: string;
  symbol: string;
  decimals: number;
}>;

/**
 * Renders a single SPL token balance row inside the account dropdown.
 * Returns null if the balance is zero, unavailable, or still loading.
 */
export function SplTokenRow({ mint, symbol, decimals }: SplTokenRowProps) {
  const { balance, status } = useSplToken(mint);

  if (status === "disconnected" || status === "loading") return null;
  if (!balance) return null;

  const raw = Number(balance.amount ?? 0);
  if (raw === 0) return null;

  const formatted = (raw / 10 ** decimals).toFixed(2);
  if (formatted === "0.00") return null;

  return (
    <div className={`${s.row} ${s.balance}`}>
      <span className={s.balanceLabel}>{symbol}</span>
      <span className={s.balanceValue}>{formatted}</span>
    </div>
  );
}
