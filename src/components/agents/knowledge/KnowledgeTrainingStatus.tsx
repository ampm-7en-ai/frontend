import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Import, Zap, LoaderCircle, AlertCircle, RefreshCw, Globe, FileText, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiKnowledgeBase } from './types';
import { ImportSourcesDialog } from './ImportSourcesDialog';
import { AlertBanner } from '@/components/ui/alert-banner';
import { getToastMessageForSourceChange, getTrainingStatusToast } from './knowledgeUtils';
import { 
  BASE_URL, 
  getAuthHeaders, 
  getAccessToken, 
  getKnowledgeBaseEndpoint, 
  getSourceMetadataInfo, 
  formatFileSizeToMB,
  getAgentEndpoint
} from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';
import KnowledgeSourceList from './KnowledgeSourceList';
import { KnowledgeSource } from '@/components/agents/modelComparison/types';

interface KnowledgeTrainingStatusProps {
  agentId: string;
  initialSelectedSources?: number[];
  onSourcesChange?: (selectedSourceIds: number[]) => void;
  preloadedKnowledgeSources?: any[];  
  isLoading?: boolean;
  loadError?: string | null;
}

interface UrlNode {
  key: string;
  url: string;
  title?: string;
  is_selected?: boolean;
  children?: UrlNode[];
}

const processSelectedSubUrls = (rootNode: UrlNode, selectedUrls: Set<string>): UrlNode[] => {
  const selectedNodes: UrlNode[] = [];
  
  const traverse = (node: UrlNode) => {
    if (selectedUrls.has(node.url)) {
      selectedNodes.push(node);
    }
    
    node.children?.forEach(childNode => {
      traverse(childNode);
    });
  };
  
  traverse(rootNode);
  return selectedNodes;
};

const transformAgentKnowledgeSources = (sources: any[]): KnowledgeSource[] => {
  if (!sources || !Array.isArray(sources)) return [];
  
  return sources.map(source => ({
    id: source.id,
    name: source.name,
    type: source.type,
    lastUpdated: source.lastUpdated || source.last_updated,
    trainingStatus: source.training_status || 'idle',
    knowledge_sources: source.knowledge_sources || [],
    metadata: source.metadata || {}
  }));
};

const formatExternalSources = (sources: ApiKnowledgeBase[]): KnowledgeSource[] => {
  if (!sources || !Array.isArray(sources)) return [];
  
  return sources.map(source => ({
    id: source.id,
    name: source.name,
    type: source.type,
    lastUpdated: source.last_updated,
    trainingStatus: source.training_status,
    knowledge_sources: source.knowledge_sources || [],
    metadata: source.metadata || {}
  }));
};

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
  
  const { data: agentData, isLoading: isLoadingAgent, error: agentError, refetch: refetchAgent } = useQuery({
    queryKey: ['agent-knowledge', agentId],
    queryFn: async () => {
      console.log(`Fetching agent data for ID: ${agentId}`);
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const endpoint = getAgentEndpoint(agentId);
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: getAuthHeaders(token),
      });
      
      if (!response.ok) {
        console.error("Failed to fetch agent data:", response.status);
        throw new Error(`Failed to fetch agent data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Agent data received:", data);
      return data;
    },
    enabled: !!agentId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const [prevSourcesLength, setPrevSourcesLength] = useState(knowledgeSources.length);
  const [prevSourceIds, setPrevSourceIds] = useState<number[]>([]);
  const [knowledgeBasesLoaded, setKnowledgeBasesLoaded] = useState(false);
  const cachedKnowledgeBases = useRef<ApiKnowledgeBase[]>([]);
  
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

  const formatIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'website':
        return <Globe className="h-4 w-4 mr-2" />;
      case 'document':
      case 'pdf':
        return <FileText className="h-4 w-4 mr-2" />;
      case 'csv':
        return <Database className="h-4 w-4 mr-2" />;
      case 'plain_text':
        return <File className="h-4 w-4 mr-2" />;
      default:
        return <File className="h-4 w-4 mr-2" />;
    }
  };

  const getFormattedSize = (source: any) => {
    if (source.metadata?.file_size) {
      if (typeof source.metadata.file_size === 'string' && source.metadata.file_size.endsWith('B')) {
        const sizeInBytes = parseInt(source.metadata.file_size.replace('B', ''), 10);
        return formatFileSizeToMB(sizeInBytes);
      }
      return formatFileSizeToMB(source.metadata.file_size);
    }
    
    if (source.metadata?.no_of_chars) {
      return `${source.metadata.no_of_chars} chars`;
    }
    
    if (source.metadata?.no_of_rows) {
      return `${source.metadata.no_of_rows} rows`;
    }
    
    return 'N/A';
  };

  const getTypeDescription = (knowledgeBase: ApiKnowledgeBase): string => {
    const { type } = knowledgeBase;
    
    const firstSource = knowledgeBase.knowledge_sources?.[0];
    if (!firstSource) return type;
    
    switch (type.toLowerCase()) {
      case 'document':
      case 'pdf':
      case 'docs':
      case 'csv':
        const fileCount = knowledgeBase.knowledge_sources.length;
        return `${fileCount} ${fileCount === 1 ? 'file' : 'files'}`;
        
      case 'website':
        const urlCount = firstSource.sub_urls?.children?.length || 0;
        return `${urlCount} ${urlCount === 1 ? 'URL' : 'URLs'}`;
        
      case 'plain_text':
        if (firstSource.metadata?.no_of_chars) {
          return `${firstSource.metadata.no_of_chars} chars`;
        }
        return type;
        
      default:
        return type;
    }
  };

  const getSourceTypeDisplay = (source: KnowledgeSource) => {
    switch (source.type?.toLowerCase()) {
      case 'document':
      case 'pdf':
      case 'docs':
      case 'csv':
        return source.pages ? `${source.pages} pages` : `${source.type}`;
      
      case 'website':
        const insideLinksCount = source.insideLinks?.length || 0;
        return `${insideLinksCount} ${insideLinksCount === 1 ? 'URL' : 'URLs'}`;
      
      case 'plain_text':
        if (source.metadata?.no_of_chars) {
          return `${source.metadata.no_of_chars} chars`;
        }
        return source.type;
      
      default:
        return source.type;
    }
  };

  const importSelectedSources = (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>) => {
    if (!availableKnowledgeBases && !cachedKnowledgeBases.current.length) {
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
    }
  }, [preloadedKnowledgeSources]);

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
    enabled: !!(agentId && !knowledgeBasesLoaded && cachedKnowledgeBases.current.length === 0)
  });

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
            onClick={() => setIsImportDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Import className="h-4 w-4" />
            Import Sources
          </Button>
          <Button 
            onClick={trainAllSources} 
            disabled={isTrainingAll || (!isLoading && (!agentData?.knowledge_bases || agentData.knowledge_bases.length === 0))}
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
        
        <KnowledgeSourceList 
          knowledgeBases={agentData?.knowledge_bases || []} 
          isLoading={isLoading || isLoadingAgent}
        />
        
        {needsRetraining && agentData?.knowledge_bases && agentData.knowledge_bases.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Some knowledge sources need training for your agent to use them. Click "Train All" to process them.</span>
          </div>
        )}
      </CardContent>

      <ImportSourcesDialog
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        externalSources={availableKnowledgeBases || cachedKnowledgeBases.current}
        currentSources={knowledgeSources}
        onImport={importSelectedSources}
        agentId={agentId}
      />
    </Card>
  );
};

export default KnowledgeTrainingStatus;
