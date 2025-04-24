
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
