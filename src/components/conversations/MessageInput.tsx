
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
    <form onSubmit={handleSendMessage} className="border-t p-3 bg-white">
      <div className="flex items-center gap-2 relative">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 pr-12 text-sm border-2 rounded-full pl-4 shadow-sm focus-visible:ring-1 focus-visible:ring-offset-0"
          style={{ 
            borderColor: '#9b87f530',
          }}
        />
        <button 
          type="submit" 
          className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full transition-transform hover:scale-110"
          style={{ 
            backgroundColor: '#9b87f5',
            color: '#FFFFFF',
            boxShadow: '0 2px 5px #9b87f540'
          }}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
