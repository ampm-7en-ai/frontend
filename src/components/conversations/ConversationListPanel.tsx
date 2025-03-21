
import React from 'react';
import ConversationCard from './ConversationCard';
import ConversationFilters from './ConversationFilters';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Instagram, Slack, Mail, Phone } from 'lucide-react';

interface ConversationListPanelProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredConversations: any[];
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
  getPriorityIndicator: (priority: string) => React.ReactNode;
  channelFilter: string;
  setChannelFilter: (channel: string) => void;
}

const ConversationListPanel = ({
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  filteredConversations,
  selectedConversation,
  setSelectedConversation,
  getPriorityIndicator,
  channelFilter,
  setChannelFilter
}: ConversationListPanelProps) => {
  // Helper function to get channel icon
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'instagram':
        return <Instagram className="h-3.5 w-3.5" />;
      case 'slack':
        return <Slack className="h-3.5 w-3.5" />;
      case 'whatsapp':
        return <MessageSquare className="h-3.5 w-3.5" />;
      case 'freshdesk':
        return <Mail className="h-3.5 w-3.5" />;
      case 'phone':
        return <Phone className="h-3.5 w-3.5" />;
      default:
        return <MessageSquare className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="border-r flex flex-col h-full">
      <ConversationFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        channelFilter={channelFilter}
        setChannelFilter={setChannelFilter}
      />
      
      <div className="overflow-y-auto flex-1 p-2">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-2 opacity-20" />
            <h3 className="font-medium">No conversations found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div key={conversation.id} className="mb-2 relative">
              {conversation.channel && (
                <Badge 
                  variant="outline" 
                  className="absolute -left-1 -top-1 z-10 flex items-center gap-1 text-xs"
                >
                  {getChannelIcon(conversation.channel)}
                </Badge>
              )}
              <ConversationCard 
                conversation={conversation}
                isSelected={selectedConversation === conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                getPriorityIndicator={getPriorityIndicator}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationListPanel;
