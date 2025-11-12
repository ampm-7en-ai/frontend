import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bot, Send, User, WifiOff, AlertCircle, Minus, RotateCcw, MessageCircleReplyIcon, User2, MessageSquare, MoreHorizontal, MessageCircle, Star, X, Plus, Lock, Unlock } from 'lucide-react';
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
  source?: string;
  session_id?: string;
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
  retentionPeriod?: number;
  retentionMessage?: string;
  displayRetentionMessage?: boolean;
  privacyUrl?: string;
  isWhiteLabel?: boolean;
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
  sessionId,
  retentionPeriod,
  retentionMessage,
  displayRetentionMessage,
  privacyUrl,
  isWhiteLabel
}: ChatboxPreviewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [historyMessages, setHistoryMessages] = useState<Message[]>([]);
  const [historyTimestamp, setHistoryTimestamp] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const chatServiceRef = useRef<ChatWebSocketService | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoadingSessionMessages, setIsLoadingSessionMessages] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const processedMessageIds = useRef<Set<string>>(new Set());
  const restartingRef = useRef(false);
  const messageSequenceRef = useRef<number>(0);
  const outboxRef = useRef<Array<{ content: string; ts: number }>>([]);
  const [emailValue, setEmailValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Internal state for floating button mode
  const [isMinimized, setIsMinimized] = useState(initiallyMinimized);

  // Terms and conditions state
  const [termsAccepted, setTermsAccepted] = useState(false);

  // End chat confirmation and feedback states
  const [showEndChatConfirmation, setShowEndChatConfirmation] = useState(false);
  const [showDeleteChatConfirmation, setShowDeleteChatConfirmation] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [exportEmail, setExportEmail] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedFeedbackTemplate, setSelectedFeedbackTemplate] = useState<string>('');

  // Timeout functionality
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [timeoutQuestionSent, setTimeoutQuestionSent] = useState(false);

  // Dismissable states
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [showRetentionMessage, setShowRetentionMessage] = useState(true);
  const [showTermsAcceptance, setShowTermsAcceptance] = useState(true);
  
  // Privacy mode state
  const [isPrivateMode, setIsPrivateMode] = useState(false);

  // Check if input should be disabled (when there's a pending UI state)
  const shouldDisableInput = messages.some(msg => 
    msg.type === 'ui' && msg.ui_type === 'email'
  ) || showEndChatConfirmation || showFeedbackForm;

  // Get the latest yes/no message for displaying buttons
  const latestYesNoMessage = messages.slice().reverse().find(msg => 
    msg.type === 'ui' && msg.ui_type === 'email'
  );

  // Clear timeout
  const clearTimeouts = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  // Get the latest message
  const getLatestMessage = () => {
    if (messages.length === 0) return null;
    return messages[messages.length - 1];
  };

  // Start/restart timeout based on latest message
  const manageTimeout = () => {
    // Skip timeout management if we're loading session messages
    if (isLoadingSessionMessages) {
      console.log('📚 Skipping timeout management - session messages loading');
      return;
    }

    const latestMessage = getLatestMessage();
    if (!latestMessage) return;

    console.log('⏰ Managing timeout for latest message:', {
      type: latestMessage.type,
      content: latestMessage.content?.slice(0, 30),
      messageId: latestMessage.messageId
    });

    // If feedback form is already visible, clear timeouts and skip timeout management
    if (showFeedbackForm) {
      console.log('📝 Feedback form visible, clearing timeouts and skipping timeout management');
      clearTimeouts();
      setTimeoutQuestionSent(false);
      return;
    }

    // If latest message is from user, reset everything and don't start timer here
    if (latestMessage.type === 'user') {
      console.log('🔄 Latest message is from user, resetting timeout state');
      clearTimeouts();
      setShowFeedbackForm(false);
      setTimeoutQuestionSent(false);
      return;
    }

    // Only act on bot messages; do not restart timers if they're already running
    if (latestMessage.type === 'bot_response') {
      console.log('🤖 Latest message is from bot, evaluating timers');

      // If a timer is already running (first or second), don't restart
      if (timeoutId) {
        console.log('⏱️ A timeout is already active, continuing countdown');
        return;
      }

      // Start the appropriate timer depending on phase
      if (!timeoutQuestionSent) {
        console.log('⏰ Starting first 1-minute timeout to trigger timeout_question');
        const id = setTimeout(() => {
          console.log('⏰ First timeout reached, sending timeout_question');
          if (chatServiceRef.current && chatServiceRef.current.isConnected()) {
            chatServiceRef.current.send({
              type: 'timeout_question',
              message: '',
              agentId: agentId || '',
              sessionId: sessionId || '',
              timestamp: Date.now()
            });
          }
          setTimeoutQuestionSent(true);

          // Start second timeout for feedback form
          const secondId = setTimeout(() => {
            console.log('⏰ Second timeout reached, showing custom message and feedback form');
            const customMessage = {
              content:
                'Seems like you are offline. Start new chat whenever you are back. I am ending this session. Nice to talk with you.',
              type: 'bot_response',
              timestamp: new Date().toISOString(),
              messageId: `custom-offline-${Date.now()}`,
            };
            setMessages((prev) => [...prev, customMessage]);
            setShowFeedbackForm(true);
            setTimeoutId(null); // No active timers after showing feedback
          }, 60000); // 1 minute

          setTimeoutId(secondId);
        }, 60000); // 1 minute

        setTimeoutId(id);
      } else {
        // timeout_question already sent; if no timer running, start the second one
        console.log('⏳ timeout_question already sent; starting second timeout');
        const secondId = setTimeout(() => {
          console.log('⏰ Second timeout reached, showing custom message and feedback form');
          const customMessage = {
            content:
              'Seems like you are offline. Start new chat whenever you are back. I am ending this session. Nice to talk with you.',
            type: 'bot_response',
            timestamp: new Date().toISOString(),
            messageId: `custom-offline-${Date.now()}`,
          };
          setMessages((prev) => [...prev, customMessage]);
          setShowFeedbackForm(true);
          setTimeoutId(null);
        }, 60000); // 1 minute

        setTimeoutId(secondId);
      }
    }
  };

  // Reset timeout completely on user activity (typing or sending a message)
  const resetTimeoutOnUserActivity = () => {
    console.log('🔄 User activity detected, resetting entire timeout flow');
    clearTimeouts();
    setShowFeedbackForm(false);
    setTimeoutQuestionSent(false);
  };

  // Effect to manage timeout based on messages
  useEffect(() => {
    manageTimeout();
  }, [messages]);

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
    // Use existing messageId if available (from database)
    if (message.messageId) {
      console.log('🆔 Using existing messageId:', message.messageId, 'Source:', message.source);
      return message.messageId;
    }
    
    // For database messages, create a stable ID based on content and timestamp
    if (message.source === 'database' || message.session_id) {
      const stableId = `db-${message.session_id || sessionId}-${message.content?.slice(0, 20) || message.type}-${message.timestamp}`;
      console.log('🗄️ Generated database messageId:', stableId);
      return stableId;
    }
    
    // For real-time messages, create a sequence-based ID
    messageSequenceRef.current += 1;
    const contentHash = (message.content || '').slice(0, 20).replace(/\s+/g, '-');
    const realtimeId = `rt-${message.type}-${contentHash}-${messageSequenceRef.current}-${Date.now()}`;
    console.log('🔄 Generated real-time messageId:', realtimeId, 'Source:', message.source);
    return realtimeId;
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
        console.log("📥 Received message:", message, "Source:", message.source);
        
        // Skip if we're in the middle of restarting
        if (restartingRef.current) {
          console.log("⏭️ Skipping message during restart");
          return;
        }
        
        // Handle history messages
        if (message.type === 'history') {
          console.log("📚 History data received:", message);
          const historyData = message as any;
          if (historyData.messages && Array.isArray(historyData.messages)) {
            const historyMsgs = historyData.messages.map((msg: any, idx: number) => ({
              type: msg.type === 'message' ? 'user' : msg.type,
              content: msg.content,
              timestamp: msg.timestamp,
              messageId: `history-${msg.timestamp}-${idx}`,
              source: 'history'
            }));
            setHistoryMessages(historyMsgs);
            setHistoryTimestamp(historyData.timestamp);
            console.log("📚 History messages set:", historyMsgs.length);
          }
          return;
        }
        
        // Handle system messages for typing indicator
        if (message.type === 'system_message') {
          setSystemMessage(message.content);
          setShowTypingIndicator(true);
          return;
        }

        // Normalize type to avoid 'message' vs 'user' mismatch
        const normalizedType = message.type === 'message' ? 'user' : (message.type === 'assistant' ? 'bot_response' : message.type);
        const messageForProcessing = { ...message, type: normalizedType };

        // Skip immediate echo of user's own message from server
        const latest = getLatestMessage();
        if (
          normalizedType === 'user' &&
          latest &&
          latest.type === 'user' &&
          (latest.content || '').trim() === (messageForProcessing.content || '').trim()
        ) {
          console.log('🔁 Skipping echoed user message from server');
          return;
        }
        
        // Generate unique message ID for enhanced deduplication (using normalized type)
        const messageId = generateUniqueMessageId(messageForProcessing);
        
        // Enhanced deduplication check with detailed logging
        if (processedMessageIds.current.has(messageId)) {
          console.log("⚠️ Duplicate message detected, skipping:", {
            messageId,
            content: messageForProcessing.content?.slice(0, 50),
            type: messageForProcessing.type,
            source: messageForProcessing.source,
            sessionId: messageForProcessing.session_id
          });
          return;
        }
        
        console.log("✅ Processing new message:", {
          messageId,
          type: messageForProcessing.type,
          source: messageForProcessing.source,
          content: messageForProcessing.content?.slice(0, 50),
          sessionId: messageForProcessing.session_id
        });
        
        // Add to processed set
        processedMessageIds.current.add(messageId);
        
        // Limit processed IDs size to prevent memory leaks
        if (processedMessageIds.current.size > 200) {
          const idsArray = Array.from(processedMessageIds.current);
          processedMessageIds.current = new Set(idsArray.slice(-100));
          console.log("🧹 Cleaned up processed message IDs");
        }
        
        // Clear typing indicator and system message
        setShowTypingIndicator(false);
        setSystemMessage('');
        
        // Track different message sources
        if (messageForProcessing.source === 'database') {
          console.log('📚 Database message loaded');
        } else if (messageForProcessing.source === 'websocket') {
          console.log('🔄 Real-time message received');
        }
        
        // Add message to state with outbox-aware deduplication
        setMessages(prev => {
          if (messageForProcessing.type === 'user') {
            const trimmed = (messageForProcessing.content || '').trim();
            const cutoff = Date.now() - 60000;
            const match = outboxRef.current.find(o => o.content === trimmed && o.ts >= cutoff);
            if (match) {
              // Replace the latest matching local user message instead of appending a duplicate
              for (let i = prev.length - 1; i >= 0; i--) {
                const m = prev[i];
                if (m.type === 'user' && (m.content || '').trim() === trimmed) {
                  const updated = [...prev];
                  updated[i] = { ...m, messageId, timestamp: messageForProcessing.timestamp, source: messageForProcessing.source || 'websocket' };
                  return updated;
                }
              }
            }
          }

          const newMessages = [...prev, { ...messageForProcessing, messageId }];
          
          // Only manage timeout for real-time bot responses, not database messages
          if (messageForProcessing.type === 'bot_response' && messageForProcessing.source === 'websocket') {
            setTimeout(() => {
              console.log('⏰ Managing timeout after real-time bot message');
              manageTimeout();
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
        console.log("🔗 Connection status changed:", status);
        setIsConnected(status);
        setIsInitializing(false);
        if (status) {
          setConnectionError(null);
          
          // Always send session_init right after connection
          if (chatServiceRef.current) {
            // Check both state and ref for private mode (ref is set synchronously during toggle)
            const isInPrivateMode = isPrivateMode || pendingPrivateModeRef.current;
            const sessionIdToSend = isInPrivateMode ? null : (sessionId || null);
            console.log('📤 Sending session_init with sessionId:', sessionIdToSend, '(private mode:', isInPrivateMode, ')');
            chatServiceRef.current.send({
              type: "session_init",
              session_id: sessionIdToSend
            });
            
            // Handle session initialization if session storage is enabled and we have a sessionId (and not in private mode)
            if (enableSessionStorage && sessionId && !isInPrivateMode) {
              console.log('📨 Loading previous session messages:', sessionId);
              setIsLoadingSessionMessages(true);
              
              // Set a reasonable timeout for session loading
              setTimeout(() => {
                console.log('📚 Session message loading timeout reached');
                setIsLoadingSessionMessages(false);
                // Start timeout management after session loading
                manageTimeout();
              }, 3000); // 3 seconds timeout for session loading
            } else {
              // Start timeout management immediately if no session to load
              console.log('⏰ Connection established, starting timeout management (no session)');
              manageTimeout();
            }
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
      clearTimeouts();
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

    // Track in outbox for dedup of echoes/history
    const trimmed = (messageContent || '').trim();
    outboxRef.current.push({ content: trimmed, ts: Date.now() });
    // Prune entries older than 60s
    const cutoff = Date.now() - 60000;
    outboxRef.current = outboxRef.current.filter((item) => item.ts >= cutoff);
    
    // Reset timeout when user sends a message
    resetTimeoutOnUserActivity();
    
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
    // Reset timeout when user types
    resetTimeoutOnUserActivity();
  };

  const handleYesNoClick = (response: 'Yes' | 'no_thanks') => {
    if (response === 'no_thanks') {
      // Send cancel message with specific type and content
      if (chatServiceRef.current && isConnected) {
        chatServiceRef.current.send({
          type: 'cancel',
          content: 'no_thanks',
          message: '',
          agentId: agentId || '',
          sessionId: sessionId || '',
          timestamp: Date.now()
        });
      }
    } else {
      sendMessage(response);
    }
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

  const handleNewChat = () => {
    console.log('🆕 Starting new chat (always with null session_id)');
    
    if (onRestart) {
      onRestart();
    }
    
    // Set restarting flag
    restartingRef.current = true;
    
    // Completely reset the chat state
    setMessages([]);
    setHistoryMessages([]);
    setHistoryTimestamp(null);
    setShowTypingIndicator(false);
    setSystemMessage('');
    setConnectionError(null);
    setIsInitializing(true);
    setIsConnected(false);
    
    // Clear processed message IDs and reset sequence
    processedMessageIds.current.clear();
    messageSequenceRef.current = 0;
    
    // Clear timeout timers and reset flags
    clearTimeouts();
    setTimeoutQuestionSent(false);
    
    // Properly disconnect and cleanup existing connection
    if (chatServiceRef.current) {
      chatServiceRef.current.disconnect();
      chatServiceRef.current = null;
    }
    
    // Create a completely new connection
    setTimeout(() => {
      if (agentId) {
        console.log("Starting new chat with null session_id");
        
        chatServiceRef.current = new ChatWebSocketService(agentId, "preview");
        
        chatServiceRef.current.on({
          onMessage: (message) => {
            console.log("New Chat - Received message:", message);
            
            if (restartingRef.current) {
              console.log("Still initializing, skipping message");
              return;
            }
            
            if (message.type === 'system_message') {
              setSystemMessage(message.content);
              setShowTypingIndicator(true);
              return;
            }

            const normalizedType = message.type === 'message' ? 'user' : (message.type === 'assistant' ? 'bot_response' : message.type);
            const messageForProcessing = { ...message, type: normalizedType };

            const latest = getLatestMessage();
            if (
              normalizedType === 'user' &&
              latest &&
              latest.type === 'user' &&
              (latest.content || '').trim() === (messageForProcessing.content || '').trim()
            ) {
              console.log('🔁 Skipping echoed user message from server');
              return;
            }
            
            const messageId = generateUniqueMessageId(messageForProcessing);
            
            if (processedMessageIds.current.has(messageId)) {
              console.log("⚠️ Duplicate message detected, skipping");
              return;
            }
            
            processedMessageIds.current.add(messageId);
            
            if (processedMessageIds.current.size > 200) {
              const idsArray = Array.from(processedMessageIds.current);
              processedMessageIds.current = new Set(idsArray.slice(-100));
            }
            
            setShowTypingIndicator(false);
            setSystemMessage('');
            
            setMessages(prev => {
              if (messageForProcessing.type === 'user') {
                const trimmed = (messageForProcessing.content || '').trim();
                const cutoff = Date.now() - 60000;
                const match = outboxRef.current.find(o => o.content === trimmed && o.ts >= cutoff);
                if (match) {
                  for (let i = prev.length - 1; i >= 0; i--) {
                    const m = prev[i];
                    if (m.type === 'user' && (m.content || '').trim() === trimmed) {
                      const updated = [...prev];
                      updated[i] = { ...m, messageId, timestamp: messageForProcessing.timestamp, source: messageForProcessing.source || 'websocket' };
                      return updated;
                    }
                  }
                }
              }

              const newMessages = [...prev, { ...messageForProcessing, messageId }];
              
              if (messageForProcessing.type === 'bot_response' && messageForProcessing.source === 'websocket') {
                setTimeout(() => {
                  manageTimeout();
                }, 0);
              }
              
              return newMessages;
            });
          },
          onTypingStart: () => {
            if (!restartingRef.current) {
              setShowTypingIndicator(true);
            }
          },
          onTypingEnd: () => {
            setShowTypingIndicator(false);
            setSystemMessage('');
          },
          onError: (error) => {
            console.error('New Chat error:', error);
            setConnectionError(error);
            toast({
              title: "Connection Error",
              description: error,
              variant: "destructive",
            });
          },
          onSessionIdReceived: (newSessionId) => {
            console.log('New Chat - Received session ID (ignoring):', newSessionId);
            // Don't store session ID for new chat
          },
          onConnectionChange: (status) => {
            console.log("New Chat - Connection status changed:", status);
            setIsConnected(status);
            setIsInitializing(false);
            if (status) {
              setConnectionError(null);
              
              // Always send null for new chat
              if (chatServiceRef.current) {
                console.log('📤 New Chat - Sending session_init with null session_id');
                chatServiceRef.current.send({
                  type: "session_init",
                  session_id: null
                });
              }
              
              // Start timeout management when connected
              manageTimeout();
              
              // Clear restarting flag
              restartingRef.current = false;
            } else {
              setConnectionError("Disconnected from chat service");
            }
          }
        });
        
        chatServiceRef.current.connect();
      }
    }, 100);
  };

  const handleRestart = () => {

    if (onRestart) {
      onRestart();
    }
    // Set restarting flag
    restartingRef.current = true;
    
    // Completely reset the chat state
    setMessages([]);
    setHistoryMessages([]);
    setHistoryTimestamp(null);
    setShowTypingIndicator(false);
    setSystemMessage('');
    setConnectionError(null);
    setIsInitializing(true);
    setIsConnected(false);
    
    // Don't reset terms acceptance - it should persist across restarts
    // User has already accepted terms for this session
    
    // Clear processed message IDs and reset sequence
    processedMessageIds.current.clear();
    messageSequenceRef.current = 0;
    
    // Clear timeout timers and reset flags
    clearTimeouts();
    setTimeoutQuestionSent(false);
    
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
              
              // Handle session initialization - check private mode first
              const isInPrivateMode = isPrivateMode || pendingPrivateModeRef.current;
              const sessionIdToSend = isInPrivateMode ? null : (sessionId || null);
              
              // Always send session_init right after restart connection
              if (chatServiceRef.current) {
                console.log('📤 Restart - Sending session_init with sessionId:', sessionIdToSend, '(private mode:', isInPrivateMode, ')');
                chatServiceRef.current.send({
                  type: "session_init",
                  session_id: sessionIdToSend
                });
              }
              
              if (enableSessionStorage && sessionId && !isInPrivateMode && chatServiceRef.current) {
                console.log('📨 Restart - Loading previous session messages:', sessionId);
                setIsLoadingSessionMessages(true);
                
                // Clear restarting flag immediately so messages can be received
                restartingRef.current = false;
                
                // Set a reasonable timeout for session loading
                setTimeout(() => {
                  console.log('📚 Restart - Session message loading timeout reached');
                  setIsLoadingSessionMessages(false);
                  // Start timeout management after session loading
                  manageTimeout();
                }, 3000); // 3 seconds timeout for session loading
              } else {
                // Start timeout management when connected after restart
                console.log('Restart connection established, starting timeout management');
                manageTimeout();
                
                // Clear restarting flag immediately
                restartingRef.current = false;
              }
              
              // Send private mode message if pending
              if (pendingPrivateModeRef.current && chatServiceRef.current) {
                console.log('🔒 Sending private mode message via WebSocket');
                chatServiceRef.current.send({ type: "private" });
                pendingPrivateModeRef.current = false;
              }
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
      
      // Clear timeout timers and stop timeout management completely
      clearTimeouts();
      setTimeoutQuestionSent(false);
      
      // Don't close connection here - keep it open for feedback
      
    } catch (error) {
      console.error('Error ending chat:', error);
      toast({
        title: "Error",
        description: "Failed to end chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  //handle export chat
  const handleExportChat =  () => {
    if (!exportEmail.trim()) {
        toast({
          title: "Email Required",
          description: "Please enter your email address",
          variant: "destructive",
        });
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(exportEmail.trim())) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }


    if (chatServiceRef.current && isConnected) {
      try {
        chatServiceRef.current.send({
          type: 'export',
          content: exportEmail,
          agentId: agentId || '',
          source: 'website',
          timestamp: Date.now()
        });
        console.log('Final timeout message sent after No Thanks');
      } catch (error) {
        console.error('Error sending final timeout after No Thanks:', error);
      } finally {
        setShowEmailConfirmation(false);
      }
    }
  }

  // Handle feedback "No Thanks" button
  const handleFeedbackNoThanks = () => {
    console.log('Feedback declined with No Thanks, sending final timeout');
    
    // Send final timeout message first
    if (chatServiceRef.current && isConnected) {
      try {
        chatServiceRef.current.send({
          type: 'timeout',
          message: '',
          agentId: agentId || '',
          sessionId: sessionId || '',
          timestamp: Date.now()
        });
        console.log('Final timeout message sent after No Thanks');
      } catch (error) {
        console.error('Error sending final timeout after No Thanks:', error);
      }
    }
    
    // Close current connection after sending timeout
    setTimeout(() => {
      if (chatServiceRef.current) {
        chatServiceRef.current.disconnect();
        chatServiceRef.current = null;
      }
      
      // Reset feedback form state but don't clear messages
      setShowFeedbackForm(false);
      setFeedbackRating(0);
      setFeedbackText('');
      setSelectedFeedbackTemplate('');
      
      console.log('Connection closed after No Thanks, chat in idle state');
    }, 500);
  };

  // Track if we need to send private mode message after reconnect
  const pendingPrivateModeRef = useRef(false);

  // Handle privacy mode toggle
  const handlePrivacyModeToggle = () => {
    if (isPrivateMode) {
      // Exiting private mode - close connection and reconnect with stored session
      console.log('🔓 Exiting private mode - reconnecting with stored session');
      
      // Show feedback form if there are more than 2 messages
      if (messages.length > 2) {
        setShowFeedbackForm(true);
      }
      
      // Update private mode state and ref
      setIsPrivateMode(false);
      pendingPrivateModeRef.current = false;
      
      // Close current connection
      if (chatServiceRef.current) {
        console.log('🔌 Closing private mode connection');
        chatServiceRef.current.disconnect();
        chatServiceRef.current = null;
      }
      
      // Clear current state
      setMessages([]);
      setShowTypingIndicator(false);
      setSystemMessage('');
      setIsConnected(false);
      setIsInitializing(true);
      
      // Retrieve session ID from localStorage
      const storedSessionId = localStorage.getItem(`chat_session_${agentId}`);
      console.log('📦 Retrieved session ID from localStorage:', storedSessionId);
      
      // Reconnect with the stored session ID after a short delay
      setTimeout(() => {
        if (!agentId) {
          console.log('❌ No agent ID available');
          setIsInitializing(false);
          return;
        }
        
        console.log('🔄 Reconnecting with session ID:', storedSessionId);
        
        // Create new connection
        chatServiceRef.current = new ChatWebSocketService(agentId, "preview");
        
        chatServiceRef.current.on({
          onMessage: (message) => {
            console.log("📥 Received message after reconnect:", message);
            
            if (message.type === 'system_message') {
              setSystemMessage(message.content);
              setShowTypingIndicator(true);
              return;
            }
            
            const normalizedType = message.type === 'message' ? 'user' : (message.type === 'assistant' ? 'bot_response' : message.type);
            const messageForProcessing = { ...message, type: normalizedType };
            const messageId = generateUniqueMessageId(messageForProcessing);
            
            if (processedMessageIds.current.has(messageId)) {
              console.log("⚠️ Duplicate message detected, skipping:", messageId);
              return;
            }
            
            processedMessageIds.current.add(messageId);
            setShowTypingIndicator(false);
            setSystemMessage('');
            setMessages(prev => [...prev, { ...messageForProcessing, messageId }]);
          },
          onTypingStart: () => {
            setShowTypingIndicator(true);
          },
          onTypingEnd: () => {
            setShowTypingIndicator(false);
            setSystemMessage('');
          },
          onError: (error) => {
            console.error('Chat error after reconnect:', error);
            setConnectionError(error);
            setIsConnected(false);
            setIsInitializing(false);
          },
          onConnectionChange: (status) => {
            console.log("🔗 Connection status after reconnect:", status);
            setIsConnected(status);
            setIsInitializing(false);
            
            if (status && chatServiceRef.current) {
              setConnectionError(null);
              
              // Send session_init with the stored session ID
              console.log('📤 Sending session_init with sessionId:', storedSessionId);
              chatServiceRef.current.send({
                type: "session_init",
                session_id: storedSessionId
              });
              
              // Load previous session messages if available
              if (enableSessionStorage && storedSessionId) {
                console.log('📨 Loading previous session messages:', storedSessionId);
                setIsLoadingSessionMessages(true);
                
                setTimeout(() => {
                  console.log('📚 Session message loading timeout reached');
                  setIsLoadingSessionMessages(false);
                  manageTimeout();
                }, 3000);
              } else {
                manageTimeout();
              }
            }
          },
          ...(enableSessionStorage && onSessionIdReceived && {
            onSessionIdReceived: onSessionIdReceived
          })
        });
        
        chatServiceRef.current.connect();
      }, 500);
      
    } else {
      // Entering private mode - start new session
      console.log('🔒 Entering private mode');
      setIsPrivateMode(true);
      pendingPrivateModeRef.current = true; // Set flag to send private message after reconnect
      handleRestart();
    }
  };

  // Handle Delete chat
  const handleDeleteChat = () => {
    if (messages.length === 0) {
      toast({
        title: "Oh oh!",
        description: "Seems like you havenot started any conversations yet.",
        variant: "destructive",
      });
      return;
    }
    try {
      if (chatServiceRef.current && isConnected) {
        
        chatServiceRef.current.send({
          type: 'delete',
          message: '',
          agentId: agentId || '',
          sessionId: sessionId || '',
          timestamp: Date.now()
        });
        
        //start new connection
        setShowDeleteChatConfirmation(false);

        toast({
          title: "Chat deleted",
          description: "Chat history is deleted successfully.",
          variant: "success",
        });
        handleRestart();


        // setTimeout(() => {
        //   if (chatServiceRef.current) {
        //     chatServiceRef.current.disconnect();
        //     chatServiceRef.current = null;
        //   }
          
        //   // Only hide feedback form, keep messages visible
          
        //   setMessages([]);

        //   // Clear timeout timers and reset flags
        //   clearTimeouts();
        //   setTimeoutQuestionSent(false);
        //   // Don't create new connection - leave in idle state
        //   console.log('Feedback processed, chat left in idle state');
        // }, 1000);
      }
    } catch (error) {
      console.error("error",error);
    }
  }
  // Handle feedback submission
  const handleFeedbackSubmit = () => {
    if (feedbackRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a star rating before submitting feedback.",
        variant: "destructive",
      });
      return;
    }

    console.log('Feedback submitted, sending feedback and final timeout');
    
    try {
      // Send feedback using existing connection
      if (chatServiceRef.current && isConnected) {
        // Send feedback first
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
        
        // Then send final timeout message
        setTimeout(() => {
          if (chatServiceRef.current) {
            chatServiceRef.current.send({
              type: 'timeout',
              message: '',
              agentId: agentId || '',
              sessionId: sessionId || '',
              timestamp: Date.now()
            });
            console.log('Final timeout message sent after feedback');
          }
        }, 200);
        
        console.log('Feedback sent, closing connection in 1 second');
        
        // Close connection after sending both feedback and timeout
        setTimeout(() => {
          if (chatServiceRef.current) {
            chatServiceRef.current.disconnect();
            chatServiceRef.current = null;
          }
          
          // Only hide feedback form, keep messages visible
          setShowFeedbackForm(false);
          setFeedbackRating(0);
          setFeedbackText('');
          setSelectedFeedbackTemplate('');
          
          // Don't create new connection - leave in idle state
          console.log('Feedback processed, chat left in idle state');
        }, 1000);
      }
      
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

  // Handle direct template feedback submission
  const handleTemplateFeedbackSubmit = (templateText: string) => {
    if (feedbackRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a star rating before submitting feedback.",
        variant: "destructive",
      });
      return;
    }

    console.log('Template feedback submitted with text:', templateText);
    
    try {
      // Send feedback using existing connection with the template text directly
      if (chatServiceRef.current && isConnected) {
        // Send feedback first
        chatServiceRef.current.send({
          type: 'feedback',
          content: JSON.stringify({
            rating: feedbackRating,
            text: templateText
          }),
          message: '',
          agentId: agentId || '',
          sessionId: sessionId || '',
          timestamp: Date.now()
        });
        
        // Then send final timeout message
        setTimeout(() => {
          if (chatServiceRef.current) {
            chatServiceRef.current.send({
              type: 'timeout',
              message: '',
              agentId: agentId || '',
              sessionId: sessionId || '',
              timestamp: Date.now()
            });
            console.log('Final timeout message sent after template feedback');
          }
        }, 200);
        
        console.log('Template feedback sent, closing connection in 1 second');
        
        // Close connection after sending both feedback and timeout
        setTimeout(() => {
          if (chatServiceRef.current) {
            chatServiceRef.current.disconnect();
            chatServiceRef.current = null;
          }
          
          // Only hide feedback form, keep messages visible
          setShowFeedbackForm(false);
          setFeedbackRating(0);
          setFeedbackText('');
          setSelectedFeedbackTemplate('');
          
          // Don't create new connection - leave in idle state
          console.log('Template feedback processed, chat left in idle state');
        }, 1000);
      }
      
      toast({
        title: "Feedback Sent",
        description: "Thank you for your feedback!",
      });
      
    } catch (error) {
      console.error('Error submitting template feedback:', error);
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
                    {isPrivateMode ? (
                      <span className="text-white/90 text-xs font-medium">
                        🔒 Private mode - No messages stored
                      </span>
                    ) : (
                      <span className="text-white/80 text-sm">
                        {isConnected ? 'Online' : 'Connecting...'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 relative z-10">
                  {/* Privacy mode toggle */}
                  <ModernButton
                    onClick={handlePrivacyModeToggle}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                    title={isPrivateMode ? "Disable private mode" : "Enable private mode"}
                    icon={isPrivateMode ? Lock : Unlock}
                    iconOnly
                  />
                  
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
                    
                    {/* History Messages */}
                    {historyMessages.length > 0 && (
                      <>
                        {historyMessages.map((message, index) => {
                          const styling = getMessageStyling(message.type);
                          const isConsecutive = index > 0 && historyMessages[index - 1]?.type === message.type;
                          
                          return (
                            <div key={message.messageId || `history-${index}`} className={isConsecutive ? 'mt-2' : 'mt-4'}>
                              <div 
                                className={`flex gap-4 items-start ${message.type === 'user' ? 'justify-end' : message.type === 'bot_response' ? 'justify-start' : 'justify-center'}`}
                              >
                                <div
                                  className={cn(
                                    "rounded-2xl p-4 max-w-[92%] relative transition-all duration-300",
                                    styling.containerClass,
                                    styling.textClass
                                  )}
                                  style={styling.style}
                                >
                                  <div className="text-sm prose prose-sm max-w-none markdown-content">
                                    <ReactMarkdown>
                                      {message.content}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Timestamp separator */}
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-gray-300"></div>
                          <span className="text-xs text-gray-500 font-medium">
                            {historyTimestamp ? (() => {
                              try {
                                // Clean up malformed timestamp (remove Z if offset exists)
                                const cleanTimestamp = historyTimestamp.replace(/\+\d{2}:\d{2}Z$/i, (match) => match.slice(0, -1));
                                const date = new Date(cleanTimestamp);
                                if (isNaN(date.getTime())) return 'Previous messages';
                                return date.toLocaleString();
                              } catch {
                                return 'Previous messages';
                              }
                            })() : 'Previous messages'}
                          </span>
                          <div className="flex-1 h-px bg-gray-300"></div>
                        </div>
                      </>
                    )}
                    
                    {/* Regular Messages */}
                    {messages.map((message, index) => {
                      const styling = getMessageStyling(message.type);
                      const isConsecutive = index > 0 && messages[index - 1]?.type === message.type;
                      
                      return (
                        <div key={message.messageId || index} className={isConsecutive ? 'mt-2' : 'mt-4'}>
                          {message.type !== 'ui' && message.type !== 'feedback_form' && (
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
                           
                           {/* Feedback Form as Bot Message */}
                           {message.type === 'feedback_form' && (
                             <div className="flex gap-4 items-start justify-start animate-fade-in">
                               <div className="flex items-center justify-center overflow-hidden bg-white/20 backdrop-blur-sm rounded-full w-8 h-8 border border-white/30 flex-shrink-0">
                                 {avatarSrc ? (
                                   <Avatar className="w-8 h-8">
                                     <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                                     <AvatarFallback className="text-white bg-transparent">
                                       <User2 size={16} />
                                     </AvatarFallback>
                                   </Avatar>
                                 ) : (
                                   <MessageCircleReplyIcon size={16} className="text-white drop-shadow-sm" />
                                 )}
                               </div>
                               
                               <div 
                                 className="rounded-2xl p-4 max-w-[92%] bg-white border border-gray-200 shadow-sm"
                                 style={{
                                   backgroundColor: `${primaryColor}05`,
                                   borderColor: `${primaryColor}20`
                                 }}
                               >
                                 <div className="text-center">
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
                                         <Star size={20} fill={feedbackRating >= star ? 'currentColor' : 'none'} />
                                       </button>
                                     ))}
                                   </div>
                                   
                                   {/* Feedback Templates */}
                                   <div className="mb-4">
                                     <div className="grid grid-cols-1 gap-2 mb-3">
                                       {[
                                         { id: 'helpful', text: 'Very helpful and resolved my issue quickly' },
                                         { id: 'accurate', text: 'Provided accurate information' },
                                         { id: 'friendly', text: 'Friendly and professional service' }
                                       ].map((template) => (
                                         <div key={template.id} className="flex gap-2">
                                           <div
                                             className={`flex-1 p-2 text-left rounded-lg border text-xs transition-colors ${
                                               selectedFeedbackTemplate === template.id
                                                 ? 'bg-blue-50 border-blue-200 text-blue-900'
                                                 : 'bg-gray-50 border-gray-200 text-gray-700'
                                             }`}
                                           >
                                             {template.text}
                                           </div>
                                           <Button
                                             onClick={() => handleTemplateFeedbackSubmit(template.text)}
                                             disabled={feedbackRating === 0}
                                             className="px-3 py-1 text-xs rounded-lg"
                                             style={{ backgroundColor: primaryColor }}
                                           >
                                             Send
                                           </Button>
                                         </div>
                                       ))}
                                       <button
                                         onClick={() => {
                                           setSelectedFeedbackTemplate('custom');
                                           setFeedbackText('');
                                         }}
                                         className={`p-2 text-left rounded-lg border text-xs transition-colors ${
                                           selectedFeedbackTemplate === 'custom'
                                             ? 'bg-blue-50 border-blue-200 text-blue-900'
                                             : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                         }`}
                                       >
                                         Custom feedback
                                       </button>
                                     </div>
                                     
                                     {/* Custom textarea - only visible when custom is selected */}
                                     {selectedFeedbackTemplate === 'custom' && (
                                       <div className="space-y-3">
                                         <Textarea
                                           value={feedbackText}
                                           onChange={(e) => setFeedbackText(e.target.value)}
                                           placeholder="Tell us about your experience"
                                           className="w-full resize-none text-xs"
                                           rows={2}
                                         />
                                         <Button
                                           onClick={handleFeedbackSubmit}
                                           className="w-full text-xs rounded-lg py-2"
                                           style={{ backgroundColor: primaryColor }}
                                           disabled={feedbackRating === 0 || !feedbackText.trim()}
                                         >
                                           Submit Custom Feedback
                                         </Button>
                                       </div>
                                     )}
                                   </div>
                                   
                                   {/* No Thanks Button */}
                                   <Button
                                     onClick={handleFeedbackNoThanks}
                                     variant="outline"
                                     className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg py-2 text-xs"
                                   >
                                     No Thanks
                                   </Button>
                                 </div>
                               </div>
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

        {/* Delete Chat Confirmation */}
        {showDeleteChatConfirmation && (
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <div className="text-center">
              <div className="mb-3 p-3 rounded-full bg-gray-100 mx-auto w-fit">
                <MessageCircle className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete chat</h3>
              <p className="text-sm text-gray-600 mb-4">Do you want to delete chat history?</p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleEndChat}
                  className="w-full !bg-red-600 hover:!bg-red-700 focus:ring-red-600 !text-white py-3 text-sm font-medium"
                >
                  Yes, delete chat
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteChatConfirmation(false)}
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg py-3 text-sm font-medium"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Panel */}
        {showFeedbackForm && (
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">How was your experience?</h3>
              <div className="flex justify-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    className={`transition-colors ${feedbackRating >= star ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                  >
                    <Star size={16} fill={feedbackRating >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-2 mb-3">
                {[
                  { id: 'helpful', text: 'Very helpful' },
                  { id: 'accurate', text: 'Accurate info' },
                  { id: 'friendly', text: 'Friendly service' }
                ].map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateFeedbackSubmit(template.text)}
                    disabled={feedbackRating === 0}
                    className="w-full p-2 text-xs rounded bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    {template.text}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <Textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us about your experience"
                  className="w-full resize-none text-xs"
                  rows={2}
                />
                <Button
                  onClick={handleFeedbackSubmit}
                  className="w-full text-xs rounded-lg py-2"
                  style={{ backgroundColor: primaryColor }}
                  disabled={feedbackRating === 0 || !feedbackText.trim()}
                >
                  Submit Feedback
                </Button>
                <Button
                  onClick={handleFeedbackNoThanks}
                  variant="outline"
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg py-2 text-xs"
                >
                  No Thanks
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Terms and Conditions */}
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/80 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 text-xs text-gray-600">
            <div className="leading-relaxed">
              By chatting you accept our{' '}
              <a 
                href="#" 
                className="underline hover:text-gray-800 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                terms and conditions
              </a>
              .
            </div>
            <Button
              onClick={() => {
                setTermsAccepted(true);
                setShowTermsAcceptance(false);
              }}
              size="sm"
              className="h-7 px-3 text-xs flex-shrink-0"
            >
              OK
            </Button>
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
        borderRadius: "10px"
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
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent" />
        
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
            {isPrivateMode && (
              <span className="text-white/90 text-xs font-medium" style={{color: `${secondaryColor}E6`}}>
                🔒 Private mode - No messages stored
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 relative z-10">
          {/* Privacy mode toggle */}
          <ModernButton
            onClick={handlePrivacyModeToggle}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/20 text-white/80 hover:text-white transition-colors dark:hover:bg-white/20"
            title={isPrivateMode ? "Disable private mode" : "Enable private mode"}
            icon={isPrivateMode ? Lock : Unlock}
            style={{
              color: `${secondaryColor}80`
            }}
            iconOnly
          />
          
          {/* Menu dropdown - hidden in private mode */}
          {!isPrivateMode && (
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
                  onClick={handleNewChat}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer dark:hover:!bg-neutral-100 dark:!text-neutral-900"
                >
                  New Chat
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowEndChatConfirmation(true)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer dark:hover:!bg-neutral-100 dark:!text-neutral-900"
                >
                  End Chat
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowEmailConfirmation(true)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer dark:hover:!bg-neutral-100 dark:!text-neutral-900"
                >
                  Transcript
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteChatConfirmation(true)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-red-600 dark:hover:!bg-neutral-100"
                >
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
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
            {showWelcomeMessage && welcomeMessage && welcomeMessage.trim() && (
              <div className="animate-fade-in">
                <div 
                  className="border rounded-lg p-3 text-left relative"
                  style={{
                    backgroundColor: `${primaryColor}05`,
                    borderColor: `${primaryColor}20`
                  }}
                >
                  <button
                    onClick={() => setShowWelcomeMessage(false)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close welcome message"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="text-xs italic text-gray-600 leading-relaxed text-left pr-6">
                    <ReactMarkdown>{welcomeMessage}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {showRetentionMessage && displayRetentionMessage && retentionMessage && retentionMessage.trim() && (
              <div className="animate-fade-in">
                <div 
                  className="border rounded-lg p-3 text-left relative"
                  style={{
                    backgroundColor: `${primaryColor}05`,
                    borderColor: `${primaryColor}20`
                  }}
                >
                  <button
                    onClick={() => setShowRetentionMessage(false)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close retention message"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="text-xs italic text-gray-600 leading-relaxed text-left pr-6">
                    
                    <ReactMarkdown>{retentionMessage}</ReactMarkdown>
                    {retentionPeriod > 0 && (<p>
                      <b>Data retention period: {retentionPeriod} days</b>
                      </p>)}
                  </div>
                </div>
              </div>
            )}
            
            {/* History Messages */}
            {historyMessages.length > 0 && (
              <>
                {historyMessages.map((message, index) => {
                  const styling = getMessageStyling(message.type);
                  const isConsecutive = index > 0 && historyMessages[index - 1]?.type === message.type;
                  
                  return (
                    <div key={message.messageId || `history-${index}`} className={isConsecutive ? 'mt-2' : 'mt-4'}>
                      <div 
                        className={`flex gap-4 items-start ${message.type === 'user' ? 'justify-end' : message.type === 'bot_response' ? 'justify-start' : 'justify-center'}`}
                      >
                        <div
                          className={cn(
                            `rounded-[20px] p-4 max-w-[92%] relative transition-all duration-300 ${(message.type === 'user' || message.type === 'message') ? "!py-2 rounded-br-sm" : !isConsecutive ? "rounded-bl-sm" : "rounded-tl-sm"}`,
                            styling.containerClass,
                            styling.textClass
                          )}
                          style={styling.style}
                        >
                          {
                            message.type === 'bot_response' && !isConsecutive && (
                              <div className='flex items-center gap-2 bot mb-1'>
                                <Avatar className="w-4 h-4">
                                  <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                                  <AvatarFallback className='bg-transparent'>
                                    <Icon name={`Person`} type='plain' color='#000000' className='h-4 w-4' />
                                  </AvatarFallback>
                                </Avatar>
                                <p className='text-sm font-semibold'>{chatbotName}</p>
                              </div>
                            )
                          }
                          <div className="text-sm prose prose-sm max-w-none markdown-content">
                            <ReactMarkdown>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Timestamp separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-xs text-gray-500 font-medium">
                    {historyTimestamp ? (() => {
                      try {
                        // Clean up malformed timestamp (remove Z if offset exists)
                        const cleanTimestamp = historyTimestamp.replace(/\+\d{2}:\d{2}Z$/i, (match) => match.slice(0, -1));
                        const date = new Date(cleanTimestamp);
                        if (isNaN(date.getTime())) return 'Previous messages';
                        return date.toLocaleString();
                      } catch {
                        return 'Previous messages';
                      }
                    })() : 'Previous messages'}
                  </span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>
              </>
            )}
            
            {/* Regular Messages */}
            {messages.map((message, index) => {
              const styling = getMessageStyling(message.type);
              const isConsecutive = index > 0 && messages[index - 1]?.type === message.type;
              
              return (
                <div key={message.messageId || index} className={`${isConsecutive ? '!mt-2' : 'mt-4'}`}>
                   {message.type !== 'ui' && message.type !== 'feedback_form' && (
                     <div 
                       className={`flex gap-4 items-start ${message.type === 'user' ? 'justify-end' : message.type === 'bot_response' ? 'justify-start' : 'justify-end'}`}
                       style={{
                         animation: 'messageSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                       }}
                     >
                      <div
                        className={cn(
                          `rounded-[20px] p-4 max-w-[92%] relative transition-all duration-300 ${(message.type === 'user' || message.type === 'message') ? "!py-2 rounded-br-sm" : !isConsecutive ? "rounded-bl-sm" : "rounded-tl-sm"}`,
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
                   
                   {/* Feedback Form as Bot Message in Minimized View */}
                   {message.type === 'feedback_form' && (
                     <div className="flex gap-4 items-start justify-start animate-fade-in rounded-2xl bg-gray-100/50 p-4">
                       <div className="flex items-center justify-center overflow-hidden bg-white/20 backdrop-blur-sm rounded-full w-6 h-6 border border-white/30 flex-shrink-0">
                         {avatarSrc ? (
                           <Avatar className="w-6 h-6">
                             <AvatarImage src={avatarSrc} alt={chatbotName} className="object-cover" />
                             <AvatarFallback className="text-white bg-transparent">
                               <User2 size={12} />
                             </AvatarFallback>
                           </Avatar>
                         ) : (
                           <MessageCircleReplyIcon size={12} className="text-white drop-shadow-sm" />
                         )}
                       </div>
                       
                       <div className="flex-1">
                         <div className="text-center">
                           <h3 className="text-sm font-semibold text-gray-900 mb-2">How was your experience?</h3>
                           
                           {/* Star Rating */}
                           <div className="flex justify-center gap-1 mb-3">
                             {[1, 2, 3, 4, 5].map((star) => (
                               <button
                                 key={star}
                                 onClick={() => setFeedbackRating(star)}
                                 className={`transition-colors ${
                                   feedbackRating >= star ? 'text-yellow-400' : 'text-gray-300'
                                 } hover:text-yellow-400`}
                               >
                                 <Star size={16} fill={feedbackRating >= star ? 'currentColor' : 'none'} />
                               </button>
                             ))}
                           </div>
                           
                           {/* Feedback Templates - Simplified for small view */}
                           <div className="mb-3 space-y-1">
                             {[
                               { id: 'helpful', text: 'Very helpful' },
                               { id: 'accurate', text: 'Accurate info' },
                               { id: 'friendly', text: 'Friendly service' }
                             ].map((template) => (
                               <button
                                 key={template.id}
                                 onClick={() => handleTemplateFeedbackSubmit(template.text)}
                                 disabled={feedbackRating === 0}
                                 className="w-full p-2 text-xs rounded bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                               >
                                 {template.text}
                               </button>
                             ))}
                           </div>
                           
                           {/* No Thanks Button */}
                           <Button
                             onClick={handleFeedbackNoThanks}
                             variant="outline"
                             className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-xs py-1"
                           >
                             No Thanks
                           </Button>
                         </div>
                       </div>
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

         {/* Removed old fixed-position typing indicator */}
         {showTypingIndicator && (
          <div 
            className="absolute bottom-[87px] left-4 flex items-center gap-2 z-20"
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
                  className="w-full dark:!bg-black dark:!text-white rounded-lg py-3 text-sm font-medium"
                >
                  Yes, end chat
                </ModernButton>
                <ModernButton
                  variant="outline"
                  onClick={() => setShowEndChatConfirmation(false)}
                  size='sm'
                  className="w-full border border-gray-300 text-gray-700 dark:text-neutral-900 hover:bg-neutral-50 dark:hover:bg-transparent rounded-lg py-3 text-sm font-medium"
                >
                  No
                </ModernButton>
              </div>
            </div>
          </div>
        )}

        {/* Email input for export */}

        {
          showEmailConfirmation && (
            <div className="px-4 py-3 bg-white border-t border-gray-100">
              <div className="text-center">
                <div className="mb-3 p-3 rounded-full bg-transparent mx-auto w-fit">
                  <Icon name={`CubeNode`} type='plain' color='#000000' />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Export chat</h3>
                <p className="text-sm text-gray-600 mb-4">We will send conversation history to your email address.</p>
                <div className="flex flex-col gap-2">
                  <Input
                  variant='modern'
                  type='email'
                  placeholder='Enter your email address'
                  value={exportEmail}
                  onChange={(e) => setExportEmail(e.target.value)}
                  ></Input>
                  <ModernButton
                    onClick={handleExportChat}
                    variant='primary'
                    size='sm'
                    className="w-full rounded-lg py-3 text-sm font-medium"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Send
                  </ModernButton>
                  <ModernButton
                    variant="outline"
                    onClick={() => setShowEmailConfirmation(false)}
                    size='sm'
                    className="w-full border border-gray-300 text-gray-700 dark:text-neutral-900 hover:bg-neutral-50 dark:hover:bg-transparent rounded-lg py-3 text-sm font-medium"
                  >
                    Cancel
                  </ModernButton>
                </div>
              </div>
            </div>
          )
        }

        {/* Delete Chat Confirmation */}
        {showDeleteChatConfirmation && (
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <div className="text-center">
               <div className="mb-3 p-3 rounded-full bg-transparent mx-auto w-fit">
                <Icon name={`Bin`} type='plain' color='#000000' />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete chat</h3>
              <p className="text-sm text-gray-600 mb-4">Do you want to delete chat history?</p>
              <div className="flex flex-col gap-2">
                <ModernButton
                  onClick={handleDeleteChat}
                  variant='primary'
                  size='sm'
                  className="w-full !bg-red-600 hover:!bg-red-700 focus:ring-red-600 !text-white rounded-lg py-3 text-sm font-medium"
                >
                  Yes, delete chat
                </ModernButton>
                <ModernButton
                  variant="outline"
                  onClick={() => setShowDeleteChatConfirmation(false)}
                  size='sm'
                  className="w-full border border-gray-300 text-gray-700 dark:text-neutral-900 hover:bg-neutral-50 dark:hover:bg-transparent rounded-lg py-3 text-sm font-medium"
                >
                  No
                </ModernButton>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Panel */}
        {showFeedbackForm && (
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How was your experience?</h3>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    className={`transition-colors ${feedbackRating >= star ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                  >
                    <Star size={20} fill={feedbackRating >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { id: 'helpful', text: 'Very helpful' },
                  { id: 'accurate', text: 'Accurate info' },
                  { id: 'friendly', text: 'Friendly service' }
                ].map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateFeedbackSubmit(template.text)}
                    disabled={feedbackRating === 0}
                    className="p-2 text-xs rounded bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    {template.text}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <Textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us about your experience"
                  className="w-full resize-none text-sm dark:bg-white dark:text-neutral-900"
                  rows={2}
                />
                <Button
                  onClick={handleFeedbackSubmit}
                  className="w-full text-sm rounded-lg py-2 dark:!bg-black"
                  style={{ backgroundColor: primaryColor }}
                  disabled={feedbackRating === 0 || !feedbackText.trim()}
                >
                  Submit Feedback
                </Button>
                <Button
                  onClick={handleFeedbackNoThanks}
                  variant="outline"
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg py-2 text-sm bg-transparent hover:text-neutral-900"
                >
                  No Thanks
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Terms and Conditions - Only show if not accepted */}
        {!termsAccepted && showTermsAcceptance && (
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/80 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 text-xs text-gray-600">
              <div className="leading-relaxed">
                By chatting, you accept our{' '}
                <a 
                  href={privacyUrl || "#"} 
                  className="underline hover:text-gray-800 transition-colors"
                  onClick={(e) => privacyUrl === "#" && e.preventDefault()}
                  target='_blank'
                >
                  terms and conditions
                </a>
                .
              </div>
              <ModernButton
                onClick={() => {
                  setTermsAccepted(true);
                  setShowTermsAcceptance(false);
                }}
                size="sm"
                className="h-7 px-3 text-xs flex-shrink-0"
                variant="secondary"
              >
                OK
              </ModernButton>
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
              disabled={!isConnected || shouldDisableInput || (!termsAccepted && !isPrivateMode)}
              rows={1}
              expandable={true}
              maxExpandedHeight="120px"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !shouldDisableInput && (termsAccepted || isPrivateMode)) {
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
                opacity: (isConnected && !shouldDisableInput && inputValue.trim() && (termsAccepted || isPrivateMode)) ? 1 : 0.4
              }}
              disabled={!isConnected || shouldDisableInput || !inputValue.trim() || (!termsAccepted && !isPrivateMode)}
            >
              <Send size={20} />
            </button>
          </form>
         
          {
            !isWhiteLabel && (
              <div className="text-center mt-3 text-xs text-gray-400 font-medium">
                Powered by 7en.ai
              </div>
            )
          }
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
