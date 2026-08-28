<p align="center">
  <a href="https://www.hyperledger.org/projects/identus">
    <img src="https://cdn.jsdelivr.net/gh/hyperledger/identus@v2.13/resources/images/hyperledger-identus.svg" alt="identus-logo" width="513px" height="99px" />
  </a>
  <br>
  <i> <font size="18">SDJWT Workshop Typescript</font> </i>
  <br>
</p>
<hr>

# Introduction

This workshop will show you how to Issue and Verify a SD-JWT Credential and Presentation using connectionless flows, meaning, you won't need to establish a didcomm connection between the Issuer, Holder and Verifier.

## What Can I Expect From This Workshop?

You will learn everything that is needed to receive an Issued SD-JWT credential from the Cloud Agent and then use this credential to respond to a Presentation Submission request.

## Setup & Instructions

### 1. Clone and cd into the Workshop directory

```bash
git clone https://github.com/hyperledger-identus/identus
cd workshops/RareEvo-2025
```

### 2. Configure the environment variables

If you want to publish dids onChain in mainnet using any Cardano wallet, you will need 2 specific environment variables:

Optional:

* NEXT_PUBLIC_BLOCKFROST_KEY, create your Blockfrost project on [Blockfrost](https://blockfrost.io/)
* NEXT_PUBLIC_RESOLVER_URL

NEXT_PUBLIC_MEDIATOR_DID is also optional and configured to use the local [Identus mediator](https://github.com/hyperledger/identus-mediator).

So, if you want to publish dids on-chain on this workshop, you will need to configure NEXT_PUBLIC_BLOCKFROST_KEY and NEXT_PUBLIC_RESOLVER_URL.

Create a `.env` file inside the workshop directory and configure the env variables.

### 3. Install and run the workshop

Run from `./workshops/RareEvo-2025`:

```bash
yarn
yarn dev
```

Open <http://localhost:3000> — the workshop will continue the instructions on screen once ready.

## One Click Node.js Demo

```bash
yarn
yarn oneclick
```
