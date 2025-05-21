
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

  // Initialize WebSocket connection
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
    
    chatServiceRef.current.connect();
    
    return () => {
      console.log("Cleaning up ChatWebSocketService");
      clearThinkingInterval();
      if (chatServiceRef.current) {
        chatServiceRef.current.disconnect();
        chatServiceRef.current = null;
      }
    };
  }, [agentId, config, toast, query]);

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
      className="min-h-screen flex flex-col text-white"
      style={{ 
        fontFamily: config.fontFamily || 'Inter',
        backgroundColor: bgColor,
        color: textColor
      }}
    >
      {/* Header with gradient and theme toggle */}
      <header 
        className="p-4 flex items-center justify-between border-b"
        style={{ 
          borderColor: borderColor,
          background: isDarkTheme 
            ? `linear-gradient(to right, #1A1F2C, #2a2f3c)` 
            : `linear-gradient(to right, #FFFFFF, #F5F6F7)`
        }}
      >
        <div className="flex items-center gap-2">
          <button onClick={() => window.history.back()} className="hover:text-white">
            ← Back
          </button>
          <span className="ml-2">{config.chatbotName || 'AI Assistant'}</span>
        </div>
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full"
          style={{ backgroundColor: `${primaryColor}30` }}
        >
          {currentTheme === 'dark' ? (
            <Sun size={18} color={textColor} />
          ) : (
            <Moon size={18} color={textColor} />
          )}
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center p-4 md:p-6">
        <div className="w-full max-w-3xl">
          {/* Example questions section */}
          {!selectedResult && (
            <div className="mb-8">
              <h2 className="uppercase text-xs font-semibold mb-4 tracking-wider" style={{ color: isDarkTheme ? '#8E9196' : '#71767C' }}>EXAMPLES</h2>
              <div className="space-y-3">
                {suggestions.map((question, index) => (
                  <div 
                    key={index}
                    onClick={() => handleSelectExample(question)}
                    className="p-3 rounded-md border hover:cursor-pointer flex items-center gap-3 transition-colors"
                    style={{ 
                      borderColor: `${primaryColor}40`,
                      backgroundColor: isDarkTheme ? 'rgba(120, 120, 128, 0.2)' : 'rgba(120, 120, 128, 0.1)',
                      color: textColor
                    }}
                  >
                    <div style={{ color: primaryColor }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      </svg>
                    </div>
                    <span>{question}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Search bar */}
          <div className="w-full relative mt-2">
            <div className="relative flex">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
              <Input
                ref={inputRef}
                className="w-full pl-10 pr-16 py-3 rounded-md text-white placeholder-gray-500 focus-visible:ring-1 focus-visible:ring-opacity-50"
                placeholder="Ask a question..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={searchLoading}
                style={{ 
                  backgroundColor: inputBgColor,
                  borderColor: inputBorderColor,
                  color: textColor
                }}
              />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded-md"
                style={{ backgroundColor: primaryColor }}
                disabled={searchLoading || !query}
                onClick={handleSearch}
              >
                <ArrowUp size={18} />
              </Button>
            </div>
          </div>
          
          {/* Result display */}
          {selectedResult && (
            <div className="mt-6 rounded-lg overflow-hidden">
              <div 
                className="flex items-center p-3 border-b"
                style={{ 
                  backgroundColor: `${primaryColor}20`, 
                  borderColor: `${primaryColor}40` 
                }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                  style={{ backgroundColor: primaryColor }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"></path>
                    <path d="m14 7 3 3"></path>
                    <path d="M5 6v4"></path>
                    <path d="M19 14v4"></path>
                    <path d="M10 2v2"></path>
                    <path d="M7 8H3"></path>
                    <path d="M21 16h-4"></path>
                    <path d="M11 3H9"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm">{selectedResult.title}</p>
                </div>
              </div>
              
              <div 
                className="p-4 min-h-[200px]"
                style={{ backgroundColor: cardBgColor }}
              >
                {searchLoading ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full animate-pulse"
                        style={{ backgroundColor: primaryColor }}
                      ></div>
                      <div className="font-medium" 
                        style={{ color: isDarkTheme ? '#e4e4e4' : '#4a4a4a' }}
                      >
                        {thinkingMessage}
                      </div>
                    </div>
                    <Skeleton className="h-4 w-3/4" style={{ backgroundColor: isDarkTheme ? '#3a3a3a' : '#EFEFEF' }} />
                    <Skeleton className="h-4 w-full" style={{ backgroundColor: isDarkTheme ? '#3a3a3a' : '#EFEFEF' }} />
                    <Skeleton className="h-4 w-2/3" style={{ backgroundColor: isDarkTheme ? '#3a3a3a' : '#EFEFEF' }} />
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none" style={{ color: textColor }}>
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
                                className="px-1.5 py-0.5 rounded-md font-mono text-sm"
                                style={{ 
                                  backgroundColor: `${primaryColor}30`,
                                  color: isDarkTheme ? textColor : primaryColor
                                }}
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
                                  className="absolute top-0 right-0 px-2 py-1 text-xs rounded-bl font-mono"
                                  style={{ backgroundColor: `${primaryColor}40` }}
                                >
                                  {language}
                                </div>
                              )}
                              <pre 
                                className="!mt-0 border rounded-md overflow-x-auto"
                                style={{ 
                                  backgroundColor: isDarkTheme ? `${primaryColor}15` : `${primaryColor}10`,
                                  borderColor: `${primaryColor}30`,
                                  color: textColor
                                }}
                              >
                                <code className="block p-4 text-sm font-mono" {...props}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          );
                        },
                        ul({ children }) {
                          return <ul className="list-disc pl-4 space-y-1" style={{ color: textColor }}>{children}</ul>;
                        },
                        ol({ children }) {
                          return <ol className="list-decimal pl-4 space-y-1" style={{ color: textColor }}>{children}</ol>;
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
                        }
                      }}
                    >
                      {selectedResult.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer with subtle gradient */}
      <footer 
        className="p-3 text-center text-xs border-t"
        style={{ 
          borderColor: `${primaryColor}20`,
          color: `${primaryColor}90`,
          background: isDarkTheme
            ? `linear-gradient(to top, ${bgColor}, transparent)`
            : `linear-gradient(to top, #F5F6F7, transparent)`
        }}
      >
        <p>powered by 7en.ai</p>
      </footer>

      {/* Modal Demo Components - These demonstrate how this component could be embedded */}
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
