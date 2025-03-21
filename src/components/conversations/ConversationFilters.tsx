
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Check, 
  X, 
  MessageSquare, 
  Instagram, 
  Slack, 
  Mail, 
  Phone,
  Tags,
  Filter
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

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
      
      <div className="flex gap-2 mt-4 items-center justify-between">
        <div className="flex gap-2">
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              Channels
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuCheckboxItem 
              checked={channelFilter === 'all'}
              onCheckedChange={() => setChannelFilter('all')}
            >
              All Channels
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem 
              checked={channelFilter === 'whatsapp'}
              onCheckedChange={() => setChannelFilter('whatsapp')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              WhatsApp
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={channelFilter === 'slack'}
              onCheckedChange={() => setChannelFilter('slack')}
              className="flex items-center gap-2"
            >
              <Slack className="h-3.5 w-3.5" />
              Slack
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={channelFilter === 'instagram'}
              onCheckedChange={() => setChannelFilter('instagram')}
              className="flex items-center gap-2"
            >
              <Instagram className="h-3.5 w-3.5" />
              Instagram
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={channelFilter === 'freshdesk'}
              onCheckedChange={() => setChannelFilter('freshdesk')}
              className="flex items-center gap-2"
            >
              <Mail className="h-3.5 w-3.5" />
              Freshdesk
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={channelFilter === 'phone'}
              onCheckedChange={() => setChannelFilter('phone')}
              className="flex items-center gap-2"
            >
              <Phone className="h-3.5 w-3.5" />
              Phone
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {channelFilter !== 'all' && (
        <div className="mt-3 flex items-center gap-2">
          <Tags className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            Filtering by: <span className="font-medium capitalize">{channelFilter}</span>
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 p-0"
            onClick={() => setChannelFilter('all')}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConversationFilters;
