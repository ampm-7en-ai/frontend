
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
  // Helper function to get channel icon
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'slack':
        return <Slack className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />;
      case 'freshdesk':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Helper function to get channel color class
  const getChannelColorClass = (channel: string) => {
    switch (channel) {
      case 'instagram':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'slack':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'whatsapp':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'freshdesk':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'phone':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        agentTypeFilter={agentTypeFilter}
        setAgentTypeFilter={setAgentTypeFilter}
      />
      
      <div className="overflow-y-auto flex-1 p-2">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-2 opacity-20" />
            <h3 className="font-medium">No conversations found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div key={conversation.id} className="mb-2 relative">
              {conversation.channel && (
                <div className="absolute left-1 top-2 z-10">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full shadow-sm ${getChannelColorClass(conversation.channel)}`}>
                    {getChannelIcon(conversation.channel)}
                  </div>
                </div>
              )}
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
