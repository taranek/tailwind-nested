import { type ReactNode, useState } from 'react';
import { twn } from 'tailwind-nested';
import { SyntaxHighlighter } from './SyntaxHighlighter';

interface CodePreviewProps {
  title: string;
  description: string;
  code: string;
  component: ReactNode;
}

export function CodePreview({ title, description, code, component }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);


  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };


  return (
    <div className={twn('rounded-xl border bg-white shadow-sm overflow-hidden', {
      hover: 'shadow-md'
    })}>
      {/* Header */}
      <div className="border-b bg-gray-50/50 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
        {/* Code Section */}
        <div className="border-b border-gray-200 lg:border-b-0 lg:border-r bg-gray-50/30">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <h4 className="text-sm font-medium text-gray-700 ml-2">Code</h4>
            </div>
            <button
              onClick={copyToClipboard}
              className={twn('inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm border border-gray-200 transition-all', {
                hover: 'bg-gray-50 shadow-md',
                focus: 'outline-none ring-2 ring-blue-500 ring-offset-1'
              })}
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="p-4 overflow-auto max-h-96">
            <SyntaxHighlighter code={code} />
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h4 className="text-sm font-medium text-gray-700">Preview</h4>
          </div>
          <div className="p-6">
            <div className="flex min-h-[300px] items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg border border-gray-100">
              {component}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
