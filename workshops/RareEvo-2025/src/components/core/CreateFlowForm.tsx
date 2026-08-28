import { Claim } from "@/types";
import SDK from "@hyperledger/identus-sdk";
import { DIDAlias } from "@trust0/identus-react/context";
import { useDatabase } from "@trust0/identus-react/hooks";
import { useState, useMemo, useCallback } from "react";
import { ClaimsEditor } from "./ClaimsEditor";
import { DIDSelector } from "./DIDSelector";
import { RareEvoClaims } from "@/config";
import { Request } from "@/types";



function validateClaim(claim: Claim): boolean {
    return !!claim.name && !!claim.value;
}


export const CreateFlowForm = ({
    onCreate,
    onBackToExisting,
}: {
    onCreate: (request: Request) => void;
    onBackToExisting: () => void;
}) => {
    const { createIssuanceFlow } = useDatabase();
    const [claims, setClaims] = useState<Claim[]>(RareEvoClaims);
    const [busy, setBusy] = useState(false);
    const [issuingDID, setIssuingDID] = useState<SDK.Domain.DID>();
    const hasInvalidClaims = useMemo(() => {
        return claims.some(claim => claim.isValid === false);
    }, [claims]);

    const handleDIDSelect = useCallback((didItem: DIDAlias) => {
        if (didItem?.did) {
            setIssuingDID(didItem.did)
        }
    }, [setIssuingDID]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!issuingDID) {
            throw new Error("Issuing DID is required");
        }

        setBusy(true);

        // Validate claims
        const claimsWithValidation = claims.map(claim => ({
            ...claim,
            isValid: validateClaim(claim)
        }));

        const allValid = claimsWithValidation.every(claim => claim.isValid);

        if (!allValid) {
            setClaims(claimsWithValidation);
            setBusy(false);
            return;
        }

        const issuerRequest: Request = {
            id: crypto.randomUUID(),
            credentialFormat: SDK.Domain.CredentialType.SDJWT,
            automaticIssuance: false,
            issuingDID: issuingDID.toString(),
            claims: claims.filter(claim => claim.name && claim.value).map(({ id, isValid, ...rest }) => rest),
        };

        try {
            await createIssuanceFlow(issuerRequest);
            onCreate(issuerRequest);
            setBusy(false);
        } catch (err) {
            console.error("Error creating issuance request:", err);

        } finally {
            setBusy(false);
        }
    }, [claims, createIssuanceFlow, issuingDID, onCreate]);

    const handleClaimChange = useCallback((index: number, field: keyof Claim, value: string) => {
        setClaims(prevClaims => {
            const newClaims = [...prevClaims];
            newClaims[index] = { ...newClaims[index], [field]: value, isValid: undefined };
            return newClaims;
        });
    }, []);

    return <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 lg:p-5 xl:p-6">
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 lg:space-y-5">
            <DIDSelector
                onSelectDID={handleDIDSelect}
                selectedDID={issuingDID?.toString()}
                label="Issuer"
                className="w-full"
            />

            <ClaimsEditor
                claims={claims}
                onClaimChange={handleClaimChange}
            />

            <div className="flex justify-between items-center pt-2 md:pt-3 lg:pt-4 border-t border-slate-200">
                <button
                    type="button"
                    onClick={onBackToExisting}
                    className="px-2 py-1.5 md:px-3 md:py-2 lg:px-4 lg:py-2.5 text-xs md:text-sm lg:text-base text-slate-600 hover:text-slate-800 transition-colors"
                >
                    ← Back to Existing Flows
                </button>
                <button
                    type="submit"
                    disabled={busy || hasInvalidClaims || !issuingDID}
                    className="px-3 py-1.5 md:px-4 md:py-2 lg:px-5 lg:py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs md:text-sm lg:text-base rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {busy ? 'Creating...' : 'Create Issuance Flow'}
                </button>
            </div>
        </form>
    </div>
}
