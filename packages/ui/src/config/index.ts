import type { WalletSession } from "@solana/client";
import { createContext, useContext } from "react";

/** USDC and USDT mainnet mint addresses used by default for SPL token balances. */
export const DEFAULT_SPL_TOKENS = [
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
] as const;

/** All overridable UI labels used throughout the library. */
export type Labels = {
  connectWallet: string;
  connecting: string;
  disconnect: string;
  disconnecting: string;
  connectAWallet: string;
  closeModal: string;
  noWalletsDetected: string;
  getPhantom: string;
  notInstalled: string;
  install: string;
  balance: string;
  copyAddress: string;
  addressCopied: string;
  viewOnExplorer: string;
  recentTransactions: string;
  noRecentTransactions: string;
  lastUsed: string;
  agreeToTerms: string;
  termsOfService: string;
  network: string;
  mainnet: string;
  devnet: string;
  testnet: string;
};

/**
 * Global configuration for solana-framework-kit-ui components.
 * All feature flags default to `true` (enabled) when not specified.
 */
export type SFKConfig = Readonly<{
  /** Show SOL balance in the dropdown. @default true */
  showBalance?: boolean;
  /** Resolve `.sol` SNS name for the connected address. @default true */
  resolveDomain?: boolean;
  /** Show "View on Explorer" link in the dropdown. @default true */
  explorerLink?: boolean;
  /** Custom explorer URL builder. Defaults to Solscan. */
  explorerUrl?: (address: string, cluster: string) => string;
  /** Show cluster switcher in the dropdown. @default true */
  clusterSwitcher?: boolean;
  /** Show identicon avatar in the trigger button. @default true */
  avatar?: boolean;
  /** Show recent transactions in the dropdown. @default true */
  recentTransactions?: boolean;
  /** Locale for i18n. Falls back to browser language, then "en". */
  locale?: string;
  /** Partial label overrides applied on top of the resolved locale translations. */
  labels?: Partial<Labels>;
  /** Called when a wallet is successfully connected. */
  onConnect?: (wallet: WalletSession) => void;
  /** Called when the wallet is disconnected. */
  onDisconnect?: () => void;
  /**
   * SPL token balances to show in the dropdown.
   * - `true` or `undefined` → show USDC + USDT
   * - `false` → disabled
   * - `string[]` → custom mint addresses
   * @default true
   */
  splTokens?: boolean | readonly string[];
  /** Show "Last used" badge on the previously used wallet in the modal. @default true */
  showLastWallet?: boolean;
  /** Show network status dot indicator on the trigger. @default true */
  networkStatus?: boolean;
  /**
   * Called whenever a recoverable error is caught internally (RPC failures,
   * SNS resolution errors, wallet connection errors, etc.).
   * Useful for logging or surfacing errors in your own UI.
   *
   * @param error  - The caught error (always an Error instance)
   * @param source - Where the error originated, e.g. "connect", "fetchBalance", "sns", "recentTxs"
   */
  onError?: (error: Error, source: string) => void;
}>;

/** React context providing the current SFKConfig. */
const ConfigContext = createContext<SFKConfig>({});

export { ConfigContext };

/**
 * Returns the current SFKConfig from context.
 * All feature flags default to `true` when not set.
 */
export function useConfig(): SFKConfig {
  return useContext(ConfigContext);
}
