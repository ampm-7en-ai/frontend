
import React, { useState, useMemo } from 'react';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useTheme } from 'next-themes';

interface CodeExample {
  label: string;
  value: string; // language identifier for syntax highlighting
  code: string;
}

interface RequestExampleProps {
  examples: CodeExample[];
  variables?: Record<string, string>;
  className?: string;
  title?: string;
}

const RequestExample: React.FC<RequestExampleProps> = ({
  examples,
  variables = {},
  className = "",
  title = "Request Example"
}) => {
  const [selectedExample, setSelectedExample] = useState(examples[0]?.value || '');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();

  // Transform examples for dropdown
  const dropdownOptions = examples.map(example => ({
    value: example.value,
    label: example.label
  }));

  // Get the current example and process its code
  const currentExample = examples.find(ex => ex.value === selectedExample);
  
  const processedCode = useMemo(() => {
    if (!currentExample) return '';
    
    let code = currentExample.code;
    
    // Replace variables in the format {% $variable %}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{%\\s*\\$${key}\\s*%\\}`, 'g');
      code = code.replace(regex, value);
    });
    
    return code;
  }, [currentExample, variables]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(processedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Code example has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!examples || examples.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {examples.length > 1 && (
            <ModernDropdown
              value={selectedExample}
              onValueChange={setSelectedExample}
              options={dropdownOptions}
              className="w-32"
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Code Block */}
      <div className="relative rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <SyntaxHighlighter
          language={currentExample?.value || 'text'}
          style={theme === 'dark' ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            padding: '16px',
            background: 'transparent',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {processedCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export { RequestExample };
export type { CodeExample };
