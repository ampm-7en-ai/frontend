
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, RefreshCw, User } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  return (
    <div 
      key={message.id} 
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
      id={`message-${message.id}`}
    >
      {message.sender === 'bot' && (
        <Avatar className={cn(
          "h-8 w-8 mr-2",
          isHighlighted ? "bg-primary ring-2 ring-primary/30" : "bg-primary"
        )}>
          <AvatarFallback>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div 
        className={cn(
          "max-w-[80%] p-3 rounded-lg transition-all",
          message.sender === 'user' 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : isHighlighted
              ? "bg-primary/5 border-2 border-primary/20 rounded-tl-none"
              : "bg-white border border-gray-200 rounded-tl-none"
        )}
      >
        {message.sender === 'bot' && message.agent && (
          <div className={cn(
            "text-xs font-medium mb-1",
            isHighlighted ? "text-primary" : "text-muted-foreground"
          )}>
            {message.agent}
          </div>
        )}
        <p className="break-words text-sm">{message.content}</p>
        <div className="text-xs mt-1 opacity-70">
          {message.timestamp}
        </div>
      </div>
      {message.sender === 'user' && (
        <Avatar className="h-8 w-8 ml-2 bg-purple-500">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageList;
