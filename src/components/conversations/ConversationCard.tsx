
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, MessageSquare, Phone, Mail, Slack, Instagram, Globe2, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
  isUnread?: boolean; // Added isUnread property
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
          <div className="bg-blue-600/10 w-full h-full flex items-center justify-center rounded-lg border border-blue-200/50">
            <Mail className="h-5 w-5 text-blue-600" strokeWidth={2} />
          </div>
        );
      case 'phone':
        return (
          <div className="bg-slate-100 w-full h-full flex items-center justify-center rounded-lg border border-slate-200/50">
            <Phone className="h-5 w-5 text-slate-600" strokeWidth={2} />
          </div>
        );
      case 'slack':
        return (
          <div className="bg-purple-100 w-full h-full flex items-center justify-center rounded-lg border border-purple-200/50">
            <Slack className="h-5 w-5 text-purple-600" strokeWidth={2} />
          </div>
        );
      case 'instagram':
        return (
          <div className="bg-pink-100 w-full h-full flex items-center justify-center rounded-lg border border-pink-200/50">
            <Instagram className="h-5 w-5 text-pink-600" strokeWidth={2} />
          </div>
        );
      case 'website':
        return (
          <div className="bg-green-100 w-full h-full flex items-center justify-center rounded-lg border border-green-200/50">
            <Globe className="h-5 w-5 text-green-600" strokeWidth={2} />
          </div>
        );
      case 'whatsapp':
      default:
        return (
          <div className="bg-green-500/10 w-full h-full flex items-center justify-center rounded-lg border border-green-200/50 relative">
            <MessageSquare className="h-5 w-5 text-green-600" strokeWidth={2} />
            {conversation.agentType && (
              <span className='absolute -bottom-1 -right-1 text-[8px] text-gray-600 bg-white px-1 py-0.5 shadow-sm rounded-full border border-gray-200 font-medium'>
                {conversation.agentType === 'ai' ? 'AI' : 'H'}
              </span>
            )}
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
        "hover:bg-gray-50/60 transition-all duration-200 cursor-pointer border-0 shadow-none rounded-xl bg-transparent",
        isSelected 
          ? "bg-blue-50/60 ring-1 ring-blue-200/50 shadow-sm" 
          : "hover:shadow-sm"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 rounded-none overflow-hidden shadow-sm">
            {getChannelIcon()}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  "text-gray-800 text-sm truncate", 
                  conversation.isUnread ? "font-semibold" : "font-medium"
                )}>
                  {conversation.customer || "Visitor"}
                </h3>
                {conversation.isUnread && (
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full shadow-sm"></span>
                )}
              </div>
              <div className="flex flex-col items-end">
                <p className={cn(
                  "text-xs whitespace-nowrap",
                  conversation.isUnread ? "font-medium text-blue-600" : "text-gray-400"
                )}>
                  {reformatTimeAgo(conversation.time)}
                </p>
              </div>
            </div>
            
            <p className={cn(
              "text-xs mt-1 line-clamp-2 leading-relaxed",
              conversation.isUnread ? "font-medium text-gray-700" : "text-gray-500"
            )}>
              {conversation.lastMessage}
            </p>
            
            <div className="mt-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {conversation.handoffCount > 0 && (
                  <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    <Users className="h-3 w-3 mr-1" />
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
