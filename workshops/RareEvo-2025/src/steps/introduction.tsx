/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */

import { Step } from "@/types";
import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

const CodeComponent = dynamic(() => import('@/components/core/CodeEditor').then((e) => e.CodeComponent), {
    ssr: false,
});

const Flowchart = dynamic(() => import("@/components/core/Flowchart"), { ssr: false });

const step: Step = {
    type: 'issuer',
    disableCondition: (store) => !store.issuerStarted,
    title: '',
    description: '',
    codeSample: {
        language: 'typescript',
        code: `// Hyperledger Identus SDK Workshop - Complete Workflow Setup
import SDK from "@hyperledger/identus-sdk";
import { StorageType } from "@trust0/ridb";
import { createStore } from "@trust0/identus-store";
import { v4 as uuidv4 } from 'uuid';
import { base64 } from 'multiformats/bases/base64';

// Mediator DID for agent communication
const mediatorDID = 'did:peer:2.Ez6LSr75gLoSwaVHS7MTzcKLXjt9onJMXY9aVEBGWY8ahWPdn.Vz6Mkw5SdxCCxRTfHx1LaGvh2e5JWPWJs7Ek6mjiPXRxqnYHT.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6Imh0dHBzOi8vbWVkaWF0b3IudHJ1c3QwLmlkIiwiYSI6WyJkaWRjb21tL3YyIl19fQ.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6IndzOi8vbWVkaWF0b3IudHJ1c3QwLmlkL3dzIiwiYSI6WyJkaWRjb21tL3YyIl19fQ';

// This workshop demonstrates the complete flow of:
// 1. Setting up Agents (Issuer, Holder, Verifier)
// 2. Creating DIDs
// 3. Issuing Credentials
// 4. Requesting & Verifying Presentations`
    },
    content() {
        return (
            <div className="min-h-screen">
                <div className="px-8 py-12">
                    {/* Header Section with Logos */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-6 mb-8">
                            <Image
                                src="/cardano-ada-logo.webp"
                                alt="RareEvo 2025"
                                width={180}
                                height={70}
                                className="object-contain"
                            />
                            <div className="text-5xl text-gray-300">×</div>
                            <Image
                                src="/identus-logo.svg"
                                alt="Hyperledger Identus"
                                width={260}
                                height={70}
                                className="object-contain"
                            />
                            <div className="text-5xl text-gray-300">×</div>
                            <Image
                                src="/lace.svg"
                                alt="Lace Wallet"
                                width={120}
                                height={70}
                                className="object-contain"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <span className="mr-4 text-4xl">👋</span>
                                Welcome
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-4">
                                Join us for an immersive hands-on workshop exploring the future of digital identity.
                                We'll build a complete identity ecosystem using cutting-edge technologies that are
                                reshaping how we think about digital credentials and privacy.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                This workshop demonstrates real-world applications of decentralized identity,
                                from credential issuance to verification, all powered by Cardano blockchain technology.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
                            <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center">
                                <span className="mr-4 text-4xl">🚀</span>
                                Run It Locally
                            </h2>
                            <p className="text-lg text-center mb-6 text-blue-100">
                                Scan the QR code below to access your local workshop environment
                            </p>
                            <div className="flex justify-center">
                                <div className="bg-white p-3 rounded-xl shadow-lg">
                                    <Image
                                        src="/qr-code.png"
                                        alt="QR Code for Local Environment"
                                        width={280}
                                        height={280}
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Flowchart stepType="introduction" />

                </div>
            </div>
        );
    }
}

export default step;
