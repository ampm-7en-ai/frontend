
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Info, Phone, Video, MoreHorizontal, CheckCircle, TicketPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { CreateSupportTicketModal } from './CreateSupportTicketModal';

interface ConversationHeaderProps {
  conversation: {
    id: string;
    customer: string;
    status: string;
    channel?: string;
    agent?: string;
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

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-lg">
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
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
              <span>{messageCount} messages</span>
              {conversation.agent && (
                <span>Assigned to {conversation.agent}</span>
              )}
              {selectedAgent && (
                <span className="text-blue-600 dark:text-blue-400">Viewing {selectedAgent} messages</span>
              )}
            </div>
          </div>
        </div>
        
        {!hideActionButtons && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsTicketModalOpen(true)}
              className="hover:bg-white/50 dark:hover:bg-slate-800/50"
            >
              <TicketPlus className="h-4 w-4 mr-1" />
              Create Ticket
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResolveConversation}
              disabled={isResolving || isResolved}
              className={`hover:bg-white/50 dark:hover:bg-slate-800/50 ${
                isResolved ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              {isResolving ? 'Resolving...' : isResolved ? 'Resolved' : 'Resolve'}
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-white/50 dark:hover:bg-slate-800/50">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-white/50 dark:hover:bg-slate-800/50">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onInfoClick} className="hover:bg-white/50 dark:hover:bg-slate-800/50">
              <Info className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-white/50 dark:hover:bg-slate-800/50">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <CreateSupportTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        sessionId={conversation.id}
      />
    </>
  );
};

export default ConversationHeader;
