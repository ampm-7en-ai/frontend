
import React from 'react';
import { Filter, X } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ModernDropdown } from '@/components/ui/modern-dropdown';

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
      value: 'email', 
      label: 'Email', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg' 
    },
    { 
      value: 'website', 
      label: 'Website', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Globe_icon.svg' 
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
      if (value === 'email') {
        setChannelFilter(['ticketing']);
      } else {
        setChannelFilter([...channelFilter, value]);
      }
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
        className="w-80 p-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-2xl"
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
              className="rounded-full p-2 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm opacity-70 hover:opacity-100 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-6 max-h-96 overflow-y-auto">
            
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
                className="bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm h-8 text-xs"
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
                  <div key={channel.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <Checkbox
                      id={`channel-${channel.value}`}
                      checked={
                        channelFilter.includes(channel.value) || 
                        (channel.value === 'email' && channelFilter.includes('ticketing'))
                      }
                      onCheckedChange={() => handleChannelChange(channel.value)}
                      className="rounded-md"
                    />
                    <Label 
                      htmlFor={`channel-${channel.value}`}
                      className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer flex-1 flex items-center gap-3"
                    >
                      <img 
                        src={channel.logo} 
                        alt={channel.label}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
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
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
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
                className="w-full px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100/60 dark:bg-slate-800/60 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors backdrop-blur-sm"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ConversationFiltersDrawer;
