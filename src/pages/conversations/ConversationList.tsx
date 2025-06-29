import React, { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useConversationUtils } from '@/hooks/useConversationUtils';
import { useChatSessions } from '@/hooks/useChatSessions';

import ConversationListPanel from '@/components/conversations/ConversationListPanel';
import MessageContainer from '@/components/conversations/MessageContainer';
import ConversationDetailsPanel from '@/components/conversations/ConversationDetailsPanel';
import ConversationSidebar from '@/components/conversations/ConversationSidebar';

const ConversationList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { getStatusBadge, getSatisfactionIndicator } = useConversationUtils();
  
  // State for conversation filters and selection
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('unresolved');
  const [channelFilter, setChannelFilter] = useState('all');
  const [agentTypeFilter, setAgentTypeFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Get the sessions from our WebSocket hook
  const { sessions } = useChatSessions();
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Find the active conversation
  const activeConversation = sessions.find(c => c.id === selectedConversation) || null;
  const isDesktop = windowWidth >= 1024;
  const isTablet = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;

  const handleHandoffClick = (handoff: any) => {
    setSelectedAgent(handoff.from);
    
    toast({
      title: `Viewing messages from ${handoff.from}`,
      description: `Scrolled to conversation segment with ${handoff.from}`,
    });
  };

  // Handle conversation selection
  const handleConversationSelect = (convId: string) => {
    // Simply select the conversation, without focusing on any specific message
    setSelectedConversation(convId);
    // Reset selected agent when changing conversation
    setSelectedAgent(null);
  };

  if (isDesktop) {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-br from-gray-50/80 to-blue-50/50 dark:from-slate-900/80 dark:to-slate-800/50">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-r border-gray-200/60 dark:border-slate-700/60 shadow-sm">
              <ConversationListPanel 
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedConversation={selectedConversation}
                setSelectedConversation={handleConversationSelect}
                channelFilter={channelFilter}
                setChannelFilter={setChannelFilter}
                agentTypeFilter={agentTypeFilter}
                setAgentTypeFilter={setAgentTypeFilter}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-gray-200/40 dark:bg-slate-700/40 hover:bg-gray-300/60 dark:hover:bg-slate-600/60 transition-colors backdrop-blur-sm" />
          
          <ResizablePanel defaultSize={50}>
            <div className="h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
              <MessageContainer 
                conversation={activeConversation}
                selectedAgent={selectedAgent}
                setSelectedAgent={setSelectedAgent}
                onInfoClick={() => setSidebarOpen(true)}
                getStatusBadge={getStatusBadge}
                onSendMessage={(message) => {
                  toast({
                    title: "Message sent",
                    description: "Your message has been sent to the customer.",
                  });
                }}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-gray-200/40 dark:bg-slate-700/40 hover:bg-gray-300/60 dark:hover:bg-slate-600/60 transition-colors backdrop-blur-sm" />
          
          <ResizablePanel defaultSize={30}>
            <div className="border-l border-gray-200/60 dark:border-slate-700/60 h-full overflow-y-auto bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm">
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

  // Mobile/Tablet layout
  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-br from-gray-50/80 to-blue-50/50 dark:from-slate-900/80 dark:to-slate-800/50">
      <div className="flex h-full">
        <div className="w-72 border-r border-gray-200/60 dark:border-slate-700/60 flex flex-col h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm">
          <ConversationListPanel 
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedConversation={selectedConversation}
            setSelectedConversation={handleConversationSelect}
            channelFilter={channelFilter}
            setChannelFilter={setChannelFilter}
            agentTypeFilter={agentTypeFilter}
            setAgentTypeFilter={setAgentTypeFilter}
          />
        </div>
        
        <div className="flex-1 flex flex-col h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <MessageContainer 
            conversation={activeConversation}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            onInfoClick={() => setSidebarOpen(true)}
            getStatusBadge={getStatusBadge}
            onSendMessage={(message) => {
              toast({
                title: "Message sent",
                description: "Your message has been sent to the customer.",
              });
            }}
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
