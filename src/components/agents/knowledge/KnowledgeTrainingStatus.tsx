
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Import, Zap, LoaderCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiKnowledgeBase, KnowledgeSource } from './types';
import { ImportSourcesDialog } from './ImportSourcesDialog';
import { AlertBanner } from '@/components/ui/alert-banner';
import { 
  BASE_URL, getAuthHeaders, getAccessToken, getKnowledgeBaseEndpoint, 
  getAgentEndpoint, getSourceMetadataInfo
} from '@/utils/api-config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import KnowledgeSourceList from './KnowledgeSourceList';

interface KnowledgeTrainingStatusProps {
  agentId: string;
  initialSelectedSources?: number[];
  onSourcesChange?: (selectedSourceIds: number[]) => void;
  preloadedKnowledgeSources?: any[];
  isLoading?: boolean;
  loadError?: string | null;
  onKnowledgeBasesChanged?: () => void;
}

const KnowledgeTrainingStatus = ({ 
  agentId, 
  initialSelectedSources = [], 
  onSourcesChange,
  preloadedKnowledgeSources = [],
  isLoading = false,
  loadError = null,
  onKnowledgeBasesChanged
}: KnowledgeTrainingStatusProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isTrainingAll, setIsTrainingAll] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [needsRetraining, setNeedsRetraining] = useState(true);
  const [showTrainingAlert, setShowTrainingAlert] = useState(false);
  
  const [knowledgeBasesLoaded, setKnowledgeBasesLoaded] = useState(false);
  const cachedKnowledgeBases = useRef<ApiKnowledgeBase[]>([]);
  const initialMountRef = useRef(true);
  const skipNextInvalidationRef = useRef(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Define refetchAgentKnowledgeBases ref to avoid the reference issue
  const refetchAgentKnowledgeBasesRef = useRef<() => void>(() => {});
  
  const fetchAvailableKnowledgeBases = async () => {
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

  const fetchAgentKnowledgeBases = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log(`Fetching agent details for ID: ${agentId}`);
      const response = await fetch(`${BASE_URL}${getAgentEndpoint(agentId)}`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch agent details: ${response.status}`);
      }

      const data = await response.json();
      return data.knowledge_bases || [];
    } catch (error) {
      console.error('Error fetching agent knowledge bases:', error);
      throw error;
    }
  };

  // Extract the triggerRefresh function to use the ref instead of the actual function
  const triggerRefresh = useCallback(() => {
    console.log("Triggering knowledge bases refresh");
    // Clear any existing timeout to prevent multiple refreshes
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Using a slight delay to avoid multiple refreshes in quick succession
    refreshTimeoutRef.current = setTimeout(() => {
      setKnowledgeBasesLoaded(false);
      cachedKnowledgeBases.current = [];
      
      // Invalidate both queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['availableKnowledgeBases', agentId] });
      queryClient.invalidateQueries({ queryKey: ['agentKnowledgeBases', agentId] });
      
      // Using the ref to avoid the reference before declaration issue
      refetchAgentKnowledgeBasesRef.current();
      refreshTimeoutRef.current = null;
    }, 500);
  }, [agentId, queryClient]);

  const formatExternalSources = (data: any[]) => {
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

      return {
        id: kb.id,
        name: kb.name,
        type: kb.type,
        size: metadataInfo.size,
        lastUpdated: uploadDate,
        trainingStatus: 'idle' as 'idle' | 'training' | 'success' | 'error',
        linkBroken: false,
        knowledge_sources: kb.knowledge_sources,
        metadata: kb.metadata || {}
      };
    });
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const refreshKnowledgeBases = () => {
    console.log("Manually refreshing knowledge bases");
    triggerRefresh();
  };

  const importSelectedSources = (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>, selectedFiles?: Record<number, Set<string>>) => {
    if (!availableKnowledgeBases && !cachedKnowledgeBases.current.length) {
      toast({
        title: "Cannot import sources",
        description: "Knowledge base data is unavailable. Please try again later.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Sources imported",
      description: "The selected knowledge sources have been imported.",
    });
    
    setIsImportDialogOpen(false);
    setNeedsRetraining(true);
    
    // The ImportSourcesDialog component now handles the refresh after import
  };

  const trainAllSources = () => {
    if (agentKnowledgeBases.length === 0) {
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
      description: `Processing ${agentKnowledgeBases.length} knowledge sources. This may take a moment.`
    });

    setTimeout(() => {
      setIsTrainingAll(false);
      setNeedsRetraining(false);
      setShowTrainingAlert(false);
      
      toast({
        title: "Training complete",
        description: "All knowledge sources have been processed."
      });
    }, 4000);
  };

  // Fix for multiple API calls - add debounce mechanism
  const handleKnowledgeBaseRemoved = useCallback((id: number) => {
    console.log("Knowledge base removed, id:", id);
    
    // Use skipNextInvalidationRef to prevent multiple refreshes
    if (skipNextInvalidationRef.current) {
      console.log("Skipping refresh due to recent removal");
      return;
    }
    
    // Set flag to skip next invalidation
    skipNextInvalidationRef.current = true;
    
    // Force a refresh after deletion
    triggerRefresh();
    
    // Reset the flag after a short delay
    setTimeout(() => {
      skipNextInvalidationRef.current = false;
    }, 1000);
    
    if (onKnowledgeBasesChanged) {
      onKnowledgeBasesChanged();
    }
  }, [onKnowledgeBasesChanged, triggerRefresh]);

  const { 
    data: availableKnowledgeBases, 
    isLoading: isLoadingAvailableKnowledgeBases, 
    error: availableKnowledgeBasesError, 
    refetch: refetchAvailableKnowledgeBases 
  } = useQuery({
    queryKey: ['availableKnowledgeBases', agentId],
    queryFn: fetchAvailableKnowledgeBases,
    staleTime: 5 * 60 * 1000,
    enabled: false,
    refetchOnWindowFocus: false
  });

  const { 
    data: agentKnowledgeBases, 
    isLoading: isLoadingAgentKnowledgeBases, 
    error: agentKnowledgeBasesError, 
    refetch: refetchAgentKnowledgeBases 
  } = useQuery({
    queryKey: ['agentKnowledgeBases', agentId],
    queryFn: fetchAgentKnowledgeBases,
    staleTime: 2 * 60 * 1000,
    enabled: !!agentId && !initialMountRef.current,
    refetchOnWindowFocus: false
  });

  // Update the ref after the function is defined
  useEffect(() => {
    refetchAgentKnowledgeBasesRef.current = refetchAgentKnowledgeBases;
  }, [refetchAgentKnowledgeBases]);

  useEffect(() => {
    if (isImportDialogOpen) {
      refetchAvailableKnowledgeBases();
    }
  }, [isImportDialogOpen, refetchAvailableKnowledgeBases]);

  useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      
      if (preloadedKnowledgeSources && preloadedKnowledgeSources.length > 0) {
        queryClient.setQueryData(['agentKnowledgeBases', agentId], preloadedKnowledgeSources);
      } else {
        refetchAgentKnowledgeBases();
      }
    }
  }, [agentId, preloadedKnowledgeSources, queryClient, refetchAgentKnowledgeBases]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'knowledgeBaseCreated') {
        console.log('Knowledge base created event detected, refreshing...');
        triggerRefresh();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also add a direct event listener
    const handleCustomEvent = () => {
      console.log('Knowledge base created custom event detected, refreshing...');
      triggerRefresh();
    };
    
    window.addEventListener('knowledgeBaseCreated', handleCustomEvent as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('knowledgeBaseCreated', handleCustomEvent as EventListener);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [triggerRefresh]);

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
            disabled={isTrainingAll || (!isLoadingAgentKnowledgeBases && (!agentKnowledgeBases || agentKnowledgeBases.length === 0))}
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
          knowledgeBases={agentKnowledgeBases || []} 
          isLoading={isLoadingAgentKnowledgeBases}
          agentId={agentId}
          onKnowledgeBaseRemoved={handleKnowledgeBaseRemoved}
        />
        
        {needsRetraining && agentKnowledgeBases && agentKnowledgeBases.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Some knowledge sources need training for your agent to use them. Click "Train All" to process them.</span>
          </div>
        )}
      </CardContent>

      <ImportSourcesDialog
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        externalSources={availableKnowledgeBases || []}
        currentSources={formatExternalSources(agentKnowledgeBases || [])}
        onImport={importSelectedSources}
        agentId={agentId}
        preventMultipleCalls={true}
        isLoading={isLoadingAvailableKnowledgeBases}
      />
    </Card>
  );
};

export default KnowledgeTrainingStatus;
