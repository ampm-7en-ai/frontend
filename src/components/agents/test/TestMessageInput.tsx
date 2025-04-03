
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TestMessageInputProps {
  onSendMessage: (message: string) => void;
  primaryColor?: string;
}

export const TestMessageInput = ({ onSendMessage, primaryColor = '#9b87f5' }: TestMessageInputProps) => {
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    onSendMessage(newMessage);
    setNewMessage('');
  };

  const adjustColor = (color: string, amount: number): string => {
    try {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      const newR = Math.max(0, Math.min(255, r + amount));
      const newG = Math.max(0, Math.min(255, g + amount));
      const newB = Math.max(0, Math.min(255, b + amount));
      
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    } catch (e) {
      return color;
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="border-t p-3 bg-white">
      <div className="flex items-center gap-2 relative">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 pr-12 text-sm border-2 rounded-full pl-4 shadow-sm focus-visible:ring-1 focus-visible:ring-offset-0"
          style={{ 
            borderColor: `${primaryColor}30`,
          }}
        />
        <button 
          type="submit" 
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
    </form>
  );
};
