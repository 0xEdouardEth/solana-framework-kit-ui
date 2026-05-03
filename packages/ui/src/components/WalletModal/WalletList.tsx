import { WalletIcon } from "@/components/WalletIcon";
import { useLabels } from "@/i18n";
import { ExternalLinkIcon } from "@/icons";
import sp from "@/styles/spinner.module.css";
import s from "./WalletList.module.css";

/** Minimal connector shape needed by the list. */
type ConnectorItem = Readonly<{
  id: string;
  name: string;
  icon?: string;
  isSupported: () => boolean;
  ready?: boolean;
}>;

type WalletListProps = Readonly<{
  connectors: readonly ConnectorItem[];
  connectingId: string | null;
  /** ID of the last-used connector, or null. Controlled by WalletModal. */
  lastConnectorId: string | null;
  onSelect: (id: string) => void;
}>;

const INSTALL_URLS: Record<string, string> = {
  phantom: "https://phantom.com",
  solflare: "https://solflare.com",
  backpack: "https://backpack.app",
};

function getInstallUrl(name: string): string | undefined {
  return INSTALL_URLS[name.toLowerCase()];
}

/**
 * Renders the list of available wallet connectors inside the modal.
 * Supported wallets are interactive; unsupported ones show an install link.
 * Shows a "Last used" badge on the previously connected wallet.
 */
export function WalletList({
  connectors,
  connectingId,
  lastConnectorId,
  onSelect,
}: WalletListProps) {
  const labels = useLabels();

  if (connectors.length === 0) {
    return (
      <div className={s.empty}>
        <p className={s.emptyText}>{labels.noWalletsDetected}</p>
        <a
          href="https://phantom.com"
          target="_blank"
          rel="noopener noreferrer"
          className={s.emptyLink}
        >
          {labels.getPhantom}
          <ExternalLinkIcon />
        </a>
      </div>
    );
  }

  const supported = connectors
    .filter((c) => c.isSupported() && c.ready !== false)
    .sort((a, b) => {
      if (a.id === lastConnectorId) return -1;
      if (b.id === lastConnectorId) return 1;
      return 0;
    });
  const unsupported = connectors.filter((c) => !c.isSupported() || c.ready === false);

  return (
    <ul className={s.list}>
      {supported.map((connector) => {
        const isConnecting = connectingId === connector.id;
        const isLastUsed = lastConnectorId === connector.id;

        return (
          <li key={connector.id}>
            <button
              type="button"
              className={s.item}
              onClick={() => onSelect(connector.id)}
              disabled={connectingId !== null}
              aria-busy={isConnecting}
            >
              <WalletIcon
                {...(connector.icon !== undefined ? { icon: connector.icon } : {})}
                name={connector.name}
                size={36}
              />
              <span className={s.itemName}>{connector.name}</span>
              {isLastUsed && !isConnecting && (
                <span className={`${s.badge} ${s.badgeLast}`}>{labels.lastUsed}</span>
              )}
              {isConnecting && (
                <span className={`${sp.spinner} ${sp.spinnerSm}`} aria-hidden="true" />
              )}
            </button>
          </li>
        );
      })}

      {unsupported.length > 0 && (
        <>
          {supported.length > 0 && <div className={s.separator} aria-hidden="true" />}
          <p className={s.sectionLabel}>{labels.notInstalled}</p>
          {unsupported.map((connector) => {
            const installUrl = getInstallUrl(connector.name);

            return (
              <li key={connector.id}>
                {installUrl ? (
                  <a
                    href={installUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${s.item} ${s.itemUnsupported}`}
                  >
                    <WalletIcon
                      {...(connector.icon !== undefined ? { icon: connector.icon } : {})}
                      name={connector.name}
                      size={36}
                    />
                    <span className={s.itemName}>{connector.name}</span>
                    <span className={s.badge}>
                      {labels.install}
                      <ExternalLinkIcon />
                    </span>
                  </a>
                ) : (
                  <div className={`${s.item} ${s.itemUnsupported}`}>
                    <WalletIcon
                      {...(connector.icon !== undefined ? { icon: connector.icon } : {})}
                      name={connector.name}
                      size={36}
                    />
                    <span className={s.itemName}>{connector.name}</span>
                    <span className={s.badge}>{labels.notInstalled}</span>
                  </div>
                )}
              </li>
            );
          })}
        </>
      )}
    </ul>
  );
}
