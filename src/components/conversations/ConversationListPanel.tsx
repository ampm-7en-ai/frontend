import React, { useEffect, useRef, useState } from 'react';
import ConversationCard from './ConversationCard';
import ConversationFiltersModern from './ConversationFiltersModern';
import DeleteConversationDialog from './DeleteConversationDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader } from 'lucide-react';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useToast } from "@/hooks/use-toast";
import { Icon } from '../icons';
import { useConversations } from '@/hooks/useConversations';

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
  localConversationUpdates?: {[key: string]: any};
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
  isLoading: externalLoading = false,
  localConversationUpdates = {}
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
  
  // Add agent name filter state
  const [agentNameFilter, setAgentNameFilter] = useState<string[]>([]);
  
  // Add delete functionality and mark deleted sessions
  const { 
    deleteConversation, 
    bulkDeleteConversations, 
    isBulkDeleting 
  } = useConversations();
  
  // Get the markSessionsAsDeleted function from useChatSessions
  const { 
    sessions, 
    isLoading: sessionsLoading, 
    isConnected, 
    error, 
    refreshSessions,
    filterSessionsByStatus,
    filterSessionsByChannel,
    filterSessionsByAgentType,
    filterSessionsBySearch,
    markSessionsAsDeleted
  } = useChatSessions();
  
  // Add bulk selection state
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Helper function to normalize status for case-insensitive comparison
  const normalizeStatus = (status: string) => {
    const normalized = status?.toLowerCase() || '';
    return normalized === 'completed' ? 'resolved' : normalized;
  };

  // Helper function to validate sessions and ensure unique IDs
  const validateSessions = React.useCallback((sessionsToValidate: any[]) => {
    if (!Array.isArray(sessionsToValidate)) {
      console.warn('Invalid sessions array:', sessionsToValidate);
      return [];
    }
    
    const validSessions = sessionsToValidate.filter((session, index) => {
      if (!session || !session.id) {
        console.warn(`Session at index ${index} is invalid:`, session);
        return false;
      }
      return true;
    });
    
    // Check for duplicates in the filtered sessions
    const seenIds = new Set();
    const uniqueSessions = validSessions.filter(session => {
      if (seenIds.has(session.id)) {
        console.warn(`Duplicate session ID in filter results: ${session.id}`);
        return false;
      }
      seenIds.add(session.id);
      return true;
    });
    
    if (uniqueSessions.length !== validSessions.length) {
      console.warn(`Removed ${validSessions.length - uniqueSessions.length} duplicate sessions from filter results`);
    }
    
    return uniqueSessions;
  }, []);

  // Apply local updates to sessions before filtering
  const getSessionsWithLocalUpdates = React.useCallback(() => {
    return sessions.map(session => {
      const localUpdate = localConversationUpdates[session.id];
      return localUpdate ? { ...session, ...localUpdate } : session;
    });
  }, [sessions, localConversationUpdates]);

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
      console.log(`Initialized ${initialReadSessions.length} read sessions`);
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
  
  // Get unique agent names from sessions (with local updates applied)
  const availableAgents = React.useMemo(() => {
    const sessionsWithUpdates = getSessionsWithLocalUpdates();
    const agents = sessionsWithUpdates
      .map(session => session.agent)
      .filter((agent, index, arr) => agent && arr.indexOf(agent) === index)
      .sort();
    return agents;
  }, [getSessionsWithLocalUpdates]);

  // Handle bulk selection
  const handleBulkSelectModeChange = (enabled: boolean) => {
    setIsBulkSelectMode(enabled);
    if (!enabled) {
      setSelectedConversations([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedConversations.length === filteredSessions.length) {
      setSelectedConversations([]);
    } else {
      setSelectedConversations(filteredSessions.map(conv => conv.id));
    }
  };

  const handleBulkSelect = (conversationId: string, selected: boolean) => {
    if (selected) {
      setSelectedConversations(prev => [...prev, conversationId]);
    } else {
      setSelectedConversations(prev => prev.filter(id => id !== conversationId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedConversations.length > 0) {
      setShowBulkDeleteDialog(true);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      // Store the session IDs before deletion
      const sessionIdsToDelete = [...selectedConversations];
      
      await bulkDeleteConversations(sessionIdsToDelete);
      
      // Mark sessions as deleted in the WebSocket hook
      markSessionsAsDeleted(sessionIdsToDelete);
      
      setSelectedConversations([]);
      setIsBulkSelectMode(false);
      setShowBulkDeleteDialog(false);
    } catch (error) {
      // Error toast is handled in the hook
    }
  };

  // Apply all filters with validation and case-insensitive status matching
  const filteredSessions = React.useMemo(() => {
    // First apply local updates to all sessions
    const sessionsWithUpdates = getSessionsWithLocalUpdates();
    console.log(`Applying filters to ${sessionsWithUpdates.length} sessions with local updates`);
    let result = sessionsWithUpdates;
    
    // Apply status filter with case-insensitive matching
    if (filterStatus !== 'all') {
      const normalizedFilterStatus = normalizeStatus(filterStatus);
      result = result.filter(s => {
        if (!s || !s.status) return false;
        const normalizedSessionStatus = normalizeStatus(s.status);
        return normalizedSessionStatus === normalizedFilterStatus;
      });
      console.log(`After status filter (${filterStatus}): ${result.length} sessions`);
    }
    
    // Apply channel filter (array-based)
    if (channelFilter.length > 0) {
      result = result.filter(s => {
        if (!s || !s.channel) return false;
        return channelFilter.includes(s.channel);
      });
      console.log(`After channel filter: ${result.length} sessions`);
    }
    
    // Apply agent type filter (array-based)
    if (agentTypeFilter.length > 0) {
      result = result.filter(s => {
        if (!s || !s.agentType) return false;
        return agentTypeFilter.includes(s.agentType);
      });
      console.log(`After agent type filter: ${result.length} sessions`);
    }

    // Apply agent name filter
    if (agentNameFilter.length > 0) {
      result = result.filter(s => {
        if (!s || !s.agent) return false;
        return agentNameFilter.includes(s.agent);
      });
      console.log(`After agent name filter: ${result.length} sessions`);
    }
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(s => 
        s && (
          s.customer?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          s.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );
      console.log(`After search filter: ${result.length} sessions`);
    }
    
    // Validate the final result to ensure no duplicates
    const validatedResult = validateSessions(result);
    
    // Mark sessions as unread if they're not in the readSessions array
    const finalResult = validatedResult.map(session => ({
      ...session,
      isUnread: !readSessions.some(rs => rs.id === session.id)
    }));
    
    console.log(`Final filtered sessions: ${finalResult.length}`);
    return finalResult;
  }, [
    getSessionsWithLocalUpdates, 
    filterStatus, 
    channelFilter, 
    agentTypeFilter, 
    agentNameFilter,
    searchQuery,
    readSessions,
    validateSessions
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
          console.log(`Loading more sessions: current display count ${displayCount}, filtered total ${filteredSessions.length}`);
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
  }, [hasMore, isLoadingState, filteredSessions.length, displayCount]);

  // Reset display count when filters change
  useEffect(() => {
    console.log('Filters changed, resetting display count');
    setDisplayCount(10);
  }, [filterStatus, channelFilter, agentTypeFilter, agentNameFilter, searchQuery]);
  
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
            <Skeleton className="h-9 w-9 rounded-none bg-neutral-100 dark:bg-neutral-700" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2 bg-neutral-100 dark:bg-neutral-700" />
              <Skeleton className="h-3 w-32 mb-3 bg-neutral-100 dark:bg-neutral-700" />
              <Skeleton className="h-3 w-40 bg-neutral-100 dark:bg-neutral-700" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-4 w-12 bg-neutral-100 dark:bg-neutral-700" />
                <Skeleton className="h-4 w-12 bg-neutral-100 dark:bg-neutral-700" />
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
            <Icon name={`Bubbles`} color='hsl(var(--primary))' type='plain'  className='h-8 w-8'/>
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
        {visibleSessions.map((session, index) => {
          // Additional validation to ensure unique keys
          const uniqueKey = `${session.id}-${index}`;
          
          if (!session || !session.id) {
            console.warn(`Invalid session at index ${index}:`, session);
            return null;
          }
          
          return (
            <div key={uniqueKey} className='px-2 my-1'>
              <ConversationCard 
                conversation={session}
                isSelected={selectedConversation === session.id}
                onClick={() => handleConversationClick(session.id)}
                onDelete={async (conversationId) => {
                  try {
                    await deleteConversation(conversationId);
                    // Mark the session as deleted in the WebSocket hook
                    markSessionsAsDeleted([conversationId]);
                  } catch (error) {
                    // Error is already handled in the hook
                  }
                }}
                isBulkSelectMode={isBulkSelectMode}
                isSelectedForBulk={selectedConversations.includes(session.id)}
                onBulkSelect={handleBulkSelect}
              />
            </div>
          );
        })}
        
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
    <div className="flex flex-col h-full bg-white dark:bg-[hsla(0,0%,0%,0.95)]">
      {/* Filters */}
      <div className="flex-shrink-0 bg-white dark:bg-[hsla(0,0%,0%,0.95)] border-b border-gray-100 dark:border-muted">
        <ConversationFiltersModern 
          filterResolved={filterStatus}
          onFilterResolvedChange={setFilterStatus}
          channelFilter={channelFilter}
          setChannelFilter={setChannelFilter}
          agentTypeFilter={agentTypeFilter}
          setAgentTypeFilter={setAgentTypeFilter}
          agentNameFilter={agentNameFilter}
          setAgentNameFilter={setAgentNameFilter}
          availableAgents={availableAgents}
          isBulkSelectMode={isBulkSelectMode}
          onBulkSelectModeChange={handleBulkSelectModeChange}
          selectedConversations={selectedConversations}
          onSelectAll={handleSelectAll}
          onBulkDelete={handleBulkDelete}
          isBulkDeleting={isBulkDeleting}
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

      <DeleteConversationDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        conversationId="bulk"
        customerName={`${selectedConversations.length} conversations`}
        onDelete={confirmBulkDelete}
        isDeleting={isBulkDeleting}
      />
    </div>
  );
};

export default ConversationListPanel;
