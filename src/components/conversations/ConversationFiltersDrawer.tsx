
import React from 'react';
import { Filter, X, Mail, Globe } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConversationFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelFilter: string[];
  setChannelFilter: (channels: string[]) => void;
  agentTypeFilter: string[];
  setAgentTypeFilter: (types: string[]) => void;
  agentNameFilter: string[];
  setAgentNameFilter: (agents: string[]) => void;
  availableAgents: string[];
  trigger: React.ReactNode;
}

const ConversationFiltersDrawer = ({
  open,
  onOpenChange,
  channelFilter,
  setChannelFilter,
  agentTypeFilter,
  setAgentTypeFilter,
  agentNameFilter,
  setAgentNameFilter,
  availableAgents,
  trigger
}: ConversationFiltersDrawerProps) => {
  const channelOptions = [
    { 
      value: 'whatsapp', 
      label: 'WhatsApp', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg' 
    },
    { 
      value: 'ticketing', 
      label: 'Ticket', 
      icon: Mail
    },
    { 
      value: 'website', 
      label: 'Website', 
      icon: Globe
    },
    { 
      value: 'slack', 
      label: 'Slack', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg' 
    },
    { 
      value: 'instagram', 
      label: 'Instagram', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png' 
    },
    { 
      value: 'messenger', 
      label: 'Messenger', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg' 
    }
  ];

  const agentOptions = availableAgents.map(agent => ({
    value: agent,
    label: agent
  }));

  const handleChannelChange = (value: string) => {
    const isSelected = channelFilter.includes(value);
    if (isSelected) {
      setChannelFilter(channelFilter.filter(id => id !== value));
    } else {
      setChannelFilter([...channelFilter, value]);
    }
  };

  const handleAgentNameChange = (value: string) => {
    if (value === '') {
      setAgentNameFilter([]);
    } else {
      const isSelected = agentNameFilter.includes(value);
      if (isSelected) {
        setAgentNameFilter(agentNameFilter.filter(id => id !== value));
      } else {
        setAgentNameFilter([...agentNameFilter, value]);
      }
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

  const clearAllFilters = () => {
    setChannelFilter([]);
    setAgentTypeFilter([]);
    setAgentNameFilter([]);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-2xl rounded-2xl"
        align="end"
        sideOffset={8}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Filter Conversations
              </h3>
            </div>
            <button 
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 bg-white/50 dark:bg-slate-600/50 backdrop-blur-sm opacity-70 hover:opacity-100 transition-all"
            >
              <X className="h-4 w-4 dark:text-gray-400" />
            </button>
          </div>

          <ScrollArea className="h-[500px] pr-4 [&>[data-radix-scroll-area-viewport]]:scrollbar-thin [&>[data-radix-scroll-area-viewport]]:scrollbar-track-transparent [&>[data-radix-scroll-area-viewport]]:scrollbar-thumb-slate-400/50 [&>[data-radix-scroll-area-viewport]]:hover:scrollbar-thumb-slate-400/80">
            <div className="space-y-6">
              
              {/* Agent Name Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Agent Name
                </Label>
                <ModernDropdown
                  value={agentNameFilter.length > 0 ? agentNameFilter[0] : ''}
                  onValueChange={handleAgentNameChange}
                  options={[
                    { value: '', label: 'All agents' },
                    ...agentOptions
                  ]}
                  placeholder="Select agent..."
                  className="bg-white/60 dark:bg-neutral-800/60 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm h-8 text-xs"
                />
              </div>

              <Separator className="bg-slate-200/60 dark:bg-slate-700/60" />

              {/* Channel Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Channels
                </Label>
                <div className="space-y-2">
                  {channelOptions.map((channel) => (
                    <div key={channel.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-600/30 backdrop-blur-sm transition-colors">
                      <Checkbox
                        id={`channel-${channel.value}`}
                        checked={channelFilter.includes(channel.value)}
                        onCheckedChange={() => handleChannelChange(channel.value)}
                        className="rounded-md"
                      />
                      <Label 
                        htmlFor={`channel-${channel.value}`}
                        className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer flex-1 flex items-center gap-3"
                      >
                        <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/60 dark:bg-slate-800/60 border border-gray-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                          {channel.logo ? (
                            <img 
                              src={channel.logo} 
                              alt={channel.label}
                              className="w-4 h-4 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : channel.icon ? (
                            <channel.icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          ) : null}
                        </div>
                        {channel.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-slate-200/60 dark:bg-slate-700/60" />

              {/* Agent Type Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Agent Type
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600/30 backdrop-blur-sm transition-colors">
                    <Checkbox
                      id="agent-type-human"
                      checked={agentTypeFilter.includes('human')}
                      onCheckedChange={() => handleAgentTypeChange('human')}
                      className="rounded-md"
                    />
                    <Label 
                      htmlFor="agent-type-human"
                      className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer flex-1 flex items-center gap-3"
                    >
                      <span className="text-lg">👤</span>
                      Human Agents
                    </Label>
                  </div>
                </div>
              </div>

              {/* Clear All Button */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                <button
                  onClick={clearAllFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors backdrop-blur-sm border border-slate-200/30 dark:border-slate-700/30"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ConversationFiltersDrawer;
