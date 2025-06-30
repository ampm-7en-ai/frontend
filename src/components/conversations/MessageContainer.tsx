
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent' | 'ai';
  timestamp: string;
  agent?: string;
}

interface MessageContainerProps {
  messages: Message[];
  selectedAgent: string | null;
  customer: string;
}

const MessageContainer = ({ messages, selectedAgent, customer }: MessageContainerProps) => {
  const filteredMessages = selectedAgent 
    ? messages.filter(msg => 
        msg.sender === 'user' || 
        (msg.sender === 'agent' && msg.agent === selectedAgent) ||
        (msg.sender === 'ai' && selectedAgent === 'AI Assistant')
      )
    : messages;

  const getMessageAlignment = (sender: string) => {
    return sender === 'user' ? 'justify-end' : 'justify-start';
  };

  const getMessageBg = (sender: string) => {
    if (sender === 'user') {
      return 'bg-blue-600 text-white';
    }
    return 'bg-white/60 dark:bg-slate-700/60 text-slate-900 dark:text-slate-100 border border-slate-200/50 dark:border-slate-600/50';
  };

  const getSenderAvatar = (msg: Message) => {
    if (msg.sender === 'user') {
      return (
        <Avatar className="h-7 w-7 bg-gradient-to-br from-blue-500 to-blue-600">
          <AvatarFallback className="text-white text-xs font-medium">
            {customer?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      );
    } else if (msg.sender === 'ai') {
      return (
        <Avatar className="h-7 w-7 bg-gradient-to-br from-purple-500 to-purple-600">
          <AvatarFallback className="text-white text-xs font-medium">
            AI
          </AvatarFallback>
        </Avatar>
      );
    } else {
      return (
        <Avatar className="h-7 w-7 bg-gradient-to-br from-green-500 to-green-600">
          <AvatarFallback className="text-white text-xs font-medium">
            {msg.agent?.charAt(0)?.toUpperCase() || 'A'}
          </AvatarFallback>
        </Avatar>
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/30 backdrop-blur-sm">
      <div className="p-4 space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">No messages to display</p>
              {selectedAgent && (
                <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
                  Filtering by {selectedAgent}
                </p>
              )}
            </div>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div key={message.id} className={`flex ${getMessageAlignment(message.sender)} gap-2`}>
              {message.sender !== 'user' && getSenderAvatar(message)}
              
              <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl backdrop-blur-sm ${getMessageBg(message.sender)}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  {message.sender !== 'user' && message.agent && (
                    <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 text-[10px] px-1.5 py-0.5">
                      {message.agent}
                    </Badge>
                  )}
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              {message.sender === 'user' && getSenderAvatar(message)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessageContainer;
