import { autoDiscover, createClient } from "@solana/client";
import { SolanaProvider, useWalletConnection } from "@solana/react-hooks";
import { useState } from "react";
import {
  ConnectButton,
  type SFKConfig,
  SolanaUIProvider,
  truncateAddress,
} from "solana-framework-kit-ui";
import "./app.css";

const RPC_ENDPOINT = import.meta.env.VITE_RPC_ENDPOINT ?? "https://api.mainnet-beta.solana.com";

const client = createClient({
  cluster: "mainnet-beta",
  endpoint: RPC_ENDPOINT,
  walletConnectors: autoDiscover(),
});

const LOCALES = ["en", "fr", "es", "de", "zh", "ja", "pt", "ru", "ko", "ar"] as const;
const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  zh: "中文",
  ja: "日本語",
  pt: "Português",
  ru: "Русский",
  ko: "한국어",
  ar: "العربية",
};

type ConfigFormState = {
  showBalance: boolean;
  resolveDomain: boolean;
  explorerLink: boolean;
  recentTransactions: boolean;
  networkStatus: boolean;
  showLastWallet: boolean;
  splTokensEnabled: boolean;
  splTokensCustom: boolean;
  splTokensMints: string;
  locale: string;
  colorScheme: "dark" | "light";
  accent: string;
  connectLabel: string | undefined;
  modalTitle: string | undefined;
};

function WalletInfo() {
  const { connected, wallet } = useWalletConnection();
  if (!connected || !wallet)
    return <span className="pg-empty-hint">Connect a wallet to see data here.</span>;
  return (
    <div className="wallet-info">
      <p>
        <strong>Address:</strong>{" "}
        <span style={{ fontFamily: "monospace", fontSize: 12 }}>
          {truncateAddress(wallet.account.address)}
        </span>
      </p>
      <p>
        <strong>Wallet:</strong> {wallet.connector.name}
      </p>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: wraps a button (toggle), not an input
    <label className="demo-toggle">
      <span className="demo-toggle-label">{label}</span>
      <button
        type="button"
        className={`demo-toggle-btn${value ? " demo-toggle-btn--on" : ""}`}
        onClick={() => onChange(!value)}
        aria-pressed={value}
        aria-label={label}
      >
        <span className="demo-toggle-knob" />
      </button>
    </label>
  );
}

function SnippetView({ form }: { form: ConfigFormState }) {
  const configLines: Array<{ k: string; v: React.ReactNode }> = [];

  if (!form.showBalance)
    configLines.push({ k: "showBalance", v: <span className="t-orange">false</span> });
  if (!form.resolveDomain)
    configLines.push({ k: "resolveDomain", v: <span className="t-orange">false</span> });
  if (!form.explorerLink)
    configLines.push({ k: "explorerLink", v: <span className="t-orange">false</span> });
  if (!form.recentTransactions)
    configLines.push({ k: "recentTransactions", v: <span className="t-orange">false</span> });
  if (!form.networkStatus)
    configLines.push({ k: "networkStatus", v: <span className="t-orange">false</span> });
  if (!form.showLastWallet)
    configLines.push({ k: "showLastWallet", v: <span className="t-orange">false</span> });
  if (!form.splTokensEnabled) {
    configLines.push({ k: "splTokens", v: <span className="t-orange">false</span> });
  } else if (form.splTokensCustom && form.splTokensMints.trim()) {
    const mints = form.splTokensMints
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    configLines.push({
      k: "splTokens",
      v: (
        <>
          {"["}
          {mints.map((m, i) => (
            <span key={m}>
              <span className="t-green">"{m}"</span>
              {i < mints.length - 1 ? ", " : ""}
            </span>
          ))}
          {"]"}
        </>
      ),
    });
  }
  if (form.locale !== "en")
    configLines.push({ k: "locale", v: <span className="t-green">"{form.locale}"</span> });
  if (form.connectLabel)
    configLines.push({
      k: "labels.connectWallet",
      v: <span className="t-green">"{form.connectLabel}"</span>,
    });
  if (form.modalTitle)
    configLines.push({
      k: "labels.connectAWallet",
      v: <span className="t-green">"{form.modalTitle}"</span>,
    });

  const hasProviderProps = form.colorScheme !== "dark" || form.accent !== "#9945FF";

  return (
    <pre className="demo-snippet">
      {/* imports */}
      <span className="t-purple">import</span>
      {" { "}
      <span className="t-blue">autoDiscover</span>
      {", "}
      <span className="t-blue">createClient</span>
      {" } "}
      <span className="t-purple">from</span> <span className="t-green">'@solana/client'</span>
      {";"}
      {"\n"}
      <span className="t-purple">import</span>
      {" { "}
      <span className="t-blue">SolanaProvider</span>
      {" } "}
      <span className="t-purple">from</span> <span className="t-green">'@solana/react-hooks'</span>
      {";"}
      {"\n"}
      <span className="t-purple">import</span>
      {" { "}
      <span className="t-blue">SolanaUIProvider</span>
      {", "}
      <span className="t-blue">ConnectButton</span>
      {" } "}
      <span className="t-purple">from</span>{" "}
      <span className="t-green">'solana-framework-kit-ui'</span>
      {";"}
      {/* client setup */}
      {"\n\n"}
      <span className="t-purple">const</span> <span className="t-blue">client</span>
      {" = "}
      <span className="t-blue">createClient</span>
      {"({"}
      {"\n  "}
      <span className="t-blue">walletConnectors</span>
      {": "}
      <span className="t-blue">autoDiscover</span>
      {"(),"}
      {"\n});"}
      {/* SolanaProvider */}
      {"\n\n<"}
      <span className="t-blue">SolanaProvider</span> <span className="t-blue">client</span>
      {"={"}
      <span className="t-blue">client</span>
      {"}>"}
      {/* SolanaUIProvider opening tag */}
      {"\n  <"}
      <span className="t-blue">SolanaUIProvider</span>
      {form.colorScheme !== "dark" && (
        <>
          {"\n    "}
          <span className="t-blue">colorScheme</span>
          {"="}
          <span className="t-green">"{form.colorScheme}"</span>
        </>
      )}
      {form.accent !== "#9945FF" && (
        <>
          {"\n    "}
          <span className="t-blue">theme</span>
          {"={{ "}
          <span className="t-blue">accent</span>
          {": "}
          <span className="t-green">"{form.accent}"</span>
          {" }}"}
        </>
      )}
      {hasProviderProps ? "\n  >" : ">"}
      {/* ConnectButton */}
      {"\n    <"}
      <span className="t-blue">ConnectButton</span>
      {configLines.length > 0 ? (
        <>
          {"\n      "}
          <span className="t-blue">config</span>
          {"={{"}
          {configLines.map(({ k, v }) => (
            <span key={k}>
              {"\n        "}
              <span className="t-blue">{k}</span>
              {": "}
              {v}
              {","}
            </span>
          ))}
          {"\n      }}"}
          {"\n    />"}
        </>
      ) : (
        " />"
      )}
      {/* SolanaUIProvider closing tag */}
      {"\n  </"}
      <span className="t-blue">SolanaUIProvider</span>
      {">"}
      {/* SolanaProvider closing tag */}
      {"\n</"}
      <span className="t-blue">SolanaProvider</span>
      {">"}
    </pre>
  );
}

export default function App() {
  const [form, setForm] = useState<ConfigFormState>({
    showBalance: true,
    resolveDomain: true,
    explorerLink: true,
    recentTransactions: true,
    networkStatus: true,
    showLastWallet: true,
    splTokensEnabled: true,
    splTokensCustom: false,
    splTokensMints: "",
    locale: "en",
    colorScheme: "dark",
    accent: "#9945FF",
    connectLabel: undefined,
    modalTitle: undefined,
  });

  const set = <K extends keyof ConfigFormState>(key: K, val: ConfigFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const splTokensConfig: SFKConfig["splTokens"] = (() => {
    if (!form.splTokensEnabled) return false;
    if (form.splTokensCustom && form.splTokensMints.trim()) {
      return form.splTokensMints
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
    }
    return true;
  })();

  const sfkConfig: SFKConfig = {
    showBalance: form.showBalance,
    resolveDomain: form.resolveDomain,
    explorerLink: form.explorerLink,
    recentTransactions: form.recentTransactions,
    networkStatus: form.networkStatus,
    showLastWallet: form.showLastWallet,
    splTokens: splTokensConfig,
    locale: form.locale,
    labels: {
      ...(form.connectLabel ? { connectWallet: form.connectLabel } : {}),
      ...(form.modalTitle ? { connectAWallet: form.modalTitle } : {}),
    },
  };

  return (
    <SolanaProvider client={client}>
      <SolanaUIProvider colorScheme={form.colorScheme} theme={{ accent: form.accent }}>
        <div className="pg-app">
          {/* Sidebar */}
          <aside className="pg-sidebar">
            <div className="pg-sidebar-brand">solana-framework-kit-ui</div>

            <div className="pg-sidebar-section-label">Configuration</div>

            {/* Library theme */}
            <div className="pg-section">
              <div className="pg-section-label">Theme</div>
              <div className="pg-theme-btns">
                {(["dark", "light"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`pg-theme-btn${form.colorScheme === t ? " active" : ""}`}
                    onClick={() => set("colorScheme", t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="pg-field" style={{ marginTop: 12 }}>
                <label className="pg-field-label" htmlFor="accent-color">
                  Accent Color
                </label>
                <div className="pg-color-row">
                  <input
                    id="accent-color"
                    type="color"
                    className="pg-color-input"
                    value={form.accent}
                    onChange={(e) => set("accent", e.target.value)}
                  />
                  <span className="pg-color-hex">{form.accent.toUpperCase()}</span>
                  <button
                    type="button"
                    className="pg-color-reset"
                    onClick={() => set("accent", "#9945FF")}
                    title="Reset to default"
                  >
                    ↺
                  </button>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="pg-section">
              <div className="pg-section-label">Features</div>
              <Toggle
                label="SOL Balance"
                value={form.showBalance}
                onChange={(v) => set("showBalance", v)}
              />
              <Toggle
                label="SNS Domain"
                value={form.resolveDomain}
                onChange={(v) => set("resolveDomain", v)}
              />
              <Toggle
                label="Explorer Link"
                value={form.explorerLink}
                onChange={(v) => set("explorerLink", v)}
              />
              <Toggle
                label="Recent Transactions"
                value={form.recentTransactions}
                onChange={(v) => set("recentTransactions", v)}
              />
              <Toggle
                label="Network Status"
                value={form.networkStatus}
                onChange={(v) => set("networkStatus", v)}
              />
              <Toggle
                label="Last Used Wallet"
                value={form.showLastWallet}
                onChange={(v) => set("showLastWallet", v)}
              />
            </div>

            {/* SPL Tokens */}
            <div className="pg-section">
              <div className="pg-section-label">SPL Tokens</div>
              <Toggle
                label="Show SPL Balances"
                value={form.splTokensEnabled}
                onChange={(v) => set("splTokensEnabled", v)}
              />
              {form.splTokensEnabled && (
                <Toggle
                  label="Custom Mints"
                  value={form.splTokensCustom}
                  onChange={(v) => set("splTokensCustom", v)}
                />
              )}
              {form.splTokensEnabled && form.splTokensCustom && (
                <div className="pg-field" style={{ marginTop: 8 }}>
                  <input
                    type="text"
                    className="pg-input"
                    placeholder="mint1, mint2, …"
                    value={form.splTokensMints}
                    onChange={(e) => set("splTokensMints", e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Labels */}
            <div className="pg-section">
              <div className="pg-section-label">Labels</div>
              <div className="pg-field">
                <label className="pg-field-label" htmlFor="connect-label">
                  Connect Label
                </label>
                <input
                  id="connect-label"
                  type="text"
                  className="pg-input"
                  value={form.connectLabel ?? ""}
                  placeholder="i18n default"
                  onChange={(e) => set("connectLabel", e.target.value || undefined)}
                />
              </div>
              <div className="pg-field">
                <label className="pg-field-label" htmlFor="modal-title">
                  Modal Title
                </label>
                <input
                  id="modal-title"
                  type="text"
                  className="pg-input"
                  value={form.modalTitle ?? ""}
                  placeholder="i18n default"
                  onChange={(e) => set("modalTitle", e.target.value || undefined)}
                />
              </div>
            </div>

            {/* Language */}
            <div className="pg-section">
              <div className="pg-section-label">Language</div>
              <select
                className="pg-select"
                value={form.locale}
                onChange={(e) => set("locale", e.target.value)}
              >
                {LOCALES.map((l) => (
                  <option key={l} value={l}>
                    {LOCALE_NAMES[l] ?? l.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="pg-reset"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  showBalance: true,
                  resolveDomain: true,
                  explorerLink: true,
                  recentTransactions: true,
                  networkStatus: true,
                  showLastWallet: true,
                  splTokensEnabled: true,
                  splTokensCustom: false,
                  splTokensMints: "",
                  accent: "#9945FF",
                  connectLabel: undefined,
                  modalTitle: undefined,
                }))
              }
            >
              ↺ Reset Configuration
            </button>
          </aside>

          {/* Main */}
          <main className="pg-main">
            <div className="pg-header">
              <div className="pg-header-links">
                <span className="pg-badge">Feature Playground</span>
                <a
                  href="https://github.com/0xEdouardEth/solana-framework-kit-ui"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pg-header-link"
                  title="GitHub"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  GitHub
                </a>
                <a
                  href="https://www.npmjs.com/package/solana-framework-kit-ui"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pg-header-link"
                  title="npm"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474C23.214 24 24 23.214 24 22.237V1.763C24 .786 23.214 0 22.237 0zm9.927 5.878h6.416v12.244h-3.207V9.085h-3.209v9.037H7.682V5.878z" />
                  </svg>
                  npm
                </a>
              </div>
            </div>

            <div className="pg-hero">
              <h1 className="pg-hero-title">
                Solana <span>Framework Kit</span> UI
              </h1>
              <p className="pg-hero-sub">
                A React component library built on top of <code>@solana/framework-kit</code>.
              </p>
            </div>

            <div className="pg-grid">
              {/* ConnectButton card */}
              <div className="pg-card">
                <div className="pg-card-title">ConnectButton</div>
                <div className="pg-card-desc">
                  Adaptive button — gradient when disconnected, pill profile menu when connected.
                </div>
                <div className="pg-card-preview">
                  <ConnectButton config={sfkConfig} />
                </div>
              </div>

              {/* WalletInfo card */}
              <div className="pg-card">
                <div className="pg-card-title">Connected State</div>
                <div className="pg-card-desc">
                  Wallet address and connector name once a wallet is connected.
                </div>
                <div className="pg-card-preview">
                  <WalletInfo />
                </div>
              </div>

              {/* Quick Start */}
              <div className="pg-card pg-card--full">
                <div className="pg-card-title">Quick Start</div>
                <div className="pg-card-desc">
                  The snippet below reflects the current sidebar configuration.
                </div>
                <SnippetView form={form} />
              </div>
            </div>
          </main>
        </div>
      </SolanaUIProvider>
    </SolanaProvider>
  );
}
