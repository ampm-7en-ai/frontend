
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

const MessageInput = ({ value, onChange, onKeyDown, placeholder = "Type your message..." }: MessageInputProps) => {
  return (
    <Textarea
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="flex-1 min-h-[40px] max-h-[120px] resize-none"
      rows={1}
    />
  );
};

export default MessageInput;
