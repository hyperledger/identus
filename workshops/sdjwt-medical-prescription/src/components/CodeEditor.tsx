'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CheckIcon, ClipboardCopyIcon } from '@heroicons/react/outline';
import { useState } from 'react';
import { CodeBlock } from '@/reducers/app';


export const CodeComponent: React.FC<{ content: CodeBlock }> = ({ content }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="relative mb-6">
            <SyntaxHighlighter
                language={content.language || 'javascript'}
                style={oneDark}
                showLineNumbers
                customStyle={{
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    backgroundColor: '#282c34',
                    fontSize: '0.875rem',
                    overflowX: 'auto',
                }}
                lineNumberStyle={{ color: '#6c757d' }}
            >
                {content.code} + xd
            </SyntaxHighlighter>
            <button
                onClick={() => copyToClipboard(content.code)}
                className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-500 text-white font-medium py-1 px-2 rounded transition duration-200 flex items-center"
            >
                {copied ? (
                    <>
                        <CheckIcon className="w-4 h-4 mr-1" /> Copied
                    </>
                ) : (
                    <>
                        <ClipboardCopyIcon className="w-4 h-4 mr-1" /> Copy
                    </>
                )}
            </button>
        </div>
    );
};
