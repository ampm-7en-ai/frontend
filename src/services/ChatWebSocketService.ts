
import { string } from 'zod';
import { WebSocketService } from './WebSocketService';

interface ChatMessage {
  content: string;
  timestamp: string;
  type: string;
  model: string;
  prompt: string;
  temperature: number;
}

interface ChatWebSocketEvents {
  onMessage?: (message: ChatMessage) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  onError?: (error: string) => void;
  onConnectionChange?: (status: boolean) => void;
}

export class ChatWebSocketService {
  protected ws: WebSocketService;
  private events: ChatWebSocketEvents = {};
  private processedMessageIds: Set<string> = new Set(); // Track processed message IDs
  
  constructor(agentId: string, url: string) {
    // Updated URL format
    this.ws = new WebSocketService(url === "playground" ?  `wss://api.7en.ai/ws/chat-playground/${agentId}/` : `wss://api.7en.ai/ws/chat/${agentId}/`);
    
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
  
  isConnected(): boolean {
    return this.ws.isConnected();
  }
  
  sendMessage(content: string) {
    this.ws.send({
      type: 'message',
      content,
      timestamp: new Date().toISOString()
    });
  }
  
  // Allow sending arbitrary data to the WebSocket
  send(data: any) {
    this.ws.send(data);
  }
  
  on(events: ChatWebSocketEvents) {
    this.events = { ...this.events, ...events };
  }
  
  private handleMessage(data: any) {
    console.log('Received WebSocket data:', data);
    
    // Extract message content based on the new response format
    const messageContent = data.content || '';
    const messageType = data.type || 'bot_response';
    const messageTimestamp = data.timestamp || new Date().toISOString();
    const messageModel = data.model || '';
    const messageTemperature = data.temperature || '';
    const messagePrompt = data.prompt || '';
    
    // Skip if not a valid message
    if (!messageContent) {
      return;
    }
    
    // Generate a consistent ID for deduplication
    const messageId = `${messageContent}-${messageTimestamp}`;
    
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
    
    // Emit the message event
    this.events.onMessage?.({
      type: messageType,
      content: messageContent,
      timestamp: messageTimestamp,
      model: messageModel,
      temperature: messageTemperature,
      prompt: messagePrompt
    });
  }
}
