import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDatabase, usePrismDID } from "@trust0/identus-react/hooks";
import { DIDAlias, GroupedDIDs } from "@trust0/identus-react/context";

interface DIDSelectorProps {
    onSelectDID: (didItem: DIDAlias | null) => void;
    selectedDID?: string;
    label?: string;
    className?: string;
}

export const DIDSelector = React.memo(function DIDSelector({
    onSelectDID,
    selectedDID,
    label = "Select a DID",
    className = ""
}: DIDSelectorProps) {
    const { create } = usePrismDID()
    const { getGroupedDIDs, state: dbState } = useDatabase();
    const [groupedDIDs, setGroupedDIDs] = useState<GroupedDIDs>({});
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadDIDs = useCallback(async () => {
        if (dbState !== 'loaded') return;
        setIsLoading(true);
        try {
            const { prism = [], ...dids } = await getGroupedDIDs();
            const groupedData = {
                prism,
                ...dids
            };
            setGroupedDIDs(groupedData);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [getGroupedDIDs, dbState]);

    // Load DIDs when database is ready
    useEffect(() => {
        loadDIDs();
    }, [loadDIDs]);

    // Create a flat list of all DIDs for easier access
    const flatDIDs = useMemo(() => {
        return Object.values(groupedDIDs).flat();
    }, [groupedDIDs]);

    const handleDIDChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const didString = event.target.value;
        if (didString === "") {
            onSelectDID(null);
            return;
        }
        const selectedDIDItem = flatDIDs.find(
            didItem => didItem.did.toString() === didString
        );
        if (selectedDIDItem) {
            onSelectDID(selectedDIDItem);
        }
    }, [flatDIDs, onSelectDID]);

    const handleCreateDID = useCallback(async () => {
        try {
            await create("Issuance DID");
            // Reload DIDs after creation
            await loadDIDs();
        } catch (err: any) {
            setError(err.message);
        }
    }, [create, loadDIDs]);

    const hasAnyDIDs = flatDIDs.length > 0;

    // Memoize the options to prevent re-renders
    const optionGroups = useMemo(() => {
        return Object.entries(groupedDIDs).map(([method, dids]) => {
            if (dids.length === 0) return null;

            return (
                <optgroup key={`${method}-group`} label={`${method.toUpperCase()} DIDs`}>
                    {dids.map((didItem) => (
                        <option
                            key={didItem.did.toString()}
                            value={didItem.did.toString()}
                        >
                            [{didItem.status}] {didItem.alias || didItem.did.toString().substring(0, 16) + '...'}
                        </option>
                    ))}
                </optgroup>
            );
        }).filter(Boolean);
    }, [groupedDIDs]);

    // Show loading state while fetching DIDs
    if (isLoading && dbState === 'loaded') {
        return (
            <div className={className}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {label}
                </label>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500 mr-2"></div>
                        <span className="text-sm text-slate-600">Loading DIDs...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
                {label}
            </label>

            {error ? (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-red-600">{error}</span>
                    </div>
                </div>
            ) : !hasAnyDIDs ? (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-slate-600">No DIDs available</span>
                        </div>
                        <button
                            className="px-2 py-1 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 shadow-sm"
                            onClick={handleCreateDID}
                        >
                            Create {label} DID
                        </button>
                    </div>
                </div>
            ) : (
                <select
                    className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    onChange={handleDIDChange}
                    value={selectedDID || ""}
                >
                    <option value="">Select a DID</option>
                    {optionGroups}
                </select>
            )}
        </div>
    );
});
