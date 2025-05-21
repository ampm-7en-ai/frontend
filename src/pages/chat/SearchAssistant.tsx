
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUp, Moon, Sun } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTheme } from '@/context/ThemeContext';

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
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  type?: string;
}

const fallbackSuggestions = [
  'How do I listen to changes in a table?',
  'How do I connect to my database?',
  'How do I run migrations?',
  'How do I set up authentication?'
];

const thinkingMessages = [
  "Thinking...",
  "Searching knowledge base...",
  "Processing your question...",
  "Connecting to agent...",
  "Analyzing information...",
  "Finding relevant answers..."
];

const SearchAssistant = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [thinkingMessage, setThinkingMessage] = useState<string>("Thinking...");
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');
  const chatServiceRef = useRef<ChatWebSocketService | null>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const thinkingIntervalRef = useRef<number | null>(null);
  const { theme, setTheme } = useTheme();

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
        const response = await fetch(`https://api.7en.ai/api/chatbot-config?agentId=${agentId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`);
        }
        
        const data = await response.json();
        setConfig(data);
        document.title = `${data.chatbotName} - AI Assistant`;
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
    if (!agentId || !config) return;

    console.log("Initializing ChatWebSocketService with agent ID:", agentId);
    
    chatServiceRef.current = new ChatWebSocketService(agentId, "playground");
    
    chatServiceRef.current.on({
      onMessage: (message) => {
        console.log("Received message:", message);
        
        // Handle system messages for thinking states
        if (message.type === 'system_message') {
          setThinkingMessage(`Thinking: ${message.content}`);
          return;
        }
        
        // For regular messages, stop the thinking animation
        clearThinkingInterval();
        setSearchLoading(false);
        
        // Convert the message to a search result
        const newResult: SearchResult = {
          id: `result-${Date.now()}`,
          title: query,
          content: message.content,
          timestamp: message.timestamp,
          type: message.type
        };
        
        setSearchResults(prev => [newResult, ...prev.slice(0, 9)]);
        setSelectedResult(newResult);
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
        setSearchLoading(false);
      },
      onConnectionChange: (status) => {
        console.log("Connection status changed:", status);
        if (!status) {
          clearThinkingInterval();
          setSearchLoading(false);
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
  }, [agentId, config, toast]);

  const startThinkingAnimation = () => {
    // Clear any existing interval
    clearThinkingInterval();
    
    // Set initial thinking message
    setThinkingMessage(thinkingMessages[0]);
    
    // Start rotating through thinking messages
    let messageIndex = 0;
    const intervalId = window.setInterval(() => {
      messageIndex = (messageIndex + 1) % thinkingMessages.length;
      setThinkingMessage(thinkingMessages[messageIndex]);
    }, 3000);
    
    thinkingIntervalRef.current = intervalId;
  };
  
  const clearThinkingInterval = () => {
    if (thinkingIntervalRef.current !== null) {
      clearInterval(thinkingIntervalRef.current);
      thinkingIntervalRef.current = null;
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;

    if (!chatServiceRef.current?.isConnected()) {
      toast({
        title: "Not connected",
        description: "Cannot send query while disconnected",
        variant: "destructive",
      });
      return;
    }

    setSearchLoading(true);
    startThinkingAnimation();
    
    try {
      chatServiceRef.current.sendMessage(query);
      console.log("Query sent:", query);
    } catch (error) {
      console.error("Error sending query:", error);
      clearThinkingInterval();
      toast({
        title: "Query Error",
        description: "Failed to send query. Please try again.",
        variant: "destructive",
      });
      setSearchLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSelectExample = (question: string) => {
    setQuery(question);
    if (inputRef.current) {
      inputRef.current.value = question;
    }
    
    // Auto-submit the selected question
    setTimeout(() => {
      if (chatServiceRef.current?.isConnected()) {
        setSearchLoading(true);
        startThinkingAnimation();
        chatServiceRef.current.sendMessage(question);
      }
    }, 100);
  };

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

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        fontFamily: config.fontFamily || 'Inter',
        backgroundColor: bgColor,
        color: textColor
      }}
    >
      {/* Header with theme toggle */}
      <header 
        className="p-3 flex items-center justify-between border-b"
        style={{ 
          borderColor: borderColor,
          background: isDarkTheme 
            ? `linear-gradient(to right, #1A1F2C, #232838)` 
            : `linear-gradient(to right, #FFFFFF, #F5F6F7)`
        }}
      >
        <div className="flex items-center gap-2">
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

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-auto" style={{ backgroundColor: isDarkTheme ? '#1A1F2C' : '#FFFFFF' }}>
        {!selectedResult ? (
          <div className="flex-1 flex flex-col p-4">
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
                    <div style={{ color: primaryColor, fontSize: '12px' }}>•</div>
                    <span>{question}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-4">
            {/* Simplified chat display - Query as title, answer as description */}
            <div className="flex flex-col space-y-5 mb-4">
              {/* Query as title */}
              <div className="p-3 rounded-lg bg-opacity-10" style={{ 
                backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              }}>
                <p className="text-sm font-medium" style={{ color: isDarkTheme ? '#e0e0e0' : '#333333' }}>
                  {selectedResult.title}
                </p>
              </div>

              {/* Answer as description or Loading indicator */}
              <div className="p-4 rounded-lg" style={{ 
                backgroundColor: isDarkTheme ? 'rgba(155, 135, 245, 0.1)' : 'rgba(155, 135, 245, 0.05)', 
              }}>
                {searchLoading ? (
                  <div className="flex items-center">
                    <div className="mr-3 flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-1 animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-1 animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                    </div>
                    <span className="text-sm" style={{ color: isDarkTheme ? '#e0e0e0' : '#333333' }}>
                      {thinkingMessage}
                    </span>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none break-words" style={{ 
                    color: isDarkTheme ? '#e0e0e0' : '#333333' 
                  }}>
                    <ReactMarkdown
                      components={{
                        code({ node, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const language = match ? match[1] : '';
                          
                          // Check if inline code
                          const isInline = !match && children.toString().split('\n').length === 1;
                          
                          if (isInline) {
                            return (
                              <code
                                className="px-1 py-0.5 rounded font-mono text-xs"
                                style={{ 
                                  backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', 
                                }}
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          }

                          return (
                            <div className="relative mt-2">
                              {language && (
                                <div 
                                  className="absolute top-0 right-0 px-2 py-1 text-xs rounded-bl font-mono"
                                  style={{ 
                                    backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                                  }}
                                >
                                  {language}
                                </div>
                              )}
                              <pre 
                                className="!mt-0 rounded overflow-x-auto text-xs"
                                style={{ 
                                  backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                                  padding: '8px',
                                  color: isDarkTheme ? '#e0e0e0' : '#333333'
                                }}
                              >
                                <code className="block font-mono" {...props}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          );
                        }
                      }}
                    >
                      {selectedResult.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Input section */}
      <div 
        className="border-t p-3"
        style={{ borderColor: borderColor }}
      >
        <div className="relative">
          <Input
            ref={inputRef}
            className="py-2 pr-10 rounded-md text-sm"
            placeholder="Ask Supabase AI a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={searchLoading}
            style={{ 
              backgroundColor: isDarkTheme ? '#333333' : '#f0f0f0',
              color: textColor,
              border: 'none'
            }}
          />
          {query.trim() && (
            <Button 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 rounded-full"
              style={{ backgroundColor: primaryColor }}
              disabled={searchLoading || !query.trim()}
              onClick={handleSearch}
            >
              <ArrowUp size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Modal Demo Components - Hidden */}
      <div className="hidden">
        {/* Dialog (Modal) Example */}
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

        {/* Sheet (Slide-in) Example */}
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
