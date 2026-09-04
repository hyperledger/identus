# React Native Integration Guide

This guide explains how to integrate the Identus TypeScript SDK
(`@hyperledger/identus-sdk`) into a React Native application built with
[Expo](https://expo.dev/). It covers polyfill setup, storage options,
cryptography, and known platform differences.

> **Working example:** See the
> [`workshops/react-native-identity-wallet`](../workshops/react-native-identity-wallet)
> directory for a complete, runnable Expo app that implements everything in this
> guide.

---

## Table of contents

1. [Compatibility matrix](#1-compatibility-matrix)
2. [Installation](#2-installation)
3. [Required polyfills](#3-required-polyfills)
4. [Metro bundler configuration](#4-metro-bundler-configuration)
5. [Agent initialization](#5-agent-initialization)
6. [Storage options](#6-storage-options)
7. [DID management](#7-did-management)
8. [Credential operations](#8-credential-operations)
9. [Backup and recovery](#9-backup-and-recovery)
10. [Service adoption profile](#10-service-adoption-profile)
11. [Testing phases](#11-testing-phases)
12. [Known limitations](#12-known-limitations)
13. [Component version references](#13-component-version-references)

---

## 1. Compatibility matrix

| Component | npm package | React Native | Notes |
| ----------- | ------------- | -------------- | ------- |
| Edge Agent SDK | `@hyperledger/identus-sdk` | ✅ v7+ | Polyfills required |
| Apollo cryptography | `@hyperledger/identus-apollo` | ⚠️ Partial | WASM fallback via `react-native-quick-crypto` |
| Pluto storage (AsyncStorage) | Workshop `AsyncStoragePlutoStore` | ✅ | Default in reference wallet |
| Pluto storage (in-memory) | Workshop `InMemoryPlutoStore` | ✅ | Set `EXPO_PUBLIC_PERSISTENT_STORAGE=false` |
| Pluto storage (SQLite) | Custom (`expo-sqlite`) | ✅ | See [Storage options](#6-storage-options) |
| DIDComm messaging | Built into SDK | ✅ | Requires mediator |
| Universal Resolver | `EXPO_PUBLIC_RESOLVER_URL` | ✅ | Any HTTP(S) resolver |
| Cardano on-chain DID publishing | `@cardano-sdk` | ❌ | Browser wallet APIs not available in RN |
| SDK-Swift | `identus-edge-agent-sdk-swift` | ✅ Native iOS | See [Swift SDK](https://github.com/hyperledger/identus-edge-agent-sdk-swift) |

---

## 2. Installation

```bash
npx create-expo-app my-identity-wallet --template blank-typescript
cd my-identity-wallet

npm install \
  @hyperledger/identus-sdk@7.0.0-rc.12 \
  @hyperledger/identus-apollo@1.6.0 \
  @trust0/identus-store \
  @trust0/ridb \
  react-native-quick-crypto \
  react-native-get-random-values \
  react-native-url-polyfill \
  buffer \
  events \
  process \
  stream-browserify \
  readable-stream
```

Pin Apollo to avoid peer-dependency conflicts:

```json
// package.json
{
  "resolutions": {
    "@hyperledger/identus-apollo": "1.6.0"
  }
}
```

---

## 3. Required polyfills

Create `src/polyfills.ts` and import it as the **very first statement** in your
app entry point (usually `index.js`):

```ts
// src/polyfills.ts

// 1. Secure random values — must be first
import "react-native-get-random-values";

// 2. WHATWG URL API
import "react-native-url-polyfill/auto";

// 3. Node.js Buffer global
import { Buffer } from "buffer";
if (typeof global.Buffer === "undefined") {
  // @ts-ignore
  global.Buffer = Buffer;
}

// 4. Node.js process global
import process from "process";
if (typeof global.process === "undefined") {
  // @ts-ignore
  global.process = process;
}

// 5. Web Crypto API (replaces WASM-dependent Apollo crypto)
import QuickCrypto from "react-native-quick-crypto";
if (typeof global.crypto === "undefined" || !global.crypto.subtle) {
  // @ts-ignore
  global.crypto = QuickCrypto;
}
```

```js
// index.js — entry point
import "./src/polyfills";   // ← must be first
import { registerRootComponent } from "expo";
import App from "./App";
registerRootComponent(App);
```

### Why each polyfill is needed

| Polyfill | Why required |
| ---------- | -------------- |
| `react-native-get-random-values` | Hermes does not have a secure random source; this uses the native OS CSPRNG |
| `react-native-url-polyfill` | SDK uses the WHATWG URL API; React Native's built-in is incomplete |
| `buffer` | SDK uses `Buffer` extensively; not available in Hermes by default |
| `process` | SDK reads `process.env` and `process.nextTick` |
| `react-native-quick-crypto` | Provides `crypto.subtle` via JSI; required because Apollo's WASM path is unavailable in Hermes |
| `stream-browserify` | SDK internally imports `stream`; Metro needs a resolution for it |

---

## 4. Metro bundler configuration

```js
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  buffer: require.resolve("buffer"),
  events: require.resolve("events"),
  process: require.resolve("process"),
  stream: require.resolve("stream-browserify"),
  "readable-stream": require.resolve("readable-stream"),
};

// SDK ships .cjs and .mjs variants
config.resolver.sourceExts = [...config.resolver.sourceExts, "cjs", "mjs"];

// Apollo ships a .wasm asset (used as a fallback when native crypto is unavailable)
config.resolver.assetExts = [...config.resolver.assetExts, "wasm"];

module.exports = config;
```

---

## 5. Agent initialization

```ts
import SDK from "@hyperledger/identus-sdk";
import { createStore } from "@trust0/identus-store";
import { StorageType } from "@trust0/ridb";

const MEDIATOR_DID =
  "did:peer:2.Ez6LSr75gLoSwaVHS7MTzcKLXjt9onJMXY9aVEBGWY8ahWPdn" +
  // … (full DID from .env or hardcoded default)
  "";

async function initAgent(seed?: SDK.Domain.Seed) {
  const apollo = new SDK.Apollo();

  // Use InMemory for workshop / development; see §6 for persistent options
  const store = createStore({
    dbName: "my-wallet",
    storageType: StorageType.InMemory,
  });

  const pluto = new SDK.Pluto(store, apollo);
  const castor = new SDK.Castor(apollo, []);

  const resolvedSeed = seed ?? apollo.createRandomSeed().seed;

  const agent = await SDK.Agent.initialize({
    apollo,
    castor,
    mediatorDID: SDK.Domain.DID.fromString(MEDIATOR_DID),
    pluto,
    seed: resolvedSeed,
  });

  await agent.start();
  return { agent, apollo, pluto };
}
```

### Listening for incoming messages

```ts
agent.addListener(SDK.ListenerKey.MESSAGE, async (messages: SDK.Domain.Message[]) => {
  for (const message of messages) {
    if (message.piuri === SDK.ProtocolType.DidcommIssueCredential) {
      // Auto-accept and store the credential
      await agent.handle(message);
    }
  }
});
```

---

## 6. Storage options

### Option A — AsyncStorage (reference wallet default)

The React Native identity wallet workshop uses `AsyncStoragePlutoStore`, which
persists Pluto tables across app restarts:

```ts
import { AsyncStoragePlutoStore } from "./src/storage/AsyncStoragePlutoStore";

const store = new AsyncStoragePlutoStore();
await store.start();
const pluto = new SDK.Pluto(store, apollo);
```

Set `EXPO_PUBLIC_PERSISTENT_STORAGE=false` to fall back to in-memory storage.

### Option B — In-memory (demos only)

```ts
import { InMemoryPlutoStore } from "./src/storage/InMemoryPlutoStore";

const store = new InMemoryPlutoStore();
const pluto = new SDK.Pluto(store, apollo);
```

Data is lost when the app process terminates.

### Option C — expo-sqlite (production)

Use the `SQLiteStorageAdapter` reference implementation in the workshop:

```ts
import { createSQLiteStore } from "./src/storage/SQLiteStorageAdapter";

const store = await createSQLiteStore("wallet");
const pluto = new SDK.Pluto(store, apollo);
```

### Option D — @trust0/ridb (upcoming React Native support)

The RIDB library is adding an official React Native storage backend. Once
released, it will be the preferred persistent storage solution:

```ts
// Future — track https://github.com/trust0-project/RIDB for availability
import { StorageType } from "@trust0/ridb";
const store = createStore({ dbName: "wallet", storageType: StorageType.ReactNative });
```

### Secure key storage

Store the seed mnemonic in the device keychain using `expo-secure-store`:

```ts
import * as SecureStore from "expo-secure-store";

// Save after wallet creation
await SecureStore.setItemAsync("identus.mnemonics", JSON.stringify(mnemonics));

// Load on app startup
const stored = await SecureStore.getItemAsync("identus.mnemonics");
if (stored) {
  const mnemonics = JSON.parse(stored);
  const seed = apollo.createSeed(mnemonics);
  await initAgent(seed);
}
```

---

## 7. DID management

### Create a PRISM DID

```ts
const task = new SDK.Tasks.CreatePrismDID({
  authenticationKeyCurve: SDK.Domain.Curve.SECP256K1,
  services: [],
  alias: "my-wallet-did",
});
const did = await agent.runTask(task);
console.log(did.toString()); // did:prism:…
```

### Create a Peer DID (for DIDComm)

```ts
const peerDID = await agent.createNewPeerDID();
```

### Resolve a DID

```ts
const document = await agent.castor.resolveDID(did.toString());
```

### Publish a PRISM DID on Cardano

Publishing requires submitting an Atala Object transaction on Cardano. This
requires a funded wallet and Blockfrost API access. Because Cardano browser
wallet extensions (Lace, Nami, etc.) are unavailable in React Native, you must
use a pre-built transaction or a server-side signing service.

See the [RareEvo-2025 workshop](../workshops/RareEvo-2025) for the full
Cardano publishing flow on the web platform.

---

## 8. Credential operations

### Accept an OOB credential offer (holder)

```ts
import { base64 } from "multiformats/bases/base64";

async function acceptOOBOffer(agent: SDK.Agent, input: string) {
  let oobJson = input;

  // Handle URL format: ?oob=<base64>
  try {
    const url = new URL(input);
    const oobParam = url.searchParams.get("oob");
    if (oobParam) {
      oobJson = Buffer.from(oobParam, "base64").toString("utf-8");
    }
  } catch {
    // input is already a JSON string
  }

  const peerDID = await agent.createNewPeerDID();

  const message = SDK.Domain.Message.fromJson(oobJson);
  const attachment = message.attachments.at(0)?.payload;
  const credentialOffer = SDK.Domain.Message.fromJson({
    ...attachment,
    from: message.from,
    to: peerDID,
  });

  const credentialOfferMessage = SDK.OfferCredential.fromMessage(credentialOffer);
  const requestCredential = await agent.handle(credentialOfferMessage.makeMessage());
  await agent.send(requestCredential.makeMessage());
}
```

### List stored credentials

```ts
const credentials = await pluto.getAllCredentials();
```

### Create a verifiable presentation

```ts
const requestPresentation = SDK.RequestPresentation.fromMessage(requestMessage);
const task = new SDK.Tasks.CreatePresentation({
  request: requestPresentation,
  credential,
  disclosedClaims: { givenName: true, familyName: true }, // SD-JWT selective disclosure
});
const presentation = await agent.runTask(task);
await agent.send(presentation.makeMessage());
```

---

## 9. Backup and recovery

### Generate a wallet and display the mnemonic

```ts
const apollo = new SDK.Apollo();
const { seed, mnemonics } = apollo.createRandomSeed();

// mnemonics is a string[24] — display to the user for backup
console.log(mnemonics.join(" "));

// Store securely
await SecureStore.setItemAsync("identus.mnemonics", JSON.stringify(mnemonics));
```

### Recover a wallet from mnemonic

```ts
const apollo = new SDK.Apollo();
const mnemonics = userInput.trim().split(/\s+/); // 24 words
const seed = apollo.createSeed(mnemonics);
const { agent } = await initAgent(seed);
```

### Export credentials to JSON

```ts
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const credentials = await pluto.getAllCredentials();
const backup = JSON.stringify({
  version: "1.0",
  exportedAt: new Date().toISOString(),
  credentials: credentials.map((c) => ({
    id: c.id,
    type: c.credentialType,
    issuer: c.issuer,
    claims: c.claims,
  })),
}, null, 2);

const uri = FileSystem.cacheDirectory + "identus-backup.json";
await FileSystem.writeAsStringAsync(uri, backup);
await Sharing.shareAsync(uri, { mimeType: "application/json" });
```

---

### Export a full encrypted wallet backup (recommended secondary backup)

Use the agent backup API to generate a compressed JWE that contains wallet
metadata, stored credentials, DIDs, and key material in encrypted form:

```ts
const backupJwe = await agent.backup.createJWE({
  compress: true,
  excludes: ["messages"],
});
```

After the mnemonic has been restored on a new device, rehydrate the rest of the
wallet state:

```ts
await agent.backup.restore(backupJwe, { compress: true });
```

This backup is more complete than the credential-only JSON export and is the
recommended path for device-to-device migration. Treat the JWE as sensitive
material and store it in an encrypted location.

---

## 10. Service adoption profile

The following service profile keeps the wallet integration simple for React and
React Native teams while covering the core holder use cases:

| Service | Required | Role in wallet | Integration notes |
| --------- | ---------- | ---------------- | ------------------- |
| Identus Mediator | Yes | Receives DIDComm traffic while the device is offline | Configure once through `EXPO_PUBLIC_MEDIATOR_DID`; use the Trust0 public mediator for development and a dedicated mediator for production |
| Identus Cloud Agent | Yes | Issues credentials and requests presentations | Wallet usually interacts through OOB QR links and DIDComm, not direct admin APIs |
| Universal Resolver | Recommended | Resolves external DID methods | Configure `EXPO_PUBLIC_RESOLVER_URL`; use for mixed-method ecosystems and verifier interoperability |
| PRISM VDR driver | Recommended | Resolves PRISM DIDs with stronger verifiability | Pair with the Universal Resolver or use directly in PRISM-centric deployments |
| VDR / Cardano publishing service | Optional | Anchors PRISM DIDs on-chain | For mobile wallets, prefer a backend signing service or pre-signed transactions because browser wallet APIs are unavailable |

Recommended adoption order:

1. Start with mediator plus Cloud Agent to unblock setup, credential receipt, and presentation flows.
2. Add Universal Resolver and PRISM VDR driver when the wallet needs richer DID resolution across environments.
3. Add a dedicated VDR publishing service only if the wallet must support anchored PRISM DID publication.

---

## 11. Testing phases

Use these phases before calling the integration production-ready:

| Phase | Goal | Exit criteria |
| ------ | ------ | --------------- |
| Phase 1 - Static validation | Catch compile and dependency issues early | `tsc --noEmit` passes; Metro config resolves Node polyfills; app boots on iOS and Android |
| Phase 2 - Wallet lifecycle | Verify setup and recovery basics | Create wallet, reveal mnemonic, restart app, recover from mnemonic, reset wallet |
| Phase 3 - DID operations | Validate holder DID behavior | Create PRISM DID, create Peer DID during OOB flow, resolve DIDs through configured resolver |
| Phase 4 - Credential issuance | Prove issuer-to-holder interoperability | Scan OOB QR, send credential request, receive `DidcommIssueCredential`, persist and render credential |
| Phase 5 - Presentation exchange | Prove verifier interoperability | Receive `RequestPresentation`, create presentation, selectively disclose SD-JWT claims, verifier accepts proof |
| Phase 6 - Backup and migration | Validate disaster recovery | Export credentials JSON, export encrypted JWE backup, recover mnemonic on a second install, restore JWE, confirm credentials reappear |
| Phase 7 - Infrastructure resilience | Validate real-world network behavior | Mediator reconnects after offline period, duplicate scans are ignored, malformed OOB payloads fail safely |
| Phase 8 - Security and release hardening | Validate production readiness | Secure storage review complete, logs do not expose secrets, backup artifacts handled as sensitive data, mobile QA sign-off complete |

---

## 12. Known limitations

| Limitation | Status | Workaround |
| ------------ | -------- | ------------ |
| Apollo WebAssembly | WASM not supported in Hermes | `react-native-quick-crypto` replaces the Web Crypto path |
| Cardano on-chain DID publishing | Requires browser wallet (Lace/Nami) | Use a server-side signing service or pre-signed transaction |
| `StorageType.IndexDB` | Browser-only | Use `StorageType.InMemory` or the SQLite adapter |
| VDR (Verifiable Data Registry) | HTTP calls only | Works in React Native — configure `EXPO_PUBLIC_RESOLVER_URL` |
| SDK-Swift integration | Separate native SDK | See [identus-edge-agent-sdk-swift](https://github.com/hyperledger/identus-edge-agent-sdk-swift) |

---

## 13. Component version references

| Component | Repository | Version tested |
| ----------- | ------------ | ---------------- |
| Edge Agent SDK (TS) | [identus-edge-agent-sdk-ts](https://github.com/hyperledger/identus-edge-agent-sdk-ts) | 7.0.0-rc.12 |
| Apollo | [identus-apollo](https://github.com/hyperledger/identus-apollo) | 1.6.0 |
| Cloud Agent | [identus-cloud-agent](https://github.com/hyperledger/identus-cloud-agent) | latest |
| Mediator | [identus-mediator](https://github.com/hyperledger/identus-mediator) | latest |
| VDR | [vdr](https://github.com/hyperledger-identus/vdr) | latest |
| PRISM VDR driver | [prism-vdr-driver](https://github.com/hyperledger-identus/prism-vdr-driver) | latest |
| Expo | [expo.dev](https://expo.dev) | 52 |
| React Native | — | 0.76.5 |
