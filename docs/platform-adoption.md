# Identus Platform Adoption — React & React Native

This document maps the GitHub issue **“Adopt the Identus SDKs for the React/ReactNative platform”**
to concrete artifacts in this repository and the upstream component repositories.

## Goal

Make Identus libraries (Apollo, SDK-TS, VDR) adoptable for Identity Wallet projects built with
React (web) and React Native (mobile), with clear specifications and service integration guidance.

## Deliverables in this repository

| Deliverable | Location | Description |
| ------------- | ---------- | ------------- |
| Identity Wallet specification | [`identity-wallet-specification.md`](identity-wallet-specification.md) | Holder use cases: setup, DIDs, credentials, presentation, backup, recovery |
| React Native integration guide | [`react-native-integration.md`](react-native-integration.md) | Polyfills, Metro, storage, agent init, testing phases |
| React Native reference wallet | [`workshops/react-native-identity-wallet`](../workshops/react-native-identity-wallet) | Expo holder wallet on `@hyperledger/identus-sdk` v7 |
| Web workshops | [`workshops/RareEvo-2025`](../workshops/RareEvo-2025), [`workshops/sdjwt-medical-prescription`](../workshops/sdjwt-medical-prescription) | Next.js issuer/holder/verifier patterns |
| Local infrastructure | [`identus-docker`](../identus-docker) | Cloud Agent, Mediator, PRISM node via Docker Compose |

## Component adoption matrix

| Component | npm / repo | React (web) | React Native | Integration path |
| ----------- | ------------ | ------------- | -------------- | ------------------ |
| **Apollo** | `@hyperledger/identus-apollo` | ✅ Browser crypto | ⚠️ Polyfills / crypto shim | Pin `1.6.0`; use `react-native-quick-crypto` or workshop `crypto-shim.js` |
| **SDK-TS** | `@hyperledger/identus-sdk` | ✅ Next.js workshops | ✅ Expo workshop | Default import; Metro polyfills for Buffer/process/stream |
| **SDK-Swift** | [identus-edge-agent-sdk-swift](https://github.com/hyperledger/identus-edge-agent-sdk-swift) | N/A | ✅ Native iOS | Alternative to TS+polyfills for production iOS |
| **Universal Resolver** | [uniresolver.io](https://uniresolver.io) | ✅ HTTP | ✅ HTTP | `EXPO_PUBLIC_RESOLVER_URL` / `NEXT_PUBLIC_RESOLVER_URL` |
| **PRISM VDR driver** | [prism-vdr-driver](https://github.com/hyperledger-identus/prism-vdr-driver) | ✅ Via resolver | ✅ Via resolver | Deploy driver behind Universal Resolver or Cloud Agent |
| **VDR API** | [vdr](https://github.com/hyperledger-identus/vdr) | ✅ HTTP | ✅ HTTP | Used indirectly through resolver endpoints |
| **Cloud Agent** | [identus-cloud-agent](https://github.com/hyperledger/identus-cloud-agent) | ✅ | ✅ (OOB / DIDComm) | Issue credentials; optional PRISM DID resolution |
| **Mediator** | [identus-mediator](https://github.com/hyperledger/identus-mediator) | ✅ | ✅ | `EXPO_PUBLIC_MEDIATOR_DID` — required for offline DIDComm |

## Recommended adoption order

1. **Mediator + SDK-TS** — wallet bootstrap, seed, agent lifecycle.
2. **Cloud Agent** — credential issuance and verification interoperability.
3. **Universal Resolver / PRISM VDR** — short-form PRISM DID resolution in mixed environments.
4. **Encrypted backup API** — `agent.backup.createJWE()` / `restore()` for device migration.
5. **On-chain PRISM publishing** — web-only today (Cardano browser wallets); use backend signing for mobile.

## Platform-specific entry points

### React Native (Expo)

```bash
cd workshops/react-native-identity-wallet
npm install
cp .env.example .env
npx expo start
```

See [`react-native-integration.md`](react-native-integration.md) for polyfill and Metro details.

### React (Next.js)

| Workshop | SDK package | Notes |
| ---------- | ------------- | ------- |
| RareEvo-2025 | `@hyperledger/identus-sdk` v7 | SD-JWT, OOB, Cardano DID publish |
| sdjwt-medical-prescription | `@hyperledger/identus-edge-agent-sdk` v6 | Migrate to v7 for consistency |

Web apps can use `@trust0/identus-react` hooks (RareEvo-2025) instead of hand-rolled context.

## Identity Wallet use-case coverage

| Use case | RN workshop | Spec reference |
| ---------- | ------------- | ---------------- |
| UC-01 Create wallet | ✅ | §3 |
| UC-02 Restore mnemonic | ✅ | §3 |
| UC-03 Create PRISM DID | ✅ | §4 |
| UC-04 Resolve DID | ✅ (Castor + resolvers) | §4 |
| UC-05 Accept OOB credential | ✅ | §5 |
| UC-06 Present credential | ✅ (inbound request banner) | §6 |
| UC-07 Export credentials JSON | ✅ | §7 |
| UC-08 Encrypted JWE backup | ✅ | §7 |
| UC-09 View recovery phrase | ✅ | §7 |
| UC-10 Restore mnemonic + JWE | ✅ | §8 |

## Upstream repositories

Implementation of core libraries lives outside this aggregation repo:

- [sdk-ts](https://github.com/hyperledger-identus/sdk-ts) — `@hyperledger/identus-sdk`
- [identus-apollo](https://github.com/hyperledger/identus-apollo)
- [identus-cloud-agent](https://github.com/hyperledger/identus-cloud-agent)
- [identus-mediator](https://github.com/hyperledger/identus-mediator)
- [vdr](https://github.com/hyperledger-identus/vdr) / [prism-vdr-driver](https://github.com/hyperledger-identus/prism-vdr-driver)

Track SDK releases and migrate workshops when stable v7 ships.
