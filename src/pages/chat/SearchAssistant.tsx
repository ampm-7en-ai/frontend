
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Card } from '@/components/ui/card';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

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
}

const SearchAssistant = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const chatServiceRef = useRef<ChatWebSocketService | null>(null);
  const { toast } = useToast();
  const commandRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        setSearchLoading(false);
        // Convert the message to a search result
        const newResult: SearchResult = {
          id: `result-${Date.now()}`,
          title: query,
          content: message.content,
          timestamp: message.timestamp
        };
        
        setSearchResults(prev => [newResult, ...prev.slice(0, 9)]);
        setIsOpen(true);
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
          setSearchLoading(false);
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
  }, [agentId, config, toast]);

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
    try {
      chatServiceRef.current.sendMessage(query);
      console.log("Query sent:", query);
    } catch (error) {
      console.error("Error sending query:", error);
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

  const handleSelectResult = (result: SearchResult) => {
    setSelectedResult(result);
    if (inputRef.current) {
      inputRef.current.value = result.title;
      setQuery(result.title);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-blue-900 to-indigo-900 text-white">
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-white"></div>
          <p className="mt-4 text-lg">Loading assistant...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-blue-900 to-indigo-900 text-white">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-gray-800">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p>{error || 'Failed to load assistant configuration'}</p>
        </div>
      </div>
    );
  }

  const primaryColor = config.primaryColor || '#9b87f5';

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        background: `linear-gradient(135deg, ${adjustColor(primaryColor, -60)}, ${adjustColor(primaryColor, -80)})`,
        fontFamily: config.fontFamily || 'Inter'
      }}
    >
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white text-lg font-semibold">
          <span className="text-xl">✨</span>
          {config.chatbotName} <span className="text-sm font-normal opacity-70">Help Center</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-3xl space-y-8">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
            Find answers to your questions
          </h1>

          {/* Search bar */}
          <div className="relative w-full">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  className="w-full p-6 pl-12 rounded-lg shadow-lg text-lg bg-white"
                  placeholder="How to..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={searchLoading}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={searchLoading || !query.trim()}
                className="px-6 py-6 rounded-lg shadow-lg text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {searchLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    <span>Thinking...</span>
                  </div>
                ) : "Ask AI"}
              </Button>
            </div>

            {isOpen && searchResults.length > 0 && (
              <div 
                ref={commandRef}
                className="absolute top-[calc(100%+8px)] left-0 right-0 rounded-lg shadow-lg overflow-hidden z-50"
              >
                <Card className="p-0">
                  <Command>
                    <CommandList>
                      {searchResults.length === 0 ? (
                        <CommandEmpty>No results found.</CommandEmpty>
                      ) : (
                        <CommandGroup heading="Search Results">
                          {searchResults.map((result) => (
                            <CommandItem
                              key={result.id}
                              onSelect={() => handleSelectResult(result)}
                              className={`px-4 py-3 ${result.id === selectedResult?.id ? 'bg-slate-100' : ''}`}
                            >
                              <div className="truncate">
                                {result.title}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </Card>
              </div>
            )}
          </div>

          {/* Selected result */}
          {selectedResult && (
            <Card className="p-6 bg-white shadow-lg rounded-lg">
              <h2 className="text-xl font-semibold mb-4">{selectedResult.title}</h2>
              <div className="prose max-w-none">
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
                    }
                  }}
                >
                  {selectedResult.content}
                </ReactMarkdown>
              </div>
            </Card>
          )}

          {/* Featured categories */}
          {!selectedResult && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-white mb-6">Featured Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['Getting Started', 'Studio', 'API Integration', 'Chatbot Deployment'].map((category, i) => (
                  <Card key={i} className="p-4 bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer">
                    <h3 className="font-medium">{category}</h3>
                    <p className="text-sm text-gray-500 mt-2">{7 + i * 7} articles</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-white/70 text-sm">
        <p>powered by 7en.ai</p>
      </footer>
    </div>
  );
};

// Helper function to adjust color brightness
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

export default SearchAssistant;
