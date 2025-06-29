
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import ModernButton from '@/components/dashboard/ModernButton';

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
    <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
      <form onSubmit={handleSendMessage}>
        <div className="flex items-end gap-3">
          {/* Message Input */}
          <div className="flex-1 relative">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-600 p-3 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 focus-within:border-transparent transition-all">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 dark:placeholder:text-slate-400 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <ModernButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={Paperclip}
                  className="p-0 w-8 h-8 hover:bg-gray-200 dark:hover:bg-slate-700"
                />
                <ModernButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={Smile}
                  className="p-0 w-8 h-8 hover:bg-gray-200 dark:hover:bg-slate-700"
                />
              </div>
            </div>
          </div>
          
          {/* Send Button */}
          <ModernButton
            type="submit"
            disabled={!newMessage.trim()}
            variant={newMessage.trim() ? "primary" : "outline"}
            size="sm"
            icon={Send}
            className="p-0 w-10 h-10 rounded-full shadow-lg disabled:shadow-none transition-all duration-200"
          />
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
