
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  primaryColor: string;
  isDisabled?: boolean;
  placeholder?: string;
  value?: string;
  readonly?: boolean;
}

export const ChatInput = ({ 
  onSendMessage, 
  primaryColor, 
  isDisabled = false, 
  placeholder = "Type your message...",
  value,
  readonly = false
}: ChatInputProps) => {
  const [inputValue, setInputValue] = useState(value || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isDisabled && !readonly) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  // Update input when value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        placeholder={isDisabled ? "Waiting for all models to connect..." : placeholder}
        value={inputValue}
        onChange={(e) => !readonly && setInputValue(e.target.value)}
        className={`min-h-16 resize-none pr-12 border rounded-lg mb-4 ${
          readonly ? 'text-muted-foreground cursor-default' : ''
        }`}
        expandable={true}
        maxExpandedHeight="120px"
        disabled={isDisabled}
        readOnly={readonly}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !isDisabled && !readonly) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <Button 
        type="submit" 
        size="icon" 
        disabled={!inputValue.trim() || isDisabled || readonly}
        className="absolute right-2 bottom-2"
        style={{
          backgroundColor: primaryColor,
          opacity: (inputValue.trim() && !isDisabled && !readonly) ? 1 : 0.7
        }}
      >
        {isDisabled ? <LoadingSpinner size="sm" className="!mb-0" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  );
};
