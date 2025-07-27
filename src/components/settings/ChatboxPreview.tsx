import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  ui_type?: string;
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
  emailRequired?: boolean;
  emailPlaceholder?: string;
  emailMessage?: string;
  collectEmail?: boolean;
  className?: string;
  visitorId?: string;
  sessionId?: string;
  shouldRestore?: boolean;
  onSessionUpdate?: (messages: any[]) => void;
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
  className,
  visitorId,
  sessionId,
  shouldRestore = false,
  onSessionUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<ChatWebSocketService | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (agentId) {
      // Initialize WebSocket with session parameters if available
      wsRef.current = new ChatWebSocketService(
        agentId, 
        "playground",
        visitorId,
        sessionId,
        shouldRestore,
        onSessionUpdate
      );

      wsRef.current.on({
        onMessage: (message) => {
          if (message.ui_type) {
            // Handle UI messages (like yes_no buttons)
            const uiMessage: ChatMessage = {
              id: `ui-${Date.now()}`,
              content: '',
              sender: 'bot',
              timestamp: message.timestamp,
              ui_type: message.ui_type
            };
            setMessages(prev => [...prev, uiMessage]);
          } else if (message.content) {
            // Handle regular messages
            const botMessage: ChatMessage = {
              id: `bot-${Date.now()}`,
              content: message.content,
              sender: 'bot',
              timestamp: message.timestamp
            };
            setMessages(prev => [...prev, botMessage]);
          }
        },
        onTypingStart: () => setIsTyping(true),
        onTypingEnd: () => setIsTyping(false),
        onError: (error) => console.error('WebSocket error:', error),
        onConnectionChange: (connected) => setIsConnected(connected)
      });

      wsRef.current.connect();

      return () => {
        wsRef.current?.disconnect();
      };
    }
  }, [agentId, visitorId, sessionId, shouldRestore, onSessionUpdate]);

  // Update parent with messages when they change
  useEffect(() => {
    if (onSessionUpdate) {
      onSessionUpdate(messages);
    }
  }, [messages, onSessionUpdate]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !wsRef.current) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    wsRef.current.sendMessage(inputValue);
    setInputValue('');
  };

  const handleEmailSubmit = () => {
    if (!emailInput.trim()) return;
    
    setShowEmailInput(false);
    const emailMessage: ChatMessage = {
      id: `email-${Date.now()}`,
      content: `Email provided: ${emailInput}`,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, emailMessage]);
    setEmailInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!wsRef.current) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: suggestion,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    wsRef.current.sendMessage(suggestion);
  };

  const handleYesNoClick = (response: string) => {
    if (!wsRef.current) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: response,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    wsRef.current.sendMessage(response);
  };

  const renderMessage = (message: ChatMessage) => {
    if (message.ui_type === 'yes_no') {
      return (
        <div className="flex justify-start mb-4">
          <div className="bg-secondary text-secondary-foreground rounded-lg p-3 max-w-[80%]">
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleYesNoClick('Yes')}
              >
                Yes
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleYesNoClick('No')}
              >
                No
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
        <div
          className={`rounded-lg p-3 max-w-[80%] ${
            message.sender === 'user'
              ? 'text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
          style={{
            backgroundColor: message.sender === 'user' ? primaryColor : undefined,
            fontFamily: fontFamily
          }}
        >
          {message.content}
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed ${position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4'} z-50 ${className}`}>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
        style={{
          backgroundColor: primaryColor,
          fontFamily: fontFamily
        }}
      >
        <MessageCircle className="h-6 w-6 text-white" />
        {buttonText && <span className="ml-2 text-white">{buttonText}</span>}
      </Button>

      {/* Chat Popup */}
      {isOpen && (
        <Card className="fixed bottom-20 w-96 h-[500px] shadow-xl" style={{ fontFamily: fontFamily }}>
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 rounded-t-lg text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarSrc} alt={chatbotName} />
                <AvatarFallback>{chatbotName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{chatbotName}</h3>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-sm opacity-90">
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 h-80">
            {messages.length === 0 && (
              <div className="flex justify-start mb-4">
                <div className="bg-secondary text-secondary-foreground rounded-lg p-3 max-w-[80%]">
                  {welcomeMessage}
                </div>
              </div>
            )}
            
            {messages.map(renderMessage)}
            
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 0 && suggestions.length > 0 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-300 transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Email Input */}
          {showEmailInput && (
            <div className="p-4 border-t">
              <p className="text-sm text-gray-600 mb-2">{emailMessage}</p>
              <div className="flex gap-2">
                <Input
                  placeholder={emailPlaceholder}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
                />
                <Button onClick={handleEmailSubmit} size="sm">
                  Submit
                </Button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!isConnected}
              />
              <Button onClick={handleSendMessage} size="sm" disabled={!isConnected}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
