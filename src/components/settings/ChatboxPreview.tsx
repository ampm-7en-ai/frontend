import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bot, Send, User, WifiOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
}

interface ChatboxPreviewProps {
  agentId: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  chatbotName: string;
  welcomeMessage: string;
  buttonText: string;
  position: 'bottom-right' | 'bottom-left';
  className?: string;
  suggestions?: string[];
  avatarSrc?: string;
}

export const ChatboxPreview = ({
  agentId,
  primaryColor = '#9b87f5',
  secondaryColor = '#ffffff',
  fontFamily = 'Inter',
  chatbotName = 'Assistant',
  welcomeMessage = 'Hello! How can I help you today?',
  buttonText = 'Chat with us',
  position = 'bottom-right',
  className,
  suggestions = ['How can I get started?', 'What features do you offer?', 'Tell me about your pricing'],
  avatarSrc
}: ChatboxPreviewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const chatServiceRef = useRef<ChatWebSocketService | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMessages([{ type: 'bot', content: welcomeMessage, timestamp: new Date().toISOString() }]);
  }, [welcomeMessage]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, showTypingIndicator]);

  useEffect(() => {
    console.log("Initializing ChatWebSocketService with agent ID:", agentId);
    
    chatServiceRef.current = new ChatWebSocketService(agentId);
    
    chatServiceRef.current.on({
      onMessage: (message) => {
        console.log("Received message:", message);
        setMessages(prev => [...prev, message]);
        setShowTypingIndicator(false);
      },
      onTypingStart: () => {
        console.log("Typing indicator started");
        setShowTypingIndicator(true);
      },
      onTypingEnd: () => {
        console.log("Typing indicator ended");
        setShowTypingIndicator(false);
      },
      onError: (error) => {
        console.error('Chat error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to chat service. Please try again.",
          variant: "destructive",
        });
        setIsConnected(false);
      },
      onConnectionChange: (status) => {
        console.log("Connection status changed:", status);
        setIsConnected(status);
        setIsInitializing(false);
      }
    });
    
    chatServiceRef.current.connect();
    
    return () => {
      console.log("Cleaning up ChatWebSocketService");
      if (chatServiceRef.current) {
        chatServiceRef.current.disconnect();
        chatServiceRef.current = null;
      }
    };
  }, [agentId, toast]);  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatServiceRef.current || !isConnected) {
      toast({
        title: "Not connected",
        description: "Cannot send message while disconnected",
        variant: "destructive",
      });
      return;
    }
    
    if (inputValue.trim()) {
      const newMessage: Message = {
        type: 'user',
        content: inputValue,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setShowTypingIndicator(true);
      
      try {
        chatServiceRef.current.sendMessage(inputValue);
        console.log("Message sent:", inputValue);
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Send Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
        setShowTypingIndicator(false);
      }
      
      setInputValue('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!chatServiceRef.current || !isConnected) {
      toast({
        title: "Not connected",
        description: "Cannot send message while disconnected",
        variant: "destructive",
      });
      return;
    }
    
    const newMessage: Message = { 
      type: 'user', 
      content: suggestion, 
      timestamp: new Date().toISOString() 
    };
    
    setMessages(prev => [...prev, newMessage]);
    setShowTypingIndicator(true);
    
    try {
      chatServiceRef.current.sendMessage(suggestion);
      console.log("Suggestion sent:", suggestion);
    } catch (error) {
      console.error("Error sending suggestion:", error);
      toast({
        title: "Send Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setShowTypingIndicator(false);
    }
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
          <div className="flex items-center justify-center overflow-hidden bg-white/30 backdrop-blur-sm rounded-full w-8 h-8">
            {avatarSrc ? (
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                <AvatarFallback className="text-white bg-transparent">
                  <Bot size={20} />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Bot size={20} className="text-white" />
            )}
          </div>
          <span className="font-medium text-white text-base">{chatbotName}</span>
        </div>
        
        {isInitializing ? (
          <LoadingSpinner size="sm" className="text-white/70" />
        ) : !isConnected ? (
          <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded-full">
            <WifiOff size={14} className="text-white/90" />
            <span className="text-xs text-white/90">Disconnected</span>
          </div>
        ) : null}
      </div>
      
      <CardContent className="p-0 flex-1 flex flex-col">
        <ScrollArea 
          className="flex-1"
          style={{ height: 'calc(100vh - 90px)' }}
        >
          <div className="p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white min-h-full">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex gap-2 items-start animate-fade-in ${message.type === 'user' ? 'justify-end' : ''}`}
              >
                {message.type === 'bot' && (
                  <div className="flex-shrink-0 mt-1">
                    {avatarSrc ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                        <AvatarFallback style={{ 
                          background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
                          color: secondaryColor
                        }}>
                          <Bot size={16} />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ 
                          background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
                          color: secondaryColor,
                          boxShadow: `0 2px 5px ${primaryColor}40`
                        }}
                      >
                        <Bot size={16} />
                      </div>
                    )}
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
                  }}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {message.type === 'user' && (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center mt-1 text-xs font-medium flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #e6e9f0, #eef1f5)',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                  >
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
            
            {showTypingIndicator && (
              <div className="flex gap-2 items-start animate-fade-in">
                <div className="flex-shrink-0 mt-1">
                  {avatarSrc ? (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                      <AvatarFallback style={{ 
                        background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
                        color: secondaryColor
                      }}>
                        <Bot size={16} />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ 
                        background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
                        color: secondaryColor,
                        boxShadow: `0 2px 5px ${primaryColor}40`
                      }}
                    >
                      <Bot size={16} />
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    "rounded-lg p-3 max-w-[80%] shadow-sm"
                  )}
                  style={{ 
                    backgroundColor: `${primaryColor}15`,
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
        </ScrollArea>
        
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
              disabled={!isConnected}
            />
            <button 
              type="submit" 
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full transition-transform hover:scale-110"
              style={{ 
                backgroundColor: primaryColor,
                color: secondaryColor,
                boxShadow: `0 2px 5px ${primaryColor}40`,
                opacity: isConnected ? 1 : 0.5,
              }}
              disabled={!isConnected}
            >
              <Send size={16} />
            </button>
          </div>
          <div className="text-center mt-2 text-xs text-gray-400">
            powered by 7en.ai
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

function adjustColor(color: string, amount: number): string {
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
}
