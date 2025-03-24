
import React, { useState, useEffect, useRef } from 'react';
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
  primaryColor = '#9b87f5',
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [isButtonPulsing, setIsButtonPulsing] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add pulse animation to chat button every few seconds
    const pulseInterval = setInterval(() => {
      setIsButtonPulsing(true);
      setTimeout(() => setIsButtonPulsing(false), 1500);
    }, 5000);
    
    return () => clearInterval(pulseInterval);
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChat = () => {
    setIsAnimating(true);
    setIsOpen(!isOpen);
    setTimeout(() => setIsAnimating(false), 300);
  };

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
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300 hover:scale-105",
              isButtonPulsing ? "animate-pulse" : ""
            )}
            style={{ 
              backgroundColor: primaryColor,
              color: secondaryColor,
              fontFamily: fontFamily,
              transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
              boxShadow: `0 10px 25px -5px ${primaryColor}40, 0 8px 10px -6px ${primaryColor}30`
            }}
            onClick={toggleChat}
          >
            <MessageSquare size={18} className="animate-bounce" />
            {buttonText}
          </button>
        )}
        
        {/* Chat Window */}
        {isOpen && (
          <Card 
            className={cn(
              "w-[350px] shadow-2xl transition-all duration-300 overflow-hidden",
              isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
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
              <div className="flex items-center gap-2">
                <button 
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Minimize2 size={16} className="text-white" />
                </button>
                <button 
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            </div>
            
            <CardContent className="p-0">
              <div 
                ref={chatContainerRef}
                className="h-[320px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white"
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
                        borderLeft: message.type === 'bot' ? `3px solid ${primaryColor}` : '',
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
                        borderLeft: `3px solid ${primaryColor}`,
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
        )}
      </div>
      
      {/* Browser Frame */}
      <div className="w-full h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-md flex items-center justify-center border overflow-hidden shadow-md">
        <div className="w-full h-full relative">
          <div className="absolute top-0 w-full h-8 bg-gray-200 flex items-center px-2 space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <div className="ml-4 bg-white rounded h-5 w-1/2"></div>
          </div>
          <div className="mt-8 p-4 text-center text-gray-500">
            <div className="w-full max-w-[80%] h-6 mx-auto bg-gray-200 rounded-md mb-4"></div>
            <div className="w-full max-w-[60%] h-4 mx-auto bg-gray-200 rounded-md mb-3"></div>
            <div className="w-full max-w-[70%] h-4 mx-auto bg-gray-200 rounded-md mb-6"></div>
            <div className="w-full max-w-[40%] h-8 mx-auto bg-gray-200 rounded-md mb-8"></div>
            <div className="flex justify-center space-x-3 mb-8">
              <div className="w-20 h-20 bg-gray-200 rounded-md"></div>
              <div className="w-20 h-20 bg-gray-200 rounded-md"></div>
              <div className="w-20 h-20 bg-gray-200 rounded-md"></div>
            </div>
            <div className="text-sm text-gray-400">Website content preview</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  return color;
  // This is a simplified version - in a real app you'd want to properly
  // adjust the hex color brightness
}
