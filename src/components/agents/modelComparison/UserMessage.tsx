
import React from 'react';
import { User } from 'lucide-react';
import { Message } from './types';

interface UserMessageProps {
  message: Message;
}

export const UserMessage = ({ message }: UserMessageProps) => {
  return (
    <div key={message.id} className="flex gap-2 items-start justify-end animate-fade-in">
      <div className="rounded-lg p-3 max-w-[80%] shadow-sm bg-gray-100 text-gray-800">
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <div className="text-xs mt-1 text-gray-400">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center mt-1 text-xs font-medium flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #e6e9f0, #eef1f5)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}
      >
        <User size={16} />
      </div>
    </div>
  );
};
