
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
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'email', label: 'Email' },
    { id: 'website', label: 'Website' },
    { id: 'phone', label: 'Phone' },
    { id: 'slack', label: 'Slack' },
    { id: 'instagram', label: 'Instagram' }
  ];

  const agentTypeOptions = [
    { id: 'ai', label: 'AI Agents' },
    { id: 'human', label: 'Human Agents' }
  ];

  const hasActiveFilters = channelFilter !== 'all' || agentTypeFilter !== 'all';

  const clearAllFilters = () => {
    setChannelFilter('all');
    setAgentTypeFilter('all');
  };

  const handleChannelChange = (channelId: string, checked: boolean) => {
    if (checked) {
      setChannelFilter(channelId);
    } else if (channelFilter === channelId) {
      setChannelFilter('all');
    }
  };

  const handleAgentTypeChange = (typeId: string, checked: boolean) => {
    if (checked) {
      setAgentTypeFilter(typeId);
    } else if (agentTypeFilter === typeId) {
      setAgentTypeFilter('all');
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-center gap-4">
        <ModernTabNavigation
          tabs={statusTabs}
          activeTab={filterResolved}
          onTabChange={onFilterResolvedChange}
          className="text-xs"
        />
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <ModernButton
                variant={hasActiveFilters ? 'secondary' : 'outline'}
                size="sm"
                icon={Filter}
                className="text-xs"
              >
                Filters
              </ModernButton>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700" align="end">
              <div className="p-4">
                <h4 className="font-medium text-sm mb-3">Filter Options</h4>
                
                {/* Channel Filters */}
                <div className="mb-4">
                  <h5 className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    Channels
                  </h5>
                  <div className="space-y-2">
                    {channelOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`channel-${option.id}`}
                          checked={channelFilter === option.id}
                          onCheckedChange={(checked) => handleChannelChange(option.id, !!checked)}
                        />
                        <label 
                          htmlFor={`channel-${option.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Agent Type Filters */}
                <div className="mt-4">
                  <h5 className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    Agent Types
                  </h5>
                  <div className="space-y-2">
                    {agentTypeOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`agent-${option.id}`}
                          checked={agentTypeFilter === option.id}
                          onCheckedChange={(checked) => handleAgentTypeChange(option.id, !!checked)}
                        />
                        <label 
                          htmlFor={`agent-${option.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
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
    </div>
  );
};

export default ConversationFilters;
