'use client'
import SDK from "@hyperledger/identus-edge-agent-sdk";
import dynamic from "next/dynamic";

import { BASE_URL } from "@/config"
import { InteractiveProps, NextFnProps, Store } from "@/reducers/app"
import { Message } from "@/components/Message";



const CodeComponent = dynamic(() => import('@/components/CodeEditor').then((e) => e.CodeComponent), {
    ssr: false,
});




export default {
    title: 'Step 4: Doctor (Issuer) will issue a medical prescription to Alice (patient)',
    description:
        `In this section we will be requesting a Credential Offer from the Cloud Agent.A Connectionless Credential Offer is an Out of Band Invitation with a Credential Offer Attachment.
This should be a URI with a single query parameter \`_oob\`, which is an encoded JSON.`,
    content: [
        {
            title: 'Obtain a Connectionless Credential Offer from an Issuer',
            description: `We will be using the data from previous api calls, concretely the Issuer's short form did`,
            method: 'POST',
            request(store: Store) {
                return fetch(`${BASE_URL}/issue-credentials/credential-offers/invitation`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        "goalCode": "issue-vc",
                        "goal": "To Issue a Medical Prescription Credential",
                        "issuingDID": store?.scheduledOperation?.didRef,
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
                })
            },
            curlCommand: (store: Store) => `const getCredentialOffer = await fetch("${BASE_URL}/issue-credentials/credential-offers/invitation", {
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
console.log('Credential Offer:', { invitationUrl: credentialOfferResponse.invitation.invitationUrl });`,
        },
        (props: InteractiveProps) => {
            if (!props.store.invitation?.invitationUrl || !props.app.agent) {
                return null
            }
            return <div className="mt-4">
                <p className="mt-5 text-1xl font-semibold mb-4 text-blue-700">UI: Accept OOB Offers</p>
                <p className="text-gray-600 leading-relaxed">
                    In order to process the out of band Offer, you must run the following code:
                </p>
                <CodeComponent content={{
                    language: 'typescript',
                    code: `const parsed = await agent.parseOOBInvitation(new URL(credentialOfferResponse.invitation.invitationUrl));
await agent.acceptInvitation(parsed, 'SampleCredentialOfferOOB');
                    ` }} />
                <p className="text-gray-600 leading-relaxed">
                    Once the OOB invitation is processed a Credential Offer Message will be emitted and we will receive a call in the event listener we defined earlier:
                </p>
                <button
                    disabled={props.loading}
                    className="my-2 inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
                    onClick={async () => {
                        const agent = props.app.agent.instance;
                        if (agent) {
                            props.setLoading(true)
                            const parsed = await agent.parseOOBInvitation(
                                new URL(props.store.invitation?.invitationUrl)
                            );
                            await agent.acceptInvitation(parsed);
                        }

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
                    {props.loading ? "Processing..." : "Accept OOB Credential Offer"}
                </button>
            </div>
        },
        (props: InteractiveProps) => {
            const agent = props.app.agent.instance;
            if (!props.store.invitation?.invitationUrl || !agent) {
                return null
            }
            return <div className="mt-4">
                <p className="text-gray-600 my-4 leading-relaxed">You can listen for new Credential Offers in your <i>index.mjs</i> by adding some code into the message event listener we added earlier:</p>
                <CodeComponent content={{
                    code: `let credential;
agent.addListener(SDK.ListenerKey.MESSAGE, async (messages) => {
    for (const message of messages) {
        if (message.piuri === SDK.ProtocolType.DidcommOfferCredential) {
            console.log('Credential Offer:', message);
        }
    }
});`, language: 'typescript'
                }} />
            </div>
        },
        (props: InteractiveProps) => {
            const offers = props.messages.filter((m) => m.piuri === SDK.ProtocolType.DidcommOfferCredential);
            return <>
                <p className="text-gray-600">In order to process the Credential Offer and create a Credential Request, just accept the Offer by clicking <i>Accept</i></p>
                {
                    offers.map((message, i) => {
                        return <Message key={message.id} message={message} />
                    })
                }
                {
                    props.messages.length && <>
                        <p className="text-gray-600 my-4 leading-relaxed">In the <i>index.mjs</i> workshop file, we are now going to extend our message listener to listen for the Issued Credential message:</p>
                        <CodeComponent content={{
                            code: `let credential;
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
                }
            }
        }
    }
});`, language: 'typescript'
                        }} />

                    </>
                }
            </>
        },
        (props: InteractiveProps) => {
            const credentials = props.messages.filter((m) => m.piuri === SDK.ProtocolType.DidcommIssueCredential);
            return <>
                {
                    credentials.length && <>
                        <p className="text-gray-600">
                            The credential is now saved in Identus Storage and will be available for later use.
                        </p>
                    </>
                }
                {
                    credentials.map((message, i) => {
                        return <Message key={message.id} message={message} />
                    })
                }
            </>
        },
    ],
    onNext: async (options: NextFnProps) => {
        const {
            store,
            setStore
        } = options;
        setStore({
            ...store,
            invitation: undefined
        })
    }
}
