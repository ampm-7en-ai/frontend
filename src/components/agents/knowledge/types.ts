
export interface KnowledgeSource {
  id: number;
  name: string;
  type: string;
  size: string;
  lastUpdated: string;
  trainingStatus: 'idle' | 'training' | 'success' | 'error';
  progress?: number;
  linkBroken?: boolean;
  insideLinks?: {
    url: string;
    title: string;
    status: 'success' | 'error' | 'pending';
  }[];
  documents?: {
    id: string;
    name: string;
    type: string;
    size: string;
  }[];
  crawlOptions?: 'single' | 'children' | null;
}
