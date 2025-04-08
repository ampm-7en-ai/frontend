
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
    size?: string | number;
    created_at?: string;
  };
  icon?: string;
  knowledge_sources?: KnowledgeSourceItem[];
  format?: string;
  pages?: string;
  selected?: boolean;
  selectedSubUrls?: Set<string>;
  agents?: AgentReference[];
  nestedItems?: Record<string, boolean>;
  updated_at?: string;
  training_status?: string;
  is_selected?: boolean;
  title?: string;
  url?: string;
  file?: string | null;
  chunks?: number;
  description?: string;
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
  name?: string;
  type?: string;
  status?: string;
  selected?: boolean;
  is_selected?: boolean;
  knowledge_base?: number;
  parent_knowledge_source?: number | null;
  metadata?: {
    format?: string;
    file_size?: string | number;
    size?: string | number;
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
  is_selected?: boolean;
  chars?: number;
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

export interface ApiKnowledgeBase {
  id: number;
  name: string;
  type: string;
  metadata: any;
  last_updated: string;
  training_status: string;
  status: string;
  knowledge_sources: ApiKnowledgeSource[];
  owner: number;
  agents: AgentReference[];
  is_selected: boolean;
  is_linked: boolean;
}

export interface ApiKnowledgeSource {
  id: number;
  url: string | null;
  file: string | null;
  title: string;
  status: string;
  knowledge_base: number;
  parent_knowledge_source: number | null;
  metadata: any;
  owner: number;
  sub_knowledge_sources: ApiKnowledgeSource[];
  is_selected: boolean;
  sub_urls?: {
    key: string;
    url: string;
    is_selected: boolean;
    chars?: number;
    children: Array<{
      key: string;
      url: string;
      is_selected: boolean;
      chars?: number;
      children: any[];
    }>;
  };
}
