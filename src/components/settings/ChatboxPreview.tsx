import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Send, X, Minimize2, MessageCircle, User, Bot, MoreHorizontal } from 'lucide-react';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';
import { cn } from '@/lib/utils';

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
  emailRequired?: boolean;
  emailPlaceholder?: string;
  emailMessage?: string;
  collectEmail?: boolean;
  visitorId?: string;
  sessionId?: string;
  className?: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  ui_type?: string;
}

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
  emailRequired = false,
  emailPlaceholder = "Enter your email",
  emailMessage = "Please provide your email to continue",
  collectEmail = false,
  visitorId,
  sessionId,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [email, setEmail] = useState('');
  const [emailCollected, setEmailCollected] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const wsRef = useRef<ChatWebSocketService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (agentId) {
      // Pass session parameters only when they exist (preview mode)
      const wsOptions = visitorId && sessionId ? {
        visitorId,
        sessionId,
        shouldRestore: true
      } : {};
      
      wsRef.current = new ChatWebSocketService(agentId, "chat", wsOptions);
      
      wsRef.current.on({
        onMessage: (message) => {
          if (message.ui_type) {
            // Handle UI messages (like yes_no)
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              content: message.content || '',
              sender: 'bot',
              timestamp: new Date(message.timestamp),
              ui_type: message.ui_type
            }]);
          } else {
            // Handle regular messages
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              content: message.content,
              sender: 'bot',
              timestamp: new Date(message.timestamp)
            }]);
          }
          setIsTyping(false);
          setShowSuggestions(false);
        },
        onTypingStart: () => setIsTyping(true),
        onTypingEnd: () => setIsTyping(false),
        onError: (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        },
        onConnectionChange: (connected) => {
          setIsConnected(connected);
          if (connected) {
            console.log('WebSocket connected');
          } else {
            console.log('WebSocket disconnected');
          }
        }
      });
      
      wsRef.current.connect();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [agentId, visitorId, sessionId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!isConnected) {
      alert('Not connected to the chat. Please try again later.');
      return;
    }

    if (emailRequired && collectEmail && !emailCollected) {
      if (!email) {
        setShowEmailInput(true);
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      setEmailCollected(true);
      setShowEmailInput(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `Email: ${email}`,
        sender: 'user',
        timestamp: new Date()
      }]);
    }

    if (inputValue.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: inputValue,
        sender: 'user',
        timestamp: new Date()
      }]);
      wsRef.current?.sendMessage(inputValue);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isConnected) {
      alert('Not connected to the chat. Please try again later.');
      return;
    }

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content: suggestion,
      sender: 'user',
      timestamp: new Date()
    }]);
    wsRef.current?.sendMessage(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className={cn("chat-container relative flex flex-col h-full w-full rounded-md shadow-md overflow-hidden", className)}>
      {/* Header */}
      <div className="chat-header flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          {avatarSrc && (
            <img
              src={avatarSrc}
              alt="Chatbot Avatar"
              className="w-8 h-8 rounded-full mr-3"
            />
          )}
          <h3 className="text-lg font-semibold">{chatbotName}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <Minimize2 size={16} />
          </button>
          <button
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages p-4 space-y-2 flex-grow overflow-y-auto">
        {!emailCollected && emailRequired && collectEmail && showEmailInput && (
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {emailMessage}
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="email"
                id="email"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder={emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleSend}
            >
              Submit Email
            </button>
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`chat-bubble ${message.sender === 'user' ? 'user-bubble' : 'bot-bubble'} max-w-xs rounded-xl px-3 py-2 my-1 relative`}>
            {message.sender === 'bot' && (
              <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Bot Avatar"
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <Bot size={20} className="text-gray-700" />
                )}
              </div>
            )}
            <div className={message.sender === 'bot' ? 'ml-8' : 'mr-8'}>
              {message.ui_type === 'yes_no' ? (
                <div className="flex space-x-2">
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                    onClick={() => {
                      setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        content: 'Yes',
                        sender: 'user',
                        timestamp: new Date()
                      }]);
                      wsRef.current?.sendMessage('Yes');
                      setShowSuggestions(false);
                    }}
                  >
                    Yes
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                    onClick={() => {
                      setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        content: 'No',
                        sender: 'user',
                        timestamp: new Date()
                      }]);
                      wsRef.current?.sendMessage('No');
                      setShowSuggestions(false);
                    }}
                  >
                    No
                  </button>
                </div>
              ) : (
                <p className="text-sm break-words">{message.content}</p>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-bubble bot-bubble max-w-xs rounded-xl px-3 py-2 my-1 relative">
            <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Bot Avatar"
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <Bot size={20} className="text-gray-700" />
              )}
            </div>
            <div className="ml-8">
              <p className="text-sm">Typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="chat-suggestions p-4 border-t">
          <div className="flex space-x-2 overflow-x-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="chat-input p-4 border-t">
        <div className="flex items-center">
          <input
            type="text"
            className="flex-grow rounded-full py-2 px-4 border focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-transparent"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
          />
          <button
            className="ml-2 p-2 rounded-full bg-primaryColor hover:bg-primaryColorLight text-white"
            onClick={handleSend}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
