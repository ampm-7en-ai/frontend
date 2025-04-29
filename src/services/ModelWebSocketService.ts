
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
    super(agentId);
    this.modelConfig = modelConfig;
    this.modelIndex = modelIndex;
  }
  
  override sendMessage(content: string) {
    // Send message with model configuration
    this.ws.send({
      type: 'message',
      content,
      timestamp: new Date().toISOString(),
      model: this.modelConfig.model,
      temperature: this.modelConfig.temperature,
      maxLength: this.modelConfig.maxLength,
      systemPrompt: this.modelConfig.systemPrompt,
      modelIndex: this.modelIndex
    });
  }

  // Update the model configuration
  updateConfig(newConfig: ModelConfig) {
    this.modelConfig = newConfig;
  }
}
