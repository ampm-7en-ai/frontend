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
  // Channel logo mapping
  const channelLogos = {
    'whatsapp': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
    'slack': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
    'instagram': 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
    'messenger': 'https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg'
  };

  // Get channel icon with brand-appropriate colors and modern circular design
  const getChannelIcon = () => {
    const containerClass = "w-11 h-11 flex items-center justify-center rounded-2xl transition-colors relative";
    const channel = conversation.channel?.toLowerCase();
    const logoUrl = channelLogos[channel];
    
    if (logoUrl) {
      return (
        <div className={cn(containerClass, "bg-white dark:bg-neutral-800 border border-gray-200 dark:border-slate-700")}>
          <img 
            src={logoUrl} 
            alt={conversation.channel}
            className="w-6 h-6 object-contain"
            onError={(e) => {
              // Fallback to icon if image fails
              e.currentTarget.style.display = 'none';
              const fallbackIcon = getFallbackIcon();
              if (fallbackIcon && e.currentTarget.parentNode) {
                e.currentTarget.parentNode.appendChild(fallbackIcon);
              }
            }}
          />
          {conversation.agentType && (
            <span className='absolute -bottom-0.5 -right-0.5 text-[8px] text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 px-1 py-0.5 shadow-sm rounded-full border border-gray-200 dark:border-slate-600 font-medium'>
              {conversation.agentType === 'ai' ? 'AI' : 'H'}
            </span>
          )}
        </div>
      );
    }

    // Fallback to original icon logic
    return getFallbackIconContainer();
  };

  const getFallbackIcon = () => {
    const iconClass = "h-5 w-5";
    
    switch (conversation.channel?.toLowerCase()) {
      case 'ticketing':
        const ticketIcon = document.createElement('div');
        ticketIcon.innerHTML = `<svg class="${iconClass} text-blue-600 dark:text-blue-400" stroke-width="2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 8v11a3 3 0 0 1-3 3H6a3 3 0 0 1-3 3V8m18 0-9 5L3 8m18 0V5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v3"></path></svg>`;
        return ticketIcon;
      case 'phone':
        const phoneIcon = document.createElement('div');
        phoneIcon.innerHTML = `<svg class="${iconClass} text-slate-600 dark:text-slate-400" stroke-width="2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
        return phoneIcon;
      default:
        const messageIcon = document.createElement('div');
        messageIcon.innerHTML = `<svg class="${iconClass} text-green-600 dark:text-green-400" stroke-width="2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
        return messageIcon;
    }
  };

  const getFallbackIconContainer = () => {
    const iconClass = "h-5 w-5";
    const containerClass = "w-11 h-11 flex items-center justify-center rounded-2xl transition-colors relative";
    
    switch (conversation.channel?.toLowerCase()) {
      case 'ticketing':
        return (
          <div className={cn(containerClass, "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700")}>
            <Mail className={cn(iconClass, "text-blue-600 dark:text-blue-400")} strokeWidth={2} />
            {conversation.agentType && (
              <span className='absolute -bottom-0.5 -right-0.5 text-[8px] text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 px-1 py-0.5 shadow-sm rounded-full border border-gray-200 dark:border-slate-600 font-medium'>
                {conversation.agentType === 'ai' ? 'AI' : 'H'}
              </span>
            )}
          </div>
        );
      case 'phone':
        return (
          <div className={cn(containerClass, "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700")}>
            <Phone className={cn(iconClass, "text-slate-600 dark:text-slate-400")} strokeWidth={2} />
            {conversation.agentType && (
              <span className='absolute -bottom-0.5 -right-0.5 text-[8px] text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 px-1 py-0.5 shadow-sm rounded-full border border-gray-200 dark:border-slate-600 font-medium'>
                {conversation.agentType === 'ai' ? 'AI' : 'H'}
              </span>
            )}
          </div>
        );
      case 'website':
        return (
          <div className={cn(containerClass, "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700")}>
            <Globe className={cn(iconClass, "text-green-600 dark:text-green-400")} strokeWidth={2} />
            {conversation.agentType && (
              <span className='absolute -bottom-0.5 -right-0.5 text-[8px] text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 px-1 py-0.5 shadow-sm rounded-full border border-gray-200 dark:border-slate-600 font-medium'>
                {conversation.agentType === 'ai' ? 'AI' : 'H'}
              </span>
            )}
          </div>
        );
      case 'whatsapp':
      default:
        return (
          <div className={cn(containerClass, "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 relative")}>
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
        "hover:!bg-gray-100/50 dark:hover:!bg-neutral-700/50 transition-all duration-200 cursor-pointer shadow-none rounded-xl !bg-transparent",
        isSelected 
          ? "!bg-gray-100/50 dark:!bg-neutral-700/50" 
          : ""
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
