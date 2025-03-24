
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
  channelFilter: string;
  setChannelFilter: (channel: string) => void;
  agentTypeFilter: string;
  setAgentTypeFilter: (type: string) => void;
}

const ConversationListPanel = ({
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  filteredConversations,
  selectedConversation,
  setSelectedConversation,
  channelFilter,
  setChannelFilter,
  agentTypeFilter,
  setAgentTypeFilter
}: ConversationListPanelProps) => {
  return (
    <div className="flex flex-col h-full bg-white border-r">
      {/* Filters */}
      <ConversationFilters 
        filterResolved="unresolved"
        onFilterResolvedChange={(value) => {
          // Handle resolved/unresolved filter change if needed
        }}
        channelFilter={channelFilter}
        setChannelFilter={setChannelFilter}
        agentTypeFilter={agentTypeFilter}
        setAgentTypeFilter={setAgentTypeFilter}
      />
      
      {/* Conversation List */}
      <div className="overflow-y-auto flex-1 pt-0">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-sm text-gray-500 mt-1">
              No conversations found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div key={conversation.id}>
              <ConversationCard 
                conversation={conversation}
                isSelected={selectedConversation === conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationListPanel;
