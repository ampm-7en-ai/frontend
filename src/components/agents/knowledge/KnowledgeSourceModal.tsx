
import React, { useEffect, useState } from 'react';
import { KnowledgeSource, ProcessedSource, SourceAnalysis } from './types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { fetchKnowledgeSourceDetails } from '@/utils/api-config';
import { useToast } from '@/hooks/use-toast';

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (initialSourceId) {
      setSelectedSourceId(initialSourceId);
      fetchSourceById(initialSourceId);
    }
  }, [initialSourceId, sources]);

  const fetchSourceById = async (id: number) => {
    setIsLoading(true);
    try {
      console.log(`Fetching source details for ID: ${id}`);
      const sourceData = await fetchKnowledgeSourceDetails(id);
      console.log('Fetched source details:', sourceData);
      
      if (sourceData) {
        setSelectedSource(sourceData);
        const analysis = analyzeSourceStructure(sourceData);
        console.log("Source structure analysis:", analysis);
      }
    } catch (error) {
      console.error(`Error fetching source with ID ${id}:`, error);
      toast({
        title: "Error",
        description: `Could not load source details for ID: ${id}`,
        variant: "destructive"
      });
      
      // Fallback to the local source data if API call fails
      const localSource = sources.find(s => s.id === id);
      if (localSource) {
        setSelectedSource(localSource);
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  const countNestedPages = (node: any | any[] | undefined): number => {
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
    </>
  );
};

export default KnowledgeSourceModal;
