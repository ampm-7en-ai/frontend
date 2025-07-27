
import { string } from 'zod';
import { WebSocketService } from './WebSocketService';
import { WS_BASE_URL } from '@/config/env';

interface ChatMessage {
  id?: string;
  content: string;
  timestamp: string;
  type: string;
  model: string;
  prompt: string;
  temperature: number;
  ui_type?: string;
}

interface ChatWebSocketEvents {
  onMessage?: (message: ChatMessage) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  onError?: (error: string) => void;
  onConnectionChange?: (status: boolean) => void;
  onSessionCreated?: (sessionId: string) => void;
  onSessionRestored?: (messages: ChatMessage[]) => void;
}

export class ChatWebSocketService {
  protected ws: WebSocketService;
  private events: ChatWebSocketEvents = {};
  private processedMessageIds: Set<string> = new Set();
  private visitorId: string | null = null;
  private sessionId: string | null = null;
  private shouldRestore: boolean = false;
  private isRestoringSession: boolean = false;
  private onSessionUpdate?: (sessionData: any) => void;
  
  constructor(
    agentId: string, 
    url: string, 
    visitorId?: string | null, 
    sessionId?: string | null, 
    shouldRestore?: boolean,
    onSessionUpdate?: (sessionData: any) => void
  ) {
    this.visitorId = visitorId || null;
    this.sessionId = sessionId || null;
    this.shouldRestore = shouldRestore || false;
    this.onSessionUpdate = onSessionUpdate;
    
    // Updated URL format using WS_BASE_URL from environment
    this.ws = new WebSocketService(url === "playground" ? 
      `${WS_BASE_URL}chat-playground/${agentId}/` : 
      `${WS_BASE_URL}chat/${agentId}/`);
    
    // Only listen to 'message' event to avoid duplication
    this.ws.on('message', this.handleMessage.bind(this));
    this.ws.on('typing_start', () => this.events.onTypingStart?.());
    this.ws.on('typing_end', () => this.events.onTypingEnd?.());
    this.ws.on('error', (error) => this.events.onError?.(error));
    this.ws.on('connection', (data) => {
      this.events.onConnectionChange?.(data.status === 'connected');
      
      // Send initialization message when connected
      if (data.status === 'connected') {
        this.initializeSession();
      }
    });
  }
  
  private initializeSession() {
    console.log('Initializing session with:', {
      visitorId: this.visitorId,
      sessionId: this.sessionId,
      shouldRestore: this.shouldRestore
    });
    
    const initMessage: any = {
      type: 'init',
      source: 'website_embed',
      visitor_id: this.visitorId
    };
    
    // If we have a session ID and should restore, include it in the init message
    if (this.sessionId && this.shouldRestore) {
      initMessage.session_id = this.sessionId;
      this.isRestoringSession = true;
    }
    
    this.ws.send(initMessage);
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
    const message = {
      type: 'message',
      content,
      timestamp: new Date().toISOString()
    };
    
    // Include visitor ID and session ID if available
    if (this.visitorId) {
      (message as any).visitor_id = this.visitorId;
    }
    
    if (this.sessionId) {
      (message as any).session_id = this.sessionId;
    }
    
    this.ws.send(message);
  }
  
  // Allow sending arbitrary data to the WebSocket
  send(data: any) {
    // Include visitor ID in all messages if available
    if (this.visitorId) {
      data.visitor_id = this.visitorId;
    }
    
    if (this.sessionId) {
      data.session_id = this.sessionId;
    }
    
    this.ws.send(data);
  }
  
  on(events: ChatWebSocketEvents) {
    this.events = { ...this.events, ...events };
  }
  
  private handleMessage(data: any) {
    console.log('=== RAW WebSocket Message ===');
    console.log('Full data:', JSON.stringify(data, null, 2));
    console.log('Data type:', data.type);
    console.log('Data timestamp field:', data.timestamp);
    console.log('Data keys:', Object.keys(data));
    
    // Capture session_id from server if provided
    if (data.session_id && data.session_id !== this.sessionId) {
      console.log('Session ID updated from server:', data.session_id);
      this.sessionId = data.session_id;
      this.events.onSessionCreated?.(data.session_id);
      
      // Notify parent of session update
      if (this.onSessionUpdate) {
        this.onSessionUpdate({
          sessionId: data.session_id,
          visitorId: this.visitorId,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Handle session restoration messages
    if (this.isRestoringSession && data.type === 'session_restored') {
      console.log('Session restoration completed');
      this.isRestoringSession = false;
      
      if (data.messages && Array.isArray(data.messages)) {
        const restoredMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content || '',
          timestamp: msg.timestamp || new Date().toISOString(),
          type: msg.type || 'bot_response',
          model: msg.model || '',
          prompt: msg.prompt || '',
          temperature: msg.temperature || 0,
          ui_type: msg.ui_type
        }));
        
        this.events.onSessionRestored?.(restoredMessages);
      }
      return;
    }
    
    // Handle UI messages (like yes_no) that don't have content
    if (data.type === 'ui' && data.ui_type) {
      const messageTimestamp = this.extractTimestamp(data);
      const messageId = `${data.type}-${data.ui_type}-${messageTimestamp}`;
      
      console.log('=== UI Message Processing ===');
      console.log('UI message timestamp:', messageTimestamp);
      
      // Skip if we've already processed this message
      if (this.processedMessageIds.has(messageId)) {
        console.log('Skipping duplicate UI message:', messageId);
        return;
      }
      
      // Add to processed messages
      this.processedMessageIds.add(messageId);
      
      // Emit the UI message event
      this.events.onMessage?.({
        id: messageId,
        type: data.type,
        content: '', // UI messages don't need content
        timestamp: messageTimestamp,
        model: '',
        temperature: 0,
        prompt: '',
        ui_type: data.ui_type
      });
      
      return;
    }
    
    // Handle regular messages (including restored ones during session restoration)
    const messageContent = data.content || '';
    const messageType = data.type || 'bot_response';
    const messageTimestamp = this.extractTimestamp(data);
    
    console.log('=== Regular Message Processing ===');
    console.log('Message type:', messageType);
    console.log('Message content:', messageContent);
    console.log('Extracted timestamp:', messageTimestamp);
    console.log('Is restoring session:', this.isRestoringSession);
    
    // Extract model information correctly from the response
    const messageModel = data.model || data.config?.response_model || data.response_model || '';
    const messagePrompt = data.prompt || data.system_prompt || '';
    const messageTemperature = data.temperature !== undefined ? Number(data.temperature) : 
                              data.config?.temperature !== undefined ? Number(data.config.temperature) : 0;
    
    // Skip if not a valid message (except for UI messages which we handled above)
    if (!messageContent && data.type !== 'ui') {
      console.log('Skipping message without content');
      return;
    }
    
    // During session restoration, don't use deduplication to ensure all messages are restored
    if (!this.isRestoringSession) {
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
        this.processedMessageIds = new Set(
          Array.from(this.processedMessageIds).slice(-50)
        );
      }
    }
    
    console.log('=== Final Message Data ===');
    console.log('Final timestamp being sent:', messageTimestamp);
    console.log('Message model:', messageModel);
    console.log('Message temperature:', messageTemperature);
    
    // Emit the message event
    this.events.onMessage?.({
      id: data.id || `${messageType}-${Date.now()}`,
      type: messageType,
      content: messageContent,
      timestamp: messageTimestamp,
      model: messageModel,
      temperature: messageTemperature,
      prompt: messagePrompt
    });
  }
  
  private extractTimestamp(data: any): string {
    // Check multiple possible locations for timestamp, including nested objects
    const possibleTimestamps = [
      data.timestamp,
      data.created_at,
      data.time,
      data.datetime,
      data.sent_at,
      data.message?.timestamp,
      data.response?.timestamp,
      data.message?.created_at,
      data.response?.created_at
    ];
    
    console.log('=== Timestamp Extraction ===');
    console.log('Checking timestamps:', possibleTimestamps);
    
    for (const ts of possibleTimestamps) {
      if (ts) {
        // Validate timestamp format
        try {
          const date = new Date(ts);
          if (!isNaN(date.getTime())) {
            console.log('Valid timestamp found:', ts);
            return ts;
          }
        } catch (error) {
          console.log('Invalid timestamp format:', ts);
        }
      }
    }
    
    // Fallback to current time if no valid timestamp found
    const fallbackTimestamp = new Date().toISOString();
    console.log('Using fallback timestamp:', fallbackTimestamp);
    return fallbackTimestamp;
  }
}
