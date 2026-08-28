import SDK from "@hyperledger/identus-sdk";
import { useCallback, useEffect, useState } from "react";
import { useMessages, useVerifier } from "@trust0/identus-react/hooks";
import { Step } from "@/types";
import dynamic from "next/dynamic";
import { ExistingPresentations } from "@/components/core/ExistingPresentations";

const Flowchart = dynamic(() => import("@/components/core/Flowchart"), { ssr: false });

const VerifyPresentation = () => {
    const [presentations, setPresentations] = useState<SDK.Domain.Message[]>([]);
    const [verified, setVerified] = useState<{ [key: string]: boolean | null }>({});
    const [verifying, setVerifying] = useState<{ [key: string]: boolean }>({});
    const [errors, setErrors] = useState<{ [key: string]: Error | null }>({});
    const [busy, setBusy] = useState(false);

    const { receivedMessages } = useMessages();
    const { verifyPresentation, agent, state: agentState } = useVerifier();

    useEffect(() => {
        const presentations = receivedMessages.filter(({ piuri }) => piuri === SDK.ProtocolType.DidcommPresentation);
        setPresentations(presentations);
    }, [receivedMessages]);

    const handleVerifyPresentation = useCallback(async (presentation: SDK.Domain.Message) => {
        if (!agent || agentState !== SDK.Domain.Startable.State.RUNNING) {
            throw new Error("Agent not running");
        }

        try {
            setVerifying(prev => ({ ...prev, [presentation.uuid]: true }));
            setErrors(prev => ({ ...prev, [presentation.uuid]: null }));

            const verify = await verifyPresentation(presentation);
            setVerified(prev => ({ ...prev, [presentation.uuid]: verify }));
        } catch (error) {
            setErrors(prev => ({ ...prev, [presentation.uuid]: error as Error }));
            setVerified(prev => ({ ...prev, [presentation.uuid]: false }));
        } finally {
            setVerifying(prev => ({ ...prev, [presentation.uuid]: false }));
        }
    }, [agent, agentState, verifyPresentation]);

    return (
        <div className="space-y-6">
            <Flowchart stepType="presentationVerify" />

            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Verify Presentations</h2>
                <p className="text-slate-600 text-sm mb-6">
                    Verify received presentations to ensure their authenticity and validity. Click the verify button next to each presentation to validate it.
                </p>

                <ExistingPresentations
                    presentations={presentations}
                    onVerifyPresentation={handleVerifyPresentation}
                    busy={busy}
                    verified={verified}
                    verifying={verifying}
                    errors={errors}
                />
            </div>
        </div>
    );
}

const step: Step = {
    type: "verifier",
    title: "Verify Presentation",
    description: "Verify received presentations to ensure their authenticity and validity",
    codeSample: {
        language: 'typescript',
        code: `import SDK from "@hyperledger/identus-sdk";
import { StorageType } from "@trust0/ridb";
import { createStore } from "@trust0/identus-store";
import { v4 as uuidv4 } from 'uuid';
import { base64 } from 'multiformats/bases/base64';

const mediatorDID = 'did:peer:2.Ez6LSr75gLoSwaVHS7MTzcKLXjt9onJMXY9aVEBGWY8ahWPdn.Vz6Mkw5SdxCCxRTfHx1LaGvh2e5JWPWJs7Ek6mjiPXRxqnYHT.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6Imh0dHBzOi8vbWVkaWF0b3IudHJ1c3QwLmlkIiwiYSI6WyJkaWRjb21tL3YyIl19fQ.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6IndzOi8vbWVkaWF0b3IudHJ1c3QwLmlkL3dzIiwiYSI6WyJkaWRjb21tL3YyIl19fQ';


(async () => {

    const createInstance = async (name) => {
        const store = createStore({ dbName: name, storageType: StorageType.InMemory });
        const apollo = new SDK.Apollo();
        const pluto = new SDK.Pluto(store, apollo);
        const castor = new SDK.Castor(apollo, []);
        const agent = await SDK.Agent.initialize({ apollo, castor, mediatorDID, pluto, seed: apollo.createRandomSeed().seed });
        await agent.start();
        return { agent };
    };

    const createPrismDID = async (agent, role) => {
        const issuerDIDTask = new SDK.Tasks.CreatePrismDID({
            authenticationKeyCurve: SDK.Domain.Curve.SECP256K1,
            services: [],
            alias: \`\${role}-did\`
        });
        const issuerDID = await agent.runTask(issuerDIDTask);
        return issuerDID;
    };

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
                        body: { attributes: claims.map((claim) => ({ name: claim.name, value: claim.value })) },
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

    const waitForMessage = (agent, type, timeout = 30000) => {
        return new Promise((resolve, reject) => {
            let timeoutId;
            let listenerRemoved = false;
            const messageListener = (messages) => {
                const found = messages.find((message) => message.piuri === type);
                if (found) {
                    cleanup();
                    resolve(found);
                }
            };

            const cleanup = () => {
                if (!listenerRemoved) {
                    agent.removeListener(SDK.ListenerKey.MESSAGE, messageListener);
                    listenerRemoved = true;
                }
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            };

            timeoutId = setTimeout(() => {
                cleanup();
                reject(new Error(\`Timeout waiting for message type: \${type}\`));
            }, timeout);

            agent.addListener(SDK.ListenerKey.MESSAGE, messageListener);
        });
    };

    const issueCredential = async (agent, message, claims, issuerDID, holderDID) => {
        const protocol = new SDK.Tasks.RunProtocol({
            type: 'credential-request',
            pid: SDK.ProtocolType.DidcommRequestCredential,
            data: {
                issuerDID,
                holderDID,
                message,
                format: SDK.Domain.CredentialType.JWT,
                claims,
            }
        });
        const issued = await agent.runTask(protocol);
        await agent.send(issued.makeMessage());
    };

    const issuePresentationRequest = async (agent, type, toDID, claims) => {
        const task = new SDK.Tasks.CreatePresentationRequest({ type, toDID, claims });
        const requestPresentation = await agent.runTask(task);
        const requestPresentationMessage = requestPresentation.makeMessage();
        await agent.send(requestPresentationMessage);
    };

    const handlePresentationRequest = async (agent, message, credential) => {
        const request = SDK.RequestPresentation.fromMessage(message);
        const task = new SDK.Tasks.CreatePresentation({ request, credential });
        const presentation = await agent.runTask(task);
        const presentationMessage = presentation.makeMessage();
        await agent.send(presentationMessage);
    };

    const extractCredential = async (agent, message) => {
        const protocol = new SDK.Tasks.RunProtocol({
            type: 'credential-issue',
            pid: SDK.ProtocolType.DidcommIssueCredential,
            data: { message }
        });
        const credential = await agent.runTask(protocol);
        return credential;
    };

    try {
        const { agent: issuer } = await createInstance('issuer');
        const { agent: holder } = await createInstance('holder');
        const { agent: verifier } = await createInstance('verifier');
        const issuerDID = await createPrismDID(issuer, 'issuer');
        const holderDID = await createPrismDID(holder, 'holder');
        const issuanceRequest = {
            id: '12345',
            claims: [
                { name: 'name', value: 'John Doe', type: 'string' }
            ],
            credentialFormat: SDK.Domain.CredentialType.JWT,
        };

        const oobOfferJson = await createOOBJSONOffer(issuer, issuanceRequest);
        const credentialRequestPromise = waitForMessage(issuer, SDK.ProtocolType.DidcommRequestCredential);
        const credentialIssuedPromise = waitForMessage(holder, SDK.ProtocolType.DidcommIssueCredential);

        await acceptCredentialOffer(holder, oobOfferJson);
        const credentialRequestMessage = await credentialRequestPromise;
        await issueCredential(issuer, credentialRequestMessage, issuanceRequest.claims, issuerDID, holderDID);
        const credentialMessage = await credentialIssuedPromise;
        const credential = await extractCredential(holder, credentialMessage);
        const presentationRequestPromise = waitForMessage(holder, SDK.ProtocolType.DidcommRequestPresentation);
        await issuePresentationRequest(
            verifier,
            SDK.Domain.CredentialType.JWT,
            credentialMessage.to,
            {
                issuerDID: issuerDID.toString(),
                holderDID: holderDID.toString(),
                claims: {
                    name: { type: 'string', pattern: 'John Doe' }
                }
            }
        );
        const presentationRequestMessage = await presentationRequestPromise;
        const verifierPresentation = waitForMessage(verifier, SDK.ProtocolType.DidcommPresentation);
        await handlePresentationRequest(holder, presentationRequestMessage, credential);
        const presentationMessage = await verifierPresentation;
        const verify = await verifier.handle(presentationMessage);
        console.log("verify result", verify);
    } catch (err) {
        console.error('❌ ERROR:', err.message);
        console.error(err);
        process.exit(1);
    }
})();

`
    },
    content: VerifyPresentation
}

export default step;
