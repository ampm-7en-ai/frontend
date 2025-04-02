
import React, { useEffect, useState } from 'react';
import ImportSourcesDialog from './ImportSourcesDialog';
import { KnowledgeSource, UrlNode, ProcessedSource, SourceAnalysis } from './types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExternalLink, InfoIcon } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

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
  // State to display the page count alert
  const [pageCountAlert, setPageCountAlert] = useState<{show: boolean, count: number, name: string} | null>(null);
  
  // Update selectedSourceId when initialSourceId changes
  useEffect(() => {
    if (initialSourceId) {
      setSelectedSourceId(initialSourceId);
    }
  }, [initialSourceId]);

  // Analyze source structure for debugging
  const analyzeSourceStructure = (source: KnowledgeSource): SourceAnalysis => {
    const domainLinks = source.metadata?.domain_links;
    const hasDomainLinksInMetadata = !!domainLinks;
    
    let hasChildren = false;
    let childrenCount = 0;
    let domainLinksSource: 'metadata' | 'direct' | 'none' = 'none';
    
    // Check if domainLinks exists and determine its structure
    if (hasDomainLinksInMetadata) {
      domainLinksSource = 'metadata';
      
      if (Array.isArray(domainLinks)) {
        hasChildren = domainLinks.some(node => node.children && node.children.length > 0);
        childrenCount = domainLinks.reduce((count, node) => 
          count + (node.children?.length || 0), 0);
      } else if (domainLinks && typeof domainLinks === 'object') {
        hasChildren = !!(domainLinks.children && domainLinks.children.length > 0);
        childrenCount = domainLinks.children?.length || 0;
      }
    } else if (source.knowledge_sources && source.knowledge_sources.length > 0) {
      // If no domain_links in metadata, check for knowledge_sources
      domainLinksSource = 'direct';
      
      // Check for sub_urls in knowledge_sources metadata (new API structure)
      const hasSubUrls = source.knowledge_sources.some(ks => 
        ks.metadata && ks.metadata.sub_urls);
      
      if (hasSubUrls) {
        // Count both direct children and their sub-children
        childrenCount = 0;
        source.knowledge_sources.forEach(ks => {
          if (ks.metadata?.sub_urls) {
            // Count the main URL as 1
            childrenCount += 1;
            
            // Count direct children
            const directChildren = ks.metadata.sub_urls.children || [];
            childrenCount += directChildren.length;
            
            // Count nested children in each direct child
            directChildren.forEach(child => {
              if (child.children && Array.isArray(child.children)) {
                childrenCount += child.children.length;
              }
            });
          } else {
            // Count each knowledge source without sub_urls as 1 page
            childrenCount += 1;
          }
        });
        
        hasChildren = childrenCount > source.knowledge_sources.length;
      } else {
        // Fallback to using knowledge_sources directly
        hasChildren = true;
        childrenCount = source.knowledge_sources.length;
      }
    }
    
    return {
      id: source.id,
      name: source.name,
      type: source.type,
      hasDomainLinks: hasDomainLinksInMetadata,
      domainLinksSource,
      hasChildren,
      childrenCount,
      structure: JSON.stringify(
        hasDomainLinksInMetadata 
          ? domainLinks 
          : (source.knowledge_sources || null)
      ).substring(0, 100) + '...'
    };
  };

  // Process sources to ensure they have the correct format for display
  const processedSources = sources.map(source => {
    // Enhanced logging for source structure
    const analysis = analyzeSourceStructure(source);
    console.log(`Processing source: ${source.name}`, analysis);
    
    // Extract domain_links from metadata
    const domainLinks = source.metadata?.domain_links;
    const sourceType = source.type;
    
    // Extract nested domain_links structure for proper display
    let processedDomainLinks = domainLinks;
    
    // Calculate total pages based on children and sub-children
    let totalPages = 0;
    
    // Handle website/url type sources without domain_links
    if ((sourceType === 'website' || sourceType === 'url')) {
      if (!domainLinks) {
        console.log(`Creating domain links for ${source.name} (source type: ${sourceType})`);
      
        // Build a hierarchical structure from knowledge_sources
        if (source.knowledge_sources && source.knowledge_sources.length > 0) {
          // Check for the new sub_urls structure in knowledge_sources
          const hasSubUrls = source.knowledge_sources.some(ks => 
            ks.metadata && ks.metadata.sub_urls);
          
          if (hasSubUrls) {
            console.log(`Found sub_urls in knowledge_sources for ${source.name}`);
            
            // Create a tree structure from sub_urls
            const childNodes: UrlNode[] = [];
            totalPages = 0;
            
            source.knowledge_sources.forEach(ks => {
              if (ks.metadata?.sub_urls) {
                const subUrls = ks.metadata.sub_urls;
                
                // Count the main URL
                totalPages += 1;
                
                // Add the main URL
                const mainNode: UrlNode = {
                  url: subUrls.url || ks.url,
                  title: ks.title || subUrls.key,
                  selected: ks.selected !== false,
                  children: []
                };
                
                // Add children if they exist
                if (subUrls.children && subUrls.children.length > 0) {
                  // Count direct children
                  totalPages += subUrls.children.length;
                  
                  mainNode.children = subUrls.children.map(child => {
                    const childNode: UrlNode = {
                      url: child.url,
                      title: child.key,
                      selected: true,
                      children: []
                    };
                    
                    // Add and count nested children if they exist
                    if (child.children && Array.isArray(child.children)) {
                      totalPages += child.children.length;
                      childNode.children = child.children.map(subChild => ({
                        url: subChild.url,
                        title: subChild.key,
                        selected: true,
                        children: []
                      }));
                    }
                    
                    return childNode;
                  });
                }
                
                childNodes.push(mainNode);
              } else {
                // Fallback for knowledge_sources without sub_urls
                totalPages += 1;
                childNodes.push({
                  url: ks.url,
                  title: ks.title,
                  selected: ks.selected !== false,
                  children: []
                });
              }
            });
            
            processedDomainLinks = childNodes;
          } else {
            // Fallback to using knowledge_sources directly
            totalPages = source.knowledge_sources.length;
            const childNodes = source.knowledge_sources.map(ks => ({
              url: ks.url,
              title: ks.title,
              selected: ks.selected !== false,
              children: []
            }));
            
            processedDomainLinks = childNodes;
          }
        } else if (source.insideLinks && source.insideLinks.length > 0) {
          // Count insideLinks
          totalPages = source.insideLinks.length;
          
          // Create a tree structure from insideLinks
          const mainDomainUrl = source.name.startsWith('http') ? source.name : `https://${source.name}`;
          
          // Create tree from insideLinks as fallback
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
          // Default case if no sub-resources are available
          totalPages = 1;
          const mainDomainUrl = source.name.startsWith('http') ? source.name : `https://${source.name}`;
          
          processedDomainLinks = {
            url: mainDomainUrl,
            title: source.name,
            selected: true,
            children: []
          };
        }
      } else {
        // We have domain_links, calculate pages based on its structure
        if (Array.isArray(domainLinks)) {
          // Count top level items
          totalPages = domainLinks.length;
          
          // Count children
          domainLinks.forEach(node => {
            if (node.children && Array.isArray(node.children)) {
              totalPages += node.children.length;
              
              // Count nested children if they exist
              node.children.forEach(child => {
                if (child.children && Array.isArray(child.children)) {
                  totalPages += child.children.length;
                }
              });
            }
          });
          
          processedDomainLinks = domainLinks.map(node => ({
            ...node,
            children: node.children || []
          }));
        } else if (typeof domainLinks === 'object' && domainLinks !== null) {
          // Count the root node
          totalPages = 1;
          
          // Count children
          if (domainLinks.children && Array.isArray(domainLinks.children)) {
            totalPages += domainLinks.children.length;
            
            // Count nested children if they exist
            domainLinks.children.forEach(child => {
              if (child.children && Array.isArray(child.children)) {
                totalPages += child.children.length;
              }
            });
          }
          
          processedDomainLinks = {
            ...domainLinks,
            children: domainLinks.children || []
          };
        }
      }
    } else {
      // For non-website sources, use metadata page count or default to 1
      totalPages = source.metadata?.no_of_pages ? Number(source.metadata.no_of_pages) : 1;
    }
    
    console.log(`Total pages calculated for ${source.name}: ${totalPages}`);
    
    // Create the transformed source with properly formatted domain_links
    const processedSource: ProcessedSource = {
      ...source,
      format: sourceType,
      pages: totalPages.toString(),
      domain_links: processedDomainLinks,
      // Ensure knowledge_sources exists for website/url type sources
      knowledge_sources: (sourceType === 'website' || sourceType === 'url') 
        ? source.knowledge_sources || source.insideLinks?.map(link => ({
            id: link.url.split('/').pop() || Math.random().toString(36).substring(2, 11),
            url: link.url,
            title: link.title,
            selected: link.selected !== false
          })) || []
        : []
    };
    
    return processedSource;
  });
  
  // Handle source selection with enhanced logging
  const handleSourceSelect = (id: number) => {
    console.log("Source selected:", id);
    setSelectedSourceId(id);
    
    // Find the source with the selected ID
    const selectedSource = sources.find(source => source.id === id);
    if (selectedSource) {
      const analysis = analyzeSourceStructure(selectedSource);
      console.log("Selected Source Analysis:", analysis);
      
      // Calculate total pages for the alert
      let totalPages = 0;
      
      if (selectedSource.type === 'website' || selectedSource.type === 'url') {
        if (selectedSource.metadata?.domain_links) {
          const domainLinks = selectedSource.metadata.domain_links;
          
          if (Array.isArray(domainLinks)) {
            // Count top level items
            totalPages = domainLinks.length;
            
            // Count children
            domainLinks.forEach(node => {
              if (node.children && Array.isArray(node.children)) {
                totalPages += node.children.length;
                
                // Count nested children
                node.children.forEach(child => {
                  if (child.children && Array.isArray(child.children)) {
                    totalPages += child.children.length;
                  }
                });
              }
            });
          } else if (typeof domainLinks === 'object' && domainLinks !== null) {
            // Count root
            totalPages = 1;
            
            // Count children
            if (domainLinks.children && Array.isArray(domainLinks.children)) {
              totalPages += domainLinks.children.length;
              
              // Count nested children
              domainLinks.children.forEach(child => {
                if (child.children && Array.isArray(child.children)) {
                  totalPages += child.children.length;
                }
              });
            }
          }
        } else if (selectedSource.knowledge_sources?.length > 0) {
          // Check for the new sub_urls structure
          const hasSubUrls = selectedSource.knowledge_sources.some(ks => 
            ks.metadata && ks.metadata.sub_urls);
          
          if (hasSubUrls) {
            // Count pages from sub_urls
            selectedSource.knowledge_sources.forEach(ks => {
              if (ks.metadata?.sub_urls) {
                // Count the main URL
                totalPages++;
                
                // Count direct children
                const directChildren = ks.metadata.sub_urls.children || [];
                totalPages += directChildren.length;
                
                // Count nested children
                directChildren.forEach(child => {
                  if (child.children && Array.isArray(child.children)) {
                    totalPages += child.children.length;
                  }
                });
              } else {
                // Count as a single page
                totalPages++;
              }
            });
          } else {
            // Fallback to knowledge_sources count
            totalPages = selectedSource.knowledge_sources.length;
          }
        } else if (selectedSource.insideLinks?.length > 0) {
          totalPages = selectedSource.insideLinks.length;
        } else {
          totalPages = 1;
        }
      } else {
        // Non-website sources
        totalPages = selectedSource.metadata?.no_of_pages ? Number(selectedSource.metadata.no_of_pages) : 1;
      }
      
      // Show the alert with the page count
      setPageCountAlert({
        show: true, 
        count: totalPages, 
        name: selectedSource.name
      });

      // Show toast notification for better visibility
      toast({
        title: "Source Pages",
        description: (
          <div className="flex items-center gap-2">
            <span className="font-medium">{selectedSource.name}</span> has 
            <span className="font-bold text-blue-600">
              {totalPages}
            </span> 
            total {totalPages === 1 ? 'page' : 'pages'}
          </div>
        ),
        duration: 5000,
      });
      
      // Hide the alert after 5 seconds
      setTimeout(() => {
        setPageCountAlert(null);
      }, 5000);
      
      // Log detailed source information for debugging
      console.log("Selected Source Type:", selectedSource.type);
      
      if (selectedSource.metadata) {
        console.log("Selected Source Metadata:", {
          hasCount: !!selectedSource.metadata.count,
          hasFileSize: !!selectedSource.metadata.file_size,
          hasChars: !!selectedSource.metadata.no_of_chars,
          hasRows: !!selectedSource.metadata.no_of_rows,
          hasPages: !!selectedSource.metadata.no_of_pages,
          hasDomainLinks: !!selectedSource.metadata.domain_links,
          hasWebsite: !!selectedSource.metadata.website
        });
        
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
            childrenCount: Array.isArray(domainLinks)
              ? domainLinks.reduce((count, node) => count + (node.children?.length || 0), 0)
              : domainLinks.children?.length || 0,
            structure: domainLinks
          });
        }
      }
      
      // Check for sub_urls in knowledge_sources
      if (selectedSource.knowledge_sources && selectedSource.knowledge_sources.length > 0) {
        const ksWithSubUrls = selectedSource.knowledge_sources.filter(ks => 
          ks.metadata && ks.metadata.sub_urls);
        
        console.log("Knowledge Sources with sub_urls:", ksWithSubUrls.length);
        
        if (ksWithSubUrls.length > 0) {
          const firstWithSubUrls = ksWithSubUrls[0];
          console.log("Sample sub_urls structure:", firstWithSubUrls.metadata?.sub_urls);
          
          const childrenCount = firstWithSubUrls.metadata?.sub_urls?.children?.length || 0;
          console.log("Children count in first sub_urls:", childrenCount);
          
          if (childrenCount > 0) {
            console.log("First child in sub_urls:", firstWithSubUrls.metadata?.sub_urls?.children?.[0]);
          }
        }
      }
    }
  };
  
  return (
    <>
      {pageCountAlert && pageCountAlert.show && (
        <div className="fixed top-4 right-4 z-50 w-80">
          <Alert variant="default" className="border-2 border-blue-500 shadow-lg animate-in fade-in slide-in-from-top-5">
            <InfoIcon className="h-4 w-4 text-blue-500" />
            <AlertTitle>Source Pages</AlertTitle>
            <AlertDescription>
              <span className="font-bold">{pageCountAlert.name}</span> has 
              <span className="font-bold text-blue-600 mx-1">
                {pageCountAlert.count}
              </span> 
              total {pageCountAlert.count === 1 ? 'page' : 'pages'}.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
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
    </>
  );
};

export default KnowledgeSourceModal;
