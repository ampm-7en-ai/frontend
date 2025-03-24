
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ConversationFiltersProps {
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  filterStatus: string;
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
  searchQuery,
  setSearchQuery,
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
  // Use either searchQuery or searchTerm based on which is provided
  const searchValue = searchQuery || searchTerm || '';
  const handleSearchChange = (value: string) => {
    if (setSearchQuery) setSearchQuery(value);
    if (onSearchChange) onSearchChange(value);
  };

  // Use either setFilterStatus or onFilterStatusChange based on which is provided
  const handleStatusChange = (value: string) => {
    if (setFilterStatus) setFilterStatus(value);
    if (onFilterStatusChange) onFilterStatusChange(value);
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={filterStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          
          {filterAgent && onFilterAgentChange && (
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
          )}
          
          {channelFilter && setChannelFilter && (
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
          )}
          
          {agentTypeFilter && setAgentTypeFilter && (
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
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Tabs 
          value={filterResolved || 'all'} 
          onValueChange={onFilterResolvedChange || (() => {})}
          className="w-auto"
        >
          <TabsList size="xs">
            <TabsTrigger value="all" size="xs">All</TabsTrigger>
            <TabsTrigger value="unresolved" size="xs">Unresolved</TabsTrigger>
            <TabsTrigger value="resolved" size="xs">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button variant="outline" size="sm" className="text-xs">
          <Filter className="h-3 w-3 mr-1" />
          More Filters
        </Button>
      </div>
    </div>
  );
};

export default ConversationFilters;
