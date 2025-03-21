
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Check, X, MessageSquare, Instagram, Slack, Mail, Phone } from 'lucide-react';

interface ConversationFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  channelFilter: string;
  setChannelFilter: (channel: string) => void;
}

const ConversationFilters = ({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  channelFilter,
  setChannelFilter
}: ConversationFiltersProps) => {
  return (
    <div className="p-4 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search conversations"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="flex gap-2 mt-4">
        <Button 
          variant={filterStatus === 'all' ? "default" : "outline"} 
          size="sm" 
          onClick={() => setFilterStatus('all')}
          className="font-medium"
        >
          All
        </Button>
        <Button 
          variant={filterStatus === 'unresolved' ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilterStatus('unresolved')}
          className="flex items-center gap-1"
        >
          <X className="h-3.5 w-3.5" />
          Unresolved
        </Button>
        <Button 
          variant={filterStatus === 'resolved' ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilterStatus('resolved')}
          className="flex items-center gap-1"
        >
          <Check className="h-3.5 w-3.5" />
          Resolved
        </Button>
      </div>
      
      <div className="flex gap-2 mt-2 flex-wrap">
        <Button 
          variant={channelFilter === 'all' ? "secondary" : "outline"} 
          size="sm"
          onClick={() => setChannelFilter('all')}
          className="h-7"
        >
          All Channels
        </Button>
        <Button 
          variant={channelFilter === 'whatsapp' ? "secondary" : "outline"} 
          size="sm"
          onClick={() => setChannelFilter('whatsapp')}
          className="flex items-center gap-1 h-7"
        >
          <MessageSquare className="h-3 w-3" />
          WhatsApp
        </Button>
        <Button 
          variant={channelFilter === 'slack' ? "secondary" : "outline"} 
          size="sm"
          onClick={() => setChannelFilter('slack')}
          className="flex items-center gap-1 h-7"
        >
          <Slack className="h-3 w-3" />
          Slack
        </Button>
        <Button 
          variant={channelFilter === 'instagram' ? "secondary" : "outline"} 
          size="sm"
          onClick={() => setChannelFilter('instagram')}
          className="flex items-center gap-1 h-7"
        >
          <Instagram className="h-3 w-3" />
          Instagram
        </Button>
        <Button 
          variant={channelFilter === 'freshdesk' ? "secondary" : "outline"} 
          size="sm"
          onClick={() => setChannelFilter('freshdesk')}
          className="flex items-center gap-1 h-7"
        >
          <Mail className="h-3 w-3" />
          Freshdesk
        </Button>
        <Button 
          variant={channelFilter === 'phone' ? "secondary" : "outline"} 
          size="sm"
          onClick={() => setChannelFilter('phone')}
          className="flex items-center gap-1 h-7"
        >
          <Phone className="h-3 w-3" />
          Phone
        </Button>
      </div>
    </div>
  );
};

export default ConversationFilters;
