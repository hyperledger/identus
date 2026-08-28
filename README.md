# Hyperledger Identus

Hyperledger Identus is a comprehensive toolset for building decentralized identity solutions. It operates as a layer‑2 blockchain solution that uses a distributed ledger as a verifiable data registry (VDR). With Identus you can create and manage decentralized identifiers (DIDs), issue and revoke verifiable credentials and build systems based on the principles of self‑sovereign identity (SSI).

The documentation portal at [hyperledger-identus.github.io/docs](https://hyperledger-identus.github.io/docs/) provides detailed guides and explanations. It covers identity concepts, how the Identus components work together and a Quick Start Guide for trying the software.

## Repository layout

This repository aggregates assets and information used across the Identus project:

- **identus-docker** – Docker Compose configuration for running the Cloud Agent, Mediator and their dependencies. See [dockerize-identus.md](identus-docker/dockerize-identus.md).
- **resources** – Logos and documents such as the Identus Technical Charter.
- **docs** – Project-related documentation, including [`did:prism` compliance status](docs/did-prism-compliance.md).
- **workshops** – Example applications demonstrating how to build with the Identus SDKs.

Project policies are documented in [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), [`CONTRIBUTING.md`](CONTRIBUTING.md), [`DCO.md`](DCO.md) and [`SECURITY.md`](SECURITY.md).

## Quick start

If you want to try Identus locally the easiest way is to use Docker Compose. Follow the steps in [`identus-docker/dockerize-identus.md`](identus-docker/dockerize-identus.md) and then explore the [Quick Start Guide](https://hyperledger-identus.github.io/docs/home/quick-start/) on the documentation site.

## Use Cases

To see concrete examples of how Hyperledger Identus is used in the real world, check out our [Use-Cases Documentation](docs/use-cases.md).

## Other Identus repositories

Identus consists of several core components, each hosted in its own repository:

- [Cloud Agent](https://github.com/hyperledger/identus-cloud-agent)
- [Mediator](https://github.com/hyperledger/identus-mediator)
- Edge Agent SDKs:
  - [TypeScript](https://github.com/hyperledger/identus-edge-agent-sdk-ts)
  - [Kotlin Multiplatform](https://github.com/hyperledger/identus-edge-agent-sdk-kmp)
  - [Swift](https://github.com/hyperledger/identus-edge-agent-sdk-swift)
- [Apollo cryptographic library](https://github.com/hyperledger/identus-apollo)
- Verifiable Data Registry (VDR):
  - [VDR system API](https://github.com/hyperledger-identus/vdr)
  - [PRISM VDR](https://github.com/hyperledger-identus/prism-vdr-driver)
- [Documentation source](https://github.com/hyperledger/identus-docs)

For the latest roadmap and planned features see the [Identus project board](https://github.com/orgs/hyperledger-identus/projects/2).

## Adopters

See [ADOPTERS.md](ADOPTERS.md) for a list of organizations and projects using Identus in production or active development.

## Getting help and contributing

We welcome community contributions and participation. Issues and pull requests are tracked in the respective repositories. For chat, join the Identus Discord server, and feel free to subscribe to the [mailing list](https://lists.hyperledger.org/g/identus) or join [community calls](https://lists.hyperledger.org/g/identus/calendar). See [CONTRIBUTING.md](CONTRIBUTING.md) for more details on how to get involved.
