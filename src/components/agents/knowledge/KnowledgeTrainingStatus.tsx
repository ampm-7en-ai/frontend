import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, LoaderCircle, AlertCircle, Zap, Import, Trash2, Link2Off, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { KnowledgeSource, UrlNode } from './types';
import { ImportSourcesDialog } from './ImportSourcesDialog';
import { AlertBanner } from '@/components/ui/alert-banner';
import { getToastMessageForSourceChange, getTrainingStatusToast, getRetrainingRequiredToast } from './knowledgeUtils';
import { BASE_URL, API_ENDPOINTS, getAuthHeaders, getAccessToken, formatFileSizeToMB, getSourceMetadataInfo, getKnowledgeBaseEndpoint } from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';
import KnowledgeSourceCard from './KnowledgeSourceCard';

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
        metadata: kb.metadata || {}
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
    
    // First pass: create a map of all sources
    const sourcesMap = new Map();
    const rootSources: KnowledgeSource[] = [];
    
    data.forEach(source => {
      let trainingStatus: 'idle' | 'training' | 'success' | 'error' = 'idle';
      const status = source.training_status || 'idle';
      
      if (status === 'training') trainingStatus = 'training';
      else if (status === 'success') trainingStatus = 'success';
      else if (status === 'error') trainingStatus = 'error';
      
      const metadataInfo = getSourceMetadataInfo({
        type: source.type || 'document',
        metadata: source.metadata || {}
      });
      
      const insideLinks = [];
      
      // Process website sub-URLs if they exist
      if (source.type === 'website' && source.metadata && source.metadata.sub_urls) {
        const processUrls = (urlNode, parentPath = '') => {
          if (!urlNode) return;
          
          if (Array.isArray(urlNode.children)) {
            urlNode.children.forEach(child => {
              if (child.url && child.selected) {
                insideLinks.push({
                  url: child.url,
                  title: child.title || child.url,
                  status: 'success' as const,
                  selected: true,
                  chars: child.chars
                });
              }
              processUrls(child, `${parentPath}/${child.url}`);
            });
          }
        };
        
        if (source.metadata.sub_urls.children) {
          processUrls(source.metadata.sub_urls);
        }
      }
      
      const knowledgeSource: KnowledgeSource = {
        id: source.id,
        name: source.name || 'Unnamed source',
        type: source.type || 'document',
        size: metadataInfo.size,
        pages: metadataInfo.count,
        lastUpdated: formatDate(source.metadata?.upload_date || source.updated_at),
        trainingStatus: trainingStatus,
        linkBroken: source.link_broken || false,
        crawlOptions: source.crawl_options || 'single',
        insideLinks: insideLinks.length > 0 ? insideLinks : source.insideLinks || [],
        metadata: source.metadata || {},
        knowledge_sources: source.knowledge_sources || [],
        title: source.title || source.name || 'Unnamed source',
        is_selected: source.is_selected || source.selected || false,
        selected: source.selected || source.is_selected || false,
        url: source.url || null
      };
      
      sourcesMap.set(source.id, knowledgeSource);
      
      // Check if it's a root source
      if (!source.parent_knowledge_source) {
        rootSources.push(knowledgeSource);
      }
    });
    
    // Second pass: organize child sources
    data.forEach(source => {
      if (source.parent_knowledge_source) {
        const parentSource = sourcesMap.get(source.parent_knowledge_source);
        if (parentSource) {
          if (!parentSource.knowledge_sources) {
            parentSource.knowledge_sources = [];
          }
          
          const childSource = sourcesMap.get(source.id);
          if (childSource) {
            (parentSource.knowledge_sources as KnowledgeSource[]).push(childSource);
          }
        }
      }
    });
    
    return rootSources;
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

  useEffect(() => {
    if (preloadedKnowledgeSources && preloadedKnowledgeSources.length > 0) {
      console.log("Using preloaded knowledge sources:", preloadedKnowledgeSources);
      const formattedSources = transformAgentKnowledgeSources(preloadedKnowledgeSources);
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

  const refreshKnowledgeBases = () => {
    console.log("Manually refreshing knowledge bases");
    setKnowledgeBasesLoaded(false);
    cachedKnowledgeBases.current = [];
    refetch();
  };

  const removeSource = async (sourceId: number) => {
    const sourceToRemove = knowledgeSources.find(source => source.id === sourceId);
    
    if (!sourceToRemove) return;
    
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

  const renderKnowledgeSourcesList = () => {
    if (knowledgeSources.length === 0) {
      return (
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
      );
    }

    return (
      <div className="space-y-4">
        {knowledgeSources.map(source => {
          const hasNestedSources = source.knowledge_sources && source.knowledge_sources.length > 0;
          
          return (
            <KnowledgeSourceCard
              key={source.id}
              source={source}
              onTrain={trainSource}
              onRemove={removeSource}
              hasNestedSources={hasNestedSources}
              nestedSources={source.knowledge_sources || []}
            />
          );
        })}
        
        {needsRetraining && knowledgeSources.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Some knowledge sources need training for your agent to use them. Click "Train All" to process them.</span>
          </div>
        )}
      </div>
    );
  };

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
            
            {renderKnowledgeSourcesList()}
          </div>
        ) : (
          renderKnowledgeSourcesList()
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
    </Card>
  );
};

export default KnowledgeTrainingStatus;
