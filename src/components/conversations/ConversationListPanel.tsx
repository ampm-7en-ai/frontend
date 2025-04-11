
import React from 'react';
import ConversationCard from './ConversationCard';
import ConversationFilters from './ConversationFilters';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <div className="flex flex-col h-full bg-white border-r max-w-[1440px] mx-auto">
      {/* Filters */}
      <div className="sticky top-0 z-10 bg-white">
        <ConversationFilters 
          filterResolved={filterStatus}
          onFilterResolvedChange={setFilterStatus}
          channelFilter={channelFilter}
          setChannelFilter={setChannelFilter}
          agentTypeFilter={agentTypeFilter}
          setAgentTypeFilter={setAgentTypeFilter}
        />
      </div>
      
      {/* Conversation List */}
      <ScrollArea className="flex-1" hideScrollbar={true}>
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
      </ScrollArea>
    </div>
  );
};

export default ConversationListPanel;
