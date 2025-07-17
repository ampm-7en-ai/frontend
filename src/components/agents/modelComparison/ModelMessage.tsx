
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
    if (!modelName) return <span className="px-1.5 py-0.5 bg-muted/50 rounded-full text-xs text-muted-foreground">Unknown</span>;
    
    // Convert to lowercase for case-insensitive comparison
    const modelNameLower = modelName.toLowerCase();
    
    switch(true){
      case modelNameLower.includes('gpt-4-turbo'):
        return <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-xs text-yellow-800 dark:text-yellow-200">{modelName}</span>
      case modelNameLower.includes('gpt-4o'):
        return <span className="px-1.5 py-0.5 bg-pink-100 dark:bg-pink-900/30 rounded-full text-xs text-pink-800 dark:text-pink-200">{modelName}</span>
      case modelNameLower.includes('gpt-3.5'):
        return <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded-full text-xs text-orange-800 dark:text-orange-200">{modelName}</span>
      case modelNameLower.includes('mistral-large'):
        return <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs text-blue-800 dark:text-blue-200">{modelName}</span>
      case modelNameLower.includes('mistral-medium'):
        return <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded-full text-xs text-purple-800 dark:text-purple-200">{modelName}</span>
      case modelNameLower.includes('mistral-small'):
        return <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 rounded-full text-xs text-red-800 dark:text-red-200">{modelName}</span>
      default:
        return <span className="px-1.5 py-0.5 bg-muted/50 rounded-full text-xs text-muted-foreground">{modelName}</span>
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
      <div className="rounded-lg p-3 max-w-[80%] relative group text-foreground">
        <div className={`text-xs font-medium mb-1 flex items-center gap-2 flex-wrap`}>
          {getModelBadge(message.model || model)}
          {message.temperature !== undefined && (
            <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full text-xs text-green-800 dark:text-green-200">
              T: {message.temperature.toFixed(1)}
            </span>
          )}
        </div>
        <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-0 text-foreground" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-lg font-bold my-0 text-foreground" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-base font-bold my-0 text-foreground" {...props} />,
              h4: ({ node, ...props }) => <h4 className="text-sm font-bold my-0 text-foreground" {...props} />,
              p: ({ node, ...props }) => <p className="my-2 text-foreground" {...props} />,
              a: ({ node, href, ...props }) => (
                <a 
                  href={href}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: primaryColor }}
                  {...props}
                />
              ),
              ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-0 space-y-1 text-foreground" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-0 space-y-1 text-foreground" {...props} />,
              li: ({ node, ...props }) => <li className="mb-0 text-foreground" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote 
                  className="border-l-4 pl-4 italic my-2 text-muted-foreground border-muted"
                  style={{ borderColor: primaryColor }}
                  {...props}
                />
              ),
              hr: () => <hr className="my-4 border-border" />,
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-2">
                  <table className="min-w-full border-collapse border border-border" {...props} />
                </div>
              ),
              thead: ({ node, ...props }) => <thead className="bg-muted/50" {...props} />,
              tbody: ({ node, ...props }) => <tbody {...props} />,
              tr: ({ node, ...props }) => <tr className="border-b border-border" {...props} />,
              th: ({ node, ...props }) => <th className="border border-border px-3 py-2 text-left font-semibold text-foreground" {...props} />,
              td: ({ node, ...props }) => <td className="border border-border px-3 py-2 text-foreground" {...props} />,
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
                    className="bg-muted/50 rounded-md p-3 overflow-x-auto border border-border text-[10px] text-foreground"
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
                    className="bg-muted/50 px-1.5 py-0.5 rounded text-xs text-foreground"
                    style={{ color: adjustColor(primaryColor, -40) }}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <div className="relative">
                    {language && (
                      <div 
                        className="absolute right-2 top-1 text-xs text-muted-foreground px-1.5 py-0.5 bg-muted/50 rounded"
                      >
                        {language}
                      </div>
                    )}
                    <code
                      className="bg-transparent p-0 text-xs font-mono block text-foreground"
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
        
        <Button 
          size="sm"
          variant="secondary" 
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full py-0 text-xs flex items-center gap-1 shadow-sm bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-muted/50"
          onClick={copyMessageToClipboard}
        >
          <Copy size={10} />
          <span className="text-xs">Copy prompt</span>
        </Button>
      </div>
    </div>
  );
};
