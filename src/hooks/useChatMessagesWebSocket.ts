
import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketService } from '@/services/WebSocketService';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  agent?: string;
  type?: string;
}

interface UseChatMessagesWebSocketProps {
  sessionId: string | null;
  onMessage?: (message: Message) => void;
  onMessagesReceived?: (messages: Message[]) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  autoConnect?: boolean;
}

export function useChatMessagesWebSocket({
  sessionId,
  onMessage,
  onMessagesReceived,
  onTypingStart,
  onTypingEnd,
  autoConnect = true
}: UseChatMessagesWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocketService | null>(null);
  const currentSessionId = useRef<string | null>(null);
  
  // Initialize the WebSocket service
  useEffect(() => {
    // If no session ID or it's the same as current, don't reconnect
    if (!sessionId || sessionId === currentSessionId.current) {
      return;
    }
    
    // Clean up any existing connection
    if (wsRef.current) {
      console.log(`Disconnecting from previous websocket for session ${currentSessionId.current}`);
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    
    // Update current session ID
    currentSessionId.current = sessionId;
    
    // Create WebSocket URL with sessionId
    const wsUrl = `wss://api.7en.ai/ws/chat/messages/${sessionId}/`;
    console.log(`Connecting to messages WebSocket for session ${sessionId}`);
    wsRef.current = new WebSocketService(wsUrl);
    
    // Reset messages when changing sessions
    setMessages([]);
    
    // Set up event handlers
    wsRef.current.on('messages', (data) => {
      console.log('Messages received:', data);
      if (data.data && Array.isArray(data.data)) {
        setMessages(data.data);
        onMessagesReceived?.(data.data);
      }
    });
    
    wsRef.current.on('message', (data) => {
      console.log('New message received:', data);
      if (data) {
        onMessage?.(data);
        // Update messages array with the new message
        setMessages(prev => [...prev, data]);
      }
    });
    
    wsRef.current.on('typing_start', () => {
      console.log('Typing started');
      setIsTyping(true);
      onTypingStart?.();
    });
    
    wsRef.current.on('typing_end', () => {
      console.log('Typing ended');
      setIsTyping(false);
      onTypingEnd?.();
    });
    
    wsRef.current.on('error', (err) => {
      console.error('WebSocket error:', err);
      setError(err);
    });
    
    wsRef.current.on('connection', (data) => {
      console.log('WebSocket connection status:', data);
      setIsConnected(data.status === 'connected');
    });
    
    // Connect if autoConnect is true
    if (autoConnect) {
      wsRef.current.connect();
    }
    
    // Cleanup function
    return () => {
      if (wsRef.current && currentSessionId.current === sessionId) {
        console.log(`Disconnecting from messages WebSocket for session ${sessionId}`);
        wsRef.current.disconnect();
        wsRef.current = null;
        currentSessionId.current = null;
      }
    };
  }, [sessionId]);
  
  // Function to send a message
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
      wsRef.current.send({
        type: 'message',
        content,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  }, []);
  
  // Function to manually connect
  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.connect();
    }
  }, []);
  
  // Function to disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      currentSessionId.current = null;
    }
  }, []);
  
  return {
    isConnected,
    isTyping,
    messages,
    error,
    sendMessage,
    connect,
    disconnect
  };
}
