
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    onSendMessage(newMessage);
    
    toast({
      title: "Message sent",
      description: "Your message has been sent to the customer.",
    });
    
    setNewMessage('');
  };

  return (
    <div className="p-4 bg-white">
      <form onSubmit={handleSendMessage}>
        <div className="flex items-center gap-3 relative bg-gray-50/50 rounded-2xl border border-gray-200/60 p-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="p-2.5 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: newMessage.trim() ? '#3b82f6' : '#e5e7eb',
              color: '#FFFFFF',
              boxShadow: newMessage.trim() ? '0 2px 8px #3b82f620' : 'none'
            }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
