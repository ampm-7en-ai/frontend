import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatSessionsWebSocketService, ChatSessionData } from '@/services/ChatSessionsWebSocketService';
import { useToast } from "@/hooks/use-toast";

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSessionData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletedSessionIds, setDeletedSessionIds] = useState<Set<string>>(new Set());
  const wsRef = useRef<ChatSessionsWebSocketService | null>(null);
  const { toast } = useToast();
  
  // Keep track of sessions using a Map for better deduplication
  const sessionsMapRef = useRef<Map<string, ChatSessionData>>(new Map());
  
  // Helper function to validate and deduplicate sessions
  const validateAndDeduplicateSessions = useCallback((newSessions: ChatSessionData[]) => {
    console.log('Validating sessions:', newSessions.length);
    
    const sessionMap = new Map<string, ChatSessionData>();
    const duplicateIds: string[] = [];
    
    newSessions.forEach((session, index) => {
      if (!session.id) {
        console.warn(`Session at index ${index} has no ID:`, session);
        return;
      }
      
      if (sessionMap.has(session.id)) {
        console.warn(`Duplicate session ID found: ${session.id}`);
        duplicateIds.push(session.id);
        
        // Merge sessions, keeping the most recent data
        const existing = sessionMap.get(session.id)!;
        const merged = {
          ...existing,
          ...session,
          // Keep the most recent timestamp
          time: new Date(session.time) > new Date(existing.time) ? session.time : existing.time
        };
        sessionMap.set(session.id, merged);
      } else {
        sessionMap.set(session.id, session);
      }
    });
    
    if (duplicateIds.length > 0) {
      console.warn(`Found ${duplicateIds.length} duplicate session IDs:`, duplicateIds);
    }
    
    const deduplicatedSessions = Array.from(sessionMap.values());
    console.log(`Sessions after deduplication: ${deduplicatedSessions.length} (removed ${newSessions.length - deduplicatedSessions.length} duplicates)`);
    
    return deduplicatedSessions;
  }, []);
  
  // Helper function to merge session updates
  const mergeSessionUpdate = useCallback((existingSession: ChatSessionData, update: Partial<ChatSessionData>): ChatSessionData => {
    return {
      ...existingSession,
      ...update,
      // Preserve important fields that shouldn't be overwritten with empty values
      customer: update.customer || existingSession.customer,
      lastMessage: update.lastMessage || existingSession.lastMessage,
      time: update.time || existingSession.time,
    };
  }, []);
  
  // Initialize the WebSocket service
  useEffect(() => {
    console.log('Initializing ChatSessions WebSocket service');
    
    // Create WebSocket service
    wsRef.current = new ChatSessionsWebSocketService();
    
    // Set up event handlers
    wsRef.current.on({
      onSessionsUpdate: (receivedSessions) => {
        console.log('Sessions update received:', receivedSessions.length, 'sessions');
        
        if (!Array.isArray(receivedSessions)) {
          console.error('Received sessions is not an array:', receivedSessions);
          return;
        }
        
        const validatedSessions = validateAndDeduplicateSessions(receivedSessions);
        
        // Update our Map reference
        sessionsMapRef.current.clear();
        validatedSessions.forEach(session => {
          sessionsMapRef.current.set(session.id, session);
        });
        
        setSessions(validatedSessions);
        setIsLoading(false);
        console.log('Sessions state updated with', validatedSessions.length, 'sessions');
      },
      onSessionUpdate: (sessionUpdate) => {
        console.log('Single session update received:', sessionUpdate);
        
        if (!sessionUpdate.session || !sessionUpdate.session.id) {
          console.warn('Invalid session update received:', sessionUpdate);
          return;
        }
        
        const updatedSession = sessionUpdate.session;
        console.log(`Updating session ${updatedSession.id}`);
        
        setSessions(prevSessions => {
          const sessionMap = new Map<string, ChatSessionData>();
          
          // First, add all existing sessions to the map
          prevSessions.forEach(session => {
            sessionMap.set(session.id, session);
          });
          
          // Then update or add the new session
          if (sessionMap.has(updatedSession.id)) {
            const existingSession = sessionMap.get(updatedSession.id)!;
            const mergedSession = mergeSessionUpdate(existingSession, updatedSession);
            sessionMap.set(updatedSession.id, mergedSession);
            console.log(`Merged update for existing session ${updatedSession.id}`);
          } else {
            sessionMap.set(updatedSession.id, updatedSession);
            console.log(`Added new session ${updatedSession.id}`);
          }
          
          // Update our ref
          sessionsMapRef.current = new Map(sessionMap);
          
          const updatedSessions = Array.from(sessionMap.values());
          console.log(`Sessions after update: ${updatedSessions.length} total`);
          
          return updatedSessions;
        });
      },
      onError: (err) => {
        console.error('WebSocket error:', err);
        setError(err);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the chat sessions service.",
          variant: "destructive"
        });
        setIsLoading(false);
      },
      onConnectionChange: (connected) => {
        console.log('WebSocket connection status:', connected);
        setIsConnected(connected);
        
        // Request sessions list when connected
        if (connected && wsRef.current) {
          console.log('Connected - requesting sessions');
          wsRef.current.requestSessions();
        }
        
        // If disconnected and was previously connected, show toast
        if (!connected && isConnected) {
          toast({
            title: "Connection Lost",
            description: "Connection to the chat server was lost. Trying to reconnect...",
            variant: "destructive"
          });
        }
      }
    });
    
    // Connect to WebSocket
    wsRef.current.connect();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up ChatSessions WebSocket service');
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
      sessionsMapRef.current.clear();
    };
  }, [toast, validateAndDeduplicateSessions, mergeSessionUpdate]);
  
  // Function to send messages to a specific session
  const sendMessage = useCallback((sessionId: string, content: string) => {
    if (!wsRef.current) {
      setError('WebSocket not initialized');
      return;
    }
    
    if (!wsRef.current.isConnected()) {
      setError('WebSocket not connected');
      return;
    }
    
    try {
      wsRef.current.sendMessage(sessionId, content);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  }, []);
  
  // Function to manually refresh the sessions list
  const refreshSessions = useCallback(() => {
    if (wsRef.current?.isConnected()) {
      console.log('Manually refreshing sessions');
      wsRef.current.requestSessions();
      setIsLoading(true);
    }
  }, []);
  
  // Filter functions with validation (also filter out deleted sessions)
  const filterSessionsByStatus = useCallback((statusFilter: string) => {
    const filteredSessions = sessions.filter(s => s && !deletedSessionIds.has(s.id));
    if (statusFilter === 'all') return filteredSessions;
    return filteredSessions.filter(s => s.status === statusFilter);
  }, [sessions, deletedSessionIds]);
  
  const filterSessionsByChannel = useCallback((channelFilter: string) => {
    const filteredSessions = sessions.filter(s => s && !deletedSessionIds.has(s.id));
    if (channelFilter === 'all') return filteredSessions;
    return filteredSessions.filter(s => s.channel === channelFilter);
  }, [sessions, deletedSessionIds]);
  
  const filterSessionsByAgentType = useCallback((agentTypeFilter: string) => {
    const filteredSessions = sessions.filter(s => s && !deletedSessionIds.has(s.id));
    if (agentTypeFilter === 'all') return filteredSessions;
    return filteredSessions.filter(s => s.agentType === agentTypeFilter);
  }, [sessions, deletedSessionIds]);
  
  const filterSessionsBySearch = useCallback((query: string) => {
    const filteredSessions = sessions.filter(s => s && !deletedSessionIds.has(s.id));
    if (!query) return filteredSessions;
    const lowerQuery = query.toLowerCase();
    return filteredSessions.filter(s => 
      s && (
        s.customer?.toLowerCase().includes(lowerQuery) || 
        s.lastMessage?.toLowerCase().includes(lowerQuery) ||
        (s.email && s.email.toLowerCase().includes(lowerQuery))
      )
    );
  }, [sessions, deletedSessionIds]);

  // Function to mark sessions as deleted
  const markSessionsAsDeleted = useCallback((sessionIds: string[]) => {
    setDeletedSessionIds(prev => {
      const newSet = new Set(prev);
      sessionIds.forEach(id => newSet.add(id));
      return newSet;
    });
  }, []);

  // Get filtered sessions (excluding deleted ones)
  const getFilteredSessions = useCallback(() => {
    return sessions.filter(s => s && !deletedSessionIds.has(s.id));
  }, [sessions, deletedSessionIds]);
  
  return {
    sessions: getFilteredSessions(),
    isLoading,
    isConnected,
    error,
    sendMessage,
    refreshSessions,
    filterSessionsByStatus,
    filterSessionsByChannel,
    filterSessionsByAgentType,
    filterSessionsBySearch,
    markSessionsAsDeleted
  };
}
