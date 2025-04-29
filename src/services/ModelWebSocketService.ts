
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
    // Instead of directly accessing the private ws property,
    // we use the public methods from the parent class
    // and add our additional properties to the message
    super.sendMessage(content);
    
    // The parent class handles the actual sending, we don't need to
    // directly access the ws property anymore
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
