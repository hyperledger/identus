'use client'
import { AgentType, NextFnProps } from "@/types";
import React, { useCallback, useEffect, useState } from "react";
import { useAgent, useDatabase } from "@trust0/identus-react/hooks";
import { BLOCKFROST_KEY, MEDIATOR_DID, RESOLVER_URL } from "@/config";
import SDK from "@hyperledger/identus-sdk";
import { Mnemonics } from "./Mnemonics";
import { StorageType } from "@trust0/ridb";

export function AgentWorkFlow({children, type: agentType}: {children: React.ReactNode, type: AgentType} & NextFnProps) {
    const [step, setStep] = useState<'disconnected'|'seed' | 'ready' | 'busy'>('disconnected')
    const {
        state: dbState,
        getSeed,
        getMediator,
        setMediator,
        getSettingsByKey,
        storeSettingsByKey,
        getResolverUrl,
        setResolverUrl,
        start,
    } = useDatabase();

    const {
        start:startAgent,
    } = useAgent();

    const configure = useCallback(async () => {
        const mediator = await getMediator();
        if (!mediator) {
            await setMediator(SDK.Domain.DID.fromString(MEDIATOR_DID));
        }
        const resolverUrl = await getResolverUrl();
        if (!resolverUrl && RESOLVER_URL) {
            await setResolverUrl(RESOLVER_URL);
        }
        const blockfrost = await getSettingsByKey('blockfrost-key');
        if (!blockfrost && BLOCKFROST_KEY) {
            await storeSettingsByKey('blockfrost-key', BLOCKFROST_KEY);
        }
    }, [getMediator, setMediator, getSettingsByKey, storeSettingsByKey, getResolverUrl, setResolverUrl]);

    const onHandleMnemonicsNext = useCallback(async () => {
        if (dbState === "loaded") {
            const seed = await getSeed();
            if (!seed) {
                return setStep('seed');
            }
            setStep('ready');
            await configure()
            await startAgent();
        }
    }, [dbState, getSeed, configure, startAgent]);

    useEffect(() => {
        let internal: NodeJS.Timeout;
        function check() {
            internal = setTimeout(() => {
                if (dbState === "loaded") {
                    getSeed().then((seed) => {
                        if (seed && step === 'seed') {
                            setStep('ready');
                        } else {
                            check();
                        }
                    })
                }
            }, 150);
        }
        check();
        return () => clearTimeout(internal);
    });
    useEffect(() => {
        async function load()  {
            if (dbState === "disconnected") {
                return start({
                    dbName: `rare-evo-${agentType}`,
                    storageType: StorageType.IndexDB
                });
            }
            const shouldLoad = step !== 'busy' && step !== 'ready' && step !== 'seed';
            if (dbState === "loaded" && shouldLoad) {
                setStep('busy');
                const seed = await getSeed();
                if (!seed) {
                    return setStep('seed');
                }
                await configure()
                await startAgent();
                return setStep('ready');
            }
        }
        load();
    }, [dbState, step, agentType, start, getSeed, configure, startAgent]);

    if (dbState === "error") {
        return (
            <div className="py-4 px-3 md:py-6 md:px-4 lg:py-8 lg:px-6 bg-white rounded-xl border border-red-200 shadow-sm">
                <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
                    <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-base md:text-lg lg:text-xl font-medium text-red-900">Database Error</h3>
                        <p className="text-xs md:text-sm lg:text-base text-red-700">
                            Database error occurred. Please refresh the page. If that doesn&apos;t work, clear storage and try again.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (dbState === "loading" || dbState === "disconnected") {
        return (
            <div className="py-4 px-3 md:py-6 md:px-4 lg:py-8 lg:px-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
                    <div className="flex-shrink-0">
                        <div className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                    <div>
                        <h3 className="text-base md:text-lg lg:text-xl font-medium text-slate-900">Loading Database</h3>
                        <p className="text-xs md:text-sm lg:text-base text-slate-600">
                            Please wait while we initialize your database connection...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (step === 'seed') {
        return <div className="py-4 px-3 md:py-6 md:px-4 lg:py-8 lg:px-6 rounded-xl space-y-4 md:space-y-6 lg:space-y-8">
            <Mnemonics onNext={onHandleMnemonicsNext} />
        </div>
    }

    return children;
}
