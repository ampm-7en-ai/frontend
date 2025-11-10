import React, { useRef, useEffect, useState, useMemo } from 'react';
import MessageList from './MessageList';
import ConversationHeader from './ConversationHeader';
import ConversationEmptyState from './ConversationEmptyState';
import { useChatMessagesWebSocket } from '@/hooks/useChatMessagesWebSocket';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader } from 'lucide-react';
import { useAppTheme } from '@/hooks/useAppTheme';

interface MessageContainerProps {
  conversation: {
    id: string;
    customer: string;
    status: string;
    // ... other properties
  } | null;
  selectedAgent: string | null;
  setSelectedAgent: (agent: string | null) => void;
  onInfoClick: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
  onSendMessage: (message: string) => void;
  isTyping?: boolean; // New prop to show typing indicator
  onConversationUpdate?: (updatedConversation: any) => void;
  onSentimentDataChange?: (data: {    
    sentimentScores: Array<{
      score: number;
      timestamp: string;
    }>;
    averageSentiment: number | null;
  }, feedback: any) => void;
}

const MessageContainer = ({
  conversation,
  selectedAgent,
  setSelectedAgent,
  onInfoClick,
  getStatusBadge,
  onSendMessage,
  isTyping: externalIsTyping,
  onConversationUpdate,
  onSentimentDataChange
}: MessageContainerProps) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { theme, toggleTheme } = useAppTheme();

  const [currentTheme, setCurrentTheme] = useState('dark');
  
    // Use system theme preference as initial value
    useEffect(() => {
  
      // const themeCurrent = window.localStorage.getItem('app-theme') === 'dark' ? 'dark' : 'light';
      // setCurrentTheme(themeCurrent);
      // setTheme(themeCurrent);
        // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        // setCurrentTheme(prefersDark ? 'dark' : 'light');
        // setTheme(prefersDark ? 'dark' : 'light');
        // console.log("pipipi",prefersDark);
        console.log("final",theme);
      
     // setCurrentTheme(theme ? 'dark' : 'light');
     // setTheme(theme ? 'dark' : 'light');
    }, [theme,currentTheme]);
  // Use conversation ID as key to force WebSocket hook to reinitialize when conversation changes
  const conversationId = conversation?.id || null;
  
  // Use our WebSocket hook to fetch messages for the selected conversation
  const { 
    messages, 
    isTyping: wsIsTyping,
    isConnected,
    sendMessage,
    sentimentScores,
    averageSentiment,
    feedback,
    mode,
    creditsUsed
  } = useChatMessagesWebSocket({
    sessionId: conversationId,
    autoConnect: !!conversationId
  });

  // Pass sentiment data to parent when it changes
  // useEffect(() => {
  //   if (onSentimentDataChange) {
  //     onSentimentDataChange({
  //       sentimentScores,
  //       averageSentiment
  //     });
  //   }
  // }, [sentimentScores, averageSentiment, onSentimentDataChange]);
  // Replace lines 65-72 with this memoized version
  const sentimentData = useMemo(() => ({
    sentimentScores,
    averageSentiment
  }), [sentimentScores, averageSentiment]);

  useEffect(() => {
    if (onSentimentDataChange) {
      onSentimentDataChange(sentimentData,feedback);
    }
  }, [sentimentData, onSentimentDataChange]);

  // Effect to scroll to agent messages when selectedAgent changes
  useEffect(() => {
    if (selectedAgent && messageContainerRef.current && messages) {
      // Find the first message from the selected agent
      const firstAgentMessage = messages.find(
        (msg: any) => msg.sender === 'bot' && msg.agent === selectedAgent
      );
      
      if (firstAgentMessage) {
        // Find the corresponding element
        const element = document.getElementById(`message-${firstAgentMessage.id}`);
        if (element) {
          // Scroll to the element with a small offset
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100); // Small delay to ensure the DOM is ready
        }
      }
    }
  }, [selectedAgent, messages]);

  // Effect to scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && !selectedAgent) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages?.length, selectedAgent]);

  // Handle sending messages through the WebSocket
  const handleSendMessage = (content: string) => {
    sendMessage(content);
    onSendMessage(content);
  };

  // Determine if there are messages loading
  const isLoading = conversation && messages.length === 0 && !isConnected;

  // Use either the external isTyping prop or the one from the WebSocket
  const isTyping = externalIsTyping !== undefined ? externalIsTyping : wsIsTyping;

  // Filter out any empty/blank messages
  const validMessages = messages?.filter(msg => 
    msg && msg.content && msg.content.trim() !== '' && 
    typeof msg.content === 'string'
  ) || [];

  if (!conversation) {
    return <ConversationEmptyState />;
  }

  // Enhance conversation object with creditsUsed from WebSocket
  const enhancedConversation = useMemo(() => ({
    ...conversation,
    credits_used: creditsUsed
  }), [conversation, creditsUsed]);

  return (
    <div className="flex flex-col h-full bg-white/70 dark:bg-[hsla(0,0%,0%,0.95)] backdrop-blur-sm">
      <ConversationHeader 
        conversation={enhancedConversation}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        onInfoClick={onInfoClick}
        getStatusBadge={getStatusBadge}
        messageCount={validMessages?.filter(m => m.sender !== "system").length}
        hideActionButtons={true}
        onConversationUpdate={onConversationUpdate}
      />
      
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-neutral-900/80 dark:to-neutral-900/80"> 
        <ScrollArea 
          className="h-full"
        >
          <div className="p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              {isLoading || validMessages.length === 0 ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    i % 2 == 0 ? (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-700" />
                        <div className="space-y-2 w-2/3">
                          <Skeleton className="h-16 w-full rounded-2xl bg-neutral-100 dark:bg-neutral-700" />
                        </div>
                      </div>
                    ) : (
                      <div key={i} className="flex items-start gap-3 justify-end">
                        <div className="space-y-2 w-2/3">
                          <Skeleton className="h-16 w-full rounded-2xl bg-neutral-100 dark:bg-neutral-700" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-700" />
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <div 
                    className={`space-y-6 ${mode === 'private' ? 'blur-md pointer-events-none select-none' : ''}`} 
                    ref={messageContainerRef}
                  >
                  {  
                      validMessages
                        .filter(msg => msg.sender !== 'system')
                        .map((message, index) => (
                        <MessageList 
                          key={`${message.id}-${index}`}
                          message={message}
                          selectedAgent={selectedAgent}
                          messageContainerRef={messageContainerRef}
                          isTyping={isTyping && index === validMessages.length - 1}
                          allMessages={validMessages}
                          sessionId={conversationId}
                        />
                      ))
                  }
                    <div ref={messagesEndRef} className="h-4" />
                  </div>
                  
                  {mode === 'private' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white dark:bg-neutral-800/70 backdrop-blur-sm border border-border rounded-lg p-6 max-w-md mx-4 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                          
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">Private Mode Active</h3>
                            <p className="text-sm text-muted-foreground">Conversation details are hidden</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3 text-sm text-muted-foreground">
                          <p>
                            This conversation was conducted in <strong className="text-foreground">private mode</strong>. 
                            Message content is protected and not visible to maintain user privacy.
                          </p>
                          
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <span className="font-medium text-foreground">Credits Used:</span>
                            <span className="text-lg font-bold text-foreground">{creditsUsed}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default MessageContainer;
