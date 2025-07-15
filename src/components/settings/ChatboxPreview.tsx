
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bot, Send, User, WifiOff, AlertCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Message {
  type: string;
  content: string;
  timestamp: string;
  ui_type?: string;
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
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  // Check if input should be disabled (when there's a pending yes/no question)
  const shouldDisableInput = messages.some(msg => 
    msg.type === 'ui' && msg.ui_type === 'yes_no'
  );

  // Get the latest yes/no message for displaying buttons
  const latestYesNoMessage = messages.slice().reverse().find(msg => 
    msg.type === 'ui' && msg.ui_type === 'yes_no'
  );

  // Add welcome message when component mounts
  useEffect(() => {
    if (welcomeMessage) {
      setMessages([{ type: 'bot_response', content: welcomeMessage, timestamp: new Date().toISOString() }]);
    }
  }, [welcomeMessage]);

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
    // Don't initialize if no agent ID
    if (!agentId) {
      console.log("No agent ID provided to ChatboxPreview");
      setConnectionError("No agent ID provided");
      setIsInitializing(false);
      return;
    }

    console.log("Initializing ChatWebSocketService with agent ID:", agentId);
    setConnectionError(null);
    
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
        setConnectionError(error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to chat service. Please try again.",
          variant: "destructive",
        });
        setIsConnected(false);
        setIsInitializing(false);
      },
      onConnectionChange: (status) => {
        console.log("Connection status changed:", status);
        setIsConnected(status);
        setIsInitializing(false);
        if (status) {
          setConnectionError(null);
        }
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

  const sendMessage = (messageContent: string) => {
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
      content: messageContent,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setShowTypingIndicator(true);
    
    try {
      chatServiceRef.current.sendMessage(messageContent);
      console.log("Message sent:", messageContent);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Send Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setShowTypingIndicator(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() && !shouldDisableInput) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleYesNoClick = (response: 'Yes' | 'No') => {
    sendMessage(response);
    // Remove the yes/no message from the list to re-enable input
    setMessages(prev => prev.filter(msg => !(msg.type === 'ui' && msg.ui_type === 'yes_no')));
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!chatServiceRef.current || !isConnected || shouldDisableInput) {
      toast({
        title: "Not connected",
        description: "Cannot send message while disconnected",
        variant: "destructive",
      });
      return;
    }
    
    sendMessage(suggestion);
  };

  // Helper function to format timestamp safely
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  return (
    <Card 
      className={cn(
        "h-full flex flex-col overflow-hidden shadow-2xl animate-fade-in relative backdrop-blur-sm",
        className
      )}
      style={{ 
        fontFamily: fontFamily,
        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px ${primaryColor}20, 0 8px 32px ${primaryColor}15`,
        border: `1px solid ${primaryColor}10`
      }}
    >
      <div 
        className="p-5 rounded-t-xl flex items-center justify-between relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -15)}, ${adjustColor(primaryColor, -30)})`,
        }}
      >
        {/* Modern gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <div className="flex items-center justify-center overflow-hidden bg-white/20 backdrop-blur-sm rounded-full w-10 h-10 border border-white/30 shadow-lg">
              {avatarSrc ? (
                <Avatar className="w-10 h-10">
                  <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                  <AvatarFallback className="text-white bg-transparent">
                    <Bot size={22} />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Bot size={22} className="text-white drop-shadow-sm" />
              )}
            </div>
            {/* Online indicator */}
            {isConnected && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white text-base drop-shadow-sm">{chatbotName}</span>
            <span className="text-white/80 text-xs">
              {isConnected ? 'Online' : 'Connecting...'}
            </span>
          </div>
        </div>
        
        {isInitializing ? (
          <LoadingSpinner size="sm" className="text-white/70" />
        ) : connectionError ? (
          <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-full border border-red-300/30 backdrop-blur-sm">
            <AlertCircle size={14} className="text-white/90" />
            <span className="text-xs text-white/90 font-medium">Error</span>
          </div>
        ) : !isConnected ? (
          <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1.5 rounded-full border border-orange-300/30 backdrop-blur-sm">
            <WifiOff size={14} className="text-white/90" />
            <span className="text-xs text-white/90 font-medium">Disconnected</span>
          </div>
        ) : null}
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 relative"
          style={{ height: 'calc(100% - 85px)' }}
        >
          <div className="p-5 space-y-4 bg-gradient-to-b from-gray-50/50 to-white min-h-full">
            {connectionError && (
              <div className="flex items-center gap-3 p-4 bg-red-50/80 border border-red-200/60 rounded-xl backdrop-blur-sm shadow-sm">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-800">Connection failed. Please check your agent configuration.</span>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div key={index}>
                {message.type !== 'ui' && (
                  <div 
                    className={`flex gap-3 items-start animate-fade-in ${message.type === 'user' ? 'justify-end' : message.type === 'bot_response' ? 'justify-start' : 'justify-center'}`}
                  >
                    {message.type === 'bot_response' && (
                      <div className="flex-shrink-0 mt-1">
                        {avatarSrc ? (
                          <Avatar className="w-9 h-9 border-2 border-white shadow-md">
                            <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                            <AvatarFallback style={{ 
                              background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
                              color: secondaryColor
                            }}>
                              <Bot size={18} />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div 
                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-md"
                            style={{ 
                              background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
                              color: secondaryColor,
                              boxShadow: `0 4px 12px ${primaryColor}30`
                            }}
                          >
                            <Bot size={18} />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "rounded-2xl p-4 max-w-[80%] relative shadow-sm transition-all duration-200 hover:shadow-md",
                        message.type === 'bot_response' 
                          ? 'bg-white border border-gray-100 text-gray-800' 
                          : message.type === 'system_message' ? ` ` : 'bg-white border border-gray-100 text-gray-800'
                      )}
                      style={{ 
                        backgroundColor: message.type === 'bot_response' ? 'white' : '',
                        borderColor: message.type === 'bot_response' ? `${primaryColor}20` : '',
                      }}
                    >
                      <div className="text-sm prose prose-sm max-w-none markdown-content">
                        <ReactMarkdown
                          components={{
                            code({ node, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              const language = match ? match[1] : '';
                              
                              const isInline = !match && children.toString().split('\n').length === 1;
                              
                              if (isInline) {
                                return (
                                  <code
                                    className="px-2 py-1 rounded-lg bg-gray-100/80 font-mono text-sm border"
                                    style={{ color: primaryColor }}
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              }

                              return (
                                <div className="relative my-3">
                                  {language && (
                                    <div 
                                      className="absolute top-0 right-0 px-3 py-1 text-xs rounded-bl-lg font-mono text-white z-10"
                                      style={{ backgroundColor: primaryColor }}
                                    >
                                      {language}
                                    </div>
                                  )}
                                  <pre className="!mt-0 !bg-gray-50/80 border border-gray-200/60 rounded-xl overflow-x-auto backdrop-blur-sm">
                                    <code className="block p-4 text-sm font-mono" {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                </div>
                              );
                            },
                            ul({ children }) {
                              return <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>;
                            },
                            ol({ children }) {
                              return <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>;
                            },
                            a({ children, href }) {
                              return (
                                <a
                                  href={href}
                                  className="underline transition-colors hover:opacity-80"
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
                                <p style={{fontSize:"11px",color:`${primaryColor}`, fontWeight: "500"}}>{children}</p>
                              ) : (<p className="leading-relaxed">{children}</p>)
                            }
                          }}
                        >
                          {message.content} 
                        </ReactMarkdown>
                      </div>
                      {
                        message.type === "bot_response" || message.type === "user" ? (
                          <p className="text-xs mt-2 text-gray-400 font-medium">
                            {formatTimestamp(message.timestamp)}
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
                        className="w-9 h-9 rounded-full flex items-center justify-center mt-1 text-xs font-medium flex-shrink-0 border-2 border-white shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                      >
                        <User size={18} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                )}
                
                {message.type === 'ui' && message.ui_type === 'yes_no' && (
                  <div className="flex gap-3 justify-center animate-fade-in">
                    <Button
                      onClick={() => handleYesNoClick('Yes')}
                      variant="outline"
                      className="px-8 py-3 rounded-full font-medium transition-all hover:scale-105 shadow-sm border-2"
                      style={{ 
                        borderColor: primaryColor,
                        color: primaryColor,
                        backgroundColor: 'white'
                      }}
                    >
                      Yes
                    </Button>
                    <Button
                      onClick={() => handleYesNoClick('No')}
                      variant="outline"
                      className="px-8 py-3 rounded-full font-medium transition-all hover:scale-105 shadow-sm border-2"
                      style={{ 
                        borderColor: primaryColor,
                        color: primaryColor,
                        backgroundColor: 'white'
                      }}
                    >
                      No
                    </Button>
                  </div>
                )}
              </div>
            ))}
            
            {showTypingIndicator && (
              <div className="flex gap-3 items-start animate-fade-in">
                <div className="flex-shrink-0 mt-1">
                  {avatarSrc ? (
                    <Avatar className="w-9 h-9 border-2 border-white shadow-md">
                      <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                      <AvatarFallback style={{ 
                        background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
                        color: secondaryColor
                      }}>
                        <Bot size={18} />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-md"
                      style={{ 
                        background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})`,
                        color: secondaryColor,
                        boxShadow: `0 4px 12px ${primaryColor}30`
                      }}
                    >
                      <Bot size={18} />
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    "rounded-2xl p-4 max-w-[80%] shadow-sm border border-gray-100 bg-white"
                  )}
                >
                  <div className="flex space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {messages.length === 1 && suggestions && suggestions.length > 0 && !shouldDisableInput && (
              <div className="flex flex-col gap-3 mt-4 animate-fade-in">
                <p className="text-xs text-gray-500 mb-1 font-medium">Suggested questions:</p>
                {suggestions.filter(Boolean).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-sm text-left px-4 py-3 rounded-xl transition-all hover:scale-[1.02] shadow-sm border bg-white hover:shadow-md"
                    style={{ 
                      border: `1px solid ${primaryColor}20`,
                      backgroundColor: 'white',
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
        
        <div className="border-t border-gray-100 p-4 bg-white/80 backdrop-blur-sm mt-auto">
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={shouldDisableInput ? "Please select Yes or No above..." : "Type your message..."}
              className="pr-14 text-sm border-2 pl-4 focus-visible:ring-offset-0 dark:bg-white rounded-xl shadow-sm transition-all duration-200"
              style={{ 
                borderColor: `${primaryColor}20`,
                minHeight: "52px",
                maxHeight: "120px",
                width: "calc(100% - 44px)"
              }}
              disabled={!isConnected || shouldDisableInput}
              expandable={true}
              maxExpandedHeight="120px"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !shouldDisableInput) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button 
              type="submit" 
              className="absolute right-[2px] top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all hover:scale-110 shadow-lg border border-white/50"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -15)})`,
                color: secondaryColor,
                boxShadow: `0 4px 12px ${primaryColor}40`,
                opacity: (isConnected && !shouldDisableInput) ? 1 : 0.5,
              }}
              disabled={!isConnected || shouldDisableInput}
            >
              <Send size={18} />
            </button>
          </form>
          <div className="text-center mt-3 text-xs text-gray-400 font-medium">
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
