
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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

const exampleQuestions = [
  'How do I listen to changes in a table?',
  'How do I connect to my database?',
  'How do I run migrations?',
  'How do I set up authentication?'
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
  const chatServiceRef = useRef<ChatWebSocketService | null>(null);
  const { toast } = useToast();
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

  const handleSelectExample = (question: string) => {
    setQuery(question);
    if (inputRef.current) {
      inputRef.current.value = question;
    }
    
    // Auto-submit the selected question
    setTimeout(() => {
      if (chatServiceRef.current?.isConnected()) {
        setSearchLoading(true);
        chatServiceRef.current.sendMessage(question);
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a1a1a] text-white">
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-white"></div>
          <p className="mt-4 text-lg">Loading assistant...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a1a1a] text-white">
        <div className="text-center max-w-md mx-auto p-6 bg-[#2a2a2a] rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p>{error || 'Failed to load assistant configuration'}</p>
        </div>
      </div>
    );
  }

  // For embedding as iframe, we'll use a darker theme similar to the images
  return (
    <div 
      className="min-h-screen flex flex-col bg-[#1a1a1a] text-gray-200"
      style={{ 
        fontFamily: config.fontFamily || 'Inter'
      }}
    >
      {/* Optional header */}
      <header className="p-4 flex items-center gap-2 border-b border-gray-800">
        <button onClick={() => window.history.back()} className="text-gray-400 hover:text-white">
          ← Back
        </button>
        <span className="ml-2">{config.chatbotName || 'AI Assistant'}</span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center p-4 md:p-6">
        <div className="w-full max-w-3xl">
          {/* Example questions section */}
          {!selectedResult && (
            <div className="mb-8">
              <h2 className="text-gray-400 uppercase text-xs font-semibold mb-4 tracking-wider">EXAMPLES</h2>
              <div className="space-y-3">
                {exampleQuestions.map((question, index) => (
                  <div 
                    key={index}
                    onClick={() => handleSelectExample(question)}
                    className="p-3 rounded-md border border-gray-700 bg-gray-800/50 hover:bg-gray-800 cursor-pointer flex items-center gap-3"
                  >
                    <div className="text-emerald-400">
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
                className="w-full pl-10 pr-4 py-3 rounded-md bg-[#2a2a2a] border-gray-700 text-white placeholder-gray-500 focus-visible:ring-1 focus-visible:ring-gray-500"
                placeholder="Ask a question..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={searchLoading}
              />
            </div>
          </div>
          
          {/* Result display */}
          {selectedResult && (
            <div className="mt-6 rounded-lg overflow-hidden">
              <div className="flex items-center p-3 bg-gray-800 border-b border-gray-700">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm">{selectedResult.title}</p>
                </div>
              </div>
              
              <div className="p-4 bg-[#2a2a2a] min-h-[200px]">
                {searchLoading ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="animate-pulse h-2 w-2 rounded-full bg-emerald-400"></div>
                    <div className="animate-pulse h-2 w-2 rounded-full bg-emerald-400" style={{animationDelay: '0.2s'}}></div>
                    <div className="animate-pulse h-2 w-2 rounded-full bg-emerald-400" style={{animationDelay: '0.4s'}}></div>
                    <span className="ml-2">Generating answer...</span>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
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
                                className="px-1.5 py-0.5 rounded-md bg-gray-700 font-mono text-sm"
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
                                  className="absolute top-0 right-0 px-2 py-1 text-xs rounded-bl font-mono bg-gray-700 text-gray-300"
                                >
                                  {language}
                                </div>
                              )}
                              <pre className="!mt-0 !bg-gray-800 border border-gray-700 rounded-md overflow-x-auto">
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
                              className="underline text-emerald-400"
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
      
      {/* Footer - only shown at bottom of page */}
      <footer className="p-4 text-center text-gray-500 text-xs">
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
