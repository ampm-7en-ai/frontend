
import { WebSocketService } from './WebSocketService';

interface ChatSessionMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'bot' | 'system';
  sessionId?: string;
  metadata?: {
    model?: string;
    temperature?: number;
    prompt?: string;
    [key: string]: any;
  };
}

interface ChatSessionsWebSocketEvents {
  onMessage?: (message: ChatSessionMessage) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  onError?: (error: string) => void;
  onConnectionChange?: (status: boolean) => void;
  onSessionUpdate?: (session: any) => void;
}

export class ChatSessionsWebSocketService {
  private ws: WebSocketService;
  private events: ChatSessionsWebSocketEvents = {};
  private processedMessageIds: Set<string> = new Set();
  private authToken: string | null = null;
  
  constructor(sessionId: string) {
    // Use the new WebSocket endpoint
    const endpoint = `wss://api.7en.ai/ws/chat/chatsessions/${sessionId}/`;
    this.ws = new WebSocketService(endpoint);
    
    // Get auth token from localStorage
    this.authToken = localStorage.getItem('accessToken');
    
    // Set up event handlers
    this.ws.on('message', this.handleMessage.bind(this));
    this.ws.on('bot_response', this.handleMessage.bind(this));
    this.ws.on('typing_start', () => this.events.onTypingStart?.());
    this.ws.on('typing_end', () => this.events.onTypingEnd?.());
    this.ws.on('error', (error) => this.events.onError?.(error));
    this.ws.on('connection', (data) => {
      if (data.status === 'connected') {
        // Send authentication message on connection
        if (this.authToken) {
          this.authenticate();
        }
      }
      this.events.onConnectionChange?.(data.status === 'connected');
    });
    this.ws.on('session_update', (data) => this.events.onSessionUpdate?.(data));
  }
  
  connect() {
    this.ws.connect();
  }
  
  disconnect() {
    this.ws.disconnect();
  }
  
  isConnected(): boolean {
    return this.ws.isConnected();
  }
  
  // Send authentication message
  authenticate() {
    if (!this.authToken) {
      console.error('No auth token available for WebSocket authentication');
      return;
    }
    
    this.ws.send({
      type: 'authenticate',
      token: this.authToken,
      timestamp: new Date().toISOString()
    });
  }
  
  // Updated to match the expected format for the chat sessions endpoint
  sendMessage(content: string) {
    this.ws.send({
      type: 'user_message',
      content,
      timestamp: new Date().toISOString()
    });
  }
  
  // Allow sending arbitrary data to the WebSocket
  send(data: any) {
    this.ws.send(data);
  }
  
  on(events: ChatSessionsWebSocketEvents) {
    this.events = { ...this.events, ...events };
  }
  
  private handleMessage(data: any) {
    console.log('Received ChatSessions WebSocket data:', data);
    
    // If it's a session update, handle it separately
    if (data.type === 'session_update') {
      this.events.onSessionUpdate?.(data);
      return;
    }
    
    // Extract message content based on the response format
    // Adjust this based on the actual structure of the responses
    const messageContent = data.content || data.message?.content || '';
    const messageType = data.type || data.message?.type || 'bot_response';
    const messageTimestamp = data.timestamp || data.message?.timestamp || new Date().toISOString();
    const messageSender = data.sender || data.message?.sender || 'bot';
    const messageId = data.id || data.message?.id || `${messageContent}-${messageTimestamp}`;
    
    // Extract metadata if available
    const metadata = data.metadata || {};
    
    // Skip if not a valid message
    if (!messageContent) {
      return;
    }
    
    // Skip if we've already processed this message
    if (this.processedMessageIds.has(messageId)) {
      console.log('Skipping duplicate message:', messageId);
      return;
    }
    
    // Add to processed messages
    this.processedMessageIds.add(messageId);
    
    // Limit the size of the set to prevent memory issues
    if (this.processedMessageIds.size > 100) {
      // Remove the oldest entries
      this.processedMessageIds = new Set(
        Array.from(this.processedMessageIds).slice(-50)
      );
    }
    
    // Emit the message event
    this.events.onMessage?.({
      id: messageId,
      content: messageContent,
      timestamp: messageTimestamp,
      sender: messageSender as 'user' | 'bot' | 'system',
      metadata: {
        model: metadata.model || data.model,
        temperature: metadata.temperature || data.temperature,
        prompt: metadata.prompt || data.prompt
      }
    });
  }
}
