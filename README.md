# tailwind-nested

Organize your Tailwind CSS classes with nested selectors for better maintainability and cleaner code.

## The Problem

Complex Tailwind components often end up with messy, hard-to-maintain class strings:

```jsx
// ❌ Traditional approach - hard to read and maintain
<button className={`
  px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200
  hover:bg-blue-700 hover:shadow-lg hover:scale-105
  focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
  active:scale-95 active:bg-blue-800
  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:hover:scale-100 disabled:hover:shadow-none
  dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400
  md:px-8 md:py-4 md:text-lg
`}>
  Submit Form
</button>
```

## The Solution

With tailwind-nested, organize your styles with clean, nested objects:

```jsx
// ✅ With tailwind-nested - organized and maintainable
<button className={twn('px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200', {
  // Interactive states
  hover: 'bg-blue-700 shadow-lg scale-105',
  focus: 'outline-none ring-4 ring-blue-300 ring-opacity-50',
  active: 'scale-95 bg-blue-800',
  
  // Disabled state
  disabled: {
    '&': 'opacity-50 cursor-not-allowed',
    hover: 'bg-blue-600 scale-100 shadow-none'
  },
  
  // Dark mode
  dark: {
    '&': 'bg-blue-500',
    hover: 'bg-blue-600',
    focus: 'ring-blue-400'
  },
  
  // Responsive
  md: 'px-8 py-4 text-lg'
})}>
  Submit Form
</button>
```

## Installation

```bash
npm install tailwind-nested

yarn add tailwind-nested

pnpm add tailwind-nested

bun add tailwind-nested
```

## Vite Configuration

Add the Vite plugin to extract classes for Tailwind's JIT compiler. **Important:** The plugin must be added **before** the `tailwindcss()` plugin.

```js
// vite.config.js
import { defineConfig } from 'vite';
import { twnPlugin } from 'tailwind-nested/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    twnPlugin(),      // ← Add this BEFORE tailwindcss
    tailwindcss(),    // ← tailwindcss comes after
  ],
});
```

## Usage

### Basic Button with Hover

```jsx
import { twn } from 'tailwind-nested';

<button className={twn('bg-blue-500 text-white px-4 py-2 rounded-md font-medium', {
  hover: 'bg-blue-600 shadow-lg transform scale-105',
  focus: 'outline-none ring-2 ring-blue-500 ring-offset-2'
})}>
  Click me
</button>
```

### ARIA Attribute Selectors

Perfect for accessibility-based styling with nested selectors:

```jsx
function AriaDemo() {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <button
      aria-expanded={expanded}
      onClick={() => setExpanded(!expanded)}
      className={twn('flex items-center justify-between w-full p-3 bg-white border rounded-md', {
        'aria-[expanded=true]': {
          // root styles for the aria-[expanded=true] state
          '&': 'bg-blue-50 border-blue-300',
          '[&_svg]': 'rotate-180'
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
  );
}
```

### Data Attribute Selectors

Dynamic styling based on data attributes:

```jsx
function FormDemo() {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(null);
  
  return (
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
  );
}
```

## Features

- 🎯 **TypeScript support** - Basic intellisense for Tailwind modifiers  
- ✨ **Nested selectors** - Organize complex state combinations
- ⚡  **Vite plugin** - Extract classnames at build time for no performance overhead
