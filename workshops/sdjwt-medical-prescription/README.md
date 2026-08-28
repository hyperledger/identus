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

## What Are Connectionless Flows?

In this presentation we won't be using [DIDComm Connections](https://hyperledger.github.io/identus-docs/docs/concepts/multi-tenancy#didcomm-connections) but instead we will generate Out of Band (OOB) codes for Issuance and Verification.

You will then receive and process this OOB in your Edge Agent and run the corresponding flow:

1. Create the Credential Request from the Credential Offer
2. Create the Presentation Submission from the Verification Request

## Components

All documentation on how to deploy each service is inside the workshop just open the project and copy the commands:

1. Cloud Agent
2. Mediator
3. Typescript SDK

# Requirements

1. Docker (Required Update to latest version if you are on Mac)
2. Node LTS (>=20.X)

# Workshop

In order to run this workshop you must run the following commands:

```bash
git clone https://github.com/hyperledger/identus-edge-agent-sdk-ts.git
```

Then, move to the demo directory in ./demos/next-sdjwt-workshop

```bash
cd demos/next-sdjwt-workshop
npm i
npm run dev
```

**This create a site on <http://localhost:3000>, open the link and continue with the on screen instructions to continue the workshop**
