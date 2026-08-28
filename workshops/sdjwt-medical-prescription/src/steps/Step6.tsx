'use client'

import { InteractiveProps } from "@/reducers/app"


export default
    {
        title: 'Step 6: Workshop wrap up and sample code',
        description:
            `You've just completed the workshop. Here's the full code in case you need, you can copy and run locally.`,
        content: [
            (props: InteractiveProps) => (
                <>
                    <p className="text-1xl font-semibold mt-6 text-blue-700">
                        Workshop Summary
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        <i><strong>Alice</strong> (Holder Patient)</i> went to the <i><strong>Doctor</strong> (Issuer)</i> to get her medicine prescription.<br />
                        <i><strong>Alice</strong> (Holder Patient)</i> then goes to the <i><strong>Pharmacy</strong> (Verifier)</i> to get the medicine using the Prescription.

                    </p>
                    <div className="my-6">
                        <p className="text-1xl font-semibold text-blue-700">
                            Additional information
                        </p>
                        <ul>
                            <li className="text-gray-600">

                                Cloud agent <a href="https://github.com/hyperledger/identus-cloud-agent"><strong>[repository]</strong></a>
                                <br />
                            </li>
                            <li className="text-gray-600">

                                Mediator <a href="https://github.com/hyperledger/identus-mediator"><strong>[repository]</strong></a>
                                <br />
                            </li>
                            <li className="text-gray-600">

                                Wallet SDK <a href="https://github.com/hyperledger/identus-edge-agent-sdk-ts"><strong>[repository]</strong></a>
                                <br />
                            </li>
                        </ul>
                    </div>
                </>
            ),
            (props: InteractiveProps) => (
                <>
                    <div className="my-2 mt-4">
                        <p className="text-1xl font-semibold text-blue-700">
                            Complete code
                        </p>

                    </div>
                </>
            ),
            {
                code: `/// <reference types="@hyperledger/identus-edge-agent-sdk" />
//Add this packages on top
import SDK from "@hyperledger/identus-edge-agent-sdk";
import {
    sha512
} from '@noble/hashes/sha512'
import InMemory from '@pluto-encrypted/inmemory'
class ShortFormDIDResolverSample {
    method = "prism";

    async resolve(didString) {
        const url = "http://localhost:8000/cloud-agent/dids/" + didString;
        const response = await fetch(url, {
            method: "GET",
            mode: "cors",
            credentials: "omit"
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        const didDocument = data.didDocument;

        const servicesProperty = new SDK.Domain.Services(didDocument.service);
        const verificationMethodsProperty = new SDK.Domain.VerificationMethods(didDocument.verificationMethod);
        const coreProperties = [];
        const authenticate = [];
        const assertion = [];

        for (const verificationMethod of didDocument.verificationMethod) {
            const isAssertion = didDocument.assertionMethod.find(method => method === verificationMethod.id);
            if (isAssertion) {
                assertion.push(new SDK.Domain.AssertionMethod([isAssertion], [verificationMethod]));
            }
            const isAuthentication = didDocument.authentication.find(method => method === verificationMethod.id);
            if (isAuthentication) {
                authenticate.push(new SDK.Domain.Authentication([isAuthentication], [verificationMethod]));
            }
        }

        coreProperties.push(...authenticate);
        coreProperties.push(servicesProperty);
        coreProperties.push(verificationMethodsProperty);

        const resolved = new SDK.Domain.DIDDocument(
            SDK.Domain.DID.fromString(didString),
            coreProperties
        );

        return resolved;
    }
}

async function verifyCondition(callback) {
    try {
        const start = Date.now()
        await new Promise(async (resolve, reject) => {
            const interval = setInterval(async () => {
                let result = await callback()
                if (result) {
                    clearInterval(interval)
                    resolve("")
                }
                if (Date.now() - start > 60 * 1000) {
                    reject("timeout")
                }
            }, 1000)
        })
        return true
    } catch (e) {
        return false
    }
}

(async () => {
    const registerPrismDid = await fetch(\`http://localhost:3000/cloud-agent/did-registrar/dids\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "documentTemplate": {
                "publicKeys": [
                    {
                        "id": "auth1",
                        "purpose": "authentication",
                        "curve": "Ed25519"
                    },
                    {
                        "id": "issue1",
                        "purpose": "assertionMethod",
                        "curve": "Ed25519"
                    }
                ],
                "services": []
            }
        })
    });
    const prismDidResponse = await registerPrismDid.json();
    console.log('Prism DID created:', { longFormDid: prismDidResponse.longFormDid });

    const publishPrismDid = await fetch(\`http://localhost:3000/cloud-agent/did-registrar/dids/\${prismDidResponse.longFormDid}/publications\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    const publishResponse = await publishPrismDid.json();
    console.log('DID Published:', { operation: publishResponse.scheduledOperation });

    const createCredentialSchema = await fetch("http://localhost:3000/cloud-agent/schema-registry/schemas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "name": "medical-prescription-schema-2b754046-32c6-42e0-b587-b28013422778",
            "version": "2.0.0",
            "description": "Medical Prescription Schema",
            "type": "https://w3c-ccg.github.io/vc-json-schemas/schema/2.0/schema.json",
            "author": \`\${publishResponse.scheduledOperation?.didRef}\`,
            "tags": [
                "driving",
                "license"
            ],
            "schema": {
                "$id": "https://example.com/medical-prescription-1.0.0",
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "description": "Medical Prescription ",
                "type": "object",
                "properties": {
                    "patientId": {
                        "type": "string",
                    },
                    "patientName": {
                        "type": "string"
                    },
                    "patientFamilyName": {
                        "type": "string"
                    },
                    "prescriptionId": {
                        "type": "string"
                    },
                    "dateOfIssuance": {
                        "type": "string",
                        "format": "date-time"
                    }
                },
                "required": [
                    "patientId",
                    "patientName",
                    "patientFamilyName",
                    "prescriptionId",
                    "dateOfIssuance"
                ],
                "additionalProperties": false
            }
        })
    });
    const schemaResponse = await createCredentialSchema.json();
    console.log('Schema Created:', { schemaId: schemaResponse.id });

    const getMediatorDid = await fetch("http://localhost:8080/did", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const mediatorDID = SDK.Domain.DID.fromString(await getMediatorDid.text());
    console.log('Mediator DID:', {
        did: mediatorDID
    });

    const hashedPassword = sha512("123456")
    const apollo = new SDK.Apollo();
    const store = new SDK.Store({
        name: "test",
        storage: InMemory,
        password: Buffer.from(hashedPassword).toString("hex")
    });
    const defaultSeed = apollo.createRandomSeed().seed // Random or custom seed u want to create
    const extraResolvers = [
        ShortFormDIDResolverSample
    ];
    const castor = new SDK.Castor(apollo, extraResolvers)
    const agent = await SDK.Agent.initialize({
        apollo,
        castor,
        mediatorDID,
        pluto: new SDK.Pluto(store, apollo),
        seed: defaultSeed
    });

    let credential;
    let presentationId;
    agent.addListener(SDK.ListenerKey.MESSAGE, async (messages) => {
        for (const message of messages) {
            if (message instanceof SDK.Domain.Message) {
                if (message.piuri === SDK.ProtocolType.DidcommOfferCredential) {
                    /**
                     * DIDComm Offer Credential Message
                     * Specification: https://didcomm.org/issue-credential/3.0/offer-credential
                     * Description: The credential offer contains a preview of the SDJWT credential and would inform
                     * you on what fields your credential will have.
                     * Offers must be manually accepted, and this is done by creating a Credential Request and sending it to the Cloud Agent
                     */
                    console.log('Credential Offer:', message);
                    const credentialOffer = SDK.OfferCredential.fromMessage(message);
                    const requestCredential = await agent.prepareRequestCredentialWithIssuer(credentialOffer);
                    const requestMessage = requestCredential.makeMessage()
                    await agent.sendMessage(requestMessage);
                } else if (message.piuri === SDK.ProtocolType.DidcommIssueCredential) {
                    /**
                     * DIDComm Issue Credential Message
                     * Specification: https://didcomm.org/issue-credential/3.0/issue-credential
                     * Description: This is the Issued Credential which gets stored inside the Identus Storage for later use.
                     */
                    console.log('Credential Issue:', message);
                    const attachment = message.attachments.at(0)
                    if (attachment) {
                        const encodedCompactSDJWT = attachment.payload;
                        credential = SDK.SDJWTCredential.fromJWS(encodedCompactSDJWT);
                        const getPresentationRequest = await fetch("http://localhost:3000/cloud-agent/present-proof/presentations/invitation", {
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
                        const presentationRequestResponse = await getPresentationRequest.json();
                        presentationId = presentationRequestResponse.presentationId;
                        const parsed = await agent.parseOOBInvitation(new URL(presentationRequestResponse.invitation?.invitationUrl));
                        await agent.acceptInvitation(parsed, 'SamplePresentationRequestOOB');
                    }
                } else if (message.piuri === SDK.ProtocolType.DidcommRequestPresentation) {
                    /**
                     * DIDComm Request Presentation Message
                     * Specification: https://didcomm.org/present-proof/3.0/request-presentation
                     * Description: A presentation request message is sent by the Verifier and requests the holder a Credential Presentation
                     * for specific claims
                     */
                    console.log('Presentation Request:', message);
                    const requestPresentation = SDK.RequestPresentation.fromMessage(message);
                    const presentation = await agent.createPresentationForRequestProof(requestPresentation, credential);
                    await agent.sendMessage(presentation.makeMessage());
                    const verificationResult = await verifyCondition(async () => {
                        const verifyPresentation = await fetch(\`http://localhost:3000/cloud-agent/present-proof/presentations/\${presentationId}\`, {
                            method: "GET",
                            headers: { "Content-Type": "application/json" }
                        });
                        const verificationResponse = await verifyPresentation.json();
                        console.log('Verification Check:', verificationResponse.status)
                        return verificationResponse.status === "PresentationVerified"
                    })
                    console.log('Verification Result:', { isValid: verificationResult });
                }
            }
        }
    });

    await agent.start()

    const getCredentialOffer = await fetch("http://localhost:3000/cloud-agent/issue-credentials/credential-offers/invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "goalCode": "issue-vc",
            "goal": "To Issue a Medical Prescription Credential",
            "issuingDID": publishResponse.scheduledOperation?.didRef,
            "validityPeriod": 3600,
            "automaticIssuance": true,
            "credentialFormat": "SDJWT",
            "claims": {
                "patientId": "#d4aab32e1",
                "patientName": "Alice",
                "patientFamilyName": "Wonderland",
                "prescriptionId": "42344211134",
                "dateOfBirth": "2020-11-13T20:20:39+00:00"
            }
        })
    });
    const credentialOfferResponse = await getCredentialOffer.json();
    console.log('Credential Offer:', { invitationUrl: credentialOfferResponse.invitation.invitationUrl });
    const parsed = await agent.parseOOBInvitation(new URL(credentialOfferResponse.invitation.invitationUrl));
    await agent.acceptInvitation(parsed, 'SampleCredentialOfferOOB');
})()`,
                language: 'typescript'
            }

        ],

    }
