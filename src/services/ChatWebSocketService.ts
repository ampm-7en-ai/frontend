
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
  
  constructor(sessionId: string, url: string = 'chat') {
    // Support different connection types: chat sessions or playground
    if (url === "playground") {
      this.ws = new WebSocketService(`wss://api.7en.ai/ws/chat-playground/${sessionId}/`);
    } else if (url === "chat") {
      this.ws = new WebSocketService(`wss://api.7en.ai/ws/chat/${sessionId}/`);
    } else if (url === "chatsessions") {
      // New endpoint for chat sessions
      const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
      
      if (!token) {
        console.error("No authorization token available for WebSocket connection");
        this.ws = new WebSocketService(`wss://api.7en.ai/ws/chatsessions/${sessionId}/`);
      } else {
        // Include the authorization token in the WebSocket URL
        this.ws = new WebSocketService(`wss://api.7en.ai/ws/chatsessions/${sessionId}/?token=${token}`);
      }
    } else {
      // Default case - use the provided URL directly
      this.ws = new WebSocketService(url);
    }
    
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
    
    // Extract model information correctly from the response
    // Check different possible locations where the model might be in the response
    const messageModel = data.model || data.config?.response_model || data.response_model || '';
    const messagePrompt = data.prompt || data.system_prompt || '';
    const messageTemperature = data.temperature !== undefined ? Number(data.temperature) : 
                              data.config?.temperature !== undefined ? Number(data.config.temperature) : undefined;
    
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
    
    // Log the model and temperature for debugging
    console.log('Message model:', messageModel);
    console.log('Message temperature:', messageTemperature);
    
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
