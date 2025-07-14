import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ModernButton from '@/components/dashboard/ModernButton';
import { Info, Phone, Video, MoreHorizontal, CheckCircle, TicketPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiPost, getApiUrl } from '@/utils/api-config';
import CreateSupportTicketModal from './CreateSupportTicketModal';

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
    if (!conversation.id || conversation.status === 'resolved') return;

    setIsResolving(true);
    try {
      const response = await apiPost(getApiUrl(`chatsessions/${conversation.id}/resolve/`), {}, true);

      if (!response.ok) {
        throw new Error(`Failed to resolve conversation: ${response.status}`);
      }

      const result = await response.json();
      console.log('Conversation resolved:', result);

      // Update the conversation with the response data
      if (onConversationUpdate && result.data) {
        onConversationUpdate({
          ...conversation,
          ...result.data,
          status: result.data.chat_status || 'resolved'
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

  const isResolved = conversation.status === 'resolved' || conversation.status === 'completed';
  const isHumanAgent = conversation.agentType === 'human';

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar className="w-11 h-11 rounded-2xl">
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
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isHumanAgent && (
            <ModernButton
              variant="outline"
              size="sm"
              icon={TicketPlus}
              onClick={() => setIsTicketModalOpen(true)}
            >
              Create Ticket
            </ModernButton>
          )}
          <ModernButton
            variant={isResolved ? "secondary" : "primary"}
            size="sm"
            icon={CheckCircle}
            onClick={handleResolveConversation}
            disabled={isResolving || isResolved}
          >
            {isResolving ? 'Resolving...' : isResolved ? 'Resolved' : 'Resolve'}
          </ModernButton>
        </div>
      </div>

      {!isHumanAgent && (
        <CreateSupportTicketModal
          open={isTicketModalOpen}
          onOpenChange={setIsTicketModalOpen}
          conversation={conversation}
        />
      )}
    </>
  );
};

export default ConversationHeader;
