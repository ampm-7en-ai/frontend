
import { WebSocketService } from './WebSocketService';

export interface ChatSessionData {
  id: string;
  customer: string;
  email: string | null;
  lastMessage: string;
  time: string;
  status: string;
  agent: string;
  satisfaction: string;
  priority: string;
  duration: string;
  handoffCount: number;
  topic: string[];
  channel: string;
  agentType?: "human" | "ai" | null;
}

export interface ChatSessionMessage {
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
  onSessionsUpdate?: (sessions: ChatSessionData[]) => void;
  onSessionUpdate?: (session: any) => void;
}

export class ChatSessionsWebSocketService {
  private ws: WebSocketService;
  private events: ChatSessionsWebSocketEvents = {};
  private processedMessageIds: Set<string> = new Set();
  private authToken: string | null = null;
  
  constructor() {
    // Get auth token from localStorage
    this.authToken = JSON.parse(localStorage.getItem('user') || '{}')?.accessToken || null;

    // Use the WebSocket endpoint for chat sessions
    const endpoint = `wss://api.7en.ai/ws/chat/sessions/?token=${this.authToken}`;
   
    // Initialize WebSocket
    this.ws = new WebSocketService(endpoint);
    
    // Set authentication headers immediately if token is available
    if (this.authToken) {
      this.ws.setAuthHeaders({
        'Authorization': `Bearer ${this.authToken}`
      });
    }
    
    // Set up event handlers
    this.ws.on('message', this.handleMessage.bind(this));
    this.ws.on('sessions', this.handleSessions.bind(this));
    this.ws.on('typing_start', () => this.events.onTypingStart?.());
    this.ws.on('typing_end', () => this.events.onTypingEnd?.());
    this.ws.on('error', (error) => this.events.onError?.(error));
    this.ws.on('connection', (data) => {
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
    
    // Send auth message to WebSocket server
    this.ws.send({
      type: "authorization",
      token: `Bearer ${this.authToken}`
    });
  }
  
  // Send a message to a specific session
  sendMessage(sessionId: string, content: string) {
    this.ws.send({
      type: 'user_message',
      sessionId,
      content,
      timestamp: new Date().toISOString()
    });
  }
  
  // Send a request to get sessions
  requestSessions() {
    this.ws.send({
      type: 'get_sessions'
    });
  }
  
  // Allow sending arbitrary data to the WebSocket
  send(data: any) {
    this.ws.send(data);
  }
  
  on(events: ChatSessionsWebSocketEvents) {
    this.events = { ...this.events, ...events };
  }
  
  // Handle incoming sessions data
  private handleSessions(data: { type: string, data: ChatSessionData[] }) {
    console.log('Received sessions data:', data);
    if (data.type === 'sessions' && Array.isArray(data.data)) {
      this.events.onSessionsUpdate?.(data.data);
    }
  }
  
  // Handle incoming messages
  private handleMessage(data: any) {
    console.log('Received ChatSessions WebSocket data:', data);
    
    // If it's a session update, handle it separately
    if (data.type === 'session_update') {
      this.events.onSessionUpdate?.(data);
      return;
    }
    
    // Skip if not a valid message type
    if (data.type !== 'bot_response' && data.type !== 'user_message') {
      return;
    }
    
    // Extract message content based on the response format
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
