
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Instagram, 
  Slack, 
  Mail, 
  Phone,
  User,
  Bot
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConversationFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  channelFilter: string;
  setChannelFilter: (channel: string) => void;
  agentTypeFilter: string;
  setAgentTypeFilter: (type: string) => void;
}

const ConversationFilters = ({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  channelFilter,
  setChannelFilter,
  agentTypeFilter,
  setAgentTypeFilter
}: ConversationFiltersProps) => {
  return (
    <div className="border-b">
      {/* Status filter tabs with only two options */}
      <Tabs defaultValue="unresolved" value={filterStatus} onValueChange={setFilterStatus} className="w-full mb-2 pt-2">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="unresolved" className="text-sm">
            Unresolved
          </TabsTrigger>
          <TabsTrigger value="resolved" className="text-sm">
            Resolved
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="p-2 grid grid-cols-2 gap-2">
        <Select 
          value={channelFilter}
          onValueChange={setChannelFilter}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Channels</SelectLabel>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="instagram">
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
                </div>
              </SelectItem>
              <SelectItem value="slack">
                <div className="flex items-center gap-2">
                  <Slack className="h-4 w-4" />
                  <span>Slack</span>
                </div>
              </SelectItem>
              <SelectItem value="whatsapp">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp</span>
                </div>
              </SelectItem>
              <SelectItem value="freshdesk">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Freshdesk</span>
                </div>
              </SelectItem>
              <SelectItem value="phone">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Phone</span>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select 
          value={agentTypeFilter}
          onValueChange={setAgentTypeFilter}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Agent Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Agent Type</SelectLabel>
              <SelectItem value="all">All Agents</SelectItem>
              <SelectItem value="human">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Human</span>
                </div>
              </SelectItem>
              <SelectItem value="ai">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <span>AI Agent</span>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ConversationFilters;
