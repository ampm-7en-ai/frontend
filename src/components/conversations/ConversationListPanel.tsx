
import React from 'react';
import ConversationCard from './ConversationCard';
import ConversationFilters from './ConversationFilters';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

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
  isLoading?: boolean;
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
  setAgentTypeFilter,
  isLoading = false
}: ConversationListPanelProps) => {
  const renderContent = () => {
    if (isLoading) {
      return Array(5).fill(0).map((_, index) => (
        <div key={`skeleton-${index}`} className="p-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-none" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-32 mb-3" />
              <Skeleton className="h-3 w-40" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        </div>
      ));
    }

    if (filteredConversations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <p className="text-sm text-gray-500 mt-1">
            No conversations found. Try adjusting your filters.
          </p>
        </div>
      );
    }

    return filteredConversations.map((conversation) => (
      <div key={conversation.id}>
        <ConversationCard 
          conversation={conversation}
          isSelected={selectedConversation === conversation.id}
          onClick={() => setSelectedConversation(conversation.id)}
        />
      </div>
    ));
  };

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
        {renderContent()}
      </ScrollArea>
    </div>
  );
};

export default ConversationListPanel;
