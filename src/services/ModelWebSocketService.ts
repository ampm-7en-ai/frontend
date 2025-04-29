
import { ChatWebSocketService } from './ChatWebSocketService';

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
    
    // Send the structured message
    this.sendStructuredMessage(messagePayload);
  }

  // Helper method to send the structured message
  private sendStructuredMessage(messagePayload: any) {
    // Use parent class method to send, avoiding direct access to private ws property
    if (this.isConnected()) {
      try {
        // Extract the raw WebSocket instance and send the message
        this.send(messagePayload);
      } catch (error) {
        console.error('Error sending structured message:', error);
      }
    } else {
      console.error('Cannot send message: WebSocket not connected');
    }
  }

  // Update the model configuration
  updateConfig(newConfig: ModelConfig) {
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
