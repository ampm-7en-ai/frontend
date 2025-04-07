
export interface Agent {
  id: string;
  name: string;
  description: string;
  conversations: number;
  lastModified: string;
  averageRating: number;
  knowledgeSources: KnowledgeSource[];
  model: string;
  isDeployed: boolean;
  systemPrompt: string;
  avatarSrc?: string;
}

export interface KnowledgeSource {
  id: number;
  name: string;
  type: string;
  icon?: string;
  size: string;
  pages?: string;
  lastUpdated: string;
  trainingStatus: 'success' | 'idle' | 'training' | 'error';
  hasError?: boolean;
  linkBroken?: boolean;
  crawlOptions?: string;
  insideLinks?: Array<{url: string, title?: string, status: 'success' | 'error' | 'pending', selected?: boolean}>;
  content?: string;
  metadata?: any;
  isExpanded?: boolean;
  expandedUrlSections?: Record<string, boolean>;
  knowledge_sources?: any[];
}
