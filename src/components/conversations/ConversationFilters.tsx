
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Instagram, 
  Slack, 
  Mail, 
  Phone,
  User,
  Bot,
  CheckCircle,
  AlertCircle
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
      {/* Status filter with toggle buttons instead of tabs */}
      <div className="px-2 pt-2 flex items-center">
        <div className="flex gap-2 w-full bg-muted rounded-md p-1">
          <Button
            variant={filterStatus === "unresolved" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterStatus("unresolved")}
            className="w-full flex items-center justify-center gap-2 rounded-md"
          >
            <AlertCircle className="h-4 w-4" />
            <span>Unresolved</span>
          </Button>
          <Button
            variant={filterStatus === "resolved" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterStatus("resolved")}
            className="w-full flex items-center justify-center gap-2 rounded-md"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Resolved</span>
          </Button>
        </div>
      </div>
      
      <div className="px-2 pb-2 grid grid-cols-2 gap-2">
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
