"use client"


export default function OOBCode({code, type}: {code: string, type: "offer" | "presentation"}) {
    return <div className="mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
    <div className="flex items-center mb-4">
        <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
        </div>
        <h3 className="text-xl font-semibold text-emerald-900">
            {
                type === "offer" ?
                    "OOB Offer" :
                    "OOB Presentation Request"
            }
        </h3>
    </div>

        <div className="space-y-3">
        <p className="text-base text-emerald-800">
            {
            type === "offer" ?
                    "This out of band offer will be then shared with the Holder, scroll down to discover more" :
                    "Share the following URL with the verifier to initiate the credential presentation process:"
            }
        </p>
        <div className="bg-white rounded-lg border border-emerald-200 overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-emerald-200">
                <span className="text-sm font-medium text-gray-700">URL</span>
            </div>
            <div className="p-4">
                <div className="max-h-32 overflow-y-auto">
                    <p className="text-sm text-slate-700 font-mono break-all leading-relaxed">
                        {code}
                    </p>
                </div>
            </div>
        </div>
    </div>

</div>
}
