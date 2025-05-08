
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
  const messagesMapRef = useRef<Map<string, Message[]>>(new Map());
  
  // Initialize the WebSocket service
  useEffect(() => {
    // If no session ID, don't connect
    if (!sessionId) {
      setMessages([]);
      return;
    }
    
    console.log(`Session change detected: ${currentSessionId.current} -> ${sessionId}`);
    
    // Immediately set messages from cache if available to prevent flicker
    const cachedMessages = messagesMapRef.current.get(sessionId);
    if (cachedMessages) {
      console.log(`Using cached messages for session ${sessionId}`, cachedMessages.length);
      setMessages(cachedMessages);
    } else {
      console.log(`No cached messages for session ${sessionId}, clearing messages`);
      setMessages([]);
    }
    
    // If it's the same session ID and already connected, don't reconnect
    if (sessionId === currentSessionId.current && wsRef.current && wsRef.current.isConnected()) {
      console.log(`Already connected to websocket for session ${sessionId}`);
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
    
    // Set up event handlers
    wsRef.current.on('messages', (data) => {
      console.log(`Messages received for session ${sessionId}:`, data);
      if (data.data && Array.isArray(data.data)) {
        const validMessages = data.data.filter((msg: any) => 
          msg && msg.content && typeof msg.content === 'string' && msg.content.trim() !== ''
        );
        
        // Only update if this is still the current session
        if (sessionId === currentSessionId.current) {
          setMessages(validMessages);
          onMessagesReceived?.(validMessages);
        }
        
        // Cache messages for this session ID
        messagesMapRef.current.set(sessionId, validMessages);
      }
    });
    
    wsRef.current.on('message', (data) => {
      console.log(`New message received for session ${sessionId}:`, data);
      if (data && data.content && typeof data.content === 'string' && data.content.trim() !== '') {
        // Only update if this is still the current session
        if (sessionId === currentSessionId.current) {
          onMessage?.(data);
          // Update messages array with the new message
          setMessages(prev => {
            const updated = [...prev, data];
            // Update cache
            messagesMapRef.current.set(sessionId, updated);
            return updated;
          });
        } else {
          // If message is for a different session, just update the cache
          const cachedSessionMessages = messagesMapRef.current.get(data.sessionId) || [];
          messagesMapRef.current.set(data.sessionId, [...cachedSessionMessages, data]);
        }
      }
    });
    
    wsRef.current.on('typing_start', () => {
      console.log(`Typing started in session ${sessionId}`);
      // Only update typing status if this is the current session
      if (sessionId === currentSessionId.current) {
        setIsTyping(true);
        onTypingStart?.();
      }
    });
    
    wsRef.current.on('typing_end', () => {
      console.log(`Typing ended in session ${sessionId}`);
      // Only update typing status if this is the current session
      if (sessionId === currentSessionId.current) {
        setIsTyping(false);
        onTypingEnd?.();
      }
    });
    
    wsRef.current.on('error', (err) => {
      console.error(`WebSocket error for session ${sessionId}:`, err);
      if (sessionId === currentSessionId.current) {
        setError(err);
      }
    });
    
    wsRef.current.on('connection', (data) => {
      console.log(`WebSocket connection status for session ${sessionId}:`, data);
      if (sessionId === currentSessionId.current) {
        setIsConnected(data.status === 'connected');
      }
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
