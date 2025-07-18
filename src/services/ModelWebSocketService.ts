
import { ChatWebSocketService } from './ChatWebSocketService';
import { WS_BASE_URL } from '@/config/env';

export interface ModelConfig {
  model: string;
  temperature: number;
  maxLength: number;
  systemPrompt: string;
}

export interface QueryData {
  id: string;
  content: string;
  timestamp: string;
  config: ModelConfig;
}

export interface ResponseData {
  id: string;
  queryId: string;
  content: string;
  timestamp: string;
}

export class ModelWebSocketService extends ChatWebSocketService {
  private modelConfig: ModelConfig;
  private modelIndex: number;
  private currentQueryId: string | null = null;
  private onQuerySent?: (queryData: QueryData) => void;
  private onResponseReceived?: (responseData: ResponseData) => void;
  
  constructor(agentId: string, modelConfig: ModelConfig, modelIndex: number) {
    const chatEndpoint = `chat${modelIndex + 1}`;
    super(`${agentId}/${chatEndpoint}`, "playground");
    
    this.modelConfig = modelConfig;
    this.modelIndex = modelIndex;

    console.log(`ModelWebSocketService initialized with model: ${this.modelConfig.model}`);
  }
  
  // Set history tracking callbacks
  setHistoryCallbacks(
    onQuerySent: (queryData: QueryData) => void,
    onResponseReceived: (responseData: ResponseData) => void
  ) {
    this.onQuerySent = onQuerySent;
    this.onResponseReceived = onResponseReceived;
  }
  
  override sendMessage(content: string) {
    // Generate unique query ID
    const queryId = `query-${Date.now()}-${this.modelIndex}`;
    this.currentQueryId = queryId;
    
    const messagePayload = {
      message: {
        content,
        timestamp: new Date().toISOString(),
        type: "user",
        queryId // Add query ID to track responses
      },
      config: {
        response_model: this.modelConfig.model,
        temperature: this.modelConfig.temperature,
        system_prompt: this.modelConfig.systemPrompt
      }
    };
    
    console.log(`Sending message with model: ${this.modelConfig.model}, queryId: ${queryId}`);
    
    // Track outgoing query
    if (this.onQuerySent) {
      this.onQuerySent({
        id: queryId,
        content,
        timestamp: new Date().toISOString(),
        config: this.modelConfig
      });
    }
    
    this.sendStructuredMessage(messagePayload);
  }

  private sendStructuredMessage(messagePayload: any) {
    if (this.isConnected()) {
      try {
        const enrichedPayload = {
          ...messagePayload,
          model: this.modelConfig.model
        };
        
        super.send(enrichedPayload);
      } catch (error) {
        console.error('Error sending structured message:', error);
      }
    } else {
      console.error('Cannot send message: WebSocket not connected');
    }
  }

  // Override the message handler to track responses
  protected handleIncomingMessage(message: any) {
    // Track response if we have a current query and response callback
    if (this.currentQueryId && this.onResponseReceived && message.content && message.type !== "system_message") {
      this.onResponseReceived({
        id: `response-${Date.now()}-${this.modelIndex}`,
        queryId: this.currentQueryId,
        content: message.content,
        timestamp: new Date().toISOString()
      });
    }
    
    // Call parent handler for normal processing
    super.handleIncomingMessage(message);
  }

  updateConfig(newConfig: ModelConfig) {
    console.log(`Updating model config from ${this.modelConfig.model} to ${newConfig.model}`);
    this.modelConfig = newConfig;
  }
  
  getConfig(): ModelConfig {
    return this.modelConfig;
  }
  
  getModelIndex(): number {
    return this.modelIndex;
  }
  
  getChatEndpoint(): string {
    return `chat${this.modelIndex + 1}`;
  }
}
