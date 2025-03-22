
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Clock, Info, X, Phone, Mail, Slack, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationHeaderProps {
  conversation: any;
  selectedAgent: string | null;
  setSelectedAgent: (agent: string | null) => void;
  onInfoClick: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

const ConversationHeader = ({ 
  conversation, 
  selectedAgent, 
  setSelectedAgent, 
  onInfoClick,
  getStatusBadge 
}: ConversationHeaderProps) => {
  // Get channel icon with brand-appropriate colors
  const getChannelIcon = () => {
    switch (conversation.channel?.toLowerCase()) {
      case 'email':
        return (
          <div className="bg-blue-600 w-full h-full flex items-center justify-center">
            <Mail className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        );
      case 'phone':
        return (
          <div className="bg-green-600 w-full h-full flex items-center justify-center">
            <Phone className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        );
      case 'slack':
        return (
          <div className="bg-purple-700 w-full h-full flex items-center justify-center">
            <Slack className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        );
      case 'instagram':
        return (
          <div className="bg-pink-600 w-full h-full flex items-center justify-center">
            <Mail className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        );
      default:
        return (
          <div className="bg-gray-600 w-full h-full flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        );
    }
  };

  return (
    <div className="border-b p-3 flex justify-between items-center bg-white">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 rounded-none overflow-hidden">
          {getChannelIcon()}
        </Avatar>
        <div>
          <div className="flex items-center">
            <h2 className="text-base font-semibold">{conversation.customer}</h2>
            <div className="ml-2">{getStatusBadge(conversation.status)}</div>
          </div>
          <div className="text-xs text-muted-foreground">{conversation.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {selectedAgent && (
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 border-primary/30 text-primary"
          >
            <Bot className="h-3 w-3" />
            Viewing: {selectedAgent}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAgent(null);
              }}
            />
          </Badge>
        )}
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          {conversation.duration}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={onInfoClick}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ConversationHeader;
