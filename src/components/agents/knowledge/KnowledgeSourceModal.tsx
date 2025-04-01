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
  // Find the source that matches the initialSourceId if provided
  const initialSource = initialSourceId ? sources.find(source => source.id === initialSourceId) : null;
  
  // Map sources to the format expected by ImportSourcesDialog
  const mappedSources = sources.map(source => {
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
    
    // For domain_links, we need to preserve the hierarchical structure
    let domainLinks = undefined;
    
    // First check if metadata has domain_links (this is the new API structure)
    if (source.metadata && source.metadata.domain_links) {
      domainLinks = source.metadata.domain_links;
    }
    // Otherwise build domain_links from insideLinks or children properties
    else if ((source.type === 'website' || source.type === 'url')) {
      if (hasChildren && source.children && source.children.length > 0) {
        // Use the hierarchical structure directly if it exists in children
        domainLinks = {
          url: source.children[0]?.url || '',
          children: source.children
        };
      } else if (hasInsideLinks) {
        // Fall back to insideLinks if no hierarchical structure in children
        domainLinks = {
          url: source.insideLinks[0]?.url || '',
          children: source.insideLinks.map(link => ({
            url: link.url,
            title: link.title,
            selected: link.selected !== false,
            children: link.children || []
          }))
        };
      }
    }
    
    // Create knowledge_sources array from URLs
    const combinedUrls = hasInsideLinks ? urlsFromInsideLinks : urlsFromChildren;
    const knowledgeSources = (source.type === 'website' || source.type === 'url') && (hasInsideLinks || hasChildren)
      ? combinedUrls.map(link => ({
          id: link.url.split('/').pop() || Math.random().toString(36).substring(2, 11),
          url: link.url,
          title: link.title,
          selected: link.selected !== false
        }))
      : [];
    
    return {
      ...source,
      format: source.type,
      pages: source.metadata?.no_of_pages?.toString(),
      children: undefined, // Clear direct children to avoid confusion
      domain_links: domainLinks,
      knowledge_sources: knowledgeSources
    };
  });

  // The ImportSourcesDialog expects isOpen, but we receive open
  return (
    <ImportSourcesDialog
      isOpen={open}
      onOpenChange={onOpenChange}
      currentSources={sources}
      onImport={() => {}} // Provide an empty handler for the onImport prop
      externalSources={mappedSources}
      initialSourceId={initialSourceId}
    />
  );
};

export default KnowledgeSourceModal;
