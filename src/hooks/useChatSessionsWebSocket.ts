
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatSessionsWebSocketService } from '@/services/ChatSessionsWebSocketService';

interface UseChatSessionsWebSocketProps {
  sessionId: string;
  onMessage?: (message: any) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  onSessionUpdate?: (session: any) => void;
  autoConnect?: boolean;
}

export function useChatSessionsWebSocket({
  sessionId,
  onMessage,
  onTypingStart,
  onTypingEnd,
  onSessionUpdate,
  autoConnect = true
}: UseChatSessionsWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<ChatSessionsWebSocketService | null>(null);
  
  // Initialize the WebSocket service
  useEffect(() => {
    if (!sessionId) return;
    
    // Create the service without passing sessionId to constructor
    wsRef.current = new ChatSessionsWebSocketService();
    
    wsRef.current.on({
      onMessage: (message) => {
        console.log('WebSocket message received:', message);
        onMessage?.(message);
      },
      onTypingStart: () => {
        setIsTyping(true);
        onTypingStart?.();
      },
      onTypingEnd: () => {
        setIsTyping(false);
        onTypingEnd?.();
      },
      onError: (err) => {
        console.error('WebSocket error:', err);
        setError(err);
      },
      onConnectionChange: (connected) => {
        console.log('WebSocket connection status:', connected);
        setIsConnected(connected);
      },
      onSessionUpdate: (session) => {
        console.log('Session update received:', session);
        onSessionUpdate?.(session);
      }
    });
    
    if (autoConnect) {
      wsRef.current.connect();
    }
    
    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [sessionId]);
  
  // Function to send messages
  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current) {
      setError('WebSocket not initialized');
      return;
    }
    
    if (!wsRef.current.isConnected()) {
      setError('WebSocket not connected');
      return;
    }
    
    try {
      // Fix: Pass sessionId as the first argument to sendMessage
      wsRef.current.sendMessage(sessionId, content);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  }, [sessionId]); // Add sessionId to dependencies
  
  // Function to send custom data
  const send = useCallback((data: any) => {
    if (!wsRef.current) {
      setError('WebSocket not initialized');
      return;
    }
    
    if (!wsRef.current.isConnected()) {
      setError('WebSocket not connected');
      return;
    }
    
    try {
      wsRef.current.send(data);
    } catch (err) {
      console.error('Error sending custom data:', err);
      setError('Failed to send data');
    }
  }, []);
  
  // Connect function
  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.connect();
    }
  }, []);
  
  // Disconnect function
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
    }
  }, []);
  
  return {
    isConnected,
    isTyping,
    error,
    sendMessage,
    send,
    connect,
    disconnect
  };
}
