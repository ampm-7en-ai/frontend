
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
    if (message.content) {
      navigator.clipboard.writeText(message.content)
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
        <div className="text-xs font-medium mb-1 text-gray-600 flex items-center">
          <span>{model}</span>
          {temperature !== undefined && (
            <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded-full text-xs">
              T: {temperature.toFixed(1)}
            </span>
          )}
        </div>
        <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              pre: ({ node, ...props }) => (
                <pre
                  className="bg-gray-50 dark:bg-gray-800 rounded-md p-2 overflow-x-auto my-2 border border-gray-200 dark:border-gray-700"
                  {...props}
                />
              ),
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code
                    className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs"
                    {...props}
                  />
                ) : (
                  <code
                    className="bg-transparent p-0 text-xs font-mono"
                    {...props}
                  />
                ),
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
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full py-0.5 px-1.5 text-xs flex items-center gap-1 shadow-sm"
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

