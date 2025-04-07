
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
    chars?: number;
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
    sub_urls?: {
      children?: UrlNode[];
    };
  };
  icon?: string;
  knowledge_sources?: KnowledgeSourceItem[];
  format?: string; // Making format optional in KnowledgeSource
  pages?: string;  // Making pages optional in KnowledgeSource
  selected?: boolean; // Track selection state
  selectedSubUrls?: Set<string>; // Store selected sub URLs
  agents?: AgentReference[]; // Add agents array to match API structure
  nestedItems?: Record<string, boolean>; // Map of nested item IDs to their selection state
}

export interface AgentReference {
  agent_id: number;
  name: string;
}

export interface KnowledgeSourceItem {
  id: number | string;
  url: string | null;
  file?: string | null;
  title: string;
  name?: string; // Add name as an alternative to title
  type?: string; // Add type field for consistent reference
  status?: string;
  selected?: boolean;
  is_selected?: boolean; // Explicitly define is_selected to match API response
  knowledge_base?: number;
  parent_knowledge_source?: number | null;
  metadata?: {
    format?: string;
    file_size?: string | number;
    size?: string | number; // Add size as alternative to file_size
    sub_urls?: {
      children?: UrlNode[];
    };
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
  is_selected?: boolean; // Explicitly define is_selected to match API response
  chars?: number; // Property for character count
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

export interface ImportKnowledgeSourcesPayload {
  knowledgeSources: number[];
  selected_knowledge_sources: string[];
}
