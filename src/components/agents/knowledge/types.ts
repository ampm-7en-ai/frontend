
export interface KnowledgeSource {
  id: number;
  name: string;
  type: string;
  size: string;
  lastUpdated: string;
  trainingStatus: 'idle' | 'training' | 'success' | 'error';
  progress?: number;
  linkBroken?: boolean;
  hasError?: boolean;
  content?: string;
  insideLinks?: {
    url: string;
    title: string;
    status: 'success' | 'error' | 'pending';
    selected?: boolean;
    children?: any[]; // Add the children property to support nested URL structures
  }[];
  children?: {
    url: string;
    title: string;
    status: 'success' | 'error' | 'pending';
    selected?: boolean;
    children?: any[]; // Top-level children property for compatibility with new API structure
  }[];
  documents?: {
    id: string;
    name: string;
    type: string;
    size: string;
    selected?: boolean;
  }[];
  crawlOptions?: 'single' | 'children' | null;
  metadata?: {
    count?: string;
    file_size?: string | number;
    no_of_chars?: number;
    no_of_rows?: number;
    no_of_pages?: number;
  };
  icon?: string;
  knowledge_sources?: {
    id: number;
    url: string;
    title: string;
    selected?: boolean;
  }[];
}
