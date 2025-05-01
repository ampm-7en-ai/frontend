
import React from 'react';
import { Bot, Copy } from 'lucide-react';
import { Message } from './types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface ModelMessageProps {
  message: Message;
  model: string;
  primaryColor: string;
  adjustColor: (color: string, amount: number) => string;
  temperature?: number;
}

export const ModelMessage = ({ 
  message, 
  model, 
  primaryColor,
  adjustColor,
  temperature
}: ModelMessageProps) => {
  const { toast } = useToast();

  const copyMessageToClipboard = () => {
    if (message.prompt) {
      navigator.clipboard.writeText(message.prompt)
        .then(() => {
          toast({
            title: "Copied",
            description: "Message copied to clipboard",
          });
        })
        .catch((error) => {
          console.error("Failed to copy text: ", error);
          toast({
            title: "Error",
            description: "Failed to copy text",
            variant: "destructive",
          });
        });
    }
  };

  const getModelBadge = (modelName: string) => {
    // Make sure we're working with a valid string
    if (!modelName) return <span className="px-1.5 py-0.5 bg-gray-100 rounded-full text-xs">Unknown</span>;
    
    // Convert to lowercase for case-insensitive comparison
    const modelNameLower = modelName.toLowerCase();
    
    switch(true){
      case modelNameLower.includes('gpt-4-turbo'):
        return <span className="px-1.5 py-0.5 bg-yellow-100 rounded-full text-xs">{modelName}</span>
      case modelNameLower.includes('gpt-4o'):
        return <span className="px-1.5 py-0.5 bg-pink-100 rounded-full text-xs">{modelName}</span>
      case modelNameLower.includes('gpt-3.5'):
        return <span className="px-1.5 py-0.5 bg-orange-100 rounded-full text-xs">{modelName}</span>
      case modelNameLower.includes('mistral-large'):
        return <span className="px-1.5 py-0.5 bg-blue-100 rounded-full text-xs">{modelName}</span>
      case modelNameLower.includes('mistral-medium'):
        return <span className="px-1.5 py-0.5 bg-purple-100 rounded-full text-xs">{modelName}</span>
      case modelNameLower.includes('mistral-small'):
        return <span className="px-1.5 py-0.5 bg-red-100 rounded-full text-xs">{modelName}</span>
      default:
        return <span className="px-1.5 py-0.5 bg-gray-100 rounded-full text-xs">{modelName}</span>
    }
  }

  return (
    <div key={message.id} className="flex gap-2 items-start animate-fade-in">
      <div className="flex-shrink-0 mt-1">
        <Avatar 
          className="h-8 w-8 flex-shrink-0"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
            boxShadow: `0 2px 5px ${primaryColor}40`
          }}
        >
          {message.avatarSrc && (
            <AvatarImage src={message.avatarSrc} alt={model} />
          )}
          <AvatarFallback className="text-white bg-transparent flex items-center justify-center">
            <Bot size={16} />
          </AvatarFallback>
        </Avatar>
      </div>
      <div
        className="rounded-lg p-3 max-w-[80%] shadow-sm relative group"
        style={{ 
          backgroundColor: `${primaryColor}15`,
        }}
      >
        <div className={`text-xs font-medium mb-1 flex items-center gap-2 flex-wrap`}>
          {getModelBadge(message.model || model)}
          {message.temperature !== undefined && (
            <span className="px-1.5 py-0.5 bg-green-100 rounded-full text-xs">
              T: {message.temperature.toFixed(1)}
            </span>
          )}
        </div>
        <div className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-0" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-lg font-bold my-0" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-base font-bold my-0" {...props} />,
              h4: ({ node, ...props }) => <h4 className="text-sm font-bold my-0" {...props} />,
              p: ({ node, ...props }) => <p className="my-2" {...props} />,
              a: ({ node, href, ...props }) => (
                <a 
                  href={href}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: primaryColor }}
                  {...props}
                />
              ),
              ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-0 space-y-1" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-0 space-y-1" {...props} />,
              li: ({ node, ...props }) => <li className="mb-0" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote 
                  className="border-l-4 pl-4 italic my-2"
                  style={{ borderColor: primaryColor }}
                  {...props}
                />
              ),
              hr: () => <hr className="my-4 border-gray-200 dark:border-gray-700" />,
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-2">
                  <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700" {...props} />
                </div>
              ),
              thead: ({ node, ...props }) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
              tbody: ({ node, ...props }) => <tbody {...props} />,
              tr: ({ node, ...props }) => <tr className="border-b border-gray-300 dark:border-gray-700" {...props} />,
              th: ({ node, ...props }) => <th className="border px-3 py-2 text-left font-semibold" {...props} />,
              td: ({ node, ...props }) => <td className="border px-3 py-2" {...props} />,
              img: ({ node, src, alt, ...props }) => (
                <img 
                  src={src} 
                  alt={alt || ""} 
                  className="rounded-md max-w-full my-2"
                  {...props}
                />
              ),
              pre: ({ node, ...props }) => (
                <div className="relative group/code my-4">
                  <pre
                    className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 overflow-x-auto border border-gray-200 dark:border-gray-700 text-sm"
                    {...props}
                  />
                </div>
              ),
              code: ({ node, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                const isInline = !match && !className?.includes('contains-task-list');
                
                return isInline ? (
                  <code
                    className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs"
                    style={{ color: adjustColor(primaryColor, -40) }}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <div className="relative">
                    {language && (
                      <div 
                        className="absolute right-2 top-1 text-xs text-gray-500 dark:text-gray-400 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded"
                      >
                        {language}
                      </div>
                    )}
                    <code
                      className="bg-transparent p-0 text-xs font-mono block"
                      {...props}
                    >
                      {children}
                    </code>
                  </div>
                );
              }
            }}
          >
            {message.content || ""}
          </ReactMarkdown>
        </div>
        <div className="text-xs mt-1 text-gray-400">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        
        <Button 
          size="sm"
          variant="secondary" 
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full py-0 text-xs flex items-center gap-1 shadow-sm"
          onClick={copyMessageToClipboard}
          style={{
            backgroundColor: `${primaryColor}30`,
            color: adjustColor(primaryColor, -60),
            transform: 'translateY(100%)'
          }}
        >
          <Copy size={10} />
          <span className="text-xs">Copy prompt</span>
        </Button>
      </div>
    </div>
  );
};
