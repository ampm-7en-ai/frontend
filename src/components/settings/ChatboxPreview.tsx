import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModernInput } from '@/components/ui/modern-input';
import { ArrowUp, ArrowRight, Moon, Sun, User, ArrowLeft, Bot, X } from 'lucide-react';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'bot_response' | 'system_message' | 'ui';
  timestamp: string;
  ui_type?: string;
  session_id?: string;
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
  suggestions: string[];
  avatarSrc?: string;
  className?: string;
}

const fallbackSuggestions = [
  "How can I help you today?",
  "What services do you offer?",
  "Tell me about your company"
];

const thinkingMessages = [
  "Thinking...",
  "Searching knowledge base...",
  "Processing your question...",
  "Connecting to agent...",
  "Analyzing information...",
  "Finding relevant answers..."
];

export const ChatboxPreview: React.FC<ChatboxPreviewProps> = ({
  agentId,
  primaryColor,
  secondaryColor,
  fontFamily,
  chatbotName,
  welcomeMessage,
  buttonText,
  position,
  suggestions,
  avatarSrc,
  className
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [thinkingMessage, setThinkingMessage] = useState<string>("Thinking...");
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [emailInput, setEmailInput] = useState<string>('');
  const [activeUIMessage, setActiveUIMessage] = useState<ChatMessage | null>(null);
  
  const chatServiceRef = useRef<ChatWebSocketService | null>(null);
  const thinkingIntervalRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useAppTheme();
  const { toast } = useToast();

  useEffect(() => {
    if (theme === 'light' || theme === 'dark') {
      setCurrentTheme(theme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setCurrentTheme(prefersDark ? 'dark' : 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    if (!agentId) return;

    console.log("Initializing ChatWebSocketService with agent ID:", agentId);
    
    chatServiceRef.current = new ChatWebSocketService(agentId, "chat");
    
    chatServiceRef.current.on({
      onMessage: (message) => {
        console.log("Received message:", message);
        
        // Handle UI messages
        if (message.type === 'ui') {
          const uiMessage: ChatMessage = {
            id: `ui-${Date.now()}`,
            content: '',
            type: 'ui',
            timestamp: message.timestamp,
            ui_type: message.ui_type,
            session_id: message.session_id
          };
          
          setChatHistory(prev => [...prev, uiMessage]);
          setActiveUIMessage(uiMessage);
          clearThinkingInterval();
          setIsProcessing(false);
          return;
        }
        
        // Handle system messages for thinking states
        if (message.type === 'system_message') {
          setThinkingMessage(`${message.content}`);
          return;
        }
        
        // For regular messages, stop the thinking animation
        clearThinkingInterval();
        setIsProcessing(false);
        setActiveUIMessage(null);
        
        // Add the bot response to chat history
        const newMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          content: message.content,
          type: 'bot_response',
          timestamp: message.timestamp
        };
        
        setChatHistory(prev => [...prev, newMessage]);
      },
      onTypingStart: () => {
        console.log("Typing indicator started");
      },
      onTypingEnd: () => {
        console.log("Typing indicator ended");
      },
      onError: (error) => {
        console.error('Chat error:', error);
        clearThinkingInterval();
        toast({
          title: "Connection Error",
          description: "Failed to connect to assistant service. Please try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
        setIsConnected(false);
        setActiveUIMessage(null);
      },
      onConnectionChange: (status) => {
        console.log("Connection status changed:", status);
        setIsConnected(status);
        if (!status) {
          clearThinkingInterval();
          setIsProcessing(false);
          setActiveUIMessage(null);
        }
      }
    });
    
    return () => {
      console.log("Cleaning up ChatWebSocketService");
      clearThinkingInterval();
      if (chatServiceRef.current) {
        chatServiceRef.current.disconnect();
        chatServiceRef.current = null;
      }
    };
  }, [agentId, toast]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory.length, isProcessing]);

  const startThinkingAnimation = () => {
    clearThinkingInterval();
    
    let messageIndex = 0;
    const intervalId = window.setInterval(() => {
      messageIndex = (messageIndex + 1) % thinkingMessages.length;
      setThinkingMessage(thinkingMessages[messageIndex].toLowerCase());
    }, 3000);
    
    thinkingIntervalRef.current = intervalId;
  };
  
  const clearThinkingInterval = () => {
    if (thinkingIntervalRef.current !== null) {
      clearInterval(thinkingIntervalRef.current);
      thinkingIntervalRef.current = null;
    }
  };

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;

    setHasInteracted(true);
    
    const userQueryCopy = query;
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: userQueryCopy,
      type: 'user',
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsProcessing(true);
    setQuery('');
    
    if (!chatServiceRef.current?.isConnected()) {
      toast({
        title: "Not connected",
        description: "Cannot send query while disconnected",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    startThinkingAnimation();
    
    try {
      chatServiceRef.current.sendMessage(userQueryCopy);
      console.log("Query sent:", userQueryCopy);
    } catch (error) {
      console.error("Error sending query:", error);
      clearThinkingInterval();
      toast({
        title: "Query Error",
        description: "Failed to send query. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  }, [query, toast]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSelectExample = useCallback((question: string) => {
    setHasInteracted(true);
    
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: question,
      type: 'user',
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsProcessing(true);
    
    if (chatServiceRef.current?.isConnected()) {
      startThinkingAnimation();
      chatServiceRef.current.sendMessage(question);
    } else {
      toast({
        title: "Not connected",
        description: "Cannot send query while disconnected",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  }, [toast]);

  // New functions for UI handling
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim() && isValidEmail(emailInput)) {
      sendUIResponse(emailInput.trim());
      setEmailInput('');
    }
  };

  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEmailSubmit(e);
    }
  };

  const handleNoThanks = () => {
    sendUIResponse('No thanks');
  };

  const sendUIResponse = (message: string) => {
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: message,
      type: 'user',
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, newUserMessage]);
    setActiveUIMessage(null);
    setIsProcessing(true);
    
    if (chatServiceRef.current?.isConnected()) {
      startThinkingAnimation();
      chatServiceRef.current.sendMessage(message);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const usedSuggestions = suggestions && suggestions.length > 0 ? suggestions : fallbackSuggestions;
  const isDarkTheme = currentTheme === 'dark';
  
  const bgColor = isDarkTheme ? '#1A1F2C' : '#FFFFFF';
  const textColor = isDarkTheme ? '#FFFFFF' : '#1A1F2C';
  const inputBgColor = isDarkTheme ? '#2a2a2a' : '#F5F6F7';
  const inputBorderColor = `${primaryColor}40`;
  const cardBgColor = isDarkTheme ? '#2a2a2a' : '#FFFFFF';
  const borderColor = isDarkTheme ? `${primaryColor}40` : '#E1E4E8';
  const codeBackgroundColor = isDarkTheme ? '#2d2d2d' : '#f6f6f6';
  const codeTextColor = isDarkTheme ? '#e0e0e0' : '#333333';
  const inlineCodeBg = isDarkTheme ? '#3a3a3a' : '#f0f0f0';
  const linkColor = isDarkTheme ? '#D6BCFA' : '#7559da';
  const strongTagColor = isDarkTheme ? '#D6BCFA' : primaryColor;

  return (
    <div 
      className={`fixed z-50 transition-all duration-300 ${className || ''}`}
      style={{ 
        [position.includes('right') ? 'right' : 'left']: '20px',
        bottom: '20px',
        fontFamily: fontFamily || 'Inter'
      }}
    >
      {/* Chat Window */}
      {isOpen && (
        <div 
          className="mb-4 w-80 h-96 rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
          style={{
            backgroundColor: cardBgColor,
            borderColor: borderColor
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: borderColor }}
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6" style={{ backgroundColor: primaryColor }}>
                {avatarSrc ? (
                  <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                ) : null}
                <AvatarFallback style={{ backgroundColor: primaryColor }}>
                  <Bot className="h-3 w-3 text-white" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium" style={{ color: textColor }}>
                {chatbotName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme} 
                className="p-1 rounded-full hover:bg-opacity-80 transition-colors"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                {currentTheme === 'dark' ? (
                  <Sun size={14} style={{ color: textColor }} />
                ) : (
                  <Moon size={14} style={{ color: textColor }} />
                )}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-opacity-80 transition-colors"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <X size={14} style={{ color: textColor }} />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {/* Welcome message */}
                {!hasInteracted && welcomeMessage && (
                  <div className="flex items-start gap-2">
                    <Avatar className="h-6 w-6 mt-1" style={{ backgroundColor: primaryColor }}>
                      {avatarSrc ? (
                        <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                      ) : null}
                      <AvatarFallback style={{ backgroundColor: primaryColor }}>
                        <Bot className="h-3 w-3 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-sm" style={{ color: textColor }}>
                      {welcomeMessage}
                    </div>
                  </div>
                )}

                {/* Chat messages */}
                {chatHistory.map((message, index) => {
                  if (message.type === 'user') {
                    return (
                      <div key={message.id} className="flex items-start gap-2 justify-end">
                        <div 
                          className="max-w-[80%] p-2 rounded-lg text-sm"
                          style={{
                            backgroundColor: primaryColor,
                            color: 'white'
                          }}
                        >
                          {message.content}
                        </div>
                        <Avatar className="h-6 w-6 mt-1">
                          <AvatarFallback className="bg-gray-200 dark:bg-gray-800">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    );
                  } else if (message.type === 'bot_response') {
                    return (
                      <div key={message.id} className="flex items-start gap-2">
                        <Avatar className="h-6 w-6 mt-1" style={{ backgroundColor: primaryColor }}>
                          {avatarSrc ? (
                            <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                          ) : null}
                          <AvatarFallback style={{ backgroundColor: primaryColor }}>
                            <Bot className="h-3 w-3 text-white" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-sm prose prose-sm max-w-none" style={{ color: textColor }}>
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                    );
                  } else if (message.type === 'ui' && message.ui_type === 'email') {
                    return (
                      <div key={message.id} className="flex items-start gap-2">
                        <Avatar className="h-6 w-6 mt-1" style={{ backgroundColor: primaryColor }}>
                          {avatarSrc ? (
                            <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                          ) : null}
                          <AvatarFallback style={{ backgroundColor: primaryColor }}>
                            <Bot className="h-3 w-3 text-white" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <p className="text-sm" style={{ color: textColor }}>
                            Please enter your email address:
                          </p>
                          <form onSubmit={handleEmailSubmit} className="space-y-2">
                            <ModernInput
                              type="email"
                              placeholder="Enter your email"
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              onKeyPress={handleEmailKeyPress}
                              className="text-sm"
                              variant="modern"
                              required
                            />
                            <div className="flex gap-2">
                              <Button
                                type="submit"
                                size="sm"
                                disabled={!isValidEmail(emailInput)}
                                style={{ backgroundColor: primaryColor }}
                                className="text-white"
                              >
                                Submit
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleNoThanks}
                                style={{ borderColor: primaryColor, color: primaryColor }}
                              >
                                No thanks
                              </Button>
                            </div>
                          </form>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}

                {/* Thinking indicator */}
                {isProcessing && (
                  <div className="flex items-start gap-2">
                    <Avatar className="h-6 w-6 mt-1" style={{ backgroundColor: primaryColor }}>
                      {avatarSrc ? (
                        <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                      ) : null}
                      <AvatarFallback style={{ backgroundColor: primaryColor }}>
                        <Bot className="h-3 w-3 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }}></div>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor, animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor, animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-xs opacity-70" style={{ color: textColor }}>
                        {thinkingMessage}
                      </span>
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {!hasInteracted && !isProcessing && (
                  <div className="space-y-2">
                    {usedSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectExample(suggestion)}
                        className="w-full text-left text-sm p-2 rounded-lg border hover:bg-opacity-80 transition-colors"
                        style={{
                          borderColor: `${primaryColor}40`,
                          backgroundColor: `${primaryColor}10`,
                          color: textColor
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t" style={{ borderColor: borderColor }}>
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder={`Ask ${chatbotName}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pr-10 text-sm"
                style={{
                  backgroundColor: inputBgColor,
                  borderColor: inputBorderColor,
                  color: textColor
                }}
                disabled={isProcessing || !!activeUIMessage}
              />
              <Button
                onClick={handleSearch}
                disabled={!query.trim() || isProcessing || !!activeUIMessage}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full p-0"
                style={{ backgroundColor: primaryColor }}
              >
                {isProcessing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <ArrowUp className="h-3 w-3 text-white" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          backgroundColor: primaryColor,
          color: 'white'
        }}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <Bot size={24} />
        )}
      </button>
    </div>
  );
};
