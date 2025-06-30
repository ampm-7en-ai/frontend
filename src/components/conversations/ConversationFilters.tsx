
import React from 'react';
import { Filter, X } from 'lucide-react';
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

  const hasActiveFilters = channelFilter !== 'all' || agentTypeFilter !== 'all';

  const clearAllFilters = () => {
    setChannelFilter('all');
    setAgentTypeFilter('all');
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
      {/* Status Tabs and Clear Button */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center gap-4">
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
      </div>

      {/* Filters */}
      <div className="flex items-center justify-center gap-3">
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
          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
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
          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
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
