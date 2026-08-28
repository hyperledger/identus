'use client'
import { MEDIATOR_URL } from "@/config";
import { NextFnProps, reduxActions, Store } from "@/reducers/app";
import React from "react";





export default
    {
        title: "Step 3: Developing the workshop",
        description: "In this section we will configure our Edge Agent with a prism did resolver for SDJWT which will be resolving the DID using the Cloud Agent instance, this in production would be replaced by a custom resolver using universal resolver API or a custom solution.",
        content: [
            () => (<div className="py-2 text-gray-600 transition duration-200">
                <p className="text-1xl font-semibold mb-4 text-blue-700">Information around prism:dids</p>
                <p>A prism did has 2 forms, short and long form:</p>
                <ul className="mt-5">
                    <li className="mt-2">
                        1. <span className="font-bold">Long Form</span>: This variation of the prism did, includes the public keys inside the DID, this does not require any external resolver as only thing that is needed is to decode the DID. Similar to what did:key does.
                        <div className="mt-2">
                            <pre className="bg-gray-800 text-white p-4 rounded-lg shadow-md overflow-x-auto">
                                <code>did:prism:de34002e071ab2cdded0c04c2e0ed63e06ef16590a8a5343fae2fd65ea561857:CvsBCvgBEjYKBWF1dGgxEARKKwoHRWQyNTUxORIg2oggHKGPTkUB29bc8OH6OMGLxVWiGCQdWmImDE32oIASNwoGaXNzdWUxEAJKKwoHRWQyNTUxORIgxNycViFcMalrCcgpQYECX_aPn-_m4WordzHXry5O8k4SOwoHbWFzdGVyMBABSi4KCXNlY3AyNTZrMRIhA5fH_hHFuWj0kpfW0C4wB9rIrhPAMqY-QjyilFZr5KqxGkgKDmFnZW50LWJhc2UtdXJsEhBMaW5rZWRSZXNvdXJjZVYxGiRodHRwOi8vMTkyLjE2OC4xLjQ0OjgwMDAvY2xvdWQtYWdlbnQ</code>
                            </pre>
                        </div>

                    </li>
                    <li className="mt-2">
                        2. <span className="font-bold">Short form</span>: The same did can be shown also with its default form, as we can see the prism did is shorter as it does not include keys and that's the main reason why we would need an extra resolver
                        <div className="mt-2">
                            <pre className="bg-gray-800 text-white p-4 rounded-lg shadow-md overflow-x-auto">
                                <code>did:prism:de34002e071ab2cdded0c04c2e0ed63e06ef16590a8a5343fae2fd65ea561857</code>
                            </pre>
                        </div>
                    </li>
                </ul>
                <p className="mt-5 text-1xl font-semibold mb-4 text-blue-700">Integrating a custom prism did resolver</p>
                <p className="mt-5">A SDJWT credential will be issued by a prism did in its short form and that requires a did resolver. For the purpose of this demonstration, we will not be using a prism node or write anything onchain.</p>
                <p className="mt-5">For this reason, we will need to build a custom short form resolver, in production would be replaced by the universal resolver API.</p>
                <p>Add the following resolver to your index.mjs script, u can place it anywhere inside that file.</p>
            </div>),
            {
                language: 'typescript',
                code: `class ShortFormDIDResolverSample {
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
`,
            },
            () => (<div className="py-2 text-gray-600 transition duration-200">
                <p className="mt-5 text-1xl font-semibold mb-4 text-blue-700">Configuring and starting the Agent</p>

                <p>In order to create, configure and start the agent we must integrate a compatible storage module and connect with the Identus Mediator.</p>

                <p>Also for this SDJWT example we are going to require including the ShortForm resolver that we created in the previous step.</p>
                <p>Let's update the <i>index.mjs</i> we recently created and add the following content:</p>
            </div>),
            {
                title: 'Get the mediator DID through an API call',
                description: `${MEDIATOR_URL}/did`,
                method: 'GET',
                request(store: Store) {
                    return fetch(`${MEDIATOR_URL}/did`, {
                        method: "GET"
                    })
                },
                curlCommand: (store: Store) => `const getMediatorDid = await fetch("${MEDIATOR_URL}/did");
const mediatorDID = SDK.Domain.DID.fromString(await getMediatorDid.text());
console.log('Mediator DID:', { did: mediatorDID });`,
            },
            () => (<div className="py-2 text-gray-600 transition duration-200">
                <p>Also for this SDJWT example we are going to require including the ShortForm resolver that we created in the previous step.</p>
                <p>Let's update the <i>index.mjs</i> we recently created and add the following content:</p>
            </div>),
            {
                language: 'typescript',
                code: `//Add this packages on top
import SDK from "@hyperledger/identus-edge-agent-sdk";
import { sha512 } from '@noble/hashes/sha512'
import InMemory from '@pluto-encrypted/inmemory'

//And this part inside the main function
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
`,
            },
            () => (<div className="py-2 text-gray-600 transition duration-200">
                <p>We also require to subscribe to the message event in order to receive and process the DIDComm messages for Issuance and Presentation flows.</p>
            </div>),
            {
                language: 'typescript',
                code: `agent.addListener(SDK.ListenerKey.MESSAGE, async (messages) => {
    //Your custom logic here
});`,
            },
            () => (<div className="py-2 text-gray-600 transition duration-200">
                <p>Finally, starting the agent would be as simple as: </p>
            </div>),
            {
                language: 'typescript',
                code: `await agent.start()`,
            },
        ],
        onNext: async (options: NextFnProps) => {
            const {
                store,
                loadAgent,
                setNextBusy,
                app
            } = options;
            setNextBusy(true)
            const agent = await loadAgent(store)
            await agent.start();
            const peerDID = await agent.createNewPeerDID([], true)
            app.dispatch(
                reduxActions.updateAgent({
                    agent,
                    selfDID: peerDID,
                    pluto: agent.pluto
                })
            )
            setNextBusy(false)
        }
    }
