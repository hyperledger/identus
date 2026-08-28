import { Step } from "@/types";
import SDK from "@hyperledger/identus-sdk";
import { useCredentials, useDatabase, useHolder, useMessages } from "@trust0/identus-react/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWorkshop } from "@/pages/_app";
import { useMessageStatus } from "@/utils";
import { getClaimsPreview } from "@/utils/credentials";
import dynamic from "next/dynamic";
import { EnrichedSelect, EnrichedSelectItem } from "@/components/core/EnrichedSelect";

const Flowchart = dynamic(() => import("@/components/core/Flowchart"), { ssr: false });

// Credential Item Renderer for Presentation Selection
const CredentialItemRenderer = ({
    credential,
    index,
    fields
}: {
    credential: SDK.Domain.Credential;
    index: number;
    fields: any[];
}) => {
    const credentialType = credential.credentialType || "Digital Credential";

    // Get relevant claims based on the request fields
    const getRelevantClaims = () => {
        const relevantClaims: string[] = [];

        credential.claims.forEach(claim => {
            fields.forEach(field => {
                const keys = Object.keys(claim);
                if (keys.includes(field.name)) {
                    const value = claim[field.name];
                    let displayValue = '';

                    if (typeof value === 'object' && value !== null && 'value' in value) {
                        displayValue = String(value.value);
                    } else {
                        displayValue = String(value);
                    }

                    displayValue = displayValue.length > 20 ? displayValue.substring(0, 20) + '...' : displayValue;
                    relevantClaims.push(`${field.name}: ${displayValue}`);
                }
            });
        });

        // If no matching claims found, fall back to general claims preview
        if (relevantClaims.length === 0) {
            return getClaimsPreview(credential);
        }

        return relevantClaims.join(', ');
    };

    const relevantClaims = getRelevantClaims();

    return (
        <div className="flex items-center justify-between p-4 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="text-base font-medium text-slate-900 truncate">
                            {credentialType}
                        </span>
                    </div>
                    <div className="text-sm text-slate-500 mb-1 truncate">
                        <strong>Issuer:</strong> {credential.issuer.substring(0, 40)}...
                    </div>
                    <div className="text-sm text-slate-500 truncate">
                        <strong>Matching Claims:</strong> {relevantClaims}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                        ID: {credential.id.slice(0, 12)}...
                    </div>
                </div>
            </div>
        </div>
    );
};

function CredentialSelector({ request }: { request: SDK.RequestPresentation }) {
    const { credentials } = useCredentials()
    const [selectedCredential, setSelectedCredential] = useState<SDK.Domain.Credential | null>(credentials.length > 0 ? credentials[0] : null);
    const { handlePresentationRequest, state: agentState, agent } = useHolder();
    const { deleteMessage, load: loadMessages } = useMessages();
    const { state: dbState } = useDatabase();
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const requestPresentation = useMemo(() => request.decodedAttachments.at(0).payload, [request]);

    const claims: any[] = useMemo(() => {
        return requestPresentation?.presentation_definition ?
            requestPresentation.presentation_definition.input_descriptors.at(0)?.constraints.fields ?? [] :
            []
    }, [requestPresentation]);

    const fields = useMemo(() => {
        return claims.reduce<any>((all, claim) => [
            ...all,
            {
                name: claim.name,
                type: claim.filter.type,
                value: claim.filter.pattern || claim.filter.value || claim.filter.enum
            }
        ], [])
    }, [claims]);


    const availableCredentials = useMemo(() => {
        return credentials.filter((credential) => {
            const hasFields = fields.every((field) => {
                if (field.name === 'iss' || field.name === "issuer") {
                    return credential.issuer.includes(field.value);
                }
                return credential.claims.some((claim) => {
                    const keys = Object.keys(claim);
                    return keys.includes(field.name);
                })
            })
            return hasFields;
        })
    }, [credentials, fields]);

    const onHandleAccept = useCallback(async () => {
        if (!agent || agentState !== SDK.Domain.Startable.State.RUNNING) {
            return;
        }
        if (!selectedCredential) {
            throw new Error("No credential selected");
        }
        try {
            setIsAccepting(true);
            await handlePresentationRequest(request.makeMessage(), selectedCredential);
        } finally {
            setIsAccepting(false);
        }
    }, [agent, agentState, selectedCredential, handlePresentationRequest, request]);

    const onHandleReject = useCallback(async () => {
        if (dbState === 'loaded') {
            try {
                setIsRejecting(true);
                await deleteMessage(request.makeMessage());
                await loadMessages();
            } finally {
                setIsRejecting(false);
            }
        }
    }, [dbState, deleteMessage, request, loadMessages]);

    return <div className="bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-lg rounded-lg shadow-lg  border border-gray-200 dark:border-gray-800">
        <div className="p-4">

            <h2>Choose your Credential</h2>
            {
                availableCredentials.length === 0 ?
                    <>
                        <p>You have no credentials that match the request</p>
                        <button
                            type="button"
                            className="mt-4 mx-2 bg-red-500 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={onHandleReject}
                            disabled={dbState !== 'loaded' || isRejecting}
                        >
                            {isRejecting ? 'Rejecting...' : 'Reject'}
                        </button>

                    </> :
                    <>

                        <EnrichedSelect<SDK.Domain.Credential>
                            items={availableCredentials.map(credential => ({
                                id: credential.id,
                                data: credential
                            }))}
                            renderItem={(item, index) => (
                                <CredentialItemRenderer
                                    credential={item.data}
                                    index={index}
                                    fields={fields}
                                />
                            )}
                            renderSelectedItem={(item) => (
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        ✓
                                    </div>
                                    <span className="text-base font-medium text-slate-900 truncate">
                                        {item.data.credentialType} - {getClaimsPreview(item.data)}
                                    </span>
                                    <span className="text-sm text-slate-500 bg-green-100 px-2 py-0.5 rounded-full">
                                        Selected
                                    </span>
                                </div>
                            )}
                            onSelectItem={(item) => setSelectedCredential(item.data)}
                            placeholder="Choose a credential to present"
                            selectedItemId={selectedCredential?.id}
                            focusColor="emerald"
                            fontSize="text-lg"
                            className="mb-4"
                        />

                        <button
                            type="button"
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={onHandleAccept}
                            disabled={!agent || agentState !== SDK.Domain.Startable.State.RUNNING || !selectedCredential || isAccepting || isRejecting}
                        >
                            {isAccepting ? 'Accepting...' : 'Accept'}
                        </button>
                        <button
                            type="button"
                            className="mt-4 mx-2 bg-red-500 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={onHandleReject}
                            disabled={dbState !== 'loaded' || isAccepting || isRejecting}
                        >
                            {isRejecting ? 'Rejecting...' : 'Reject'}
                        </button>

                    </>




            }
        </div>
    </div>
}


function PresentationRequest({ request }: { request: SDK.RequestPresentation }) {
    const message = request.makeMessage();
    const { hasAnswered } = useMessageStatus(message);


    return hasAnswered ?
        <p>You already accepted this offer.</p> :
        <CredentialSelector request={request} />
}

function PresentCredential() {
    const { setStore, ...store } = useWorkshop();
    const { pluto } = useDatabase();
    const { parseOOB, agent, state: agentState } = useHolder();
    const { receivedMessages, sentMessages, load: loadMessages } = useMessages();
    const [presentationRequests, setPresentationRequests] = useState<SDK.RequestPresentation[]>([]);
    const [lastLink, setLastLink] = useState<string | null>(null);

    useEffect(() => {
        const presentationRequests = receivedMessages.filter(({ piuri }) => piuri === SDK.ProtocolType.DidcommRequestPresentation);
        const presentations = sentMessages.filter(({ piuri }) => piuri === SDK.ProtocolType.DidcommPresentation);
        setPresentationRequests(
            presentationRequests
                .filter((m) => !presentations.some(({ thid }) => thid === m.thid))
                .map((m) => SDK.RequestPresentation.fromMessage(m))
        );
    }, [receivedMessages, sentMessages]);

    useEffect(() => {
        if (agent && agentState === SDK.Domain.Startable.State.RUNNING && store.verifierRequestOOB) {
            const url = new URL(store.verifierRequestOOB ?? window.location);
            const oob = url.searchParams.get('oob');
            if ( oob !== null && oob !== lastLink) {
                setLastLink(oob);
                parseOOB(store.verifierRequestOOB).then(async (message) => {
                    setPresentationRequests((prev) => [...prev, SDK.RequestPresentation.fromMessage(message)]);
                })
            }
        }
    }, [agentState, store.verifierRequestOOB, parseOOB, agent, lastLink])

    return (
        <div>
            <Flowchart stepType="present" />
            {
                presentationRequests.length === 0 && <p>No presentation requests found</p>
            }
            {presentationRequests.length > 0 && presentationRequests.map((request) => (
                <PresentationRequest key={`presentation-request-${request.id}`} request={request} />
            ))}
        </div>
    );
}






const step: Step = {
    type: "holder",
    title: "Present Credential",
    description: "",
    codeSample: {
        language: 'typescript',
        code: `// Step 7: Handling Presentation Requests (Holder Side)

const handlePresentationRequest = async (agent, message, credential) => {
    const request = SDK.RequestPresentation.fromMessage(message);

    const task = new SDK.Tasks.CreatePresentation({ request, credential });
    const presentation = await agent.runTask(task);
    const presentationMessage = presentation.makeMessage();

    await agent.send(presentationMessage);
};

// Continuing from the previous step:
// The holder has received the presentation request message
const presentationRequestMessage = await presentationRequestPromise;

// Set up promise to wait for the verifier to receive the presentation
const verifierPresentation = waitForMessage(verifier, SDK.ProtocolType.DidcommPresentation);

// Holder processes the request and sends the presentation
await handlePresentationRequest(holder, presentationRequestMessage, credential);

// Wait for the verifier to receive the presentation
const presentationMessage = await verifierPresentation;`
    },
    content: PresentCredential
}

export default step;
