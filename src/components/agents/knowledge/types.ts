
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
    domain_links?: {
      url: string;
      children?: Array<UrlNode>;
    } | Array<{
      url: string;
      children?: Array<UrlNode>;
    }>;
  };
  icon?: string;
  knowledge_sources?: {
    id: number | string;
    url: string;
    title: string;
    selected?: boolean;
  }[];
}

// Define recursive UrlNode interface for nested URL structure
export interface UrlNode {
  url: string;
  title?: string;
  selected?: boolean;
  children?: Array<UrlNode>;
}
