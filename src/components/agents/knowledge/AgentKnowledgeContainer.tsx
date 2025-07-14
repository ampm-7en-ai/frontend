import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import KnowledgeSourceList from './KnowledgeSourceList';
import ImportSourcesDialog from './ImportSourcesDialog';
import KnowledgeSourceModal from './KnowledgeSourceModal';
import { agentApi, knowledgeApi } from '@/utils/api-config';

const AgentKnowledgeContainer = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { toast } = useToast();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [agentKnowledgeSources, setAgentKnowledgeSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAgentKnowledgeSources = async () => {
    if (!agentId) return;
    
    try {
      setIsLoading(true);
      const response = await agentApi.getById(agentId);
      
      if (!response.ok) {
        throw new Error('Failed to fetch agent knowledge sources');
      }
      
      const data = await response.json();
      setAgentKnowledgeSources(data.knowledge_sources || []);
    } catch (error) {
      console.error('Error fetching agent knowledge sources:', error);
      toast({
        title: "Error",
        description: "Failed to load knowledge sources. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAgentKnowledgeSources();
    setIsRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Knowledge sources have been updated.",
    });
  };

  const handleRemoveSource = async (sourceId: number) => {
    if (!agentId) return;
    
    try {
      const response = await agentApi.removeKnowledgeSources(agentId, [sourceId]);
      
      if (!response.ok) {
        throw new Error('Failed to remove knowledge source');
      }
      
      // Refresh the sources list
      await fetchAgentKnowledgeSources();
      
      toast({
        title: "Success",
        description: "Knowledge source removed successfully.",
      });
    } catch (error) {
      console.error('Error removing knowledge source:', error);
      toast({
        title: "Error",
        description: "Failed to remove knowledge source. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAgentKnowledgeSources();
  }, [agentId]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Knowledge Sources</CardTitle>
              <CardDescription>
                Manage the knowledge sources that power your agent's responses
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Import Sources
              </Button>
              <Button
                size="sm"
                onClick={() => setIsSourceModalOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Add Source
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <KnowledgeSourceList
            sources={agentKnowledgeSources}
            isLoading={isLoading}
            onRemoveSource={handleRemoveSource}
          />
        </CardContent>
      </Card>

      <ImportSourcesDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        agentId={agentId}
        onSourcesAdded={() => {
          fetchAgentKnowledgeSources();
          setIsImportDialogOpen(false);
        }}
      />

      <KnowledgeSourceModal
        open={isSourceModalOpen}
        onOpenChange={setIsSourceModalOpen}
        onSourceCreated={() => {
          fetchAgentKnowledgeSources();
          setIsSourceModalOpen(false);
        }}
      />
    </div>
  );
};

export default AgentKnowledgeContainer;
