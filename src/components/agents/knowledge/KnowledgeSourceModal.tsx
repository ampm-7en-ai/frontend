
import React from 'react';
import ImportSourcesDialog from './ImportSourcesDialog';
import { KnowledgeSource } from './types';

interface KnowledgeSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: KnowledgeSource[];
  initialSourceId?: number | null;
}

// This is a compatibility component that adapts the new prop names to the old ones
const KnowledgeSourceModal = ({ 
  open, 
  onOpenChange, 
  sources, 
  initialSourceId 
}: KnowledgeSourceModalProps) => {
  // The ImportSourcesDialog expects isOpen, but we receive open
  return (
    <ImportSourcesDialog
      isOpen={open}
      onOpenChange={onOpenChange}
      currentSources={sources}
      onImport={() => {}} // Provide an empty handler for the onImport prop
      externalSources={sources.map(source => ({
        ...source,
        format: source.type,
        pages: source.metadata?.no_of_pages?.toString(),
        children: undefined,
        // Map domain_links for website/url type sources to create tree structure
        // Preserve the entire nested structure of domain_links including all children
        domain_links: source.type === 'website' || source.type === 'url' 
          ? { 
              url: source.insideLinks?.[0]?.url || '', 
              children: source.insideLinks?.map(link => ({
                url: link.url,
                title: link.title,
                selected: link.selected !== false,
                // Preserve any nested children from the original structure
                children: link.children || []
              })) || []
            }
          : undefined,
        // Ensure knowledge_sources exists for website/url type sources
        knowledge_sources: source.type === 'website' || source.type === 'url' 
          ? source.insideLinks?.map(link => ({
              id: link.url.split('/').pop() || Math.random().toString(36).substring(2, 11),
              url: link.url,
              title: link.title,
              selected: link.selected !== false
            })) || []
          : []
      }))}
    />
  );
};

export default KnowledgeSourceModal;
