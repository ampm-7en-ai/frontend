
export interface KnowledgeSource {
  id: number;
  name: string;
  type: string;
  icon: string;
  hasError: boolean;
}

export type AgentPosition = 'bottom-right' | 'bottom-left';
export type AgentStatus = 'active' | 'inactive';
export type AgentModelType = 'gpt4' | 'gpt35' | 'anthropic' | 'mistral' | 'llama';
export type AgentResponseLength = 'short' | 'medium' | 'long';
export type AgentType = 'support' | 'sales' | 'technical' | 'custom';

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  
  // Appearance settings
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  chatbotName: string;
  welcomeMessage: string;
  buttonText: string;
  position: AgentPosition;
  
  // Advanced settings
  selectedModel: AgentModelType;
  temperature: number;
  maxResponseLength: AgentResponseLength;
  agentType?: AgentType;
  
  // Chat behavior
  showOnMobile: boolean;
  collectVisitorData: boolean;
  autoShowAfter: number;
  
  // Knowledge
  knowledgeSources: number[];
  
  // Stats (for display in lists/cards)
  isDeployed?: boolean;
  conversations?: number;
  averageRating?: number;
}
