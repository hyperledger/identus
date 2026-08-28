import SDK from "@hyperledger/identus-sdk";
import { StorageType } from "@trust0/ridb";
import { createStore } from "@trust0/identus-store";
import { v4 as uuidv4 } from 'uuid';
import { base64 } from 'multiformats/bases/base64';

const mediatorDID = 'did:peer:2.Ez6LSr75gLoSwaVHS7MTzcKLXjt9onJMXY9aVEBGWY8ahWPdn.Vz6Mkw5SdxCCxRTfHx1LaGvh2e5JWPWJs7Ek6mjiPXRxqnYHT.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6Imh0dHBzOi8vbWVkaWF0b3IudHJ1c3QwLmlkIiwiYSI6WyJkaWRjb21tL3YyIl19fQ.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6IndzOi8vbWVkaWF0b3IudHJ1c3QwLmlkL3dzIiwiYSI6WyJkaWRjb21tL3YyIl19fQ';

// ASCII Art Introduction
function printIntroduction() {
    console.log(`
██╗██████╗ ███████╗███╗   ██╗████████╗██╗   ██╗███████╗
██║██╔══██╗██╔════╝████╗  ██║╚══██╔══╝██║   ██║██╔════╝
██║██║  ██║█████╗  ██╔██╗ ██║   ██║   ██║   ██║███████╗
██║██║  ██║██╔══╝  ██║╚██╗██║   ██║   ██║   ██║╚════██║
██║██████╔╝███████╗██║ ╚████║   ██║   ╚██████╔╝███████║
╚═╝╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚══════╝

    🚀 Hyperledger Identus SDK Workshop
    🎯 Credential Issuance & Presentation Demo
    ┌─────────────────────────────────────────────────────┐
    │ This demo shows the complete flow of:               │
    │ 1. Setting up Agents (Issuer, Holder, Verifier)    │
    │ 2. Creating DIDs                                    │
    │ 3. Issuing Credentials                              │
    │ 4. Requesting & Verifying Presentations            │
    └─────────────────────────────────────────────────────┘

`);
}

// Logging helper functions
const log = {
    step: (step, message) => console.log(`\n🔄 STEP ${step}: ${message}`),
    info: (message) => console.log(`ℹ️  ${message}`),
    success: (message) => console.log(`✅ ${message}`),
    data: (label, data) => console.log(`📋 ${label}:`, JSON.stringify(data, null, 2)),
    separator: () => console.log('─'.repeat(60))
};

(async () => {
    printIntroduction();

    const createInstance = async (name) => {
        log.info(`Creating ${name} agent instance...`);
        const store = createStore({ dbName: name, storageType: StorageType.InMemory });
        const apollo = new SDK.Apollo();
        const pluto = new SDK.Pluto(store, apollo);
        const castor = new SDK.Castor(apollo, []);

        log.info(`Initializing ${name} agent with mediator DID...`);
        const agent = await SDK.Agent.initialize({ apollo, castor, mediatorDID, pluto, seed: apollo.createRandomSeed().seed });

        log.info(`Starting ${name} agent...`);
        await agent.start();

        log.success(`${name.charAt(0).toUpperCase() + name.slice(1)} agent is ready!`);
        return { agent };
    };

    const createPrismDID = async (agent, role) => {
        log.info(`Creating Prism DID for ${role}...`);
        const issuerDIDTask = new SDK.Tasks.CreatePrismDID({
            authenticationKeyCurve: SDK.Domain.Curve.SECP256K1,
            services: [],
            alias: `${role}-did`
        });
        const issuerDID = await agent.runTask(issuerDIDTask);
        log.success(`${role} DID created: ${issuerDID.toString().substring(0, 50)}...`);
        return issuerDID;
    };

    const createOOBJSONOffer = async (agent, request) => {
        log.info('Creating Out-of-Band (OOB) credential offer...');
        const { id, credentialFormat: format, claims } = request;

        log.info('Creating new peer DID for the offer...');
        const peerDID = await agent.createNewPeerDID();

        log.info('Building credential offer message...');
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

        log.success('OOB credential offer created successfully!');
        log.data('Offer Claims', claims);

        return oobJson;
    };

    const parseOOBOffer = (oobOfferJson, peerDID) => {
        log.info('Parsing OOB offer message...');
        const message = SDK.Domain.Message.fromJson(oobOfferJson);
        const attachment = message.attachments.at(0)?.payload;
        return SDK.Domain.Message.fromJson({
            ...attachment,
            from: message.from,
            to: peerDID,
        });
    };

    const acceptCredentialOffer = async (agent, oobOfferJson) => {
        log.info('Holder accepting credential offer...');
        const peerDID = await agent.createNewPeerDID();
        const credentialOffer = parseOOBOffer(oobOfferJson, peerDID);
        const credentialOfferMessage = SDK.OfferCredential.fromMessage(credentialOffer);

        log.info('Creating credential request message...');
        const requestCredential = await agent.handle(credentialOfferMessage.makeMessage());
        const requestMessage = requestCredential.makeMessage();

        log.info('Sending credential request to issuer...');
        await agent.send(requestMessage);
        log.success('Credential request sent!');
    };

    const waitForMessage = (agent, type, timeout = 30000) => {
        log.info(`Waiting for message of type: ${type}...`);
        return new Promise((resolve, reject) => {
            let timeoutId;
            let listenerRemoved = false;

            const messageListener = (messages) => {
                const found = messages.find((message) => message.piuri === type);
                if (found) {
                    cleanup();
                    log.success(`Received message: ${type}`);
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
                reject(new Error(`Timeout waiting for message type: ${type}`));
            }, timeout);

            agent.addListener(SDK.ListenerKey.MESSAGE, messageListener);
        });
    };

    const issueCredential = async (agent, message, claims, issuerDID, holderDID) => {
        log.info('Issuer processing credential request...');
        log.data('Claims to be issued', claims);

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

        log.info('Running credential issuance protocol...');
        const issued = await agent.runTask(protocol);

        log.info('Sending issued credential to holder...');
        await agent.send(issued.makeMessage());
        log.success('Credential issued and sent to holder!');
    };

    const issuePresentationRequest = async (agent, type, toDID, claims) => {
        log.info('Verifier creating presentation request...');
        log.data('Requested claims', claims);

        const task = new SDK.Tasks.CreatePresentationRequest({ type, toDID, claims });
        const requestPresentation = await agent.runTask(task);
        const requestPresentationMessage = requestPresentation.makeMessage();

        log.info('Sending presentation request to holder...');
        await agent.send(requestPresentationMessage);
        log.success('Presentation request sent!');
    };

    const handlePresentationRequest = async (agent, message, credential) => {
        log.info('Holder processing presentation request...');
        const request = SDK.RequestPresentation.fromMessage(message);

        log.info('Creating presentation using stored credential...');
        const task = new SDK.Tasks.CreatePresentation({ request, credential });
        const presentation = await agent.runTask(task);
        const presentationMessage = presentation.makeMessage();

        log.info('Sending presentation to verifier...');
        await agent.send(presentationMessage);
        log.success('Presentation sent to verifier!');
    };

    const extractCredential = async (agent, message) => {
        log.info('Extracting credential from issued credential message...');
        const protocol = new SDK.Tasks.RunProtocol({
            type: 'credential-issue',
            pid: SDK.ProtocolType.DidcommIssueCredential,
            data: { message }
        });
        const credential = await agent.runTask(protocol);
        log.success('Credential extracted and stored in holder wallet!');
        return credential;
    };

    try {
        log.step(1, "AGENT SETUP");
        log.separator();

        const { agent: issuer } = await createInstance('issuer');
        const { agent: holder } = await createInstance('holder');
        const { agent: verifier } = await createInstance('verifier');

        log.step(2, "DID CREATION");
        log.separator();

        const issuerDID = await createPrismDID(issuer, 'issuer');
        const holderDID = await createPrismDID(holder, 'holder');

        log.step(3, "CREDENTIAL OFFER CREATION");
        log.separator();

        const issuanceRequest = {
            id: '12345',
            claims: [
                { name: 'name', value: 'John Doe', type: 'string' }
            ],
            credentialFormat: SDK.Domain.CredentialType.JWT,
        };

        const oobOfferJson = await createOOBJSONOffer(issuer, issuanceRequest);

        log.step(4, "CREDENTIAL ISSUANCE FLOW");
        log.separator();

        const credentialRequestPromise = waitForMessage(issuer, SDK.ProtocolType.DidcommRequestCredential);
        const credentialIssuedPromise = waitForMessage(holder, SDK.ProtocolType.DidcommIssueCredential);

        await acceptCredentialOffer(holder, oobOfferJson);
        const credentialRequestMessage = await credentialRequestPromise;
        await issueCredential(issuer, credentialRequestMessage, issuanceRequest.claims, issuerDID, holderDID);
        const credentialMessage = await credentialIssuedPromise;
        const credential = await extractCredential(holder, credentialMessage);

        log.step(5, "PRESENTATION REQUEST & VERIFICATION");
        log.separator();

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

        log.info('Verifier validating received presentation...');
        const verify = await verifier.handle(presentationMessage);

        log.step(6, "WORKFLOW COMPLETED");
        log.separator();
        log.success('🎉 Complete credential issuance and presentation workflow finished successfully!');
        log.data('Final verification result', verify);
    } catch (err) {
        console.error('\n❌ ERROR:', err.message);
        console.error(err);
        process.exit(1);
    }
})();

