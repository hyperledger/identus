import { useState, useRef, useEffect } from "react";
import SDK from "@hyperledger/identus-sdk";
import { EnrichedSelect, EnrichedSelectItem } from "./EnrichedSelect";

// Compact Presentation Item Component
const PresentationItemRenderer = ({
    presentation,
    index,
    onVerify,
    busy,
    verified,
    verifying,
    errors
}: {
    presentation: SDK.Domain.Message;
    index: number;
    onVerify: (presentation: SDK.Domain.Message) => void;
    busy: boolean;
    verified: { [key: string]: boolean | null };
    verifying: { [key: string]: boolean };
    errors: { [key: string]: Error | null };
}) => {

    const getVerificationStatus = (presentation: SDK.Domain.Message) => {
        const verificationResult = verified[presentation.uuid];
        if (verifying[presentation.uuid]) return 'verifying';
        if (verificationResult === true) return 'verified';
        if (verificationResult === false) return 'invalid';
        return 'pending';
    };

    const getPresentationInfo = (presentation: SDK.Domain.Message) => {
        try {
            // Try to extract meaningful info from the presentation
            const attachments = presentation.attachments || [];
            const credentialCount = attachments.length;
            return {
                from: presentation.from?.toString() || 'Unknown',
                credentialCount,
                thid: presentation.thid || presentation.uuid
            };
        } catch (error) {
            return {
                from: 'Unknown',
                credentialCount: 0,
                thid: presentation.thid || presentation.uuid
            };
        }
    };

    const status = getVerificationStatus(presentation);
    const info = getPresentationInfo(presentation);
    const disabled = busy || verifying[presentation.uuid];
    const error = errors[presentation.uuid];

    return (
        <div className="p-4 border-b border-slate-100 last:border-b-0">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-base font-medium text-slate-900 truncate">
                                #{index + 1} - credential(s)
                            </span>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                status === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : status === 'verifying'
                                        ? 'bg-blue-100 text-blue-800 animate-pulse'
                                        : status === 'verified'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-red-100 text-red-800'
                            }`}>
                                {status === 'verifying' ? 'Verifying...' : status}
                            </span>
                        </div>
                        <div className="text-sm text-slate-500 truncate">
                            From: {info.from.slice(0, 30)}...
                        </div>
                        <div className="text-sm text-slate-400 truncate">
                            ID: {info.thid.slice(0, 20)}...
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                    {status === 'pending' && (
                        <button
                            disabled={disabled}
                            onClick={() => onVerify(presentation)}
                            className={`px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                                disabled
                                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-sm hover:shadow-md'
                            }`}
                        >
                            {verifying[presentation.uuid] ? 'Verifying...' : 'Verify'}
                        </button>
                    )}
                    {status === 'verified' && (
                        <div className="flex items-center px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-md">
                            <svg className="w-4 h-4 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-base font-medium text-emerald-800">Valid</span>
                        </div>
                    )}
                    {status === 'invalid' && (
                        <div className="flex items-center px-3 py-2 bg-red-50 border border-red-200 rounded-md">
                            <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-base font-medium text-red-800">Invalid</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Show error inline if there is one */}
            {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                        <svg className="w-4 h-4 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-medium text-red-800">Verification Error</h4>
                            <p className="text-sm text-red-700 mt-1">{error.message}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Existing Presentations Component
export const ExistingPresentations = ({
    presentations,
    onVerifyPresentation,
    busy,
    verified = {},
    verifying = {},
    errors = {}
}: {
    presentations: SDK.Domain.Message[];
    busy: boolean;
    onVerifyPresentation: (presentation: SDK.Domain.Message) => void;
    verified?: { [key: string]: boolean | null };
    verifying?: { [key: string]: boolean };
    errors?: { [key: string]: Error | null };
}) => {
    // Transform presentations into EnrichedSelectItem format
    const presentationItems: EnrichedSelectItem<SDK.Domain.Message>[] = presentations.map(presentation => ({
        id: presentation.uuid,
        data: presentation
    }));

    const renderPresentationItem = (item: EnrichedSelectItem<SDK.Domain.Message>, index: number) => (
        <PresentationItemRenderer
            presentation={item.data}
            index={index}
            busy={busy}
            verified={verified}
            verifying={verifying}
            errors={errors}
            onVerify={onVerifyPresentation}
        />
    );

    // Calculate verification statistics
    const getVerificationStats = () => {
        let verifiedCount = 0;
        let invalidCount = 0;
        let pendingCount = 0;
        let verifyingCount = 0;

        presentations.forEach(presentation => {
            if (verifying[presentation.uuid]) {
                verifyingCount++;
            } else if (verified[presentation.uuid] === true) {
                verifiedCount++;
            } else if (verified[presentation.uuid] === false) {
                invalidCount++;
            } else {
                pendingCount++;
            }
        });

        return { verifiedCount, invalidCount, pendingCount, verifyingCount, total: presentations.length };
    };

    const stats = getVerificationStats();
    const pluralLabel = stats.total !== 1 ? 'Presentations' : 'Presentation';

    // Build status parts for the placeholder
    const statusParts: string[] = [];
    if (stats.verifiedCount > 0) statusParts.push(`${stats.verifiedCount} verified`);
    if (stats.invalidCount > 0) statusParts.push(`${stats.invalidCount} invalid`);
    if (stats.verifyingCount > 0) statusParts.push(`${stats.verifyingCount} verifying`);
    if (stats.pendingCount > 0) statusParts.push(`${stats.pendingCount} pending`);

    const statusText = statusParts.length > 0 ? ` (${statusParts.join(', ')})` : '';
    const placeholder = `${stats.total} ${pluralLabel}${statusText}`;

    return (
        <EnrichedSelect<SDK.Domain.Message>
            items={presentationItems}
            renderItem={renderPresentationItem}
            placeholder={placeholder}
            focusColor="blue"
            closeOnSelect={false} // Keep dropdown open for multiple verifications
            fontSize="text-lg"
            emptyState={{
                icon: (
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                title: "No Presentations Received",
                description: "Waiting for presentations to verify"
            }}
        />
    );
};
