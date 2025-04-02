
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
    title?: string;
    status: 'error' | 'success' | 'pending';
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
  format?: string; // Making format optional in KnowledgeSource
  pages?: string;  // Making pages optional in KnowledgeSource
  selected?: boolean; // Track selection state
  selectedSubUrls?: Set<string>; // Store selected sub URLs
}

export interface KnowledgeSourceItem {
  id: number | string;
  url: string | null;
  file?: string | null;
  title: string;
  status?: string;
  selected?: boolean;
  knowledge_base?: number;
  parent_knowledge_source?: number | null;
  metadata?: {
    format?: string;
    file_size?: string | number;
    sub_urls?: UrlNode;
    crawl_more?: string | boolean;
    no_of_pages?: number;
    no_of_rows?: number;
    no_of_chars?: number;
    upload_date?: string;
    last_fetched?: string;
  };
  owner?: number;
  sub_knowledge_sources?: KnowledgeSourceItem[];
}

export interface SubUrlItem {
  url: string;
  title?: string;
  key?: string;
  children?: SubUrlItem[];
}

export interface UrlNode {
  url: string;
  key?: string;
  title?: string;
  selected?: boolean;
  children?: UrlNode[];
  level?: number;
  path?: string;
}

export interface ProcessedSource extends KnowledgeSource {
  format: string;
  pages?: string;
  domain_links?: UrlNode | UrlNode[];
}

export interface FlattenedUrlNode {
  url: string;
  title: string;
  level: number;
  path: string;
  parentUrl?: string;
}

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
