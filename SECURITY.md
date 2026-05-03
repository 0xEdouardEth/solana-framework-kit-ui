# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.x     | ✅         |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities privately via GitHub's [Security Advisories](https://github.com/0xEdouardEth/solana-framework-kit-ui/security/advisories/new) feature.

Include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

You will receive a response within **72 hours**. If the vulnerability is confirmed, a patch will be released as soon as possible and you will be credited in the changelog unless you prefer to remain anonymous.

## Scope

This library is a **UI-only layer** — it does not handle private keys, sign transactions, or store sensitive data. The attack surface is limited to:

- The `explorerUrl` config option (accepts a function — ensure it comes from a trusted source)
- localStorage key `sfk:last-connector` (stores wallet connector IDs only, no sensitive data)
- External RPC calls made by `useRecentTxs` (endpoint is set by the application, not this library)
