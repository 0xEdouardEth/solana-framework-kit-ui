import { AccountDisplay } from "@/components/AccountDisplay";
import { WalletModal } from "@/components/WalletModal";
import { ConfigContext, type SFKConfig, useConfig } from "@/config";
import { resolveLabels } from "@/i18n";
import sp from "@/styles/spinner.module.css";
import t from "@/styles/trigger.module.css";
import { useWalletModalState } from "@solana/react-hooks";
import { useEffect, useMemo } from "react";

type ConnectButtonProps = Readonly<{
  /** Label shown on the connect button. Falls back to i18n label if not provided. */
  label?: string;
  className?: string;
  /**
   * Component-level config that merges with (and overrides) the provider-level config.
   * Useful when you want per-button configuration.
   */
  config?: SFKConfig;
}>;

/**
 * All-in-one connect button.
 *
 * - Disconnected → shows a button that opens the wallet selection modal.
 * - Connecting   → shows a loading spinner inside the button.
 * - Connected    → shows the truncated address with a dropdown for copy/disconnect.
 *
 * The modal is mounted via React portal and follows Wallet Standard discovery
 * provided by Framework Kit's `useWalletModalState`.
 *
 * Fires `config.onConnect` when a wallet connects and `config.onDisconnect` when it disconnects.
 */
export function ConnectButton({ label, className, config: propConfig }: ConnectButtonProps) {
  const ctxConfig = useConfig();

  // Merge provider-level config with component-level prop config
  const mergedConfig = useMemo<SFKConfig>(
    () => (propConfig ? { ...ctxConfig, ...propConfig } : ctxConfig),
    [ctxConfig, propConfig],
  );

  // Resolve labels from the merged config so locale prop overrides take effect
  const labels = useMemo(
    () => resolveLabels(mergedConfig.locale, mergedConfig.labels),
    [mergedConfig.locale, mergedConfig.labels],
  );

  const state = useWalletModalState({ closeOnConnect: true });
  const { wallet, open, connecting, connected, isReady, connect, connectorId } = state;

  // Workaround: @solana/client does not propagate account-change events to its Zustand
  // store — it only reacts when accounts become empty (disconnect). We subscribe to the
  // session's onAccountsChanged ourselves and force a reconnect with the same connector
  // so the store (and therefore all hooks) reflect the newly selected account.
  useEffect(() => {
    if (!wallet?.onAccountsChanged || !connectorId) return;
    return wallet.onAccountsChanged((accounts) => {
      if (accounts.length > 0) {
        void connect(connectorId, { autoConnect: true, allowInteractiveFallback: false });
      }
    });
  }, [wallet, connectorId, connect]);

  // Fire onConnect / onDisconnect callbacks
  useEffect(() => {
    if (connected && wallet && mergedConfig.onConnect) {
      mergedConfig.onConnect(wallet);
    }
  }, [connected, wallet, mergedConfig.onConnect]);

  useEffect(() => {
    if (!connected && mergedConfig.onDisconnect) {
      mergedConfig.onDisconnect();
    }
  }, [connected, mergedConfig.onDisconnect]);

  const connectLabel = label ?? labels.connectWallet;

  // Prevent hydration mismatch — don't render until client is ready
  if (!isReady) {
    return (
      <button
        type="button"
        className={[t.trigger, t.triggerConnect, t.triggerLoading, className]
          .filter(Boolean)
          .join(" ")}
        disabled
        aria-busy="true"
      >
        <span className={`${sp.spinner} ${sp.spinnerSm}`} aria-hidden="true" />
      </button>
    );
  }

  if (connected && wallet) {
    return (
      <ConfigContext.Provider value={mergedConfig}>
        <AccountDisplay
          wallet={wallet}
          onDisconnect={state.disconnect}
          {...(className !== undefined ? { className } : {})}
        />
      </ConfigContext.Provider>
    );
  }

  return (
    <ConfigContext.Provider value={mergedConfig}>
      <>
        <button
          type="button"
          className={[t.trigger, t.triggerConnect, connecting && t.triggerLoading, className]
            .filter(Boolean)
            .join(" ")}
          onClick={open}
          disabled={connecting}
          aria-busy={connecting}
        >
          {connecting ? (
            <>
              <span className={`${sp.spinner} ${sp.spinnerSm}`} aria-hidden="true" />
              <span>{labels.connecting}</span>
            </>
          ) : (
            <span>{connectLabel}</span>
          )}
        </button>

        {/* Portal-rendered modal / bottom sheet */}
        <WalletModal state={state} />
      </>
    </ConfigContext.Provider>
  );
}
