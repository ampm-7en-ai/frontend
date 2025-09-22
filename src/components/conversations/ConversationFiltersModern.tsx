import React, { useState } from 'react';
import { Filter, X, Trash2 } from 'lucide-react';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import ConversationFiltersDrawer from './ConversationFiltersDrawer';
import ModernButton from '../dashboard/ModernButton';
import { Checkbox } from '@/components/ui/checkbox';

interface ConversationFiltersProps {
  filterResolved: string;
  onFilterResolvedChange: (status: string) => void;
  channelFilter: string[];
  setChannelFilter: (channels: string[]) => void;
  agentTypeFilter: string[];
  setAgentTypeFilter: (types: string[]) => void;
  agentNameFilter: string[];
  setAgentNameFilter: (agents: string[]) => void;
  availableAgents: string[];
  isBulkSelectMode: boolean;
  onBulkSelectModeChange: (enabled: boolean) => void;
  selectedConversations: string[];
  onSelectAll: () => void;
  onBulkDelete: () => void;
  isBulkDeleting: boolean;
}

const ConversationFiltersModern = ({
  filterResolved,
  onFilterResolvedChange,
  channelFilter,
  setChannelFilter,
  agentTypeFilter,
  setAgentTypeFilter,
  agentNameFilter,
  setAgentNameFilter,
  availableAgents,
  isBulkSelectMode,
  onBulkSelectModeChange,
  selectedConversations,
  onSelectAll,
  onBulkDelete,
  isBulkDeleting
}: ConversationFiltersProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const statusTabs = [
    { id: 'all', label: 'All' },
    { id: 'unresolved', label: 'Open' },
    { id: 'resolved', label: 'Resolved' }
  ];

  const channelOptions = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'ticketing', label: 'Ticket' },
    { value: 'website', label: 'Website' },
    { value: 'slack', label: 'Slack' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'messenger', label: 'Messenger' }
  ];

  const hasActiveFilters = channelFilter.length > 0 || agentTypeFilter.length > 0 || agentNameFilter.length > 0;

  const clearAllFilters = () => {
    setChannelFilter([]);
    setAgentTypeFilter([]);
    setAgentNameFilter([]);
  };

  const handleChannelChange = (value: string) => {
    const isSelected = channelFilter.includes(value);
    if (isSelected) {
      setChannelFilter(channelFilter.filter(id => id !== value));
    } else {
      setChannelFilter([...channelFilter, value]);
    }
  };

  const handleAgentTypeChange = (value: string) => {
    const isSelected = agentTypeFilter.includes(value);
    if (isSelected) {
      setAgentTypeFilter(agentTypeFilter.filter(id => id !== value));
    } else {
      setAgentTypeFilter([...agentTypeFilter, value]);
    }
  };

  const handleAgentNameChange = (value: string) => {
    const isSelected = agentNameFilter.includes(value);
    if (isSelected) {
      setAgentNameFilter(agentNameFilter.filter(id => id !== value));
    } else {
      setAgentNameFilter([...agentNameFilter, value]);
    }
  };

  const getActiveFiltersCount = () => {
    return channelFilter.length + agentTypeFilter.length + agentNameFilter.length;
  };

  return (
    <div className="bg-white dark:bg-[hsla(0,0%,0%,0.95)] dark:border-neutral-700 py-[14px]">
      <div className="flex items-center justify-between gap-4 px-4">
        <ModernTabNavigation
          tabs={statusTabs}
          activeTab={filterResolved}
          onTabChange={onFilterResolvedChange}
          className="text-xs rounded-xl"
        />
        
        <div className="flex items-center gap-2">
          {isBulkSelectMode && selectedConversations.length > 0 && (
            <ModernButton
              onClick={onBulkDelete}
              disabled={isBulkDeleting}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {isBulkDeleting ? 'Deleting...' : `Delete (${selectedConversations.length})`}
            </ModernButton>
          )}
          
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={isBulkSelectMode}
              onCheckedChange={onBulkSelectModeChange}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <span 
              className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer select-none"
              onClick={() => onBulkSelectModeChange(!isBulkSelectMode)}
            >
              Select
            </span>
            {isBulkSelectMode && (
              <ModernButton
                onClick={onSelectAll}
                size="sm"
                variant="ghost"
                className="text-xs"
              >
                Select All
              </ModernButton>
            )}
          </div>

          <ConversationFiltersDrawer
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
            channelFilter={channelFilter}
            setChannelFilter={setChannelFilter}
            agentTypeFilter={agentTypeFilter}
            setAgentTypeFilter={setAgentTypeFilter}
            agentNameFilter={agentNameFilter}
            setAgentNameFilter={setAgentNameFilter}
            availableAgents={availableAgents}
            trigger={
              <ModernButton
                type="button"
                size='sm'
                iconOnly
                variant='ghost'
                className={`relative inline-flex items-center justify-center rounded-xl text-xs font-medium transition-all duration-200 ${
                  hasActiveFilters 
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-neutral-900/30 border border-orange-200 dark:border-orange-800' 
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <Filter className="w-4 h-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </ModernButton>
            }
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="px-4 mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Active Filters
            </h5>
            <button
              onClick={clearAllFilters}
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors font-medium"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {agentNameFilter.map(agentName => (
              <span key={agentName} className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-green-50/80 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200/50 dark:border-green-800/50 backdrop-blur-sm">
                {agentName}
                <button
                  onClick={() => handleAgentNameChange(agentName)}
                  className="hover:bg-green-100/50 dark:hover:bg-green-800/30 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {channelFilter.map(channelId => {
              const channel = channelOptions.find(c => c.value === channelId);
              return channel ? (
                <span key={channelId} className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-orange-50/80 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200/50 dark:border-orange-800/50 backdrop-blur-sm">
                  {channel.label}
                  <button
                    onClick={() => handleChannelChange(channelId)}
                    className="hover:bg-orange-100/50 dark:hover:bg-orange-800/30 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) : null;
            })}
            {agentTypeFilter.map(typeId => (
              <span key={typeId} className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-neutral-100/80 text-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300 border border-neutral-200/50 dark:border-neutral-700/50 backdrop-blur-sm">
                Human Agents
                <button
                  onClick={() => handleAgentTypeChange(typeId)}
                  className="hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationFiltersModern;
