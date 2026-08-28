import { useState, useRef, useEffect } from "react";
import SDK from "@hyperledger/identus-sdk";
import { EnrichedSelect, EnrichedSelectItem } from "./EnrichedSelect";
import { getClaimsPreview } from "../../utils/credentials";

// Compact Credential Item Component
const CredentialItemRenderer = ({
    credential,
    index
}: {
    credential: SDK.Domain.Credential;
    index: number;
}) => {
    const credentialType = credential.credentialType || "Digital Credential";
    const claimsPreview = getClaimsPreview(credential);

    return (
        <div className="flex items-center justify-between p-4 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="text-base font-medium text-slate-900 truncate">
                            {credentialType}
                        </span>
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            Active
                        </span>
                    </div>
                    <div className="text-sm text-slate-500 mb-1 truncate">
                        <strong>Issuer:</strong> {credential.issuer}
                    </div>
                    <div className="text-sm text-slate-500 truncate">
                        <strong>Claims:</strong> {claimsPreview || 'No preview available'}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                        ID: {credential.id.slice(0, 12)}...
                    </div>
                </div>
            </div>
        </div>
    );
};

// Compact Credentials List Component
export const CompactCredentials = ({
    credentials
}: {
    credentials: SDK.Domain.Credential[];
}) => {
    // Transform credentials into EnrichedSelectItem format
    const credentialItems: EnrichedSelectItem<SDK.Domain.Credential>[] = credentials.map(credential => ({
        id: credential.id,
        data: credential
    }));

    const renderCredentialItem = (item: EnrichedSelectItem<SDK.Domain.Credential>, index: number) => (
        <CredentialItemRenderer
            credential={item.data}
            index={index}
        />
    );

    return (
        <EnrichedSelect<SDK.Domain.Credential>
            items={credentialItems}
            renderItem={renderCredentialItem}
            placeholder="View Stored Credentials"
            focusColor="emerald"
            fontSize="text-lg"
            emptyState={{
                icon: (
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                ),
                title: "No Credentials",
                description: "Complete the issuance flow to receive your first credential"
            }}
        />
    );
};
