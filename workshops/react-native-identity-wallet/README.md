# React Native Identity Wallet

An Expo-based mobile holder wallet for Hyperledger Identus. This workshop demonstrates
wallet setup, mnemonic recovery, DID creation, credential acceptance, and encrypted
backup/restore in a React Native app.

## Current runtime profile

- Expo SDK 52
- React Native 0.76
- `@hyperledger/identus-sdk` `7.0.0-rc.12`
- Expo Go compatible bootstrap with React Native polyfills and Apollo fallbacks
- AsyncStorage-backed Pluto persistence (disable with `EXPO_PUBLIC_PERSISTENT_STORAGE=false`)

## What works in this workshop

- Create a wallet from a fresh 24-word mnemonic
- Recover a wallet from an existing 24-word mnemonic
- Export an encrypted wallet backup JWE
- Restore an encrypted wallet backup JWE
- Create PRISM DIDs
- Scan credential offers and store credentials when mediator connectivity is available

## Storage

By default, Pluto wallet data (credentials, DIDs, mediator state) persists in
`AsyncStorage`. The BIP39 mnemonic is stored separately in `expo-secure-store`.

Set `EXPO_PUBLIC_PERSISTENT_STORAGE=false` to revert to in-memory storage for
quick demos where data loss on restart is acceptable.

## Run the project

```bash
cd workshops/react-native-identity-wallet
npm install
cp .env.example .env
npx expo start --android
```

If Metro has stale cache data, use:

```bash
npx expo start --clear --android
```

## Environment variables

```env
EXPO_PUBLIC_MEDIATOR_DID=did:peer:...
# Optional
# EXPO_PUBLIC_CLOUD_AGENT_URL=http://localhost:8085
# EXPO_PUBLIC_RESOLVER_URL=https://dev.uniresolver.io
```

The default `.env.example` uses the Trust0 public mediator for workshop flows.

## Architecture notes

- `src/polyfills.native.ts` loads the React Native runtime shims before the app boots.
- `src/crypto-shim.js` provides the `crypto` compatibility layer used by Expo Go.
- `src/agent/index.ts` creates the SDK agent and tolerates mediator startup failures.
- `src/storage/AsyncStoragePlutoStore.ts` persists Pluto data across restarts.
- `src/agent/resolvers.ts` wires Cloud Agent or Universal Resolver for PRISM DID resolution.
- `src/context/AgentContext.tsx` owns wallet initialization, recovery, and runtime state.

## Recommended testing flow

1. Create a fresh wallet and confirm the recovery phrase screen appears.
2. Enter the app and verify the wallet screen loads even if the agent shows disconnected.
3. Create a new DID from the wallet tab.
4. Export an encrypted backup from settings.
5. Reset the wallet, recover from the mnemonic, and restore the encrypted backup.
6. Scan a credential offer and confirm it appears in the credentials tab.
7. When a verifier sends a presentation request, respond from the banner on the wallet tab.

## Troubleshooting

- `Property 'WebAssembly' doesn't exist`
  The app should now stub this safely in Expo Go. Restart Metro with `--clear`.

- `Dynamic require defined ... not supported by Metro`
  This was caused by Apollo's generated crypto access. Reinstalling dependencies may
  overwrite local vendor patches, so rerun the workshop with the checked-in workspace state.

- Wallet creates but agent shows disconnected
  The wallet is usable offline. DIDComm messaging needs mediator connectivity.

- `expo run:android` fails with NDK errors
  That is a local Android toolchain issue, separate from the workshop app code.

## Production follow-up

For production hardening, consider `react-native-quick-crypto`, biometric protection for
mnemonic access, and migrating to the official `@trust0/ridb` React Native adapter when
available. Keep Metro/crypto shims in a durable patch workflow so dependency reinstalls
do not discard them.
