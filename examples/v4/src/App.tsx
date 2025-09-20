import { useState } from 'react';
import { twn } from 'tailwind-nested';
import { CodePreview } from './components/CodePreview';
import { examples } from './examples';

function App() {
  const [selectedExample, setSelectedExample] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={twn('flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold', {
                hover: 'from-blue-700 to-purple-700 shadow-lg'
              })}>
                TWN
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  tailwind-nested
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Conditional Tailwind CSS classes with nested selectors
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="https://npmjs.com/package/tailwind-nested"
                className={twn('inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all', {
                  hover: 'bg-gray-50 shadow-md border-gray-400',
                  focus: 'outline-none ring-2 ring-blue-500 ring-offset-1'
                })}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                npm
              </a>
              <a
                href="https://github.com/tomasztaranek/tailwind-nested"
                className={twn('inline-flex items-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all', {
                  hover: 'bg-gray-800 shadow-md',
                  focus: 'outline-none ring-2 ring-gray-500 ring-offset-1'
                })}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Introduction */}
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Interactive Examples
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore how <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">twn()</code> makes it easy to apply conditional styles with nested selectors, data attributes, and responsive breakpoints.
          </p>
        </div>

        {/* Example Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setSelectedExample(index)}
                className={twn('px-4 py-2 rounded-lg text-sm font-medium transition-all', {
                 hover: selectedExample === index
                    ? 'bg-blue-700 shadow-lg'
                    : 'bg-gray-50 border-gray-400',
                  focus: 'outline-none ring-2 ring-blue-500 ring-offset-1'
                })}
              >
                {example.title}
              </button>
            ))}
          </div>
        </div>

        {/* Code Preview */}
        <CodePreview
          title={examples[selectedExample].title}
          description={examples[selectedExample].description}
          code={examples[selectedExample].code}
          component={examples[selectedExample].component}
        />

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={twn('bg-white rounded-xl p-6 shadow-sm border', {
            hover: 'shadow-md'
          })}>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Conditional Styling</h3>
            <p className="text-gray-600 text-sm">
              Apply styles conditionally based on component state, user interactions, or data attributes.
            </p>
          </div>

          <div className={twn('bg-white rounded-xl p-6 shadow-sm border', {
            hover: 'shadow-md'
          })}>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nested Selectors</h3>
            <p className="text-gray-600 text-sm">
              Organize complex selector logic with nested objects that compile to Tailwind's colon syntax.
            </p>
          </div>

          <div className={twn('bg-white rounded-xl p-6 shadow-sm border', {
            hover: 'shadow-md'
          })}>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Type Safe</h3>
            <p className="text-gray-600 text-sm">
              Built with TypeScript for excellent developer experience and compile-time safety.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm mt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Built with React, Tailwind CSS v4, and Vite • Created by{' '}
              <a href="https://github.com/tomasztaranek" className="text-blue-600 hover:text-blue-700">
                @tomasztaranek
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
