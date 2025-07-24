
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, User, Bot, RotateCcw, AlertCircle } from 'lucide-react';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernInput } from '@/components/ui/modern-input';

interface ChatMessage {
  type: string;
  content: string;
  timestamp: string;
  ui_type?: string;
  messageId?: string;
  session_id?: string;
}

const SearchAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [emailInputValue, setEmailInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const chatServiceRef = useRef<ChatWebSocketService | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const processedMessageIds = useRef<Set<string>>(new Set());
  const messageSequenceRef = useRef<number>(0);

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if input should be disabled (when there's a pending yes/no or email question)
  const shouldDisableInput = messages.some(msg => 
    msg.type === 'ui' && (msg.ui_type === 'yes_no' || msg.ui_type === 'email')
  );

  // Get the latest yes/no message for displaying buttons
  const latestYesNoMessage = messages.slice().reverse().find(msg => 
    msg.type === 'ui' && msg.ui_type === 'yes_no'
  );

  // Get the latest email message for displaying email input
  const latestEmailMessage = messages.slice().reverse().find(msg => 
    msg.type === 'ui' && msg.ui_type === 'email'
  );

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, showTypingIndicator]);

  // Initialize WebSocket connection
  useEffect(() => {
    const agentId = "search-assistant"; // Default agent ID for search assistant
    
    console.log("Initializing Search Assistant WebSocket");
    
    chatServiceRef.current = new ChatWebSocketService(agentId, "search");
    
    chatServiceRef.current.on({
      onMessage: (message) => {
        console.log("Search Assistant - Received message:", message);
        
        // Handle system messages for typing indicator
        if (message.type === 'system_message') {
          setSystemMessage(message.content);
          setShowTypingIndicator(true);
          return;
        }
        
        // Generate unique message ID
        const messageId = `${message.type}-${Date.now()}-${messageSequenceRef.current++}`;
        
        // Enhanced deduplication check
        if (processedMessageIds.current.has(messageId)) {
          console.log("Duplicate message detected, skipping:", messageId);
          return;
        }
        
        processedMessageIds.current.add(messageId);
        
        // Clear typing indicator and system message
        setShowTypingIndicator(false);
        setSystemMessage('');
        setIsLoading(false);
        
        // Add message to state
        setMessages(prev => [...prev, { ...message, messageId }]);
      },
      onTypingStart: () => {
        console.log("Search Assistant - Typing started");
        setShowTypingIndicator(true);
      },
      onTypingEnd: () => {
        console.log("Search Assistant - Typing ended");
        setShowTypingIndicator(false);
        setSystemMessage('');
      },
      onError: (error) => {
        console.error('Search Assistant - Error:', error);
        setConnectionError(error);
        setIsConnected(false);
        setIsLoading(false);
        toast({
          title: "Connection Error",
          description: "Failed to connect to search assistant. Please try again.",
          variant: "destructive",
        });
      },
      onConnectionChange: (status) => {
        console.log("Search Assistant - Connection status:", status);
        setIsConnected(status);
        if (status) {
          setConnectionError(null);
        }
      }
    });
    
    chatServiceRef.current.connect();
    
    return () => {
      console.log("Search Assistant - Cleaning up");
      if (chatServiceRef.current) {
        chatServiceRef.current.disconnect();
        chatServiceRef.current = null;
      }
    };
  }, [toast]);

  const sendMessage = (messageContent: string) => {
    if (!chatServiceRef.current || !isConnected) {
      toast({
        title: "Not connected",
        description: "Cannot send message while disconnected",
        variant: "destructive",
      });
      return;
    }

    const newMessage: ChatMessage = {
      type: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
      messageId: `user-${Date.now()}-${messageSequenceRef.current++}`
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    setShowTypingIndicator(true);
    
    try {
      chatServiceRef.current.sendMessage(messageContent);
      console.log("Search Assistant - Message sent:", messageContent);
    } catch (error) {
      console.error("Search Assistant - Error sending message:", error);
      setIsLoading(false);
      setShowTypingIndicator(false);
      toast({
        title: "Send Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() && !shouldDisableInput) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleYesNoClick = (response: 'Yes' | 'No') => {
    sendMessage(response);
    // Remove the yes/no message from the list to re-enable input
    setMessages(prev => prev.filter(msg => !(msg.type === 'ui' && msg.ui_type === 'yes_no')));
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailInputValue.trim() && isValidEmail(emailInputValue)) {
      sendMessage(emailInputValue);
      setEmailInputValue('');
      // Remove the email message from the list to re-enable input
      setMessages(prev => prev.filter(msg => !(msg.type === 'ui' && msg.ui_type === 'email')));
    }
  };

  const handleNoThanksClick = () => {
    sendMessage('No thanks');
    setEmailInputValue('');
    // Remove the email message from the list to re-enable input
    setMessages(prev => prev.filter(msg => !(msg.type === 'ui' && msg.ui_type === 'email')));
  };

  const handleRestart = () => {
    setMessages([]);
    setInputValue('');
    setEmailInputValue('');
    setIsLoading(false);
    setShowTypingIndicator(false);
    setSystemMessage('');
    setConnectionError(null);
    processedMessageIds.current.clear();
    messageSequenceRef.current = 0;
    
    // Reconnect WebSocket
    if (chatServiceRef.current) {
      chatServiceRef.current.disconnect();
      chatServiceRef.current = null;
    }
    
    setTimeout(() => {
      const agentId = "search-assistant";
      chatServiceRef.current = new ChatWebSocketService(agentId, "search");
      
      chatServiceRef.current.on({
        onMessage: (message) => {
          if (message.type === 'system_message') {
            setSystemMessage(message.content);
            setShowTypingIndicator(true);
            return;
          }
          
          const messageId = `${message.type}-${Date.now()}-${messageSequenceRef.current++}`;
          
          if (processedMessageIds.current.has(messageId)) {
            return;
          }
          
          processedMessageIds.current.add(messageId);
          setShowTypingIndicator(false);
          setSystemMessage('');
          setIsLoading(false);
          setMessages(prev => [...prev, { ...message, messageId }]);
        },
        onTypingStart: () => setShowTypingIndicator(true),
        onTypingEnd: () => {
          setShowTypingIndicator(false);
          setSystemMessage('');
        },
        onError: (error) => {
          setConnectionError(error);
          setIsConnected(false);
          setIsLoading(false);
        },
        onConnectionChange: (status) => {
          setIsConnected(status);
          if (status) setConnectionError(null);
        }
      });
      
      chatServiceRef.current.connect();
    }, 500);
  };

  const getMessageAlignment = (messageType: string) => {
    switch (messageType) {
      case 'user':
        return 'justify-end';
      case 'bot_response':
        return 'justify-start';
      default:
        return 'justify-center';
    }
  };

  const getMessageStyling = (messageType: string) => {
    switch (messageType) {
      case 'user':
        return 'bg-blue-500 text-white';
      case 'bot_response':
        return 'bg-gray-100 text-gray-900';
      case 'system_message':
        return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Search Assistant</h1>
              <p className="text-sm text-gray-500">
                {isConnected ? 'Connected' : 'Connecting...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ModernButton
              onClick={handleRestart}
              variant="outline"
              size="sm"
              icon={RotateCcw}
              className="text-gray-600"
            >
              Restart
            </ModernButton>
            
            {connectionError && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Connection Error</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-6 space-y-4">
            {messages.map((message, index) => (
              <div key={message.messageId || index}>
                {message.type !== 'ui' && (
                  <div className={`flex ${getMessageAlignment(message.type)}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${getMessageStyling(message.type)}`}
                    >
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Yes/No UI Component */}
                {message.type === 'ui' && message.ui_type === 'yes_no' && (
                  <div className="flex gap-3 justify-center">
                    <ModernButton
                      onClick={() => handleYesNoClick('Yes')}
                      variant="outline"
                      className="px-8 py-3"
                    >
                      Yes
                    </ModernButton>
                    <ModernButton
                      onClick={() => handleYesNoClick('No')}
                      variant="outline"
                      className="px-8 py-3"
                    >
                      No
                    </ModernButton>
                  </div>
                )}

                {/* Email UI Component */}
                {message.type === 'ui' && message.ui_type === 'email' && (
                  <div className="flex flex-col gap-3 max-w-md mx-auto">
                    <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                      <ModernInput
                        type="email"
                        value={emailInputValue}
                        onChange={(e) => setEmailInputValue(e.target.value)}
                        placeholder="Enter your email address"
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && isValidEmail(emailInputValue)) {
                            e.preventDefault();
                            handleEmailSubmit(e);
                          }
                        }}
                      />
                      <div className="flex gap-3 justify-center">
                        <ModernButton
                          type="submit"
                          disabled={!isValidEmail(emailInputValue)}
                          className="px-8 py-3"
                        >
                          Submit
                        </ModernButton>
                        <ModernButton
                          onClick={handleNoThanksClick}
                          variant="outline"
                          className="px-8 py-3"
                        >
                          No thanks
                        </ModernButton>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {showTypingIndicator && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-gray-600">
                      {systemMessage || 'Typing...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              shouldDisableInput
                ? latestEmailMessage
                  ? "Please enter your email above..."
                  : "Please select Yes or No above..."
                : "Type your message..."
            }
            disabled={!isConnected || isLoading || shouldDisableInput}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || !isConnected || isLoading || shouldDisableInput}
            className="px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SearchAssistant;
