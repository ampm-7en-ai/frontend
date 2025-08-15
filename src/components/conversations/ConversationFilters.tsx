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
    { id: 'Unresolved', label: 'Open' },
    { id: 'Resolved', label: 'Resolved' }
  ];

  const channelOptions = [
    { 
      id: 'whatsapp', 
      label: 'WhatsApp',
      logo: (
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </div>
      )
    },
    { 
      id: 'email', 
      label: 'Ticket',
      logo: (
        <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
      )
    },
    { 
      id: 'website', 
      label: 'Website',
      logo: (
        <div className="w-5 h-5 rounded bg-purple-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
      )
    },
    { 
      id: 'slack', 
      label: 'Slack',
      logo: (
        <div className="w-5 h-5 rounded bg-pink-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
          </svg>
        </div>
      )
    },
    { 
      id: 'instagram', 
      label: 'Instagram',
      logo: (
        <div className="w-5 h-5 rounded bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
      )
    }
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
    <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 py-[12px]">
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
            <PopoverContent className="w-80 p-0 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border border-gray-200/50 dark:border-slate-700/50 shadow-xl z-[9999] rounded-xl" align="end" side="right">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-semibold text-base text-slate-900 dark:text-slate-100">Filters</h4>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                {/* Channel Filters */}
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
                    Channels
                  </h5>
                  <div className="space-y-3">
                    {channelOptions.map((option) => (
                      <div key={option.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100/50 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group backdrop-blur-sm">
                        <label 
                          htmlFor={`channel-${option.id}`}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          {option.logo}
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                            {option.label}
                          </span>
                        </label>
                        <Checkbox
                          id={`channel-${option.id}`}
                          checked={channelFilter.includes(option.id)}
                          onCheckedChange={(checked) => handleChannelChange(option.id, !!checked)}
                          className="rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Agent Type Filters */}
                <div>
                  <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
                    Agent Types
                  </h5>
                  <div className="space-y-3">
                    {agentTypeOptions.map((option) => (
                      <div key={option.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100/50 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group backdrop-blur-sm">
                        <label 
                          htmlFor={`agent-${option.id}`}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <span className="text-lg">{option.icon}</span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                            {option.label}
                          </span>
                        </label>
                        <Checkbox
                          id={`agent-${option.id}`}
                          checked={agentTypeFilter.includes(option.id)}
                          onCheckedChange={(checked) => handleAgentTypeChange(option.id, !!checked)}
                          className="rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                        Active Filters
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {channelFilter.map(channelId => {
                          const channel = channelOptions.find(c => c.id === channelId);
                          return channel ? (
                            <span key={channelId} className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-blue-50/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
                              <span className="scale-75">{channel.logo}</span>
                              {channel.label}
                              <button
                                onClick={() => handleChannelChange(channelId, false)}
                                className="hover:bg-blue-100/50 dark:hover:bg-blue-800/30 rounded-full p-0.5 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ) : null;
                        })}
                        {agentTypeFilter.map(typeId => {
                          const type = agentTypeOptions.find(t => t.id === typeId);
                          return type ? (
                            <span key={typeId} className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-slate-100/80 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                              <span>{type.icon}</span>
                              {type.label}
                              <button
                                onClick={() => handleAgentTypeChange(typeId, false)}
                                className="hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-full p-0.5 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
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
