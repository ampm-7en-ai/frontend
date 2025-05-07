
import React, { useRef, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ConversationHeader from './ConversationHeader';
import ConversationEmptyState from './ConversationEmptyState';
import { useChatMessagesApi } from '@/hooks/useChatMessagesApi';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader } from 'lucide-react';

interface MessageContainerProps {
  conversation: any;
  selectedAgent: string | null;
  setSelectedAgent: (agent: string | null) => void;
  onInfoClick: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
  onSendMessage: (message: string) => void;
}

const MessageContainer = ({
  conversation,
  selectedAgent,
  setSelectedAgent,
  onInfoClick,
  getStatusBadge,
  onSendMessage
}: MessageContainerProps) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch messages for the selected conversation
  const { data: messages = [], isLoading: isLoadingMessages } = useChatMessagesApi(conversation?.id || null);

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
        messageCount={messages?.filter(m => m.sender !== "system").length}
      />
      
      <div className="flex-1 overflow-hidden bg-slate-50">
        <ScrollArea 
          className="h-[calc(100vh-12rem)]" 
          style={{ height: "calc(100vh - 12rem)" }}
        >
          <div className="p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              {isLoadingMessages ? (
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
                messages && messages.map((message: any) => (
                  <MessageList 
                    key={message.id}
                    message={message}
                    selectedAgent={selectedAgent}
                    messageContainerRef={messageContainerRef}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </ScrollArea>
      </div>
      
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default MessageContainer;
