
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ConversationFiltersProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  filterStatus?: string;
  onFilterStatusChange?: (value: string) => void;
  setFilterStatus?: (value: string) => void;
  filterAgent?: string;
  onFilterAgentChange?: (value: string) => void;
  filterResolved?: string;
  onFilterResolvedChange?: (value: string) => void;
  channelFilter?: string;
  setChannelFilter?: (value: string) => void;
  agentTypeFilter?: string;
  setAgentTypeFilter?: (value: string) => void;
}

const ConversationFilters = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  setFilterStatus,
  filterAgent,
  onFilterAgentChange,
  filterResolved,
  onFilterResolvedChange,
  channelFilter,
  setChannelFilter,
  agentTypeFilter,
  setAgentTypeFilter
}: ConversationFiltersProps) => {
  return (
    <div className="bg-white rounded-lg p-4 mb-4">
      {/* Centered Tabs at the top */}
      <div className="flex justify-center items-center mb-4">
        <Tabs 
          value={filterResolved || 'unresolved'} 
          onValueChange={onFilterResolvedChange || (() => {})}
          className="w-auto"
          defaultValue="unresolved"
        >
          <TabsList size="xs">
            <TabsTrigger value="unresolved" size="xs">Unresolved</TabsTrigger>
            <TabsTrigger value="resolved" size="xs">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 items-start sm:items-center">
        {channelFilter && setChannelFilter && (
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="mobile">Mobile App</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {agentTypeFilter && setAgentTypeFilter && (
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={agentTypeFilter} onValueChange={setAgentTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="All Agent Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ai">AI Agents</SelectItem>
                <SelectItem value="human">Human Agents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {filterAgent && onFilterAgentChange && (
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={filterAgent} onValueChange={onFilterAgentChange}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="sales-agent">Sales Agent</SelectItem>
                <SelectItem value="support-agent">Support Agent</SelectItem>
                <SelectItem value="technical-agent">Technical Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationFilters;
