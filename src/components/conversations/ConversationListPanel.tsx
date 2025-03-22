
import React from 'react';
import ConversationCard from './ConversationCard';
import ConversationFilters from './ConversationFilters';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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
      {/* Search Bar */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations"
            className="pl-9 bg-gray-50 border-gray-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Filters */}
      <ConversationFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
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
            <div key={conversation.id} className="mb-0">
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
