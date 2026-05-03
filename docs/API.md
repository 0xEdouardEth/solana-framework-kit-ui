# API Reference

## Components

### `<SolanaUIProvider>`

Injects CSS variables for theming and provides config context to all child components.
Must be placed **inside** `SolanaProvider` from `@solana/react-hooks`.

```tsx
import { autoDiscover, createClient } from "@solana/client";
import { SolanaProvider } from "@solana/react-hooks";
import { SolanaUIProvider } from "solana-framework-kit-ui";

const client = createClient({ walletConnectors: autoDiscover() });

<SolanaProvider client={client}>
  <SolanaUIProvider
    colorScheme="dark"     // "dark" | "light" — default: "dark"
    theme={{               // all optional — defaults shown below
      accent: "#9945FF",
      accentForeground: "#ffffff",
      surface: "#0f1117",
      surfaceHover: "#1e1b2e",
      text: "#e8eaf6",
      textMuted: "#7b82a8",
      border: "#2e3248",
      radius: "14px",
      radiusSm: "8px",
      overlay: "rgba(0,0,0,0.65)",
      fontFamily: "inherit",
    }}
  >
    {children}
  </SolanaUIProvider>
</SolanaProvider>
```

---

### `<ConnectButton>`

All-in-one wallet connect button. Handles all states internally.

```tsx
<ConnectButton
  label="Connect Wallet"  // text when disconnected — default: i18n "Connect Wallet"
  className="my-btn"      // extra class on the root element
  config={{               // component-level config (merges with provider config)
    showBalance: true,
    resolveDomain: true,
    locale: "fr",
  }}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Button text when disconnected. Falls back to i18n label. |
| `className` | `string` | Extra class on the root element. |
| `config` | `SFKConfig` | Component-level config that merges with (and overrides) the provider-level config. |

**States:**
| Status | Rendered element |
|--------|-----------------|
| `isReady === false` | Disabled button with spinner |
| `disconnected` | Button → click opens `WalletModal` |
| `connecting` | Button with spinner + "Connecting…" |
| `connected` | `<AccountDisplay>` with avatar, SNS name or truncated address, and dropdown |

---

### `<WalletModal>`

Wallet selection modal / bottom sheet. Normally used internally by `ConnectButton`,
but exposed for custom layouts.

```tsx
import { useWalletModalState } from "@solana/react-hooks";

const state = useWalletModalState({ closeOnConnect: true });

<WalletModal state={state} />
```

**Behaviour:**
- Desktop (> 600px): centered modal with backdrop
- Mobile (≤ 600px): slides up from bottom (bottom sheet) with drag handle
- Closes on `Escape` key or backdrop click
- Locks body scroll while open
- Separates installed wallets from uninstalled ones (with install links)

---

### `<WalletIcon>`

Renders a wallet icon or a placeholder SVG.

```tsx
<WalletIcon
  icon={connector.icon}  // data URI or URL — optional
  name={connector.name}  // used for alt text + fallback
  size={40}              // px — default: 40
  className="my-icon"
/>
```

---

### `<AccountDisplay>`

Shows the connected wallet as a pill trigger with a dropdown panel.
Normally used internally by `ConnectButton`, but exposed for custom layouts.

```tsx
<AccountDisplay
  wallet={wallet}              // WalletSession from useWalletConnection
  onDisconnect={disconnect}    // () => Promise<void>
  className="my-account"
/>
```

**Trigger:** Displays a deterministic gradient avatar (`Identicon`) — or the Bonfida SNS
profile picture if available — followed by the `.sol` domain name or a truncated address.

**Dropdown panel includes:**
- Full address with copy button
- Network status indicator (cluster name + colored dot)
- SOL balance
- SPL token balances (USDC/USDT by default, configurable)
- Recent transactions with explorer links
- "View on Explorer" link
- Disconnect button

All sections are controlled by `SFKConfig` feature flags.

---

### `<Identicon>`

Renders a deterministic gradient circle avatar derived from a Solana address.
Uses a fast hash to compute two complementary HSL hues rendered as an SVG linear gradient.

```tsx
<Identicon
  address="9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
  size={20}              // px — default: 20
/>
```

---

## Hooks

Framework Kit hooks are **not** re-exported from this library. Import them directly from `@solana/react-hooks`:

```ts
import { useWalletConnection, useBalance, useAccount } from "@solana/react-hooks";
```

See [Framework Kit docs](https://github.com/solana-foundation/framework-kit) for the full hook API.

This library exposes its own hooks:

### `useRecentTxs`

Fetches recent transaction signatures for a Solana address. Returns the list and
a `refresh()` function to trigger a manual re-fetch on demand.

```ts
import { useRecentTxs } from "solana-framework-kit-ui";

const { txs, refresh } = useRecentTxs(address);
```

**Signature**

```ts
function useRecentTxs(
  address: string | undefined,
  enabled?: boolean,   // default: true
  limit?:  number,     // default: 5
): { txs: TxInfo[]; refresh: () => void }
```

**`TxInfo` shape**

```ts
type TxInfo = {
  signature: string;
  blockTime:  number | null;
  err:        unknown;         // null = success
};
```

**Behaviour**

- Fetches once on mount, then again whenever `address` or the active RPC endpoint changes.
- Does **not** poll automatically — data stays fresh until you call `refresh()` or the
  address/endpoint changes.
- Silently swallows RPC errors so the UI never breaks on a flaky node.

**Triggering a refresh after sending a transaction**

The most common use case: call `refresh()` immediately after a transaction is confirmed
so the list reflects the new entry without waiting for a re-mount.

```tsx
import { useSendTransaction } from "@solana/react-hooks";
import { useRecentTxs } from "solana-framework-kit-ui";

function SendButton({ address }: { address: string }) {
  const { txs, refresh } = useRecentTxs(address);
  const { send } = useSendTransaction();

  async function handleSend() {
    await send(transaction);
    refresh(); // re-fetch immediately after confirmation
  }

  return (
    <>
      <button onClick={handleSend}>Send</button>
      <ul>
        {txs.map((tx) => (
          <li key={tx.signature}>{tx.signature.slice(0, 8)}…</li>
        ))}
      </ul>
    </>
  );
}
```

**Disabling the hook**

Pass `enabled: false` to skip fetching entirely — useful when the feature is toggled
off via `SFKConfig.recentTransactions`.

```ts
const { txs, refresh } = useRecentTxs(address, false);
// txs === [], refresh() is a no-op (calling it re-enables fetching)
```

---

### `useSnsName`

Resolves a Solana wallet address to its `.sol` SNS reverse-lookup name.

```ts
import { useSnsName } from "solana-framework-kit-ui";

const name = useSnsName("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM");
// => "alice.sol" | null
```

**Signature**

```ts
function useSnsName(
  walletAddress: string | undefined,
  enabled?: boolean,   // default: true
): string | null
```

---

### `useSnsProfilePic`

Fetches the profile picture URL from the Bonfida SNS record v2 for a resolved `.sol` domain.
Returns `null` while loading, if no picture is set, or on failure.

```ts
import { useSnsName, useSnsProfilePic } from "solana-framework-kit-ui";

const name = useSnsName(address);
const pic  = useSnsProfilePic(name);
// pic === "https://..." | null
```

**Signature**

```ts
function useSnsProfilePic(snsName: string | null): string | null
```

---

## Utils

```ts
import { truncateAddress, copyToClipboard, formatSol } from "solana-framework-kit-ui";

truncateAddress("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM");
// => "9WzD...AWWM"

truncateAddress(address, 6);
// => "9WzDXw...tAWWM"

await copyToClipboard(address); // => boolean

formatSol(1_500_000_000n); // => "1.5000"
formatSol(0n);             // => "0.0000"
formatSol(null);           // => null
```

---

## CSS Custom Properties

All tokens are scoped to `.sfk-root`. Override globally or per-component:

```css
/* Global override */
.sfk-root {
  --sfk-accent: #ff6b6b;
  --sfk-radius: 8px;
}

/* Per-instance override */
.my-custom-area .sfk-root {
  --sfk-surface: #2a2a3e;
}
```

| Variable | Default (dark) | Description |
|----------|---------------|-------------|
| `--sfk-accent` | `#9945ff` | Primary accent color |
| `--sfk-accent-dark` | `#7c3aed` | Darker accent variant |
| `--sfk-accent-hover` | `#8535e8` | Hover state for accent |
| `--sfk-accent-foreground` | `#ffffff` | Text on accent backgrounds |
| `--sfk-accent-glow` | `rgba(153,69,255,0.18)` | Glow behind accent elements |
| `--sfk-surface` | `#0f1117` | Primary background |
| `--sfk-surface-2` | `#1a1d27` | Secondary background (modal, dropdown) |
| `--sfk-surface-hover` | `#1e1b2e` | Hover state for surface items |
| `--sfk-surface-active` | `#22263a` | Active/pressed state |
| `--sfk-border` | `#2e3248` | Subtle border |
| `--sfk-border-hover` | `#3d4260` | Border on hover |
| `--sfk-border-accent` | `rgba(153,69,255,0.5)` | Accent-tinted border |
| `--sfk-text` | `#e8eaf6` | Primary text |
| `--sfk-text-secondary` | `#a0a8c8` | Secondary text |
| `--sfk-text-muted` | `#7b82a8` | Muted / placeholder text |
| `--sfk-overlay-bg` | `rgba(0,0,0,0.65)` | Modal backdrop |
| `--sfk-success` | `#14f195` | Success / connected indicator |
| `--sfk-success-glow` | `rgba(20,241,149,0.2)` | Glow around success dot |
| `--sfk-danger` | `#ff4d6d` | Disconnect / error color |
| `--sfk-danger-bg` | `rgba(255,77,109,0.08)` | Error banner background |
| `--sfk-radius` | `14px` | Modal / card border radius |
| `--sfk-radius-sm` | `8px` | Button / dropdown radius |
| `--sfk-radius-xs` | `6px` | Small elements radius |
| `--sfk-radius-pill` | `100px` | Pill / badge radius |
| `--sfk-font` | `inherit` | Font family |
| `--sfk-font-mono` | `ui-monospace, …` | Monospace font (addresses) |
| `--sfk-shadow-sm` | `0 2px 8px rgba(0,0,0,0.3)` | Subtle shadow (dropdown rows) |
| `--sfk-shadow` | `0 8px 32px rgba(0,0,0,0.45)` | Modal box shadow |
| `--sfk-transition` | `0.15s ease` | Default animation easing |
| `--sfk-transition-slow` | `0.22s ease` | Slower transitions (overlay) |
