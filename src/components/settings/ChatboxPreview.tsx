import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ModernInput } from '@/components/ui/modern-input';

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
}

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: string;
  type?: 'text' | 'ui';
  ui_type?: 'email';
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

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
  className
}) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldDisableInput, setShouldDisableInput] = useState(false);
  const [emailInputValue, setEmailInputValue] = useState('');
  const chatboxRef = useRef<HTMLDivElement>(null);
  const [typing, setTyping] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      text: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
      type: 'text',
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setTyping(true);

    try {
      const response = await fetch(`https://api-staging.7en.ai/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agentId,
          message: inputValue,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.response) {
        const botMessage: ChatMessage = {
          text: data.response,
          isUser: false,
          timestamp: new Date().toLocaleTimeString(),
          type: 'text',
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Something went wrong!",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
      setTyping(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleEmailSubmit = async () => {
    if (!isValidEmail(emailInputValue)) {
      alert('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setShouldDisableInput(true);

    try {
      const response = await fetch(`https://api-staging.7en.ai/api/collect-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agentId,
          email: emailInputValue,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.response) {
        const botMessage: ChatMessage = {
          text: data.response,
          isUser: false,
          timestamp: new Date().toLocaleTimeString(),
          type: 'text',
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (error: any) {
      console.error('Error submitting email:', error);
      toast({
        title: "Something went wrong!",
        description: "There was an error submitting your email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
      setShouldDisableInput(false);
    }
  };

  const handleNoThanksClick = () => {
    const botMessage: ChatMessage = {
      text: "OK. If you change your mind, just let me know!",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
      type: 'text',
    };
    setMessages((prevMessages) => [...prevMessages, botMessage]);
    setShouldDisableInput(false);
  };

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const initialBotMessage: ChatMessage = {
      text: welcomeMessage,
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
      type: 'text',
    };
    setMessages([initialBotMessage]);
  }, [welcomeMessage]);

  const renderMessageContent = (message: ChatMessage) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    if (message.text) {
      const parts = message.text.split(urlRegex).map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: primaryColor }}
            >
              {part}
            </a>
          );
        } else {
          return part;
        }
      });
      return parts;
    }

    return null;
  };

  const renderEmailUI = (message: ChatMessage) => {
    if (message.type !== 'ui' || message.ui_type !== 'email') return null;

    return (
      <div className="mb-4 p-4 bg-muted rounded-lg border">
        <p className="text-sm text-muted-foreground mb-3">Please provide your email address:</p>
        <div className="space-y-3">
          <ModernInput
            type="email"
            value={emailInputValue}
            onChange={(e) => setEmailInputValue(e.target.value)}
            placeholder="Enter your email"
            className="w-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isValidEmail(emailInputValue)) {
                handleEmailSubmit();
              }
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleEmailSubmit}
              disabled={!isValidEmail(emailInputValue)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors text-sm"
            >
              Submit
            </button>
            <button
              onClick={handleNoThanksClick}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors text-sm"
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-2">
        {avatarSrc ? (
          <img src={avatarSrc} alt="Chatbot Avatar" className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center">
            {chatbotName.charAt(0).toUpperCase()}
          </div>
        )}
        <h2 className="text-lg font-semibold">{chatbotName}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatboxRef}>
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`rounded-xl px-4 py-2 max-w-[75%] sm:max-w-[60%] md:max-w-[50%] lg:max-w-[40%] ${message.isUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
                }`}
            >
              {message.type === 'text' && (
                <div className="whitespace-pre-wrap">
                  {renderMessageContent(message)}
                </div>
              )}
            </div>
          </div>
        ))}
        {messages.map((message, index) => (
          <div key={index}>
            {renderEmailUI(message)}
          </div>
        ))}
      </div>

      {typing && !isLoading && (
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            <Loader2 className="inline-block animate-spin mr-1" size={16} />
            Typing...
          </p>
        </div>
      )}

      {/* Chat Input */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={shouldDisableInput ? "Please respond above..." : "Type your message..."}
            disabled={shouldDisableInput}
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: primaryColor,
              color: primaryColor
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || shouldDisableInput}
            className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 transition-colors"
            style={{
              backgroundColor: primaryColor,
              color: 'white'
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
