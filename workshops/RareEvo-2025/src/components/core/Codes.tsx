
import React, { useState, useEffect } from "react";
import { CodeBlock } from "@/types";
import dynamic from "next/dynamic";

const CodeComponent = dynamic(() => import('@/components/core/CodeEditor').then((e) => e.CodeComponent), {
    ssr: false,
});

export interface CodesProps {
    codes: { [key: string]: CodeBlock };
    setIsPopupOpen?: (isOpen: boolean) => void;
}

export const Codes: React.FC<CodesProps> = ({ codes, setIsPopupOpen }) => {
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [selectedCode, setSelectedCode] = useState<CodeBlock>(Object.values(codes)[0]);
    const [selectedLabel, setSelectedLabel] = useState<string>(Object.keys(codes)[0]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsCodeModalOpen(false);
                setIsPopupOpen?.(false);
            }
        };

        if (isCodeModalOpen) {
            document.addEventListener("keydown", handleKeyDown);
        } else {
            document.removeEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isCodeModalOpen, setIsPopupOpen]);

    const openCodeModal = (label: string, code: CodeBlock) => {
        setSelectedLabel(label);
        setSelectedCode(code);
        setIsCodeModalOpen(true);
        setIsPopupOpen?.(true);
    };

    const closeCodeModal = () => {
        setIsCodeModalOpen(false);
        setIsPopupOpen?.(false);
    };

    const codeKeys = Object.keys(codes);

    if (codeKeys.length === 0) {
        return null;
    }

    return (
        <>
            <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4 mt-3 md:mt-4 lg:mt-5 justify-end">
                {codeKeys.map((key) => (
                    <button
                        key={key}
                        type="button"
                        className="px-3 py-1.5 md:px-4 md:py-2 lg:px-5 lg:py-2.5 text-xs md:text-sm lg:text-base font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                        onClick={() => openCodeModal(key, codes[key])}
                    >
                        <span className="flex items-center gap-1.5 md:gap-2 lg:gap-2.5">
                        {key}
                            <svg className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Code icon">
                                <title>Code icon</title>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>

                        </span>
                    </button>
                ))}
            </div>

            {/* Code Modal */}
            {isCodeModalOpen && selectedCode && (
                <div
                    className="w-full fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-10"
                    data-modal="true"
                    onClick={closeCodeModal}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            closeCodeModal();
                        }
                    }}
                    tabIndex={-1}
                    role="presentation"
                >
                    <div
                        className="bg-white rounded-xl w-full mx-2 md:mx-3 lg:mx-4 max-h-[90vh] flex flex-col shadow-2xl border border-slate-200"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                    >
                        <div className="flex items-center justify-between p-4 md:p-5 lg:p-6 border-b border-slate-200">
                            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-slate-900 flex items-center gap-1.5 md:gap-2 lg:gap-2.5">
                                {selectedLabel}
                            </h2>
                            <button
                                type="button"
                                className="p-1.5 md:p-2 lg:p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                                onClick={closeCodeModal}
                                aria-label="Close modal"
                            >
                                <svg className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Close icon">
                                    <title>Close icon</title>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6">
                            <CodeComponent content={selectedCode} />
                        </div>

                        <div className="p-3 md:p-4 lg:p-5 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                            <p className="text-xs md:text-sm lg:text-base text-slate-500 text-center">Press ESC to close</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
