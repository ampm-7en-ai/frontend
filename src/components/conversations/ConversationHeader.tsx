import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Info, Phone, Video, MoreHorizontal } from 'lucide-react';

interface ConversationHeaderProps {
  conversation: {
    id: string;
    customer: string;
    status: string;
    channel?: string;
    agent?: string;
    // ... other properties
  };
  selectedAgent: string | null;
  setSelectedAgent: (agent: string | null) => void;
  onInfoClick: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
  messageCount?: number;
  hideActionButtons?: boolean;
}

const ConversationHeader = ({
  conversation,
  selectedAgent,
  setSelectedAgent,
  onInfoClick,
  getStatusBadge,
  messageCount = 0,
  hideActionButtons = false
}: ConversationHeaderProps) => {
  const getChannelBadge = (channel: string) => {
    const channelColors = {
      whatsapp: 'bg-green-100 text-green-700',
      email: 'bg-blue-100 text-blue-700',
      website: 'bg-purple-100 text-purple-700',
      phone: 'bg-orange-100 text-orange-700',
      slack: 'bg-pink-100 text-pink-700',
      instagram: 'bg-gradient-to-r from-pink-500 to-violet-500 text-white'
    };
    
    return (
      <Badge className={`text-xs ${channelColors[channel as keyof typeof channelColors] || 'bg-gray-100 text-gray-700'}`}>
        {channel?.charAt(0).toUpperCase() + channel?.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
            {conversation.customer?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{conversation.customer}</h3>
            {getStatusBadge(conversation.status)}
            {conversation.channel && getChannelBadge(conversation.channel)}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{messageCount} messages</span>
            {conversation.agent && (
              <span>Assigned to {conversation.agent}</span>
            )}
            {selectedAgent && (
              <span className="text-blue-600">Viewing {selectedAgent} messages</span>
            )}
          </div>
        </div>
      </div>
      
      {!hideActionButtons && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onInfoClick}>
            <Info className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConversationHeader;
