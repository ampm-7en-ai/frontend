
import React from 'react';
import ConversationCard from './ConversationCard';
import ConversationFilters from './ConversationFilters';

interface ConversationListPanelProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredConversations: any[];
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
  getPriorityIndicator: (priority: string) => React.ReactNode;
}

const ConversationListPanel = ({
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  filteredConversations,
  selectedConversation,
  setSelectedConversation,
  getPriorityIndicator
}: ConversationListPanelProps) => {
  return (
    <div className="border-r flex flex-col h-full">
      <ConversationFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />
      
      <div className="overflow-y-auto flex-1 p-2">
        {filteredConversations.map((conversation) => (
          <ConversationCard 
            key={conversation.id}
            conversation={conversation}
            isSelected={selectedConversation === conversation.id}
            onClick={() => setSelectedConversation(conversation.id)}
            getPriorityIndicator={getPriorityIndicator}
          />
        ))}
      </div>
    </div>
  );
};

export default ConversationListPanel;
