
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
  isUnread?: boolean;
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
    const iconClass = "h-5 w-5";
    const containerClass = "w-full h-full flex items-center justify-center rounded-lg border transition-colors";
    
    switch (conversation.channel?.toLowerCase()) {
      case 'email':
        return (
          <div className={cn(containerClass, "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800")}>
            <Mail className={cn(iconClass, "text-blue-600 dark:text-blue-400")} strokeWidth={2} />
          </div>
        );
      case 'phone':
        return (
          <div className={cn(containerClass, "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700")}>
            <Phone className={cn(iconClass, "text-slate-600 dark:text-slate-400")} strokeWidth={2} />
          </div>
        );
      case 'slack':
        return (
          <div className={cn(containerClass, "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800")}>
            <Slack className={cn(iconClass, "text-purple-600 dark:text-purple-400")} strokeWidth={2} />
          </div>
        );
      case 'instagram':
        return (
          <div className={cn(containerClass, "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800")}>
            <Instagram className={cn(iconClass, "text-pink-600 dark:text-pink-400")} strokeWidth={2} />
          </div>
        );
      case 'website':
        return (
          <div className={cn(containerClass, "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800")}>
            <Globe className={cn(iconClass, "text-green-600 dark:text-green-400")} strokeWidth={2} />
          </div>
        );
      case 'whatsapp':
      default:
        return (
          <div className={cn(containerClass, "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 relative")}>
            <MessageSquare className={cn(iconClass, "text-green-600 dark:text-green-400")} strokeWidth={2} />
            {conversation.agentType && (
              <span className='absolute -bottom-1 -right-1 text-[8px] text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 px-1 py-0.5 shadow-sm rounded-full border border-gray-200 dark:border-slate-600 font-medium'>
                {conversation.agentType === 'ai' ? 'AI' : 'H'}
              </span>
            )}
          </div>
        );
    }
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
        "hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer border-0 shadow-none rounded-xl bg-transparent",
        isSelected 
          ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800 shadow-sm" 
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
                  "text-gray-800 dark:text-slate-200 text-sm truncate", 
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
                  conversation.isUnread ? "font-medium text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-slate-500"
                )}>
                  {reformatTimeAgo(conversation.time)}
                </p>
              </div>
            </div>
            
            <p className={cn(
              "text-xs mt-1 line-clamp-2 leading-relaxed",
              conversation.isUnread ? "font-medium text-gray-700 dark:text-slate-300" : "text-gray-500 dark:text-slate-400"
            )}>
              {conversation.lastMessage}
            </p>
            
            <div className="mt-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {conversation.handoffCount > 0 && (
                  <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800">
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
