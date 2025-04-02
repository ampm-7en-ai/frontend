
import React, { useEffect, useState } from 'react';
import ImportSourcesDialog from './ImportSourcesDialog';
import { KnowledgeSource, UrlNode, ProcessedSource } from './types';

interface KnowledgeSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: KnowledgeSource[];
  initialSourceId?: number | null;
}

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

  // Process sources to ensure they have the correct format for display
  const processedSources = sources.map(source => {
    // Log entire source for debugging
    console.log(`Processing source: ${source.name}`, {
      id: source.id,
      type: source.type,
      hasDomainLinks: !!source.metadata?.domain_links,
      metadata: source.metadata
    });
    
    // Extract domain_links from metadata
    const domainLinks = source.metadata?.domain_links;
    const sourceType = source.type;
    
    // Extract nested domain_links structure for proper display
    let processedDomainLinks = domainLinks;
    
    // Handle website/url type sources without domain_links
    if ((sourceType === 'website' || sourceType === 'url')) {
      if (!domainLinks) {
        console.log(`Creating placeholder domain links for ${source.name} (source type: ${sourceType})`);
      
        // Build a hierarchical structure from insideLinks if available
        const mainDomainUrl = source.name.startsWith('http') ? source.name : `https://${source.name}`;
        
        if (source.insideLinks && source.insideLinks.length > 0) {
          // Create a tree structure from insideLinks
          const childNodes = source.insideLinks.map(link => ({
            url: link.url,
            title: link.title,
            selected: link.selected !== false,
            children: []
          }));
          
          processedDomainLinks = {
            url: mainDomainUrl,
            title: source.name,
            selected: true,
            children: childNodes
          };
        } else {
          processedDomainLinks = {
            url: mainDomainUrl,
            title: source.name,
            selected: true,
            children: []
          };
        }
      } else {
        // We have domain_links, log its structure to debug
        console.log(`Domain links structure for ${source.name}:`, domainLinks);
        
        // Ensure it has the proper structure for rendering
        if (Array.isArray(domainLinks)) {
          processedDomainLinks = domainLinks.map(node => ({
            ...node,
            children: node.children || []
          }));
        } else if (typeof domainLinks === 'object' && domainLinks !== null) {
          processedDomainLinks = {
            ...domainLinks,
            children: domainLinks.children || []
          };
        }
      }
    }
    
    // Create the transformed source with properly formatted domain_links
    const processedSource: ProcessedSource = {
      ...source,
      format: sourceType,
      pages: source.metadata?.no_of_pages?.toString(),
      domain_links: processedDomainLinks,
      // Ensure knowledge_sources exists for website/url type sources
      knowledge_sources: (sourceType === 'website' || sourceType === 'url') 
        ? source.insideLinks?.map(link => ({
            id: link.url.split('/').pop() || Math.random().toString(36).substring(2, 11),
            url: link.url,
            title: link.title,
            selected: link.selected !== false
          })) || []
        : []
    };
    
    return processedSource;
  });
  
  // Handle source selection
  const handleSourceSelect = (id: number) => {
    console.log("Source selected:", id);
    setSelectedSourceId(id);
    
    // Find the source with the selected ID
    const selectedSource = sources.find(source => source.id === id);
    if (selectedSource) {
      console.log("Selected Source Full Data:", selectedSource);
      
      // Log detailed source information for debugging
      console.log("Selected Source Type:", selectedSource.type);
      
      if (selectedSource.metadata) {
        console.log("Selected Source Metadata:", selectedSource.metadata);
        
        if (selectedSource.metadata.domain_links) {
          const domainLinks = selectedSource.metadata.domain_links;
          console.log("Domain Links Structure:", {
            type: typeof domainLinks,
            isArray: Array.isArray(domainLinks),
            hasUrl: Array.isArray(domainLinks)
              ? domainLinks.length > 0 && 'url' in domainLinks[0]
              : 'url' in domainLinks,
            hasChildren: Array.isArray(domainLinks)
              ? domainLinks.length > 0 && 'children' in domainLinks[0]
              : 'children' in domainLinks,
            structure: domainLinks
          });
        }
      }
    }
  };
  
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
