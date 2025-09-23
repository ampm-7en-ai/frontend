import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bot, Send, User, WifiOff, AlertCircle, Minus, RotateCcw, MessageCircleReplyIcon, User2, MessageSquare, MoreHorizontal, MessageCircle, Star, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChatWebSocketService } from '@/services/ChatWebSocketService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { Textarea } from '@/components/ui/textarea';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernInput } from '@/components/ui/modern-input';
import { Button } from '@/components/ui/button';
import { Input } from '../ui/input';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneLight, oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '../icons';
interface Message {
  type: string;
  content: string;
  timestamp: string;
  ui_type?: string;
  messageId?: string;
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
  className?: string;
  suggestions?: string[];
  avatarSrc?: string;
  emailRequired?: boolean;
  emailPlaceholder?: string;
  emailMessage?: string;
  collectEmail?: boolean;
  onMinimize?: () => void;
  onRestart?: () => void;
  showFloatingButton?: boolean;
  initiallyMinimized?: boolean;
  canvasMode?: boolean;
  enableSessionStorage?: boolean;
  onSessionIdReceived?: (sessionId: string) => void;
  sessionId?: string | null;
}

export const ChatboxPreview = ({
  agentId,
  primaryColor = '#9b87f5',
  secondaryColor = '#ffffff',
  fontFamily = 'Inter',
  chatbotName = 'Assistant',
  welcomeMessage = '',
  buttonText = '',
  position = 'bottom-right',
  className,
  suggestions = [],
  avatarSrc,
  emailRequired = false,
  emailPlaceholder = "Enter your email",
  emailMessage = "Please provide your email to continue",
  collectEmail = false,
  onMinimize,
  onRestart,
  showFloatingButton = false,
  initiallyMinimized = false,
  canvasMode = false,
  enableSessionStorage = false,
  onSessionIdReceived,
  sessionId  
}: ChatboxPreviewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const chatServiceRef = useRef<ChatWebSocketService | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const processedMessageIds = useRef<Set<string>>(new Set());
  const restartingRef = useRef(false);
  const messageSequenceRef = useRef<number>(0);
  const [emailValue, setEmailValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Internal state for floating button mode
  const [isMinimized, setIsMinimized] = useState(initiallyMinimized);

  // Terms and conditions state
  const [termsAccepted, setTermsAccepted] = useState(false);

  // End chat confirmation and feedback states
  const [showEndChatConfirmation, setShowEndChatConfirmation] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  // Idle time tracking state
  const [lastBotMessageTime, setLastBotMessageTime] = useState<Date | null>(null);
  const timeoutQuestionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finalTimeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTimeoutQuestionSentRef = useRef(false);

  // Check if input should be disabled (when there's a pending UI state)
  const shouldDisableInput = messages.some(msg => 
    msg.type === 'ui' && msg.ui_type === 'email'
  ) || showEndChatConfirmation || showFeedbackForm;

  // Get the latest yes/no message for displaying buttons
  const latestYesNoMessage = messages.slice().reverse().find(msg => 
    msg.type === 'ui' && msg.ui_type === 'email'
  );

  // Clear all idle timers
  const clearIdleTimers = () => {
    if (timeoutQuestionTimerRef.current) {
      clearTimeout(timeoutQuestionTimerRef.current);
      timeoutQuestionTimerRef.current = null;
    }
    if (finalTimeoutTimerRef.current) {
      clearTimeout(finalTimeoutTimerRef.current);
      finalTimeoutTimerRef.current = null;
    }
    // Don't reset the flag here - only reset when user sends a message
  };

  // Check if the latest message is from the bot
  const isLatestMessageFromBot = (messageArray = messages) => {
    if (messageArray.length === 0) return false;
    const latestMessage = messageArray[messageArray.length - 1];
    console.log('Checking latest message:', latestMessage?.type, 'Content:', latestMessage?.content?.slice(0, 50));
    const isFromBot = latestMessage.type === 'bot_response' || (latestMessage.type !== 'user' && latestMessage.type !== 'ui');
    console.log('Is from bot:', isFromBot);
    return isFromBot;
  };

  // Start idle timeout tracking - only if latest message is from bot
  const startIdleTimeout = (messageArray = messages) => {
    // Guard: If timeout_question was already sent, don't interfere with final timeout
    if (isTimeoutQuestionSentRef.current) {
      console.log('⛔ Timeout question already sent, not starting new idle timeout');
      return;
    }
    
    // Only start timeout if the latest message is from the bot
    if (!isLatestMessageFromBot(messageArray)) {
      console.log('Latest message is not from bot, not starting idle timeout');
      return;
    }

    clearIdleTimers();
    
    console.log('Starting idle timeout tracking, latest message is from bot');
    
    // First timeout - send timeout_question after 1 minute
    timeoutQuestionTimerRef.current = setTimeout(() => {
      const wsConnected = chatServiceRef.current?.isConnected() || false;
      console.log('Timeout question timer triggered. WS Connected:', wsConnected, 'Already sent:', isTimeoutQuestionSentRef.current);
      
      if (chatServiceRef.current && wsConnected && !isTimeoutQuestionSentRef.current) {
        console.log('Sending timeout_question after 1 minute of inactivity');
        isTimeoutQuestionSentRef.current = true;
        
        try {
          chatServiceRef.current.send({
            type: 'timeout_question',
            message: '',
            agentId: agentId || '',
            sessionId: sessionId || '',
            timestamp: Date.now()
          });
          console.log('timeout_question message sent successfully');
        } catch (error) {
          console.error('Error sending timeout_question:', error);
        }
        
        // Start second timeout - send timeout after another 1 minute
        console.log('🟡 Starting final timeout timer for 1 minute from now');
        finalTimeoutTimerRef.current = setTimeout(() => {
          const wsConnected2 = chatServiceRef.current?.isConnected() || false;
          console.log('🔥 Final timeout timer triggered! WS Connected:', wsConnected2, 'Timeout question sent:', isTimeoutQuestionSentRef.current);
          
          if (chatServiceRef.current && wsConnected2) {
            console.log('📤 Sending timeout message after 1 minute of timeout_question');
            
            try {
              chatServiceRef.current.send({
                type: 'timeout',
                message: '',
                agentId: agentId || '',
                sessionId: sessionId || '',
                timestamp: Date.now()
              });
              console.log('✅ timeout message sent successfully');
              
              // Show feedback form after timeout
              console.log('📋 Showing feedback form after timeout');
              setShowFeedbackForm(true);
            } catch (error) {
              console.error('❌ Error sending timeout:', error);
            }
          } else {
            console.log('❌ Cannot send final timeout - connection not available');
          }
        }, 1 * 60 * 1000); // Another 1 minute
      } else {
        console.log('Cannot send timeout_question - connection not available or already sent');
      }
    }, 1 * 60 * 1000); // 1 minute
  };

  // Reset idle timeout when user types - but only start if latest message is from bot
  const resetIdleTimeout = () => {
    console.log('User activity detected, clearing timers and resetting timeout flag');
    
    // Only clear the timeout question timer, not the final timeout timer
    // If timeout_question was already sent, let the final timeout complete
    if (timeoutQuestionTimerRef.current) {
      clearTimeout(timeoutQuestionTimerRef.current);
      timeoutQuestionTimerRef.current = null;
    }
    
    // Only clear final timeout timer if timeout_question hasn't been sent yet
    if (!isTimeoutQuestionSentRef.current && finalTimeoutTimerRef.current) {
      console.log('🛑 Clearing final timeout timer since timeout_question not sent yet');
      clearTimeout(finalTimeoutTimerRef.current);
      finalTimeoutTimerRef.current = null;
    } else if (isTimeoutQuestionSentRef.current) {
      console.log('⏰ Keeping final timeout timer running since timeout_question was already sent');
    }
    
    // Only restart timer if the latest message is from bot AND timeout_question hasn't been sent
    if (!isTimeoutQuestionSentRef.current && isLatestMessageFromBot()) {
      console.log('Latest message is from bot, restarting idle timeout');
      startIdleTimeout();
    } else if (isTimeoutQuestionSentRef.current) {
      console.log('⏰ Timeout question already sent, not restarting idle timeout');
    } else {
      console.log('Latest message is not from bot, not restarting idle timeout');
    }
  };

  // Updated scroll effect to only scroll the message container, not the entire tab
  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [messages, showTypingIndicator]);

  // Store a reference to the scroll viewport when the ScrollArea is mounted
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        scrollViewportRef.current = viewport as HTMLDivElement;
      }
    }
  }, []);

  // Improved message ID generation for better deduplication
  const generateUniqueMessageId = (message: any): string => {
    // Use existing messageId if available
    if (message.messageId) return message.messageId;
    
    // Create a more robust ID based on content + type + sequence
    messageSequenceRef.current += 1;
    const contentHash = message.content.slice(0, 30).replace(/\s+/g, '-');
    return `${message.type}-${contentHash}-${messageSequenceRef.current}-${Date.now()}`;
  };

  useEffect(() => {
    // Don't initialize if no agent ID
    if (!agentId) {
      console.log("No agent ID provided to ChatboxPreview");
      setConnectionError("No agent ID provided");
      setIsInitializing(false);
      return;
    }

    console.log("Initializing ChatWebSocketService with agent ID:", agentId);
    setConnectionError(null);
    
    chatServiceRef.current = new ChatWebSocketService(agentId, "preview");
    
    chatServiceRef.current.on({
      onMessage: (message) => {
        console.log("Received message:", message);
        
        // Skip if we're in the middle of restarting
        if (restartingRef.current) {
          console.log("Skipping message during restart");
          return;
        }
        
        // Handle system messages for typing indicator
        if (message.type === 'system_message') {
          setSystemMessage(message.content);
          setShowTypingIndicator(true);
          return;
        }
        
        // Generate unique message ID for better deduplication
        const messageId = generateUniqueMessageId(message);
        
        // Enhanced deduplication check
        if (processedMessageIds.current.has(messageId)) {
          console.log("Duplicate message detected, skipping:", messageId);
          return;
        }
        
        // Add to processed set
        processedMessageIds.current.add(messageId);
        
        // Clear typing indicator and system message
        setShowTypingIndicator(false);
        setSystemMessage('');
        
        // Track bot messages for idle timeout
        if (message.type === 'bot_response' || (message.type !== 'user' && message.type !== 'ui')) {
          const currentTime = new Date();
          console.log('Bot message received, updating last bot message time:', currentTime);
          setLastBotMessageTime(currentTime);
        }
        
          // Add message to state
          setMessages(prev => {
            const newMessages = [...prev, { ...message, messageId }];
            
            // Start idle timeout after state update if this is a bot message
            if (message.type === 'bot_response' || (message.type !== 'user' && message.type !== 'ui')) {
              // Pass the updated messages array to check latest message correctly
              setTimeout(() => {
                console.log('Checking if should start idle timeout with newMessages array');
                // Pass the newMessages array to avoid state timing issues
                if (!isLatestMessageFromBot(newMessages)) {
                  console.log('Latest message is not from bot using newMessages, not starting idle timeout');
                  return;
                }
                console.log('Latest message is from bot using newMessages, starting idle timeout');
                startIdleTimeout(newMessages);
              }, 0);
            }
            
            return newMessages;
          });
      },
      onTypingStart: () => {
        console.log("Typing indicator started");
        if (!restartingRef.current) {
          setShowTypingIndicator(true);
        }
      },
      onTypingEnd: () => {
        console.log("Typing indicator ended");
        setShowTypingIndicator(false);
        setSystemMessage('');
      },
      onError: (error) => {
        console.error('Chat error:', error);
        setConnectionError(error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to chat service. Please try again.",
          variant: "destructive",
        });
        setIsConnected(false);
        setIsInitializing(false);
      },
      onConnectionChange: (status) => {
        console.log("Connection status changed:", status);
        setIsConnected(status);
        setIsInitializing(false);
        if (status) {
          setConnectionError(null);
          // Start idle timeout tracking when connected
          console.log('Connection established, starting idle timeout tracking');
          setLastBotMessageTime(new Date());
          startIdleTimeout();
          
          if (enableSessionStorage && sessionId && chatServiceRef.current) {
            console.log('Sending session initialization:', sessionId);
            chatServiceRef.current.sendSessionInit(sessionId);
          }
        }
      },
      ...(enableSessionStorage && onSessionIdReceived && {
        onSessionIdReceived: onSessionIdReceived
      })
    });
    
    chatServiceRef.current.connect();
    
    return () => {
      console.log("Cleaning up ChatWebSocketService");
      clearIdleTimers();
      if (chatServiceRef.current) {
        chatServiceRef.current.disconnect();
        chatServiceRef.current = null;
      }
    };
  }, [agentId, toast]);  

  const sendMessage = (messageContent: string) => {
    if (!chatServiceRef.current || !isConnected) {
      toast({
        title: "Not connected",
        description: "Cannot send message while disconnected",
        variant: "destructive",
      });
      return;
    }

    messageSequenceRef.current += 1;
    const newMessage: Message = {
      type: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
      messageId: `user-${Date.now()}-${messageSequenceRef.current}`
    };
    
    setMessages(prev => [...prev, newMessage]);
    setShowTypingIndicator(true);
    
    // Reset idle timeout when user sends a message
    resetIdleTimeout();
    
    try {
      chatServiceRef.current.sendMessage(messageContent);
      console.log("Message sent:", messageContent);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Send Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setShowTypingIndicator(false);
    }
  };

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '44px'; // Reset to minimum height
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() && !shouldDisableInput) {
      sendMessage(inputValue);
      setInputValue('');
      // Reset textarea height after submission
      setTimeout(() => {
        resetTextareaHeight();
      }, 0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Reset idle timeout when user types
    resetIdleTimeout();
  };

  const handleYesNoClick = (response: 'Yes' | 'no_thanks') => {
    sendMessage(response);
    // Remove the yes/no message from the list to re-enable input
    setMessages(prev => prev.filter(msg => !(msg.type === 'ui' && msg.ui_type === 'email')));
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!emailValue.trim()) {
        toast({
          title: "Email Required",
          description: "Please enter your email address",
          variant: "destructive",
        });
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailValue.trim())) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }
      
      // Send the email as a user message
      sendMessage(emailValue.trim());
      
      // Clear the email input
      setEmailValue('');
      
      // Remove the email UI message to unlock main input
      setMessages(prev => prev.filter(msg => !(msg.type === 'ui' && msg.ui_type === 'email')));
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!chatServiceRef.current || !isConnected || shouldDisableInput) {
      toast({
        title: "Not connected",
        description: "Cannot send message while disconnected",
        variant: "destructive",
      });
      return;
    }
    
    sendMessage(suggestion);
  };

  const handleRestart = () => {

    if (onRestart) {
      onRestart();
    }
    // Set restarting flag
    restartingRef.current = true;
    
    // Completely reset the chat state
    setMessages([]);
    setShowTypingIndicator(false);
    setSystemMessage('');
    setConnectionError(null);
    setIsInitializing(true);
    setIsConnected(false);
    
    // Reset terms acceptance on restart
    setTermsAccepted(false);
    
    // Clear processed message IDs and reset sequence
    processedMessageIds.current.clear();
    messageSequenceRef.current = 0;
    
    // Clear idle timers and reset flags
    clearIdleTimers();
    isTimeoutQuestionSentRef.current = false;
    
    // Properly disconnect and cleanup existing connection
    if (chatServiceRef.current) {
      chatServiceRef.current.disconnect();
      chatServiceRef.current = null;
    }
    
    // Create a completely new connection after a longer delay to ensure cleanup
    setTimeout(() => {
      if (agentId) {
        console.log("Restarting ChatWebSocketService with agent ID:", agentId);
        
        chatServiceRef.current = new ChatWebSocketService(agentId, "preview");
        
        chatServiceRef.current.on({
          onMessage: (message) => {
            console.log("Restart - Received message:", message);
            
            // Skip if we're still in restarting state
            if (restartingRef.current) {
              console.log("Still restarting, skipping message");
              return;
            }
            
            // Handle system messages for typing indicator
            if (message.type === 'system_message') {
              setSystemMessage(message.content);
              setShowTypingIndicator(true);
              return;
            }
            
            const messageId = generateUniqueMessageId(message);
            
            if (processedMessageIds.current.has(messageId)) {
              console.log("Duplicate message detected during restart, skipping:", messageId);
              return;
            }
            
            processedMessageIds.current.add(messageId);
            setShowTypingIndicator(false);
            setSystemMessage('');
            setMessages(prev => [...prev, { ...message, messageId }]); 
          },
          onTypingStart: () => {
            console.log("Restart - Typing indicator started");
            if (!restartingRef.current) {
              setShowTypingIndicator(true);
            }
          },
          onTypingEnd: () => {
            console.log("Restart - Typing indicator ended");
            setShowTypingIndicator(false);
            setSystemMessage('');
          },
          onError: (error) => {
            console.error('Restart - Chat error:', error);
            setConnectionError(error);
            setIsConnected(false);
            setIsInitializing(false);
            restartingRef.current = false;
          },
          onConnectionChange: (status) => {
            console.log("Restart - Connection status changed:", status);
            setIsConnected(status);
            setIsInitializing(false);
            if (status) {
              setConnectionError(null);
              // Clear restarting flag once connected
              setTimeout(() => {
                restartingRef.current = false;
              }, 1000);
            }
          },
          ...(enableSessionStorage && onSessionIdReceived && {
            onSessionIdReceived: onSessionIdReceived
          })
        });
        
        chatServiceRef.current.connect();
      }
    }, 1000);
  };

  const getMessageStyling = (messageType: string) => {
    switch (messageType) {
      case 'bot_response':
        return {
          containerClass: 'bg-gray-100',
          textClass: 'text-gray-800'
        };
      case 'user':
        return {
          containerClass: 'text-white border border-transparent',
          textClass: 'text-white',
          style: { 
            background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -30)})`,
            color: secondaryColor
          }
        };
      case 'system_message':
        return {
          containerClass: `border shadow-sm`,
          textClass: 'text-blue-800',
          style: {
            backgroundColor: `${primaryColor}10`,
            borderColor: `${primaryColor}30`
          }
        };
      default:
        return {
          containerClass: 'text-white border border-transparent shadow-md',
          textClass: 'text-white',
          style: { 
            background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -30)})`,
            color: secondaryColor
          }
        };
    }
  };

  const handleMinimizeToggle = () => {
    if (onMinimize) {
      onMinimize();
    } else {
      setIsMinimized(!isMinimized);
    }
  };

  const handleExpand = () => {
    setIsMinimized(false);
  };

  // Handle end chat confirmation
  const handleEndChat = () => {
    if (!chatServiceRef.current || !isConnected) {
      return;
    }

    try {
      // Send timeout message to backend
      chatServiceRef.current.send({
        type: 'timeout',
        message: '',
        agentId: agentId || '',
        sessionId: sessionId || '',
        timestamp: Date.now()
      });
      
      setShowEndChatConfirmation(false);
      setShowFeedbackForm(true);
      clearIdleTimers();
    } catch (error) {
      console.error('Error ending chat:', error);
      toast({
        title: "Error",
        description: "Failed to end chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle feedback close
  const handleFeedbackClose = () => {
    setShowFeedbackForm(false);
    setFeedbackRating(0);
    setFeedbackText('');
  };

  // Handle feedback submission
  const handleFeedbackSubmit = () => {
    if (!chatServiceRef.current || !isConnected) {
      return;
    }

    try {
      // Send feedback message to backend
      chatServiceRef.current.send({
        type: 'feedback',
        content: JSON.stringify({
          rating: feedbackRating,
          text: feedbackText
        }),
        message: '',
        agentId: agentId || '',
        sessionId: sessionId || '',
        timestamp: Date.now()
      });
      
      // Clear messages locally and hide feedback form
      setMessages([]);
      processedMessageIds.current.clear();
      setShowFeedbackForm(false);
      setFeedbackRating(0);
      setFeedbackText('');
      
      toast({
        title: "Feedback Sent",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Enhanced floating button positioning - both chat and button always visible
  if (showFloatingButton) {
    const hasButtonText = buttonText && buttonText.trim() !== '';
    const iconSize = hasButtonText ? 24 : 36; // 1.5x larger when no text (24 * 1.5 = 36)
    
    return (
      <div className="relative w-full h-full">
        {/* Chat window - positioned above the button with generous gap */}
        {!isMinimized && (
          <div className="absolute bottom-28 right-4 w-80 h-80">
            <Card 
              className={cn(
                "flex flex-col backdrop-blur-sm h-full animate-scale-in"
              )}
              style={{ 
                fontFamily: fontFamily,
                boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px ${primaryColor}20, 0 8px 32px ${primaryColor}15`,
                border: `1px solid ${primaryColor}10`,
              }}
            >
              {/* Header */}
              <div 
                className="p-5 rounded-t-xl flex items-center justify-between relative overflow-hidden flex-shrink-0"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -30)}, ${adjustColor(primaryColor, -50)})`
                }}
              >
                {/* Modern gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="relative">
                    <div className="flex items-center justify-center overflow-hidden bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 border border-white/30">
                      {avatarSrc ? (
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                          <AvatarFallback className="text-white bg-transparent">
                            <User2 size={24} />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <MessageCircleReplyIcon size={24} className="text-white drop-shadow-sm" />
                      )}
                    </div>
                    {/* Online indicator */}
                    {isConnected && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white text-lg drop-shadow-sm" style={{color:`${secondaryColor} !important`}}>{chatbotName}</span>
                    <span className="text-white/80 text-sm">
                      {isConnected ? 'Online' : 'Connecting...'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 relative z-10">
                  {/* Menu dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                        title="Menu"
                        icon={MoreHorizontal}
                        iconOnly
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="bg-white border border-gray-200 shadow-lg z-[9999] min-w-[150px]"
                      sideOffset={5}
                    >
                      <DropdownMenuItem 
                        onClick={handleRestart}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <RotateCcw size={16} />
                        Restart chat
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setShowEndChatConfirmation(true)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-red-600"
                      >
                        <MessageCircle size={16} />
                        End chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <ModernButton
                    onClick={handleMinimizeToggle}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                    title="Minimize chat"
                    icon={Minus}
                    iconOnly
                  />
                  
                  {isInitializing ? (
                    <LoadingSpinner size="sm" className="text-white/70" />
                  ) : connectionError ? (
                    <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-full border border-red-300/30 backdrop-blur-sm">
                      <AlertCircle size={14} className="text-white/90" />
                      <span className="text-xs text-white/90 font-medium">Error</span>
                    </div>
                  ) : !isConnected ? (
                    <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1.5 rounded-full border border-orange-300/30 backdrop-blur-sm">
                      <WifiOff size={14} className="text-white/90" />
                      <span className="text-xs text-white/90 font-medium">Disconnected</span>
                    </div>
                  ) : null}
                </div>
              </div>
              
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-h-0 relative">
                {/* Messages Area */}
                <ScrollArea 
                  ref={scrollAreaRef}
                  className="flex-1 min-h-0"
                >
                  <div className="p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white min-h-full">
                    {connectionError && (
                      <div className="flex items-center gap-3 p-4 bg-red-50/80 border border-red-200/60 rounded-xl backdrop-blur-sm">
                        <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                        <span className="text-sm text-red-800">Connection failed. Please check your agent configuration.</span>
                      </div>
                    )}
                    
                    {/* Welcome Message - Only show if welcomeMessage has content */}
                    {welcomeMessage && welcomeMessage.trim() && (
                      <div className="animate-fade-in">
                        <div 
                          className="border rounded-lg p-3 text-left"
                          style={{
                            backgroundColor: `${primaryColor}05`,
                            borderColor: `${primaryColor}20`
                          }}
                        >
                          <div className="text-xs italic text-gray-600 leading-relaxed text-left">
                            <ReactMarkdown>{welcomeMessage}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Regular Messages */}
                    {messages.map((message, index) => {
                      const styling = getMessageStyling(message.type);
                      const isConsecutive = index > 0 && messages[index - 1]?.type === message.type;
                      
                      return (
                        <div key={message.messageId || index} className={isConsecutive ? 'mt-2' : 'mt-4'}>
                          {message.type !== 'ui' && (
                            <div 
                              className={`flex gap-4 items-start ${message.type === 'user' ? 'justify-end' : message.type === 'bot_response' ? 'justify-start' : 'justify-center'}`}
                              style={{
                                animation: 'messageSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                              }}
                            >
                              <div
                                className={cn(
                                  "rounded-2xl p-4 max-w-[92%] relative transition-all duration-300",
                                  styling.containerClass,
                                  styling.textClass
                                )}
                                style={{
                                  ...styling.style,
                                  transform: 'scale(1)',
                                  willChange: 'auto'
                                }}
                              >
                                <div className="text-sm prose prose-sm max-w-none markdown-content">
                                  <ReactMarkdown
                                    components={{
                                      code({ node, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const language = match ? match[1] : '';
                                        
                                        const isInline = !match && children.toString().split('\n').length === 1;
                                        
                                        if (isInline) {
                                          return (
                                            <code
                                              className="px-2 py-1 rounded-none bg-gray-100/80 font-mono text-sm !border-0"
                                              {...props}
                                            >
                                              {children}
                                            </code>
                                          );
                                        }

                                        return (
                                          <div className="relative my-3">
                                            {language && (
                                              <div 
                                                className="absolute top-0 right-0 px-3 py-1 text-xs rounded-bl-lg font-mono text-white z-10"
                                                style={{ backgroundColor: '#3b82f6' }}
                                              >
                                                {language}
                                              </div>
                                            )}
                                            <pre className="!mt-0 !bg-gray-50/80 border border-gray-200/60 rounded-xl overflow-x-auto backdrop-blur-sm">
                                              <code className="block p-4 text-sm font-mono" {...props}>
                                                {children}
                                              </code>
                                            </pre>
                                          </div>
                                        );
                                      },
                                      ul({ children }) {
                                        return <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>;
                                      },
                                      ol({ children }) {
                                        return <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>;
                                      },
                                      a({ children, href }) {
                                        return (
                                          <a
                                            href={href}
                                            className="underline transition-colors hover:opacity-80"
                                            style={{ color: message.type === 'user' ? 'inherit' : '#3b82f6' }}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            {children}
                                          </a>
                                        );
                                      },
                                      p({children}){
                                        return message.type === 'system_message' ? (
                                          <p style={{fontSize:"12px", fontWeight: "500"}}>{children}</p>
                                        ) : (<p className="leading-relaxed">{children}</p>)
                                      }
                                    }}
                                  >
                                    {message.content} 
                                  </ReactMarkdown>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Yes/No UI Component working one*/}
                          {message.type === 'ui' && message.ui_type === 'email' && (
                            <div className="flex flex-col gap-3 justify-center animate-fade-in">
                              <form onSubmit={handleEmailSubmit} className='relative'>
                                <Input
                                variant='modern'
                                placeholder={emailPlaceholder}
                                size='sm'
                                type='email'
                                value={emailValue}
                                onChange={(e) => setEmailValue(e.target.value)}
                                required
                                className='dark:bg-white dark:text-neutral-900'
                                />
                                <ModernButton 
                                  type="submit" 
                                  size="sm" 
                                  variant='ghost'
                                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                  iconOnly
                                  disabled={!emailValue.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)}
                                >
                                  <Send className="h-4 w-4" color={primaryColor}/>
                                </ModernButton>
                              </form>
                              <ModernButton
                                onClick={() => handleYesNoClick('no_thanks')}
                                variant="ghost"
                                className="font-medium border-2 w-auto"
                                style={{ 
                                  borderColor: primaryColor,
                                  color: primaryColor,
                                  backgroundColor: 'white'
                                }}
                              >
                                No Thanks
                              </ModernButton>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Suggestions - only show if we have few messages and no pending UI components */}
                    {messages.length === 0 && suggestions && suggestions.length > 0 && !shouldDisableInput && (
                      <div className="flex flex-col gap-3 mt-6 animate-fade-in">
                        <p className="text-xs text-gray-500 mb-2 font-medium">Suggested questions:</p>
                        {suggestions.filter(Boolean).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-sm text-left px-4 py-3 rounded-xl transition-all hover:scale-[1.02] border bg-white hover:bg-gray-50 hover:shadow-md"
                            style={{ 
                              border: `1px solid ${primaryColor}20`,
                              backgroundColor: 'white',
                              color: 'inherit',
                              animation: `suggestionSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards ${index * 0.1}s both`
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Updated Typing Indicator - positioned appropriately for smaller chat */}
                {showTypingIndicator && (
                  <div 
                    className="absolute bottom-[100px] left-4 flex items-center gap-2 z-20"
                    style={{
                      animation: 'typingBounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards'
                    }}
                  >
                    {/* Smaller Avatar (2x smaller) */}
                    <div className="flex-shrink-0">
                      {avatarSrc ? (
                        <Avatar className="w-5 h-5 border border-white">
                          <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                          <AvatarFallback style={{ 
                            background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -30)})`,
                            color: secondaryColor
                          }}>
                            <User2 size={10} />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center border border-white"
                          style={{ 
                            background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -30)})`,
                            color: secondaryColor
                          }}
                        >
                          <User2 size={10} />
                        </div>
                      )}
                    </div>

                    {/* Smaller Typing Dots Container */}
                    <div 
                      className="rounded-full px-2 py-1 border border-gray-200/60 bg-white shadow-sm flex items-center gap-1"
                    >
                      <div className="flex space-x-1">
                        <div 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ 
                            backgroundColor: `${primaryColor}60`,
                            animation: 'typingDotBounce 1.4s ease-in-out infinite',
                            animationDelay: '0ms'
                          }}
                        ></div>
                        <div 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ 
                            backgroundColor: `${primaryColor}60`,
                            animation: 'typingDotBounce 1.4s ease-in-out infinite',
                            animationDelay: '200ms'
                          }}
                        ></div>
                        <div 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ 
                            backgroundColor: `${primaryColor}60`,
                            animation: 'typingDotBounce 1.4s ease-in-out infinite',
                            animationDelay: '400ms'
                          }}
                        ></div>
                      </div>

                      {/* System Message Display */}
                      {systemMessage && (
                        <div className="ml-2 text-xs text-gray-600 font-medium animate-fade-in">
                          {systemMessage}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
        {/* End Chat Confirmation */}
        {showEndChatConfirmation && (
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <div className="text-center">
              <div className="mb-3 p-3 rounded-full bg-gray-100 mx-auto w-fit">
                <MessageCircle className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">End chat</h3>
              <p className="text-sm text-gray-600 mb-4">Do you want to end this chat?</p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleEndChat}
                  className="w-full bg-black hover:bg-gray-800 text-white rounded-lg py-3 text-sm font-medium"
                >
                  Yes, end chat
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEndChatConfirmation(false)}
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg py-3 text-sm font-medium"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Form */}
        {showFeedbackForm && (
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <div className="text-center relative">
              <button
                onClick={handleFeedbackClose}
                className="absolute right-0 top-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How was your experience?</h3>
              
              {/* Star Rating */}
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    className={`transition-colors ${
                      feedbackRating >= star ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400`}
                  >
                    <Star size={24} fill={feedbackRating >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              
              {/* Feedback Text */}
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us about your experience (optional)"
                className="w-full mb-4 resize-none"
                rows={3}
              />
              
              {/* Submit Button */}
              <Button
                onClick={handleFeedbackSubmit}
                className="w-full bg-black hover:bg-gray-800 text-white rounded-lg py-3 text-sm font-medium"
                disabled={feedbackRating === 0}
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        )}
                
        {/* Terms and Conditions */}
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Checkbox 
              id="terms-acceptance"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              className="h-4 w-4"
            />
            <label htmlFor="terms-acceptance" className="cursor-pointer leading-relaxed">
              By chatting you accept our{' '}
              <a 
                href="#" 
                className="underline hover:text-gray-800 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                terms and conditions
              </a>
              .
            </label>
          </div>
        </div>

        {/* Message Input - With integrated send button */}
        <div className="border-t border-gray-100 p-4 bg-white/80 backdrop-blur-sm flex-shrink-0">
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              placeholder={
                !termsAccepted 
                  ? "" 
                  : (shouldDisableInput && !showFeedbackForm)
                    ? "Please select Yes or No above..." 
                    : "Type your message..."
              }
              className="text-sm border-2 focus-visible:ring-offset-0 dark:bg-white rounded-xl transition-all duration-200 resize-none overflow-hidden pr-12"
              style={{ 
                borderColor: `${primaryColor}20`,
                minHeight: "44px",
                maxHeight: "120px"
              }}
              disabled={!isConnected || shouldDisableInput || !termsAccepted}
              rows={1}
              expandable={true}
              maxExpandedHeight="120px"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !shouldDisableInput && termsAccepted) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all hover:scale-105"
              style={{ 
                color: primaryColor,
                opacity: (isConnected && !shouldDisableInput && inputValue.trim() && termsAccepted) ? 1 : 0.4
              }}
              disabled={!isConnected || shouldDisableInput || !inputValue.trim() || !termsAccepted}
            >
              <Send size={20} />
            </button>
          </form>
          <div className="text-center mt-3 text-xs text-gray-400 font-medium">
            powered by 7en.ai
          </div>
        </div>
              </div>
              
              {/* Enhanced CSS Animations */}
              <style>
                {`
                  @keyframes messageSlideUp {
                    0% {
                      transform: translateY(20px) scale(0.96);
                      opacity: 0;
                    }
                    60% {
                      transform: translateY(-2px) scale(1.01);
                      opacity: 0.8;
                    }
                    100% {
                      transform: translateY(0) scale(1);
                      opacity: 1;
                    }
                  }
                  
                  @keyframes chatboxExpand {
                    0% {
                      transform: scale(0.1);
                      opacity: 0;
                    }
                    100% {
                      transform: scale(1);
                      opacity: 1;
                    }
                  }
                  
                  @keyframes typingBounceIn {
                    0% {
                      transform: translateY(60px) scale(0.3);
                      opacity: 0;
                    }
                    50% {
                      transform: translateY(-8px) scale(1.1);
                      opacity: 0.8;
                    }
                    100% {
                      transform: translateY(0) scale(1);
                      opacity: 1;
                    }
                  }

                  @keyframes typingBounceOut {
                    0% {
                      transform: translateY(0) scale(1);
                      opacity: 1;
                    }
                    50% {
                      transform: translateY(-8px) scale(1.1);
                      opacity: 0.8;
                    }
                    100% {
                      transform: translateY(60px) scale(0.3);
                      opacity: 0;
                    }
                  }
                  
                  @keyframes typingDotBounce {
                    0%, 60%, 100% {
                      transform: translateY(0) scale(1);
                      opacity: 0.4;
                    }
                    30% {
                      transform: translateY(-4px) scale(1.2);
                      opacity: 1;
                    }
                  }
                  
                  @keyframes suggestionSlideIn {
                    0% {
                      transform: translateX(-20px) scale(0.95);
                      opacity: 0;
                    }
                    100% {
                      transform: translateX(0) scale(1);
                      opacity: 1;
                    }
                  }
                  
                  .animate-chatbox-expand {
                    animation: chatboxExpand 0.3s ease-out forwards;
                  }
                `}
              </style>
            </Card>
          </div>
        )}

        {/* Floating button - always visible at bottom-right with proper styling */}
        <ModernButton
          onClick={isMinimized ? handleExpand : handleMinimizeToggle}
          className={`absolute bottom-4 right-4 z-50 ${hasButtonText ? 'rounded-full px-6 py-4 h-auto' : 'rounded-full w-16 h-16 p-0'} shadow-2xl hover:scale-110 transition-all duration-300 border-4 border-white/30 group relative overflow-hidden`}
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -30)})`,
            boxShadow: `0 10px 30px rgba(59, 130, 246, 0.5), 0 5px 15px rgba(59, 130, 246, 0.4)`,
            fontFamily: fontFamily,
            borderRadius: "40px"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex items-center gap-2">
            {avatarSrc ? (
              <Avatar className={hasButtonText ? "w-6 h-6" : "w-9 h-9"}>
                <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                <AvatarFallback className="text-white bg-transparent">
                  <Bot size={hasButtonText ? 16 : 24} />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Bot className="text-white" size={iconSize} />
            )}
            {hasButtonText && (
              <span className="text-white font-medium text-sm">
                {buttonText}
              </span>
            )}
          </div>
        </ModernButton>
      </div>
    );
  }

  return (
    <Card 
      className={cn(
        "flex flex-col backdrop-blur-sm relative dark:bg-white",
        showFloatingButton && !isMinimized ? "animate-chatbox-expand" : "animate-scale-in",
        className
      )}
      style={{ 
        fontFamily: fontFamily,
        height: '100%',
        boxShadow: `0`,
        border: `none`,
        transformOrigin: showFloatingButton ? (position === 'bottom-left' ? 'bottom left' : 'bottom right') : 'center',
        borderRadius: "8px"
      }}
    >
      {/* Header */}
      <div 
        className="p-4 rounded-t-xl flex items-center justify-between relative overflow-hidden flex-shrink-0 py-5"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -30)}, ${adjustColor(primaryColor, -50)})`
        }}
      >
        {/* Modern gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <div className="flex items-center justify-center overflow-hidden bg-white/20 backdrop-blur-sm rounded-full w-8 h-8">
              {avatarSrc ? (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                  <AvatarFallback className="text-white bg-transparent">
                    <Icon name={`Person`} type='plain' color='#000000' />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={window.location.origin+`/7en-thumbnail.png`} alt={chatbotName} className="object-cover" />
                  <AvatarFallback className="text-white bg-transparent">
                    <Icon name={`Person`} type='plain' color='#000000' />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            {/* Online indicator */}
           
          </div>
          <div className="flex flex-col">
            <span className="font-normal text-white text-lg drop-shadow-sm" style={{color: secondaryColor}}>{chatbotName}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 relative z-10">
          {/* Menu dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ModernButton
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/20 text-white/80 hover:text-white transition-colors dark:hover:bg-white/20"
                title="Menu"
                icon={MoreHorizontal}
                style={{
                  color: `${secondaryColor}80`
                }}
                iconOnly
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="bg-white dark:bg-white border border-gray-200 shadow-lg z-[9999] min-w-[150px] dark:!border-white"
              sideOffset={5}
            >
              <DropdownMenuItem 
                onClick={handleRestart}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer dark:hover:!bg-neutral-100 dark:!text-neutral-900"
              >
                <RotateCcw size={16} />
                Restart chat
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowEndChatConfirmation(true)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-red-600 dark:hover:!bg-neutral-100"
              >
                <MessageCircle size={16} />
                End chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* {(onMinimize || showFloatingButton) && (
            <ModernButton
              onClick={handleMinimizeToggle}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Minimize chat"
              icon={Minus}
              style={{
                color: `${secondaryColor}80`
              }}
              iconOnly
            />
          )} */}
          
          {isInitializing ? (
            <LoadingSpinner size="sm" className="text-white/70" />
          ) : connectionError ? (
            <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-full border border-red-300/30 backdrop-blur-sm">
              <AlertCircle size={14} className="text-white/90" />
              <span className="text-xs text-white/90 font-medium">Error</span>
            </div>
          ) : !isConnected ? (
            <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1.5 rounded-full border border-orange-300/30 backdrop-blur-sm">
              <WifiOff size={14} className="text-white/90" />
              <span className="text-xs text-white/90 font-medium">Disconnected</span>
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative" style={{overflow:"hidden",borderRadius:"0 0 8px 8px"}}>
        {/* Messages Area */}
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 min-h-0"
        >
          <div className="p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white min-h-full mb-5">
            {connectionError && (
              <div className="flex items-center gap-3 p-4 bg-red-50/80 border border-red-200/60 rounded-xl backdrop-blur-sm">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-800">Connection failed. Please check your agent configuration.</span>
              </div>
            )}
            
            {/* Welcome Message - Only show if welcomeMessage has content */}
            {welcomeMessage && welcomeMessage.trim() && (
              <div className="animate-fade-in">
                <div 
                  className="border rounded-lg p-3 text-left"
                  style={{
                    backgroundColor: `${primaryColor}05`,
                    borderColor: `${primaryColor}20`
                  }}
                >
                  <div className="text-xs italic text-gray-600 leading-relaxed text-left">
                    <ReactMarkdown>{welcomeMessage}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
            
            {/* Regular Messages */}
            {messages.map((message, index) => {
              const styling = getMessageStyling(message.type);
              const isConsecutive = index > 0 && messages[index - 1]?.type === message.type;
              
              return (
                <div key={message.messageId || index} className={`${isConsecutive ? '!mt-2' : 'mt-4'}`}>
                  {message.type !== 'ui' && (
                    <div 
                      className={`flex gap-4 items-start ${message.type === 'user' ? 'justify-end' : message.type === 'bot_response' ? 'justify-start' : 'justify-end'}`}
                      style={{
                        animation: 'messageSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                      }}
                    >
                      <div
                        className={cn(
                          `rounded-[20px] p-4 max-w-[92%] relative transition-all duration-300 ${message.type === 'user' ? "!py-2 rounded-br-sm" : !isConsecutive ? "rounded-bl-sm" : "rounded-tl-sm"}`,
                          styling.containerClass,
                          styling.textClass
                        )}
                        style={{
                          ...styling.style,
                          transform: 'scale(1)',
                          willChange: 'auto'
                        }}
                      >
                        {
                          message.type == 'bot_response' && !isConsecutive && (
                            <div className='flex items-center gap-2 bot mb-1'>

                              <Avatar className="w-4 h-4">
                                <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                                <AvatarFallback style={{ 
                                  background: ``,
                                  color: '#fff'
                                }} className='bg-transparent'>
                                  <Icon name={`Person`} type='plain' color='#000000' className='h-4 w-4' />
                                </AvatarFallback>
                              </Avatar>
                              <p className='text-sm font-semibold'>{chatbotName}</p>
                            </div>
                          )
                        }
                        <div className="text-sm prose prose-sm max-w-none markdown-content">
                          <ReactMarkdown
                            components={{
                              code({ node, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const language = match ? match[1] : '';
                                
                                const isInline = !match && children.toString().split('\n').length === 1;
                                
                                if (isInline) {
                                  return (
                                    <code
                                      className="px-2 py-1 rounded-md bg-gray-100/80 font-mono text-xs border-0 font-normal"
                                      style={{ color: primaryColor }}
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  );
                                }

                                return (
                                  <div className="my-4 w-full p-0">
                                    <SyntaxHighlighter
                                      style={oneLight}
                                      language={language || 'text'}
                                      PreTag="div"
                                      className="rounded-lg border text-sm"
                                      customStyle={{
                                        margin: 0,
                                        borderColor:'#f4f4f4',
                                        backgroundColor: '#f3f3f3',
                                      }}
                                      codeTagProps={{
                                        style: {
                                          fontSize: '0.723rem',
                                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", "Segoe UI Mono", "Courier New", monospace',
                                        }
                                      }}
                                      wrapLongLines={true}
                                      showInlineLineNumbers={true}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  </div>
                                );
                              },
                              ul({ children }) {
                                return <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>;
                              },
                              ol({ children }) {
                                return <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>;
                              },
                              a({ children, href }) {
                                return (
                                  <a
                                    href={href}
                                    className="underline transition-colors hover:opacity-80"
                                    style={{ color: message.type === 'user' ? 'inherit' : '#3b82f6' }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {children}
                                  </a>
                                );
                              },
                              p({children}){
                                return message.type === 'system_message' ? (
                                  <p style={{fontSize:"12px", fontWeight: "500"}}>{children}</p>
                                ) : (<p className="leading-relaxed">{children}</p>)
                              }
                            }}
                          >
                            {message.content} 
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {message.type === 'ui' && message.ui_type === 'email' && (
                    <div className="flex flex-col gap-3 justify-center animate-fade-in rounded-2xl bg-gray-100/50 p-4">
                      <form onSubmit={handleEmailSubmit} className='relative'>
                        <Input
                        variant='modern'
                        placeholder={emailPlaceholder}
                        size='sm'
                        type='email'
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        required
                        className='dark:!bg-white dark:!text-neutral-900'
                        />
                        <ModernButton 
                          type="submit" 
                          size="sm" 
                          variant='ghost'
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 dark:hover:!bg-neutral-100"
                          iconOnly
                          disabled={!emailValue.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)}
                        >
                          <Send className="h-4 w-4" color={primaryColor}/>
                        </ModernButton>
                      </form>
                      <ModernButton
                        onClick={() => handleYesNoClick('no_thanks')}
                        variant="ghost"
                        className="font-medium border-2 w-auto"
                        style={{ 
                          border: 'none',
                          color: primaryColor,
                          backgroundColor: 'transparent'
                        }}
                      >
                        No Thanks
                      </ModernButton>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Suggestions - only show if we have few messages and no pending UI components */}
            {messages.length === 0 && suggestions && suggestions.length > 0 && !shouldDisableInput && (
              <div className="flex flex-col gap-3 mt-6 animate-fade-in">
                <p className="text-xs text-gray-500 mb-2 font-medium">Suggested questions:</p>
                {suggestions.filter(Boolean).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="inline-block w-fit text-xs text-left px-4 py-3 rounded-full transition-all border bg-white hover:!bg-gray-100"
                    style={{ 
                      border: `1px solid ${primaryColor}20`,
                      backgroundColor: 'white',
                      color: 'inherit',
                      animation: `suggestionSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards ${index * 0.1}s both`
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Updated Typing Indicator - positioned 115px from bottom (20+5px more) */}
        {showTypingIndicator && (
          <div 
            className="absolute bottom-[115px] left-4 flex items-center gap-2 z-20"
            style={{
              animation: 'typingBounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards'
            }}
          >
            {/* Smaller Avatar (2x smaller) */}
            <div className="flex-shrink-0">
              {avatarSrc ? (
                <Avatar className="w-6 h-6">
                <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                <AvatarFallback style={{ 
                  background: ``,
                  color: '#fff'
                }} className='bg-transparent'>
                  <Icon name={`Person`} type='plain' color='#000000' />
                </AvatarFallback>
                </Avatar>
              ) : (
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center border border-white bg-transparent"
                  style={{ 
                    background: ``,
                    color: secondaryColor
                  }}
                >
                  <Icon name={`Person`} type='plain' color='#000000' />
                </div>
              )}
            </div>

            {/* Smaller Typing Dots Container */}
            <div 
              className="rounded-full px-2 py-1 border border-gray-200/60 bg-white shadow-sm flex items-center gap-1"
            >
              <div className="flex space-x-1">
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ 
                    backgroundColor: `${primaryColor}60`,
                    animation: 'typingDotBounce 1.4s ease-in-out infinite',
                    animationDelay: '0ms'
                  }}
                ></div>
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ 
                    backgroundColor: `${primaryColor}60`,
                    animation: 'typingDotBounce 1.4s ease-in-out infinite',
                    animationDelay: '200ms'
                  }}
                ></div>
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ 
                    backgroundColor: `${primaryColor}60`,
                    animation: 'typingDotBounce 1.4s ease-in-out infinite',
                    animationDelay: '400ms'
                  }}
                ></div>
              </div>

              {/* System Message Display */}
              {systemMessage && (
                <div className="ml-2 text-xs text-gray-600 font-medium animate-fade-in">
                  {systemMessage}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* End Chat Confirmation */}
        {showEndChatConfirmation && (
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <div className="text-center">
              <div className="mb-3 p-3 rounded-full bg-transparent mx-auto w-fit">
                <Icon name={`Bubbles`} type='plain' color='#000000' />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">End chat</h3>
              <p className="text-sm text-gray-600 mb-4">Do you want to end this chat?</p>
              <div className="flex flex-col gap-2">
                <ModernButton
                  onClick={handleEndChat}
                  variant='primary'
                  size='sm'
                  className="w-full bg-black hover:bg-gray-800 text-white rounded-lg py-3 text-sm font-medium"
                >
                  Yes, end chat
                </ModernButton>
                <ModernButton
                  variant="outline"
                  onClick={() => setShowEndChatConfirmation(false)}
                  size='sm'
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg py-3 text-sm font-medium"
                >
                  No
                </ModernButton>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Form */}
        {showFeedbackForm && (
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <div className="text-center relative">
              <button
                onClick={handleFeedbackClose}
                className="absolute right-0 top-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How was your experience?</h3>
              
              {/* Star Rating */}
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    className={`transition-colors ${
                      feedbackRating >= star ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400`}
                  >
                    <Star size={24} fill={feedbackRating >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              
              {/* Feedback Text */}
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us about your experience (optional)"
                className="w-full mb-4 resize-none dark:bg-white dark:text-neutral-900"
                rows={3}
              />
              
              {/* Submit Button */}
              <Button
                onClick={handleFeedbackSubmit}
                className="w-full bg-black hover:bg-neutral-800 text-white rounded-lg py-3 text-sm font-medium"
                disabled={feedbackRating === 0}
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        )}
        
        {/* Terms and Conditions - Only show if not accepted */}
        {!termsAccepted && (
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Checkbox 
                id="terms-acceptance-main"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="h-4 w-4"
              />
              <label htmlFor="terms-acceptance-main" className="cursor-pointer leading-relaxed">
                By chatting, you accept our{' '}
                <a 
                  href="#" 
                  className="underline hover:text-gray-800 transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  terms and conditions
                </a>
                .
              </label>
            </div>
          </div>
        )}

        {/* Message Input - With integrated send button */}
        <div className="border-t border-gray-100 p-4 bg-white/80 backdrop-blur-sm flex-shrink-0">
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              placeholder={
                !termsAccepted 
                  ? "Type your message" 
                  : (shouldDisableInput && !showFeedbackForm)
                    ? "Please select Yes or No above..." 
                    : "Type your message..."
              }
              className="text-sm border-2 focus-visible:ring-offset-0 dark:bg-white dark:text-gray-700 dark:border-border rounded-xl transition-all duration-200 resize-none overflow-hidden pr-12"
              style={{ 
                borderColor: `${primaryColor}20`,
                minHeight: "44px",
                maxHeight: "120px"
              }}
              disabled={!isConnected || shouldDisableInput || !termsAccepted}
              rows={1}
              expandable={true}
              maxExpandedHeight="120px"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !shouldDisableInput && termsAccepted) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all hover:scale-105"
              style={{ 
                color: primaryColor,
                opacity: (isConnected && !shouldDisableInput && inputValue.trim() && termsAccepted) ? 1 : 0.4
              }}
              disabled={!isConnected || shouldDisableInput || !inputValue.trim() || !termsAccepted}
            >
              <Send size={20} />
            </button>
          </form>
          <div className="text-center mt-3 text-xs text-gray-400 font-medium">
            powered by 7en.ai
          </div>
        </div>
      </div>
      
      {/* Enhanced CSS Animations */}
      <style>
        {`
          @keyframes messageSlideUp {
            0% {
              transform: translateY(20px) scale(0.96);
              opacity: 0;
            }
            60% {
              transform: translateY(-2px) scale(1.01);
              opacity: 0.8;
            }
            100% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          
          @keyframes chatboxExpand {
            0% {
              transform: scale(0.1);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          @keyframes typingBounceIn {
            0% {
              transform: translateY(60px) scale(0.3);
              opacity: 0;
            }
            50% {
              transform: translateY(-8px) scale(1.1);
              opacity: 0.8;
            }
            100% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }

          @keyframes typingBounceOut {
            0% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
            50% {
              transform: translateY(-8px) scale(1.1);
              opacity: 0.8;
            }
            100% {
              transform: translateY(60px) scale(0.3);
              opacity: 0;
            }
          }
          
          @keyframes typingDotBounce {
            0%, 60%, 100% {
              transform: translateY(0) scale(1);
              opacity: 0.4;
            }
            30% {
              transform: translateY(-4px) scale(1.2);
              opacity: 1;
            }
          }
          
          @keyframes suggestionSlideIn {
            0% {
              transform: translateX(-20px) scale(0.95);
              opacity: 0;
            }
            100% {
              transform: translateX(0) scale(1);
              opacity: 1;
            }
          }
          
          .animate-chatbox-expand {
            animation: chatboxExpand 0.3s ease-out forwards;
          }
        `}
      </style>
    </Card>
  );
};

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
