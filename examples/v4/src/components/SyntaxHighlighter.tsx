
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

