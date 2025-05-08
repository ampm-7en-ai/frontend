
import React, { useRef, useEffect, useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ConversationHeader from './ConversationHeader';
import ConversationEmptyState from './ConversationEmptyState';
import { useChatMessagesWebSocket } from '@/hooks/useChatMessagesWebSocket';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader } from 'lucide-react';

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
}

const MessageContainer = ({
  conversation,
  selectedAgent,
  setSelectedAgent,
  onInfoClick,
  getStatusBadge,
  onSendMessage,
  isTyping: externalIsTyping
}: MessageContainerProps) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  // Use our WebSocket hook with memoized conversation ID
  const conversationId = conversation?.id || null;
  
  // Use our new WebSocket hook to fetch messages for the selected conversation
  const { 
    messages: wsMessages, 
    isTyping: wsIsTyping,
    isConnected,
    sendMessage
  } = useChatMessagesWebSocket({
    sessionId: conversationId,
    autoConnect: !!conversationId,
    onMessagesReceived: (receivedMessages) => {
      console.log("Received initial messages:", receivedMessages);
      setMessages(receivedMessages);
    },
    onMessage: (newMessage) => {
      console.log("Received new message:", newMessage);
      // New messages will be handled by the messages state from the hook
    }
  });
  
  // Use messages from WebSocket
  useEffect(() => {
    if (wsMessages.length > 0) {
      setMessages(wsMessages);
    }
  }, [wsMessages]);

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
    msg && msg.content && msg.content.trim() !== ''
  ) || [];

  if (!conversation) {
    return <ConversationEmptyState />;
  }

  return (
    <div className="flex flex-col h-full">
      <ConversationHeader 
        conversation={conversation}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        onInfoClick={onInfoClick}
        getStatusBadge={getStatusBadge}
        messageCount={validMessages?.filter(m => m.sender !== "system").length}
      />
      
      <div className="flex-1 overflow-hidden" style={{background: "#f2f2f2"}}> 
        <ScrollArea 
          className="h-[calc(100vh-12rem)]"
          style={{ height: "calc(100vh - 12rem)" }}
        >
          <div className="p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
              {isLoading ? (
                // Show loading skeletons while messages are loading
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2 w-2/3">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-16 w-full rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Render actual messages
                <div className="space-y-4" ref={messageContainerRef}>
                  {validMessages.map((message: any) => (
                    <MessageList 
                      key={message.id}
                      message={message}
                      selectedAgent={selectedAgent}
                      messageContainerRef={messageContainerRef}
                      isTyping={isTyping} 
                    />
                  ))}
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
      
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default MessageContainer;
