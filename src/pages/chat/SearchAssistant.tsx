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

const SearchAssistant = () => {
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
    const agentId = 'default_agent';

    console.log("Initializing ChatWebSocketService with agent ID:", agentId);
    
    chatServiceRef.current = new ChatWebSocketService(agentId, "search");
    
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
  }, [toast]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory.length, isProcessing]);

  const startThinkingAnimation = () => {
    clearThinkingInterval();
    
    let messageIndex = 0;
    const intervalId = window.setInterval(() => {
      messageIndex = (messageIndex + 1) % [
        "Thinking...",
        "Searching knowledge base...",
        "Processing your question...",
        "Connecting to agent...",
        "Analyzing information...",
        "Finding relevant answers..."
      ].length;
      setThinkingMessage([
        "Thinking...",
        "Searching knowledge base...",
        "Processing your question...",
        "Connecting to agent...",
        "Analyzing information...",
        "Finding relevant answers..."
      ][messageIndex].toLowerCase());
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

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6" style={{ backgroundColor: '#6366f1' }}>
            <AvatarFallback style={{ backgroundColor: '#6366f1' }}>
              <Bot className="h-3 w-3 text-white" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">Search Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            {currentTheme === 'dark' ? (
              <Sun size={16} className="text-foreground" />
            ) : (
              <Moon size={16} className="text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4 max-w-4xl mx-auto">
            {/* Welcome message */}
            {!hasInteracted && (
              <div className="flex items-start gap-2">
                <Avatar className="h-6 w-6 mt-1" style={{ backgroundColor: '#6366f1' }}>
                  <AvatarFallback style={{ backgroundColor: '#6366f1' }}>
                    <Bot className="h-3 w-3 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-sm text-foreground">
                  Hi! I'm your search assistant. I can help you find information, answer questions, and assist with various tasks. What would you like to know?
                </div>
              </div>
            )}

            {/* Chat messages */}
            {chatHistory.map((message, index) => {
              if (message.type === 'user') {
                return (
                  <div key={message.id} className="flex items-start gap-2 justify-end">
                    <div className="max-w-[80%] p-3 rounded-lg text-sm bg-primary text-primary-foreground">
                      {message.content}
                    </div>
                    <Avatar className="h-6 w-6 mt-1">
                      <AvatarFallback className="bg-muted">
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                );
              } else if (message.type === 'bot_response') {
                return (
                  <div key={message.id} className="flex items-start gap-2">
                    <Avatar className="h-6 w-6 mt-1" style={{ backgroundColor: '#6366f1' }}>
                      <AvatarFallback style={{ backgroundColor: '#6366f1' }}>
                        <Bot className="h-3 w-3 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-sm prose prose-sm max-w-none text-foreground">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                );
              } else if (message.type === 'ui' && message.ui_type === 'email') {
                return (
                  <div key={message.id} className="flex items-start gap-2">
                    <Avatar className="h-6 w-6 mt-1" style={{ backgroundColor: '#6366f1' }}>
                      <AvatarFallback style={{ backgroundColor: '#6366f1' }}>
                        <Bot className="h-3 w-3 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm text-foreground">
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
                            style={{ backgroundColor: '#6366f1' }}
                            className="text-white"
                          >
                            Submit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleNoThanks}
                            style={{ borderColor: '#6366f1', color: '#6366f1' }}
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
                <Avatar className="h-6 w-6 mt-1" style={{ backgroundColor: '#6366f1' }}>
                  <AvatarFallback style={{ backgroundColor: '#6366f1' }}>
                    <Bot className="h-3 w-3 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-primary"></div>
                    <div className="w-2 h-2 rounded-full animate-pulse bg-primary" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full animate-pulse bg-primary" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-xs opacity-70 text-muted-foreground">
                    {thinkingMessage}
                  </span>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {!hasInteracted && !isProcessing && (
              <div className="space-y-2">
                {[
                  "How can I help you today?",
                  "What information are you looking for?",
                  "Ask me anything!"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectExample(suggestion)}
                    className="w-full text-left text-sm p-3 rounded-lg border border-border hover:bg-accent transition-colors text-foreground"
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
      <div className="p-4 border-t border-border bg-card">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Ask your question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-10 text-sm"
              disabled={isProcessing || !!activeUIMessage}
            />
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || isProcessing || !!activeUIMessage}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full p-0"
              style={{ backgroundColor: '#6366f1' }}
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
    </div>
  );
};

export default SearchAssistant;
