# Architecture

## Overview

`solana-framework-kit-ui` is a **UI library** built on top of
[Solana Framework Kit](https://github.com/solana-foundation/framework-kit).
It provides pre-built React components acting as the presentation layer on top of
Framework Kit's state management. Framework Kit hooks (`@solana/react-hooks`) are
peer dependencies, consumed internally by components but not re-exported.

```
┌─────────────────────────────────────────────────────────┐
│                  Your application                       │
│                                                         │
│   <SolanaUIProvider>                                 │
│     <ConnectButton />   ← this library                  │
│   </SolanaUIProvider>                                │
└─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              solana-framework-kit-ui                    │
│                                                         │
│  Components: ConnectButton, WalletModal,                │
│              WalletIcon, AccountDisplay                 │
│                                                         │
│  Styling: CSS custom properties (zero runtime cost)     │
└─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              @solana/react-hooks (Framework Kit)        │
│  useWalletModalState, useWalletConnection, useBalance   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              @solana/client (Framework Kit)             │
│  createClient, autoDiscover, SolanaClient (Zustand)     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              @wallet-standard/* + @solana/kit           │
│  Wallet discovery, signing, RPC                         │
└─────────────────────────────────────────────────────────┘
```

## Folder structure

```
src/
├── components/
│   ├── ConnectButton/   — Self-contained button + modal integration
│   ├── WalletModal/     — Modal dialog / bottom sheet + wallet list
│   ├── WalletIcon/      — Wallet icon with initials fallback
│   └── AccountDisplay/  — Address display + copy/disconnect dropdown
├── hooks/               — Custom hooks (useSnsName, useRecentTxs, useSplBalances)
├── icons/               — Inline SVG icons (no icon lib dependency)
├── provider/            — SolanaUIProvider (theme + SolanaProvider wrap)
├── styles/              — Single CSS file with custom properties
└── utils/               — address.ts (truncateAddress, copyToClipboard)
```

## Key design decisions

### UI layer only
Framework Kit (`@solana/react-hooks`) owns all state and logic via `useWalletConnection`,
`useWalletModalState`, etc. This library adds only the visual layer on top — styled
components, theming, and layout. Users who want full control can use Framework Kit
hooks directly and build their own UI.

### CSS custom properties for theming
No CSS-in-JS, no Tailwind dependency. A single CSS file with `--sfk-*` variables
covers light/dark themes and is trivially overridable. See `docs/API.md` for the
full token list.

### Portal rendering
`WalletModal` renders via `ReactDOM.createPortal` into `document.body`.
This avoids stacking-context issues regardless of where `ConnectButton` is placed
in the DOM.

### Bottom sheet on mobile
The modal transitions to a bottom sheet on viewports ≤ 600px via a single CSS
`@media` query — no JS involved. The `env(safe-area-inset-bottom)` variable
handles home-indicator padding on iOS.

### No MWA (Mobile Wallet Adapter)
Wallets that support mobile (Phantom, Backpack, Solflare) register themselves
via Wallet Standard from their iOS/Android apps when the user is on a compatible
dApp browser. MWA (deep-link protocol) is out of scope for v1.

### Peer dependencies
`@solana/client`, `@solana/react-hooks`, `react`, and `react-dom` are all peer
deps — they are never bundled. This keeps the package tiny and avoids React
version conflicts.
