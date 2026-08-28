import { addRxPlugin } from "rxdb";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";

addRxPlugin(RxDBDevModePlugin);

import { AnyAction, ThunkDispatch, createAsyncThunk } from "@reduxjs/toolkit";
import SDK from "@hyperledger/identus-edge-agent-sdk";
import { sha512 } from '@noble/hashes/sha512'
import { RootState, reduxActions } from "@/reducers/app";
import InMemory from '@pluto-encrypted/inmemory'
import { PresentationClaims } from "../../../../src/domain";


const Agent = SDK.Agent;
const BasicMessage = SDK.BasicMessage;
const OfferCredential = SDK.OfferCredential;
const ListenerKey = SDK.ListenerKey;
const IssueCredential = SDK.IssueCredential;
const RequestPresentation = SDK.RequestPresentation;


export const acceptPresentationRequest = createAsyncThunk<
    any,
    {
        agent: SDK.Agent,
        message: SDK.Domain.Message,
        credential: SDK.Domain.Credential
    }
>("acceptPresentationRequest", async (options, api) => {
    try {
        const { agent, message, credential } = options;
        const requestPresentation = RequestPresentation.fromMessage(message);
        try {
            const presentation = await agent.createPresentationForRequestProof(requestPresentation, credential);
            await agent.sendMessage(presentation.makeMessage());
        } catch (err) {
            console.log("continue after err", err);
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
        return api.fulfillWithValue(null);
    } catch (err) {
        return api.rejectWithValue(err as Error);
    }
})

export const rejectPresentationRequest = createAsyncThunk<
    any,
    {
        message: SDK.Domain.Message,
        pluto: SDK.Domain.Pluto
    }
>("rejectPresentationRequest", async (options, api) => {
    try {
        const { message, pluto } = options;
        const requestPresentation = RequestPresentation.fromMessage(message);
        await pluto.deleteMessage(message.id)
        return api.fulfillWithValue(requestPresentation);
    } catch (err) {
        return api.rejectWithValue(err as Error);
    }
})

export const rejectCredentialOffer = createAsyncThunk<
    any,
    {
        message: SDK.Domain.Message,
        pluto: SDK.Domain.Pluto
    }
>("rejectCredentialOffer", async (options, api) => {
    try {
        const { message, pluto } = options;
        const credentialOffer = OfferCredential.fromMessage(message);
        await pluto.deleteMessage(message.id)
        return api.fulfillWithValue(credentialOffer);
    } catch (err) {
        return api.rejectWithValue(err as Error);
    }
})

export const acceptCredentialOffer = createAsyncThunk<
    any,
    {
        agent: SDK.Agent,
        message: SDK.Domain.Message
    }
>("acceptCredentialOffer", async (options, api) => {
    try {
        const { agent, message } = options;
        const credentialOffer = OfferCredential.fromMessage(message);
        const requestCredential = await agent.prepareRequestCredentialWithIssuer(credentialOffer);
        try {
            const requestMessage = requestCredential.makeMessage()
            await agent.sendMessage(requestMessage);
        } catch (err) {
            console.log("continue after err", err);
        }
        return api.fulfillWithValue(null);
    } catch (err) {
        return api.rejectWithValue(err as Error);
    }
})


async function handleMessages(
    options: {
        dispatch: ThunkDispatch<unknown, unknown, AnyAction>,
        agent: SDK.Agent,
    },
    newMessages: SDK.Domain.Message[]
) {
    const { agent, dispatch } = options;
    const issuedCredentials = newMessages.filter((message) => message.piuri === "https://didcomm.org/issue-credential/3.0/issue-credential");
    if (issuedCredentials.length) {
        for (const issuedCredential of issuedCredentials) {
            const issueCredential = IssueCredential.fromMessage(issuedCredential);
            const credential = await agent.processIssuedCredentialMessage(issueCredential);
            dispatch(
                reduxActions.credentialSuccess(
                    credential
                )
            )
        }
    }
    dispatch(
        reduxActions.messageSuccess(
            newMessages
        )
    )
}

export const stopAgent = createAsyncThunk<
    { agent: SDK.Agent },
    { agent: SDK.Agent }
>("stopAgent", async (options, api) => {
    try {
        const { agent } = options
        agent.removeListener(ListenerKey.MESSAGE, handleMessages.bind({}, { dispatch: api.dispatch, agent }));
        await agent.stop()
        return api.fulfillWithValue({ agent })
    } catch (err) {
        return api.rejectWithValue(err as Error);
    }
})


export const startAgent = createAsyncThunk<
    { agent: SDK.Agent, selfDID: SDK.Domain.DID },
    { agent: SDK.Agent }
>("startAgent", async (options, api) => {
    try {
        const { agent } = options;
        agent.addListener(ListenerKey.MESSAGE, handleMessages.bind({}, { dispatch: api.dispatch, agent }));
        await agent.start()

        return api.fulfillWithValue({ agent, selfDID: await agent.createNewPeerDID([], true) })
    } catch (err) {
        return api.rejectWithValue(err as Error);
    }
})

export const sendMessage = createAsyncThunk<
    { message: SDK.Domain.Message },
    {
        agent: SDK.Agent,
        message: SDK.Domain.Message
    }
>('sendMessage', async (options, api) => {
    try {
        const { agent, message } = options;
        await agent.sendMessage(message);
        await agent.pluto.storeMessage(message);

        api.dispatch(
            reduxActions.messageSuccess(
                [message]
            )
        )
        return api.fulfillWithValue({ message });
    } catch (err) {
        return api.rejectWithValue(err as Error);
    }
})

export const initiatePresentationRequest = createAsyncThunk<
    any,
    {
        agent: SDK.Agent,
        toDID: SDK.Domain.DID,
        presentationClaims: PresentationClaims<SDK.Domain.CredentialType>,
        type: SDK.Domain.CredentialType
    }
>("initiatePresentationRequest", async (options, api) => {
    try {
        const {
            agent,
            presentationClaims,
            toDID,
            type
        } = options;

        await agent.initiatePresentationRequest<typeof type>(
            type,
            toDID,
            presentationClaims
        );

        return api.fulfillWithValue(null)
    } catch (err) {
        return api.rejectWithValue(err as Error);
    }
})

//This is for demonstration purposes and assumes that
//The Cloud agent is running on port ::::::
//Resolver at some point will be configurable to run on specific universal resolver endpoints
//for testnet, mainnet switching, etc
class ShortFormDIDResolverSample implements SDK.Domain.DIDResolver {
    method: string = "prism"

    private async parseResponse(response: Response) {
        const data = await response.text();
        try {
            return JSON.parse(data);
        }
        catch {
            return data;
        }
    }

    async resolve(didString: string): Promise<SDK.Domain.DIDDocument> {
        const url = "http://localhost:8000/cloud-agent/dids/" + didString;
        const response = await fetch(url, {
            "headers": {
                "accept": "*/*",
                "accept-language": "en",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-gpc": "1"
            },
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
        })
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const didDocument = data.didDocument;

        const servicesProperty = new SDK.Domain.Services(
            didDocument.service
        )
        const verificationMethodsProperty = new SDK.Domain.VerificationMethods(
            didDocument.verificationMethod
        )
        const coreProperties: SDK.Domain.DIDDocumentCoreProperty[] = [];
        const authenticate: SDK.Domain.Authentication[] = [];
        const assertion: SDK.Domain.AssertionMethod[] = [];

        for (const verificationMethod of didDocument.verificationMethod) {
            const isAssertion = didDocument.assertionMethod.find((method) => method === verificationMethod.id)
            if (isAssertion) {
                assertion.push(new SDK.Domain.AssertionMethod([isAssertion], [verificationMethod]))
            }
            const isAuthentication = didDocument.authentication.find((method) => method === verificationMethod.id)
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

export const initAgent = createAsyncThunk<
    { agent: SDK.Agent },
    {
        mediatorDID: SDK.Domain.DID,
        pluto: SDK.Domain.Pluto,
        defaultSeed: SDK.Domain.Seed
    }
>("initAgent", async (options, api) => {
    try {
        const { mediatorDID, pluto, defaultSeed } = options;

        const apollo = new SDK.Apollo();
        const extraResolvers = [
            ShortFormDIDResolverSample
        ];
        const castor = new SDK.Castor(apollo, extraResolvers)
        const agent = await Agent.initialize({
            apollo,
            castor,
            mediatorDID,
            pluto,
            seed: defaultSeed
        });
        return api.fulfillWithValue({
            agent,
        })
    } catch (err) {
        return api.rejectWithValue(err as Error);
    }
})

export const connectDatabase = createAsyncThunk<
    {
        db: SDK.Domain.Pluto
    },
    {
        encryptionKey: Uint8Array,
    },
    { state: { app: RootState } }
>("connectDatabase", async (options, api) => {
    try {
        const hashedPassword = sha512(options.encryptionKey)
        const apollo = new SDK.Apollo();
        const store = new SDK.Store({
            name: "test",
            storage: InMemory,
            password: Buffer.from(hashedPassword).toString("hex")
        });
        const db = new SDK.Pluto(store, apollo);
        await db.start();
        const messages = await db.getAllMessages()
        const connections = await db.getAllDidPairs()
        const credentials = await db.getAllCredentials();
        api.dispatch(
            reduxActions.dbPreload(
                { messages, connections, credentials }
            )
        );
        return api.fulfillWithValue({ db });
    } catch (err) {
        return api.rejectWithValue(err as Error);
    }
});
