
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, LoaderCircle, AlertCircle, Zap, Import, Trash2, Link2Off } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import KnowledgeSourceTable from './KnowledgeSourceTable';
import { KnowledgeSource } from './types';
import ImportSourcesDialog from './ImportSourcesDialog';
import { getToastMessageForSourceChange, getTrainingStatusToast, getRetrainingRequiredToast } from './knowledgeUtils';
import { BASE_URL, API_ENDPOINTS, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';

interface KnowledgeTrainingStatusProps {
  agentId: string;
  initialSelectedSources?: number[];
  onSourcesChange?: (selectedSourceIds: number[]) => void;
}

const KnowledgeTrainingStatus = ({ 
  agentId, 
  initialSelectedSources = [], 
  onSourcesChange 
}: KnowledgeTrainingStatusProps) => {
  const { toast } = useToast();
  
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isTrainingAll, setIsTrainingAll] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [needsRetraining, setNeedsRetraining] = useState(true);
  
  const [prevSourcesLength, setPrevSourcesLength] = useState(knowledgeSources.length);
  const [prevSourceIds, setPrevSourceIds] = useState<number[]>([]);
  
  // Fetch available knowledge bases
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

  // Fetch agent knowledge sources
  const fetchAgentKnowledgeSources = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId}/knowledge`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agent knowledge sources');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching agent knowledge sources:', error);
      throw error;
    }
  };

  // Query to fetch available knowledge bases
  const { data: availableKnowledgeBases, isLoading: isLoadingKnowledgeBases, error: knowledgeBasesError } = useQuery({
    queryKey: ['knowledgeBases'],
    queryFn: fetchKnowledgeBases,
  });

  // Query to fetch agent knowledge sources
  const { data: agentKnowledgeSources, isLoading: isLoadingAgentSources, error: agentSourcesError } = useQuery({
    queryKey: ['agentKnowledgeSources', agentId],
    queryFn: fetchAgentKnowledgeSources,
  });

  // Transform external knowledge bases into the format expected by ImportSourcesDialog
  const formatExternalSources = (data) => {
    if (!data) return [];
    
    return data.map(kb => {
      const firstSource = kb.knowledge_sources && kb.knowledge_sources.length > 0 
        ? kb.knowledge_sources[0] 
        : null;

      const fileType = firstSource && firstSource.metadata && firstSource.metadata.file_type 
        ? firstSource.metadata.file_type 
        : 'N/A';
        
      const uploadDate = firstSource && firstSource.metadata && firstSource.metadata.upload_date 
        ? formatDate(firstSource.metadata.upload_date) 
        : formatDate(kb.last_updated);

      let pages = '';
      if (firstSource && firstSource.metadata) {
        if (kb.type === 'csv' && firstSource.metadata.no_of_rows) {
          pages = `${firstSource.metadata.no_of_rows} rows`;
        } else if (firstSource.metadata.no_of_pages) {
          pages = `${firstSource.metadata.no_of_pages} pages`;
        }
      }

      const size = firstSource && firstSource.metadata && firstSource.metadata.file_size 
        ? firstSource.metadata.file_size 
        : 'N/A';

      return {
        id: kb.id,
        name: kb.name,
        type: kb.type,
        format: getMimeTypeForFormat(kb.type, fileType),
        size: size,
        pages: pages,
        lastUpdated: uploadDate,
        linkBroken: false
      };
    });
  };

  // Helper to get appropriate MIME type
  const getMimeTypeForFormat = (type, fileType) => {
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
      default:
        return fileType || 'application/octet-stream';
    }
  };
  
  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  // Format agent's knowledge sources
  const transformAgentKnowledgeSources = (data) => {
    if (!data) return [];
    
    return data.map(source => {
      const status = source.training_status || 'idle';
      const progress = status === 'success' ? 100 : (status === 'error' ? 100 : (status === 'training' ? 50 : 0));
      
      return {
        id: source.id,
        name: source.name || 'Unnamed source',
        type: source.type || 'document',
        size: source.metadata?.file_size || 'N/A',
        lastUpdated: formatDate(source.metadata?.upload_date || source.updated_at),
        trainingStatus: status,
        progress: progress,
        linkBroken: source.link_broken || false,
        crawlOptions: source.crawl_options || 'single'
      };
    });
  };

  // Load agent knowledge sources when data is available
  useEffect(() => {
    if (agentKnowledgeSources) {
      const formattedSources = transformAgentKnowledgeSources(agentKnowledgeSources);
      setKnowledgeSources(formattedSources);
      setPrevSourceIds(formattedSources.map(s => s.id));
      setPrevSourcesLength(formattedSources.length);
    }
  }, [agentKnowledgeSources]);

  // Effect to set retraining status when source list changes
  useEffect(() => {
    setNeedsRetraining(true);
    
    if (prevSourcesLength > 0 && knowledgeSources.length !== prevSourcesLength) {
      toast(getRetrainingRequiredToast());
    }
    
    setPrevSourcesLength(knowledgeSources.length);
    setPrevSourceIds(knowledgeSources.map(source => source.id));
  }, [knowledgeSources]);

  const removeSource = async (sourceId: number) => {
    const sourceToRemove = knowledgeSources.find(source => source.id === sourceId);
    
    if (!sourceToRemove) return;
    
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId}/knowledge/${sourceId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to remove knowledge source');
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
    } catch (error) {
      console.error('Error removing knowledge source:', error);
      toast({
        title: "Error removing source",
        description: "There was a problem removing this knowledge source.",
        variant: "destructive",
      });
    }
  };

  const updateSource = async (sourceId: number, data: Partial<KnowledgeSource>) => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId}/knowledge/${sourceId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update knowledge source');
      }
      
      setKnowledgeSources(prev => 
        prev.map(source => 
          source.id === sourceId 
            ? { ...source, ...data } 
            : source
        )
      );
      
      setNeedsRetraining(true);
    } catch (error) {
      console.error('Error updating knowledge source:', error);
      toast({
        title: "Error updating source",
        description: "There was a problem updating this knowledge source.",
        variant: "destructive",
      });
    }
  };

  const importSelectedSources = async (sourceIds: number[]) => {
    if (!availableKnowledgeBases) return;
    
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
    
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Add each selected knowledge base to the agent
      for (const sourceId of newSourceIds) {
        const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId}/knowledge`, {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify({
            knowledge_base_id: sourceId
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to import knowledge source ${sourceId}`);
        }
      }
      
      // Refetch agent knowledge sources after importing
      const newSourcesResponse = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId}/knowledge`, {
        headers: getAuthHeaders(token),
      });
      
      if (!newSourcesResponse.ok) {
        throw new Error('Failed to fetch updated agent knowledge sources');
      }
      
      const newSourcesData = await newSourcesResponse.json();
      const newSources = transformAgentKnowledgeSources(newSourcesData);
      
      setKnowledgeSources(newSources);
      setIsImportDialogOpen(false);
      setNeedsRetraining(true);

      if (onSourcesChange) {
        onSourcesChange(newSources.map(s => s.id));
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
    } catch (error) {
      console.error('Error importing knowledge sources:', error);
      toast({
        title: "Error importing sources",
        description: "There was a problem importing the selected knowledge sources.",
        variant: "destructive",
      });
    }
  };

  const trainSource = async (sourceId: number) => {
    const sourceIndex = knowledgeSources.findIndex(s => s.id === sourceId);
    if (sourceIndex === -1) return;
    
    const sourceName = knowledgeSources[sourceIndex].name;
    
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Update local state to show training in progress
      setKnowledgeSources(prev => 
        prev.map(source => 
          source.id === sourceId 
            ? { ...source, trainingStatus: 'training', progress: 0 } 
            : source
        )
      );
      
      toast(getTrainingStatusToast('start', sourceName));

      // Start the training process
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId}/knowledge/${sourceId}/train`, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to start knowledge source training');
      }
      
      // Poll for training status
      let trainingComplete = false;
      const pollInterval = setInterval(async () => {
        if (trainingComplete) {
          clearInterval(pollInterval);
          return;
        }
        
        try {
          const statusResponse = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId}/knowledge/${sourceId}`, {
            headers: getAuthHeaders(token),
          });
          
          if (!statusResponse.ok) {
            throw new Error('Failed to get training status');
          }
          
          const statusData = await statusResponse.json();
          const status = statusData.training_status || 'idle';
          const progress = status === 'success' || status === 'error' ? 100 : 
                          (status === 'training' ? Math.min((statusData.progress || 0) * 100, 90) : 0);
          
          setKnowledgeSources(prev => 
            prev.map(source => 
              source.id === sourceId 
                ? { 
                    ...source, 
                    trainingStatus: status, 
                    progress: progress,
                    linkBroken: statusData.link_broken || false,
                    insideLinks: statusData.inside_links || undefined
                  } 
                : source
            )
          );
          
          if (status === 'success' || status === 'error') {
            trainingComplete = true;
            clearInterval(pollInterval);
            toast(getTrainingStatusToast(status === 'success' ? 'success' : 'error', sourceName));
            setNeedsRetraining(false);
          }
        } catch (error) {
          console.error('Error polling training status:', error);
          clearInterval(pollInterval);
          setKnowledgeSources(prev => 
            prev.map(source => 
              source.id === sourceId 
                ? { ...source, trainingStatus: 'error', progress: 100 } 
                : source
            )
          );
          toast(getTrainingStatusToast('error', sourceName));
        }
      }, 2000);
      
      // Set a timeout to stop polling after a reasonable amount of time
      setTimeout(() => {
        if (!trainingComplete) {
          clearInterval(pollInterval);
          setKnowledgeSources(prev => 
            prev.map(source => 
              source.id === sourceId && source.trainingStatus === 'training'
                ? { ...source, trainingStatus: 'error', progress: 100 } 
                : source
            )
          );
          toast({
            title: "Training timeout",
            description: `Training for ${sourceName} took too long. Please try again later.`,
            variant: "destructive",
          });
        }
      }, 60000); // 1 minute timeout
    } catch (error) {
      console.error('Error training knowledge source:', error);
      setKnowledgeSources(prev => 
        prev.map(source => 
          source.id === sourceId 
            ? { ...source, trainingStatus: 'error', progress: 100 } 
            : source
        )
      );
      toast({
        title: "Error training source",
        description: "There was a problem training this knowledge source.",
        variant: "destructive",
      });
    }
  };

  const trainAllSources = async () => {
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

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Start training all sources
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId}/knowledge/train-all`, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to start training all knowledge sources');
      }

      // Update all sources to training status
      setKnowledgeSources(prev => 
        prev.map(source => ({ 
          ...source, 
          trainingStatus: 'training', 
          progress: 0 
        }))
      );

      // Poll for training status of all sources
      let allComplete = false;
      const pollInterval = setInterval(async () => {
        if (allComplete) {
          clearInterval(pollInterval);
          return;
        }
        
        try {
          const statusResponse = await fetch(`${BASE_URL}${API_ENDPOINTS.AGENTS}${agentId}/knowledge`, {
            headers: getAuthHeaders(token),
          });
          
          if (!statusResponse.ok) {
            throw new Error('Failed to get training status');
          }
          
          const sourcesData = await statusResponse.json();
          const formattedSources = transformAgentKnowledgeSources(sourcesData);
          
          setKnowledgeSources(formattedSources);
          
          // Check if all sources are trained
          const stillTraining = formattedSources.some(source => source.trainingStatus === 'training');
          if (!stillTraining) {
            allComplete = true;
            clearInterval(pollInterval);
            setIsTrainingAll(false);
            setNeedsRetraining(false);
            
            toast({
              title: "Training complete",
              description: "All knowledge sources have been processed.",
            });
          }
        } catch (error) {
          console.error('Error polling all training status:', error);
          clearInterval(pollInterval);
          setIsTrainingAll(false);
          toast({
            title: "Error monitoring training",
            description: "There was a problem monitoring the training status.",
            variant: "destructive",
          });
        }
      }, 3000);
      
      // Set a timeout to stop polling after a reasonable amount of time
      setTimeout(() => {
        if (!allComplete) {
          clearInterval(pollInterval);
          setIsTrainingAll(false);
          toast({
            title: "Training timeout",
            description: "Training took too long. Some sources may still be processing.",
            variant: "destructive",
          });
        }
      }, 120000); // 2 minutes timeout
    } catch (error) {
      console.error('Error training all knowledge sources:', error);
      setIsTrainingAll(false);
      toast({
        title: "Error training sources",
        description: "There was a problem training the knowledge sources.",
        variant: "destructive",
      });
    }
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
        {isLoadingAgentSources ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading knowledge sources...</span>
          </div>
        ) : agentSourcesError ? (
          <div className="p-4 text-center text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load knowledge sources. Please try again later.</p>
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

      <ImportSourcesDialog
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
