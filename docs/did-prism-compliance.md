# Hyperledger Identus: `did:prism` Compliance Status

This document provides a high-level overview of the `did:prism` DID method support in Hyperledger Identus.

## Compliance

Support for the `did:prism` method is currently **partial**. While it adheres to the basic structure of W3C Decentralized Identifier (DID) Core v1.0, several areas are still in development for full specification alignment. Consistent DID resolution behavior across environments and alignment of lifecycle operations across SDKs are still ongoing.

## Known Limitations

* **Long-form Interoperability:** Resolver behavior for long-form DIDs may vary across different versions and environments.
* **Feature Parity:** Support for full lifecycle operations (update, deactivate) varies across the TypeScript, Swift, and Kotlin SDKs.
