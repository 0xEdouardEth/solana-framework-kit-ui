import { useConfig } from "@/config";
import { useLabels } from "@/i18n";
import { CloseIcon } from "@/icons";
import { useTheme } from "@/provider/ThemeContext";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { WalletList } from "./WalletList";
import s from "./WalletModal.module.css";

// Intentionally different from SolanaProvider's "solana:last-connector" key to avoid
// triggering its auto-connect logic on page load.
const LAST_CONNECTOR_KEY = "sfk:last-connector";

function readLastConnector(): string | null {
  try {
    return localStorage.getItem(LAST_CONNECTOR_KEY);
  } catch {
    return null;
  }
}

function writeLastConnector(id: string): void {
  try {
    localStorage.setItem(LAST_CONNECTOR_KEY, id);
  } catch {
    // ignore storage errors
  }
}

type WalletModalState = Readonly<{
  isOpen: boolean;
  close: () => void;
  connectors: readonly {
    id: string;
    name: string;
    icon?: string;
    isSupported: () => boolean;
    ready?: boolean;
  }[];
  connect: (
    connectorId: string,
    options?: Readonly<{ autoConnect?: boolean; allowInteractiveFallback?: boolean }>,
  ) => Promise<unknown>;
  selectedConnector: string | null;
  select: (connectorId: string | null) => void;
  status: string;
  error: unknown;
}>;

type WalletModalProps = Readonly<{
  state: WalletModalState;
  /**
   * URL for the "Terms of Service" link in the modal footer.
   * If omitted, no ToS footer is rendered.
   */
  termsUrl?: string;
}>;

/**
 * Modal / bottom-sheet for selecting and connecting a Solana wallet.
 * Renders as a centered modal on desktop and a bottom sheet on mobile.
 * Mounted via a React portal to avoid stacking-context issues.
 */
export function WalletModal({ state, termsUrl }: WalletModalProps) {
  const { isOpen, close, connectors, connect, select, status, error } = state;
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [lastConnectorId, setLastConnectorId] = useState<string | null>(() => readLastConnector());
  const dialogRef = useRef<HTMLDivElement>(null);
  const { colorScheme, cssVars } = useTheme();
  const labels = useLabels();
  const config = useConfig();
  const showLastWallet = config.showLastWallet !== false;

  // Reset connecting state when modal closes or status changes
  useEffect(() => {
    if (!isOpen || status === "disconnected" || status === "error") {
      setConnectingId(null);
    }
  }, [isOpen, status]);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  async function handleSelect(id: string) {
    select(id);
    setConnectingId(id);
    try {
      await connect(id, { allowInteractiveFallback: true });
      if (showLastWallet) {
        writeLastConnector(id);
        setLastConnectorId(id);
      }
    } catch (err) {
      setConnectingId(null);
      config.onError?.(err instanceof Error ? err : new Error(String(err)), "connect");
    }
  }

  const style = Object.keys(cssVars).length > 0 ? cssVars : undefined;

  const modal = (
    // Wrap in sfk-root so theme vars apply in the portal (rendered outside main tree)
    <div className="sfk-root" data-sfk-theme={colorScheme} style={style}>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop is presentation-only; Escape is handled by the dialog */}
      <div
        className={[s.overlay, isOpen && s.overlayOpen].filter(Boolean).join(" ")}
        aria-hidden="true"
        onClick={close}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={labels.connectAWallet}
          className={[s.modal, isOpen && s.modalOpen].filter(Boolean).join(" ")}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
        >
          {/* Header */}
          <div className={s.header}>
            <h2 className={s.title}>{labels.connectAWallet}</h2>
            <button
              type="button"
              className={s.close}
              onClick={close}
              aria-label={labels.closeModal}
            >
              <CloseIcon size={18} />
            </button>
          </div>

          {/* Error banner */}
          {status === "error" && error != null && (
            <div className={s.error} role="alert">
              {error instanceof Error ? error.message : "Connection failed. Please try again."}
            </div>
          )}

          {/* Wallet list */}
          <div className={s.body}>
            <WalletList
              connectors={connectors}
              connectingId={connectingId}
              lastConnectorId={showLastWallet ? lastConnectorId : null}
              onSelect={handleSelect}
            />
          </div>

          {/* Footer (only shown when termsUrl is provided) */}
          {termsUrl && (
            <div className={s.footer}>
              <p className={s.footerText}>
                {labels.agreeToTerms}{" "}
                <a
                  href={termsUrl}
                  className={s.footerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {labels.termsOfService}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
