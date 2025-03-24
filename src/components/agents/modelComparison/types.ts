
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

export type KnowledgeSource = {
  id: number;
  name: string;
  type: string;
  icon?: string;
  hasError: boolean;
  content?: string;
};
