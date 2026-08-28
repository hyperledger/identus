import { Request } from "@/types";
import { useState, useRef, useEffect } from "react";
import SDK from "@hyperledger/identus-sdk";
import { useMessages } from "@trust0/identus-react/hooks";
import { EnrichedSelect, EnrichedSelectItem } from "./EnrichedSelect";

// Compact Flow Item Component
const FlowItemRenderer = ({
    flow,
    index,
    onSelect,
    busy
}: {
    flow: Request;
    index: number;
    onSelect: (flow: Request) => void;
    busy: boolean;
}) => {
    const { receivedMessages, sentMessages } = useMessages();

    const getIssuanceStatus = (request: Request) => {
        const received = receivedMessages.filter((message) => message.thid === request.id);
        const sent = sentMessages.filter((message) => message.thid === request.id);
        if (sent.find(({ piuri }) => piuri === SDK.ProtocolType.DidcommIssueCredential)) {
            return 'completed'
        }
        if (received.find(({ piuri }) => piuri === SDK.ProtocolType.DidcommRequestCredential)) {
            return 'accept-pending'
        }
        return 'pending'
    };

    const status = getIssuanceStatus(flow);
    const disabled = busy || status === 'completed';

    return (
        <div className="flex items-center justify-between p-4 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="text-base font-medium text-slate-900 truncate">
                            #{index + 1} ({flow.credentialFormat})
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-blue-100 text-blue-800'
                        }`}>
                            {status}
                        </span>
                    </div>
                    <div className="text-sm text-slate-500 truncate">
                        {flow.claims && flow.claims.length > 0
                            ? flow.claims.map(claim => `${claim.name}: ${claim.value}`).join(', ')
                            : 'No claims'}
                    </div>
                </div>
            </div>
            <button
                disabled={disabled}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(flow);
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex-shrink-0 ml-2 ${
                    disabled
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-sm hover:shadow-md'
                }`}
            >
                {busy ? 'Creating...' : 'Use'}
            </button>
        </div>
    );
};

// Existing Flows Component
export const ExistingFlows = ({
    flows,
    selectedFlowId,
    onSelectFlow,
    onCreateNew,
    busy,
}: {
    flows: Request[];
    busy: boolean;
    selectedFlowId?: string;
    onSelectFlow: (flow: Request) => void;
    onCreateNew: () => void;
}) => {
    // Transform flows into EnrichedSelectItem format
    const flowItems: EnrichedSelectItem<Request>[] = flows.map(flow => ({
        id: flow.id,
        data: flow
    }));

    const handleSelectFlow = (item: EnrichedSelectItem<Request>) => {
        onSelectFlow(item.data);
    };

    const renderFlowItem = (item: EnrichedSelectItem<Request>, index: number) => (
        <FlowItemRenderer
            flow={item.data}
            index={index}
            busy={busy}
            onSelect={(flow) => onSelectFlow(flow)}
        />
    );

    return (
        <EnrichedSelect<Request>
            items={flowItems}
            renderItem={renderFlowItem}
            onSelectItem={handleSelectFlow}
            placeholder="Select Credential Offer"
            selectedItemId={selectedFlowId}
            disabled={busy}
            focusColor="emerald"
            fontSize="text-lg"
            emptyState={{
                icon: (
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                ),
                title: "No Flows Yet",
                description: "Create your first issuance flow",
                action: {
                    label: "Create First Flow",
                    onClick: onCreateNew
                }
            }}
        />
    );
};
