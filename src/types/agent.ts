
export interface KnowledgeSource {
  id: string | number;
  name: string;
  type: string;
  size: string;
  lastUpdated: string;
  trainingStatus?: 'Active' | 'Training' | 'Issues' | 'idle';
  linkBroken?: boolean;
  knowledge_sources?: any[];
  metadata?: any;
  url?: string;
  title?: string;
  sub_urls?: {
    children: Array<{
      url: string;
      is_selected: boolean;
    }>;
  };
  is_selected?: boolean;
  status?: string;
}

export interface AgentData {
  id: string | null;
  name: string;
  description?: string;
  agentType?: string;
  chatbotName: string;
  welcomeMessage: string;
  buttonText: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  position: 'bottom-right' | 'bottom-left';
  suggestions: string[];
  avatar: string;
  avatarUrl: string;
  avatarType?: string;
  systemPrompt: string;
  knowledgeSources: KnowledgeSource[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  guidelines?: {
    dos: string[];
    donts: string[];
  };
  behavior?: {
    conversationMemory?: boolean;
    continuousLearning?: boolean;
    expertHandoff?: boolean;
    aiToAiHandoff?: boolean;
    multilingualSupport?: boolean;
  };
  settings?: any;
}
