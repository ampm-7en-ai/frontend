
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bot, X, Minimize2, Send, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ChatboxPreviewProps {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  chatbotName: string;
  welcomeMessage: string;
  buttonText: string;
  position: 'bottom-right' | 'bottom-left';
  className?: string;
}

export const ChatboxPreview = ({
  primaryColor = '#3b82f6',
  secondaryColor = '#ffffff',
  fontFamily = 'Inter',
  chatbotName = 'Assistant',
  welcomeMessage = 'Hello! How can I help you today?',
  buttonText = 'Chat with us',
  position = 'bottom-right',
  className
}: ChatboxPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: welcomeMessage }
  ]);
  const [inputValue, setInputValue] = useState('');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Add user message
      setMessages([...messages, { type: 'user', text: inputValue }]);
      
      // Simulate bot response after a short delay
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: "Thank you for your message! This is a simulated response in the preview. In the actual chatbox, this would be a response from your AI assistant." 
        }]);
      }, 1000);
      
      setInputValue('');
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div 
        className={cn(
          "absolute bottom-4",
          position === 'bottom-right' ? 'right-4' : 'left-4'
        )}
      >
        {/* Chat Button */}
        {!isOpen && (
          <button 
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-md transition-all hover:shadow-lg"
            style={{ 
              backgroundColor: primaryColor,
              color: secondaryColor,
              fontFamily: fontFamily 
            }}
            onClick={toggleChat}
          >
            <MessageSquare size={16} />
            {buttonText}
          </button>
        )}
        
        {/* Chat Window */}
        {isOpen && (
          <Card 
            className="w-[320px] shadow-lg"
            style={{ 
              fontFamily: fontFamily,
            }}
          >
            <div 
              className="p-3 rounded-t-lg flex items-center justify-between"
              style={{ backgroundColor: primaryColor, color: secondaryColor }}
            >
              <div className="flex items-center gap-2">
                <Bot size={18} />
                <span className="font-medium">{chatbotName}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="p-1 rounded-full hover:bg-black/10 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Minimize2 size={14} />
                </button>
                <button 
                  className="p-1 rounded-full hover:bg-black/10 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            
            <CardContent className="p-0">
              <div className="max-h-[300px] overflow-y-auto p-3 space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex gap-2 items-start ${message.type === 'user' ? 'justify-end' : ''}`}>
                    {message.type === 'bot' && (
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center mt-1 flex-shrink-0"
                        style={{ backgroundColor: primaryColor, color: secondaryColor }}
                      >
                        <Bot size={14} />
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "rounded-lg p-2 max-w-[80%]",
                        message.type === 'user' 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'text-gray-800'
                      )}
                      style={{ 
                        backgroundColor: message.type === 'bot' ? `${primaryColor}20` : '',
                      }}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    </div>
                    
                    {message.type === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mt-1 text-xs flex-shrink-0">
                        You
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleSubmit} className="border-t p-3">
                <div className="relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="pr-10 text-sm"
                  />
                  <button 
                    type="submit" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full"
                    style={{ color: primaryColor }}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Browser Frame */}
      <div className="w-full h-[400px] bg-gray-100 rounded-md flex items-center justify-center border">
        <div className="text-muted-foreground">Website content preview</div>
      </div>
    </div>
  );
};
