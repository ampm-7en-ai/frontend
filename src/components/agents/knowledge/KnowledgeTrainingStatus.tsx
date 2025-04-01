import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, LoaderCircle, AlertCircle, Zap, Import, Trash2, Link2Off, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import KnowledgeSourceTable from './KnowledgeSourceTable';
import { KnowledgeSource } from './types';
import KnowledgeSourceModal from './KnowledgeSourceModal';
import { getToastMessageForSourceChange, getTrainingStatusToast, getRetrainingRequiredToast } from './knowledgeUtils';
import { BASE_URL, API_ENDPOINTS, getAuthHeaders, getAccessToken, formatFileSizeToMB, getSourceMetadataInfo } from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';

interface KnowledgeTrainingStatusProps {
  agentId: string;
  initialSelectedSources?: number[];
  onSourcesChange?: (selectedSourceIds: number[]) => void;
  preloadedKnowledgeSources?: any[];  // Add this prop to accept preloaded knowledge sources
  isLoading?: boolean;                // Add loading state prop
  loadError?: string | null;          // Add error state prop
}

const KnowledgeTrainingStatus = ({ 
  agentId, 
  initialSelectedSources = [], 
  onSourcesChange,
  preloadedKnowledgeSources = [],     // Default to empty array
  isLoading = false,                  // Default to false
  loadError = null                    // Default to null
}: KnowledgeTrainingStatusProps) => {
  const { toast } = useToast();
  
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isTrainingAll, setIsTrainingAll] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [needsRetraining, setNeedsRetraining] = useState(true);
  
  const [prevSourcesLength, setPrevSourcesLength] = useState(knowledgeSources.length);
  const [prevSourceIds, setPrevSourceIds] = useState<number[]>([]);
  const [showFallbackUI, setShowFallbackUI] = useState(false);
  
  const fetchKnowledgeBases = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}?status=active`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch knowledge bases');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
      throw error;
    }
  };

  const { data: availableKnowledgeBases, isLoading: isLoadingKnowledgeBases, error: knowledgeBasesError } = useQuery({
    queryKey: ['knowledgeBases'],
    queryFn: fetchKnowledgeBases,
  });

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

      const format = firstSource && firstSource.metadata && firstSource.metadata.format 
        ? firstSource.metadata.format 
        : getMimeTypeForFormat(kb.type);

      return {
        id: kb.id,
        name: kb.name,
        type: kb.type,
        format: format,
        size: metadataInfo.size,
        pages: metadataInfo.count,
        lastUpdated: uploadDate,
        linkBroken: false
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
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const transformAgentKnowledgeSources = (data) => {
    if (!data) return [];
    
    return data.map(source => {
      let trainingStatus: 'idle' | 'training' | 'success' | 'error' = 'idle';
      const status = source.training_status || 'idle';
      
      if (status === 'training') trainingStatus = 'training';
      else if (status === 'success') trainingStatus = 'success';
      else if (status === 'error') trainingStatus = 'error';
      
      const progress = trainingStatus === 'success' ? 100 : (trainingStatus === 'error' ? 100 : (trainingStatus === 'training' ? 50 : 0));
      
      const metadataInfo = getSourceMetadataInfo({
        type: source.type || 'document',
        metadata: source.metadata || {}
      });
      
      return {
        id: source.id,
        name: source.name || 'Unnamed source',
        type: source.type || 'document',
        size: metadataInfo.size,
        pages: metadataInfo.count,
        lastUpdated: formatDate(source.metadata?.upload_date || source.updated_at),
        trainingStatus: trainingStatus,
        progress: progress,
        linkBroken: source.link_broken || false,
        crawlOptions: source.crawl_options || 'single'
      };
    });
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

  const handleRetry = () => {
    setShowFallbackUI(false);
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

  const importSelectedSources = (sourceIds: number[]) => {
    if (!availableKnowledgeBases && !showFallbackUI) {
      toast({
        title: "Cannot import sources",
        description: "Knowledge base data is unavailable. Please try again later.",
        variant: "destructive"
      });
      return;
    }
    
    const externalSources = formatExternalSources(availableKnowledgeBases);
    const newSourceIds = sourceIds.filter(id => !knowledgeSources.some(s => s.id === id));
    
    if (newSourceIds.length === 0) {
      toast({
        title: "No new sources selected",
        description: "All selected sources are already imported.",
      });
      setIsImportDialogOpen(false);
      return;
    }
    
    const newSources: KnowledgeSource[] = newSourceIds.map(id => {
      const externalSource = externalSources.find(s => s.id === id);
      if (!externalSource) return null;
      
      return {
        id: externalSource.id,
        name: externalSource.name,
        type: externalSource.type,
        size: externalSource.size,
        lastUpdated: externalSource.lastUpdated,
        trainingStatus: 'idle' as const,
        progress: 0,
        linkBroken: false
      };
    }).filter(Boolean) as KnowledgeSource[];
    
    setKnowledgeSources(prev => [...prev, ...newSources]);
    setIsImportDialogOpen(false);
    setNeedsRetraining(true);
    
    if (onSourcesChange) {
      const updatedSourceIds = [...knowledgeSources, ...newSources].map(s => s.id);
      onSourcesChange(updatedSourceIds);
    }
    
    if (newSourceIds.length === 1) {
      const sourceId = newSourceIds[0];
      const source = externalSources.find(s => s.id === sourceId);
      if (source) {
        const toastInfo = getToastMessageForSourceChange('added', source.name);
        toast(toastInfo);
      }
    } else {
      toast({
        title: "Knowledge sources imported",
        description: `${newSourceIds.length} sources have been imported. Training is required for the agent to use this knowledge.`,
      });
    }
  };

  const trainSource = (sourceId: number) => {
    const sourceIndex = knowledgeSources.findIndex(s => s.id === sourceId);
    if (sourceIndex === -1) return;
    
    const sourceName = knowledgeSources[sourceIndex].name;
    
    setKnowledgeSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, trainingStatus: 'training' as const, progress: 10 } 
          : source
      )
    );
    
    toast(getTrainingStatusToast('start', sourceName));
    
    let progress = 10;
    const progressInterval = setInterval(() => {
      progress += 10;
      
      setKnowledgeSources(prev => 
        prev.map(source => 
          source.id === sourceId 
            ? { ...source, progress: Math.min(progress, 100) } 
            : source
        )
      );
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        
        setKnowledgeSources(prev => 
          prev.map(source => 
            source.id === sourceId 
              ? { ...source, trainingStatus: 'success' as const, progress: 100 } 
              : source
          )
        );
        
        setNeedsRetraining(false);
        toast(getTrainingStatusToast('success', sourceName));
      }
    }, 500);
  };

  const trainAllSources = () => {
    if (knowledgeSources.length === 0) {
      toast({
        title: "No sources selected",
        description: "Please import at least one knowledge source to train.",
        variant: "destructive",
      });
      return;
    }

    setIsTrainingAll(true);
    
    toast({
      title: "Training all sources",
      description: `Processing ${knowledgeSources.length} knowledge sources. This may take a moment.`,
    });

    setKnowledgeSources(prev => 
      prev.map(source => ({ 
        ...source, 
        trainingStatus: 'training' as const, 
        progress: 10 
      }))
    );

    let progress = 10;
    const progressInterval = setInterval(() => {
      progress += 10;
      
      setKnowledgeSources(prev => 
        prev.map(source => ({ 
          ...source, 
          progress: Math.min(progress, 100) 
        }))
      );
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        
        setKnowledgeSources(prev => 
          prev.map(source => ({ 
            ...source, 
            trainingStatus: 'success' as const, 
            progress: 100 
          }))
        );
        
        setIsTrainingAll(false);
        setNeedsRetraining(false);
        
        toast({
          title: "Training complete",
          description: "All knowledge sources have been processed.",
        });
      }
    }, 500);
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
            onClick={() => setIsImportDialogOpen(true)}
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
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Connection
              </Button>
            </div>
            
            {knowledgeSources.length > 0 ? (
              <>
                <KnowledgeSourceTable 
                  sources={knowledgeSources} 
                  onTrainSource={trainSource}
                  onRemoveSource={removeSource}
                  onUpdateSource={updateSource}
                />
                
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
                  onClick={() => setIsImportDialogOpen(true)}
                  className="flex items-center gap-1"
                >
                  <Import className="h-4 w-4" />
                  Import Sources
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <KnowledgeSourceTable 
              sources={knowledgeSources} 
              onTrainSource={trainSource}
              onRemoveSource={removeSource}
              onUpdateSource={updateSource}
            />
            
            {needsRetraining && knowledgeSources.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Some knowledge sources need training for your agent to use them. Click "Train All" to process them.</span>
              </div>
            )}
          </>
        )}
      </CardContent>

      <KnowledgeSourceModal
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        externalSources={formatExternalSources(availableKnowledgeBases)}
        currentSources={knowledgeSources}
        onImport={importSelectedSources}
      />
    </Card>
  );
};

export default KnowledgeTrainingStatus;
