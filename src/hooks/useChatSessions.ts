
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatSessionsWebSocketService, ChatSessionData } from '@/services/ChatSessionsWebSocketService';
import { useToast } from "@/hooks/use-toast";

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSessionData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<ChatSessionsWebSocketService | null>(null);
  const { toast } = useToast();
  
  // Initialize the WebSocket service
  useEffect(() => {
    // Create WebSocket service
    wsRef.current = new ChatSessionsWebSocketService();
    
    // Set up event handlers
    wsRef.current.on({
      onSessionsUpdate: (receivedSessions) => {
        console.log('Sessions update received:', receivedSessions);
        setSessions(receivedSessions);
        setIsLoading(false);
      },
      onSessionUpdate: (sessionUpdate) => {
        console.log('Single session update received:', sessionUpdate);
        if (sessionUpdate.session) {
          // Update a specific session in the list
          setSessions(prevSessions => {
            const sessionIndex = prevSessions.findIndex(s => s.id === sessionUpdate.session.id);
            if (sessionIndex >= 0) {
              const updatedSessions = [...prevSessions];
              updatedSessions[sessionIndex] = {
                ...updatedSessions[sessionIndex],
                ...sessionUpdate.session
              };
              return updatedSessions;
            }
            // If not found, it could be a new session
            return [...prevSessions, sessionUpdate.session];
          });
        }
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
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, []);
  
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
      wsRef.current.requestSessions();
      setIsLoading(true);
    }
  }, []);
  
  // Filter functions
  const filterSessionsByStatus = useCallback((statusFilter: string) => {
    if (statusFilter === 'all') return sessions;
    return sessions.filter(s => s.status === statusFilter);
  }, [sessions]);
  
  const filterSessionsByChannel = useCallback((channelFilter: string) => {
    if (channelFilter === 'all') return sessions;
    return sessions.filter(s => s.channel === channelFilter);
  }, [sessions]);
  
  const filterSessionsByAgentType = useCallback((agentTypeFilter: string) => {
    if (agentTypeFilter === 'all') return sessions;
    return sessions.filter(s => s.agentType === agentTypeFilter);
  }, [sessions]);
  
  const filterSessionsBySearch = useCallback((query: string) => {
    if (!query) return sessions;
    const lowerQuery = query.toLowerCase();
    return sessions.filter(s => 
      s.customer.toLowerCase().includes(lowerQuery) || 
      s.lastMessage.toLowerCase().includes(lowerQuery) ||
      (s.email && s.email.toLowerCase().includes(lowerQuery))
    );
  }, [sessions]);
  
  return {
    sessions,
    isLoading,
    isConnected,
    error,
    sendMessage,
    refreshSessions,
    filterSessionsByStatus,
    filterSessionsByChannel,
    filterSessionsByAgentType,
    filterSessionsBySearch
  };
}
