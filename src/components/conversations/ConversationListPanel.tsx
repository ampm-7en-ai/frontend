
import React, { useEffect, useRef, useState } from 'react';
import ConversationCard from './ConversationCard';
import ConversationFilters from './ConversationFilters';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader, RefreshCw } from 'lucide-react';
import { useChatSessions } from '@/hooks/useChatSessions';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

interface ConversationListPanelProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  channelFilter: string;
  setChannelFilter: (channel: string) => void;
  agentTypeFilter: string;
  setAgentTypeFilter: (type: string) => void;
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
  isLoading?: boolean;
}

const ConversationListPanel = ({
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  channelFilter,
  setChannelFilter,
  agentTypeFilter,
  setAgentTypeFilter,
  selectedConversation,
  setSelectedConversation,
  isLoading: externalLoading = false
}: ConversationListPanelProps) => {
  const [displayCount, setDisplayCount] = useState(10);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Use our new WebSocket sessions hook
  const { 
    sessions, 
    isLoading: sessionsLoading, 
    isConnected, 
    error, 
    refreshSessions,
    filterSessionsByStatus,
    filterSessionsByChannel,
    filterSessionsByAgentType,
    filterSessionsBySearch
  } = useChatSessions();
  
  // Apply all filters
  const filteredSessions = React.useMemo(() => {
    let result = sessions;
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = filterSessionsByStatus(filterStatus);
    }
    
    // Apply channel filter
    if (channelFilter !== 'all') {
      result = filterSessionsByChannel(channelFilter);
    }
    
    // Apply agent type filter
    if (agentTypeFilter !== 'all') {
      result = filterSessionsByAgentType(agentTypeFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      result = filterSessionsBySearch(searchQuery);
    }
    
    return result;
  }, [
    sessions, 
    filterStatus, 
    channelFilter, 
    agentTypeFilter, 
    searchQuery,
    filterSessionsByStatus,
    filterSessionsByChannel,
    filterSessionsByAgentType,
    filterSessionsBySearch
  ]);
  
  const visibleSessions = filteredSessions.slice(0, displayCount);
  const hasMore = displayCount < filteredSessions.length;
  const isLoadingState = externalLoading || sessionsLoading;
  
  // Set a default selected conversation if there are sessions and none is selected
  useEffect(() => {
    if (filteredSessions.length > 0 && !selectedConversation) {
      setSelectedConversation(filteredSessions[0].id);
    }
  }, [filteredSessions, selectedConversation, setSelectedConversation]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const currentRef = loadMoreRef.current;
    
    if (!currentRef || !hasMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingState) {
          setDisplayCount(prev => prev + 10);
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(currentRef);
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoadingState, filteredSessions.length]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(10);
  }, [filterStatus, channelFilter, agentTypeFilter, searchQuery]);
  
  // Show error if WebSocket fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Connection Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const handleRefresh = () => {
    refreshSessions();
    toast({
      title: "Refreshing sessions",
      description: "Getting the latest conversations...",
    });
  };

  const renderContent = () => {
    if (isLoadingState) {
      return Array(5).fill(0).map((_, index) => (
        <div key={`skeleton-${index}`} className="p-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-none" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-32 mb-3" />
              <Skeleton className="h-3 w-40" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        </div>
      ));
    }

    if (filteredSessions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <p className="text-sm text-gray-500 mt-1">
            No conversations found. Try adjusting your filters or refreshing.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            className="mt-2 flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>
      );
    }

    return (
      <>
        {visibleSessions.map((session) => (
          <div key={session.id} className='px-[5px] my-1'>
            <ConversationCard 
              conversation={session}
              isSelected={selectedConversation === session.id}
              onClick={() => setSelectedConversation(session.id)}
            />
          </div>
        ))}
        
        {/* Load more indicator */}
        {hasMore && (
          <div 
            ref={loadMoreRef} 
            className="flex justify-center items-center p-3"
          >
            <Loader className="h-5 w-5 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading more...</span>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border-r max-w-[1440px] mx-auto">
      {/* Filters */}
      <div className="sticky top-0 z-10 bg-white">
        <ConversationFilters 
          filterResolved={filterStatus}
          onFilterResolvedChange={setFilterStatus}
          channelFilter={channelFilter}
          setChannelFilter={setChannelFilter}
          agentTypeFilter={agentTypeFilter}
          setAgentTypeFilter={setAgentTypeFilter}
        />
      </div>
      
      {/* WebSocket Status Indicator */}
      <div className="px-4 py-1 flex items-center justify-between">
        <div className={`text-xs ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
          {isConnected ? 'Connected' : 'Connecting...'}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={!isConnected}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Conversation List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-12rem)]" style={{ height: "calc(100vh - 12rem)" }}>
          {renderContent()}
        </ScrollArea>
      </div>
    </div>
  );
};

export default ConversationListPanel;
