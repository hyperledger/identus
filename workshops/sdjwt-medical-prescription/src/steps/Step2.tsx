'use client'
import { uuid } from "@stablelib/uuid";

import { BASE_URL } from "@/config";
import { ApiCall, Step, Store } from "@/reducers/app";

const step: Step = {
    title: 'Step 2: Configuring the Cloud Agent for SDJWT',
    description:
        'Configure your cloud agent by making the following API calls.',
    content: [
        () => (<div className="py-2 text-gray-600 transition duration-200">
            <p className="text-1xl font-semibold mb-4 text-blue-700">Creating the workshop index.mjs</p>
            <p>Create an <i>index.mjs</i> in the workshop directory inside ./demos/next-sdjwt-workshop and add the following content.</p>
        </div>),
        {
            language: 'typescript',
            code: `/// <reference types="@hyperledger/identus-edge-agent-sdk" />
import SDK from "@hyperledger/identus-edge-agent-sdk";
(async () => {
    //Workshop code goes inside
})()`,
        },
        () => (<div className="py-2 text-gray-600 transition duration-200">
            <p>Copy the following api calls into your <i>index.mjs</i> file we just created.</p>
        </div>),
        {
            title: 'Register a prism did with ed25519 keys',
            description: 'We are first going to register the Issuer\'s prism did and then publish it.',
            method: 'POST',
            request: async (store) => {
                return fetch(`${BASE_URL}/did-registrar/dids`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
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
                })
            },
            curlCommand: (store) => `const registerPrismDid = await fetch(\`${BASE_URL}/did-registrar/dids\`, {
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
console.log('Prism DID created:', { longFormDid: prismDidResponse.longFormDid });`,
        } as ApiCall,






        {
            title: 'Publish the prism did',
            description: 'Publishes the prism did onchain (for this demo inMemory) but writing the did documents on chain requires an Identus node connected to testnet',
            method: 'POST',

            request: (store: Store) => {

                return fetch(`${BASE_URL}/did-registrar/dids/${store.longFormDid}/publications`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
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
                })
            },
            curlCommand: (store: Store) => `const publishPrismDid = await fetch(\`${BASE_URL}/did-registrar/dids/\${prismDidResponse.longFormDid}/publications\`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" }
});
const publishResponse = await publishPrismDid.json();
console.log('DID Published:', { operation: publishResponse.scheduledOperation });`,
        } as ApiCall,
        {
            title: 'Create a SDJWT Credential schema',
            description: 'Creates a SDJWT Credential schema which will define the claims this credentials will have',
            method: 'POST',

            request(store) {
                return fetch(`${BASE_URL}/schema-registry/schemas`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "name": "medical-prescription-schema" + uuid(),
                        "version": "2.0.0",
                        "description": "Medical Prescription Schema",
                        "type": "https://w3c-ccg.github.io/vc-json-schemas/schema/2.0/schema.json",
                        "author": `${store.scheduledOperation?.didRef}`,
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
                })
            },
            curlCommand: (store: Store) => `const createCredentialSchema = await fetch("${BASE_URL}/schema-registry/schemas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body:  JSON.stringify({
        "name": "medical-prescription-schema-${uuid()}",
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
console.log('Schema Created:', { schemaId: schemaResponse.id });`,
        },
    ],
} as Step



export default step
