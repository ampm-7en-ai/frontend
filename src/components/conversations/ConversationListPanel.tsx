
import React from 'react';
import ConversationCard from './ConversationCard';
import ConversationFilters from './ConversationFilters';
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
        return <Instagram className="h-4 w-4 text-pink-500" />;
      case 'slack':
        return <Slack className="h-4 w-4 text-purple-500" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4 text-emerald-500" />;
      case 'freshdesk':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'phone':
        return <Phone className="h-4 w-4 text-amber-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  // Helper function to get channel color class
  const getChannelColorClass = (channel: string) => {
    switch (channel) {
      case 'instagram':
        return 'bg-pink-50 text-pink-600 border-pink-100';
      case 'slack':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'whatsapp':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'freshdesk':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'phone':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r">
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
      
      <div className="overflow-y-auto flex-1 p-3">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
            <h3 className="font-medium text-gray-700">No conversations found</h3>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div key={conversation.id} className="mb-3 relative">
              {conversation.channel && (
                <div className="absolute left-1 top-2 z-10">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full shadow-sm ${getChannelColorClass(conversation.channel)}`}>
                    {getChannelIcon(conversation.channel)}
                  </div>
                </div>
              )}
              <div className="pl-6">
                <ConversationCard 
                  conversation={conversation}
                  isSelected={selectedConversation === conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationListPanel;
