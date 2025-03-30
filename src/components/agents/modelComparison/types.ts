
export type Message = {
  id: number;
  content: string;
  sender: 'user' | 'agent1' | 'agent2' | 'agent3';
  model?: string;
  timestamp: Date;
};

export type ChatConfig = {
  model: string;
  temperature: number;
  systemPrompt: string;
  maxLength: number;
};

export type Agent = {
  id: string;
  name: string;
  description: string;
  conversations: number;
  lastModified: string;
  averageRating: number;
  knowledgeSources: KnowledgeSource[];
  model: string;
  isDeployed: boolean;
  systemPrompt?: string;
};

// Import the full KnowledgeSource type from the central definition
import { KnowledgeSource } from '../knowledge/types';

// Re-export the type for backward compatibility
export type { KnowledgeSource };

export type ModelTestLink = {
  model: string;
  label?: string;
  openInNewTab?: boolean;
};
