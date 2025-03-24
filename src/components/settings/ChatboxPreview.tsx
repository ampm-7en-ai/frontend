
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bot, Send } from 'lucide-react';
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
  suggestions?: string[];
}

export const ChatboxPreview = ({
  primaryColor = '#9b87f5',
  secondaryColor = '#ffffff',
  fontFamily = 'Inter',
  chatbotName = 'Assistant',
  welcomeMessage = 'Hello! How can I help you today?',
  buttonText = 'Chat with us',
  position = 'bottom-right',
  className,
  suggestions = ['How can I get started?', 'What features do you offer?', 'Tell me about your pricing']
}: ChatboxPreviewProps) => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: welcomeMessage }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Add user message
      setMessages([...messages, { type: 'user', text: inputValue }]);
      setInputValue('');
      
      // Show typing indicator
      setShowTypingIndicator(true);
      
      // Simulate bot response after a short delay
      setTimeout(() => {
        setShowTypingIndicator(false);
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: "Thank you for your message! This is a simulated response in the preview. In the actual chatbox, this would be a response from your AI assistant." 
        }]);
      }, 1500);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Add user message with the suggestion text
    setMessages([...messages, { type: 'user', text: suggestion }]);
    
    // Show typing indicator
    setShowTypingIndicator(true);
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      setShowTypingIndicator(false);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: `This is a simulated response to your question: "${suggestion}". In the actual chatbox, this would be a response from your AI assistant.` 
      }]);
    }, 1500);
  };

  return (
    <Card 
      className={cn(
        "h-full flex flex-col overflow-hidden shadow-xl animate-fade-in",
        className
      )}
      style={{ 
        fontFamily: fontFamily,
        boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px ${primaryColor}20, 0 8px 16px ${primaryColor}15`
      }}
    >
      <div 
        className="p-4 rounded-t-lg flex items-center justify-between"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`
        }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-white/30 backdrop-blur-sm">
            <Bot size={20} className="text-white" />
          </div>
          <span className="font-medium text-white text-base">{chatbotName}</span>
        </div>
      </div>
      
      <CardContent className="p-0 flex-1 flex flex-col">
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white"
        >
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex gap-2 items-start animate-fade-in ${message.type === 'user' ? 'justify-end' : ''}`}
            >
              {message.type === 'bot' && (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
                    color: secondaryColor,
                    boxShadow: `0 2px 5px ${primaryColor}40`
                  }}
                >
                  <Bot size={16} />
                </div>
              )}
              
              <div
                className={cn(
                  "rounded-lg p-3 max-w-[80%] shadow-sm",
                  message.type === 'user' 
                    ? 'bg-gray-100 text-gray-800' 
                    : 'text-gray-800'
                )}
                style={{ 
                  backgroundColor: message.type === 'bot' ? `${primaryColor}15` : '',
                  // Removed the border-left style for bot messages
                }}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
              
              {message.type === 'user' && (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center mt-1 text-xs font-medium flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #e6e9f0, #eef1f5)',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                >
                  You
                </div>
              )}
            </div>
          ))}
          
          {/* Typing indicator */}
          {showTypingIndicator && (
            <div className="flex gap-2 items-start">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
                  color: secondaryColor,
                  boxShadow: `0 2px 5px ${primaryColor}40`
                }}
              >
                <Bot size={16} />
              </div>
              <div
                className={cn(
                  "rounded-lg p-3 max-w-[80%] shadow-sm"
                )}
                style={{ 
                  backgroundColor: `${primaryColor}15`,
                  // Removed the border-left style for typing indicator
                }}
              >
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Suggestions - only show if we have messages and no suggestions have been clicked yet */}
          {messages.length === 1 && suggestions && suggestions.length > 0 && (
            <div className="flex flex-col gap-2 mt-3 animate-fade-in">
              <p className="text-xs text-gray-500 mb-1">Suggested questions:</p>
              {suggestions.filter(Boolean).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-sm text-left px-4 py-2 rounded-full transition-all"
                  style={{ 
                    border: `1px solid ${primaryColor}30`,
                    backgroundColor: `${primaryColor}08`,
                    color: 'inherit'
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="border-t p-3 bg-white">
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="pr-12 text-sm border-2 rounded-full pl-4 shadow-sm focus-visible:ring-1 focus-visible:ring-offset-0"
              style={{ 
                borderColor: `${primaryColor}30`,
              }}
            />
            <button 
              type="submit" 
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full transition-transform hover:scale-110"
              style={{ 
                backgroundColor: primaryColor,
                color: secondaryColor,
                boxShadow: `0 2px 5px ${primaryColor}40`
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  return color;
  // This is a simplified version - in a real app you'd want to properly
  // adjust the hex color brightness
}
