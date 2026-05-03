# Contributing

Thanks for your interest in contributing! This guide covers everything you need to get started.

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.1
- A Solana wallet extension installed (Phantom, Backpack, or MetaMask)

## Setup

```bash
git clone https://github.com/0xEdouardEth/solana-framework-kit-ui
cd solana-framework-kit-ui
bun install
```

## Development

```bash
# Terminal 1 — build library in watch mode
bun run dev:ui

# Terminal 2 — run the demo app
bun run dev:demo
```

The demo app uses a Vite alias that points directly to `packages/ui/src/`, so library changes are reflected instantly.

## Project structure

This is a monorepo with two packages:

```
packages/
├── ui/                     # The library (published to npm)
│   └── src/
│       ├── components/         # React components
│       │   ├── ConnectButton/  # Main connect/disconnect button
│       │   ├── WalletModal/    # Modal + bottom sheet
│       │   ├── WalletIcon/     # Wallet icon with fallback
│       │   ├── AccountDisplay/ # Connected address + dropdown
│       │   └── Identicon/      # Address avatar
│       ├── hooks/              # Custom hooks (recent txs, SNS, SPL balances)
│       ├── icons/              # Inline SVG icons
│       ├── i18n/               # Translations (10 languages)
│       ├── provider/           # SolanaUIProvider
│       ├── config/             # Theme & default config
│       ├── services/           # API helpers (balance, SNS, transactions)
│       ├── styles/             # CSS custom properties
│       └── utils/              # Address formatting, clipboard
└── demo/                   # Demo app (not published)
```

## Before submitting a PR

```bash
bun run ci
```

This runs lint, type-check, tests, and build.

## Commit convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add WalletConnect support
fix: modal not closing on Escape
docs: update README usage example
chore: bump vite to 6.1
```

## Reporting bugs

Please use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.yml).

## Proposing features

Please use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.yml).
If you're unsure, open a Discussion first.

## Changesets & releases

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

**For contributors:** if your PR introduces a user-facing change (new feature, bug fix, breaking change), add a changeset before pushing:

```bash
bun run changeset
```

Select the package (`solana-framework-kit-ui`), the semver bump type (`patch`, `minor`, or `major`), and write a short description of the change. This creates a file in `.changeset/` — commit it with your PR.

**Release flow (maintainers):**

1. When changesets land on `main`, the `Release` GitHub Action opens a **"Version Packages"** PR that bumps versions and updates the CHANGELOG.
2. Merging that PR triggers the same action again, which **publishes to npm** and creates a GitHub Release.

```
feature PR (with changeset) → merge to main → Version PR auto-created → merge Version PR → npm publish
```

**Manual release** (if needed):

```bash
bun run version-packages   # apply changesets → bump versions + CHANGELOG
bun run publish-packages   # publish to npm
```

---

## Code style

- TypeScript strict mode
- Biome for formatting and linting (no ESLint, no Prettier)
- Pure functions — no classes
- No `console.log` in library code
- JSDoc on every exported symbol
