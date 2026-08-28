import React from "react";
import SDK from "@hyperledger/identus-edge-agent-sdk";
import { Box } from "../app/Box";

const apollo = new SDK.Apollo();
const castor = new SDK.Castor(apollo);


export function Dids() {
    const [prismDid, setPrismDid] = React.useState<SDK.Domain.DID | null>(null);
    const [peerDid, setPeerDid] = React.useState<SDK.Domain.DID | null>(null);

    const exampleService = new SDK.Domain.Service("didcomm", ["DIDCommMessaging"], {
        uri: "https://example.com/endpoint",
        accept: ["didcomm/v2"],
        routingKeys: ["did:example:somemediator#somekey"],
    });

    async function createPrismDid() {

        const seed = apollo.createSeed(apollo.createRandomMnemonics(), "my-secret");
        const privateKey = apollo.createPrivateKey({
            type: SDK.Domain.KeyTypes.EC,
            curve: SDK.Domain.Curve.SECP256K1,
            seed: Buffer.from(seed.value).toString("hex"),
        });

        const prismDID = await castor.createPrismDID(privateKey.publicKey(), [
            exampleService,
        ]);

        setPrismDid(prismDID);
    }

    async function resolvePrismDid() {
        if (!prismDid) return;
        const didStr = prismDid.toString();
        const didDoc = await castor.resolveDID(didStr);

        console.log("DID DOC", didDoc);
    }

    async function createPeerDid() {

        const authPrivateKey = apollo.createPrivateKey({
            type: SDK.Domain.KeyTypes.EC,
            curve: SDK.Domain.Curve.ED25519,
        });

        const keyAgreementPrivateKey = apollo.createPrivateKey({
            type: SDK.Domain.KeyTypes.Curve25519,
            curve: SDK.Domain.Curve.X25519,
        });

        const peerDID = await castor.createPeerDID(
            [authPrivateKey.publicKey(), keyAgreementPrivateKey.publicKey()],
            [exampleService]
        );

        setPeerDid(peerDID);
    }

    async function resolvePeerDid() {
        if (!peerDid) return;
        const didStr = peerDid.toString();
        const didDoc = await castor.resolveDID(didStr);

        console.log("DID DOC", didDoc);
    }

    return (
        <Box>
            <h1 className="mb-4 text-1xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                <span className=" decoration-8 decoration-blue-400 dark:decoration-blue-600">DIDS</span>
            </h1>

            <div className="flex">
                <div className="w-1/2">
                    <div
                        className="w-full mt-5 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
                    >
                        <button className="my-5 inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900" onClick={createPrismDid}>Create PRISM DID</button>
                        {prismDid ? (
                            <>
                                <p
                                    className="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400 overflow-x-auto h-auto"
                                >
                                    <b>PRISM DID: </b>

                                    {prismDid.toString()}
                                </p>
                                <br />
                                <button className="my-5 inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900" style={{ width: 120 }} onClick={resolvePrismDid}>
                                    Resolve
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
                <div className="w-1/2">
                    <div
                        className="w-full mt-5 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 "
                    >
                        <button className="my-5 inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900" onClick={createPeerDid}>Create Peer DID</button>
                        {peerDid ? (

                            <>
                                <p
                                    className="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400 overflow-x-auto h-auto"
                                >
                                    <b>Peer DID: </b>
                                    {peerDid.toString()}
                                </p>


                                <button className="my-5 inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900" style={{ width: 120 }} onClick={resolvePeerDid}>
                                    Resolve
                                </button>
                            </>

                        ) : null}
                    </div>
                </div>
            </div>
        </Box>
    );
}
