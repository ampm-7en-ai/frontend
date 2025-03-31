
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ConversationFiltersProps {
  value: string;
  onValueChange: (value: string) => void;
  filterResolved?: string;
  onFilterResolvedChange?: (status: string) => void;
  channelFilter?: string;
  setChannelFilter?: (channel: string) => void;
  agentTypeFilter?: string;
  setAgentTypeFilter?: (type: string) => void;
}

const ConversationFilters = ({ 
  value, 
  onValueChange,
  filterResolved,
  onFilterResolvedChange,
  channelFilter,
  setChannelFilter,
  agentTypeFilter,
  setAgentTypeFilter
}: ConversationFiltersProps) => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue={value} className="w-[300px]" onValueChange={onValueChange}>
        <TabsList className="h-9">
          <TabsTrigger value="all">All Conversations</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Additional filters if provided */}
      {filterResolved && onFilterResolvedChange && (
        <Tabs defaultValue={filterResolved} className="w-[300px]" onValueChange={onFilterResolvedChange}>
          <TabsList className="h-9">
            <TabsTrigger value="all">All Status</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="unresolved">Unresolved</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      
      {channelFilter && setChannelFilter && (
        <Tabs defaultValue={channelFilter} className="w-[300px]" onValueChange={setChannelFilter}>
          <TabsList className="h-9">
            <TabsTrigger value="all">All Channels</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="slack">Slack</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      
      {agentTypeFilter && setAgentTypeFilter && (
        <Tabs defaultValue={agentTypeFilter} className="w-[300px]" onValueChange={setAgentTypeFilter}>
          <TabsList className="h-9">
            <TabsTrigger value="all">All Agents</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="human">Human</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </div>
  );
};

export default ConversationFilters;
