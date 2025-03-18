
import React from 'react';

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
  url?: string;
}

export type SourceType = 'document' | 'url' | 'database' | 'csv' | 'plainText' | 'thirdParty';

export interface SourceConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  acceptedTypes?: string;
  placeholder?: string;
}

export interface SourceOption {
  id: number;
  name: string;
  type: string;
  size: string;
  lastUpdated: string;
  description?: string;
  url?: string;
}
