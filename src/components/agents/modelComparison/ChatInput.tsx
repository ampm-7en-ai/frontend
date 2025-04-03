
import React, { useState } from 'react';
import { Send, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onViewKnowledgeSources: () => void;
  knowledgeSourceCount: number;
  primaryColor?: string;
}

export const ChatInput = ({ 
  onSendMessage, 
  onViewKnowledgeSources,
  knowledgeSourceCount,
  primaryColor = '#9b87f5'
}: ChatInputProps) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="sticky bottom-0 w-full mt-2">
      <div className="flex flex-col items-center">
        <div className="relative flex-1 w-full mb-2">
          <Input
            placeholder="Enter a message to compare AI responses..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-12 text-sm border-2 rounded-full pl-4 shadow-sm focus-visible:ring-1 focus-visible:ring-offset-0"
            style={{ 
              borderColor: `${primaryColor}30`,
            }}
          />
          <button 
            onClick={handleSendMessage} 
            className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full transition-transform hover:scale-110"
            style={{ 
              backgroundColor: primaryColor,
              color: '#FFFFFF',
              boxShadow: `0 2px 5px ${primaryColor}40`
            }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto gap-2 text-muted-foreground hover:text-foreground mb-1"
          onClick={onViewKnowledgeSources}
        >
          <FileText className="h-4 w-4" />
          View Knowledge Sources ({knowledgeSourceCount})
        </Button>
      </div>
    </div>
  );
};
