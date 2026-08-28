'use client'
import SDK from "@hyperledger/identus-edge-agent-sdk";

import dynamic from "next/dynamic";
import { BASE_URL } from "@/config";
import { InteractiveProps, Store } from "@/reducers/app";
import { Message } from "@/components/Message";


const CodeComponent = dynamic(() => import('@/components/CodeEditor').then((e) => e.CodeComponent), {
    ssr: false,
});


export default
    {
        title: 'Step 5: The Pharmacy (verifier) will ask Alice (patient) to prove his prescription to give her the medicine.',
        description:
            `In this section we will be requesting a Presentation Request from the Cloud Agent. A Connectionless Presentation Request is an Out of Band Invitation with a Presentation Request Attachment.
This should be a URI with a single query parameter \`_oob\`, which is an encoded JSON.`,
        content: [
            {
                title: 'Obtain a Connectionless Presentation request from an Issuer',
                description: `We will be requesting Alice to disclose her PatientId and PrescriptionId and not other fields on her credential`,
                method: 'POST',
                request(store: Store) {
                    return fetch(`${BASE_URL}/present-proof/presentations/invitation`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            "goalCode": "present-vp",
                            "goal": "Request proof of Medical Prescription information",
                            "proofs": [],
                            "claims": {
                                "patientId": {},
                                "prescriptionId": {}
                            },
                            "credentialFormat": "SDJWT",
                            "options": {
                                "challenge": "11c91493-01b3-4c4d-ac36-b336bab5bddf",
                                "domain": "https://prism-verifier.com"
                            }
                        })
                    })
                },
                curlCommand: (store: Store) => `const getPresentationRequest = await fetch("${BASE_URL}/present-proof/presentations/invitation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        "goalCode": "present-vp",
        "goal": "Request proof of Medical Prescription information",
        "proofs": [],
        "claims": {
            "patientId": {},
            "prescriptionId": {}
        },
        "credentialFormat": "SDJWT",
        "options": {
            "challenge": "11c91493-01b3-4c4d-ac36-b336bab5bddf",
            "domain": "https://prism-verifier.com"
        }
    })
});
const presentationRequestResponse = await getPresentationRequest.json();`,
            },
            (props: InteractiveProps) => {
                const agent = props.app.agent.instance;
                if (!props.store.invitation?.invitationUrl || !props.app.agent.instance || !agent) {
                    return null
                }
                return <div className="mt-4">
                    <p className="mt-5 text-1xl font-semibold mb-4 text-blue-700">UI: Accept OOB Presentations</p>
                    <p className="text-gray-600 leading-relaxed">
                        In order to process the out of band Presentation Request, you must run the following code:
                    </p>
                    <CodeComponent content={{
                        language: 'typescript',
                        code: `const parsed = await agent.parseOOBInvitation(new URL(presentationRequestResponse.invitation?.invitationUrl));
await agent.acceptInvitation(parsed, 'SamplePresentationRequestOOB');
                ` }} />
                    <p className="text-gray-600 leading-relaxed">
                        Once the OOB invitation is processed a Presentation Request Message will be emitted and we will receive a call in the event listener we defined earlier:
                    </p>
                    <button
                        disabled={props.loading}
                        className="my-5 inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
                        onClick={async () => {
                            props.setLoading(true)
                            const parsed = await agent.parseOOBInvitation(
                                new URL(props.store.invitation?.invitationUrl)
                            );
                            await agent.acceptInvitation(parsed);
                        }}>
                        {props.loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white mr-2"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                                ></path>
                            </svg>
                        ) : null}
                        {props.loading ? "Processing..." : "Accept OOB Presentation Request"}
                    </button>
                </div>
            },
            (props: InteractiveProps) => {
                const agent = props.app.agent.instance;
                if (!props.store.invitation?.invitationUrl || !agent) {
                    return null
                }
                return <div className="mt-4">
                    <p className="text-gray-600 my-4 leading-relaxed">You can listen for new Presentation Requests in your <i>index.mjs</i> by adding some code into the message event listener we added earlier:</p>
                    <CodeComponent content={{
                        code: `let credential;
let presentationId;
agent.addListener(SDK.ListenerKey.MESSAGE, async (messages) => {
for (const message of messages) {
if (message instanceof SDK.Domain.Message) {
    if (message.piuri === SDK.ProtocolType.DidcommOfferCredential) {
        console.log('Credential Offer:', message);
        const credentialOffer = SDK.OfferCredential.fromMessage(message);
        const requestCredential = await agent.prepareRequestCredentialWithIssuer(credentialOffer);
        const requestMessage = requestCredential.makeMessage()
        await agent.sendMessage(requestMessage);
    } else if (message.piuri === SDK.ProtocolType.DidcommIssueCredential) {
        console.log('Credential Issue:', message);
        const attachment = message.attachments.at(0)
        if (attachment) {
            const encodedCompactSDJWT = attachment.payload;
            credential = SDK.SDJWTCredential.fromJWS(encodedCompactSDJWT);
            const getPresentationRequest = await fetch("http://localhost:3000/cloud-agent/present-proof/presentations/invitation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "goalCode": "present-vp", "goal": "Request proof of prescription information", "proofs": [], "claims": {}, "credentialFormat": "SDJWT", "options": { "challenge": "11c91493-01b3-4c4d-ac36-b336bab5bddf", "domain": "https://prism-verifier.com" } })
            });
            const presentationRequestResponse = await getPresentationRequest.json();
            presentationId = presentationRequestResponse.presentationId;
            const parsed = await agent.parseOOBInvitation(new URL(presentationRequestResponse.invitation?.invitationUrl));
            await agent.acceptInvitation(parsed, 'SamplePresentationRequestOOB');
        }
    } else if (message.piuri === SDK.ProtocolType.DidcommRequestPresentation) {
        console.log('Presentation Request:', message);
        const requestPresentation = SDK.RequestPresentation.fromMessage(message);
        const presentation = await agent.createPresentationForRequestProof(requestPresentation, credential);
        await agent.sendMessage(presentation.makeMessage());
    }
}
}
});`, language: 'typescript'
                    }} />
                </div>
            },
            (props: InteractiveProps) => {
                const agent = props.app.agent.instance;
                const presentations = props.messages.filter((m) => m.piuri === SDK.ProtocolType.DidcommRequestPresentation);

                if (!props.store.invitation?.invitationUrl || !agent) {
                    return null
                }
                return <div className="mt-4">
                    {
                        presentations.map((message, i) => {
                            return <Message key={message.id} message={message} />
                        })
                    }

                    {
                        presentations.length > 0 && <>
                            <p className="text-gray-600 my-4 leading-relaxed">Now you can just verify the Presentation Submission by clicking <>Run in Browser</> and manually checking the response status is <i>"PresentationVerified"</i>.</p>


                        </>
                    }
                </div>
            },
            {
                title: 'Verify the Presentation submission',
                description: 'This will confirm if the SDJWT Presentation submission is valid',
                method: 'GET',

                request(store: Store) {
                    return fetch(`${BASE_URL}/present-proof/presentations/${store.presentationId}`, {
                        method: 'GET',
                        headers: { "Content-Type": "application/json" }
                    })
                },
                curlCommand: (store: Store) => `const verifyPresentation = await fetch(\`${BASE_URL}/present-proof/presentations/\${presentationId}\`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
});
const verificationResponse = await verifyPresentation.json();
console.log('Verification Result:', { isValid: verificationResponse.status === "PresentationVerified" });`,
            },
        ],

    }
