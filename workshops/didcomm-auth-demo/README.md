# DIDComm Auth Flow Demo

This workshop demonstrates a modern, secure authentication flow using DIDComm v2. It bridges the gap between Web2 applications and Web3/SSI identities by using DIDs (Decentralized Identifiers) for authentication.

## Features

- **OOB (Out-of-Band) Bootstrapping**: Uses DIDComm OOB messages to initiate the authentication flow.
- **Protocol Agnostic**: The protocol is designed to be transport-agnostic.
- **Mock Wallet**: Includes a built-in mock wallet to simulate the identity owner's experience.
- **Premium UI**: Modern aesthetics with glassmorphism, animations, and dark mode.

## How it works

1. **Initiate**: The user clicks "Sign in with Wallet" on the WebApp.
2. **Challenge**: The ServerAgent generates a unique session ID and challenge, creating a DIDComm Auth Request encoded in an OOB QR code.
3. **Scan**: The user scans the QR code with their DID Wallet (or uses the provided mock wallet link).
4. **Sign**: The Wallet resolves the challenge, signs it with the user's DID private key, and sends a DIDComm Auth Response back to the ServerAgent's callback URL.
5. **Verify**: The ServerAgent verifies the signature and challenge, updating the session status.
6. **Login**: The WebApp (polling the status) detects the successful authentication and logs the user in.

## Protocol PIURI

- Request: `https://lace.io/auth/1.0/request`
- Response: `https://lace.io/auth/1.0/msg`

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
