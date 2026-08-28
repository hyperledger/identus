'use client';

import React from "react";
import { Hooks, NextFnProps, Step } from "@/types";
import { AgentWorkFlow } from "../AgentWorkFlow";
import { DatabaseContext, AgentContext, ConnectionsContext, CredentialsContext, HolderContext, IssuerContext, MessagesContext, PeerDIDContext, PrismDIDContext, VerifierContext } from "@trust0/identus-react/context";
import { Status } from "../Status";
import dynamic from "next/dynamic";

const CodeComponent = dynamic(() => import("@/components/core/Codes").then(mod => mod.Codes), { ssr: false });

export function WithContext({ context, children }: { context: Partial<Hooks>, children?: React.ReactNode }) {
    if (!context) return null;
    const {
        useAgent,
        useDatabase,
        useConnections,
        useCredentials,
        useHolder,
        useIssuer,
        useMessages,
        usePeerDID,
        usePrismDID,
        useVerifier,
    } = context;
    return (
        <DatabaseContext.Provider value={useDatabase}>
            <CredentialsContext.Provider value={useCredentials}>
                <AgentContext.Provider value={useAgent}>
                    <HolderContext.Provider value={useHolder}>
                        <IssuerContext.Provider value={useIssuer}>
                            <VerifierContext.Provider value={useVerifier}>
                                <MessagesContext.Provider value={useMessages}>
                                    <ConnectionsContext.Provider value={useConnections}>
                                        <PeerDIDContext.Provider value={usePeerDID}>
                                            <PrismDIDContext.Provider value={usePrismDID}>
                                                {children}
                                            </PrismDIDContext.Provider>
                                        </PeerDIDContext.Provider>
                                    </ConnectionsContext.Provider>
                                </MessagesContext.Provider>
                            </VerifierContext.Provider>
                        </IssuerContext.Provider>
                    </HolderContext.Provider>
                </AgentContext.Provider>
            </CredentialsContext.Provider>
        </DatabaseContext.Provider>
    );
}



export function StepComponent(props: { step: Step } & NextFnProps) {
    const { step } = props;
    const agentType = step.type || 'issuer';
    const Content = step.content;
    return <AgentWorkFlow type={agentType}>
        <div className={`rounded-2xl flex flex-col flex-grow p-4 md:p-6 lg:p-8 xl:p-12 w-full`}>
            {
                step.title !== '' && <div className="flex items-center justify-between mb-4 md:mb-6 lg:mb-8">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-blue-700">
                        {step.title}
                    </h2>
                    <Status type={agentType}/>
                </div>
            }

            {
                step.description && <p className="text-left text-gray-600 leading-relaxed mb-4 md:mb-6 lg:mb-8 text-sm md:text-base lg:text-lg">
                    {step.description}
                </p>
            }
                <Content type={agentType} setIsPopupOpen={step.setIsPopupOpen} />

                {
                step.codeSample && <CodeComponent codes={{
                    ['Show code example']: step.codeSample
                }} setIsPopupOpen={step.setIsPopupOpen} />
            }
        </div>
    </AgentWorkFlow>

}
