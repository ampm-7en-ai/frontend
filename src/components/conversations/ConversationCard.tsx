
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, MessageSquare, Phone, Mail, Slack } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Conversation {
  id: string;
  customer: string;
  email: string;
  lastMessage: string;
  time: string;
  status: 'active' | 'pending' | 'closed';
  agent: string;
  satisfaction: 'high' | 'medium' | 'low';
  priority: 'high' | 'normal' | 'low';
  duration: string;
  handoffCount: number;
  topic: string;
  messages: any[];
  channel?: string;
}

interface ConversationCardProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

const ConversationCard = ({ 
  conversation, 
  isSelected, 
  onClick
}: ConversationCardProps) => {
  // Get avatar background color based on the first letter
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500", "bg-emerald-500", "bg-purple-500", 
      "bg-amber-500", "bg-rose-500", "bg-indigo-500"
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };
  
  // Get channel icon
  const getChannelIcon = () => {
    const iconProps = { className: "h-4 w-4 text-white", strokeWidth: 2 };
    
    switch (conversation.channel?.toLowerCase()) {
      case 'email':
        return <Mail {...iconProps} />;
      case 'phone':
        return <Phone {...iconProps} />;
      case 'slack':
        return <Slack {...iconProps} />;
      case 'instagram':
        return <Mail {...iconProps} />; // Using Mail as placeholder for Instagram
      default:
        return <MessageSquare {...iconProps} />;
    }
  };

  return (
    <Card 
      className={cn(
        "hover:bg-gray-50 transition-all duration-200 cursor-pointer border-0 shadow-none",
        isSelected 
          ? "bg-blue-50/40" 
          : "bg-transparent"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Avatar className={cn("h-9 w-9", getAvatarColor(conversation.customer))}>
            <AvatarFallback className="text-white flex items-center justify-center">
              {getChannelIcon()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-800 text-sm truncate">
                {conversation.customer}
              </h3>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                {conversation.time}
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {conversation.lastMessage}
            </p>
            
            <div className="mt-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1 text-gray-400" />
                  {conversation.duration}
                </div>
                {conversation.handoffCount > 0 && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="h-3 w-3 mr-1 text-gray-400" />
                    {conversation.handoffCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationCard;
