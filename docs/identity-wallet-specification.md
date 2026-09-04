# Identity Wallet — Use Case Specification

This document defines the use-case requirements and flows for a
self-sovereign identity (SSI) wallet built on Hyperledger Identus. It covers
the holder side of the trust triangle and targets both mobile (React Native /
Expo) and web (Next.js / React) implementations.

---

## Table of contents

1. [Scope](#1-scope)
2. [Actors](#2-actors)
3. [Wallet setup](#3-wallet-setup)
4. [DID management](#4-did-management)
5. [Credential acceptance](#5-credential-acceptance)
6. [Credential presentation](#6-credential-presentation)
7. [Backup](#7-backup)
8. [Recovery](#8-recovery)
9. [Security considerations](#9-security-considerations)
10. [Infrastructure](#10-infrastructure)

---

## 1. Scope

The identity wallet is a **holder application**. It allows a user to:

- Create and manage decentralized identifiers (DIDs)
- Receive and store verifiable credentials (VCs)
- Present credentials to verifiers (selective disclosure for SD-JWT)
- Back up and restore the wallet

The wallet does **not** issue credentials (that is the Cloud Agent's
responsibility) and does **not** perform on-chain DID publishing on behalf of
the user without explicit consent.

Supported credential formats:

| Format | Description |
| -------- | ------------- |
| JWT-VC | JSON Web Token–based verifiable credential (W3C VC Data Model) |
| SD-JWT-VC | Selective-Disclosure JWT — allows partial attribute disclosure |
| AnonCreds | Hyperledger AnonCreds format (ZKP-based) |

---

## 2. Actors

| Actor | Description |
| ------- | ------------- |
| **Holder** | The user of the identity wallet |
| **Issuer** | An organisation that issues credentials (Cloud Agent) |
| **Verifier** | An organisation that requests credential presentations |
| **Mediator** | A relay service that buffers DIDComm messages for offline devices |

---

## 3. Wallet setup

### UC-01 — Create new wallet

**Goal:** A first-time user creates a wallet and receives a backup phrase.

**Precondition:** The app is freshly installed; no wallet data exists.

**Steps:**

1. User opens the app and selects **Create New Wallet**
2. App displays a warning: the mnemonic phrase is the only recovery mechanism
3. User acknowledges and proceeds
4. App calls `apollo.createRandomSeed()` → receives `{ seed, mnemonics }`
5. App displays the 24 BIP39 mnemonic words to the user
6. User confirms they have written down the phrase
7. App stores the mnemonic in the device keychain (`expo-secure-store` / iOS Keychain / Android Keystore)
8. App initialises the Identus agent with the new seed
9. App redirects to the wallet dashboard

**Post-condition:** Agent is running; mnemonic is stored securely.

```ts
const apollo = new SDK.Apollo();
const { seed, mnemonics } = apollo.createRandomSeed();

await SecureStore.setItemAsync("identus.mnemonics", JSON.stringify(mnemonics));

const agent = await SDK.Agent.initialize({ apollo, pluto, castor, mediatorDID, seed });
await agent.start();
```

---

### UC-02 — Restore wallet from mnemonic

**Goal:** A user who has previously backed up their wallet restores it on a new device.

**Steps:**

1. User selects **Restore from Phrase**
2. User enters the 24 mnemonic words
3. App validates: exactly 24 words, all in the BIP39 word list
4. App calls `apollo.createSeed(mnemonics)` to reconstruct the seed
5. App starts the agent with the recovered seed
6. App re-derives PRISM DIDs (derived deterministically from the seed)
7. App redirects to the wallet dashboard

**Post-condition:** Agent is running with the same key material as before.

**Note:** Credentials stored only locally (not anchored on a ledger) are not
automatically recoverable from the seed. See [UC-07](#uc-07--export-credential-backup).

```ts
const mnemonics = userInput.trim().split(/\s+/);
if (mnemonics.length !== 24) throw new Error("Invalid phrase length");

const seed = apollo.createSeed(mnemonics);
const agent = await SDK.Agent.initialize({ apollo, pluto, castor, mediatorDID, seed });
await agent.start();
```

---

## 4. DID management

### UC-03 — Create a PRISM DID

**Goal:** The holder creates a new PRISM DID for identification.

**Steps:**

1. User taps **New DID** (or app creates one automatically during setup)
2. App runs `SDK.Tasks.CreatePrismDID` via `agent.runTask()`
3. DID is stored in Pluto and displayed to the user

```ts
const task = new SDK.Tasks.CreatePrismDID({
  authenticationKeyCurve: SDK.Domain.Curve.SECP256K1,
  services: [],
  alias: "primary",
});
const did = await agent.runTask(task);
```

**Optional — publish on Cardano:**

Short-form DIDs (`did:prism:<hash>`) are resolvable without on-chain
publication. Publishing converts the DID to a long-form anchored DID and
provides stronger verifiability. This step requires a funded Cardano wallet
(Lace, Nami, or similar) and is handled in the
[RareEvo-2025 web workshop](../workshops/RareEvo-2025).

---

### UC-04 — Resolve a DID

**Goal:** Verify that a DID exists and retrieve its DID Document.

```ts
const document = await agent.castor.resolveDID("did:prism:…");
// document.verificationMethods contains public keys
// document.services contains DIDComm endpoints
```

---

## 5. Credential acceptance

### UC-05 — Accept an OOB credential offer

**Goal:** The holder receives a verifiable credential from an issuer via an
Out-of-Band (OOB) QR code.

**Precondition:** The agent is running. The issuer has created an OOB offer
using `SDK.Tasks.CreateOOBOffer`.

**Steps:**

1. Issuer displays the OOB offer as a QR code
   - Format A: raw OOB JSON string
   - Format B: URL with `?oob=<base64-encoded-json>` parameter
2. Holder opens the wallet and navigates to **Scan QR**
3. App decodes the QR code
4. App parses the OOB message:

   ```ts
   // Decode if URL format
   const url = new URL(data);
   const oobParam = url.searchParams.get("oob");
   const oobJson = oobParam
     ? Buffer.from(oobParam, "base64").toString()
     : data;

   // Parse the OOB offer
   const message = SDK.Domain.Message.fromJson(oobJson);
   const attachment = message.attachments.at(0)?.payload;
   ```

5. App creates a new Peer DID for this interaction:

   ```ts
   const peerDID = await agent.createNewPeerDID();
   ```

6. App sends a credential request to the issuer:

   ```ts
   const credentialOffer = SDK.Domain.Message.fromJson({
     ...attachment,
     from: message.from,
     to: peerDID,
   });
   const offerMessage = SDK.OfferCredential.fromMessage(credentialOffer);
   const request = await agent.handle(offerMessage.makeMessage());
   await agent.send(request.makeMessage());
   ```

7. Issuer processes the request and sends back a `DidcommIssueCredential` message
8. App receives the credential via the message listener:

   ```ts
   agent.addListener(SDK.ListenerKey.MESSAGE, async (messages) => {
     for (const msg of messages) {
       if (msg.piuri === SDK.ProtocolType.DidcommIssueCredential) {
         await agent.handle(msg); // stores in Pluto
       }
     }
   });
   ```

9. Credential appears in the wallet's credential list

---

## 6. Credential presentation

### UC-06 — Present a credential to a verifier

**Goal:** The holder responds to a presentation request by sharing selected
claims from a stored credential.

**Steps:**

1. Verifier sends a `RequestPresentation` message (via DIDComm or OOB)
2. App receives the request and parses it:

   ```ts
   const requestPresentation = SDK.RequestPresentation.fromMessage(requestMessage);
   ```

3. App displays the requested claims to the user
4. User selects which credential to use (if multiple match)
5. For SD-JWT: user optionally selects which claims to disclose
6. App creates the presentation:

   ```ts
   const task = new SDK.Tasks.CreatePresentation({
     request: requestPresentation,
     credential: selectedCredential,
     disclosedClaims: { givenName: true, familyName: true }, // SD-JWT only
   });
   const presentation = await agent.runTask(task);
   ```

7. App sends the presentation to the verifier:

   ```ts
   await agent.send(presentation.makeMessage());
   ```

8. Verifier validates the presentation and responds

---

## 7. Backup

### UC-07 — Export credential backup

**Goal:** The holder exports all stored credentials to a portable JSON file.

**Steps:**

1. User navigates to **Settings → Export Credentials**
2. App fetches all credentials from Pluto
3. App serialises credentials to JSON
4. App opens the platform share sheet, allowing the user to save the file to
   iCloud Drive, Google Drive, email, etc.

```ts
const credentials = await pluto.getAllCredentials();
const backup = {
  version: "1.0",
  exportedAt: new Date().toISOString(),
  credentials: credentials.map((c) => ({
    id: c.id,
    type: c.credentialType,
    issuer: c.issuer,
    claims: c.claims,
  })),
};
```

**Scope:** Credential export does **not** include private keys. Private keys
are always derived from the mnemonic and never leave the device.

---

### UC-08 — Export encrypted wallet backup

**Goal:** The holder exports a full encrypted wallet backup for device-to-device
migration.

**Steps:**

1. User navigates to **Settings -> Export Encrypted Backup**
2. App calls `agent.backup.createJWE({ compress: true, excludes: ["messages"] })`
3. App shares the resulting JWE file and copies the JWE text to the clipboard
4. User stores the JWE in an encrypted location

**Scope:** This backup supplements the mnemonic by restoring local credentials,
DID metadata, mediators, and wallet state that are not recovered from the seed
alone.

---

### UC-09 — View recovery phrase

**Goal:** The holder retrieves their backup mnemonic phrase (e.g., to write it
down after the initial setup screen).

**Steps:**

1. User navigates to **Settings → View Recovery Phrase**
2. App reads the mnemonic from the device keychain
3. App displays the 24 words with a warning not to share them

---

## 8. Recovery

### UC-10 — Restore from mnemonic + encrypted backup

**Goal:** Fully restore a wallet after device loss.

**Steps:**

1. User installs the app on a new device
2. User selects **Restore from Phrase** and enters the 24 words
3. App reconstructs the seed and re-derives all PRISM DIDs
4. *(Optional)* User pastes or imports the encrypted backup JWE:
   - App calls `agent.backup.restore(backupJwe, { compress: true })`
   - App rehydrates local credentials, DIDs, and mediator state into Pluto
5. Wallet is fully restored

**Limitation:** Without the encrypted backup JWE, only seed-derived wallet data
is restored automatically. Credentials can still be imported from the simpler
credential export JSON, but that requires an additional app-specific import
flow.

---

## 9. Security considerations

| Concern | Mitigation |
| --------- | ------------ |
| Mnemonic storage | Device keychain only (iOS Keychain / Android Keystore); never in plaintext on disk |
| Private key exposure | Keys are derived in-memory from the seed; not serialised to storage |
| Screen capture | Consider `FLAG_SECURE` (Android) / `.privacySensitive()` (iOS) on mnemonic display screens |
| Biometric lock | Wrap keychain access with biometric prompt (`expo-local-authentication`) for added security |
| Mediator trust | Use only mediators you control or trust; the mediator sees encrypted DIDComm envelopes but not the content |
| Backup file security | Credential backup JSON should be stored in an encrypted location (iCloud E2EE, Google Drive with encryption); it does not contain keys but does contain credential data |
| Revocation checking | Before presenting a credential, optionally check its revocation status against the issuer's Cloud Agent |

---

## 10. Infrastructure

### Minimum deployment

| Service | Purpose | Reference |
| --------- | --------- | ----------- |
| Identus Cloud Agent | Issues and verifies credentials | [identus-cloud-agent](https://github.com/hyperledger/identus-cloud-agent) |
| Identus Mediator | DIDComm message relay for offline devices | [identus-mediator](https://github.com/hyperledger/identus-mediator) |
| Trust0 public mediator | Public mediator for development | `mediator.trust0.id` |

### Optional services

| Service | Purpose | Reference |
| --------- | --------- | ----------- |
| Universal Resolver | Cross-method DID resolution | [uniresolver.io](https://uniresolver.io) |
| PRISM VDR driver | PRISM-specific DID resolution | [prism-vdr-driver](https://github.com/hyperledger-identus/prism-vdr-driver) |
| Blockfrost | Cardano blockchain access (DID publishing) | [blockfrost.io](https://blockfrost.io) |

### Local development setup

Start all Identus services locally with Docker Compose:

```bash
cd identus-docker
docker compose up -d
```

This starts:

- Cloud Agent on `http://localhost:8085`
- Mediator on `ws://localhost:8080`
- PostgreSQL (Cloud Agent storage)
- Prometheus + Grafana (metrics)

See [`identus-docker/dockerize-identus.md`](../identus-docker/dockerize-identus.md)
for the full setup guide.
