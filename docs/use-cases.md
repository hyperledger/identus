# Hyperledger Identus Use-Cases

> **Note:** This is an initial set of use-case examples designed to help you quickly understand the real-world value of Hyperledger Identus. More examples will be added over time. For exhaustive technical details, please refer to the [Identus Documentation Portal](https://hyperledger-identus.github.io/docs/).

This document provides simple, concrete use-cases illustrating how Hyperledger Identus can be deployed in real-world scenarios.

## 1. Online Certification Website

### Problem Statement

An educational platform needs a secure, verifiable, and tamper-proof way to issue graduation certificates to students, moving away from easily forged PDF documents.

### High-Level Architecture

1. **Issuer (University/Platform)**: Represents the certification authority running an instance of the **Hyperledger Identus Cloud Agent**.
2. **Holder (Student)**: Uses a digital wallet (built with the **Identus Edge Agent SDK**) to securely receive and hold the certificate.
3. **Verifier (Employer)**: An entity that queries the Verifiable Data Registry (**VDR**) via their own Identus Cloud Agent to verify the credential's authenticity and revocation status.

### Components Involved

* **Frontend LMS**: The school's Learning Management System.
* **Identus Cloud Agent**: Receives REST API calls from the LMS, manages DID interactions, and issues credentials to the student's edge wallet.
* **Digital Wallet**: The student's mobile application to store the Verifiable Credential.

### Step-by-Step Flow

1. **Examination**: The student completes the certification track and passes the final exam on the LMS.
2. **Evaluation**: The LMS marks the student as "Graduated".
3. **DID Connection**: The student scans an LMS-generated QR code to establish a secure DIDComm connection with the university's Cloud Agent.
4. **Issuance Trigger**: The LMS triggers an API call to its Cloud Agent to issue a "Graduation Certificate" Verifiable Credential.
5. **Credential Offer**: The Cloud Agent sends a Credential Offer. The student accepts it in their wallet, saving the credential.
6. **Future Verification**: When applying for a job, the student presents a Verifiable Presentation. The employer uses an Identus verifier application to confirm the credential's validity.

### Minimal Example API Interaction

When the student passes, the backend triggers the issuance using the Cloud Agent API:

```bash
# Example: Issuing a certification credential
curl -X POST "http://localhost:8085/issue-credentials/credential-offers" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "connectionId": "f7ab2c10-...",
    "schemaId": "https://university.edu/schemas/certificate",
    "claims": {
      "studentName": "John Doe",
      "degree": "B.Sc. Computer Science",
      "graduationYear": "2026"
    },
    "automaticIssuance": true
}'
```

---

## Future Potential Use-Cases

* **KYC / Identity Verification**: Banks or fintech platforms issuing reusable KYC credentials.
* **Healthcare Data Access**: Securely storing and presenting medical records or prescription access.
* **Physical & Logical Access Control**: Employee badges and single-sign-on (SSO) credentials using enterprise DIDs.
