import { Identicon } from "@/components/Identicon";
import { useConfig } from "@/config";
import { relativeTime, useRecentTxs } from "@/hooks/useRecentTxs";
import { useSnsName } from "@/hooks/useSnsName";
import { useSnsProfilePic } from "@/hooks/useSnsProfilePic";
import { TOKEN_META, resolveSplMints } from "@/hooks/useSplBalances";
import { useLabels } from "@/i18n";
import { CheckIcon, CopyIcon, ExternalLinkIcon, PowerIcon } from "@/icons";
import { formatSol } from "@/services/balance";
import t from "@/styles/trigger.module.css";
import { copyToClipboard, truncateAddress } from "@/utils";
import { useBalance, useClusterState, useClusterStatus } from "@solana/react-hooks";
import { useEffect, useRef, useState } from "react";
import s from "./AccountDisplay.module.css";
import { SplTokenRow } from "./SplTokenRow";

type WalletConnectorMeta = Readonly<{
  name: string;
  icon?: string;
}>;

type WalletAccount = Readonly<{
  address: string;
  label?: string;
}>;

type WalletSession = Readonly<{
  account: WalletAccount;
  connector: WalletConnectorMeta;
}>;

type AccountDisplayProps = Readonly<{
  wallet: WalletSession;
  onDisconnect: () => Promise<void>;
  className?: string;
}>;

type ClusterMoniker = "mainnet-beta" | "devnet" | "testnet";

/** Maps cluster status to network dot modifier classes. */
function getNetworkDotClass(statusValue: string, s: Record<string, string>): string {
  if (statusValue === "ready") return `${s.networkDot} ${s.networkDotOk}`;
  if (statusValue === "connecting" || statusValue === "idle")
    return `${s.networkDot} ${s.networkDotDegraded}`;
  return `${s.networkDot} ${s.networkDotError}`;
}

function defaultExplorerUrl(address: string, cluster: string): string {
  const network = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`;
  return `https://solscan.io/account/${address}${network}`;
}

function defaultTxExplorerUrl(signature: string, cluster: string): string {
  const network = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`;
  return `https://solscan.io/tx/${signature}${network}`;
}

function clusterFromEndpoint(endpoint: string): ClusterMoniker {
  if (endpoint.includes("devnet")) return "devnet";
  if (endpoint.includes("testnet")) return "testnet";
  return "mainnet-beta";
}

type AvatarProps = Readonly<{
  address: string;
  pic: string | null;
  label: string;
  size: number;
  large?: boolean;
}>;

/**
 * Renders the user avatar: SNS profile picture when available, gradient Identicon otherwise.
 * Falls back to Identicon if the image fails to load.
 */
function Avatar({ address, pic, label, size, large = false }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: pic is intentional — changing URL resets the error state
  useEffect(() => setImgError(false), [pic]);

  const cls = [s.avatar, large && s.avatarLg].filter(Boolean).join(" ");

  return (
    <div className={cls} aria-hidden="true">
      {pic && !imgError ? (
        <img src={pic} alt={label} className={s.avatarImg} onError={() => setImgError(true)} />
      ) : (
        <Identicon address={address} size={size} />
      )}
    </div>
  );
}

/**
 * Displays the connected wallet as a dropdown trigger.
 * Clicking opens a panel with the full address (+ copy), optional SOL balance,
 * explorer link, recent transactions, and a disconnect button.
 *
 * The avatar is a deterministic gradient circle (Identicon) derived from the user's
 * address. If the address has a Bonfida SNS profile picture, that is shown instead.
 * The display name is the resolved ".sol" domain, falling back to a truncated address.
 *
 * Configuration is read from the nearest ConfigContext (set by SolanaUIProvider
 * or ConnectButton). All feature flags default to enabled when not specified.
 */
export function AccountDisplay({ wallet, onDisconnect, className }: AccountDisplayProps) {
  const config = useConfig();
  const labels = useLabels();

  const showBalance = config.showBalance !== false;
  const resolveDomain = config.resolveDomain !== false;
  const showNetworkStatus = config.networkStatus !== false;
  const showExplorerLink = config.explorerLink !== false;
  const splMints = resolveSplMints(config.splTokens);
  const showRecentTxs = config.recentTransactions !== false;

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const address = wallet.account.address;

  const snsName = useSnsName(address, resolveDomain, config.onError);
  const snsPic = useSnsProfilePic(snsName, config.onError);
  const { lamports, fetching: balanceFetching } = useBalance(address, { skip: !showBalance });
  const clusterStatus = useClusterStatus();
  const clusterState = useClusterState();
  const { txs: recentTxs } = useRecentTxs(address, showRecentTxs, 5, config.onError);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  async function handleCopy() {
    const ok = await copyToClipboard(address);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await onDisconnect();
    } finally {
      setDisconnecting(false);
      setOpen(false);
    }
  }

  const displayLabel = snsName ?? truncateAddress(address);

  const networkDotCls = showNetworkStatus ? getNetworkDotClass(clusterStatus.status, s) : null;

  const activeCluster = clusterFromEndpoint(clusterState.endpoint);
  const explorerUrlFn = config.explorerUrl ?? defaultExplorerUrl;
  const explorerHref = explorerUrlFn(address, activeCluster);

  const solBalance = lamports !== null ? formatSol(lamports) : null;

  return (
    <div ref={containerRef} className={[s.account, className].filter(Boolean).join(" ")}>
      {/* Pill trigger */}
      <button
        type="button"
        className={[t.trigger, open && t.triggerOpen].filter(Boolean).join(" ")}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar address={address} pic={snsPic} label={displayLabel} size={20} />
        <span className={s.label}>{displayLabel}</span>
        <span
          className={[s.chevron, open && s.chevronOpen].filter(Boolean).join(" ")}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {/* Backdrop — visible only on mobile */}
      {open && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop closes on tap, Escape handled by keydown listener
        <div className={s.backdrop} aria-hidden="true" onClick={() => setOpen(false)} />
      )}

      {/* Profile panel */}
      {open && (
        <div className={s.dropdown} role="menu">
          {/* Header: avatar + display name + network */}
          <div className={s.profileHeader}>
            <div className={s.profileHeaderTop}>
              <Avatar address={address} pic={snsPic} label={displayLabel} size={40} large />
              <div>
                <div className={s.profileWalletName}>{displayLabel}</div>
                {showNetworkStatus && (
                  <div className={s.profileNetwork}>
                    <span className={networkDotCls ?? s.networkDot} aria-hidden="true" />
                    {activeCluster}
                  </div>
                )}
              </div>
            </div>

            {/* Address with copy */}
            <div className={s.profileAddr}>
              <span className={s.profileAddrText}>{address}</span>
              <button
                type="button"
                className={[s.profileCopy, copied && s.profileCopyCopied].filter(Boolean).join(" ")}
                onClick={handleCopy}
                title={copied ? labels.addressCopied : labels.copyAddress}
                aria-label={copied ? labels.addressCopied : labels.copyAddress}
              >
                {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
              </button>
            </div>
          </div>

          {/* SOL balance */}
          {showBalance && (
            <div className={`${s.row} ${s.balance}`}>
              <span className={s.balanceLabel}>{labels.balance}</span>
              <div>
                <div
                  className={[s.balanceValue, balanceFetching && s.balanceValueLoading]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {balanceFetching ? "…" : solBalance !== null ? `${solBalance} SOL` : "—"}
                </div>
              </div>
            </div>
          )}

          {/* SPL token balances */}
          {splMints.map((mint) => {
            const meta = TOKEN_META[mint] ?? { symbol: `${mint.slice(0, 4)}…`, decimals: 6 };
            return (
              <SplTokenRow key={mint} mint={mint} symbol={meta.symbol} decimals={meta.decimals} />
            );
          })}

          {/* Recent transactions */}
          {showRecentTxs && recentTxs.length > 0 && (
            <div className={s.txsSection}>
              <p className={s.txsSectionTitle}>{labels.recentTransactions}</p>
              {recentTxs.map((tx) => (
                <a
                  key={tx.signature}
                  href={defaultTxExplorerUrl(tx.signature, activeCluster)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${s.row} ${s.txRow}`}
                >
                  <span
                    className={[s.txStatus, tx.err ? s.txStatusError : s.txStatusSuccess].join(" ")}
                    aria-label={tx.err ? "Failed" : "Success"}
                  >
                    {tx.err ? "✗" : "✓"}
                  </span>
                  <span className={s.txSig}>{`${tx.signature.slice(0, 8)}…`}</span>
                  <span className={s.txTime}>{relativeTime(tx.blockTime)}</span>
                </a>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className={s.actions}>
            {showExplorerLink && (
              <a
                href={explorerHref}
                target="_blank"
                rel="noopener noreferrer"
                className={s.action}
                role="menuitem"
                aria-label={labels.viewOnExplorer}
              >
                <span className={s.actionIcon} aria-hidden="true">
                  <ExternalLinkIcon size={14} />
                </span>
                {labels.viewOnExplorer}
              </a>
            )}

            <button
              type="button"
              className={`${s.action} ${s.actionDanger}`}
              onClick={handleDisconnect}
              disabled={disconnecting}
              role="menuitem"
              aria-label={labels.disconnect}
            >
              <span className={s.actionIcon} aria-hidden="true">
                <PowerIcon size={14} />
              </span>
              {disconnecting ? labels.disconnecting : labels.disconnect}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
