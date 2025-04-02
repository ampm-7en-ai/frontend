
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

  // Process domain links to ensure they're in the correct format with proper nesting
  const processedSources = sources.map(source => {
    // Log entire source for debugging
    console.log(`Full source object for ${source.name}:`, source);
    
    // Extract domain_links from metadata with proper path navigation
    const domainLinks = source.metadata?.domain_links;
    const sourceType = source.type; // Extract type directly from source
    
    console.log(`Processing source: ${source.name}`, {
      id: source.id,
      type: sourceType,
      hasDomainLinks: !!domainLinks,
      domainLinksType: domainLinks ? typeof domainLinks : 'undefined',
      metadata: source.metadata
    });
    
    // Create processed domain links with proper nesting levels
    let processedDomainLinks = domainLinks;
    
    // Handle website/url type sources without domain_links
    if ((sourceType === 'website' || sourceType === 'url') && !domainLinks) {
      console.log(`Creating placeholder domain links for ${source.name} (source type: ${sourceType})`);
      
      // Build a hierarchical structure from insideLinks if available
      const mainDomainUrl = source.name.startsWith('http') ? source.name : `https://${source.name}`;
      
      let childNodes: UrlNode[] = [];
      if (source.insideLinks && source.insideLinks.length > 0) {
        // Group URLs by path segments to create a tree
        const urlMap: Record<string, UrlNode[]> = {};
        
        source.insideLinks.forEach(link => {
          try {
            const url = new URL(link.url);
            const pathSegments = url.pathname.split('/').filter(Boolean);
            
            // Create nodes for each path segment
            let currentPath = '';
            let parentPath = '';
            
            pathSegments.forEach((segment, index) => {
              currentPath = currentPath ? `${currentPath}/${segment}` : segment;
              const fullUrl = `${url.origin}/${currentPath}`;
              
              if (!urlMap[currentPath]) {
                urlMap[currentPath] = [];
              }
              
              // Add this segment as a node
              const node: UrlNode = {
                url: fullUrl,
                title: segment,
                selected: link.selected !== false,
                children: []
              };
              
              urlMap[currentPath].push(node);
              
              // Add this node as a child to its parent
              if (index > 0) {
                if (parentPath && urlMap[parentPath]) {
                  urlMap[parentPath].forEach(parentNode => {
                    if (!parentNode.children) {
                      parentNode.children = [];
                    }
                    parentNode.children.push(node);
                  });
                }
              }
              
              parentPath = currentPath;
            });
          } catch (e) {
            console.error("Error processing URL:", link.url, e);
          }
        });
        
        // Use top-level paths as children of main domain
        const topLevelPaths = Object.keys(urlMap)
          .filter(path => !path.includes('/'))
          .flatMap(path => urlMap[path]);
        
        childNodes = topLevelPaths;
      }
      
      processedDomainLinks = {
        url: mainDomainUrl,
        title: source.name,
        selected: true,
        children: childNodes
      };
    } else if (domainLinks) {
      // We have domain_links, log its structure to debug
      console.log(`Domain links structure for ${source.name}:`, domainLinks);
      
      // Ensure children arrays exist and recursively process the structure
      if (Array.isArray(domainLinks)) {
        processedDomainLinks = domainLinks.map(node => ({
          ...node,
          children: node.children || []
        }));
      } else if (typeof domainLinks === 'object' && domainLinks !== null) {
        // Handle single node with potentially nested children
        processedDomainLinks = {
          ...domainLinks,
          children: domainLinks.children || []
        };
      } else {
        console.error(`Invalid domain_links format for ${source.name}:`, domainLinks);
        // Fallback to create a basic structure if format is unexpected
        processedDomainLinks = {
          url: source.name.startsWith('http') ? source.name : `https://${source.name}`,
          title: source.name,
          selected: true,
          children: []
        };
      }
    }
    
    // Create the transformed source with properly formatted domain_links
    return {
      ...source,
      format: sourceType,
      pages: source.metadata?.no_of_pages?.toString(),
      children: undefined,
      // Ensure domain_links is properly passed through
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
  });
  
  // Find the selected source to access its children
  const handleSourceSelect = (id: number) => {
    console.log("Source selected:", id);
    setSelectedSourceId(id);
    
    // Find the source with the selected ID and log it
    const selectedSource = sources.find(source => source.id === id);
    if (selectedSource) {
      // Log detailed source information for debugging
      console.log("Selected Source Full Data:", selectedSource);
      console.log("Selected Source Type:", selectedSource.type);
      
      // Log domain_links and metadata structure
      if (selectedSource.metadata) {
        console.log("Selected Source Metadata:", selectedSource.metadata);
        
        // Check specifically for domain_links in metadata
        if (selectedSource.metadata.domain_links) {
          console.log("Domain Links from metadata:", selectedSource.metadata.domain_links);
          
          // Log children structure if available
          if (selectedSource.metadata.domain_links.children) {
            console.log("Domain Links children:", selectedSource.metadata.domain_links.children);
          }
        } else {
          console.log("No domain_links found for", selectedSource.name);
        }
      }
      
      // If it's a URL/website source, log additional information
      if ((selectedSource.type === 'website' || selectedSource.type === 'url')) {
        console.log("Source is website/url type");
        
        // If we have insideLinks but no domain_links, log that info
        if (selectedSource.insideLinks && (!selectedSource.metadata?.domain_links)) {
          console.log("No domain_links in metadata, but insideLinks are available:", 
            selectedSource.insideLinks.length, 
            "links available");
          console.log("Sample insideLinks:", selectedSource.insideLinks.slice(0, 3));
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
