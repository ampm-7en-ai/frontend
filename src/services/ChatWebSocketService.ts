
import { WebSocketService } from './WebSocketService';

interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
}

interface ChatWebSocketEvents {
  onMessage?: (message: ChatMessage) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  onError?: (error: string) => void;
  onConnectionChange?: (status: boolean) => void;
}

export class ChatWebSocketService {
  private ws: WebSocketService;
  private events: ChatWebSocketEvents = {};
  private processedMessageIds: Set<string> = new Set(); // Track processed message IDs
  
  constructor(agentId: string) {
    this.ws = new WebSocketService(`wss://api.7en.ai/ws/chat/${agentId}/`);
    
    this.ws.on('message', this.handleMessage.bind(this));
    this.ws.on('bot_response', this.handleMessage.bind(this));
    this.ws.on('typing_start', () => this.events.onTypingStart?.());
    this.ws.on('typing_end', () => this.events.onTypingEnd?.());
    this.ws.on('error', (error) => this.events.onError?.(error));
    this.ws.on('connection', (data) => this.events.onConnectionChange?.(data.status === 'connected'));
  }
  
  connect() {
    this.ws.connect();
  }
  
  disconnect() {
    this.ws.disconnect();
  }
  
  sendMessage(content: string) {
    this.ws.send({
      type: 'message',
      content,
      timestamp: new Date().toISOString()
    });
  }
  
  on(events: ChatWebSocketEvents) {
    this.events = { ...this.events, ...events };
  }
  
  private handleMessage(data: any) {
    console.log('Received WebSocket data:', data);
    
    // Skip if not a valid message
    if (!data || (!data.type && !data.content)) {
      return;
    }
    
    // Generate a consistent ID for deduplication
    const messageId = data.id || 
                     `${data.content}-${data.timestamp || new Date().toISOString()}`;
                     
    // Skip if we've already processed this message
    if (this.processedMessageIds.has(messageId)) {
      console.log('Skipping duplicate message:', messageId);
      return;
    }
    
    // Add to processed messages
    this.processedMessageIds.add(messageId);
    
    // Limit the size of the set to prevent memory issues
    if (this.processedMessageIds.size > 100) {
      // Remove the oldest entries (convert to array, slice, and convert back)
      this.processedMessageIds = new Set(
        Array.from(this.processedMessageIds).slice(-50)
      );
    }
    
    if (data.type === 'bot_response' || data.content) {
      this.events.onMessage?.({
        type: 'bot',
        content: data.content || '',
        timestamp: data.timestamp || new Date().toISOString()
      });
      
      // End typing when message is received
      this.events.onTypingEnd?.();
    }
  }
}
