
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
  // Get channel icon with brand-appropriate colors and modern circular design
  const getChannelIcon = () => {
    const iconClass = "h-5 w-5";
    const containerClass = "w-11 h-11 flex items-center justify-center rounded-2xl transition-colors";
    
    switch (conversation.channel?.toLowerCase()) {
      case 'email':
        return (
          <div className={cn(containerClass, "bg-blue-100 dark:bg-blue-900/30")}>
            <Mail className={cn(iconClass, "text-blue-600 dark:text-blue-400")} strokeWidth={2} />
          </div>
        );
      case 'phone':
        return (
          <div className={cn(containerClass, "bg-slate-100 dark:bg-slate-800")}>
            <Phone className={cn(iconClass, "text-slate-600 dark:text-slate-400")} strokeWidth={2} />
          </div>
        );
      case 'slack':
        return (
          <div className={cn(containerClass, "bg-purple-100 dark:bg-purple-900/30")}>
            <Slack className={cn(iconClass, "text-purple-600 dark:text-purple-400")} strokeWidth={2} />
          </div>
        );
      case 'instagram':
        return (
          <div className={cn(containerClass, "bg-gradient-to-br from-pink-500 to-violet-500")}>
            <Instagram className={cn(iconClass, "text-white")} strokeWidth={2} />
          </div>
        );
      case 'website':
        return (
          <div className={cn(containerClass, "bg-green-100 dark:bg-green-900/30")}>
            <Globe className={cn(iconClass, "text-green-600 dark:text-green-400")} strokeWidth={2} />
          </div>
        );
      case 'whatsapp':
      default:
        return (
          <div className={cn(containerClass, "bg-green-100 dark:bg-green-900/30 relative")}>
            <MessageSquare className={cn(iconClass, "text-green-600 dark:text-green-400")} strokeWidth={2} />
            {conversation.agentType && (
              <span className='absolute -bottom-0.5 -right-0.5 text-[8px] text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 px-1 py-0.5 shadow-sm rounded-full border border-gray-200 dark:border-slate-600 font-medium'>
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
          ? "bg-gray-50 dark:bg-slate-700/50 ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm" 
          : "hover:shadow-sm"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 pb-1">
        <div className="flex items-start gap-3">
          {getChannelIcon()}
          
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
              "text-xs truncate leading-relaxed",
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
