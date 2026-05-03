---
"solana-framework-kit-ui": minor
---

Initial release of solana-framework-kit-ui.

**Components:**
- `SolanaUIProvider` — root provider with CSS theme variables, dark/light mode, and config context
- `ConnectButton` — all-in-one wallet connect button (disconnected, connecting, connected states)
- `WalletModal` — wallet selection modal (desktop) / bottom sheet (mobile)
- `AccountDisplay` — connected wallet dropdown with balance, SNS name, Identicon avatar, recent transactions, explorer link, and disconnect
- `WalletIcon` — wallet icon with SVG placeholder fallback
- `Identicon` — deterministic gradient avatar from a Solana address

**Hooks:**
- `useRecentTxs` — fetch recent transaction signatures with manual refresh
- `useSnsName` — resolve `.sol` SNS reverse-lookup name
- `useSnsProfilePic` — fetch Bonfida SNS profile picture

**Utils:**
- `truncateAddress`, `copyToClipboard`, `formatSol`

**Features:**
- Full CSS custom properties theming (30+ tokens)
- Dark and light themes built-in
- CSS auto-injected at runtime (no manual import needed)
- i18n support for 10 languages (en, fr, es, de, zh, ja, pt, ru, ko, ar)
- SPL token balances (USDC/USDT default, configurable)
- Network status indicator
- "Last used" wallet persistence
- Accessible: ARIA roles, keyboard navigation, focus management
