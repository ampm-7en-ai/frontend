import React, { useEffect, useState } from 'react';
import ImportSourcesDialog from './ImportSourcesDialog';
import { KnowledgeSource, UrlNode, ProcessedSource, SourceAnalysis } from './types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import WebsiteContentPanel from './WebsiteContentPanel';

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
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(initialSourceId || null);
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | undefined>(
    initialSourceId ? sources.find(s => s.id === initialSourceId) : undefined
  );
  const [pageCountAlert, setPageCountAlert] = useState<{show: boolean, count: number, name: string} | null>(null);
  
  useEffect(() => {
    if (initialSourceId) {
      setSelectedSourceId(initialSourceId);
      setSelectedSource(sources.find(s => s.id === initialSourceId));
    }
  }, [initialSourceId, sources]);

  const analyzeSourceStructure = (source: KnowledgeSource): SourceAnalysis => {
    const domainLinks = source.metadata?.domain_links;
    const hasDomainLinksInMetadata = !!domainLinks;
    
    let hasChildren = false;
    let childrenCount = 0;
    let domainLinksSource: 'metadata' | 'direct' | 'none' = 'none';
    
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
      domainLinksSource = 'direct';
      
      const hasSubUrls = source.knowledge_sources.some(ks => 
        ks.metadata && ks.metadata.sub_urls);
      
      if (hasSubUrls) {
        childrenCount = 0;
        source.knowledge_sources.forEach(ks => {
          if (ks.metadata?.sub_urls) {
            childrenCount += 1;
            
            const directChildren = ks.metadata.sub_urls.children || [];
            childrenCount += directChildren.length;
            
            directChildren.forEach(child => {
              if (child.children && Array.isArray(child.children)) {
                childrenCount += child.children.length;
              }
            });
          } else {
            childrenCount += 1;
          }
        });
        
        hasChildren = childrenCount > source.knowledge_sources.length;
      } else {
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

  const processedSources = sources.map(source => {
    const analysis = analyzeSourceStructure(source);
    console.log(`Processing source: ${source.name}`, analysis);
    
    const domainLinks = source.metadata?.domain_links;
    const sourceType = source.type;
    
    let processedDomainLinks = domainLinks;
    
    let totalPages = 0;
    
    if ((sourceType === 'website' || sourceType === 'url')) {
      if (!domainLinks) {
        console.log(`Creating domain links for ${source.name} (source type: ${sourceType})`);
      
        if (source.knowledge_sources && source.knowledge_sources.length > 0) {
          const hasSubUrls = source.knowledge_sources.some(ks => 
            ks.metadata && ks.metadata.sub_urls);
          
          if (hasSubUrls) {
            console.log(`Found sub_urls in knowledge_sources for ${source.name}`);
            
            const childNodes: UrlNode[] = [];
            totalPages = 0;
            
            source.knowledge_sources.forEach(ks => {
              if (ks.metadata?.sub_urls) {
                const subUrls = ks.metadata.sub_urls;
                
                totalPages += 1;
                
                const mainNode: UrlNode = {
                  url: subUrls.url || ks.url,
                  title: ks.title || subUrls.key,
                  selected: ks.selected !== false,
                  children: []
                };
                
                if (subUrls.children && subUrls.children.length > 0) {
                  totalPages += subUrls.children.length;
                  
                  mainNode.children = subUrls.children.map(child => {
                    const childNode: UrlNode = {
                      url: child.url,
                      title: child.key,
                      selected: true,
                      children: []
                    };
                    
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
          totalPages = source.insideLinks.length;
          
          const mainDomainUrl = source.name.startsWith('http') ? source.name : `https://${source.name}`;
          
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
        if (Array.isArray(domainLinks)) {
          totalPages = domainLinks.length;
          
          domainLinks.forEach(node => {
            if (node.children && Array.isArray(node.children)) {
              totalPages += node.children.length;
              
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
          totalPages = 1;
          
          if (domainLinks.children && Array.isArray(domainLinks.children)) {
            totalPages += domainLinks.children.length;
            
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
      totalPages = source.metadata?.no_of_pages ? Number(source.metadata.no_of_pages) : 1;
    }
    
    console.log(`Total pages calculated for ${source.name}: ${totalPages}`);
    
    const processedSource: ProcessedSource = {
      ...source,
      format: sourceType,
      pages: totalPages.toString(),
      domain_links: processedDomainLinks,
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

  const countNestedPages = (node: UrlNode | UrlNode[] | undefined): number => {
    if (!node) return 0;
    
    let count = 0;
    
    if (Array.isArray(node)) {
      count += node.length;
      
      node.forEach(item => {
        if (item.children && item.children.length > 0) {
          count += countNestedPages(item.children);
        }
      });
    } else {
      count += 1;
      
      if (node.children && node.children.length > 0) {
        count += countNestedPages(node.children);
      }
    }
    
    return count;
  };

  const handleSourceSelect = (id: number) => {
    console.log("Source selected:", id);
    setSelectedSourceId(id);
    
    const source = sources.find(source => source.id === id);
    setSelectedSource(source);
    
    if (source) {
      const analysis = analyzeSourceStructure(source);
      console.log("Selected Source Analysis:", analysis);
      
      let totalPages = 0;
      
      if (source.type === 'website' || source.type === 'url') {
        if (source.metadata?.domain_links) {
          totalPages = countNestedPages(source.metadata.domain_links);
        } else if (source.knowledge_sources?.length > 0) {
          const hasSubUrls = source.knowledge_sources.some(ks => 
            ks.metadata && ks.metadata.sub_urls);
          
          if (hasSubUrls) {
            totalPages = 0;
            
            source.knowledge_sources.forEach(ks => {
              if (ks.metadata?.sub_urls) {
                totalPages += 1;
                
                if (ks.metadata.sub_urls.children) {
                  totalPages += countNestedPages(ks.metadata.sub_urls.children);
                }
              } else {
                totalPages++;
              }
            });
          } else {
            totalPages = source.knowledge_sources.length;
          }
        } else if (source.insideLinks?.length > 0) {
          totalPages = source.insideLinks.length;
        } else {
          totalPages = 1;
        }
      } else {
        totalPages = source.metadata?.no_of_pages ? Number(source.metadata.no_of_pages) : 1;
      }
      
      console.log(`Total pages calculated (recursive): ${totalPages} for ${source.name}`);
      
      setPageCountAlert({
        show: true, 
        count: totalPages, 
        name: source.name
      });
      
      setTimeout(() => {
        setPageCountAlert(null);
      }, 5000);
      
      console.log("Selected Source Type:", source.type);
      
      if (source.metadata) {
        console.log("Selected Source Metadata:", {
          hasCount: !!source.metadata.count,
          hasFileSize: !!source.metadata.file_size,
          hasChars: !!source.metadata.no_of_chars,
          hasRows: !!source.metadata.no_of_rows,
          hasPages: !!source.metadata.no_of_pages,
          hasDomainLinks: !!source.metadata.domain_links,
          hasWebsite: !!source.metadata.website
        });
        
        if (source.metadata.domain_links) {
          const domainLinks = source.metadata.domain_links;
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
      
      if (source.knowledge_sources && source.knowledge_sources.length > 0) {
        const ksWithSubUrls = source.knowledge_sources.filter(ks => 
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
        selectedSourceData={selectedSource}
      />
      
      {selectedSource && selectedSource.type === 'website' && (
        <WebsiteContentPanel source={selectedSource} />
      )}
    </>
  );
};

export default KnowledgeSourceModal;
