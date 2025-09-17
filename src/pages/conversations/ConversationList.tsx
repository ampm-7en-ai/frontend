import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useConversationUtils } from '@/hooks/useConversationUtils';
import { useChatSessions } from '@/hooks/useChatSessions';

import ConversationListPanel from '@/components/conversations/ConversationListPanel';
import ConversationListErrorBoundary from '@/components/conversations/ConversationListErrorBoundary';
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
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const [agentTypeFilter, setAgentTypeFilter] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeSentimentData, setActiveSentimentData] = useState<{
    sentimentScores: Array<{
      messageId: string;
      content: string;
      score: number;
      timestamp: string;
    }>;
    averageSentiment: number | null;
  }>({
    sentimentScores: [],
    averageSentiment: null
  });

  // Get the sessions from our WebSocket hook
  const { sessions, refreshSessions } = useChatSessions();


    
  // Local conversation state for immediate UI updates
  const [localConversationUpdates, setLocalConversationUpdates] = useState<{[key: string]: any}>({});
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle sentiment data changes from MessageContainer
  const handleSentimentDataChange = useCallback((data: typeof activeSentimentData) => {
    // Only update if the data has actually changed to prevent infinite loops
    setActiveSentimentData(prevData => {
      // Simple comparison to check if data is different
      const hasChanged = 
        JSON.stringify(prevData.sentimentScores) !== JSON.stringify(data.sentimentScores) ||
        prevData.averageSentiment !== data.averageSentiment;
      
      return hasChanged ? data : prevData;
    });
  }, []);

  // Reset sentiment data when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setActiveSentimentData({
        sentimentScores: [],
        averageSentiment: null
      });
    }
  }, [selectedConversation]);

  // Find the active conversation with local updates applied
  const activeConversation = useMemo(() => {
    const baseConversation = sessions.find(c => c.id === selectedConversation);
    if (!baseConversation) return null;
    
    // Apply any local updates
    const localUpdate = localConversationUpdates[selectedConversation];
    return localUpdate ? { ...baseConversation, ...localUpdate } : baseConversation;
  }, [sessions, selectedConversation, localConversationUpdates]);

  const isDesktop = windowWidth >= 1024;
  const isTablet = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  console.log("pipipi",activeConversation);
  // Handle conversation updates (for resolve functionality)
  const handleConversationUpdate = (updatedConversation: any) => {
    console.log('Conversation updated:', updatedConversation);
    
    // Update local state immediately for UI responsiveness
    setLocalConversationUpdates(prev => ({
      ...prev,
      [updatedConversation.id]: updatedConversation
    }));
    
    // Refresh sessions data to sync with backend
    refreshSessions();
    
    toast({
      title: "Conversation updated",
      description: `Status changed to ${updatedConversation.status}`,
    });
  };

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
    // Clear any local updates for the previously selected conversation
    setLocalConversationUpdates({});
  };

  // Handle error boundary retry
  const handleErrorRetry = () => {
    console.log('Retrying conversation list after error');
    refreshSessions();
    setSelectedConversation(null);
    setSelectedAgent(null);
    setLocalConversationUpdates({});
  };

  if (isDesktop) {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50/80 to-blue-50/50 dark:from-neutral-900/80 dark:to-neutral-800/50">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border-r border-gray-200/60 dark:border-neutral-700/60 shadow-sm">
              <ConversationListErrorBoundary onRetry={handleErrorRetry}>
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
                  localConversationUpdates={localConversationUpdates}
                />
              </ConversationListErrorBoundary>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-gray-200/40 dark:bg-neutral-700/40 hover:bg-gray-300/60 dark:hover:bg-neutral-600/60 transition-colors backdrop-blur-sm" />
          
          <ResizablePanel defaultSize={50}>
            <div className="h-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm">
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
                onConversationUpdate={handleConversationUpdate}
                onSentimentDataChange={handleSentimentDataChange}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-gray-200/40 dark:bg-neutral-700/40 hover:bg-gray-300/60 dark:hover:bg-neutral-600/60 transition-colors backdrop-blur-sm" />
          
          <ResizablePanel defaultSize={25}>
            <div className="border-l border-gray-200/60 dark:border-neutral-700/60 h-full overflow-y-auto bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm shadow-sm">
              <ConversationDetailsPanel 
                conversation={activeConversation}
                selectedAgent={selectedAgent}
                onHandoffClick={handleHandoffClick}
                getSatisfactionIndicator={getSatisfactionIndicator}
                sentimentData={activeSentimentData}
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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50/80 to-blue-50/50 dark:from-neutral-900/80 dark:to-neutral-800/50">
      <div className="flex h-full">
        <div className="w-72 border-r border-gray-200/60 dark:border-neutral-700/60 flex flex-col h-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm shadow-sm">
          <ConversationListErrorBoundary onRetry={handleErrorRetry}>
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
              localConversationUpdates={localConversationUpdates}
            />
          </ConversationListErrorBoundary>
        </div>
        
        <div className="flex-1 flex flex-col h-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm">
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
            onConversationUpdate={handleConversationUpdate}
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
