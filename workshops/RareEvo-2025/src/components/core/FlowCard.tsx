import { Request } from "@/types";
import SDK from "@hyperledger/identus-sdk";
import { useMessages } from "@trust0/identus-react/hooks";
import { useCallback, useEffect, useState } from "react";


export const FlowCard = ({
    flow,
    index,
    isSelected,
    onSelect,
    busy: busyProp
}: {
    flow: Request;
    index: number;
    isSelected: boolean;
    onSelect?: (flow: Request) => void;
    busy: boolean;
}) => {
    const [busy, setBusy] = useState(busyProp);
    const { receivedMessages, sentMessages } = useMessages();
    const getIssuanceStatus = useCallback((request: Request) => {
        const received = receivedMessages.filter((message) => message.thid === request.id);
        const sent = sentMessages.filter((message) => message.thid === request.id);
        if (sent.find(({ piuri }) => piuri === SDK.ProtocolType.DidcommIssueCredential)) {
            return 'completed'
        }
        if (received.find(({ piuri }) => piuri === SDK.ProtocolType.DidcommRequestCredential)) {
            return 'accept-pending'
        }
        return 'pending'
    }, [receivedMessages, sentMessages]);
    const status = getIssuanceStatus(flow);

    useEffect(() => {
        if (isSelected) {
            setBusy(false);
        }
    }, [isSelected])

    const disabled = busy || status === 'completed';
    return <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:p-5 lg:p-6 xl:p-8 hover:shadow-lg transition-all duration-200">
        <div className="flex justify-between items-start mb-3 md:mb-4 lg:mb-5">
            <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
                <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base lg:text-lg">
                    {index + 1}
                </div>
                <div>
                    <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-slate-900">
                        Issuance Flow #{index + 1}
                    </h3>
                    <span className={`inline-block px-2 py-0.5 md:px-3 md:py-1 lg:px-4 lg:py-1.5 rounded-full text-xs md:text-sm lg:text-base font-medium ${status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                        {status}
                    </span>
                </div>
            </div>

            {onSelect && <button
                disabled={disabled}
                onClick={() => {
                    setBusy(true)
                    onSelect(flow);
                }}
                className={`px-3 py-1.5 md:px-4 md:py-2 lg:px-6 lg:py-3 rounded-lg font-medium transition-all duration-200 text-sm md:text-base lg:text-lg ${
                    disabled
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg cursor-pointer'
                }`}
            >
                {
                    busy  ? 'Creating OOB Offer...' : 'Use OOB Offer'
                }
            </button>}
        </div>

        <div className="space-y-2 md:space-y-3 lg:space-y-4">
            {
                onSelect && <div>
                <span className="text-xs md:text-sm lg:text-base font-medium text-slate-600">Issuing DID:</span>
                <p className="text-xs md:text-sm lg:text-base font-mono text-slate-800 px-1 py-0.5 md:px-2 md:py-1 lg:px-3 lg:py-1.5 mt-1 md:mt-1.5 lg:mt-2 break-all">
                    {flow.issuingDID.slice(0, 74)}
                </p>
            </div>
            }

            <div className="flex items-center justify-between">
                <div>
                    <span className="text-xs md:text-sm lg:text-base text-slate-600">
                        Format: <span className="font-medium text-slate-800">{flow.credentialFormat}</span>
                    </span>
                </div>
            </div>

            {flow.claims && flow.claims.length > 0 && (
                <div>
                    <span className="text-xs md:text-sm lg:text-base font-medium text-slate-600 mb-1 md:mb-2 lg:mb-3 block">Claims:</span>
                    <div className="flex flex-wrap gap-1 md:gap-2 lg:gap-3">
                        {flow.claims.map((claim, claimIndex) => (
                            <div key={claimIndex} className="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 md:p-2 lg:p-3 flex-auto min-w-fit">
                                <div className="text-xs md:text-sm lg:text-base font-medium text-emerald-700">{claim.name}</div>
                                <div className="text-xs md:text-sm lg:text-base text-emerald-600">{claim.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
};
