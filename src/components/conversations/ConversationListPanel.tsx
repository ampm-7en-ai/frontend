import React, { useEffect, useRef, useState } from 'react';
import ConversationCard from './ConversationCard';
import ConversationFilters from './ConversationFilters';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader } from 'lucide-react';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useToast } from "@/hooks/use-toast";

interface ConversationListPanelProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  channelFilter: string[];
  setChannelFilter: (channels: string[]) => void;
  agentTypeFilter: string[];
  setAgentTypeFilter: (types: string[]) => void;
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
  isLoading?: boolean;
}

interface ReadSessionInfo {
  id: string;
  lastMessageTimestamp?: string;
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
  
  // Store session read state with timestamps of last read
  const [readSessions, setReadSessions] = useState<ReadSessionInfo[]>([]);
  // Keep track of sessions we've seen before
  const previousSessionsRef = useRef<any[]>([]);
  // Keep track of initial load to avoid marking all sessions as unread on first load
  const initialLoadCompletedRef = useRef(false);
  
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
  
  // Initialize readSessions with all current sessions on first load
  useEffect(() => {
    if (sessions.length > 0 && !initialLoadCompletedRef.current) {
      // Mark all initial sessions as read
      const initialReadSessions = sessions.map(session => ({
        id: session.id,
        lastMessageTimestamp: session.time
      }));
      
      setReadSessions(initialReadSessions);
      previousSessionsRef.current = [...sessions];
      initialLoadCompletedRef.current = true;
    }
  }, [sessions]);
  
  // Track previous sessions to detect new ones or message updates
  useEffect(() => {
    if (!initialLoadCompletedRef.current || sessions.length === 0) {
      return;
    }
    
    // Check for new sessions or updated messages
    sessions.forEach(session => {
      const previousSession = previousSessionsRef.current.find(prevSession => prevSession.id === session.id);
      
      if (!previousSession) {
        // New session detected, keep it marked as unread
        console.log(`New session detected: ${session.id}`);
        // We don't add it to readSessions so it stays unread
      } else if (previousSession.lastMessage !== session.lastMessage) {
        // Message changed, mark as unread unless it's the currently selected one
        if (session.id !== selectedConversation) {
          console.log(`Message updated in session ${session.id}, marking as unread`);
          // Remove from read sessions to mark as unread
          setReadSessions(prev => prev.filter(rs => rs.id !== session.id));
        }
      }
    });
    
    // Update the reference for next comparison
    previousSessionsRef.current = JSON.parse(JSON.stringify(sessions));
  }, [sessions, selectedConversation]);
  
  // Custom filter functions for array-based filters
  const filterSessionsByChannels = (channels: string[]) => {
    if (channels.length === 0) return sessions;
    return sessions.filter(s => channels.includes(s.channel));
  };
  
  const filterSessionsByAgentTypes = (types: string[]) => {
    if (types.length === 0) return sessions;
    return sessions.filter(s => types.includes(s.agentType));
  };
  
  // Apply all filters
  const filteredSessions = React.useMemo(() => {
    let result = sessions;
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = filterSessionsByStatus(filterStatus);
    }
    
    // Apply channel filter (array-based)
    if (channelFilter.length > 0) {
      result = result.filter(s => channelFilter.includes(s.channel));
    }
    
    // Apply agent type filter (array-based)
    if (agentTypeFilter.length > 0) {
      result = result.filter(s => agentTypeFilter.includes(s.agentType));
    }
    
    // Apply search filter
    if (searchQuery) {
      result = filterSessionsBySearch(searchQuery);
    }
    
    // Mark sessions as unread if they're not in the readSessions array
    return result.map(session => ({
      ...session,
      isUnread: !readSessions.some(rs => rs.id === session.id)
    }));
  }, [
    sessions, 
    filterStatus, 
    channelFilter, 
    agentTypeFilter, 
    searchQuery,
    readSessions,
    filterSessionsByStatus,
    filterSessionsBySearch
  ]);
  
  const visibleSessions = filteredSessions.slice(0, displayCount);
  const hasMore = displayCount < filteredSessions.length;
  const isLoadingState = externalLoading || sessionsLoading;
  
  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation) {
      const session = sessions.find(s => s.id === selectedConversation);
      if (session) {
        setReadSessions(prev => {
          // Remove any existing entry for this session
          const filtered = prev.filter(rs => rs.id !== selectedConversation);
          // Add updated entry with current timestamp
          return [...filtered, { 
            id: selectedConversation,
            lastMessageTimestamp: session.time
          }];
        });
      }
    }
  }, [selectedConversation, sessions]);

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

  const handleConversationClick = (sessionId: string) => {
    setSelectedConversation(sessionId);
    // Mark as read when clicked
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setReadSessions(prev => {
        // Remove any existing entry for this session
        const filtered = prev.filter(rs => rs.id !== sessionId);
        // Add updated entry with current timestamp
        return [...filtered, { 
          id: sessionId,
          lastMessageTimestamp: session.time 
        }];
      });
    }
  };

  const renderContent = () => {
    if (isLoadingState) {
      return Array(5).fill(0).map((_, index) => (
        <div key={`skeleton-${index}`} className="p-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-none bg-gray-200 dark:bg-slate-700" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2 bg-gray-200 dark:bg-slate-700" />
              <Skeleton className="h-3 w-32 mb-3 bg-gray-200 dark:bg-slate-700" />
              <Skeleton className="h-3 w-40 bg-gray-200 dark:bg-slate-700" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-4 w-12 bg-gray-200 dark:bg-slate-700" />
                <Skeleton className="h-4 w-12 bg-gray-200 dark:bg-slate-700" />
              </div>
            </div>
          </div>
        </div>
      ));
    }

    if (filteredSessions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="text-gray-400 dark:text-slate-500 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">No conversations found</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Try adjusting your filters or refreshing to see conversations.
          </p>
        </div>
      );
    }

    return (
      <>
        {visibleSessions.map((session) => (
          <div key={session.id} className='px-2 my-1'>
            <ConversationCard 
              conversation={session}
              isSelected={selectedConversation === session.id}
              onClick={() => handleConversationClick(session.id)}
            />
          </div>
        ))}
        
        {/* Load more indicator */}
        {hasMore && (
          <div 
            ref={loadMoreRef} 
            className="flex justify-center items-center p-4"
          >
            <Loader className="h-4 w-4 animate-spin text-gray-400 dark:text-slate-500" />
            <span className="ml-2 text-xs text-gray-500 dark:text-slate-400">Loading more...</span>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Filters */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700">
        <ConversationFilters 
          filterResolved={filterStatus}
          onFilterResolvedChange={setFilterStatus}
          channelFilter={channelFilter}
          setChannelFilter={setChannelFilter}
          agentTypeFilter={agentTypeFilter}
          setAgentTypeFilter={setAgentTypeFilter}
        />
      </div>
      
      {/* Conversation List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="py-2">
            {renderContent()}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ConversationListPanel;
