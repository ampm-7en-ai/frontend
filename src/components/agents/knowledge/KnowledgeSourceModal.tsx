
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
      externalSources={sources.map(source => {
        // Check if this source has insideLinks or children for building domain_links structure
        const hasInsideLinks = source.insideLinks && source.insideLinks.length > 0;
        const hasChildren = source.children && source.children.length > 0;
        
        // URLs can come from either insideLinks or children
        const urlsFromInsideLinks = hasInsideLinks ? source.insideLinks : [];
        const urlsFromChildren = hasChildren ? source.children.map(child => ({
          url: child.url || '',
          title: child.title || '',
          status: child.status || 'success',
          selected: child.selected !== false,
          children: child.children || []
        })) : [];
        
        // Combine URLs from both sources, prioritizing insideLinks if both exist
        const combinedUrls = hasInsideLinks ? urlsFromInsideLinks : urlsFromChildren;
        
        return {
          ...source,
          format: source.type,
          pages: source.metadata?.no_of_pages?.toString(),
          children: undefined, // Clear direct children to avoid confusion
          // Map domain_links for website/url type sources to create tree structure
          domain_links: (source.type === 'website' || source.type === 'url') && (hasInsideLinks || hasChildren)
            ? { 
                url: combinedUrls[0]?.url || '', 
                children: combinedUrls.map(link => ({
                  url: link.url,
                  title: link.title,
                  selected: link.selected !== false,
                  // Handle nested children if they exist
                  children: Array.isArray(link.children) ? link.children : []
                }))
              }
            : undefined,
          // Ensure knowledge_sources exists for website/url type sources
          knowledge_sources: (source.type === 'website' || source.type === 'url') && (hasInsideLinks || hasChildren)
            ? combinedUrls.map(link => ({
                id: link.url.split('/').pop() || Math.random().toString(36).substring(2, 11),
                url: link.url,
                title: link.title,
                selected: link.selected !== false
              }))
            : []
        };
      })}
    />
  );
};

export default KnowledgeSourceModal;
