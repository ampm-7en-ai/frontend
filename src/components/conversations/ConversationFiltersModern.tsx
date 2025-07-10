
import React from 'react';
import { Filter, X } from 'lucide-react';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface ConversationFiltersProps {
  filterResolved: string;
  onFilterResolvedChange: (status: string) => void;
  channelFilter: string[];
  setChannelFilter: (channels: string[]) => void;
  agentTypeFilter: string[];
  setAgentTypeFilter: (types: string[]) => void;
}

const ConversationFiltersModern = ({
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
    { id: 'resolved', label: 'Resolved' }
  ];

  const channelOptions = [
    { 
      value: 'whatsapp', 
      label: 'WhatsApp',
      description: 'WhatsApp Business messages'
    },
    { 
      value: 'email', 
      label: 'Email',
      description: 'Email conversations'
    },
    { 
      value: 'website', 
      label: 'Website',
      description: 'Website chat widget'
    },
    { 
      value: 'ticketing', 
      label: 'Ticket',
      description: 'Support ticket conversations'
    },
    { 
      value: 'slack', 
      label: 'Slack',
      description: 'Slack workspace messages'
    },
    { 
      value: 'instagram', 
      label: 'Instagram',
      description: 'Instagram direct messages'
    }
  ];

  const agentTypeOptions = [
    { value: 'ai', label: 'AI Agents', description: 'Automated AI responses' },
    { value: 'human', label: 'Human Agents', description: 'Human agent conversations' }
  ];

  const hasActiveFilters = channelFilter.length > 0 || agentTypeFilter.length > 0;

  const clearAllFilters = () => {
    setChannelFilter([]);
    setAgentTypeFilter([]);
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

  const getActiveFiltersCount = () => {
    return channelFilter.length + agentTypeFilter.length;
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between gap-4">
        <ModernTabNavigation
          tabs={statusTabs}
          activeTab={filterResolved}
          onTabChange={onFilterResolvedChange}
          className="text-xs"
        />
        
        <div className="flex items-center gap-2">
          <ModernDropdown
            value=""
            onValueChange={() => {}}
            options={channelOptions}
            placeholder=""
            className="h-8 w-8 p-0"
            align="end"
            trigger={
              <button
                type="button"
                className={`relative inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 ${
                  hasActiveFilters 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
                    : 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Filter className="w-4 h-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>
            }
            renderOption={(option) => (
              <div className="flex items-center justify-between w-full p-3 rounded-lg border border-gray-100/50 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group backdrop-blur-sm">
                <div className="flex-1 text-left">
                  <div className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{option.description}</div>
                </div>
                <Checkbox
                  checked={channelFilter.includes(option.value)}
                  onCheckedChange={(checked) => handleChannelChange(option.value)}
                  className="rounded-md"
                />
              </div>
            )}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Active Filters
            </h5>
            <button
              onClick={clearAllFilters}
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-medium"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {channelFilter.map(channelId => {
              const channel = channelOptions.find(c => c.value === channelId);
              return channel ? (
                <span key={channelId} className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-blue-50/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
                  {channel.label}
                  <button
                    onClick={() => handleChannelChange(channelId)}
                    className="hover:bg-blue-100/50 dark:hover:bg-blue-800/30 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) : null;
            })}
            {agentTypeFilter.map(typeId => {
              const type = agentTypeOptions.find(t => t.value === typeId);
              return type ? (
                <span key={typeId} className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-slate-100/80 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                  {type.label}
                  <button
                    onClick={() => handleAgentTypeChange(typeId)}
                    className="hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationFiltersModern;
