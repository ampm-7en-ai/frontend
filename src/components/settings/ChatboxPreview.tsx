import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';
import { 
  MessageCircle, 
  Send, 
  Minimize2, 
  X, 
  Bot, 
  User, 
  Zap,
  RefreshCw
} from 'lucide-react';
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
  className?: string;
  emailRequired?: boolean;
  emailPlaceholder?: string;
  emailMessage?: string;
  collectEmail?: boolean;
  enableSessionStorage?: boolean;
  onSessionIdReceived?: (sessionId: string) => void;
}

interface Message {
  id: string;
  content: string;
  type: 'user' | 'bot' | 'system' | 'ui';
  timestamp: string;
  model?: string;
  temperature?: number;
  prompt?: string;
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
  className,
  emailRequired = false,
  emailPlaceholder = "Enter your email",
  emailMessage = "Please provide your email to continue",
  collectEmail = false,
  enableSessionStorage = false,
  onSessionIdReceived
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const wsRef = useRef<ChatWebSocketService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (agentId) {
      wsRef.current = new ChatWebSocketService(agentId, 'chatbox');
      
      wsRef.current.on({
        onMessage: (message) => {
          console.log('Received message:', message);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            content: message.content,
            type: message.type === 'bot_response' ? 'bot' : message.type as any,
            timestamp: message.timestamp,
            model: message.model,
            temperature: message.temperature,
            prompt: message.prompt,
            ui_type: message.ui_type
          }]);
          setIsTyping(false);
        },
        onTypingStart: () => {
          setIsTyping(true);
        },
        onTypingEnd: () => {
          setIsTyping(false);
        },
        onError: (error) => {
          console.error('WebSocket error:', error);
          setIsTyping(false);
        },
        onConnectionChange: (status) => {
          setIsConnected(status);
        },
        onSessionIdReceived: enableSessionStorage && onSessionIdReceived ? onSessionIdReceived : undefined
      });
      
      wsRef.current.connect();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [agentId, enableSessionStorage, onSessionIdReceived]);

  // Scroll to bottom of messages on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Handle opening chat
  const handleOpenChat = () => {
    setIsOpen(true);
    
    // Add welcome message if no messages exist
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        content: welcomeMessage,
        type: 'bot',
        timestamp: new Date().toISOString()
      }]);
    }

    // Show email form if email collection is enabled and not submitted
    if (collectEmail && !emailSubmitted) {
      setShowEmailForm(true);
    }
  };

  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !isConnected) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      type: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    // Send message through WebSocket
    if (wsRef.current) {
      wsRef.current.sendMessage(content.trim());
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  // Handle email submission
  const handleEmailSubmit = () => {
    if (emailInput.trim()) {
      setEmailSubmitted(true);
      setShowEmailForm(false);
      
      // Add system message about email submission
      setMessages(prev => [...prev, {
        id: 'email-submitted',
        content: `Email ${emailInput} has been recorded. How can I help you today?`,
        type: 'system',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Render email form
  const renderEmailForm = () => {
    if (!showEmailForm) return null;
    
    return (
      <div className="p-4 border-t">
        <p className="text-sm text-muted-foreground mb-3">{emailMessage}</p>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder={emailPlaceholder}
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleEmailSubmit}
            disabled={!emailInput.trim()}
            size="sm"
          >
            Submit
          </Button>
        </div>
      </div>
    );
  };

  // Render chat content
  const renderChatContent = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarSrc} />
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{chatbotName}</h3>
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.type === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.type !== 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarSrc} />
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.type === 'user' 
                    ? "bg-primary text-primary-foreground ml-auto" 
                    : "bg-muted"
                )}>
                  <p className="text-sm">{message.content}</p>
                  {message.ui_type && (
                    <Badge variant="secondary" className="mt-2">
                      {message.ui_type}
                    </Badge>
                  )}
                </div>
                
                {message.type === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarSrc} />
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span className="text-sm text-muted-foreground">Typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Email Form */}
        {renderEmailForm()}

        {/* Suggestions */}
        {suggestions.length > 0 && messages.length <= 1 && (
          <div className="p-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(inputMessage);
                }
              }}
              disabled={!isConnected || (collectEmail && !emailSubmitted)}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || !isConnected || (collectEmail && !emailSubmitted)}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("relative", className)}>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={handleOpenChat}
          className={cn(
            "fixed bottom-6 w-14 h-14 rounded-full shadow-lg z-50",
            position === 'bottom-right' ? 'right-6' : 'left-6'
          )}
          style={{
            backgroundColor: primaryColor,
            color: secondaryColor,
            fontFamily: fontFamily
          }}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={cn(
          "fixed bottom-6 w-80 h-96 shadow-xl z-50 flex flex-col",
          position === 'bottom-right' ? 'right-6' : 'left-6'
        )}>
          <CardContent className="p-0 h-full">
            {renderChatContent()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
