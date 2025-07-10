
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
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const [agentTypeFilter, setAgentTypeFilter] = useState<string[]>([]);
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
      <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50/90 via-white to-blue-50/30 dark:from-slate-950/90 dark:via-slate-900 dark:to-slate-800/30">
        {/* Modern Header Bar */}
        <div className="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 flex items-center px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Conversations</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage customer conversations and support tickets</p>
            </div>
          </div>
        </div>

        <div className="h-[calc(100vh-3.5rem)]">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <div className="h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-r border-slate-200/40 dark:border-slate-800/40 shadow-sm">
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
            
            <ResizableHandle withHandle className="bg-slate-200/40 dark:bg-slate-700/40 hover:bg-slate-300/60 dark:hover:bg-slate-600/60 transition-colors backdrop-blur-sm w-1" />
            
            <ResizablePanel defaultSize={50}>
              <div className="h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
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
            
            <ResizableHandle withHandle className="bg-slate-200/40 dark:bg-slate-700/40 hover:bg-slate-300/60 dark:hover:bg-slate-600/60 transition-colors backdrop-blur-sm w-1" />
            
            <ResizablePanel defaultSize={30}>
              <div className="border-l border-slate-200/40 dark:border-slate-800/40 h-full overflow-y-auto bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm">
                <ConversationDetailsPanel 
                  conversation={activeConversation}
                  selectedAgent={selectedAgent}
                  onHandoffClick={handleHandoffClick}
                  getSatisfactionIndicator={getSatisfactionIndicator}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        
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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50/90 via-white to-blue-50/30 dark:from-slate-950/90 dark:via-slate-900 dark:to-slate-800/30">
      {/* Modern Mobile Header */}
      <div className="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 flex items-center px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Conversations</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Customer support</p>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="w-80 border-r border-slate-200/40 dark:border-slate-800/40 flex flex-col h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm">
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
        
        <div className="flex-1 flex flex-col h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
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
