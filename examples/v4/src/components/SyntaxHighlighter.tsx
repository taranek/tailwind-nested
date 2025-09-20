import { twn } from 'tailwind-nested';

interface SyntaxHighlighterProps {
  code: string;
  language?: string;
}

export function SyntaxHighlighter({ code }: SyntaxHighlighterProps) {
  return (
    <pre className="overflow-x-auto text-sm bg-gray-50 p-4 rounded-md font-mono">
      <code className="text-gray-800 whitespace-pre-wrap">
        {code}
      </code>
    </pre>
  );
}


const render = () => {
  return <div className={twn('flex items-center justify-between w-full p-3 bg-white border rounded-md', {
    'aria-[expanded=false]': 'bg-gray-50 border-gray-300',
    hover: 'shadow-sm',
    focus: 'outline-none ring-2 ring-blue-500',
    eluwina: 'mordzia',
    'aria-[expanded=true]': {
      '&': 'bg-blue-50 border-blue-300',
      '[&_svg]': 'rotate-180'
    },


  })}/>
}
