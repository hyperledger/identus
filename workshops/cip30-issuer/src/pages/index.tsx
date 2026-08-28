import React, { useState, useEffect } from "react";
import SDK from "@hyperledger/identus-edge-agent-sdk";
import "../app/index.css";

// Mesh imports
import { useWallet } from "@meshsdk/react";
import { Transaction, Wallet, BrowserWallet } from "@meshsdk/core";

import { PageHeader } from "@/components/PageHeader";

const Agent: React.FC = () => {
  // Pull basic wallet functions/info from Mesh
  const { wallet, connected, connect } = useWallet();

  // Manage the list of available wallets correctly by awaiting the promise
  const [availableWallets, setAvailableWallets] = useState<Wallet[]>([]);
  useEffect(() => {
    // Query available wallets
    BrowserWallet.getAvailableWallets().then((foundWallets) => {
      setAvailableWallets(foundWallets);
    });
  }, []);

  // Wizard step
  const [currentStep, setCurrentStep] = useState(0);

  // Master key and publish status
  const [masterKey, setMasterKey] = useState<SDK.Domain.PrivateKey>();
  const [did, setDid] = useState<string>();
  const [shortFormDid, setShortFormDid] = useState<string>();

  const [publishStatus, setPublishStatus] = useState<{
    status: "idle" | "publishing" | "confirming" | "completed" | "error";
    message?: string;
    txHash?: string;
  }>({ status: "idle" });

  const [error, setError] = useState<string>();

  // Define wizard steps
  const steps = [
    {
      title: "Connect Wallet",
      description: "Select your wallet to begin",
    },
    {
      title: "Create Master Key",
      description: "Generate your Prism DID master key",
    },
    {
      title: "Publish DID",
      description: "Publish your DID to the blockchain",
    },
  ];

  /**
  * Create a new Prism DID master key using the Identus Edge Agent SDK.
  */
  async function onCreateMasterKey() {
    const apollo = new SDK.Apollo();
    const castor = new SDK.Castor(apollo);
    const masterSK = apollo.createPrivateKey({
      type: SDK.Domain.KeyTypes.EC,
      curve: SDK.Domain.Curve.SECP256K1,
      seed: Buffer.from(apollo.createRandomSeed().seed.value).toString("hex"),
    });
    // 1) Create a DID from the masterKey
    const did = await castor.createPrismDID(masterSK.publicKey());
    console.log("Transaction DID:", did.toString());

    const shortForm = did.toString().split(":").slice(0, 3).join(":");
    setShortFormDid(shortForm);
    setDid(did.toString());
    setMasterKey(masterSK);
  }

  /**
  * Chunk a large string into smaller parts (used for storing DID data in metadata).
  */
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

  /**
  * Check for transaction confirmation on-chain by hitting Blockfrost.
  */
  async function checkTransactionConfirmation(txHash: string) {
    try {
      const response = await fetch(
        `https://cardano-mainnet.blockfrost.io/api/v0/txs/${txHash}`,
        {
          headers: {
            project_id: process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY!,
          },
        }
      );
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
  * Build and submit a transaction using Mesh.
  */
  async function buildAndSubmitTransaction(metadataBody: any): Promise<string> {
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
  }

  /**
  * Orchestrates DID creation & transaction submission flow.
  */
  async function onPublishDID() {
    if (!masterKey) {
      return alert("Please create a master key first");
    }
    if (!connected) {
      return alert("Please connect a wallet via the Mesh UI");
    }
    if (!did) {
      return alert("Please create a DID first");
    }

    try {
      setPublishStatus({
        status: "publishing",
        message: "Creating DID operation...",
      });

      const apollo = new SDK.Apollo();
      const castor = new SDK.Castor(apollo);


      // 2) Build the Atala Prism DID object
      const atalaObject = await castor.createPrismDIDAtalaObject(
        masterKey,
        SDK.Domain.DID.fromString(did)
      );

      // 3) Break that object into chunks for metadata
      const metadataBody = {
        v: 1,
        c: splitStringIntoChunks(atalaObject),
      };

      setPublishStatus({
        status: "publishing",
        message: "Building and signing transaction...",
      });

      // 4) Submit transaction with metadata
      const txHash = await buildAndSubmitTransaction(metadataBody);

      // 5) Poll for confirmation
      setPublishStatus({
        status: "confirming",
        message: "Transaction submitted. Waiting for confirmation...",
        txHash,
      });

      const checkConfirmation = async () => {
        const isConfirmed = await checkTransactionConfirmation(txHash);
        if (isConfirmed) {
          setPublishStatus({
            status: "completed",
            message: "DID successfully published!",
            txHash,
          });
        } else {
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
          resolve();
        }, 15000);
      });
    } catch (err) {
      console.error("Error during transaction:", err);
      setPublishStatus({
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error occurred",
      });
    }
  }

  return (
    <div className="mx-10 mt-5 mb-30">
      <PageHeader>
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
          Edge Agent
        </h1>
      </PageHeader>

      <div className="w-full mt-5 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-900">
        {/* Stepper */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex-1 flex items-center ${
                index < steps.length - 1 ? "mr-4" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === index
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index + 1}
              </div>
              <div className="ml-2">
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-200 ml-4" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Select Wallet</h2>
            {availableWallets.length === 0 ? (
              <p className="text-gray-500">Loading wallets...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableWallets.map((foundWallet: Wallet) => (
                  <button
                    key={foundWallet.name}
                    className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                    onClick={() => {
                      connect(foundWallet.name);
                      setCurrentStep(1);
                    }}
                  >
                    <img
                      src={foundWallet.icon}
                      alt={foundWallet.name}
                      className="w-8 h-8 mr-4"
                    />
                    <span className="text-lg font-medium">
                      {foundWallet.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Create Master Key</h2>
            <button
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={onCreateMasterKey}
            >
              Create Master Key
            </button>
            {masterKey && (
              <div className="mt-4">
                <p className="text-green-600">
                  Master key created successfully!
                </p>

              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Publish DID</h2>
            <p className="text-sm mb-4">You are about to publish your Prism DID <span className="text-xs font-bold">{shortFormDid}</span> on Cardano Mainnet.</p>

            <button
              className={`px-6 py-2 text-white rounded ${
                !masterKey || !connected
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              onClick={onPublishDID}
              disabled={!masterKey || !connected}
            >
              Publish Prism DID
            </button>
            {/* Error Display */}
            {error && (
              <pre className="text-red-500 mt-4">Error: {error}</pre>
            )}

            {/* Publish Status Display */}
            {publishStatus.status !== "idle" && (
              <div className="mt-4 p-4 rounded">
                {publishStatus.status === "publishing" && (
                  <div className="flex items-center text-yellow-500">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {publishStatus.message}
                  </div>
                )}
                {publishStatus.status === "confirming" && (
                  <div className="flex items-center text-blue-500">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {publishStatus.message}
                    {publishStatus.txHash && (
                      <a
                        href={`https://cardanoscan.io/transaction/${publishStatus.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-500 hover:text-blue-700 underline"
                      >
                        View transaction
                      </a>
                    )}
                  </div>
                )}
                {publishStatus.status === "completed" && (
                  <div className="text-green-500">
                    ✓ {publishStatus.message}
                    {publishStatus.txHash && (
                      <a
                        href={`https://cardanoscan.io/transaction/${publishStatus.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-500 hover:text-blue-700 underline"
                      >
                        View transaction
                      </a>
                    )}
                  </div>
                )}
                {publishStatus.status === "error" && (
                  <div className="text-red-500">✗ {publishStatus.message}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          {currentStep > 0 && (
            <button
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous
            </button>
          )}
          {currentStep < steps.length - 1 && masterKey && (
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Agent;
