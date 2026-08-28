import SDK from "@hyperledger/identus-sdk";
import { useCallback, useEffect, useState } from "react";
import { useVerifier } from "@trust0/identus-react/hooks";
import { Step } from "@/types";
import OOBCode from "@/components/core/OOBCode";
import { useWorkshop } from "@/pages/_app";
import dynamic from "next/dynamic";

const Flowchart = dynamic(() => import("@/components/core/Flowchart"), { ssr: false });

interface Claim {
    id: string;
    name: string;
    value: string;
}

const PresentationRequest = () => {
    const { setStore } = useWorkshop()
    const { issueOOBPresentationRequest, agent } = useVerifier();
    const [presentationClaims, setPresentationClaims] = useState<SDK.Domain.PresentationClaims>({} as SDK.Domain.PresentationClaims);
    const [claims, setClaims] = useState<Claim[]>([
        { id: crypto.randomUUID(), name: 'handle', value: '' }
    ]);
    const [trustIssuers, setTrustIssuers] = useState<string>("did:prism:a0209ebd691c5ec20636f206b3e101c726fdc1c22b9b850b4b811ac4a82e28d8")
    const [code, setCode] = useState<string>("")
    const [isProcessing, setIsProcessing] = useState<boolean>(false)

    const onHandleInitiate = useCallback(async ()=> {
        if (!agent || agent.state !== SDK.Domain.Startable.State.RUNNING) {
            throw new Error("Start agent first")
        }
        setIsProcessing(true)
        try {
            const code = await issueOOBPresentationRequest(
                SDK.Domain.CredentialType.SDJWT,
                {
                    ...presentationClaims,
                    issuer: trustIssuers
                }
            )
            setCode(`${window.location.origin}/?oob=${code}`)
            setStore({ verifierRequestOOB: `${window.location.origin}/?oob=${code}` })
        } catch (error) {
            console.error("Error creating presentation request:", error)
            throw error
        } finally {
            setIsProcessing(false)
        }
    }, [presentationClaims, agent, issueOOBPresentationRequest, setStore, trustIssuers])

    const addClaim = () => {
        const newClaim: Claim = {
            id: Date.now().toString(),
            name: '',
            value: ''
        };
        setClaims([...claims, newClaim]);
    };

    const removeClaim = (id: string) => {
        setClaims(claims.filter(claim => claim.id !== id));
    };

    const updateClaim = (id: string, field: 'name' | 'value', value: string) => {
        setClaims(claims.map(claim =>
            claim.id === id ? { ...claim, [field]: value } : claim
        ));
    };

    useEffect(() => {
        const claimsObject = claims.reduce((all, claim) => {
            if (claim.name && claim.value) {
                all[claim.name] = {
                    type: 'string',
                    pattern: claim.value
                }
            }
            return all
        }, {})
        setPresentationClaims({ claims: claimsObject })
    }, [claims])

    return (
        <div className=" p-6 bg-white rounded-lg shadow-md">
            <Flowchart stepType="presentationRequest" />
            <div className="space-y-6">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Required Claims
                        </h3>
                        {claims.length < 2 && (
                            <button
                                type="button"
                                onClick={addClaim}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 dark:focus:ring-green-900"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <title>Plus icon</title>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Claim
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {claims.map((claim, index) => (
                            <div key={claim.id} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex-1">
                                    <label htmlFor={`claim-name-${claim.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Claim Name
                                    </label>
                                    <input
                                        id={`claim-name-${claim.id}`}
                                        type="text"
                                        value={claim.name}
                                        onChange={(e) => updateClaim(claim.id, 'name', e.target.value)}
                                        placeholder="e.g., emailAddress, firstName, age"
                                        className="block w-full px-3 py-2 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor={`claim-value-${claim.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Expected Value/Pattern
                                    </label>
                                    <input
                                        id={`claim-value-${claim.id}`}
                                        type="text"
                                        value={claim.value}
                                        onChange={(e) => updateClaim(claim.id, 'value', e.target.value)}
                                        placeholder="e.g., test@email.com, John, 21"
                                        className="block w-full px-3 py-2 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeClaim(claim.id)}
                                    disabled={claims.length === 1}
                                    className="p-2 text-red-600 hover:text-red-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Remove claim"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <title>Delete icon</title>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="trustIssuers" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Trusted Issuer DID
                    </label>
                    <input
                        id="trustIssuers"
                        type="text"
                        value={trustIssuers}
                        onChange={(e) => setTrustIssuers(e.target.value)}
                        placeholder="Enter the DID of the trusted issuer"
                        className="block w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onHandleInitiate}
                        disabled={claims.some(claim => !claim.name || !claim.value) || !trustIssuers || isProcessing}
                        className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <title>Loading spinner</title>
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Request...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <title>Send icon</title>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Create Presentation Request
                            </>
                        )}
                    </button>

                    {claims.length > 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {claims.filter(claim => claim.name && claim.value).length} of {claims.length} claims configured
                        </div>
                    )}
                </div>

                {code && (
                    <div className="mt-6">
                        <OOBCode code={code} type="presentation" />
                    </div>
                )}
            </div>
        </div>
    );
}

const step: Step = {
    type: "verifier",
    title: "Create OOB Presentation Request",
    description: "",
    codeSample: {
        language: 'typescript',
        code: `// Step 6: Creating Presentation Requests (Verifier Side)

const issuePresentationRequest = async (agent, type, toDID, claims) => {
    const task = new SDK.Tasks.CreatePresentationRequest({ type, toDID, claims });
    const requestPresentation = await agent.runTask(task);
    const requestPresentationMessage = requestPresentation.makeMessage();

    await agent.send(requestPresentationMessage);
};

// Usage in the complete flow:
// Set up promise to wait for presentation request on holder side
const presentationRequestPromise = waitForMessage(holder, SDK.ProtocolType.DidcommRequestPresentation);

// Verifier creates and sends presentation request
await issuePresentationRequest(
    verifier,
    SDK.Domain.CredentialType.JWT,
    credentialMessage.to, // Holder's DID from previous credential exchange
    {
        issuerDID: issuerDID.toString(),
        holderDID: holderDID.toString(),
        claims: {
            name: { type: 'string', pattern: 'John Doe' }
        }
    }
);

// The holder will receive this request in the next step...
const presentationRequestMessage = await presentationRequestPromise;`
    },
    content: PresentationRequest
}

export default step;
