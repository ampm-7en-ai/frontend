import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ModernButton from '@/components/dashboard/ModernButton';
import { Info, Phone, Video, MoreHorizontal, CheckCircle, TicketPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import CreateSupportTicketModal from './CreateSupportTicketModal';
import { Icon } from '../icons';

interface ConversationHeaderProps {
  conversation: {
    id: string;
    customer: string;
    status: string;
    channel?: string;
    agent?: string;
    agentType?: string;
    // ... other properties
  };
  selectedAgent: string | null;
  setSelectedAgent: (agent: string | null) => void;
  onInfoClick: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
  messageCount?: number;
  hideActionButtons?: boolean;
  onConversationUpdate?: (updatedConversation: any) => void;
}

const ConversationHeader = ({
  conversation,
  selectedAgent,
  setSelectedAgent,
  onInfoClick,
  getStatusBadge,
  messageCount = 0,
  hideActionButtons = false,
  onConversationUpdate
}: ConversationHeaderProps) => {
  const { toast } = useToast();
  const [isResolving, setIsResolving] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const getChannelBadge = (channel: string) => {
    const isDefault = channel === 'website'; // You can adjust this logic based on your needs
    
    if (isDefault) {
      return (
        <Badge className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-xs">
          {channel?.charAt(0).toUpperCase() + channel?.slice(1)}
        </Badge>
      );
    }
    
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

  const handleResolveConversation = async () => {
    if (!conversation.id || conversation.status === 'Resolved') return;

    setIsResolving(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token available");
      }

      const response = await fetch(getApiUrl(`chatsessions/${conversation.id}/resolve/`), {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to resolve conversation: ${response.status}`);
      }

      const result = await response.json();
     

      // Update the conversation with the response data
      if (onConversationUpdate && result.data) {
         //console.log('Conversation resolved:', result);
        onConversationUpdate({
          ...conversation,
          ...result.data,
          status: result.data.chat_status || 'Resolved'
        });
      }

      toast({
        title: "Success",
        description: result.message || "Chat session marked as resolved successfully.",
      });
    } catch (error) {
      console.error('Error resolving conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resolve conversation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResolving(false);
    }
  };

  const handleTicketCreated = (updatedConversation: any) => {
    if (onConversationUpdate) {
      onConversationUpdate(updatedConversation);
    }
  };

  const isResolved = conversation.status === 'resolved';
  const isHumanAgent = conversation.agentType === 'human';
  const shouldShowCreateTicketButton = !isHumanAgent && 
    conversation.channel !== "ticketing" && 
    conversation.status !== 'Resolved';

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-neutral-200/60 dark:border-neutral-700/60 bg-white/70 dark:bg-[hsla(0,0%,0%,0.95)] backdrop-blur-sm py-[7px]">
        <div className="flex items-center gap-3">
          <Avatar className="w-11 h-11 rounded-2xl">
            <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium rounded-lg">
              <Icon type='plain' name={`Person`} color='hsl(var(--muted-foreground))' className='h-5 w-5' />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <div className="flex flex-col items-start gap-0">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 leading-6">{conversation.customer}</h3>
              <div className='scale-75 flex gap-2 items-start origin-left'>
                {getStatusBadge(conversation.status)}
                {conversation.channel && getChannelBadge(conversation.channel)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {shouldShowCreateTicketButton && (
            <ModernButton
              variant="outline"
              size="sm"
              onClick={() => setIsTicketModalOpen(true)}
            >
              Create Ticket
            </ModernButton>
          )}
          <ModernButton
            variant={isResolved ? "secondary" : "primary"}
            size="sm"
            onClick={handleResolveConversation}
            disabled={isResolving || isResolved}
          >
            {isResolving ? 'Resolving...' : isResolved ? 'Resolved' : 'Resolve'}
          </ModernButton>
          
        </div>
      </div>

      <CreateSupportTicketModal
        open={isTicketModalOpen}
        onOpenChange={setIsTicketModalOpen}
        conversation={conversation}
        onTicketCreated={handleTicketCreated}
      />
    </>
  );
};

export default ConversationHeader;
