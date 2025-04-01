
import React, { useEffect, useState } from 'react';
import ImportSourcesDialog from './ImportSourcesDialog';
import { KnowledgeSource, UrlNode } from './types';

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
  // Store the selected source ID to help find the data
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(initialSourceId || null);
  
  // Update selectedSourceId when initialSourceId changes
  useEffect(() => {
    if (initialSourceId) {
      setSelectedSourceId(initialSourceId);
    }
  }, [initialSourceId]);

  // Process domain links to ensure they're in the correct format
  const processedSources = sources.map(source => {
    // Get domain_links directly from source.metadata
    const domainLinks = source.metadata?.domain_links;
    
    // Log source structure for debugging
    console.log(`Processing source: ${source.name}`, {
      id: source.id,
      type: source.type,
      hasDomainLinks: !!domainLinks,
      domainLinksType: domainLinks ? typeof domainLinks : 'undefined',
      metadata: source.metadata
    });
    
    // Create dummy domain links for testing if needed
    let processedDomainLinks = domainLinks;
    
    // If it's a website/url type but no domain links, create a placeholder
    if ((source.type === 'website' || source.type === 'url') && !domainLinks) {
      // Create a synthetic domain link based on the source properties
      console.log(`Creating placeholder domain links for ${source.name}`);
      processedDomainLinks = {
        url: source.name,
        title: source.name,
        selected: true,
        children: source.insideLinks?.map(link => ({
          url: link.url,
          title: link.title || link.url.split('/').pop() || link.url,
          selected: link.selected !== false
        })) || []
      };
    }
    
    // Create the transformed source with properly formatted domain_links
    return {
      ...source,
      format: source.type,
      pages: source.metadata?.no_of_pages?.toString(),
      children: undefined,
      // Ensure domain_links is properly passed through
      domain_links: processedDomainLinks,
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
  });
  
  // Find the selected source to access its children
  const handleSourceSelect = (id: number) => {
    console.log("Source selected:", id);
    setSelectedSourceId(id);
    
    // Find the source with the selected ID and log it
    const selectedSource = sources.find(source => source.id === id);
    if (selectedSource) {
      console.log("Selected Source Full Data:", selectedSource);
      
      // If it's a URL/website source, log domain_links if available
      if ((selectedSource.type === 'website' || selectedSource.type === 'url')) {
        console.log("Domain Links Structure:", {
          hasDomainLinks: !!selectedSource.metadata?.domain_links,
          type: selectedSource.metadata?.domain_links ? typeof selectedSource.metadata.domain_links : 'undefined',
          isArray: selectedSource.metadata?.domain_links ? Array.isArray(selectedSource.metadata.domain_links) : false,
          value: selectedSource.metadata?.domain_links || "No domain_links found"
        });
        
        // If we have insideLinks but no domain_links, log that info
        if (selectedSource.insideLinks && (!selectedSource.metadata?.domain_links)) {
          console.log("No domain_links in metadata, but insideLinks are available:", 
            selectedSource.insideLinks.length, 
            "links available");
        }
      }
    }
  };
  
  // The ImportSourcesDialog expects isOpen, but we receive open
  return (
    <ImportSourcesDialog
      isOpen={open}
      onOpenChange={onOpenChange}
      currentSources={sources}
      onImport={() => {}} // Provide an empty handler for the onImport prop
      externalSources={processedSources}
      initialSourceId={selectedSourceId}
      onSourceSelect={handleSourceSelect}
      selectedSourceData={selectedSourceId ? 
        sources.find(source => source.id === selectedSourceId) : undefined}
    />
  );
};

export default KnowledgeSourceModal;
