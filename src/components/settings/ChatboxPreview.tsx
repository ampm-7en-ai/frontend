import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X, MessageCircle, Minimize2, Maximize2 } from 'lucide-react';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
  visitorId?: string | null;
  sessionId?: string | null;
  shouldRestore?: boolean;
  onSessionUpdate?: (sessionData: any) => void;
  className?: string;
}

interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: string;
  isTyping?: boolean;
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
  shouldRestore = false,
  onSessionUpdate,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsServiceRef = useRef<ChatWebSocketService | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize WebSocket service with session data
  useEffect(() => {
    if (isOpen && !wsServiceRef.current) {
      wsServiceRef.current = new ChatWebSocketService(
        agentId,
        visitorId,
        sessionId,
        shouldRestore,
        onSessionUpdate
      );
      
      wsServiceRef.current.onMessage = (message) => {
        if (message.type === 'bot_response') {
          setMessages(prev => [...prev, {
            id: message.id || `bot-${Date.now()}`,
            type: 'bot',
            content: message.content,
            timestamp: message.timestamp || new Date().toISOString()
          }]);
          setIsTyping(false);
        } else if (message.type === 'message') {
          // Handle restored user messages
          setMessages(prev => [...prev, {
            id: message.id || `user-${Date.now()}`,
            type: 'user',
            content: message.content,
            timestamp: message.timestamp || new Date().toISOString()
          }]);
        }
      };
      
      wsServiceRef.current.onConnectionChange = (connected) => {
        setIsConnected(connected);
        setIsConnecting(false);
      };
      
      wsServiceRef.current.onTyping = (typing) => {
        setIsTyping(typing);
      };
      
      setIsConnecting(true);
      wsServiceRef.current.connect();
    }
    
    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
        wsServiceRef.current = null;
      }
    };
  }, [isOpen, agentId, visitorId, sessionId, shouldRestore, onSessionUpdate]);

  const handleSendMessage = () => {
    if (inputMessage.trim() && wsServiceRef.current) {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: inputMessage.trim(),
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      wsServiceRef.current.sendMessage(inputMessage.trim());
      setInputMessage('');
      setIsTyping(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (wsServiceRef.current) {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: suggestion,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      wsServiceRef.current.sendMessage(suggestion);
      setIsTyping(true);
    }
  };

  const handleEmailSubmit = () => {
    if (email.trim()) {
      setEmailSubmitted(true);
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        type: 'system',
        content: `Email provided: ${email}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, systemMessage]);
    }
  };

  const chatButtonStyle = {
    backgroundColor: primaryColor,
    fontFamily: fontFamily,
  };

  const chatHeaderStyle = {
    backgroundColor: primaryColor,
    fontFamily: fontFamily,
  };

  const sendButtonStyle = {
    backgroundColor: primaryColor,
  };

  const suggestionStyle = {
    borderColor: primaryColor,
    color: primaryColor,
    fontFamily: fontFamily,
  };

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-50", className)}>
      {/* Chat Button */}
      <div className={cn(
        "fixed bottom-4 z-50 pointer-events-auto",
        position === 'bottom-right' ? 'right-4' : 'left-4'
      )}>
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-shadow"
            style={chatButtonStyle}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className={cn(
          "fixed bottom-4 z-50 pointer-events-auto",
          position === 'bottom-right' ? 'right-4' : 'left-4',
          isMinimized ? 'w-80' : 'w-96'
        )}>
          <div className="bg-white rounded-lg shadow-2xl border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 text-white" style={chatHeaderStyle}>
              <div className="flex items-center space-x-3">
                {avatarSrc && (
                  <img src={avatarSrc} alt={chatbotName} className="w-8 h-8 rounded-full" />
                )}
                <div>
                  <h3 className="font-semibold">{chatbotName}</h3>
                  <div className="flex items-center space-x-2">
                    <div className={cn("w-2 h-2 rounded-full", isConnected ? 'bg-green-400' : 'bg-red-400')} />
                    <span className="text-sm opacity-90">
                      {isConnecting ? 'Connecting...' : isConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chat Body */}
            {!isMinimized && (
              <div className="h-96 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Welcome Message */}
                  <div className="flex items-start space-x-3">
                    {avatarSrc && (
                      <img src={avatarSrc} alt={chatbotName} className="w-8 h-8 rounded-full flex-shrink-0" />
                    )}
                    <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                      <p className="text-sm" style={{ fontFamily }}>{welcomeMessage}</p>
                    </div>
                  </div>

                  {/* Suggestions */}
                  {suggestions.length > 0 && messages.length === 0 && (
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs hover:bg-gray-50"
                          style={suggestionStyle}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Email Collection */}
                  {collectEmail && !emailSubmitted && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-sm mb-2" style={{ fontFamily }}>{emailMessage}</p>
                      <div className="flex space-x-2">
                        <Input
                          type="email"
                          placeholder={emailPlaceholder}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={handleEmailSubmit}
                          style={sendButtonStyle}
                          className="text-white"
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  {messages.map((message) => (
                    <div key={message.id} className={cn("flex", message.type === 'user' ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        "max-w-xs rounded-lg p-3",
                        message.type === 'user' 
                          ? "text-white" 
                          : "bg-gray-100"
                      )} style={message.type === 'user' ? { backgroundColor: primaryColor, fontFamily } : { fontFamily }}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-start space-x-3">
                      {avatarSrc && (
                        <img src={avatarSrc} alt={chatbotName} className="w-8 h-8 rounded-full flex-shrink-0" />
                      )}
                      <div className="bg-gray-100 rounded-lg p-3">
                        <LoadingSpinner size="sm" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1"
                      disabled={!isConnected || (collectEmail && !emailSubmitted)}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || !isConnected || (collectEmail && !emailSubmitted)}
                      style={sendButtonStyle}
                      className="text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
