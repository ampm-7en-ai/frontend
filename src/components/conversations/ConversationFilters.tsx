
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
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  filterAgent: string;
  onFilterAgentChange: (value: string) => void;
  filterResolved: string;
  onFilterResolvedChange: (value: string) => void;
}

const ConversationFilters = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterAgent,
  onFilterAgentChange,
  filterResolved,
  onFilterResolvedChange
}: ConversationFiltersProps) => {
  return (
    <div className="bg-white rounded-lg p-4 mb-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={filterStatus} onValueChange={onFilterStatusChange}>
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
      </div>
      
      <div className="flex justify-between items-center">
        <Tabs 
          value={filterResolved} 
          onValueChange={onFilterResolvedChange}
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
