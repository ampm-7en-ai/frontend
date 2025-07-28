import React, { useState, useEffect, useRef } from 'react';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatboxPreviewProps {
  agentId: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  chatbotName: string;
  welcomeMessage: string;
  buttonText: string;
  position: 'bottom-right' | 'bottom-left';
  suggestions?: string[];
  avatarSrc?: string;
  emailRequired?: boolean;
  emailPlaceholder?: string;
  emailMessage?: string;
  collectEmail?: boolean;
  className?: string;
  onSessionIdReceived?: (sessionId: string) => void;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  type?: string;
  ui_type?: string;
}

export function ChatboxPreview({
  agentId,
  primaryColor = '#3b82f6',
  secondaryColor = '#f3f4f6',
  fontFamily = 'Inter',
  chatbotName,
  welcomeMessage,
  buttonText,
  position,
  suggestions = [],
  avatarSrc,
  emailRequired = false,
  emailPlaceholder = "Enter your email",
  emailMessage = "Please provide your email to continue",
  collectEmail = false,
  className = '',
  onSessionIdReceived
}: ChatboxPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [email, setEmail] = useState('');
  const [emailCollected, setEmailCollected] = useState(false);
  const chatServiceRef = useRef<ChatWebSocketService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat service
  useEffect(() => {
    if (agentId) {
      chatServiceRef.current = new ChatWebSocketService(agentId, 'preview');
      
      // Set up event handlers
      chatServiceRef.current.on({
        onMessage: (message) => {
          console.log('Received message:', message);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            content: message.content,
            sender: 'bot',
            timestamp: message.timestamp,
            type: message.type,
            ui_type: message.ui_type
          }]);
          setIsTyping(false);
        },
        onTypingStart: () => setIsTyping(true),
        onTypingEnd: () => setIsTyping(false),
        onConnectionChange: (connected) => setIsConnected(connected),
        onError: (error) => console.error('Chat error:', error),
        onSessionIdReceived: (sessionId) => {
          console.log('Session ID received in ChatboxPreview:', sessionId);
          onSessionIdReceived?.(sessionId);
        }
      });
      
      // Connect to WebSocket
      chatServiceRef.current.connect();
      
      // Add welcome message
      setMessages([{
        id: '1',
        content: welcomeMessage,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'welcome'
      }]);
    }
    
    return () => {
      if (chatServiceRef.current) {
        chatServiceRef.current.disconnect();
      }
    };
  }, [agentId, welcomeMessage, onSessionIdReceived]);

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !chatServiceRef.current) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Send message through WebSocket
    try {
      chatServiceRef.current.sendMessage(content);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setEmailCollected(true);
      // You might want to send the email to your backend here
      console.log('Email collected:', email);
    }
  };

  const positionClasses = position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4';

  return (
    <div 
      className={`fixed ${positionClasses} z-50 ${className}`}
      style={{ fontFamily }}
    >
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle size={20} />
          {buttonText}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col"
          style={{ backgroundColor: secondaryColor }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-3 text-white rounded-t-lg"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-2">
              {avatarSrc && (
                <img 
                  src={avatarSrc} 
                  alt={chatbotName}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="font-medium">{chatbotName}</span>
              {isConnected && (
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Email Collection */}
          {collectEmail && !emailCollected && (
            <div className="p-3 border-b">
              <p className="text-sm text-gray-600 mb-2">{emailMessage}</p>
              <form onSubmit={handleEmailSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder={emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={emailRequired}
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  Submit
                </Button>
              </form>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                    style={message.sender === 'user' ? { backgroundColor: primaryColor } : {}}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Suggestions */}
          {suggestions.length > 0 && messages.length === 1 && (
            <div className="p-3 border-t">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                className="flex-1"
              />
              <Button
                onClick={() => sendMessage(inputMessage)}
                size="sm"
                style={{ backgroundColor: primaryColor }}
                className="text-white hover:opacity-90"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
