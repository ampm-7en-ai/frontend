import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, MessageSquare, Phone, Mail, Slack, Instagram, Globe2, Globe, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import DeleteConversationDialog from './DeleteConversationDialog';
import { Icon } from '../icons';

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
  onDelete?: (id: string) => Promise<void>;
}

const ConversationCard = ({ 
  conversation, 
  isSelected, 
  onClick,
  onDelete
}: ConversationCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };
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
        ticketIcon.innerHTML = `<svg class="${iconClass} text-orange-600 dark:text-orange-400" stroke-width="2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 8v11a3 3 0 0 1-3 3H6a3 3 0 0 1-3 3V8m18 0-9 5L3 8m18 0V5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v3"></path></svg>`;
        return ticketIcon;
      case 'phone':
        const phoneIcon = document.createElement('div');
        phoneIcon.innerHTML = `<svg class="${iconClass} text-slate-600 dark:text-slate-400" stroke-width="2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
        return phoneIcon;
      case 'playground':
        const playgroundIcon = document.createElement('div');
        playgroundIcon.innerHTML = `<svg fill="none" class="${iconClass} text-slate-600 dark:text-slate-400">
        <path d="M7.93758 5.54135L4.37501 4.35382M7.93758 5.54135V10.1252M7.93758 5.54135L11.688 4.29122M4.37501 4.35382L1.68694 3.4578M4.37501 4.35382C4.25627 4.49932 4.18719 4.68414 4.18719 4.88088V8.80149M4.37501 4.35382C4.46953 4.23799 4.59554 4.1471 4.74324 4.09497L8.05123 2.92744M7.93758 10.1252V14.2923M7.93758 10.1252L4.18719 8.80149M7.93758 10.1252L11.688 8.80558M4.18719 8.80149L0.853516 7.6249M4.18719 8.80149V13.3894M11.688 8.80558L15.0217 7.6249M11.688 8.80558V4.29122M11.688 8.80558V13.3894M11.688 4.29122L14.1882 3.4578M11.688 4.29122L8.05123 2.92744M8.05123 2.92744L5.02061 1.79096M8.05123 2.92744L11.2713 1.79096M8.49234 0.736628L13.9096 2.64859C14.576 2.8838 15.0217 3.51369 15.0217 4.2204V10.7342C15.0217 11.3799 14.6488 11.9675 14.0645 12.2424L8.64732 14.7917C8.19781 15.0032 7.67736 15.0032 7.22785 14.7917L1.81062 12.2424C1.22641 11.9675 0.853516 11.3799 0.853516 10.7342V4.2204C0.853516 3.51369 1.29918 2.8838 1.9656 2.64859L7.38283 0.736627C7.74181 0.609926 8.13335 0.609926 8.49234 0.736628Z" stroke="white" stroke-width="1.0001" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `;
        return playgroundIcon;
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
          <div className={cn(containerClass, "bg-white dark:bg-neutral-800 border border-gray-200 dark:border-none")}>
            <Icon name={`Ticket`} type='plain' color='hsl(var(--primary))' />
          </div>
        );
      case 'phone':
        return (
          <div className={cn(containerClass, "bg-white dark:bg-neutral-800 border border-gray-200 dark:border-none")}>
            <Phone className={cn(iconClass, "text-slate-600 dark:text-slate-400")} strokeWidth={2} />
          </div>
        );
      case 'website':
        return (
          <div className={cn(containerClass, "bg-white dark:bg-neutral-800 border border-gray-200 dark:border-none")}>
            <Icon name={`WebPage`} type='plain' color='hsl(var(--primary))' />
          </div>
        );
      case 'playground':
        return (
          <div className={cn(containerClass, "bg-white dark:bg-neutral-800 border border-gray-200 dark:border-none")}>
            <Icon name={`Playground`} type='plain' color='hsl(var(--primary))' />
          </div>
        );
      case 'whatsapp':
      default:
        return (
          <div className={cn(containerClass, "bg-white dark:bg-neutral-800 border border-gray-200 dark:border-none relative")}>
            <MessageSquare className={cn(iconClass, "text-neutral-600 dark:text-neutral-400")} strokeWidth={2} />
           
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

  const escapeHTML = (str) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/html');
  const safeText = doc.body.textContent; // Extracts "Hello" as plain text
  return safeText;
};

  return (
    <>
      <Card 
        className={cn(
          "hover:!bg-gray-100/50 dark:hover:!bg-neutral-700/50 transition-all duration-200 cursor-pointer shadow-none rounded-xl !bg-transparent relative group",
          isSelected 
            ? "!bg-gray-100/50 dark:!bg-neutral-700/50" 
            : ""
        )}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      <CardContent className="p-4 pb-1">
        <div className="flex items-start gap-3">
          {getChannelIcon()}
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  "text-foreground dark:text-foreground text-sm truncate", 
                  conversation.isUnread ? "font-semibold" : "font-medium"
                )}>
                  {conversation.customer || "Visitor"}
                </h3>
                {conversation.isUnread && (
                  <span className="inline-block w-2 h-2 bg-orange-500 rounded-full shadow-sm"></span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <p className={cn(
                    "text-xs whitespace-nowrap",
                    conversation.isUnread ? "font-medium text-orange-600 dark:text-orange-400" : "text-neutral-400 dark:text-neutral-600"
                  )}>
                    {reformatTimeAgo(conversation.time)}
                  </p>
                </div>
              </div>
            </div>
            <div className='flex items-center'>
              
              <p className={cn(
                "text-xs truncate leading-relaxed flex-1",
                conversation.isUnread ? "font-medium text-gray-700 dark:text-muted-foreground" : "text-muted-foreground dark:text-muted-foreground"
              )}>
                {escapeHTML(conversation.lastMessage)}
              </p>
              {onDelete && (isHovered || isSelected) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 text-muted-foreground hover:bg-transparent dark:hover:bg-transparent opacity-0 group-hover:opacity-100 transition-all"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
            </div>
            
            
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
    
    <DeleteConversationDialog
      open={showDeleteDialog}
      onOpenChange={setShowDeleteDialog}
      conversationId={conversation.id}
      customerName={conversation.customer || "Visitor"}
      onDelete={handleDelete}
      isDeleting={isDeleting}
    />
  </>
  );
};

export default ConversationCard;
