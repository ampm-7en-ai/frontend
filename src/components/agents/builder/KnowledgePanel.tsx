
import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { Brain, Plus, FileText, Globe, Database, File } from 'lucide-react';
import { ImportSourcesDialog } from '@/components/agents/knowledge/ImportSourcesDialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import ModernButton from '@/components/dashboard/ModernButton';
import { useToast } from '@/hooks/use-toast';
import CompactKnowledgeSourceCard from '@/components/agents/knowledge/CompactKnowledgeSourceCard';

const getIconForType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'website':
      return Globe;
    case 'document':
    case 'pdf':
      return FileText;
    case 'csv':
      return Database;
    case 'plain_text':
      return File;
    default:
      return File;
  }
};

const getBadgeForStatus = (status: string) => {
  switch (status) {
    case 'Active':
      return <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 border-green-200">Trained</Badge>;
    case 'Training':
      return <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 border-blue-200">Training</Badge>;
    case 'Issues':
      return <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-700 border-yellow-200">Issues</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px] px-2 py-0.5">Untrained</Badge>;
  }
};

const AddKnowledgeCard = ({ onClick }: { onClick: () => void }) => {
  return (
    <div 
      className="flex items-center gap-3 p-3 bg-slate-700/30 dark:bg-slate-700/30 rounded-lg border-2 border-dashed border-slate-600/50 hover:border-blue-500/50 hover:bg-slate-600/30 dark:hover:bg-slate-600/30 transition-colors cursor-pointer group min-w-0 flex-shrink-0"
      onClick={onClick}
    >
      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-200 flex-shrink-0">
        <Plus className="h-4 w-4 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-slate-300 dark:text-slate-300 group-hover:text-white mb-1">
          Add Knowledge Source
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-500">
          Import new sources
        </p>
      </div>
    </div>
  );
};

export const KnowledgePanel = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Fetch external knowledge sources for import dialog
  const { data: externalSources = [] } = useQuery({
    queryKey: ['availableKnowledgeSources'],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${BASE_URL}knowledge-bases/`, {
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch knowledge sources');
      }

      const result = await response.json();
      return result.data || [];
    },
    enabled: isImportDialogOpen
  });

  const handleImport = async (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>, selectedFiles?: Record<number, Set<string>>) => {
    try {
      // After successful import, refresh the agent data to get updated knowledge sources
      if (agentData.id) {
        const token = getAccessToken();
        if (!token) throw new Error('No authentication token');

        const response = await fetch(`${BASE_URL}agents/${agentData.id}/`, {
          headers: getAuthHeaders(token)
        });

        if (response.ok) {
          const result = await response.json();
          const updatedKnowledgeSources = result.data.knowledge_bases || [];
          
          // Format and update the knowledge sources
          const formattedSources = updatedKnowledgeSources.map((kb: any) => ({
            id: kb.id,
            name: kb.name,
            type: kb.type,
            size: kb.size || 'N/A',
            lastUpdated: kb.last_updated ? new Date(kb.last_updated).toLocaleDateString('en-GB') : 'N/A',
            trainingStatus: kb.training_status || kb.status || 'idle',
            linkBroken: false,
            knowledge_sources: kb.knowledge_sources || [],
            metadata: kb.metadata || {}
          }));

          updateAgentData({ knowledgeSources: formattedSources });
        }
      }
      
      toast({
        title: "Knowledge sources imported",
        description: "The selected knowledge sources have been added to your agent.",
      });
    } catch (error) {
      console.error('Error during import:', error);
      toast({
        title: "Import failed",
        description: "There was an error importing the knowledge sources.",
        variant: "destructive"
      });
    }
  };

  const handleTrainKnowledge = async () => {
    if (!agentData.id) return;
    
    try {
      const token = getAccessToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${BASE_URL}agents/${agentData.id}/train/`, {
        method: 'POST',
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to start training');
      }

      toast({
        title: "Training started",
        description: "Your agent's knowledge base is being trained.",
      });

      // Update training status for knowledge sources
      const updatedSources = agentData.knowledgeSources.map(source => ({
        ...source,
        trainingStatus: 'Training' as const
      }));
      
      updateAgentData({ knowledgeSources: updatedSources });
    } catch (error) {
      console.error('Error training knowledge:', error);
      toast({
        title: "Training failed",
        description: "There was an error starting the training process.",
        variant: "destructive"
      });
    }
  };

  // Show error state if not in agent context
  if (!agentData.id) {
    return (
      <div className="w-full h-full bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Agent Context
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Knowledge panel requires an agent context. Please navigate to an agent builder page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-900 dark:bg-slate-900">
      <div className="p-6 border-b border-slate-800 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white dark:text-white">
                Knowledge Base
              </h2>
              <p className="text-sm text-slate-400 dark:text-slate-400">
                {agentData.knowledgeSources.length} source{agentData.knowledgeSources.length !== 1 ? 's' : ''} imported
              </p>
            </div>
          </div>
          
          <ModernButton
            variant="secondary"
            size="sm"
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
            onClick={handleTrainKnowledge}
            disabled={agentData.knowledgeSources.length === 0}
          >
            Train Knowledge
          </ModernButton>
        </div>
      </div>
      
      <ScrollArea className="flex-1 h-[calc(100%-120px)]">
        <div className="p-6">
          {agentData.knowledgeSources.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white dark:text-white mb-2">No knowledge sources yet</h3>
              <p className="text-sm text-slate-400 dark:text-slate-400 max-w-sm mx-auto mb-4">
                Import knowledge sources to improve your agent's responses and make it more knowledgeable.
              </p>
              <ModernButton
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsImportDialogOpen(true)}
              >
                Add Knowledge Source
              </ModernButton>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {agentData.knowledgeSources.map((knowledgeSource) => (
                <div key={knowledgeSource.id} className="flex-shrink-0 w-72">
                  <CompactKnowledgeSourceCard
                    source={knowledgeSource}
                    onClick={() => {
                      // Handle knowledge source click if needed
                      console.log('Knowledge source clicked:', knowledgeSource.name);
                    }}
                  />
                </div>
              ))}
              
              <div className="flex-shrink-0 w-72">
                <AddKnowledgeCard onClick={() => setIsImportDialogOpen(true)} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <ImportSourcesDialog
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        externalSources={externalSources}
        currentSources={agentData.knowledgeSources}
        onImport={handleImport}
        agentId={agentData.id?.toString()}
      />
    </div>
  );
};
