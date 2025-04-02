
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
    domain_links?: UrlNode | UrlNode[];
    website?: string;
    crawl_more?: boolean;
    last_updated?: string;
    last_fetched?: string;
    knowledge_source_ids?: number[];
  };
  icon?: string;
  knowledge_sources?: KnowledgeSourceItem[];
}

export interface KnowledgeSourceItem {
  id: number | string;
  url: string;
  title: string;
  status?: string;
  selected?: boolean;
  knowledge_base?: number;
  parent_knowledge_source?: number | null;
  metadata?: {
    format?: string;
    sub_urls?: {
      key: string;
      url: string;
      children?: SubUrlItem[];
    };
    crawl_more?: string;
    no_of_pages?: number;
    upload_date?: string;
    last_fetched?: string;
  };
  owner?: number;
  sub_knowledge_sources?: KnowledgeSourceItem[];
}

export interface SubUrlItem {
  key: string;
  url: string;
  children?: SubUrlItem[];
}

// Define recursive UrlNode interface for nested URL structure
export interface UrlNode {
  url: string;
  title?: string;
  selected?: boolean;
  children?: UrlNode[];
  // Add nesting level for UI display purposes
  level?: number;
  path?: string;
}

// Interface for the processed source data expected by ImportSourcesDialog
export interface ProcessedSource extends KnowledgeSource {
  format: string;
  pages?: string;
  domain_links?: UrlNode | UrlNode[];
}

// Interface for flattened URL structure with nesting information
export interface FlattenedUrlNode {
  url: string;
  title: string;
  level: number;
  path: string;
  parentUrl?: string;
}

// Adding helper types for debugging and analysis
export interface SourceAnalysis {
  id: number | string;
  name: string;
  type: string;
  hasDomainLinks: boolean;
  domainLinksSource: 'metadata' | 'direct' | 'none';
  hasChildren: boolean;
  childrenCount: number;
  structure?: string;
}
