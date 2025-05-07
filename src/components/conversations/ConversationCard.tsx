
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, MessageSquare, Phone, Mail, Slack, Instagram, Globe2, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { json } from 'stream/consumers';

interface Conversation {
  id: string;
  customer: string;
  email: string | null;
  lastMessage: string;
  time: string;
  status: string;
  agent: string;
  satisfaction: string;
  priority: string;
  duration: string;
  handoffCount: number;
  topic: string[];
  channel: string;
  agentType?: "human" | "ai" | null;
  messages?: Array<any>;
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
  
  // Get channel icon with brand-appropriate colors
  const getChannelIcon = () => {
    switch (conversation.channel?.toLowerCase()) {
      case 'email':
        return (
          <div className="bg-blue-600 w-full h-full flex items-center justify-center rounded-sm">
            <Mail className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        );
      case 'phone':
        return (
          <div className="bg-blue-100 w-full h-full flex items-center justify-center rounded-sm">
            <Phone className="h-5 w-5 text-blue-500" strokeWidth={2.5} />
          </div>
        );
      case 'slack':
        return (
          <div className="bg-purple-100 w-full h-full flex items-center justify-center rounded-sm">
            <Slack className="h-5 w-5 text-purple-500" strokeWidth={2.5} />
          </div>
        );
      case 'instagram':
        return (
          <div className="bg-pink-100 w-full h-full flex items-center justify-center rounded-sm">
            <Instagram className="h-5 w-5 text-pink-500" strokeWidth={2.5} />
          </div>
        );
      case 'website':
        return (
          <div className="bg-green-100 w-full h-full flex items-center justify-center rounded-sm">
            <Globe className="h-5 w-5 text-green-500" strokeWidth={2.5} />
          </div>
        )
      case 'whatsapp':
      default:
        return (
          <div className="bg-green-500 w-full h-full flex items-center justify-center rounded-sm">
            <MessageSquare className="h-5 w-5 text-white" strokeWidth={2.5} />
            <span className='absolute bottom-[-8px] text-[9px] text-gray-600 bg-white px-0.5 py-0.25 shadow-md rounded-sm'>{conversation.agentType}</span>
          </div>
        );
    }
  };

  // Get channel name with proper capitalization
  const getChannelName = () => {
    if (!conversation.channel) return 'Chat';
    return conversation.channel.charAt(0).toUpperCase() + conversation.channel.slice(1).toLowerCase();
  };

  //reformat date timestamp 
  const reformatTimeAgo = (timeString) => {
  
  // Extract all numbers followed by time units
  const matches = timeString.match(/(\d+)\s*(day|hour|minute|d|h|m)s?/gi);
  let result = '';
  
  if (!matches) return 'Just now';
  
  matches.forEach(match => {
    const [_, number, unit] = match.match(/(\d+)\s*(day|hour|minute|d|h|m)s?/i);
    
    if (unit.toLowerCase().startsWith('d')) {
      result += `${number}d `;
    } else if (unit.toLowerCase().startsWith('h')) {
      result += `${number}h `;
    } else if (unit.toLowerCase().startsWith('m')) {
      result += `${number}m `;
    }
  });
  
  return result.trim() + ' ago';

  }

  return (
    <Card 
      className={cn(
        "hover:bg-gray-50 transition-all duration-200 cursor-pointer border-0 shadow-none rounded-md",
        isSelected 
          ? "bg-accent" 
          : "bg-transparent"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 rounded-none overflow-visible">
            {getChannelIcon()}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-800 text-sm truncate">
                  {conversation.customer || "Visitor"}
                </h3>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xs text-gray-600 whitespace-nowrap">
                  <p className="text-xs text-gray-400 mt-0.5">
                    {reformatTimeAgo(conversation.time)}
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
              {conversation.lastMessage}
            </p>
            
            <div className="mt-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
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
