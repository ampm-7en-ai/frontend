
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
        // Ensure knowledge_sources exists for website/url type sources
        knowledge_sources: source.type === 'website' || source.type === 'url' 
          ? source.urls?.map(url => ({
              id: url.id || Math.random().toString(36).substring(2, 11),
              url: url.url,
              title: url.title,
              selected: url.selected !== false
            })) || []
          : []
      }))}
    />
  );
};

export default KnowledgeSourceModal;
