
import React from 'react';
import { Filter, X } from 'lucide-react';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import ModernButton from '@/components/dashboard/ModernButton';
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
    { id: 'resolved', label: 'Resolved' }
  ];

  const channelOptions = [
    { id: 'whatsapp', label: 'WhatsApp', color: 'bg-green-100 text-green-700' },
    { id: 'email', label: 'Email', color: 'bg-blue-100 text-blue-700' },
    { id: 'website', label: 'Website', color: 'bg-purple-100 text-purple-700' },
    { id: 'phone', label: 'Phone', color: 'bg-orange-100 text-orange-700' },
    { id: 'slack', label: 'Slack', color: 'bg-pink-100 text-pink-700' },
    { id: 'instagram', label: 'Instagram', color: 'bg-gradient-to-r from-pink-500 to-violet-500 text-white' }
  ];

  const agentTypeOptions = [
    { id: 'ai', label: 'AI Agents', icon: '🤖' },
    { id: 'human', label: 'Human Agents', icon: '👤' }
  ];

  const hasActiveFilters = channelFilter.length > 0 || agentTypeFilter.length > 0;

  const clearAllFilters = () => {
    setChannelFilter([]);
    setAgentTypeFilter([]);
  };

  const handleChannelChange = (channelId: string, checked: boolean) => {
    if (checked) {
      setChannelFilter([...channelFilter, channelId]);
    } else {
      setChannelFilter(channelFilter.filter(id => id !== channelId));
    }
  };

  const handleAgentTypeChange = (typeId: string, checked: boolean) => {
    if (checked) {
      setAgentTypeFilter([...agentTypeFilter, typeId]);
    } else {
      setAgentTypeFilter(agentTypeFilter.filter(id => id !== typeId));
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
          <Popover>
            <PopoverTrigger asChild>
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
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-xl z-50 rounded-2xl" align="start" side="right">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Filter Conversations</h4>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                {/* Channel Filters */}
                <div className="mb-5">
                  <h5 className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-wide">
                    Channels ({channelFilter.length} selected)
                  </h5>
                  <div className="space-y-3">
                    {channelOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-3 group">
                        <Checkbox
                          id={`channel-${option.id}`}
                          checked={channelFilter.includes(option.id)}
                          onCheckedChange={(checked) => handleChannelChange(option.id, !!checked)}
                          className="rounded-md"
                        />
                        <label 
                          htmlFor={`channel-${option.id}`}
                          className="text-sm cursor-pointer flex-1 flex items-center justify-between group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors"
                        >
                          <span>{option.label}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${option.color}`}>
                            {option.label}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Agent Type Filters */}
                <div>
                  <h5 className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-wide">
                    Agent Types ({agentTypeFilter.length} selected)
                  </h5>
                  <div className="space-y-3">
                    {agentTypeOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-3 group">
                        <Checkbox
                          id={`agent-${option.id}`}
                          checked={agentTypeFilter.includes(option.id)}
                          onCheckedChange={(checked) => handleAgentTypeChange(option.id, !!checked)}
                          className="rounded-md"
                        />
                        <label 
                          htmlFor={`agent-${option.id}`}
                          className="text-sm cursor-pointer flex-1 flex items-center space-x-2 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors"
                        >
                          <span>{option.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex flex-wrap gap-2">
                      {channelFilter.map(channelId => {
                        const channel = channelOptions.find(c => c.id === channelId);
                        return channel ? (
                          <span key={channelId} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${channel.color}`}>
                            {channel.label}
                            <button
                              onClick={() => handleChannelChange(channelId, false)}
                              className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                      {agentTypeFilter.map(typeId => {
                        const type = agentTypeOptions.find(t => t.id === typeId);
                        return type ? (
                          <span key={typeId} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {type.label}
                            <button
                              onClick={() => handleAgentTypeChange(typeId, false)}
                              className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default ConversationFilters;
