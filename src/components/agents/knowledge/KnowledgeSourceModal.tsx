
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
        console.log('Source in KnowledgeSourceModal:', source);

        // Get domain_links directly from source.metadata
        const domainLinks = source.metadata?.domain_links;
        console.log('Domain links from metadata:', domainLinks);
        
        // Log whether domain_links is array or object
        if (Array.isArray(domainLinks)) {
          console.log('Domain links is an array with', domainLinks.length, 'items');
          domainLinks.forEach((item, index) => {
            console.log(`Domain link ${index}:`, item);
            if (item.children) {
              console.log(`Domain link ${index} has ${item.children.length} children`);
            }
          });
        } else if (domainLinks && typeof domainLinks === 'object') {
          console.log('Domain links is an object with url:', domainLinks.url);
          if (domainLinks.children) {
            console.log('Domain links has', domainLinks.children.length, 'children');
          }
        }

        // Create the transformed source with properly formatted domain_links
        return {
          ...source,
          format: source.type,
          pages: source.metadata?.no_of_pages?.toString(),
          children: undefined,
          // Preserve the original domain_links structure for website/url type sources
          domain_links: (source.type === 'website' || source.type === 'url') 
            ? domainLinks
            : undefined,
          // Ensure knowledge_sources exists for website/url type sources
          knowledge_sources: (source.type === 'website' || source.type === 'url') 
            ? source.insideLinks?.map(link => ({
                id: link.url.split('/').pop() || Math.random().toString(36).substring(2, 11),
                url: link.url,
                title: link.title,
                selected: link.selected !== false
              })) || []
            : []
        };
      })}
      initialSourceId={initialSourceId}
    />
  );
};

export default KnowledgeSourceModal;
