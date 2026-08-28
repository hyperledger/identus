
import { Box } from "@/app/Box";
import SDK from "@hyperledger/identus-edge-agent-sdk";
import React from "react";
import * as jose from "jose";
import { trimString } from "../app/utils";

const apollo = new SDK.Apollo();

function Signatures({ keyPair }: { keyPair: SDK.Domain.KeyPair; }) {
    const [originalText, setOriginalText] = React.useState<string | undefined>("Random text");
    const [signatureEncoded, setSignatureEncoded] = React.useState<string | undefined>(undefined);
    const [isSignatureValid, setIsSignatureValid] = React.useState<boolean | undefined>(undefined);

    function signData() {
        if (!originalText) {
            throw new Error("Incomplete originaalText")
        }
        if (keyPair.privateKey.isSignable()) {
            const helloWorldSig = keyPair.privateKey.sign(Buffer.from(originalText));
            setSignatureEncoded(jose.base64url.encode(helloWorldSig));
        }
    }

    function verifySignature() {
        if (!signatureEncoded) return;

        let isValid;

        try {
            if (!originalText) {
                throw new Error("Incomplete originaalText")
            }
            if (keyPair.publicKey.canVerify()) {
                isValid = keyPair.publicKey.verify(Buffer.from(originalText), Buffer.from(jose.base64url.decode(signatureEncoded)));
            }

        } catch (e) {
            console.warn("Failed to validate signature", e);
            isValid = false;
        }

        setIsSignatureValid(isValid);
    }

    if (keyPair.curve === SDK.Domain.Curve.X25519) {
        return <b>Signatures not supported for X25519 keys!</b>;
    }

    return (
        <Box>
            <h1 className="mb-4 text-md font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                <span className=" decoration-8 decoration-blue-400 dark:decoration-blue-600">
                    Operations
                </span>
            </h1>
            <div className="flex">
                <div className="w-full">
                    <button
                        className="my-5 inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900" onClick={signData}>Sign</button>
                    <button className="mx-2 my-5 inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900" onClick={verifySignature}>Verify signature</button>


                    <textarea id="message" rows={4} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write the text you want to sign"
                        value={originalText}
                        onChange={(e) => {
                            setOriginalText(e.target.value)

                        }}
                    />

                    {signatureEncoded && signatureEncoded.length > 0 ?
                        <div>
                            <p className=" text-lg font-normal text-gray-500 lg:text-xl  dark:text-gray-400">Your signature</p>
                            <input onChange={(e) => {
                                setSignatureEncoded(e.target.value)

                            }}
                                value={signatureEncoded} className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                        </div>
                        : null}

                    <p>
                        {typeof isSignatureValid === "boolean"
                            ? `Signature is ${isSignatureValid ? "valid" : "invalid"}`
                            : null}
                    </p>
                </div>
            </div>


        </Box>
    );
}

export function KeyPair({ curve = SDK.Domain.Curve.SECP256K1 }: { curve?: SDK.Domain.Curve; }) {
    const [keyPair, setKeyPair] = React.useState<SDK.Domain.KeyPair>();

    function createKeyPair() {
        const mnemonics = apollo.createRandomMnemonics()
        const seed = apollo.createSeed(mnemonics, "my-secret");
        const type = curve === SDK.Domain.Curve.X25519 ? SDK.Domain.KeyTypes.Curve25519 : SDK.Domain.KeyTypes.EC;
        const privateKey = apollo.createPrivateKey({
            type: type,
            curve: curve,
            seed: Buffer.from(seed.value).toString("hex"),
        });

        setKeyPair({
            curve: curve,
            privateKey: privateKey,
            publicKey: privateKey.publicKey()
        });
    }

    return (
        <Box>
            <h1 className="mb-4 text-1xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                <span className=" decoration-8 decoration-blue-400 dark:decoration-blue-600">
                    {curve} key pair
                </span>
            </h1>
            <button className="my-5 inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900" onClick={createKeyPair}>Create keypair</button>
            {keyPair ? (
                <div>
                    <p>
                        <b>Curve:</b> {keyPair.curve}
                    </p>
                    <p>
                        <b>Public key:</b>{" "}
                        {trimString(jose.base64url.encode(keyPair.publicKey.value), 50)}
                    </p>
                    <p>
                        <b>Private key:</b>{" "}
                        {trimString(jose.base64url.encode(keyPair.privateKey.value), 50)}
                    </p>


                    <Signatures keyPair={keyPair} />
                </div>
            ) : (
                <p>No key pair created</p>
            )}
        </Box >
    );
}
