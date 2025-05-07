
import React, { useRef, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ConversationHeader from './ConversationHeader';
import ConversationEmptyState from './ConversationEmptyState';

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

  // Effect to scroll to agent messages when selectedAgent changes
  useEffect(() => {
    if (selectedAgent && messageContainerRef.current && conversation?.messages) {
      // Find the first message from the selected agent
      const firstAgentMessage = conversation.messages.find(
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
  }, [selectedAgent, conversation?.messages]);

  // Effect to scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && !selectedAgent) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages?.length, selectedAgent]);

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
      />
      
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-3 bg-slate-50"
      >
        {conversation.messages && conversation.messages.map((message: any) => (
          <MessageList 
            key={message.id}
            message={message}
            selectedAgent={selectedAgent}
            messageContainerRef={messageContainerRef}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default MessageContainer;
