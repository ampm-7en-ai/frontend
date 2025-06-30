
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
    const channelStyles = {
      whatsapp: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      email: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      website: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      phone: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      slack: 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
      instagram: 'bg-gradient-to-r from-pink-500 to-violet-500 text-white border-transparent'
    };
    
    return (
      <Badge className={`text-xs border ${channelStyles[channel as keyof typeof channelStyles] || 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'}`}>
        {channel?.charAt(0).toUpperCase() + channel?.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 rounded-lg">
          <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-300 font-medium rounded-lg">
            {conversation.customer?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">{conversation.customer}</h3>
            {getStatusBadge(conversation.status)}
            {conversation.channel && getChannelBadge(conversation.channel)}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hover:bg-white/50 dark:hover:bg-slate-800/50">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-white/50 dark:hover:bg-slate-800/50">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onInfoClick} className="hover:bg-white/50 dark:hover:bg-slate-800/50">
            <Info className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-white/50 dark:hover:bg-slate-800/50">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConversationHeader;
