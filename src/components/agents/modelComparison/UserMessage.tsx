
import React from 'react';
import { User } from 'lucide-react';
import { Message } from './types';

interface UserMessageProps {
  message: Message;
}

export const UserMessage = ({ message }: UserMessageProps) => {
  return (
    <div key={message.id} className="flex gap-2 items-start justify-end animate-fade-in">
      <div className="rounded-lg p-3 max-w-[80%] shadow-sm bg-muted/50 text-foreground border border-border/50">
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center mt-1 text-xs font-medium flex-shrink-0 bg-muted/30 border border-border/50"
      >
        <User size={16} className="text-foreground" />
      </div>
    </div>
  );
};
