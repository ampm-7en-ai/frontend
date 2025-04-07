import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Info, RefreshCw, PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getKnowledgeBases, getAgentKnowledgeBases, formatFileSizeToMB, getSourceMetadataInfo } from '@/utils/api-config';
import { ImportSourcesDialog } from './ImportSourcesDialog';
import AgentKnowledgeContainer from './AgentKnowledgeContainer';
import { ApiKnowledgeBase } from './types';

interface KnowledgeTrainingStatusProps {
  agentId: string;
  initialSelectedSources?: number[];
  onSourcesChange?: (selectedSourceIds: number[]) => void;
  preloadedKnowledgeSources?: ApiKnowledgeBase[];
  isLoading?: boolean;
  loadError?: string | null;
}

const KnowledgeTrainingStatus: React.FC<KnowledgeTrainingStatusProps> = ({
  agentId,
  initialSelectedSources = [],
  onSourcesChange,
  preloadedKnowledgeSources = [],
  isLoading = false,
  loadError = null
}) => {
  const { toast } = useToast();
  const [knowledgeBases, setKnowledgeBases] = useState<ApiKnowledgeBase[]>([]);
  const [agentKnowledgeBases, setAgentKnowledgeBases] = useState<ApiKnowledgeBase[]>(preloadedKnowledgeSources);
  const [selectedSources, setSelectedSources] = useState<number[]>(initialSelectedSources);
  const [isLoading2, setIsLoading] = useState(isLoading);
  const [loadError2, setLoadError] = useState<string | null>(loadError);
  const [isTraining, setIsTraining] = useState(false);
  const [retentionEnabled, setRetentionEnabled] = useState(true);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (preloadedKnowledgeSources && preloadedKnowledgeSources.length > 0) {
      setAgentKnowledgeBases(preloadedKnowledgeSources);
    } else {
      fetchAgentKnowledgeBases();
    }
  }, [agentId, preloadedKnowledgeSources]);

  useEffect(() => {
    fetchKnowledgeBases();
  }, [refreshTrigger]);

  const fetchKnowledgeBases = async () => {
    try {
      const data = await getKnowledgeBases();
      if (data) {
        setKnowledgeBases(data);
      }
    } catch (error) {
      console.error("Error fetching knowledge bases:", error);
      setLoadError("Failed to load available knowledge sources");
    }
  };

  const fetchAgentKnowledgeBases = async () => {
    if (!agentId) return;
    
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const data = await getAgentKnowledgeBases(agentId);
      if (data) {
        setAgentKnowledgeBases(data);
      }
    } catch (error) {
      console.error("Error fetching agent knowledge bases:", error);
      setLoadError("Failed to load agent knowledge sources");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>, selectedFiles?: Record<number, Set<string>>, shouldRefresh: boolean = true) => {
    if (shouldRefresh) {
      // Only refresh if shouldRefresh is true (default) or not specified
      setRefreshTrigger(prev => prev + 1);
      await fetchAgentKnowledgeBases();
    }
  };

  const handleRetrainAI = () => {
    setIsTraining(true);
    
    setTimeout(() => {
      setIsTraining(false);
      toast({
        title: "AI retrained successfully",
        description: "Your agent has been updated with the selected knowledge sources.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Sources</CardTitle>
          <CardDescription>Manage the knowledge sources for this agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadError2 && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 mr-2 inline-block align-middle" />
              {loadError2}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-medium leading-none">Current Sources</h3>
              <p className="text-sm text-muted-foreground">
                Sources currently used to train the AI
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Sources
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-medium leading-none">Data Retention</h3>
              <p className="text-sm text-muted-foreground">
                Keep data from previous conversations to improve future responses
              </p>
            </div>
            <div className="space-x-2">
              <Label htmlFor="retention" className="text-sm">Enabled</Label>
              <Switch id="retention" defaultChecked onCheckedChange={(checked) => setRetentionEnabled(checked)} />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-medium leading-none">Training Status</h3>
              <p className="text-sm text-muted-foreground">
                {isTraining ? 'Training the AI model...' : 'AI model is ready'}
              </p>
            </div>
            <Button variant="secondary" size="sm" disabled={isTraining} onClick={handleRetrainAI}>
              {isTraining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Training...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retrain AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <ImportSourcesDialog
        isOpen={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        externalSources={knowledgeBases.filter(kb => !agentKnowledgeBases.some(akb => akb.id === kb.id))}
        currentSources={agentKnowledgeBases}
        onImport={handleImport}
        agentId={agentId}
      />
      
      <AgentKnowledgeContainer
        agentId={agentId}
        knowledgeBases={agentKnowledgeBases}
        isLoading={isLoading2}
      />
    </div>
  );
};

export default KnowledgeTrainingStatus;
