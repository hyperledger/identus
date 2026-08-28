
import {  Step } from "@/types";
import React, { useEffect, useState } from "react";
import SDK from '@hyperledger/identus-sdk';
import { useDatabase, useHolder, useMessages } from "@trust0/identus-react/hooks";
import { useWorkshop } from "@/pages/_app";
import { CredentialOffer } from "@/components/CredentialOffer";
import dynamic from "next/dynamic";

const Flowchart = dynamic(() => import("@/components/core/Flowchart"), { ssr: false });


const step: Step = {
    type: 'holder',
    disableCondition: (store) =>  !store.holderAccepted,
    title: 'Credential Offer',
    description: 'Switch to the holder perspective to process the Out-of-Band credential offer. Parse the OOB invitation, review the credential details, and accept the offer to initiate the credential request process.',
    codeSample: {
        language: 'typescript',
        code: `// Step 3: Parsing and Accepting OOB Credential Offers (Holder Side)

const parseOOBOffer = (oobOfferJson, peerDID) => {
    const message = SDK.Domain.Message.fromJson(oobOfferJson);
    const attachment = message.attachments.at(0)?.payload;
    return SDK.Domain.Message.fromJson({
        ...attachment,
        from: message.from,
        to: peerDID,
    });
};

const acceptCredentialOffer = async (agent, oobOfferJson) => {
    const peerDID = await agent.createNewPeerDID();
    const credentialOffer = parseOOBOffer(oobOfferJson, peerDID);
    const credentialOfferMessage = SDK.OfferCredential.fromMessage(credentialOffer);

    const requestCredential = await agent.handle(credentialOfferMessage.makeMessage());
    const requestMessage = requestCredential.makeMessage();

    await agent.send(requestMessage);
};

// Usage:
await acceptCredentialOffer(holder, oobOfferJson);`
    },
    content() {
        const {
            setStore,
            ...store
        } = useWorkshop();

        const  { sentMessages, receivedMessages } = useMessages();
        const { parseOOBOffer, state:agentState, agent } = useHolder();
        const [credentialOffers, setCredentialOffers] = useState<SDK.Domain.Message[]>([]);
        const [lastLink, setLastLink] = useState<string | null>(null);

        useEffect(() => {
            const offers = receivedMessages.filter(({ piuri }) => piuri === SDK.ProtocolType.DidcommOfferCredential);
            const requests = sentMessages.filter(({ piuri }) => piuri === SDK.ProtocolType.DidcommRequestCredential);
            const pendingOffers = offers;

            const newCredentialOffers = [
                ...offers.filter(({ id:prevId }) => !pendingOffers.some(({ id:offerId }) => prevId === offerId)),
                ...pendingOffers,
            ].filter(({ thid:offerThid }) => !requests.some(({ thid:requestThid }) => offerThid === requestThid));

            // Only update state if the offers have actually changed
            setCredentialOffers(prev => {
                if (prev.length !== newCredentialOffers.length) {
                    return newCredentialOffers;
                }
                // Check if any offer IDs have changed
                const prevIds = prev.map(o => o.id).sort();
                const newIds = newCredentialOffers.map(o => o.id).sort();
                if (prevIds.join(',') !== newIds.join(',')) {
                    return newCredentialOffers;
                }
                return prev;
            });
        }, [sentMessages, receivedMessages])

        useEffect(() => {
            if(agent && agentState === SDK.Domain.Startable.State.RUNNING && store.issuerRequestOOB) {
                const url = new URL(store.issuerRequestOOB ?? window.location);
                const oob = url.searchParams.get('oob');
                if (
                    oob !== null &&
                    lastLink !== oob
                ) {
                    setLastLink(oob);
                    parseOOBOffer(store.issuerRequestOOB).then((message) => {
                        setCredentialOffers((prev) => [...prev, message]);
                        setStore({ issuerRequestOOB: undefined })
                    })
                }
            }
        }, [agentState, store, parseOOBOffer, agent, lastLink, setLastLink, setCredentialOffers, setStore])

        if (credentialOffers.length === 0) {
            return <div>
            <Flowchart stepType="oobHolder" />
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-700">Waiting for the Issuer to share the OOB Link</span>
                </div>
                {
                    store.issuerRequestOOB ?
                        <p className="text-sm text-slate-600">
                            Processing the OOB Link...
                        </p>
                    :
                        <p className="text-sm text-slate-600">
                            TIP: Choose the OOB link from the previous step.
                        </p>

                }
            </div>
        </div>;
        }

        return <div>
            <Flowchart stepType="oobHolder" />
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-700">Pending Credential Offers</span>
                </div>
                {credentialOffers.map((offer) => (
                        <CredentialOffer key={offer.id} credentialOffer={offer} />
                    ))}
            </div>
        </div>
    }
}

export default step;
