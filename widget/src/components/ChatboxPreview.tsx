
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { cn } from '../utils/cn';
import { Bot, Send, User, WifiOff, AlertCircle, Minus, RotateCcw, MessageCircleReplyIcon, User2, MessageSquare } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ChatWebSocketService } from '../services/ChatWebSocketService';
import { LoadingSpinner } from './ui/loading-spinner';
import { useToast } from '../hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { Textarea } from './ui/textarea';
import { ModernButton } from './ui/modern-button';
import { Button } from './ui/button';

interface Message {
  type: string;
  content: string;
  timestamp: string;
  ui_type?: string;
  messageId?: string;
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
  onMinimize?: () => void;
  onRestart?: () => void;
  showFloatingButton?: boolean;
  initiallyMinimized?: boolean;
  canvasMode?: boolean;
}

export const ChatboxPreview = ({
  agentId,
  primaryColor = '#9b87f5',
  secondaryColor = '#ffffff',
  fontFamily = 'Inter',
  chatbotName = 'Assistant',
  welcomeMessage = '',
  buttonText = '',
  position = 'bottom-right',
  className,
  suggestions = [],
  avatarSrc,
  onMinimize,
  onRestart,
  showFloatingButton = false,
  initiallyMinimized = false,
  canvasMode = false
}: ChatboxPreviewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const chatServiceRef = useRef<ChatWebSocketService | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const processedMessageIds = useRef<Set<string>>(new Set());
  const restartingRef = useRef(false);
  const messageSequenceRef = useRef<number>(0);

  const [isMinimized, setIsMinimized] = useState(initiallyMinimized);

  const shouldDisableInput = messages.some(msg => 
    msg.type === 'ui' && msg.ui_type === 'yes_no'
  );

  const latestYesNoMessage = messages.slice().reverse().find(msg => 
    msg.type === 'ui' && msg.ui_type === 'yes_no'
  );

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [messages, showTypingIndicator]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        scrollViewportRef.current = viewport as HTMLDivElement;
      }
    }
  }, []);

  const generateUniqueMessageId = (message: any): string => {
    if (message.messageId) return message.messageId;
    messageSequenceRef.current += 1;
    const contentHash = message.content.slice(0, 30).replace(/\s+/g, '-');
    return `${message.type}-${contentHash}-${messageSequenceRef.current}-${Date.now()}`;
  };

  useEffect(() => {
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
        
        if (restartingRef.current) {
          console.log("Skipping message during restart");
          return;
        }
        
        if (message.type === 'system_message') {
          setSystemMessage(message.content);
          setShowTypingIndicator(true);
          return;
        }
        
        const messageId = generateUniqueMessageId(message);
        
        if (processedMessageIds.current.has(messageId)) {
          console.log("Duplicate message detected, skipping:", messageId);
          return;
        }
        
        processedMessageIds.current.add(messageId);
        setShowTypingIndicator(false);
        setSystemMessage('');
        setMessages(prev => [...prev, { ...message, messageId }]); 
      },
      onTypingStart: () => {
        console.log("Typing indicator started");
        if (!restartingRef.current) {
          setShowTypingIndicator(true);
        }
      },
      onTypingEnd: () => {
        console.log("Typing indicator ended");
        setShowTypingIndicator(false);
        setSystemMessage('');
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

    messageSequenceRef.current += 1;
    const newMessage: Message = {
      type: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
      messageId: `user-${Date.now()}-${messageSequenceRef.current}`
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

  const handleRestart = () => {
    restartingRef.current = true;
    
    setMessages([]);
    setShowTypingIndicator(false);
    setSystemMessage('');
    setConnectionError(null);
    setIsInitializing(true);
    setIsConnected(false);
    
    processedMessageIds.current.clear();
    messageSequenceRef.current = 0;
    
    if (chatServiceRef.current) {
      chatServiceRef.current.disconnect();
      chatServiceRef.current = null;
    }
    
    setTimeout(() => {
      if (agentId) {
        console.log("Restarting ChatWebSocketService with agent ID:", agentId);
        
        chatServiceRef.current = new ChatWebSocketService(agentId, "preview");
        
        chatServiceRef.current.on({
          onMessage: (message) => {
            console.log("Restart - Received message:", message);
            
            if (restartingRef.current) {
              console.log("Still restarting, skipping message");
              return;
            }
            
            if (message.type === 'system_message') {
              setSystemMessage(message.content);
              setShowTypingIndicator(true);
              return;
            }
            
            const messageId = generateUniqueMessageId(message);
            
            if (processedMessageIds.current.has(messageId)) {
              console.log("Duplicate message detected during restart, skipping:", messageId);
              return;
            }
            
            processedMessageIds.current.add(messageId);
            setShowTypingIndicator(false);
            setSystemMessage('');
            setMessages(prev => [...prev, { ...message, messageId }]); 
          },
          onTypingStart: () => {
            console.log("Restart - Typing indicator started");
            if (!restartingRef.current) {
              setShowTypingIndicator(true);
            }
          },
          onTypingEnd: () => {
            console.log("Restart - Typing indicator ended");
            setShowTypingIndicator(false);
            setSystemMessage('');
          },
          onError: (error) => {
            console.error('Restart - Chat error:', error);
            setConnectionError(error);
            setIsConnected(false);
            setIsInitializing(false);
            restartingRef.current = false;
          },
          onConnectionChange: (status) => {
            console.log("Restart - Connection status changed:", status);
            setIsConnected(status);
            setIsInitializing(false);
            if (status) {
              setConnectionError(null);
              setTimeout(() => {
                restartingRef.current = false;
              }, 1000);
            }
          }
        });
        
        chatServiceRef.current.connect();
      }
    }, 1000);
  };

  const getMessageStyling = (messageType: string) => {
    switch (messageType) {
      case 'bot_response':
        return {
          containerClass: 'bg-white border border-gray-200/60 shadow-sm',
          textClass: 'text-gray-800'
        };
      case 'user':
        return {
          containerClass: 'text-white border border-transparent shadow-md',
          textClass: 'text-white',
          style: { 
            background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -30)})`
          }
        };
      case 'system_message':
        return {
          containerClass: `border shadow-sm`,
          textClass: 'text-blue-800',
          style: {
            backgroundColor: `${primaryColor}10`,
            borderColor: `${primaryColor}30`
          }
        };
      default:
        return {
          containerClass: 'bg-gray-50 border border-gray-200',
          textClass: 'text-gray-700'
        };
    }
  };

  const handleMinimizeToggle = () => {
    if (onMinimize) {
      onMinimize();
    } else {
      setIsMinimized(!isMinimized);
    }
  };

  const handleExpand = () => {
    setIsMinimized(false);
  };

  // Enhanced floating button positioning - both chat and button always visible
  if (showFloatingButton) {
    const hasButtonText = buttonText && buttonText.trim() !== '';
    const iconSize = hasButtonText ? 24 : 36;
    
    return (
      <div className="relative w-full h-full">
        {/* Chat window - positioned above the button with generous gap */}
        {!isMinimized && (
          <div className="absolute bottom-28 right-4 w-80 h-80">
            <Card 
              className={cn(
                "flex flex-col backdrop-blur-sm h-full animate-scale-in"
              )}
              style={{ 
                fontFamily: fontFamily,
                boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px ${primaryColor}20, 0 8px 32px ${primaryColor}15`,
                border: `1px solid ${primaryColor}10`,
              }}
            >
              {/* Header */}
              <div 
                className="p-5 rounded-t-xl flex items-center justify-between relative overflow-hidden flex-shrink-0"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -30)}, ${adjustColor(primaryColor, -50)})`
                }}
              >
                {/* Modern gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="relative">
                    <div className="flex items-center justify-center overflow-hidden bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 border border-white/30">
                      {avatarSrc ? (
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                          <AvatarFallback className="text-white bg-transparent">
                            <User2 size={24} />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <MessageCircleReplyIcon size={24} className="text-white drop-shadow-sm" />
                      )}
                    </div>
                    {/* Online indicator */}
                    {isConnected && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white text-lg drop-shadow-sm">{chatbotName}</span>
                    <span className="text-white/80 text-sm">
                      {isConnected ? 'Online' : 'Connecting...'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 relative z-10">
                  {/* Control buttons */}
                  <ModernButton
                    onClick={handleRestart}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                    title="Restart chat"
                    icon={RotateCcw}
                    iconOnly
                  />
                  
                  <ModernButton
                    onClick={handleMinimizeToggle}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                    title="Minimize chat"
                    icon={Minus}
                    iconOnly
                  />
                  
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
              </div>
              
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-h-0 relative">
                {/* Messages Area */}
                <ScrollArea 
                  ref={scrollAreaRef}
                  className="flex-1 min-h-0"
                >
                  <div className="p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white min-h-full">
                    {connectionError && (
                      <div className="flex items-center gap-3 p-4 bg-red-50/80 border border-red-200/60 rounded-xl backdrop-blur-sm">
                        <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                        <span className="text-sm text-red-800">Connection failed. Please check your agent configuration.</span>
                      </div>
                    )}
                    
                    {/* Welcome Message - Only show if welcomeMessage has content */}
                    {welcomeMessage && welcomeMessage.trim() && (
                      <div className="animate-fade-in">
                        <div 
                          className="border rounded-lg p-3 text-left"
                          style={{
                            backgroundColor: `${primaryColor}05`,
                            borderColor: `${primaryColor}20`
                          }}
                        >
                          <div className="text-xs italic text-gray-600 leading-relaxed text-left">
                            <ReactMarkdown>{welcomeMessage}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Regular Messages */}
                    {messages.map((message, index) => {
                      const styling = getMessageStyling(message.type);
                      const isConsecutive = index > 0 && messages[index - 1]?.type === message.type;
                      
                      return (
                        <div key={message.messageId || index} className={isConsecutive ? 'mt-2' : 'mt-4'}>
                          {message.type !== 'ui' && (
                            <div 
                              className={`flex gap-4 items-start ${message.type === 'user' ? 'justify-end' : message.type === 'bot_response' ? 'justify-start' : 'justify-center'}`}
                              style={{
                                animation: 'messageSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                              }}
                            >
                              <div
                                className={cn(
                                  "rounded-2xl p-4 max-w-[92%] relative transition-all duration-300",
                                  styling.containerClass,
                                  styling.textClass
                                )}
                                style={{
                                  ...styling.style,
                                  transform: 'scale(1)',
                                  willChange: 'auto'
                                }}
                              >
                                <div className="text-sm prose prose-sm max-w-none markdown-content">
                                  <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Yes/No UI Component */}
                          {message.type === 'ui' && message.ui_type === 'yes_no' && (
                            <div className="flex gap-3 justify-center animate-fade-in">
                              <ModernButton
                                onClick={() => handleYesNoClick('Yes')}
                                variant="outline"
                                className="px-8 py-3 rounded-full font-medium transition-all hover:scale-105 border-2"
                                style={{ 
                                  borderColor: primaryColor,
                                  color: primaryColor,
                                  backgroundColor: 'white'
                                }}
                              >
                                Yes
                              </ModernButton>
                              <ModernButton
                                onClick={() => handleYesNoClick('No')}
                                variant="outline"
                                className="px-8 py-3 rounded-full font-medium transition-all hover:scale-105 border-2"
                                style={{ 
                                  borderColor: primaryColor,
                                  color: primaryColor,
                                  backgroundColor: 'white'
                                }}
                              >
                                No
                              </ModernButton>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Suggestions - only show if we have few messages and no pending UI components */}
                    {messages.length === 0 && suggestions && suggestions.length > 0 && !shouldDisableInput && (
                      <div className="flex flex-col gap-3 mt-6 animate-fade-in">
                        <p className="text-xs text-gray-500 mb-2 font-medium">Suggested questions:</p>
                        {suggestions.filter(Boolean).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-sm text-left px-4 py-3 rounded-xl transition-all hover:scale-[1.02] border bg-white hover:bg-gray-50 hover:shadow-md"
                            style={{ 
                              border: `1px solid ${primaryColor}20`,
                              backgroundColor: 'white',
                              color: 'inherit',
                              animation: `suggestionSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards ${index * 0.1}s both`
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Updated Typing Indicator - positioned appropriately for smaller chat */}
                {showTypingIndicator && (
                  <div 
                    className="absolute bottom-[100px] left-4 flex items-center gap-2 z-20"
                    style={{
                      animation: 'typingBounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards'
                    }}
                  >
                    {/* Smaller Avatar (2x smaller) */}
                    <div className="flex-shrink-0">
                      {avatarSrc ? (
                        <Avatar className="w-5 h-5 border border-white">
                          <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                          <AvatarFallback style={{ 
                            background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -30)})`,
                            color: secondaryColor
                          }}>
                            <User2 size={10} />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center border border-white"
                          style={{ 
                            background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -30)})`,
                            color: secondaryColor
                          }}
                        >
                          <User2 size={10} />
                        </div>
                      )}
                    </div>

                    {/* Smaller Typing Dots Container */}
                    <div 
                      className="rounded-full px-2 py-1 border border-gray-200/60 bg-white shadow-sm flex items-center gap-1"
                    >
                      <div className="flex space-x-1">
                        <div 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ 
                            backgroundColor: `${primaryColor}60`,
                            animation: 'typingDotBounce 1.4s ease-in-out infinite',
                            animationDelay: '0ms'
                          }}
                        ></div>
                        <div 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ 
                            backgroundColor: `${primaryColor}60`,
                            animation: 'typingDotBounce 1.4s ease-in-out infinite',
                            animationDelay: '200ms'
                          }}
                        ></div>
                        <div 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ 
                            backgroundColor: `${primaryColor}60`,
                            animation: 'typingDotBounce 1.4s ease-in-out infinite',
                            animationDelay: '400ms'
                          }}
                        ></div>
                      </div>

                      {/* System Message Display */}
                      {systemMessage && (
                        <div className="ml-2 text-xs text-gray-600 font-medium animate-fade-in">
                          {systemMessage}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Message Input - With integrated send button */}
                <div className="border-t border-gray-100 p-4 bg-white/80 backdrop-blur-sm flex-shrink-0">
                  <form onSubmit={handleSubmit} className="relative">
                    <Textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={shouldDisableInput ? "Please select Yes or No above..." : "Type your message..."}
                      className="text-sm border-2 focus-visible:ring-offset-0 dark:bg-white rounded-xl transition-all duration-200 resize-none overflow-hidden pr-12"
                      style={{ 
                        borderColor: `${primaryColor}20`,
                        minHeight: "44px",
                        maxHeight: "120px"
                      }}
                      disabled={!isConnected || shouldDisableInput}
                      rows={1}
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
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all hover:scale-105"
                      style={{ 
                        color: primaryColor,
                        opacity: (isConnected && !shouldDisableInput && inputValue.trim()) ? 1 : 0.4
                      }}
                      disabled={!isConnected || shouldDisableInput || !inputValue.trim()}
                    >
                      <Send size={20} />
                    </button>
                  </form>
                  <div className="text-center mt-3 text-xs text-gray-400 font-medium">
                    powered by 7en.ai
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Floating button - always visible at bottom-right with proper styling */}
        <ModernButton
          onClick={isMinimized ? handleExpand : handleMinimizeToggle}
          className={`absolute bottom-4 right-4 z-50 ${hasButtonText ? 'rounded-full px-6 py-4 h-auto' : 'rounded-full w-16 h-16 p-0'} shadow-2xl hover:scale-110 transition-all duration-300 border-4 border-white/30 group relative overflow-hidden`}
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -30)})`,
            boxShadow: `0 10px 30px rgba(59, 130, 246, 0.5), 0 5px 15px rgba(59, 130, 246, 0.4)`,
            fontFamily: fontFamily,
            borderRadius: "40px"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex items-center gap-2">
            {avatarSrc ? (
              <Avatar className={hasButtonText ? "w-6 h-6" : "w-9 h-9"}>
                <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                <AvatarFallback className="text-white bg-transparent">
                  <Bot size={hasButtonText ? 16 : 24} />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Bot className="text-white" size={iconSize} />
            )}
            {hasButtonText && (
              <span className="text-white font-medium text-sm">
                {buttonText}
              </span>
            )}
          </div>
        </ModernButton>
      </div>
    );
  }

  return (
    <Card 
      className={cn(
        "flex flex-col backdrop-blur-sm relative",
        showFloatingButton && !isMinimized ? "animate-chatbox-expand" : "animate-scale-in",
        className
      )}
      style={{ 
        fontFamily: fontFamily,
        height: '100%',
        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px ${primaryColor}20, 0 8px 32px ${primaryColor}15`,
        border: `1px solid ${primaryColor}10`,
        transformOrigin: showFloatingButton ? (position === 'bottom-left' ? 'bottom left' : 'bottom right') : 'center'
      }}
    >
      {/* Header */}
      <div 
        className="p-5 rounded-t-xl flex items-center justify-between relative overflow-hidden flex-shrink-0"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -30)}, ${adjustColor(primaryColor, -50)})`
        }}
      >
        {/* Modern gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <div className="flex items-center justify-center overflow-hidden bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 border border-white/30">
              {avatarSrc ? (
                <Avatar className="w-12 h-12">
                  <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                  <AvatarFallback className="text-white bg-transparent">
                    <User2 size={24} />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <User2 size={24} className="text-white drop-shadow-sm" />
              )}
            </div>
            {/* Online indicator */}
            {isConnected && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white text-lg drop-shadow-sm">{chatbotName}</span>
            <span className="text-white/80 text-sm">
              {isConnected ? 'Online' : 'Connecting...'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 relative z-10">
          {/* Control buttons */}
          <ModernButton
            onClick={handleRestart}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            title="Restart chat"
            icon={RotateCcw}
            iconOnly
          />
          
          {(onMinimize || showFloatingButton) && (
            <ModernButton
              onClick={handleMinimizeToggle}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Minimize chat"
              icon={Minus}
              iconOnly
            />
          )}
          
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
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative" style={{overflow:"hidden",borderRadius:"0 0 20px 20px"}}>
        {/* Messages Area */}
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 min-h-0"
        >
          <div className="p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white min-h-full">
            {connectionError && (
              <div className="flex items-center gap-3 p-4 bg-red-50/80 border border-red-200/60 rounded-xl backdrop-blur-sm">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-800">Connection failed. Please check your agent configuration.</span>
              </div>
            )}
            
            {/* Welcome Message - Only show if welcomeMessage has content */}
            {welcomeMessage && welcomeMessage.trim() && (
              <div className="animate-fade-in">
                <div 
                  className="border rounded-lg p-3 text-left"
                  style={{
                    backgroundColor: `${primaryColor}05`,
                    borderColor: `${primaryColor}20`
                  }}
                >
                  <div className="text-xs italic text-gray-600 leading-relaxed text-left">
                    <ReactMarkdown>{welcomeMessage}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
            
            {/* Regular Messages */}
            {messages.map((message, index) => {
              const styling = getMessageStyling(message.type);
              const isConsecutive = index > 0 && messages[index - 1]?.type === message.type;
              
              return (
                <div key={message.messageId || index} className={isConsecutive ? 'mt-2' : 'mt-4'}>
                  {message.type !== 'ui' && (
                    <div 
                      className={`flex gap-4 items-start ${message.type === 'user' ? 'justify-end' : message.type === 'bot_response' ? 'justify-start' : 'justify-center'}`}
                      style={{
                        animation: 'messageSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                      }}
                    >
                      <div
                        className={cn(
                          "rounded-2xl p-4 max-w-[92%] relative transition-all duration-300",
                          styling.containerClass,
                          styling.textClass
                        )}
                        style={{
                          ...styling.style,
                          transform: 'scale(1)',
                          willChange: 'auto'
                        }}
                      >
                        <div className="text-sm prose prose-sm max-w-none markdown-content">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Yes/No UI Component */}
                  {message.type === 'ui' && message.ui_type === 'yes_no' && (
                    <div className="flex gap-3 justify-center animate-fade-in">
                      <ModernButton
                        onClick={() => handleYesNoClick('Yes')}
                        variant="outline"
                        className="px-8 py-3 rounded-full font-medium transition-all hover:scale-105 border-2"
                        style={{ 
                          borderColor: primaryColor,
                          color: primaryColor,
                          backgroundColor: 'white'
                        }}
                      >
                        Yes
                      </ModernButton>
                      <ModernButton
                        onClick={() => handleYesNoClick('No')}
                        variant="outline"
                        className="px-8 py-3 rounded-full font-medium transition-all hover:scale-105 border-2"
                        style={{ 
                          borderColor: primaryColor,
                          color: primaryColor,
                          backgroundColor: 'white'
                        }}
                      >
                        No
                      </ModernButton>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Suggestions - only show if we have few messages and no pending UI components */}
            {messages.length === 0 && suggestions && suggestions.length > 0 && !shouldDisableInput && (
              <div className="flex flex-col gap-3 mt-6 animate-fade-in">
                <p className="text-xs text-gray-500 mb-2 font-medium">Suggested questions:</p>
                {suggestions.filter(Boolean).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-sm text-left px-4 py-3 rounded-xl transition-all hover:scale-[1.02] border bg-white hover:bg-gray-50 hover:shadow-md"
                    style={{ 
                      border: `1px solid ${primaryColor}20`,
                      backgroundColor: 'white',
                      color: 'inherit',
                      animation: `suggestionSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards ${index * 0.1}s both`
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Updated Typing Indicator - positioned 115px from bottom (20+5px more) */}
        {showTypingIndicator && (
          <div 
            className="absolute bottom-[115px] left-4 flex items-center gap-2 z-20"
            style={{
              animation: 'typingBounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards'
            }}
          >
            {/* Smaller Avatar (2x smaller) */}
            <div className="flex-shrink-0">
              {avatarSrc ? (
                <Avatar className="w-5 h-5 border border-white">
                  <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                  <AvatarFallback style={{ 
                    background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -30)})`,
                    color: secondaryColor
                  }}>
                    <User2 size={10} />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center border border-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -30)})`,
                    color: secondaryColor
                  }}
                >
                  <User2 size={10} />
                </div>
              )}
            </div>

            {/* Smaller Typing Dots Container */}
            <div 
              className="rounded-full px-2 py-1 border border-gray-200/60 bg-white shadow-sm flex items-center gap-1"
            >
              <div className="flex space-x-1">
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ 
                    backgroundColor: `${primaryColor}60`,
                    animation: 'typingDotBounce 1.4s ease-in-out infinite',
                    animationDelay: '0ms'
                  }}
                ></div>
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ 
                    backgroundColor: `${primaryColor}60`,
                    animation: 'typingDotBounce 1.4s ease-in-out infinite',
                    animationDelay: '200ms'
                  }}
                ></div>
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ 
                    backgroundColor: `${primaryColor}60`,
                    animation: 'typingDotBounce 1.4s ease-in-out infinite',
                    animationDelay: '400ms'
                  }}
                ></div>
              </div>

              {/* System Message Display */}
              {systemMessage && (
                <div className="ml-2 text-xs text-gray-600 font-medium animate-fade-in">
                  {systemMessage}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Message Input - With integrated send button */}
        <div className="border-t border-gray-100 p-4 bg-white/80 backdrop-blur-sm flex-shrink-0">
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={shouldDisableInput ? "Please select Yes or No above..." : "Type your message..."}
              className="text-sm border-2 focus-visible:ring-offset-0 dark:bg-white rounded-xl transition-all duration-200 resize-none overflow-hidden pr-12"
              style={{ 
                borderColor: `${primaryColor}20`,
                minHeight: "44px",
                maxHeight: "120px"
              }}
              disabled={!isConnected || shouldDisableInput}
              rows={1}
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
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all hover:scale-105"
              style={{ 
                color: primaryColor,
                opacity: (isConnected && !shouldDisableInput && inputValue.trim()) ? 1 : 0.4
              }}
              disabled={!isConnected || shouldDisableInput || !inputValue.trim()}
            >
              <Send size={20} />
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
