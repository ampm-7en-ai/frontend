
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
