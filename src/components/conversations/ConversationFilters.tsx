
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import ModernButton from '@/components/dashboard/ModernButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConversationFiltersProps {
  filterResolved: string;
  onFilterResolvedChange: (status: string) => void;
  channelFilter: string;
  setChannelFilter: (channel: string) => void;
  agentTypeFilter: string;
  setAgentTypeFilter: (type: string) => void;
}

const ConversationFilters = ({
  filterResolved,
  onFilterResolvedChange,
  channelFilter,
  setChannelFilter,
  agentTypeFilter,
  setAgentTypeFilter
}: ConversationFiltersProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const statusTabs = [
    { id: 'all', label: 'All' },
    { id: 'unresolved', label: 'Open' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'pending', label: 'Pending' }
  ];

  const channelOptions = [
    { id: 'all', label: 'All Channels' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'email', label: 'Email' },
    { id: 'website', label: 'Website' },
    { id: 'phone', label: 'Phone' },
    { id: 'slack', label: 'Slack' },
    { id: 'instagram', label: 'Instagram' }
  ];

  const agentTypeOptions = [
    { id: 'all', label: 'All Types' },
    { id: 'ai', label: 'AI Agents' },
    { id: 'human', label: 'Human Agents' }
  ];

  const hasActiveFilters = channelFilter !== 'all' || agentTypeFilter !== 'all' || searchQuery;

  const clearAllFilters = () => {
    setChannelFilter('all');
    setAgentTypeFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="p-4 space-y-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
      {/* Status Tabs */}
      <div className="flex items-center justify-between">
        <ModernTabNavigation
          tabs={statusTabs}
          activeTab={filterResolved}
          onTabChange={onFilterResolvedChange}
          className="text-xs"
        />
        
        {hasActiveFilters && (
          <ModernButton
            variant="outline"
            size="sm"
            icon={X}
            onClick={clearAllFilters}
            className="text-xs"
          >
            Clear
          </ModernButton>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Channel Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ModernButton
              variant={channelFilter === 'all' ? 'outline' : 'secondary'}
              size="sm"
              icon={Filter}
              className="whitespace-nowrap"
            >
              {channelOptions.find(opt => opt.id === channelFilter)?.label || 'Channel'}
            </ModernButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Channel</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {channelOptions.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => setChannelFilter(option.id)}
                className={channelFilter === option.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Agent Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ModernButton
              variant={agentTypeFilter === 'all' ? 'outline' : 'secondary'}
              size="sm"
              icon={Filter}
              className="whitespace-nowrap"
            >
              {agentTypeOptions.find(opt => opt.id === agentTypeFilter)?.label || 'Type'}
            </ModernButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Agent Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {agentTypeOptions.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => setAgentTypeFilter(option.id)}
                className={agentTypeFilter === option.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ConversationFilters;
