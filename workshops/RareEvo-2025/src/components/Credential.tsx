import React, { useCallback, useState } from "react";

import SDK from "@hyperledger/identus-sdk";
import { useAgent } from "@trust0/identus-react/hooks";


function protect(credential: SDK.Domain.Credential) {
    const newClaims: any[] = []
    credential.claims.forEach((claim) => {
        const newClaim = {} as any
        Object.keys(claim).forEach((key) => {
            newClaim[key] = "******"
        })
        newClaims.push(newClaim)
    })
    return newClaims
}

export function Credential(props: { credential: SDK.Domain.Credential }) {
    const { credential } = props;
    const { agent, state: agentState } = useAgent();
    const [claims, setClaims] = useState(protect(credential));

    const revealAttributes = useCallback(async (credential: SDK.Domain.Credential, claimIndex: number, field: string) => {
        if (agent && agentState === SDK.Domain.Startable.State.RUNNING) {
            const linkSecret = await agent.pluto.getLinkSecret();
            const revealedFields = await agent.revealCredentialFields(
                credential,
                [field],
                linkSecret?.secret ?? ''
            )
            const revealed = claims.map((claim, index) => {
                if (claimIndex === index) {
                    return {
                        ...claim,
                        [field]: (revealedFields as any)[field]
                    }
                }
                return claim
            })
            setClaims(revealed)
        }
    }, [agent, agentState, claims])

    const credentialType = credential.credentialType || "Digital Credential";

    return (
        <div className="w-full mt-2 md:mt-3 lg:mt-4">
            <div className="bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-green-500 dark:from-teal-600 dark:to-green-600 p-3 md:p-4 lg:p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 md:space-x-2 lg:space-x-3">
                            <div className="bg-white/20 backdrop-blur-sm rounded p-1.5 md:p-2 lg:p-2.5">
                                <svg className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-sm md:text-base lg:text-lg font-semibold text-white">{credentialType}</h2>
                                <p className="text-xs md:text-sm lg:text-base text-teal-100">Verified Credential</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-0.5 md:space-x-1 lg:space-x-1.5">
                            <div className="w-1 h-1 md:w-1.5 md:h-1.5 lg:w-2 lg:h-2 bg-green-400 rounded-full"></div>
                            <span className="text-xs md:text-sm lg:text-base text-white">Active</span>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-3 md:p-4 lg:p-5">
                    {/* Issuer Section */}
                    <div className="mb-3 md:mb-4 lg:mb-5 pb-3 md:pb-4 lg:pb-5 border-b border-gray-200 dark:border-gray-700">
                        <label className="text-xs md:text-sm lg:text-base font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Issued By</label>
                        <p className="mt-0.5 md:mt-1 lg:mt-1.5 text-xs md:text-sm lg:text-base font-medium text-gray-800 dark:text-white">{credential.issuer}</p>
                    </div>

                    {/* Credentials Fields */}
                    <div className="space-y-2 md:space-y-3 lg:space-y-4">
                        {claims.map((claim, claimIndex) => (
                            <div key={`claim-${claimIndex}`} className="space-y-2 md:space-y-3 lg:space-y-4">
                                {Object.keys(claim)
                                    .filter((field) => field !== "id")
                                    .map((field, i) => (
                                        <div key={`field${claimIndex}-${i}`} className="group">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <label className="text-xs md:text-sm lg:text-base font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                        {field.replace(/_/g, ' ')}
                                                    </label>
                                                    <div className="mt-0.5 md:mt-1 lg:mt-1.5 flex items-center space-x-1 md:space-x-2 lg:space-x-3">
                                                        {claim[field] === "******" ? (
                                                            <>
                                                                <p className="text-xs md:text-sm lg:text-base text-gray-400 dark:text-gray-500">
                                                                    •••••••••
                                                                </p>
                                                                <button
                                                                    onClick={() => revealAttributes(credential, claimIndex, field)}
                                                                    className="ml-0.5 md:ml-1 lg:ml-1.5 px-1.5 py-0.5 md:px-2 md:py-1 lg:px-3 lg:py-1.5 text-xs md:text-sm lg:text-base font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-all duration-300"
                                                                >
                                                                    <svg className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                    <span>Reveal</span>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <p className="text-xs md:text-sm lg:text-base font-medium text-gray-800 dark:text-white break-all">
                                                                {claim[field]}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-3 md:mt-4 lg:mt-5 pt-2 md:pt-3 lg:pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-xs md:text-sm lg:text-base text-gray-500 dark:text-gray-400">
                            <span>ID: {credential.id.slice(0, 8)}...</span>
                            <span>{credential.credentialType || "Standard"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
