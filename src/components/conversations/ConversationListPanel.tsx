import React, { useState } from 'react';
import ConversationsList from './ConversationsList';
import ConversationFilters from './ConversationFilters';
import ConversationEmptyState from './ConversationEmptyState';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Mock data (would come from API in real implementation)
const mockConversations = [
  {
    id: '1',
    title: 'Customer Inquiry about Product X',
    date: '2023-11-15T14:30:00',
    status: 'open',
    channel: 'whatsapp',
    agentType: 'ai',
  },
  {
    id: '2',
    title: 'Support Request: Issue with Account Access',
    date: '2023-11-14T09:15:00',
    status: 'resolved',
    channel: 'slack',
    agentType: 'human',
  },
  {
    id: '3',
    title: 'Feedback on New Feature Y',
    date: '2023-11-13T18:45:00',
    status: 'open',
    channel: 'instagram',
    agentType: 'ai',
  },
  {
    id: '4',
    title: 'Question about Pricing Plans',
    date: '2023-11-12T11:00:00',
    status: 'unresolved',
    channel: 'whatsapp',
    agentType: 'human',
  },
  {
    id: '5',
    title: 'Technical Assistance Needed',
    date: '2023-11-11T16:20:00',
    status: 'resolved',
    channel: 'slack',
    agentType: 'ai',
  },
];

const ConversationListPanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterResolved, setFilterResolved] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [agentTypeFilter, setAgentTypeFilter] = useState('all');

  // Filter conversations based on search query and filters
  const filteredConversations = mockConversations.filter(conversation => {
    const searchMatch = conversation.title.toLowerCase().includes(searchQuery.toLowerCase());
    const tabMatch = activeTab === 'all' || conversation.status === activeTab;
    const resolvedMatch = filterResolved === 'all' || conversation.status === filterResolved;
    const channelMatch = channelFilter === 'all' || conversation.channel === channelFilter;
    const agentTypeMatch = agentTypeFilter === 'all' || conversation.agentType === agentTypeFilter;

    return searchMatch && tabMatch && resolvedMatch && channelMatch && agentTypeMatch;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <ConversationFilters 
          value={activeTab}
          onValueChange={setActiveTab}
          filterResolved={filterResolved}
          onFilterResolvedChange={setFilterResolved}
          channelFilter={channelFilter}
          setChannelFilter={setChannelFilter}
          agentTypeFilter={agentTypeFilter}
          setAgentTypeFilter={setAgentTypeFilter}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filteredConversations.length > 0 ? (
          <ConversationsList conversations={filteredConversations} />
        ) : (
          <ConversationEmptyState />
        )}
      </div>
    </div>
  );
};

export default ConversationListPanel;
