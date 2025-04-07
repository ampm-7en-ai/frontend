import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  LoaderCircle, 
  AlertCircle, 
  Zap, 
  Import, 
  Trash2, 
  Link2Off, 
  RefreshCw,
  ChevronRight,
  ChevronDown,
  FileText,
  Globe,
  Folder
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { KnowledgeSource, UrlNode } from './types';
import { ImportSourcesDialog } from './ImportSourcesDialog';
import { AlertBanner } from '@/components/ui/alert-banner';
import { getToastMessageForSourceChange, getTrainingStatusToast, getRetrainingRequiredToast } from './knowledgeUtils';
import { 
  BASE_URL, 
  API_ENDPOINTS, 
  getAuthHeaders, 
  getAccessToken, 
  formatFileSizeToMB, 
  getSourceMetadataInfo, 
  getKnowledgeBaseEndpoint 
} from '@/utils/api';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface KnowledgeTrainingStatusProps {
  agentId: string;
  initialSelectedSources?: number[];
  onSourcesChange?: (selectedSourceIds: number[]) => void;
  preloadedKnowledgeSources?: any[];  
  isLoading?: boolean;
  loadError?: string | null;
}

const KnowledgeTrainingStatus = ({ 
  agentId, 
  initialSelectedSources = [], 
  onSourcesChange,
  preloadedKnowledgeSources = [],
  isLoading = false,
  loadError = null
}: KnowledgeTrainingStatusProps) => {
  const { toast } = useToast();
  
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isTrainingAll, setIsTrainingAll] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [needsRetraining, setNeedsRetraining] = useState(true);
  const [showTrainingAlert, setShowTrainingAlert] = useState(false);
  
  const [prevSourcesLength, setPrevSourcesLength] = useState(knowledgeSources.length);
  const [prevSourceIds, setPrevSourceIds] = useState<number[]>([]);
  const [showFallbackUI, setShowFallbackUI] = useState(false);
  const [knowledgeBasesLoaded, setKnowledgeBasesLoaded] = useState(false);
  const cachedKnowledgeBases = useRef<any[]>([]);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<number | null>(null);
  const [isDeletingSource, setIsDeletingSource] = useState(false);

  const fetchKnowledgeBases = async () => {
    if (knowledgeBasesLoaded && cachedKnowledgeBases.current.length > 0) {
      console.log("Using cached knowledge bases instead of fetching");
      return cachedKnowledgeBases.current;
    }

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log(`Fetching knowledge bases from API with agentId: ${agentId}`);
      const endpoint = getKnowledgeBaseEndpoint(agentId);
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch knowledge bases');
      }

      const data = await response.json();
      
      cachedKnowledgeBases.current = data;
      setKnowledgeBasesLoaded(true);
      
      return data;
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
      throw error;
    }
  };

  const formatExternalSources = (data) => {
    if (!data) return [];
    
    return data.map(kb => {
      const firstSource = kb.knowledge_sources && kb.knowledge_sources.length > 0 
        ? kb.knowledge_sources[0] 
        : null;

      const metadataInfo = firstSource ? getSourceMetadataInfo({
        type: kb.type,
        metadata: firstSource.metadata
      }) : { count: '', size: 'N/A' };
        
      const uploadDate = firstSource && firstSource.metadata && firstSource.metadata.upload_date 
        ? formatDate(firstSource.metadata.upload_date) 
        : formatDate(kb.last_updated);

      let urlStructure = null;
      if (kb.type === 'website' && firstSource && firstSource.metadata) {
        if (firstSource.metadata.sub_urls) {
          urlStructure = firstSource.metadata.sub_urls;
        }
      }

      return {
        id: kb.id,
        name: kb.name,
        type: kb.type,
        size: metadataInfo.size,
        lastUpdated: uploadDate,
        trainingStatus: 'idle' as const,
        linkBroken: false,
        knowledge_sources: kb.knowledge_sources,
        metadata: kb.metadata || {},
        urlStructure: urlStructure
      };
    });
  };

  const getMimeTypeForFormat = (type) => {
    switch(type) {
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'csv':
        return 'text/csv';
      case 'website':
      case 'url':
        return 'text/html';
      case 'plain_text':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const transformAgentKnowledgeSources = (data) => {
    if (!data) return [];
    
    return data.map(source => {
      let trainingStatus: 'idle' | 'training' | 'success' | 'error' = 'idle';
      const status = source.training_status || 'idle';
      
      if (status === 'training') trainingStatus = 'training';
      else if (status === 'success') trainingStatus = 'success';
      else if (status === 'error') trainingStatus = 'error';
      
      const metadataInfo = getSourceMetadataInfo({
        type: source.type || 'document',
        metadata: source.metadata || {}
      });
      
      let domainLinksStructure = null;
      
      if (source.type === 'website' && source.metadata) {
        if (source.metadata.domain_links) {
          domainLinksStructure = source.metadata.domain_links;
        } else if (source.metadata.sub_urls) {
          domainLinksStructure = source.metadata.sub_urls;
        }
      }
      
      const isExpanded = true;
      const expandedUrlSections = {};
      
      if (domainLinksStructure) {
        if (Array.isArray(domainLinksStructure)) {
          domainLinksStructure.forEach((node, idx) => {
            const key = `root-${idx}`;
            expandedUrlSections[key] = true;
            
            if (node.children) {
              node.children.forEach((child, childIdx) => {
                expandedUrlSections[`${key}-${childIdx}`] = true;
                
                if (child.children) {
                  child.children.forEach((grandchild, grandchildIdx) => {
                    expandedUrlSections[`${key}-${childIdx}-${grandchildIdx}`] = true;
                  });
                }
              });
            }
          });
        } else if (domainLinksStructure.children) {
          const key = 'root-0';
          expandedUrlSections[key] = true;
          
          domainLinksStructure.children.forEach((child, childIdx) => {
            expandedUrlSections[`${key}-${childIdx}`] = true;
            
            if (child.children) {
              child.children.forEach((grandchild, grandchildIdx) => {
                expandedUrlSections[`${key}-${childIdx}-${grandchildIdx}`] = true;
              });
            }
          });
        }
      }
      
      return {
        id: source.id,
        name: source.name || 'Unnamed source',
        type: source.type || 'document',
        size: metadataInfo.size,
        pages: metadataInfo.count,
        lastUpdated: formatDate(source.metadata?.upload_date || source.updated_at),
        trainingStatus: trainingStatus,
        linkBroken: source.link_broken || false,
        crawlOptions: source.crawl_options || 'single',
        insideLinks: source.insideLinks || [],
        metadata: source.metadata || {},
        isExpanded: isExpanded,
        expandedUrlSections: expandedUrlSections,
        knowledge_sources: source.knowledge_sources || []
      };
    });
  };

  const processSelectedSubUrls = (urlNode: UrlNode, selectedUrls: Set<string>, result: UrlNode[] = []): UrlNode[] => {
    if (selectedUrls.has(urlNode.url)) {
      const selectedNode: UrlNode = { 
        ...urlNode,
        selected: true,
        children: [] 
      };
      result.push(selectedNode);
    }
    
    if (urlNode.children && urlNode.children.length > 0) {
      for (const child of urlNode.children) {
        processSelectedSubUrls(child, selectedUrls, result);
      }
    }
    
    return result;
  };

  const importSelectedSources = (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>) => {
    if (!availableKnowledgeBases && !showFallbackUI && !cachedKnowledgeBases.current.length) {
      toast({
        title: "Cannot import sources",
        description: "Knowledge base data is unavailable. Please try again later.",
        variant: "destructive"
      });
      return;
    }
    
    const externalSourcesData = formatExternalSources(availableKnowledgeBases || cachedKnowledgeBases.current);
    
    const existingSourcesMap = new Map(knowledgeSources.map(s => [s.id, s]));
    const newSourceIds = sourceIds.filter(id => !existingSourcesMap.has(id));
    const existingSourceIds = sourceIds.filter(id => existingSourcesMap.has(id));
    
    const sourcesToAdd: KnowledgeSource[] = [];
    
    newSourceIds.forEach(id => {
      const externalSource = externalSourcesData.find(s => s.id === id);
      if (!externalSource) return;
      
      const newSource = processSourceForImport(externalSource, selectedSubUrls?.[id]);
      if (newSource) {
        sourcesToAdd.push(newSource);
      }
    });
    
    existingSourceIds.forEach(id => {
      if (!selectedSubUrls?.[id] || selectedSubUrls[id].size === 0) return;
      
      const existingSource = existingSourcesMap.get(id);
      const externalSource = externalSourcesData.find(s => s.id === id);
      
      if (existingSource && externalSource) {
        const updatedSource = {
          ...existingSource,
          insideLinks: processSelectedUrlsForSource(externalSource, selectedSubUrls[id], [], true)
        };
        
        setKnowledgeSources(prev => 
          prev.map(source => source.id === id ? updatedSource : source)
        );
        
        toast({
          title: "Knowledge source updated",
          description: `Updated selected URLs for "${existingSource.name}".`
        });
      }
    });
    
    if (sourcesToAdd.length > 0) {
      setKnowledgeSources(prev => [...prev, ...sourcesToAdd]);
      
      if (sourcesToAdd.length === 1) {
        toast({
          title: "Knowledge source imported",
          description: `"${sourcesToAdd[0].name}" has been added to your knowledge base."`
        });
      } else {
        toast({
          title: "Knowledge sources imported",
          description: `${sourcesToAdd.length} sources have been added to your knowledge base.`
        });
      }
    }
    
    if (sourcesToAdd.length === 0 && existingSourceIds.length === 0) {
      toast({
        title: "No sources imported",
        description: "No changes were made to your knowledge base."
      });
    }
    
    setIsImportDialogOpen(false);
    setNeedsRetraining(true);
    
    if (onSourcesChange) {
      const updatedSourceIds = [...knowledgeSources, ...sourcesToAdd].map(s => s.id);
      onSourcesChange(updatedSourceIds);
    }
  };
  
  const processSourceForImport = (externalSource, selectedUrls?: Set<string>): KnowledgeSource | null => {
    if (!externalSource) return null;
    
    const newSource: KnowledgeSource = {
      id: externalSource.id,
      name: externalSource.name,
      type: externalSource.type,
      size: externalSource.size,
      lastUpdated: externalSource.lastUpdated,
      trainingStatus: 'idle' as const,
      linkBroken: false,
      knowledge_sources: externalSource.knowledge_sources,
      metadata: externalSource.metadata,
      insideLinks: []
    };
    
    if (externalSource.type === 'website' && selectedUrls && selectedUrls.size > 0) {
      newSource.insideLinks = processSelectedUrlsForSource(externalSource, selectedUrls, [], true);
    }
    
    return newSource;
  };
  
  const processSelectedUrlsForSource = (
    externalSource, 
    selectedUrls: Set<string>, 
    existingLinks: Array<{url: string, title?: string, status: 'success' | 'error' | 'pending', selected?: boolean}> = [],
    replaceExisting: boolean = false
  ) => {
    if (!selectedUrls || selectedUrls.size === 0) return existingLinks;
    
    const knowledgeSource = externalSource.knowledge_sources?.[0];
    if (!knowledgeSource) return existingLinks;
    
    let rootNode: UrlNode | null = null;
    
    if (knowledgeSource.metadata?.sub_urls) {
      rootNode = knowledgeSource.metadata.sub_urls as UrlNode;
    } else if (externalSource.metadata?.domain_links) {
      rootNode = Array.isArray(externalSource.metadata.domain_links) 
        ? externalSource.metadata.domain_links[0] 
        : externalSource.metadata.domain_links;
    }
    
    if (!rootNode) return existingLinks;
    
    const selectedNodes = processSelectedSubUrls(rootNode, selectedUrls);
    
    const newInsideLinks = replaceExisting ? [] : [...existingLinks];
    
    selectedNodes.forEach(node => {
      if (node.url !== 'root' && !existingLinks.map(link => link.url).includes(node.url)) {
        newInsideLinks.push({
          url: node.url,
          title: node.title || node.url,
          status: 'pending' as const,
          selected: true
        });
      }
    });
    
    return newInsideLinks;
  };

  const refreshKnowledgeBases = () => {
    console.log("Manually refreshing knowledge bases");
    setKnowledgeBasesLoaded(false);
    cachedKnowledgeBases.current = [];
    refetch();
  };

  const confirmRemoveSource = (sourceId: number) => {
    setSourceToDelete(sourceId);
    setIsDeleteDialogOpen(true);
  };

  const removeSource = async (sourceId: number) => {
    if (!sourceId) return;
    
    const sourceToRemove = knowledgeSources.find(source => source.id === sourceId);
    if (!sourceToRemove) return;
    
    setIsDeletingSource(true);
    
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const removeEndpoint = API_ENDPOINTS.REMOVE_KNOWLEDGE_SOURCES(agentId);
      const response = await fetch(`${BASE_URL}${removeEndpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          knowledgeSources: [sourceId]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        throw new Error(errorData.message || `Failed to remove knowledge source: ${response.status}`);
      }
      
      setKnowledgeSources(prev => prev.filter(source => source.id !== sourceId));
      
      if (onSourcesChange) {
        const updatedSourceIds = knowledgeSources
          .filter(s => s.id !== sourceId)
          .map(s => s.id);
        onSourcesChange(updatedSourceIds);
      }
      
      setNeedsRetraining(true);
      
      const toastInfo = getToastMessageForSourceChange('removed', sourceToRemove.name);
      toast(toastInfo);
      
      toast({
        title: "Knowledge source removed",
        description: "Your agent needs to be retrained with the updated knowledge sources.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error removing knowledge source:', error);
      toast({
        title: "Failed to remove knowledge source",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsDeletingSource(false);
      setIsDeleteDialogOpen(false);
      setSourceToDelete(null);
    }
  };

  const updateSource = async (sourceId: number, data: Partial<KnowledgeSource>) => {
    setKnowledgeSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, ...data } 
          : source
      )
    );
    
    setNeedsRetraining(true);
  };

  const toggleSourceExpansion = (sourceId: number) => {
    setKnowledgeSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, isExpanded: !source.isExpanded } 
          : source
      )
    );
  };

  const toggleUrlSectionExpansion = (sourceId: number, sectionKey: string) => {
    setKnowledgeSources(prev => 
      prev.map(source => {
        if (source.id === sourceId) {
          const currentExpandedSections = source.expandedUrlSections || {};
          return { 
            ...source, 
            expandedUrlSections: {
              ...currentExpandedSections,
              [sectionKey]: !currentExpandedSections[sectionKey]
            }
          };
        }
        return source;
      })
    );
  };

  const trainSource = (sourceId: number) => {
    const sourceIndex = knowledgeSources.findIndex(s => s.id === sourceId);
    if (sourceIndex === -1) return;
    
    const sourceName = knowledgeSources[sourceIndex].name;
    
    setKnowledgeSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, trainingStatus: 'training' as const } 
          : source
      )
    );
    
    toast(getTrainingStatusToast('start', sourceName));
    
    setTimeout(() => {
      setKnowledgeSources(prev => 
        prev.map(source => 
          source.id === sourceId 
            ? { ...source, trainingStatus: 'success' as const } 
            : source
        )
      );
      
      setNeedsRetraining(false);
      toast(getTrainingStatusToast('success', sourceName));
    }, 3000);
  };

  const trainAllSources = () => {
    if (knowledgeSources.length === 0) {
      toast({
        title: "No sources selected",
        description: "Please import at least one knowledge source to train.",
        variant: "destructive"
      });
      return;
    }

    setIsTrainingAll(true);
    setShowTrainingAlert(true);
    
    toast({
      title: "Training all sources",
      description: `Processing ${knowledgeSources.length} knowledge sources. This may take a moment.`
    });

    setKnowledgeSources(prev => 
      prev.map(source => ({ 
        ...source, 
        trainingStatus: 'training' as const
      }))
    );

    setTimeout(() => {
      setKnowledgeSources(prev => 
        prev.map(source => ({ 
          ...source, 
          trainingStatus: 'success' as const
        }))
      );
      
      setIsTrainingAll(false);
      setNeedsRetraining(false);
      setShowTrainingAlert(false);
      
      toast({
        title: "Training complete",
        description: "All knowledge sources have been processed."
      });
    }, 4000);
  };

  const { data: availableKnowledgeBases, isLoading: isLoadingKnowledgeBases, error: knowledgeBasesError, refetch } = useQuery({
    queryKey: ['knowledgeBases', agentId],
    queryFn: fetchKnowledgeBases,
    staleTime: 5 * 60 * 1000,
    enabled: false
  });

  const loadKnowledgeBases = () => {
    if (!knowledgeBasesLoaded && cachedKnowledgeBases.current.length === 0) {
      refetch();
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'website':
      case 'webpage':
      case 'url':
        return <Globe className="h-4 w-4 mr-2 text-blue-500" />;
      case 'pdf':
      case 'docx':
      case 'xlsx':
      case 'csv':
      case 'document':
        return <FileText className="h-4 w-4 mr-2 text-orange-500" />;
      default:
        return <Folder className="h-4 w-4 mr-2 text-gray-500" />;
    }
  };

  const renderUrlChildren = (source: KnowledgeSource, urlNode: UrlNode, level: number = 0, parentKey: string = '') => {
    if (!urlNode || !urlNode.children || urlNode.children.length === 0) return null;
    
    const sectionKey = parentKey ? `${parentKey}-${urlNode.url}` : urlNode.url;
    const isExpanded = source.expandedUrlSections?.[sectionKey] !== false; // Default to expanded
    
    return (
      <div className="ml-4 mt-2">
        <Collapsible defaultOpen={isExpanded}>
          <CollapsibleTrigger className="flex items-center cursor-pointer text-sm font-medium py-1">
            {isExpanded ? 
              <ChevronDown className="h-3.5 w-3.5 mr-1 text-gray-500" /> : 
              <ChevronRight className="h-3.5 w-3.5 mr-1 text-gray-500" />
            }
            <span>{urlNode.title || urlNode.url}</span>
            <Badge variant="outline" className="ml-2 text-xs">{urlNode.children.length} urls</Badge>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-1 ml-2 mt-1">
            {urlNode.children.map((child, idx) => (
              <div key={`child-url-${idx}`} className="border border-dashed border-gray-200 rounded-md p-2">
                <div className="flex items-center">
                  <Globe className="h-3.5 w-3.5 mr-2 text-blue-400" />
                  <span className="text-xs truncate max-w-[250px]" title={child.url}>
                    {child.title || child.url}
                  </span>
                  {child.selected !== undefined && (
                    <Badge 
                      variant="outline" 
                      className={`ml-2 text-xs ${child.selected ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}
                    >
                      {child.selected ? 'Selected' : 'Not Selected'}
                    </Badge>
                  )}
                  {child.chars && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {child.chars} chars
                    </span>
                  )}
                </div>
                {child.children && child.children.length > 0 && renderUrlChildren(source, child, level + 1, `${sectionKey}-${idx}`)}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  const renderNestedSources = (source: KnowledgeSource) => {
    const hasNestedSources = source.knowledge_sources && source.knowledge_sources.length > 0;
    const hasInsideLinks = source.insideLinks && source.insideLinks.length > 0;
    const hasSubUrls = source.metadata?.sub_urls?.children && source.metadata.sub_urls.children.length > 0;
    const hasDomainLinks = source.metadata?.domain_links;
    
    if (!hasNestedSources && !hasInsideLinks && !hasSubUrls && !hasDomainLinks) return null;

    return (
      <div className={`pl-4 mt-2 space-y-2 ${source.isExpanded ? 'block' : 'hidden'}`}>
        {hasNestedSources && source.knowledge_sources!.map((nestedSource) => (
          <div key={`nested-${nestedSource.id}`} className="border border-dashed border-gray-200 rounded-md p-2">
            <div className="flex items-center">
              {getSourceIcon(nestedSource.type || 'document')}
              <span className="text-sm font-medium">{nestedSource.name || nestedSource.title}</span>
              <Badge variant="outline" className="ml-2 text-xs">
                {nestedSource.type || 'file'}
              </Badge>
              {nestedSource.metadata?.file_size && (
                <span className="ml-2 text-xs text-muted-foreground">
                  {typeof nestedSource.metadata.file_size === 'number' 
                    ? `${(nestedSource.metadata.file_size / 1024).toFixed(2)} KB` 
                    : nestedSource.metadata.file_size}
                </span>
              )}
            </div>
            
            {nestedSource.metadata?.sub_urls?.children && (
              <div className="mt-2 ml-4">
                <div className="text-xs font-medium text-muted-foreground mb-1">Indexed URLs:</div>
                {nestedSource.metadata.sub_urls.children.map((urlChild, urlIdx) => (
                  <div key={`url-${urlIdx}`} className="text-xs ml-2 flex items-center">
                    <Globe className="h-3 w-3 mr-1 text-blue-400" />
                    <span className="truncate max-w-[200px]" title={urlChild.url}>
                      {urlChild.title || urlChild.url}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {hasInsideLinks && (
          <>
            <div className="text-sm font-medium mt-2 mb-1">URLs:</div>
            <div className="space-y-1">
              {source.insideLinks!.map((link, idx) => (
                <div key={`link-${idx}`} className="border border-dashed border-gray-200 rounded-md p-2">
                  <div className="flex items-center">
                    <Globe className="h-3.5 w-3.5 mr-2 text-blue-400" />
                    <span className="text-xs truncate max-w-[250px]" title={link.url}>
                      {link.title || link.url}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`ml-2 text-xs ${
                        link.status === 'success' ? 'bg-green-50 text-green-700' : 
                        link.status === 'error' ? 'bg-red-50 text-red-700' : 
                        'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      {link.status}
                    </Badge>
                    {link.chars && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {link.chars} chars
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {hasSubUrls && (
          <>
            <div className="text-sm font-medium mt-2 mb-1">Website Structure:</div>
            <div className="space-y-1 border border-dashed border-gray-200 rounded-md p-2">
              {source.metadata?.sub_urls?.children?.map((urlNode, idx) => 
                renderUrlChildren(source, urlNode, 0, `root-${idx}`)
              )}
            </div>
          </>
        )}
        
        {hasDomainLinks && (
          <>
            <div className="text-sm font-medium mt-2 mb-1">Website Structure:</div>
            <div className="space-y-1 border border-dashed border-gray-200 rounded-md p-2">
              {Array.isArray(source.metadata.domain_links) ? (
                source.metadata.domain_links.map((urlNode, idx) => 
                  renderUrlChildren(source, urlNode, 0, `root-${idx}`)
                )
              ) : source.metadata.domain_links.children ? (
                source.metadata.domain_links.children.map((urlNode, idx) => 
                  renderUrlChildren(source, urlNode, 0, `root-${idx}`)
                )
              ) : (
                renderUrlChildren(source, source.metadata.domain_links, 0, 'root-0')
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderSourceCard = (source: KnowledgeSource) => {
    const hasNestedItems = (source.knowledge_sources && source.knowledge_sources.length > 0) || 
                          (source.insideLinks && source.insideLinks.length > 0) ||
                          (source.metadata?.sub_urls?.children) ||
                          (source.metadata?.domain_links);
    
    return (
      <div key={source.id} className="border rounded-lg overflow-hidden">
        <div className="p-3 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              {hasNestedItems && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 mr-1" 
                  onClick={() => toggleSourceExpansion(source.id)}
                >
                  {source.isExpanded ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
              )}
              <div className="flex items-center">
                {getSourceIcon(source.type)}
                <div>
                  <div className="font-medium">{source.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{source.type}</span>
                    <span>•</span>
                    <span>{source.size}</span>
                    <span>•</span>
                    <span>Updated: {source.lastUpdated}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {source.trainingStatus === 'idle' ? (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => trainSource(source.id)}
                  className="flex items-center gap-1"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Train
                </Button>
              ) : source.trainingStatus === 'training' ? (
                <Button size="sm" variant="outline" disabled className="flex items-center gap-1">
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  Training...
                </Button>
              ) : source.trainingStatus === 'success' ? (
                <div className="text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Trained</span>
                </div>
              ) : (
                <div className="text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Failed</span>
                </div>
              )}
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => confirmRemoveSource(source.id)} 
                className="text-destructive hover:text-destructive"
                disabled={isDeletingSource}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {hasNestedItems && renderNestedSources(source)}
      </div>
    );
  };

  useEffect(() => {
    if (preloadedKnowledgeSources && preloadedKnowledgeSources.length > 0) {
      console.log("Using preloaded knowledge sources:", preloadedKnowledgeSources);
      
      const formattedSources = transformAgentKnowledgeSources(preloadedKnowledgeSources);
      
      console.log("Formatted knowledge sources:", formattedSources);
      
      setKnowledgeSources(formattedSources);
      setPrevSourceIds(formattedSources.map(s => s.id));
      setPrevSourcesLength(formattedSources.length);
      setShowFallbackUI(false);
    }
  }, [preloadedKnowledgeSources]);

  useEffect(() => {
    if (!isLoading && loadError) {
      console.log("Setting fallback UI due to load error:", loadError);
      setShowFallbackUI(true);
    }
  }, [isLoading, loadError]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Knowledge Sources</CardTitle>
          <CardDescription>Connect knowledge sources to your agent to improve its responses</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              loadKnowledgeBases();
              setIsImportDialogOpen(true);
            }}
            className="flex items-center gap-1"
          >
            <Import className="h-4 w-4" />
            Import Sources
          </Button>
          <Button 
            onClick={trainAllSources} 
            disabled={isTrainingAll || knowledgeSources.length === 0}
            size="sm"
            className="flex items-center gap-1"
          >
            {isTrainingAll ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {isTrainingAll ? 'Training...' : 'Train All'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showTrainingAlert && (
          <div className="mb-4">
            <AlertBanner 
              message="Training started! It will just take a minute or so, depending on the number of pages."
              variant="info"
            />
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading knowledge sources...</span>
          </div>
        ) : showFallbackUI || loadError ? (
          <div className="py-6">
            <div className="flex flex-col items-center justify-center text-center mb-6">
              <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
              <h3 className="text-lg font-semibold mb-1">Failed to load knowledge sources</h3>
              <p className="text-muted-foreground mb-4">There was a problem connecting to the knowledge base. You can still import and manage sources.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  loadKnowledgeBases();
                  refreshKnowledgeBases();
                }}
                className="flex items-center gap-1.5"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Connection
              </Button>
            </div>
            
            {knowledgeSources.length > 0 ? (
              <div className="space-y-4">
                {knowledgeSources.map(renderSourceCard)}
                
                {needsRetraining && knowledgeSources.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Some knowledge sources need training for your agent to use them. Click "Train All" to process them.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="border rounded-md p-8 text-center">
                <p className="mb-4 text-muted-foreground">No knowledge sources selected</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    loadKnowledgeBases();
                    setIsImportDialogOpen(true);
                  }}
                  className="flex items-center gap-1"
                >
                  <Import className="h-4 w-4" />
                  Import Sources
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {knowledgeSources.length > 0 ? (
              <>
                {knowledgeSources.map(renderSourceCard)}
                
                {needsRetraining && knowledgeSources.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Some knowledge sources need training for your agent to use them. Click "Train All" to process them.</span>
                  </div>
                )}
              </>
            ) : (
              <div className="border rounded-md p-8 text-center">
                <p className="mb-4 text-muted-foreground">No knowledge sources selected</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    loadKnowledgeBases();
                    setIsImportDialogOpen(true);
                  }}
                  className="flex items-center gap-1"
                >
                  <Import className="h-4 w-4" />
                  Import Sources
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <ImportSourcesDialog
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        externalSources={formatExternalSources(availableKnowledgeBases || cachedKnowledgeBases.current)}
        currentSources={knowledgeSources}
        onImport={importSelectedSources}
        agentId={agentId}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the knowledge source from your agent. This action cannot be undone.
              {needsRetraining && <p className="mt-2 font-medium text-amber-600">Your agent will need to be retrained after this change.</p>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingSource}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sourceToDelete && removeSource(sourceToDelete)}
              disabled={isDeletingSource}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingSource ? (
                <>
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default KnowledgeTrainingStatus;
