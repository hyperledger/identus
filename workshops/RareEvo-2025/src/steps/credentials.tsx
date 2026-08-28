
import { Step } from "@/types";
import React from "react";
import { useCredentials } from "@trust0/identus-react/hooks";
import { CompactCredentials } from "@/components/core/CompactCredentials";
import dynamic from "next/dynamic";

const Flowchart = dynamic(() => import("@/components/core/Flowchart"), { ssr: false });

const step: Step = {
    type: 'holder',
    title: 'Receive & Store Credential',
    description: 'Complete the credential issuance flow from the holder perspective. Automatically receive the issued SD-JWT credential, validate its authenticity, and store it securely in the holder\'s digital wallet.',
    codeSample: {
        language: 'typescript',
        code: `// Step 5: Receiving and Storing Credentials (Holder Side)

const extractCredential = async (agent, message) => {
    const protocol = new SDK.Tasks.RunProtocol({
        type: 'credential-issue',
        pid: SDK.ProtocolType.DidcommIssueCredential,
        data: { message }
    });
    const credential = await agent.runTask(protocol);
    return credential;
};

// Complete credential issuance flow from previous steps:
// Set up promises to wait for messages
const credentialRequestPromise = waitForMessage(issuer, SDK.ProtocolType.DidcommRequestCredential);
const credentialIssuedPromise = waitForMessage(holder, SDK.ProtocolType.DidcommIssueCredential);

// Holder accepts the credential offer
await acceptCredentialOffer(holder, oobOfferJson);

// Issuer processes the request and issues the credential
const credentialRequestMessage = await credentialRequestPromise;
await issueCredential(issuer, credentialRequestMessage, issuanceRequest.claims, issuerDID, holderDID);

// Holder receives and stores the credential
const credentialMessage = await credentialIssuedPromise;
const credential = await extractCredential(holder, credentialMessage);`
    },
    content() {
        const { credentials } = useCredentials();
        return (
            <div>
                <Flowchart stepType="credentials" />
                <CompactCredentials credentials={credentials} />
            </div>
        );
    }
}

export default step;
