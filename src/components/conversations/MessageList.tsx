
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, RefreshCw, User, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface MessageProps {
  message: any;
  selectedAgent: string | null;
  messageContainerRef: React.RefObject<HTMLDivElement>;
}

const MessageList = ({ 
  message, 
  selectedAgent,
  messageContainerRef 
}: MessageProps) => {
  const isHighlighted = selectedAgent && message.sender === 'bot' && message.agent === selectedAgent;

  // Handle system messages
  if (message.sender === 'system') {
    return (
      <div 
        key={message.id} 
        id={`message-${message.id}`}
        className="flex justify-center my-3"
      >
        <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 max-w-[80%] flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-gray-500" />
          <div>{message.content}</div>
        </div>
      </div>
    );
  }

  // Handle transfer messages
  if (message.type === 'transfer') {
    const isTransferHighlighted = selectedAgent && 
      (message.from === selectedAgent || message.to === selectedAgent);
    
    return (
      <div 
        key={message.id} 
        id={`transfer-${message.id}`}
        className="flex justify-center my-4"
      >
        <div className={cn(
          "bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800 max-w-[80%] transition-all duration-300",
          isTransferHighlighted && "bg-amber-100 border-amber-300 shadow-md"
        )}>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <div className="text-xs">
              <span className="font-medium">{message.from}</span>
              <span className="mx-1">→</span>
              <span className="font-medium">{message.to}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine a consistent border radius for messages
  const messageRadiusClasses = "rounded-2xl";
  
  return (
    <div 
      key={message.id} 
      className={`mb-6 ${message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
      id={`message-${message.id}`}
    >
      {message.sender === 'bot' && (
        <Avatar className={cn(
          "h-8 w-8 mr-3",
          isHighlighted ? "bg-primary ring-2 ring-primary/30" : "bg-primary"
        )}>
          <AvatarFallback>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className="flex flex-col max-w-[75%]">
        {message.sender === 'bot' && message.agent && (
          <div className={cn(
            "text-xs font-medium mb-1 ml-1",
            isHighlighted ? "text-primary" : "text-muted-foreground"
          )}>
            {message.agent}
          </div>
        )}
        
        <div 
          className={cn(
            "p-4 transition-all",
            messageRadiusClasses,
            message.sender === 'user' 
              ? "bg-primary text-primary-foreground" 
              : isHighlighted
                ? "bg-slate-100 border border-slate-200"
                : "bg-slate-100 border border-slate-200"
          )}
        >
          <div className="prose-sm max-w-none break-words">
            {typeof message.content === 'string' && (
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            )}
          </div>
          <div className="text-xs mt-2 opacity-70">
            {message.timestamp}
          </div>
        </div>
      </div>
      
      {message.sender === 'user' && (
        <Avatar className="h-8 w-8 ml-3 bg-purple-500">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageList;
