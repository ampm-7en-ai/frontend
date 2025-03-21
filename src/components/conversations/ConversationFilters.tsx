
import React from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Filter
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
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
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search conversations"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="mb-4">
        <Select 
          value={channelFilter}
          onValueChange={setChannelFilter}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              {channelFilter === 'all' ? (
                <Filter className="h-4 w-4" />
              ) : channelFilter === 'whatsapp' ? (
                <MessageSquare className="h-4 w-4" />
              ) : channelFilter === 'slack' ? (
                <Slack className="h-4 w-4" />
              ) : channelFilter === 'instagram' ? (
                <Instagram className="h-4 w-4" />
              ) : channelFilter === 'freshdesk' ? (
                <Mail className="h-4 w-4" />
              ) : (
                <Phone className="h-4 w-4" />
              )}
              <SelectValue placeholder="Select Channel" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Channels</SelectLabel>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="whatsapp">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp</span>
                </div>
              </SelectItem>
              <SelectItem value="slack">
                <div className="flex items-center gap-2">
                  <Slack className="h-4 w-4" />
                  <span>Slack</span>
                </div>
              </SelectItem>
              <SelectItem value="instagram">
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
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
      </div>
      
      <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="all" className="text-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="unresolved" className="text-sm flex items-center gap-1">
            <X className="h-3.5 w-3.5" />
            Unresolved
          </TabsTrigger>
          <TabsTrigger value="resolved" className="text-sm flex items-center gap-1">
            <Check className="h-3.5 w-3.5" />
            Resolved
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {channelFilter !== 'all' && (
        <div className="mt-4 flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm">
          <span className="font-medium">Active filter:</span>
          <span className="flex items-center gap-1.5 text-muted-foreground capitalize">
            {channelFilter === 'whatsapp' ? (
              <><MessageSquare className="h-3.5 w-3.5" /> WhatsApp</>
            ) : channelFilter === 'slack' ? (
              <><Slack className="h-3.5 w-3.5" /> Slack</>
            ) : channelFilter === 'instagram' ? (
              <><Instagram className="h-3.5 w-3.5" /> Instagram</>
            ) : channelFilter === 'freshdesk' ? (
              <><Mail className="h-3.5 w-3.5" /> Freshdesk</>
            ) : (
              <><Phone className="h-3.5 w-3.5" /> Phone</>
            )}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 p-0 ml-auto"
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
