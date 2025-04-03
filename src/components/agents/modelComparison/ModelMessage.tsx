
import React from 'react';
import { Bot } from 'lucide-react';
import { Message } from './types';

interface ModelMessageProps {
  message: Message;
  model: string;
  primaryColor: string;
  adjustColor: (color: string, amount: number) => string;
}

export const ModelMessage = ({ 
  message, 
  model, 
  primaryColor,
  adjustColor
}: ModelMessageProps) => {
  return (
    <div key={message.id} className="flex gap-2 items-start animate-fade-in">
      <div className="flex-shrink-0 mt-1">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
            color: '#FFFFFF',
            boxShadow: `0 2px 5px ${primaryColor}40`
          }}
        >
          <Bot size={16} />
        </div>
      </div>
      <div
        className="rounded-lg p-3 max-w-[80%] shadow-sm"
        style={{ 
          backgroundColor: `${primaryColor}15`,
          borderLeft: `3px solid ${primaryColor}`,
        }}
      >
        <div className="text-xs font-medium mb-1 text-gray-600">
          {model}
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <div className="text-xs mt-1 text-gray-400">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
