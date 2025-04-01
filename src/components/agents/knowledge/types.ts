
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
    format?: string;
    upload_date?: string;
  };
  icon?: string;
  knowledge_sources?: {
    id: number | string;
    url?: string;
    title?: string;
    status?: string;
    metadata?: {
      format?: string;
      no_of_pages?: number;
      file_size?: string | number;
      count?: string;
      upload_date?: string;
    };
    selected?: boolean;
    file?: string | null;
    knowledge_base?: number;
    parent_knowledge_source?: number | null;
    owner?: number;
    sub_knowledge_sources?: any[];
  }[];
}
