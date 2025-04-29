
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  primaryColor: string;
  isDisabled?: boolean;
}

export const ChatInput = ({ onSendMessage, primaryColor, isDisabled = false }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isDisabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        placeholder={isDisabled ? "Waiting for all models to connect..." : "Ask anything..."}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="min-h-20 resize-none pr-12 border rounded-lg"
        expandable={true}
        maxExpandedHeight="120px"
        disabled={isDisabled}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !isDisabled) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <Button 
        type="submit" 
        size="icon" 
        disabled={!inputValue.trim() || isDisabled}
        className="absolute right-2 bottom-2"
        style={{
          backgroundColor: primaryColor,
          opacity: (inputValue.trim() && !isDisabled) ? 1 : 0.7
        }}
      >
        {isDisabled ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  );
};
