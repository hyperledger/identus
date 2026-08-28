/* eslint-disable react-hooks/rules-of-hooks */


import { Step } from "@/types";
import React, { useCallback, useEffect, useState } from "react";
import { useAgent, useCastor, useDatabase, usePrismDID } from "@trust0/identus-react/hooks";
import SDK from "@hyperledger/identus-sdk";
import { useWallet } from "@meshsdk/react";
import { Transaction } from "@meshsdk/core";
import { useWorkshop } from "@/pages/_app";
import Image from "next/image";
import { BLOCKFROST_KEY } from "@/config";
import dynamic from "next/dynamic";

const Flowchart = dynamic(() => import("@/components/core/Flowchart"), { ssr: false });

const step: Step = {
    codeSample: {
        language: 'typescript',
        code: `// Step 1: Agent Creation and DID Generation
import SDK from "@hyperledger/identus-sdk";
import { StorageType } from "@trust0/ridb";
import { createStore } from "@trust0/identus-store";

const mediatorDID = 'did:peer:2.Ez6LSr75gLoSwaVHS7MTzcKLXjt9onJMXY9aVEBGWY8ahWPdn.Vz6Mkw5SdxCCxRTfHx1LaGvh2e5JWPWJs7Ek6mjiPXRxqnYHT.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6Imh0dHBzOi8vbWVkaWF0b3IudHJ1c3QwLmlkIiwiYSI6WyJkaWRjb21tL3YyIl19fQ.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6IndzOi8vbWVkaWF0b3IudHJ1c3QwLmlkL3dzIiwiYSI6WyJkaWRjb21tL3YyIl19fQ';

// Helper function to wait for messages
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

// Create agent instances for each role
const createInstance = async (name) => {
    const store = createStore({ dbName: name, storageType: StorageType.InMemory });
    const apollo = new SDK.Apollo();
    const pluto = new SDK.Pluto(store, apollo);
    const castor = new SDK.Castor(apollo, []);

    const agent = await SDK.Agent.initialize({
        apollo,
        castor,
        mediatorDID,
        pluto,
        seed: apollo.createRandomSeed().seed
    });

    await agent.start();
    return { agent };
};

// Create Prism DIDs for agents
const createPrismDID = async (agent, role) => {
    const didTask = new SDK.Tasks.CreatePrismDID({
        authenticationKeyCurve: SDK.Domain.Curve.SECP256K1,
        services: [],
        alias: \`\${role}-did\`
    });
    const did = await agent.runTask(didTask);
    return did;
};

// Usage:
const { agent: issuer } = await createInstance('issuer');
const { agent: holder } = await createInstance('holder');
const { agent: verifier } = await createInstance('verifier');

const issuerDID = await createPrismDID(issuer, 'issuer');
const holderDID = await createPrismDID(holder, 'holder');`
    },
    type: 'issuer',
    disableCondition: (store) => !store.issuerPrismDID,
    title: '',
    description: 'In this step we create the Issuer\'s PrismDID and optionally publish it on Cardano Mainnet',
    content() {
        const {
            setStore,
            ...store
        } = useWorkshop();
        const [published, setPublished] = useState(false);
        const [publishing, setPublishing] = useState(false);
        const { getSettingsByKey, pluto, updateDIDStatus } = useDatabase();
        const { agent, state: agentState } = useAgent();
        const { wallet, connect, connected } = useWallet();
        const castor = useCastor();
        const { prismDID, create, isPublished } = usePrismDID();

        useEffect(() => {
            if (!store.issuerPrismDID && prismDID) {
                setStore({
                    issuerPrismDID: prismDID,
                    issuerPrismDIDPublished: false
                })
            }
        }, [connect, prismDID, setStore, store, connected])

        const createPrismDID = async () => {
            const alias = 'did' + crypto.randomUUID();
            await create(alias);
        }

        const buildAndSubmitTransaction = useCallback(async (metadataBody: any) => {
            if (!wallet) throw new Error("No wallet connected");
            // Create a new transaction with the "initiator" set to the connected wallet
            const tx = new Transaction({ initiator: wallet })
                .sendLovelace(
                    {
                        address: await wallet.getChangeAddress(),
                    },
                    "1000000"
                )
                .setMetadata(21325, metadataBody);
            // Build and sign
            const unsignedTx = await tx.build();
            const signedTx = await wallet.signTx(unsignedTx);
            const txHash = await wallet.submitTx(signedTx);
            return txHash;
        }, [wallet])

        async function checkTransactionConfirmation(txHash: string) {
            try {
                const projectId = await getSettingsByKey('blockfrost-key') ?? BLOCKFROST_KEY;
                if (!projectId) {
                    throw new Error("No blockfrost key found");
                }
                const response = await fetch(
                    `https://cardano-mainnet.blockfrost.io/api/v0/txs/${txHash}`,
                    {
                        headers: {
                            project_id: projectId
                        },
                    }
                );
                return response.ok;
            } catch (error) {
                return false;
            }
        }

        function splitStringIntoChunks(input: Uint8Array, chunkSize = 64): Uint8Array[] {
            const buffer = Buffer.from(input);
            const chunks: Uint8Array[] = [];
            for (let i = 0; i < buffer.length; i += chunkSize) {
                chunks.push(
                    Uint8Array.from(buffer.slice(i, i + chunkSize))
                );
            }
            return chunks;
        }

        const publishPrismDID = async () => {
            if (!agent || agentState !== SDK.Domain.Startable.State.RUNNING) {
                throw new Error("Agent is not running");
            }
            if (!prismDID) {
                throw new Error("Prism DID not found, create one first");
            }

            if (!publishing) {
                setPublishing(true);
            }
            await connect('lace');
            const keys = await pluto.getDIDPrivateKeysByDID(prismDID);
            const document = await agent.castor.resolveDID(prismDID.toString());
            const signingKey = document.verificationMethods.find(key => key.id.includes("#master"));

            if (!signingKey) {
                throw new Error("No master key found");
            }

            const pk = await agent.runTask(new SDK.Tasks.PKInstance({ verificationMethod: signingKey }))
            if (!pk) {
                throw new Error("No master key found");
            }

            const secret = keys.find(key => Buffer.from(key.publicKey().raw).toString('hex') === Buffer.from(pk.raw).toString('hex'))
            if (!secret) {
                throw new Error("No secret key found");
            }
            const atalaObject = await castor.createPrismDIDAtalaObject(secret, prismDID)
            const metadataBody = {
                v: 1,
                c: splitStringIntoChunks(atalaObject),
            };

            const txHash = await buildAndSubmitTransaction(metadataBody);

            const checkConfirmation = async () => {
                const isConfirmed = await checkTransactionConfirmation(txHash);
                if (!isConfirmed) {
                    await new Promise<void>((resolve) => {
                        setTimeout(async () => {
                            await checkConfirmation();
                            resolve();
                        }, 15000);
                    });
                }
            };

            await new Promise<void>((resolve) => {
                setTimeout(async () => {
                    await checkConfirmation();
                    await updateDIDStatus(prismDID, 'published')
                    setPublished(true);
                    setStore({
                        issuerPrismDIDPublished: true
                    })
                    setPublishing(false);
                    resolve();
                }, 15000);
            });
        }

        return <div className="w-full">
            <div className="prose prose-slate max-w-none">
                <h3 className="text-left text-xl font-semibold text-slate-900 mb-4">Creating and Publishing DID</h3>
                <p className="text-base text-slate-700 leading-relaxed">
                    In this step, we will learn how to create and publish the Issuer&apos;s DID on Cardano Blockchain using Lace Wallet.
                </p>
            </div>
            <div className="w-full ">
                <Flowchart stepType="did" />
            </div>
            <div className="space-y-4">

                {!prismDID ? (
                    <button
                        type="button"
                        onClick={createPrismDID}
                        className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                        Create Prism DID
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <div className="flex items-center mb-2">
                                <div className="flex-shrink-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-2">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <title>Success checkmark</title>
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-emerald-800">DID Successfully Created</p>
                            </div>
                            <div className="bg-white p-3 rounded border border-emerald-200">
                                <p className="text-sm text-slate-700 font-mono break-all">
                                    {
                                        store.issuerPrismDIDPublished ?
                                            prismDID.toString().slice(0, 74) :
                                            prismDID.toString()
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {connected && prismDID && !published && (
                    <button
                        type="button"
                        disabled={published || publishing}
                        onClick={publishPrismDID}
                        className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <Image src="/lace.svg" alt="Lace Wallet" className="w-5 h-5" width={5} height={5} />
                            <span>{publishing ? 'Waiting for TX Confirmation...' : 'Publish With Lace Wallet'}</span>
                        </div>
                    </button>
                )}
            </div>
        </div>
    }
}

export default step;
