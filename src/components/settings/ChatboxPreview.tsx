
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bot, Send, User, WifiOff } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Message {
  type: string;  // Changed from 'user' | 'bot' to string to accommodate any message types from the WebSocket
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

 
  // useEffect(() => {
  //   setMessages([{ type: 'bot_response', content: welcomeMessage, timestamp: new Date().toISOString() }]);
  // }, [welcomeMessage]);

  // Updated scroll effect to only scroll the message container, not the entire tab
  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [messages, showTypingIndicator]);

  // Store a reference to the scroll viewport when the ScrollArea is mounted
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        scrollViewportRef.current = viewport as HTMLDivElement;
      }
    }
  }, []);

  useEffect(() => {
    console.log("Initializing ChatWebSocketService with agent ID:", agentId);
    
    chatServiceRef.current = new ChatWebSocketService(agentId, "preview");
    
    chatServiceRef.current.on({
      onMessage: (message) => {
        console.log("Received message:", message);
        setMessages(prev => [...prev, message]); 
        message.type === "system_message" ? setShowTypingIndicator(true) : setShowTypingIndicator(false);
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
        "h-full flex flex-col overflow-hidden shadow-xl animate-fade-in relative",
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
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 relative"
          style={{ height: 'calc(100% - 85px)' }}
        >
          <div className="p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white min-h-full">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex gap-2 items-start animate-fade-in ${message.type === 'user' ? 'justify-end' : message.type === 'bot_response' ? 'justify-start' : 'justify-center'}`}
              >
                {message.type === 'bot_response' && (
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
                    "rounded-lg p-3 max-w-[80%] relative",
                    message.type === 'bot_response' 
                      ? 'bg-gray-100 text-gray-800 shadow-sm' 
                      : message.type === 'system_message' ? ` ` : 'bg-gray-100 text-gray-800 '
                  )}
                  style={{ 
                    backgroundColor: message.type === 'bot_response' ? `${primaryColor}15` : '',
                  }}
                >
                  <div className="text-sm prose prose-sm max-w-none markdown-content">
                    <ReactMarkdown
                      components={{
                        code({ node, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const language = match ? match[1] : '';
                          
                          // Fix: checking inline property correctly by examining props and node structure
                          // Instead of using `inline` directly, check if there's no language specified and it's a short code block
                          const isInline = !match && children.toString().split('\n').length === 1;
                          
                          if (isInline) {
                            return (
                              <code
                                className="px-1.5 py-0.5 rounded-md bg-gray-100 font-mono text-sm"
                                style={{ color: primaryColor }}
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          }

                          return (
                            <div className="relative">
                              {language && (
                                <div 
                                  className="absolute top-0 right-0 px-2 py-1 text-xs rounded-bl font-mono text-white"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  {language}
                                </div>
                              )}
                              <pre className="!mt-0 !bg-gray-50 border border-gray-200 rounded-md overflow-x-auto">
                                <code className="block p-4 text-sm font-mono" {...props}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          );
                        },
                        ul({ children }) {
                          return <ul className="list-disc pl-4 space-y-1">{children}</ul>;
                        },
                        ol({ children }) {
                          return <ol className="list-decimal pl-4 space-y-1">{children}</ol>;
                        },
                        a({ children, href }) {
                          return (
                            <a
                              href={href}
                              className="underline"
                              style={{ color: primaryColor }}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {children}
                            </a>
                          );
                        },
                        p({children}){
                          return message.type === 'system_message' ? (
                            <p style={{fontSize:"10px",color:`${primaryColor}`}}>{children}</p>
                          ) : (<p>{children}</p>)
                        }
                      }}
                    >
                      {message.content} 
                    </ReactMarkdown>
                  </div>
                  {
                    message.type === "bot_response" || message.type === "user" ? (
                      <p className="text-xs mt-1 text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    ):
                    (
                      <>
                      </>
                    )
                  }
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
        
        <div className="border-t p-3 bg-white mt-auto">
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="pr-12 text-sm border-2 pl-4 focus-visible:ring-offset-0"
              style={{ 
                borderColor: `${primaryColor}30`,
                minHeight: "46px",
                maxHeight: "120px",
                width: "calc(100% - 40px)"
              }}
              disabled={!isConnected}
              expandable={true}
              maxExpandedHeight="120px"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button 
              type="submit" 
              className="absolute right-[0px] top-1/2 -translate-y-1/2 p-2 rounded-full transition-transform hover:scale-110"
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
          </form>
          <div className="text-center mt-2 text-xs text-gray-400">
            powered by 7en.ai
          </div>
        </div>
      </div>
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
