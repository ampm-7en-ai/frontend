import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bot, Send, User, WifiOff, AlertCircle, Minus, RotateCcw } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { Textarea } from '@/components/ui/textarea';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernInput } from '@/components/ui/modern-input';
import { Button } from '@/components/ui/button';

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
  avatarSrc,
  onMinimize,
  onRestart
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

  // Check if input should be disabled (when there's a pending yes/no question)
  const shouldDisableInput = messages.some(msg => 
    msg.type === 'ui' && msg.ui_type === 'yes_no'
  );

  // Get the latest yes/no message for displaying buttons
  const latestYesNoMessage = messages.slice().reverse().find(msg => 
    msg.type === 'ui' && msg.ui_type === 'yes_no'
  );

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

  // Improved message ID generation for better deduplication
  const generateUniqueMessageId = (message: any): string => {
    // Use existing messageId if available
    if (message.messageId) return message.messageId;
    
    // Create a more robust ID based on content + type + sequence
    messageSequenceRef.current += 1;
    const contentHash = message.content.slice(0, 30).replace(/\s+/g, '-');
    return `${message.type}-${contentHash}-${messageSequenceRef.current}-${Date.now()}`;
  };

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
        
        // Skip if we're in the middle of restarting
        if (restartingRef.current) {
          console.log("Skipping message during restart");
          return;
        }
        
        // Handle system messages for typing indicator
        if (message.type === 'system_message') {
          setSystemMessage(message.content);
          setShowTypingIndicator(true);
          return;
        }
        
        // Generate unique message ID for better deduplication
        const messageId = generateUniqueMessageId(message);
        
        // Enhanced deduplication check
        if (processedMessageIds.current.has(messageId)) {
          console.log("Duplicate message detected, skipping:", messageId);
          return;
        }
        
        // Add to processed set
        processedMessageIds.current.add(messageId);
        
        // Clear typing indicator and system message
        setShowTypingIndicator(false);
        setSystemMessage('');
        
        // Add message to state
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

  const handleRestart = () => {
    // Set restarting flag
    restartingRef.current = true;
    
    // Completely reset the chat state
    setMessages([]);
    setShowTypingIndicator(false);
    setSystemMessage('');
    setConnectionError(null);
    setIsInitializing(true);
    setIsConnected(false);
    
    // Clear processed message IDs and reset sequence
    processedMessageIds.current.clear();
    messageSequenceRef.current = 0;
    
    // Properly disconnect and cleanup existing connection
    if (chatServiceRef.current) {
      chatServiceRef.current.disconnect();
      chatServiceRef.current = null;
    }
    
    // Create a completely new connection after a longer delay to ensure cleanup
    setTimeout(() => {
      if (agentId) {
        console.log("Restarting ChatWebSocketService with agent ID:", agentId);
        
        chatServiceRef.current = new ChatWebSocketService(agentId, "preview");
        
        chatServiceRef.current.on({
          onMessage: (message) => {
            console.log("Restart - Received message:", message);
            
            // Skip if we're still in restarting state
            if (restartingRef.current) {
              console.log("Still restarting, skipping message");
              return;
            }
            
            // Handle system messages for typing indicator
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
              // Clear restarting flag once connected
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

  return (
    <Card 
      className={cn(
        "flex flex-col backdrop-blur-sm animate-scale-in relative",
        className
      )}
      style={{ 
        fontFamily: fontFamily,
        height: '100%',
        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px ${primaryColor}20, 0 8px 32px ${primaryColor}15`,
        border: `1px solid ${primaryColor}10`,
        animation: 'scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
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
                    <Bot size={24} />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Bot size={24} className="text-white drop-shadow-sm" />
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
          
          {onMinimize && (
            <ModernButton
              onClick={onMinimize}
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
            
            {/* Welcome Message - Compact Disclaimer Style */}
            {welcomeMessage && (
              <div className="animate-fade-in">
                <div 
                  className="border rounded-lg p-3 text-center"
                  style={{
                    backgroundColor: `${primaryColor}05`,
                    borderColor: `${primaryColor}20`
                  }}
                >
                  <div className="text-xs italic text-gray-600 leading-relaxed">
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
                          "rounded-2xl p-4 max-w-[88%] relative transition-all duration-300",
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
                                      style={{ color: '#3b82f6' }}
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
                                        style={{ backgroundColor: '#3b82f6' }}
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
                                    style={{ color: message.type === 'user' ? 'inherit' : '#3b82f6' }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {children}
                                  </a>
                                );
                              },
                              p({children}){
                                return message.type === 'system_message' ? (
                                  <p style={{fontSize:"12px", fontWeight: "500"}}>{children}</p>
                                ) : (<p className="leading-relaxed">{children}</p>)
                              }
                            }}
                          >
                            {message.content} 
                          </ReactMarkdown>
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

        {/* Updated Typing Indicator - positioned 5px higher (105px from bottom) */}
        {showTypingIndicator && (
          <div 
            className="absolute bottom-[105px] left-4 flex items-center gap-2 z-20"
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
                    <Bot size={10} />
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
                  <Bot size={10} />
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
        
        {/* Message Input - Fixed Layout with Expandable Textarea */}
        <div className="border-t border-gray-100 p-4 bg-white/80 backdrop-blur-sm flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={shouldDisableInput ? "Please select Yes or No above..." : "Type your message..."}
                className="text-sm border-2 focus-visible:ring-offset-0 dark:bg-white rounded-xl transition-all duration-200 resize-none overflow-hidden"
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
            </div>
            <ModernButton
              type="submit" 
              className="p-3 rounded-xl transition-all hover:scale-105 border border-white/50 flex-shrink-0"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -30)})`,
                color: secondaryColor,
                opacity: (isConnected && !shouldDisableInput) ? 1 : 0.5,
                minHeight: "44px",
                minWidth: "44px"
              }}
              disabled={!isConnected || shouldDisableInput}
              iconOnly
              icon={Send}
            />
          </form>
          <div className="text-center mt-3 text-xs text-gray-400 font-medium">
            powered by 7en.ai
          </div>
        </div>
      </div>
      
      {/* Enhanced CSS Animations */}
      <style>
        {`
          @keyframes messageSlideUp {
            0% {
              transform: translateY(20px) scale(0.96);
              opacity: 0;
            }
            60% {
              transform: translateY(-2px) scale(1.01);
              opacity: 0.8;
            }
            100% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          
          @keyframes typingBounceIn {
            0% {
              transform: translateY(60px) scale(0.3);
              opacity: 0;
            }
            50% {
              transform: translateY(-8px) scale(1.1);
              opacity: 0.8;
            }
            100% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }

          @keyframes typingBounceOut {
            0% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
            50% {
              transform: translateY(-8px) scale(1.1);
              opacity: 0.8;
            }
            100% {
              transform: translateY(60px) scale(0.3);
              opacity: 0;
            }
          }
          
          @keyframes typingDotBounce {
            0%, 60%, 100% {
              transform: translateY(0) scale(1);
              opacity: 0.4;
            }
            30% {
              transform: translateY(-4px) scale(1.2);
              opacity: 1;
            }
          }
          
          @keyframes suggestionSlideIn {
            0% {
              transform: translateX(-20px) scale(0.95);
              opacity: 0;
            }
            100% {
              transform: translateX(0) scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
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
