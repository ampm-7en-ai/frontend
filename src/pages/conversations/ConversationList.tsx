import React, { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useConversationUtils } from '@/hooks/useConversationUtils';
import { useConversations } from '@/hooks/useConversations';

import ConversationListPanel from '@/components/conversations/ConversationListPanel';
import MessageContainer from '@/components/conversations/MessageContainer';
import ConversationDetailsPanel from '@/components/conversations/ConversationDetailsPanel';
import ConversationSidebar from '@/components/conversations/ConversationSidebar';

interface Conversation {
  id: string;
  customer: string;
  email: string;
  lastMessage: string;
  time: string;
  status: string;
  agent: string;
  satisfaction: string;
  priority: string;
  duration: string;
  handoffCount: number;
  topic: string;
  channel: string;
  messages: Array<any>;
  agentType?: 'human' | 'ai';
}

const ConversationList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { conversations, isLoading: isLoadingConversations } = useConversations();
  const { getStatusBadge, getSatisfactionIndicator } = useConversationUtils();
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('unresolved');
  const [channelFilter, setChannelFilter] = useState('all');
  const [agentTypeFilter, setAgentTypeFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set a default selected conversation if there are conversations and none is selected
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation]);

  const activeConversation = conversations.find(c => c.id === selectedConversation) || null;
  const isDesktop = windowWidth >= 1024;
  const isTablet = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;

  const filteredConversations = conversations.filter(conv => {
    // For the status filter, map 'completed' from API to 'resolved' for UI
    const convStatus = conv.status;
    const matchesStatus = filterStatus === 'all' || convStatus === filterStatus;
    const matchesChannel = channelFilter === 'all' || conv.channel === channelFilter;
    const matchesAgentType = agentTypeFilter === 'all' || conv.agentType === agentTypeFilter;
    
    return matchesStatus && matchesChannel && matchesAgentType;
  });

  const handleSendMessage = (message: string) => {
    if (!selectedConversation) return;
    
    toast({
      title: "Message sent",
      description: "Your message has been sent to the customer.",
    });
  };

  const handleHandoffClick = (handoff: any) => {
    setSelectedAgent(handoff.from);
    
    toast({
      title: `Viewing messages from ${handoff.from}`,
      description: `Scrolled to conversation segment with ${handoff.from}`,
    });
  };

  if (isDesktop) {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <ConversationListPanel 
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredConversations={filteredConversations}
              selectedConversation={selectedConversation}
              setSelectedConversation={setSelectedConversation}
              channelFilter={channelFilter}
              setChannelFilter={setChannelFilter}
              agentTypeFilter={agentTypeFilter}
              setAgentTypeFilter={setAgentTypeFilter}
              isLoading={isLoadingConversations}
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={50}>
            <MessageContainer 
              conversation={activeConversation}
              selectedAgent={selectedAgent}
              setSelectedAgent={setSelectedAgent}
              onInfoClick={() => setSidebarOpen(true)}
              getStatusBadge={getStatusBadge}
              onSendMessage={handleSendMessage}
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={30}>
            <div className="border-l h-full overflow-y-auto">
              <ConversationDetailsPanel 
                conversation={activeConversation}
                selectedAgent={selectedAgent}
                onHandoffClick={handleHandoffClick}
                getSatisfactionIndicator={getSatisfactionIndicator}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        
        <style dangerouslySetInnerHTML={{ __html: `
          main {
            padding: 0 !important;
            max-width: none !important;
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex h-full">
        <div className="w-72 border-r flex flex-col h-full">
          <ConversationListPanel 
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredConversations={filteredConversations}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            channelFilter={channelFilter}
            setChannelFilter={setChannelFilter}
            agentTypeFilter={agentTypeFilter}
            setAgentTypeFilter={setAgentTypeFilter}
          />
        </div>
        
        <div className="flex-1 flex flex-col h-full">
          <MessageContainer 
            conversation={activeConversation}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            onInfoClick={() => setSidebarOpen(true)}
            getStatusBadge={getStatusBadge}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
      
      <ConversationSidebar 
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        conversation={activeConversation}
        selectedAgent={selectedAgent}
        onHandoffClick={handleHandoffClick}
        getSatisfactionIndicator={getSatisfactionIndicator}
      />
      
      <style dangerouslySetInnerHTML={{ __html: `
        main {
          padding: 0 !important;
          max-width: none !important;
        }
      `}} />
    </div>
  );
};

export default ConversationList;
