
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
      whatsapp: 'bg-green-100 text-green-700 border-green-200',
      email: 'bg-blue-100 text-blue-700 border-blue-200',
      website: 'bg-purple-100 text-purple-700 border-purple-200',
      phone: 'bg-orange-100 text-orange-700 border-orange-200',
      slack: 'bg-pink-100 text-pink-700 border-pink-200',
      instagram: 'bg-gradient-to-r from-pink-500 to-violet-500 text-white border-pink-300'
    };
    
    return (
      <Badge className={`text-xs px-2 py-1 rounded-lg border ${channelColors[channel as keyof typeof channelColors] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
        {channel?.charAt(0).toUpperCase() + channel?.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-600/50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600">
            <AvatarFallback className="text-white font-medium text-sm">
              {conversation.customer?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">{conversation.customer}</h3>
              {getStatusBadge(conversation.status)}
              {conversation.channel && getChannelBadge(conversation.channel)}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span>{messageCount} messages</span>
              {conversation.agent && (
                <span>Assigned to {conversation.agent}</span>
              )}
              {selectedAgent && (
                <span className="text-blue-600 dark:text-blue-400">Viewing {selectedAgent} messages</span>
              )}
            </div>
          </div>
        </div>
        
        {!hideActionButtons && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg">
              <Phone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg">
              <Video className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onInfoClick} className="h-8 w-8 p-0 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg">
              <Info className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg">
              <MoreHorizontal className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationHeader;
