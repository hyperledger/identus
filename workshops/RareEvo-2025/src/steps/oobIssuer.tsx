
import { Step } from "@/types";
import React, { useCallback, useEffect, useState } from "react";
import { useDatabase, useIssuer } from "@trust0/identus-react/hooks";
import SDK from "@hyperledger/identus-sdk";
import OOBCode from "@/components/core/OOBCode";
import { TabNavigation } from "@/components/core/TabNavigation";
import { Request } from "@/types";
import { ExistingFlows } from "@/components/core/ExistingFlows";
import { CreateFlowForm } from "@/components/core/CreateFlowForm";
import { useWorkshop } from "@/pages/_app";
import dynamic from "next/dynamic";

const Flowchart = dynamic(() => import("@/components/core/Flowchart"), { ssr: false });

const step: Step = {
    type: 'issuer',
    disableCondition: (store) => !store.issuerRequest || !store.issuerRequestOOB,
    title: 'Generate Out-of-Band Credential Offer',
    description: 'Create an Out-of-Band (OOB) credential offer for SD-JWT credentials. Configure claims, select issuing DIDs, and generate shareable URLs that holders can use to initiate the credential issuance process.',
    codeSample: {
        language: 'typescript',
        code: `// Step 2: Creating Out-of-Band (OOB) Credential Offers
import { v4 as uuidv4 } from 'uuid';
import { base64 } from 'multiformats/bases/base64';

const createOOBJSONOffer = async (agent, request) => {
    const { id, credentialFormat: format, claims } = request;

    const peerDID = await agent.createNewPeerDID();

    const oobTask = new SDK.Tasks.CreateOOBOffer({
        from: peerDID,
        offer: new SDK.OfferCredential(
            {
                goal_code: "Offer Credential",
                credential_preview: {
                    type: SDK.ProtocolType.DidcommCredentialPreview,
                    body: {
                        attributes: claims.map((claim) => ({
                            name: claim.name,
                            value: claim.value
                        }))
                    },
                },
            },
            [
                new SDK.Domain.AttachmentDescriptor(
                    {
                        json: {
                            id: uuidv4(),
                            media_type: "application/json",
                            options: { challenge: uuidv4(), domain: 'localhost' },
                            thid: id,
                            presentation_definition: { id: uuidv4(), input_descriptors: [] },
                            format,
                            piuri: SDK.ProtocolType.DidcommOfferCredential,
                        },
                    },
                    "application/json",
                    id,
                    undefined,
                    format
                )
            ],
            undefined,
            undefined,
            id
        )
    });

    const oob = await agent.runTask(oobTask);
    const oobDecoded = base64.baseDecode(oob);
    const oobJson = Buffer.from(oobDecoded).toString();

    return oobJson;
};

// Usage example:
const issuanceRequest = {
    id: '12345',
    claims: [
        { name: 'name', value: 'John Doe', type: 'string' }
    ],
    credentialFormat: SDK.Domain.CredentialType.JWT,
};

const oobOfferJson = await createOOBJSONOffer(issuer, issuanceRequest);`
    },
    content() {
        const {
            setStore,
            ...store
        } = useWorkshop();
        const { getOOBURL, state: agentState } = useIssuer();
        const [issuanceFlows, setIssuanceFlows] = useState<Request[]>([]);
        const { getIssuanceFlows, state: dbState } = useDatabase();
        const [activeTab, setActiveTab] = useState<'existing' | 'create'>('existing');
        const [busy, setBusy] = useState(false);
        const [oobFlow, setOobFlow] = useState<Request | null>(null);

        useEffect(() => {
            async function loadIssuanceFlows() {
                const flows = await getIssuanceFlows();
                setIssuanceFlows(flows);
            }
            if (dbState === "loaded") {
                loadIssuanceFlows();
            }
        }, [dbState, getIssuanceFlows]);

        const handleSelectFlow = useCallback(async (flow: Request) => {
            if (agentState === SDK.Domain.Startable.State.RUNNING) {
                try {
                    setBusy(true);
                    const oob = await getOOBURL(flow);
                    if (!oob) return;
                    setOobFlow(flow);
                    setBusy(false);
                    setStore({
                        issuerRequest: flow,
                        issuerRequestOOB: oob
                    });
                } catch {
                    setBusy(false);
                }
            }
        }, [agentState, getOOBURL, setStore]);

        const onCreate = useCallback(async (issuerRequest: Request) => {
            setIssuanceFlows(prev => [...prev, issuerRequest]);
            setActiveTab('existing');
        }, [setActiveTab]);

        return (
            <>
                <Flowchart stepType="oobIssuer" />
                <TabNavigation
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    flowsCount={issuanceFlows.length}
                />
                {activeTab === 'existing' && (
                    <ExistingFlows
                        busy={busy}
                        flows={issuanceFlows}
                        selectedFlowId={oobFlow?.id}
                        onSelectFlow={handleSelectFlow}
                        onCreateNew={() => setActiveTab('create')}
                    />
                )}

                {activeTab === 'create' && (
                    <CreateFlowForm
                        onCreate={onCreate}
                        onBackToExisting={() => setActiveTab('existing')}
                    />
                )}

                {
                    activeTab !== 'create' && <>
                        {store.issuerRequestOOB &&
                            <OOBCode code={store.issuerRequestOOB} type="offer" />
                        }
                        {
                            !store.issuerRequestOOB &&
                            <div className="mt-10 text-sm text-gray-500">
                                <p>Choose Credential Offer to share the OOB URL with the holder, or create a new one.</p>
                            </div>
                        }
                    </>
                }


            </>
        );
    }
}

export default step;
