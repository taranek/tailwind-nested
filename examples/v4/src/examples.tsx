import { type ReactNode, useState } from 'react';
import { twn } from 'tailwind-nested';

export interface Example {
  title: string;
  description: string;
  code: string;
  component: ReactNode;
}

// Interactive components for demos
function InteractiveDataStateDemo() {
  return null
}

function InteractiveAriaDemo() {
  const [expanded, setExpanded] = useState(false);
  return (

    <div className="w-full max-w-sm">
      <button
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
        className={twn('flex items-center justify-between w-full p-3 bg-white border rounded-md', {
          'aria-[expanded=false]': 'bg-gray-50 border-gray-300',
          hover: 'shadow-sm',
          focus: 'outline-none ring-2 ring-blue-500',
          'aria-[expanded=true]': {
            '&': 'bg-blue-50 border-blue-300',
            '[&_svg]': 'rotate-180'
          },


        })}
      >
        <span>Collapsible Section!!</span>
        <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-gray-700">
            This content is now visible because the section is expanded!
          </p>
        </div>
      )}
    </div>
  );
}

function InteractiveFormDemo() {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      setIsValid(validateEmail(value));
    } else {
      setIsValid(null);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Email Address
      </label>
      <input
        type="email"
        value={email}
        onChange={handleChange}
        data-valid={isValid}
        className={twn('w-full px-3 py-2 border rounded-md', {
          'data-[valid=true]': 'border-green-300 focus:ring-green-500',
          'data-[valid=false]': 'border-red-300 focus:ring-red-500',
          'data-[valid=null]': 'border-gray-300 focus:ring-blue-500',
          focus: 'outline-none ring-2 ring-opacity-50',
          hover: 'border-gray-400'
        })}
        placeholder="Enter your email"
      />
      {isValid === false && (
        <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
      )}
      {isValid === true && (
        <p className="mt-1 text-sm text-green-600">Email looks good!</p>
      )}
    </div>
  );
}

export const examples: Example[] = [
  {
    title: 'Basic Button with Hover',
    description: 'A simple button demonstrating hover state styling with twn.',
    code: `<button className={twn('bg-blue-500 text-white px-4 py-2 rounded-md font-medium', {
  hover: 'bg-blue-600 shadow-lg transform scale-105',
  focus: 'outline-none ring-2 ring-blue-500 ring-offset-2'
})}>
  Click me
</button>`,
    component: (
      <button className={twn('bg-blue-500 text-white px-4 py-2 rounded-md font-medium', {
        hover: 'bg-blue-600 shadow-lg transform scale-105',
        focus: 'outline-none ring-2 ring-blue-500 ring-offset-2'
      })}>
        Click me
      </button>
    )
  },
  {
    title: 'Data Attribute Selectors',
    description: 'Demonstrating data attribute selectors with square brackets.',
    code: `function DataStateDemo() {
  const [state, setState] = useState<'open' | 'closed'>('closed');
  
  return (
    <div 
      data-state={state}
      className={twn('bg-gray-100 p-4 rounded-md transition-all border-2', {
        'data-[state=open]': 'bg-green-100 border-green-300',
        'data-[state=closed]': 'bg-red-100 border-red-300',
        hover: 'shadow-md'
      })}
    >
      <p>Data state: {state}</p>
      <button 
        onClick={() => setState(state === 'open' ? 'closed' : 'open')}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
      >
        Toggle State
      </button>
    </div>
  );
}`,
    component: <InteractiveDataStateDemo />
  },
  {
    title: 'Aria Attribute Selectors',
    description: 'Using aria attributes for accessibility-based styling.',
    code: `function AriaDemo() {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div>
      <button
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
        className={twn('flex items-center justify-between w-full p-3 bg-white border rounded-md', {
          'aria-[expanded=true]': {
            '&': 'bg-blue-50 border-blue-300',
            svg: 'rotate-180'
          },
          'aria-[expanded=false]': 'bg-gray-50 border-gray-300',
          hover: 'shadow-sm',
          focus: 'outline-none ring-2 ring-blue-500'
        })}
      >
        <span>Collapsible Section</span>
        <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-gray-700">
            This content is now visible!
          </p>
        </div>
      )}
    </div>
  );
}`,
    component: <InteractiveAriaDemo />
  },
  {
    title: 'Form Input with Validation States',
    description: 'Input field with different styling based on validation state.',
    code: `function FormDemo() {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      setIsValid(validateEmail(value));
    } else {
      setIsValid(null);
    }
  };
  
  return (
    <div className="w-full max-w-sm">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Email Address
      </label>
      <input
        type="email"
        value={email}
        onChange={handleChange}
        data-valid={isValid}
        className={twn('w-full px-3 py-2 border rounded-md', {
          'data-[valid=true]': 'border-green-300 focus:ring-green-500',
          'data-[valid=false]': 'border-red-300 focus:ring-red-500',
          'data-[valid=null]': 'border-gray-300 focus:ring-blue-500',
          focus: 'outline-none ring-2 ring-opacity-50',
          hover: 'border-gray-400'
        })}
        placeholder="Enter your email"
      />
      {isValid === false && (
        <p className="mt-1 text-sm text-red-600">Please enter a valid email</p>
      )}
      {isValid === true && (
        <p className="mt-1 text-sm text-green-600">Email looks good!</p>
      )}
    </div>
  );
}`,
    component: <InteractiveFormDemo />
  },
];
