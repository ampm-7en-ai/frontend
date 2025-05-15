
import { ChatWebSocketService } from './ChatWebSocketService';
import { WS_BASE_URL } from '@/config/env';

export interface ModelConfig {
  model: string;
  temperature: number;
  maxLength: number;
  systemPrompt: string;
}

export class ModelWebSocketService extends ChatWebSocketService {
  private modelConfig: ModelConfig;
  private modelIndex: number;
  
  constructor(agentId: string, modelConfig: ModelConfig, modelIndex: number) {
    // Connect to the new URL format with chat1, chat2, chat3 based on model index
    const chatEndpoint = `chat${modelIndex + 1}`;
    super(`${agentId}/${chatEndpoint}`,"playground");
    
    this.modelConfig = modelConfig;
    this.modelIndex = modelIndex;

    // Log the initial model configuration
    console.log(`ModelWebSocketService initialized with model: ${this.modelConfig.model}`);
  }
  
  override sendMessage(content: string) {
    // Use the new message structure with separate message and config objects
    const messagePayload = {
      message: {
        content,
        timestamp: new Date().toISOString(),
        type: "user"
      },
      config: {
        response_model: this.modelConfig.model,
        temperature: this.modelConfig.temperature,
        system_prompt: this.modelConfig.systemPrompt
      }
    };
    
    console.log(`Sending message with model: ${this.modelConfig.model}`);
    
    // Send the structured message
    this.sendStructuredMessage(messagePayload);
  }

  // Helper method to send the structured message
  private sendStructuredMessage(messagePayload: any) {
    // Use parent class method to send, avoiding direct access to private ws property
    if (this.isConnected()) {
      try {
        // Add model metadata to ensure it's included in the response handling
        const enrichedPayload = {
          ...messagePayload,
          model: this.modelConfig.model  // Add model at top level for easier extraction
        };
        
        // Send the message using the parent class send method
        super.send(enrichedPayload);
      } catch (error) {
        console.error('Error sending structured message:', error);
      }
    } else {
      console.error('Cannot send message: WebSocket not connected');
    }
  }

  // Update the model configuration without reconnecting
  updateConfig(newConfig: ModelConfig) {
    console.log(`Updating model config from ${this.modelConfig.model} to ${newConfig.model}`);
    this.modelConfig = newConfig;
  }
  
  // Get current config
  getConfig(): ModelConfig {
    return this.modelConfig;
  }
  
  // Get model index
  getModelIndex(): number {
    return this.modelIndex;
  }
}
