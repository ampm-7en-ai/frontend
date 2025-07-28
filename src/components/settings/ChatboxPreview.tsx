
import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import { useTheme } from 'next-themes';
import { Avatar } from "@/components/ui/avatar"
import { AvatarImage } from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"
import { ChatWebSocketService } from '@/services/ChatWebSocketService';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { CircleUserRound, MessageSquare, Settings } from 'lucide-react';
import { Separator } from '../ui/separator';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ChatMessage {
  content: string;
  timestamp: string;
  type: string;
  model: string;
  prompt: string;
  temperature: number;
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
  className?: string;
  emailRequired?: boolean;
  emailPlaceholder?: string;
  emailMessage?: string;
  collectEmail?: boolean;
  onSessionIdReceived?: (sessionId: string) => void;
}

export const ChatboxPreview = ({
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
  onSessionIdReceived
}: ChatboxPreviewProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [wsService, setWsService] = useState<ChatWebSocketService | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [email, setEmail] = useState('');
  const [emailCollected, setEmailCollected] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(collectEmail && !emailCollected);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast()

  const handleEmailSubmit = () => {
    if (email) {
      setEmailCollected(true);
      setShowEmailInput(false);
      toast({
        title: "Email Submitted",
        description: "Thanks for providing your email!",
      })
    } else {
      toast({
        variant: "destructive",
        title: "Please enter your email",
      })
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setNewMessage(suggestion);
    sendMessage(suggestion);
  };

  const sendMessage = (messageContent: string) => {
    if (messageContent.trim() && wsService) {
      wsService.sendMessage(messageContent);
      setMessages(prevMessages => [...prevMessages, {
        content: messageContent,
        timestamp: new Date().toISOString(),
        type: 'user',
        model: '',
        prompt: '',
        temperature: 0
      }]);
      setNewMessage('');
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize WebSocket service
  useEffect(() => {
    if (!agentId) return;

    const wsService = new ChatWebSocketService(agentId, 'chat');
    
    wsService.on({
      onMessage: (message) => {
        setMessages(prevMessages => [...prevMessages, message]);
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      },
      onTypingStart: () => {
        setIsTyping(true);
      },
      onTypingEnd: () => {
        setIsTyping(false);
      },
      onError: (error) => {
        console.error("WebSocket Error:", error);
      },
      onConnectionChange: (status) => {
        console.log("WebSocket Connection Status:", status);
      },
      // Only pass session ID callback if provided (for preview page)
      ...(onSessionIdReceived && { onSessionIdReceived })
    });

    wsService.connect();
    setWsService(wsService);

    return () => {
      wsService.disconnect();
    };
  }, [agentId, onSessionIdReceived]);

  return (
    <div className={cn("chat-container flex flex-col h-full", className)} style={{ fontFamily: fontFamily }}>
      <div className="chat-header p-4 flex items-center gap-4 border-b">
        <Avatar className="w-8 h-8">
          {avatarSrc ? (
            <AvatarImage src={avatarSrc} alt={chatbotName} />
          ) : (
            <CircleUserRound className="w-5 h-5" />
          )}
        </Avatar>
        <h2 className="text-lg font-semibold">{chatbotName}</h2>
      </div>

      <div ref={chatContainerRef} className="chat-messages flex-grow p-4 overflow-y-auto">
        {welcomeMessage && messages.length === 0 && (
          <div className="chat-message bot">
            <div className="message-content" style={{ backgroundColor: secondaryColor, color: primaryColor }}>
              {welcomeMessage}
            </div>
            <div className="message-timestamp"></div>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={index} className={`chat-message ${message.type === 'user' ? 'user' : 'bot'}`}>
            <div className="message-content" style={{ backgroundColor: message.type === 'user' ? primaryColor : secondaryColor, color: message.type === 'user' ? secondaryColor : primaryColor }}>
              {message.content}
            </div>
            <div className="message-timestamp">{new Date(message.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-message bot typing-indicator">
            <div className="message-content" style={{ backgroundColor: secondaryColor, color: primaryColor }}>
              Typing...
            </div>
          </div>
        )}
      </div>

      {showEmailInput ? (
        <div className="chat-input p-4 border-t">
          <Label htmlFor="email">{emailMessage}</Label>
          <Input
            type="email"
            id="email"
            placeholder={emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-2"
          />
          <Button onClick={handleEmailSubmit} style={{ backgroundColor: primaryColor, color: secondaryColor }}>Submit Email</Button>
        </div>
      ) : (
        <div className="chat-input p-4 border-t">
          {suggestions && suggestions.length > 0 && (
            <div className="suggestions mb-2 flex gap-2 overflow-x-auto">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{ color: primaryColor, borderColor: primaryColor }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage(newMessage);
                }
              }}
            />
            <Button onClick={() => sendMessage(newMessage)} style={{ backgroundColor: primaryColor, color: secondaryColor }}>{buttonText}</Button>
          </div>
        </div>
      )}
    </div>
  );
};
