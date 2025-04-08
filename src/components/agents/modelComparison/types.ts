
export interface Agent {
  id: string;
  name: string;
  description?: string;
  conversations?: number;
  lastModified?: string;
  averageRating?: number;
  knowledgeSources: KnowledgeSource[];
  model: string;
  isDeployed: boolean;
  systemPrompt?: string;
  avatarSrc?: string;
  knowledge_bases?: any[]; // Original knowledge_bases from API
}

export interface Message {
  id: number;
  content: string;
  sender: 'user' | 'agent1' | 'agent2' | 'agent3';
  timestamp: Date;
  avatarSrc?: string;
  model?: string;
}

export interface ChatConfig {
  model: string;
  temperature: number;
  systemPrompt: string;
  maxLength: number;
}
