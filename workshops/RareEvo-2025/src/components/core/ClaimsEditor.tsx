import { Claim } from "@/types";
import { useMemo } from "react";



export const ClaimsEditor = ({
    claims,
    onClaimChange,
}: {
    claims: Claim[];
    onClaimChange: (index: number, field: keyof Claim, value: string) => void;
}) => {
    const hasInvalidClaims = useMemo(() => {
        return claims.some(claim => claim.isValid === false);
    }, [claims]);
    return <div>
        <div className="flex items-center justify-between mb-1.5 md:mb-2 lg:mb-3">
            <div>
                <p className="text-xs md:text-sm lg:text-base text-slate-600">Define the claims for this credential</p>
            </div>
        </div>

        <div className="space-y-1.5 md:space-y-2 lg:space-y-3">
            {claims.map((claim, index) => (
                <div key={claim.id} className="flex gap-1.5 md:gap-2 lg:gap-3 items-center p-1.5 md:p-2 lg:p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex-shrink-0 w-20 md:w-24 lg:w-28">
                        <span className="text-xs md:text-sm lg:text-base font-medium text-slate-600 block mb-0.5 md:mb-1">
                            {claim.name} <span className="text-[9px] md:text-[10px] lg:text-xs opacity-70">({claim.type})</span>
                        </span>
                    </div>
                    <div className="flex-1">
                        <input
                            type={claim.type === 'date' ? 'date' : claim.type === 'number' ? 'number' : 'text'}
                            value={claim.value}
                            onChange={(e) => onClaimChange(index, "value", e.target.value)}
                            placeholder="Enter value"
                            className={`w-full px-1.5 py-1 md:px-2 md:py-1.5 lg:px-3 lg:py-2 text-xs md:text-sm lg:text-base border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-900 ${claim.isValid === false
                                ? 'border-red-300 bg-red-50'
                                : 'border-slate-300'
                                }`}
                            required
                        />
                    </div>
                </div>
            ))}
        </div>

        {hasInvalidClaims && (
            <div className="mt-1.5 md:mt-2 lg:mt-3 p-1.5 md:p-2 lg:p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                    <svg className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-red-500 mr-1.5 md:mr-2 lg:mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs md:text-sm lg:text-base text-red-600">
                        Please fill in all claim names and values before submitting.
                    </span>
                </div>
            </div>
        )}
    </div>
};
