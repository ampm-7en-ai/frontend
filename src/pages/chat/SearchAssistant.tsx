import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowRight, Moon, Sun, User, ArrowLeft, Bot } from 'lucide-react';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BASE_URL } from '@/utils/api-config';
import { StyledMarkdown } from '@/components/ui/styled-markdown';

interface ChatbotConfig {
  agentId: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  chatbotName: string;
  welcomeMessage: string;
  buttonText: string;
  position: 'bottom-right' | 'bottom-left';
  suggestions: string[];
  avatarUrl?: string;
  emailRequired?: boolean;
  emailPlaceholder?: string;
  emailMessage?: string;
  collectEmail?: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  type?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'bot_response' | 'system_message' | 'ui';
  timestamp: string;
  ui_type?: 'email';
}

const fallbackSuggestions = [];

const thinkingMessages = [
  "Thinking...",
  "Searching knowledge base...",
  "Processing your question...",
  "Connecting to agent...",
  "Analyzing information...",
  "Finding relevant answers..."
];

// Enhanced mode system for better state management
type AssistantMode = 'initial' | 'suggestions' | 'chat';

const SearchAssistant = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [searchParams] = useSearchParams();
  const isPopupMode = searchParams.get('type') === 'popup';
  
  // Core configuration and loading states
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced state management with single mode
  const [mode, setMode] = useState<AssistantMode>('initial');
  const [query, setQuery] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [thinkingMessage, setThinkingMessage] = useState<string>("Thinking...");
  
  // Email collection state
  const [userEmail, setUserEmail] = useState<string>('');
  const [isEmailSubmitting, setIsEmailSubmitting] = useState<boolean>(false);
  const [emailSubmitted, setEmailSubmitted] = useState<boolean>(false);
  
  // WebSocket and connectivity
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const chatServiceRef = useRef<ChatWebSocketService | null>(null);
  const thinkingIntervalRef = useRef<number | null>(null);
  
  // Refs and theme
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useAppTheme();
  const { toast } = useToast();
  
  // Theme state for component
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');

  // Use system theme preference as initial value
  useEffect(() => {
    // Use the theme from context if available, otherwise detect from system
    if (theme === 'light' || theme === 'dark') {
      setCurrentTheme(theme);
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setCurrentTheme(prefersDark ? 'dark' : 'light');
    }
  }, [theme]);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    setTheme(newTheme);
  };

  // Fetch the chatbot configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}chatbot-config?agentId=${agentId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`);
        }
        
        const data = await response.json();
        setConfig(data);
        document.title = `${data.chatbotName} - AI Assistant`;
        
        // We don't automatically add the welcome message now
        // Instead, we'll show it after the first interaction or if the user clicks a suggestion
      } catch (err) {
        console.error('Error fetching chatbot config:', err);
        setError('Failed to load assistant configuration');
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      fetchConfig();
    }
  }, [agentId]);

  // Initialize WebSocket connection once on component mount
  useEffect(() => {
    if (!agentId) return;

    console.log("Initializing ChatWebSocketService with agent ID:", agentId);
    
    chatServiceRef.current = new ChatWebSocketService(agentId, "chat");
    
    chatServiceRef.current.on({
      onMessage: (message) => {
        console.log("Received message:", message);
        
        // Handle system messages for thinking states
        if (message.type === 'system_message') {
          setThinkingMessage(`${message.content}`);
          return;
        }
        
        // Handle UI messages for email collection
        if (message.type === 'ui' && message.ui_type === 'email') {
          clearThinkingInterval();
          setIsProcessing(false);
          
          const emailMessage: ChatMessage = {
            id: `email-${Date.now()}`,
            content: message.content,
            type: 'ui',
            timestamp: message.timestamp,
            ui_type: 'email'
          };
          
          setChatHistory(prev => [...prev, emailMessage]);
          return;
        }
        
        // For regular messages, stop the thinking animation
        clearThinkingInterval();
        setIsProcessing(false);
        
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
      },
      onConnectionChange: (status) => {
        console.log("Connection status changed:", status);
        setIsConnected(status);
        if (!status) {
          clearThinkingInterval();
          setIsProcessing(false);
        }
      }
    });
    
    // Connect once on component mount
    chatServiceRef.current.connect();
    
    return () => {
      console.log("Cleaning up ChatWebSocketService");
      clearThinkingInterval();
      if (chatServiceRef.current) {
        chatServiceRef.current.disconnect();
        chatServiceRef.current = null;
      }
    };
  }, [agentId, toast]);

  // Auto-scroll to bottom when chat history changes
  useEffect(() => {
    if (messagesEndRef.current && (mode === 'chat' || !isPopupMode)) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [chatHistory, isProcessing, mode, isPopupMode]);

  const startThinkingAnimation = () => {
    // Clear any existing interval
    clearThinkingInterval();
    
    // Start rotating through thinking messages
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

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) return;

    setIsEmailSubmitting(true);
    
    try {
      if (chatServiceRef.current?.isConnected()) {
        chatServiceRef.current.sendMessage(userEmail.trim());
        setEmailSubmitted(true);
        
        // Remove the email UI message from chat history
        setChatHistory(prev => prev.filter(msg => msg.type !== 'ui' || msg.ui_type !== 'email'));
        
        // Start processing for the response
        setIsProcessing(true);
        startThinkingAnimation();
        
      } else {
        toast({
          title: "Not connected",
          description: "Cannot submit email while disconnected",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting email:", error);
      toast({
        title: "Submission Error",
        description: "Failed to submit email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const handleSkipEmail = () => {
    // Remove the email UI message from chat history
    setChatHistory(prev => prev.filter(msg => msg.type !== 'ui' || msg.ui_type !== 'email'));
    
    // Continue with the conversation
    if (chatServiceRef.current?.isConnected()) {
      chatServiceRef.current.sendMessage('no_thanks');
      setIsProcessing(true);
      startThinkingAnimation();
    }
  };

  // Enhanced search handling with mode transitions
  const handleSearch = useCallback(() => {
    if (!query.trim()) return;

    // Check if email collection is required and not submitted
    if (config?.collectEmail && !emailSubmitted) {
      // Send the query but expect email collection UI
      const userQueryCopy = query;
      const newUserMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        content: userQueryCopy,
        type: 'user',
        timestamp: new Date().toISOString()
      };
      
      setChatHistory(prev => [...prev, newUserMessage]);
      setMode('chat');
      setQuery('');
      setIsProcessing(true);
      
      if (chatServiceRef.current?.isConnected()) {
        startThinkingAnimation();
        chatServiceRef.current.sendMessage(userQueryCopy);
      }
      return;
    }

    // Transition to chat mode
    setMode('chat');
    
    // Add user message immediately
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
  }, [query, toast, config?.collectEmail, emailSubmitted]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  // Enhanced suggestion selection with smooth transitions
  const handleSelectExample = useCallback((question: string) => {
    // Check if email collection is required and not submitted
    if (config?.collectEmail && !emailSubmitted) {
      const newUserMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        content: question,
        type: 'user',
        timestamp: new Date().toISOString()
      };
      
      setChatHistory(prev => [...prev, newUserMessage]);
      setMode('chat');
      setIsProcessing(true);
      
      if (chatServiceRef.current?.isConnected()) {
        startThinkingAnimation();
        chatServiceRef.current.sendMessage(question);
      }
      return;
    }

    setMode('chat');
    
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
  }, [toast, config?.collectEmail, emailSubmitted]);

  // Enhanced input interaction with mode-based logic
  const handleInputClick = useCallback(() => {
    if (mode === 'initial') {
      setMode('suggestions');
    }
  }, [mode]);

  // Enhanced reset functionality with clean state transitions
  const handleBackToInitial = useCallback(() => {
    setMode('initial');
    setChatHistory([]);
    setQuery('');
    setIsProcessing(false);
    setUserEmail('');
    setEmailSubmitted(false);
    clearThinkingInterval();
    
    // Clean disconnect and reconnect WebSocket for fresh state
    if (chatServiceRef.current) {
      chatServiceRef.current.disconnect();
      setTimeout(() => {
        if (chatServiceRef.current) {
          chatServiceRef.current.connect();
        }
      }, 100);
    }
  }, []);

  // Enhanced click outside handling with mode-based logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isPopupMode && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (mode === 'chat') {
          // Complete reset when leaving chat mode
          setMode('initial');
          setChatHistory([]);
          setQuery('');
          setIsProcessing(false);
          setUserEmail('');
          setEmailSubmitted(false);
          clearThinkingInterval();
          
          // Clean WebSocket state
          if (chatServiceRef.current) {
            chatServiceRef.current.disconnect();
            setTimeout(() => {
              if (chatServiceRef.current) {
                chatServiceRef.current.connect();
              }
            }, 100);
          }
        } else if (mode === 'suggestions') {
          setMode('initial');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupMode, mode]);

  // Determine which suggestions to use (from config or fallback)
  const suggestions = config?.suggestions && config.suggestions.length > 0 
    ? config.suggestions 
    : fallbackSuggestions;

  // Primary brand colors
  const primaryColor = config?.primaryColor || '#9b87f5';
  const secondaryColor = config?.secondaryColor || '#7E69AB';
  const isDarkTheme = currentTheme === 'dark';
  
  // Theme-based colors
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

  if (loading) {
    return (
      <div 
        className="flex h-screen items-center justify-center text-white"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <div className="text-center">
          <LoadingSpinner size="lg" text="Loading assistant..." />
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div 
        className="flex h-screen items-center justify-center text-white"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <div className="text-center max-w-md mx-auto p-6 rounded-lg shadow-md"
          style={{ backgroundColor: isDarkTheme ? '#2a2a2a' : '#F5F6F7' }}
        >
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p>{error || 'Failed to load assistant configuration'}</p>
        </div>
      </div>
    );
  }

  // Enhanced popup layout with progressive disclosure
  if (isPopupMode) {
    return (
      <div 
        className="h-screen flex items-center justify-center p-4"
        style={{ 
          fontFamily: config.fontFamily || 'Inter',
          background: isDarkTheme 
            ? `linear-gradient(to right, #1A1F2C, #232838)` 
            : `linear-gradient(to right, #FFFFFF, #F5F6F7)`,
          color: textColor,
          borderColor: borderColor
        }}
        
      >
        {/* Main floating container with enhanced transitions */}
        <div 
          ref={containerRef}
          className={`relative transition-all duration-700 ease-out ${
            mode === 'chat'
              ? 'w-full max-w-4xl h-[70vh] rounded-2xl shadow-2xl border animate-scale-in' 
              : mode === 'suggestions'
              ? 'w-full max-w-lg rounded-3xl shadow-2xl border animate-fade-in p-[5px]'
              : 'w-full max-w-lg animate-fade-in'
          }`}
          style={{
            backgroundColor: mode !== 'initial' ? cardBgColor : 'transparent',
            borderColor: mode !== 'initial' ? borderColor : 'transparent',
            transform: mode === 'chat' ? 'scale(1.02)' : 'scale(1)',
          }}
        >
          {/* Enhanced header with theme toggle - only visible in chat mode */}
          {mode === 'chat' && (
            <div className="flex items-center justify-between p-4 border-b animate-fade-in"
              style={{ borderColor: borderColor }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToInitial}
                className="flex items-center gap-2 hover-scale transition-all duration-200"
                style={{ 
                  color: textColor,
                  backgroundColor: currentTheme === 'dark' ? `${primaryColor}30` : `${primaryColor}10`,
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back</span>
              </Button>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-center">{config.chatbotName}</span>
                <button 
                  onClick={toggleTheme} 
                  className="p-2 rounded-full hover-scale transition-all duration-200"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  {currentTheme === 'dark' ? (
                    <Sun size={16} style={{ color: textColor }} />
                  ) : (
                    <Moon size={16} style={{ color: textColor }} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Enhanced chat content area with smooth transitions */}
          {mode === 'chat' && (
            <div className="flex flex-col animate-fade-in" style={{ height: 'calc(100% - 4rem)' }}>
              {/* Chat history with enhanced scrolling */}
              <div className="flex-1 overflow-hidden min-h-0">
                <ScrollArea className="h-full" ref={chatScrollRef}>
                  <div className="p-6 space-y-5">
                    {chatHistory.map((message, index) => {
                      if (message.type === 'user') {
                        return (
                          <div key={message.id} className="flex items-start gap-2">
                            <Avatar className="h-8 w-8 mt-1">
                              <AvatarFallback className="bg-gray-200 dark:bg-gray-800">
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="pl-[10px] pt-[8px]">
                              <p className="text-sm font-semibold" style={{ color: isDarkTheme ? '#fff' : '#333333' }}>
                                {message.content}
                              </p>
                            </div>
                          </div>
                        );
                      } else if (message.type === 'bot_response') {
                        return (
                          <div key={message.id} className="flex items-start gap-2">
                            <Avatar className="h-8 w-8 mt-1" style={{
                              backgroundColor: primaryColor
                            }}>
                              {config.avatarUrl ? (
                                <AvatarImage src={config.avatarUrl} alt={config.chatbotName} className="object-cover" />
                              ) : null}
                              <AvatarFallback style={{
                                backgroundColor: primaryColor
                              }}>
                                <Bot className="h-4 w-4 text-white" />
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 pl-[10px] pt-[5px] w-full">
                              <StyledMarkdown
                                content={message.content}
                                primaryColor={primaryColor}
                                isDarkTheme={isDarkTheme}
                              />
                            </div>
                          </div>
                        );
                      } else if (message.type === 'ui' && message.ui_type === 'email') {
                        return (
                          <div key={message.id} className="flex items-start gap-2">
                            <Avatar className="h-8 w-8 mt-1" style={{
                              backgroundColor: primaryColor
                            }}>
                              {config.avatarUrl ? (
                                <AvatarImage src={config.avatarUrl} alt={config.chatbotName} className="object-cover" />
                              ) : null}
                              <AvatarFallback style={{
                                backgroundColor: primaryColor
                              }}>
                                <Bot className="h-4 w-4 text-white" />
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 pl-[10px] pt-[5px]">
                              <div className="flex flex-col gap-3 justify-center animate-fade-in rounded-2xl bg-gray-100/50 p-4">
                                <form onSubmit={handleEmailSubmit} className="relative">
                                  <Input
                                    variant="modern"
                                    placeholder={config.emailPlaceholder || "Enter your email"}
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    className="pr-12"
                                    disabled={isEmailSubmitting}
                                    style={{
                                      backgroundColor: inputBgColor,
                                      borderColor: inputBorderColor,
                                      color: textColor
                                    }}
                                  />
                                  <Button
                                    type="submit"
                                    size="sm"
                                    disabled={!userEmail.trim() || isEmailSubmitting}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full p-0"
                                    style={{
                                      backgroundColor: primaryColor,
                                      borderColor: primaryColor
                                    }}
                                  >
                                    {isEmailSubmitting ? (
                                      <LoadingSpinner size="sm" />
                                    ) : (
                                      <ArrowUp className="h-4 w-4 text-white" />
                                    )}
                                  </Button>
                                </form>
                                
                                <Button
                                  onClick={handleSkipEmail}
                                  variant="ghost"
                                  className="font-medium border-2 w-auto"
                                  style={{
                                    border: 'none',
                                    color: primaryColor,
                                    backgroundColor: 'transparent'
                                  }}
                                >
                                  No Thanks
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}

                    {/* Enhanced thinking/loading indicator with better animations */}
                    {isProcessing && (
                      <div className="flex items-start gap-2 animate-fade-in" style={{ color: textColor }}>
                        <Avatar className="h-8 w-8 mt-1" style={{
                          backgroundColor: primaryColor
                        }}>
                          {config.avatarUrl ? (
                            <AvatarImage src={config.avatarUrl} alt={config.chatbotName} className="object-cover" />
                          ) : null}
                          <AvatarFallback style={{
                            backgroundColor: primaryColor
                          }}>
                            <Bot className="h-4 w-4 text-white" />
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col gap-2 pl-[10px] pt-[5px]">
                          <div className="flex items-center">
                            <div className="mr-3 flex items-center">
                              <div 
                                className="w-2 h-2 rounded-full mr-1 animate-pulse"
                                style={{ backgroundColor: primaryColor }}
                              ></div>
                              <div 
                                className="w-2 h-2 rounded-full mr-1 animate-pulse"
                                style={{ 
                                  backgroundColor: primaryColor,
                                  animationDelay: '0.2s'
                                }}
                              ></div>
                              <div 
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ 
                                  backgroundColor: primaryColor,
                                  animationDelay: '0.4s'
                                }}
                              ></div>
                            </div>
                          </div>
                          <p className="text-xs opacity-70 animate-pulse" style={{ color: textColor }}>
                            {thinkingMessage}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Invisible div for auto-scroll anchor */}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Enhanced input bar with better styling and animations */}
              <div className="flex-shrink-0 border-t p-4 animate-fade-in"
                style={{
                  borderColor: borderColor,
                  backgroundColor: `${primaryColor}05`
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder={`Ask ${config.chatbotName}...`}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="pr-12 py-3 text-base border-2 focus:ring-2 transition-all duration-300 shadow-sm"
                      style={{
                        backgroundColor: inputBgColor,
                        borderColor: inputBorderColor,
                        color: textColor,
                        borderRadius: '16px'
                      }}
                      disabled={isProcessing}
                    />
                    <Button
                      onClick={handleSearch}
                      disabled={!query.trim() || isProcessing}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full p-0 hover-scale transition-all duration-200 shadow-md"
                      style={{
                        backgroundColor: primaryColor,
                        borderColor: primaryColor
                      }}
                    >
                      {isProcessing ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <ArrowUp className="h-4 w-4 text-white" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced initial/suggestions interface with progressive disclosure */}
          {mode !== 'chat' && (
            <div className="relative">
              {/* Input container with enhanced transitions */}
              <div 
                className={`relative transition-all duration-700 ease-out ${
                  mode === 'suggestions' ? 'rounded-3xl border animate-scale-in border-none shadow-none' : 'animate-fade-in'
                }`}
                style={{
                  backgroundColor: mode === 'suggestions' ? cardBgColor : 'transparent',
                  borderColor: mode === 'suggestions' ? borderColor : 'transparent'
                }}
              >
                {/* Enhanced search input with better responsive design */}
                <div className="relative">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder={`Ask ${config.chatbotName}...`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onClick={handleInputClick}
                    className={`pr-16 py-6 text-xl focus:ring-2 transition-all duration-700 ease-out rounded-full ${
                      mode === 'suggestions' 
                        ? 'border-0 bg-transparent' 
                        : 'shadow-xl hover-scale border-2'
                    }`}
                    style={{
                      backgroundColor: mode === 'suggestions' ? 'transparent' : inputBgColor,
                      borderColor: mode === 'suggestions' ? 'transparent' : inputBorderColor,
                      color: textColor,
                      fontSize: '1.25rem'
                    }}
                    disabled={isProcessing}
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={!query.trim() || isProcessing}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 h-9 w-9 rounded-full p-0 shadow-lg hover-scale transition-all duration-300 -mr-[8px]"
                    style={{
                      backgroundColor: primaryColor,
                      borderColor: primaryColor
                    }}
                  >
                     {isProcessing ? (
                       <LoadingSpinner size="sm" />
                     ) : mode === 'suggestions' ? (
                       <ArrowRight className="h-5 w-5 text-white" />
                     ) : (
                       <ArrowUp className="h-5 w-5 text-white" />
                     )}
                  </Button>
                </div>

                {/* Enhanced suggestions dropdown with staggered animations */}
                {mode === 'suggestions' && (
                  <div 
                    className="border-t-0 rounded-b-3xl overflow-hidden animate-fade-in"
                    style={{
                      backgroundColor: cardBgColor,
                      borderColor: borderColor
                    }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectExample(suggestion)}
                        className="w-full px-6 py-4 text-left border-b last:border-b-0 transition-all duration-300 ease-out text-sm hover-scale"
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: `${borderColor}30`,
                          color: textColor,
                          animationDelay: `${index * 100}ms`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${primaryColor}12`;
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="leading-relaxed font-medium">{suggestion}</span>
                          <ArrowUp 
                            className="h-4 w-4 transform rotate-45 opacity-40 transition-all duration-300"
                            style={{ color: primaryColor }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Enhanced loading overlay with better visual feedback */}
              {isProcessing && mode === 'suggestions' && (
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-3xl flex items-center justify-center transition-all duration-500 animate-fade-in backdrop-blur-sm">
                  <div className="rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 animate-scale-in"
                    style={{
                      backgroundColor: cardBgColor,
                      color: textColor,
                      border: `1px solid ${borderColor}`
                    }}
                  >
                    <LoadingSpinner size="md" />
                    <div className="text-center">
                      <p className="text-sm font-medium animate-pulse">{thinkingMessage}</p>
                      <p className="text-xs opacity-70 mt-1">Preparing your answer...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Normal layout for regular mode
  return (
    <div 
      className="min-h-screen flex flex-col h-screen overflow-hidden"
      style={{ 
        fontFamily: config.fontFamily || 'Inter',
        backgroundColor: bgColor,
        color: textColor
      }}
    >
      {/* Header with theme toggle - Fixed */}
      <header 
        className="p-3 flex items-center justify-between border-b sticky top-0 z-10"
        style={{ 
          borderColor: borderColor,
          background: isDarkTheme 
            ? `linear-gradient(to right, #1A1F2C, #232838)` 
            : `linear-gradient(to right, #FFFFFF, #F5F6F7)`
        }}
      >
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8" style={{
            backgroundColor: primaryColor
          }}>
            {config.avatarUrl ? (
              <AvatarImage src={config.avatarUrl} alt={config.chatbotName} className="object-cover" />
            ) : null}
            <AvatarFallback style={{
              backgroundColor: primaryColor
            }}>
              <Bot className="h-4 w-4 text-white" />
            </AvatarFallback>
          </Avatar>
          <span className="ml-2 font-medium text-sm">{config.chatbotName || 'AI Assistant'}</span>
        </div>
        <button 
          onClick={toggleTheme} 
          className="p-1.5 rounded-full"
          style={{ backgroundColor: `${primaryColor}30` }}
        >
          {currentTheme === 'dark' ? (
            <Sun size={16} color={textColor} />
          ) : (
            <Moon size={16} color={textColor} />
          )}
        </button>
      </header>

      {/* Main content - Scrollable */}
      <main className="flex-1 overflow-hidden flex flex-col" style={{ backgroundColor: isDarkTheme ? '#1A1F2C' : '#FFFFFF' }}>
        <ScrollArea 
          className="flex-grow"
          style={{ height: 'calc(100vh - 98px)' }} // Adjust based on header and input area heights
        >
          <div className="p-4">
            {chatHistory.length === 0 ? (
              <div>
                <div className="mb-4">
                  <h2 className="font-medium mb-2 text-sm" style={{ color: primaryColor }}>Examples</h2>
                  <div className="space-y-2">
                    {suggestions.map((question, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectExample(question)}
                        className="p-2 rounded hover:cursor-pointer flex items-center gap-2 text-sm transition-colors"
                        style={{ 
                          backgroundColor: isDarkTheme ? 'rgba(120, 120, 128, 0.2)' : 'rgba(120, 120, 128, 0.1)',
                          color: textColor
                        }}
                      >
                        <span>{question}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-5 mb-4">
                {/* Render chat history */}
                {chatHistory.map((message, index) => {
                  if (message.type === 'user') {
                    return (
                      <div key={message.id} className="flex items-start gap-2">
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback className="bg-gray-200 dark:bg-gray-800">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="pl-[10px] pt-[8px]">
                          <p className="text-sm font-semibold" style={{ color: isDarkTheme ? '#fff' : '#333333' }}>
                            {message.content}
                          </p>
                        </div>
                      </div>
                    );
                  } else if (message.type === 'bot_response') {
                    return (
                      <div key={message.id} className="flex items-start gap-2">
                        <Avatar className="h-8 w-8 mt-1" style={{
                          backgroundColor: primaryColor
                        }}>
                          {config.avatarUrl ? (
                            <AvatarImage src={config.avatarUrl} alt={config.chatbotName} className="object-cover" />
                          ) : null}
                          <AvatarFallback style={{
                            backgroundColor: primaryColor
                          }}>
                            <Bot className="h-4 w-4 text-white" />
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 pl-[10px] pt-[5px]">
                          <StyledMarkdown
                            content={message.content}
                            primaryColor={primaryColor}
                            isDarkTheme={isDarkTheme}
                          />
                        </div>
                      </div>
                    );
                  } else if (message.type === 'ui' && message.ui_type === 'email') {
                    return (
                      <div key={message.id} className="flex items-start gap-2">
                        <Avatar className="h-8 w-8 mt-1" style={{
                          backgroundColor: primaryColor
                        }}>
                          {config.avatarUrl ? (
                            <AvatarImage src={config.avatarUrl} alt={config.chatbotName} className="object-cover" />
                          ) : null}
                          <AvatarFallback style={{
                            backgroundColor: primaryColor
                          }}>
                            <Bot className="h-4 w-4 text-white" />
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 pl-[10px] pt-[5px]">
                          <div className="flex flex-col gap-3 justify-center animate-fade-in rounded-2xl bg-gray-100/50 p-4">
                            <form onSubmit={handleEmailSubmit} className="relative">
                              <Input
                                variant="modern"
                                placeholder={config.emailPlaceholder || "Enter your email"}
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                className="pr-12"
                                disabled={isEmailSubmitting}
                                style={{
                                  backgroundColor: inputBgColor,
                                  borderColor: inputBorderColor,
                                  color: textColor
                                }}
                              />
                              <Button
                                type="submit"
                                size="sm"
                                disabled={!userEmail.trim() || isEmailSubmitting}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full p-0"
                                style={{
                                  backgroundColor: primaryColor,
                                  borderColor: primaryColor
                                }}
                              >
                                {isEmailSubmitting ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <ArrowUp className="h-4 w-4 text-white" />
                                )}
                              </Button>
                            </form>
                            
                            <Button
                              onClick={handleSkipEmail}
                              variant="ghost"
                              className="font-medium border-2 w-auto"
                              style={{
                                border: 'none',
                                color: primaryColor,
                                backgroundColor: 'transparent'
                              }}
                            >
                              No Thanks
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return null; // For system messages or any other types
                })}
                
                {/* Show loading indicator after the last message when waiting for a response */}
                {isProcessing && (
                  <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8 mt-1" style={{
                      backgroundColor: primaryColor
                    }}>
                      {config.avatarUrl ? (
                        <AvatarImage src={config.avatarUrl} alt={config.chatbotName} className="object-cover" />
                      ) : null}
                      <AvatarFallback style={{
                        backgroundColor: primaryColor
                      }}>
                        <Bot className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col gap-2 pl-[10px] pt-[5px]">
                      <div className="flex items-center">
                        <div className="mr-3 flex items-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-1 animate-pulse"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-1 animate-pulse delay-100"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                        </div>
                      </div>
                      <p className="text-xs opacity-70">{thinkingMessage}</p>
                    </div>
                  </div>
                )}

                {/* Always show suggestion chips after conversation if hasInteracted is true */}
                {chatHistory.length > 0 && !isProcessing && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {suggestions.slice(0, 3).filter(Boolean).map((suggestion, index) => (
                      <button
                        key={`follow-${index}`}
                        onClick={() => handleSelectExample(suggestion)}
                        className="text-xs px-3 py-1.5 rounded-full transition-all"
                        style={{ 
                          border: `1px solid ${primaryColor}30`,
                          backgroundColor: `${primaryColor}08`,
                          color: isDarkTheme ? '#e0e0e0' : '#333333'
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Invisible div for auto-scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </main>
      
      {/* Input section - Fixed */}
      <div 
        className="border-t p-3 sticky bottom-0 z-10"
        style={{ 
          borderColor: borderColor,
          background: isDarkTheme 
            ? `linear-gradient(to right, #1A1F2C, #232838)` 
            : `linear-gradient(to right, #FFFFFF, #F5F6F7)`
        }}
      >
        <div className="relative">
          <Input
            ref={inputRef}
            className="py-2 pr-10 rounded-md text-sm"
            placeholder={`Ask ${config.chatbotName} a question...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isProcessing}
            style={{ 
              backgroundColor: isDarkTheme ? '#333333' : '#f0f0f0',
              color: textColor,
              border: 'none'
            }}
          />
          <Button 
            className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 rounded-full ${!query.trim() ? 'hidden' : ''}`}
            style={{ backgroundColor: primaryColor }}
            disabled={isProcessing || !query.trim()}
            onClick={handleSearch}
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowUp size={16} />
            )}
          </Button>
        </div>
      </div>

      {/* Hidden Modal Components */}
      <div className="hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Search Assistant</Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-4xl p-0">
            <iframe 
              src={`/chat/assistant/${agentId}`} 
              className="w-full h-[600px] border-0" 
              title="Search Assistant"
            />
          </DialogContent>
        </Dialog>

        <Sheet>
          <SheetTrigger asChild>
            <Button>Open Search Sidebar</Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-full sm:max-w-md">
            <iframe 
              src={`/chat/assistant/${agentId}`} 
              className="w-full h-full border-0" 
              title="Search Assistant"
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default SearchAssistant;
