
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  primaryColor: string;
}

export const ChatInput = ({ onSendMessage, primaryColor }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        placeholder="Ask anything..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="min-h-20 resize-none pr-12 border rounded-lg"
        expandable={true}
        maxExpandedHeight="120px"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <Button 
        type="submit" 
        size="icon" 
        disabled={!inputValue.trim()}
        className="absolute right-2 bottom-2"
        style={{
          backgroundColor: primaryColor,
          opacity: inputValue.trim() ? 1 : 0.7
        }}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};
