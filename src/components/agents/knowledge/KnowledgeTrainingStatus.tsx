
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Separator } from '@/components/ui/separator';
import KnowledgeSourceTable from './KnowledgeSourceTable';
import ImportSourcesDialog from './ImportSourcesDialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { knowledgeSources as mockKnowledgeSources } from '@/data/mockKnowledgeSources';
import { getAccessToken, getAuthHeaders, BASE_URL, API_ENDPOINTS } from '@/utils/api-config';

interface KnowledgeTrainingStatusProps {
  agentId: string;
  initialSelectedSources?: number[];
  onSourcesChange?: (selectedSourceIds: number[]) => void;
  preloadedKnowledgeSources?: any[];  // Preloaded knowledge sources from agent query
  isLoading?: boolean;                // Loading state from agent query
  loadError?: string | null;          // Error state from agent query
}

const KnowledgeTrainingStatus = ({ 
  agentId, 
  initialSelectedSources = [], 
  onSourcesChange,
  preloadedKnowledgeSources = [],
  isLoading = false,
  loadError = null
}: KnowledgeTrainingStatusProps) => {
  const [isRetraining, setIsRetraining] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState<any[]>([]);
  const [selectedSourceIds, setSelectedSourceIds] = useState<number[]>(initialSelectedSources);
  const [prevSourceIds, setPrevSourceIds] = useState<number[]>([]);
  const [showFallbackUI, setShowFallbackUI] = useState(false);
  
  const { data: availableKnowledgeBases, isLoading: isLoadingKnowledgeBases } = useQuery({
    queryKey: ['knowledgeBases'],
    queryFn: fetchKnowledgeBases,
    enabled: isImportDialogOpen // Only fetch when dialog is open
  });

  async function fetchKnowledgeBases() {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}`, {
        headers: getAuthHeaders(token),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch knowledge bases: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
      throw error;
    }
  }

  const formatExternalSources = (data) => {
    if (!data) return [];
    return data.map(source => ({
      id: source.id,
      name: source.name || 'Unnamed Source',
      type: source.type || 'unknown',
      size: source.size || 'N/A',
      date: source.created_at || 'N/A',
      status: source.status || 'processed',
      metadata: source.metadata || {}
    }));
  };

  useEffect(() => {
    // Use preloaded knowledge sources if available
    if (preloadedKnowledgeSources && preloadedKnowledgeSources.length > 0) {
      setKnowledgeSources(formatExternalSources(preloadedKnowledgeSources));
      setShowFallbackUI(false);
    } else if (isLoading || loadError) {
      // We'll wait for the loading state to resolve
    } else {
      // Fallback to mock data if needed (for development/testing)
      setKnowledgeSources(mockKnowledgeSources);
      setShowFallbackUI(true);
    }
  }, [preloadedKnowledgeSources, isLoading, loadError]);

  useEffect(() => {
    // Update selected sources when initialSelectedSources changes
    if (initialSelectedSources && JSON.stringify(initialSelectedSources) !== JSON.stringify(prevSourceIds)) {
      setSelectedSourceIds(initialSelectedSources);
      setPrevSourceIds(initialSelectedSources);
    }
  }, [initialSelectedSources, prevSourceIds]);

  const handleRetrain = () => {
    setIsRetraining(true);
    
    // Simulated retraining process
    setTimeout(() => {
      setIsRetraining(false);
    }, 2000);
  };

  const toggleSourceSelection = (id: number) => {
    setSelectedSourceIds(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(sourceId => sourceId !== id)
        : [...prev, id];
        
      // Notify parent component if callback provided
      if (onSourcesChange) {
        onSourcesChange(newSelection);
      }
      
      return newSelection;
    });
  };

  const handleImportSources = (newSources: any[]) => {
    setKnowledgeSources(prev => [...prev, ...formatExternalSources(newSources)]);
    setIsImportDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <LoadingSpinner text="Loading knowledge sources..." />
        </CardContent>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="w-full border-destructive">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center gap-2">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <h3 className="text-lg font-semibold">Failed to load knowledge sources</h3>
            <p className="text-sm text-muted-foreground">
              {loadError}
            </p>
            <Button variant="outline" className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showFallbackUI && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">Development Mode</h3>
                <p className="text-sm text-amber-700">
                  Displaying mock knowledge sources for development. In production, this will display real data from your knowledge base.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Sources</CardTitle>
          <CardDescription>
            Manage the knowledge sources used by this agent to answer questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KnowledgeSourceTable 
            sources={knowledgeSources}
            selectedSourceIds={selectedSourceIds}
            onToggleSource={toggleSourceSelection}
          />
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsImportDialogOpen(true)}
              className="gap-2"
            >
              Import Sources
            </Button>
            
            <Button 
              variant="default" 
              onClick={handleRetrain}
              disabled={isRetraining}
              className="gap-2"
            >
              {isRetraining ? (
                <>
                  <LoadingSpinner size="sm" />
                  Retraining...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Retrain AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            Retraining the AI with new knowledge sources may take several minutes to complete. You'll be notified when the process is finished.
          </p>
        </CardFooter>
      </Card>

      <ImportSourcesDialog 
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportSources}
        availableSources={availableKnowledgeBases || []}
        isLoading={isLoadingKnowledgeBases}
      />
    </div>
  );
};

export default KnowledgeTrainingStatus;
