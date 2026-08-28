'use client'
import { ApiCall, Store } from "@/reducers/app";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const CodeComponent = dynamic(() => import('@/components/CodeEditor').then((e) => e.CodeComponent), {
    ssr: false,
});

export const ApiCallComponent: React.FC<{
    content: ApiCall,
    store: Store,
    onResponse: (response: any, endpoint: string) => void
}> = (props) => {
    const [response, setResponse] = useState<any>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isCurlPopupOpen, setIsCurlPopupOpen] = useState(false);
    const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const { content } = props;
    const curlCommand = content.curlCommand(props.store);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setIsPopupOpen(false);
                setIsCurlPopupOpen(false);
            }
        };

        if (isPopupOpen || isCurlPopupOpen) {
            document.addEventListener("keydown", handleKeyDown);
        } else {
            document.removeEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isPopupOpen, isCurlPopupOpen]);

    const handleRunInBrowser = () => {
        setRequestStatus('loading');
        content.request(props.store)
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                let code = await response.text();
                try {
                    return {
                        data: JSON.parse(code),
                        url: response.url
                    }
                } catch (err) {
                    return {
                        data: code,
                        url: response.url
                    }
                }
            })
            .then(({ data, url }) => {
                setResponse(data);
                if (props.onResponse) {
                    props.onResponse(data, url);
                }
                setRequestStatus('success');
            })
            .catch((error) => {
                console.error("API call error:", error);
                setRequestStatus('error');
            });
    };

    const handleCopyCurl = () => {
        setIsCurlPopupOpen(true);
    };

    let runButtonClasses =
        "px-3 py-1 text-sm text-white rounded-lg transition duration-200 ";

    switch (requestStatus) {
        case 'idle':
            runButtonClasses += "bg-gray-500 hover:bg-gray-400";
            break;
        case 'loading':
            runButtonClasses += "bg-blue-500 hover:bg-blue-400";
            break;
        case 'success':
            runButtonClasses += "bg-green-500 hover:bg-green-400";
            break;
        case 'error':
            runButtonClasses += "bg-red-500 hover:bg-red-400";
            break;
        default:
            runButtonClasses += "bg-gray-500 hover:bg-gray-400";
    }

    return (
        <div className="my-4 text-gray-600 bg-[#282c34] rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center mb-2">
                <div className="flex-grow">
                    <p className="text-1xl font-semibold mb-4 text-blue-700">
                        {content.title}
                    </p>
                    <p>
                        {content.description}
                    </p>
                </div>
            </div>
            <div className="flex space-x-2">
                <button
                    className={runButtonClasses}
                    onClick={handleRunInBrowser}
                >
                    Run in Browser
                </button>
                <button
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition duration-200"
                    onClick={handleCopyCurl}
                >
                    Javascript code
                </button>
                {response && (
                    <button
                        className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-400 transition duration-200"
                        onClick={() => setIsPopupOpen(true)}
                    >
                        Show me response
                    </button>
                )}
            </div>

            {/* Response Modal */}
            {isPopupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto overflow-y-auto max-h-screen shadow-lg">
                        <h2 className="text-lg font-semibold mb-4 text-blue-700">API Response</h2>
                        <pre className="bg-gray-800 text-white p-4 rounded-lg shadow-md overflow-auto max-h-80 whitespace-pre-wrap">
                            <code>{JSON.stringify(response, null, 2)}</code>
                        </pre>
                        <div className="mt-4 flex justify-end">
                            <button
                                className="mt-4 px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-400 transition duration-200"
                                onClick={() => setIsPopupOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* cURL Modal */}
            {isCurlPopupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto overflow-y-auto max-h-screen shadow-lg">
                        <h2 className="text-lg font-semibold mb-4 text-blue-700">Javascript code</h2>
                        <CodeComponent content={{ language: 'bash', code: curlCommand }} />

                        <div className="mt-4 flex justify-end">
                            <button
                                className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-400 transition duration-200"
                                onClick={() => setIsCurlPopupOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
