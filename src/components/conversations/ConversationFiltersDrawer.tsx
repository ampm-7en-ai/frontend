
import React from 'react';
import { Filter, Search, X } from 'lucide-react';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

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
  availableAgents
}: ConversationFiltersDrawerProps) => {
  const [agentSearchQuery, setAgentSearchQuery] = React.useState('');

  const channelOptions = [
    { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'website', label: 'Website', icon: '🌐' },
    { value: 'ticketing', label: 'Ticket', icon: '🎫' },
    { value: 'slack', label: 'Slack', icon: '💬' },
    { value: 'instagram', label: 'Instagram', icon: '📸' }
  ];

  const filteredAgents = availableAgents.filter(agent =>
    agent.toLowerCase().includes(agentSearchQuery.toLowerCase())
  );

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
    const isSelected = agentNameFilter.includes(value);
    if (isSelected) {
      setAgentNameFilter(agentNameFilter.filter(id => id !== value));
    } else {
      setAgentNameFilter([...agentNameFilter, value]);
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
    setAgentSearchQuery('');
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl max-h-[70vh]">
        <DrawerHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-500" />
              Filter Conversations
            </DrawerTitle>
            <DrawerClose asChild>
              <button className="rounded-full p-2 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm opacity-70 hover:opacity-100 transition-all">
                <X className="h-4 w-4" />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="px-6 pb-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Agent Name Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Agent Name
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search agents..."
                    value={agentSearchQuery}
                    onChange={(e) => setAgentSearchQuery(e.target.value)}
                    className="pl-10 bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredAgents.length > 0 ? (
                  filteredAgents.map((agent) => (
                    <div key={agent} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <Checkbox
                        id={`agent-${agent}`}
                        checked={agentNameFilter.includes(agent)}
                        onCheckedChange={() => handleAgentNameChange(agent)}
                        className="rounded-md"
                      />
                      <Label 
                        htmlFor={`agent-${agent}`}
                        className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer flex-1"
                      >
                        {agent}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                    No agents found
                  </p>
                )}
              </div>
            </div>

            <Separator orientation="vertical" className="hidden md:block" />

            {/* Channel Column */}
            <div className="space-y-4">
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
                      className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer flex-1 flex items-center gap-2"
                    >
                      <span className="text-base">{channel.icon}</span>
                      {channel.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator orientation="vertical" className="hidden md:block" />

            {/* Agent Type Column */}
            <div className="space-y-4">
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
                    className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer flex-1 flex items-center gap-2"
                  >
                    <span className="text-base">👤</span>
                    Human Agents
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Clear All Button */}
          <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={clearAllFilters}
              className="w-full px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100/60 dark:bg-slate-800/60 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors backdrop-blur-sm"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ConversationFiltersDrawer;
