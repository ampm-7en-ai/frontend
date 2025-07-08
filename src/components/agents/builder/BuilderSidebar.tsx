import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { Brain, Plus, FileText, Globe, Database, File, ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { ImportSourcesDialog } from '@/components/agents/knowledge/ImportSourcesDialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ModernButton from '@/components/dashboard/ModernButton';
import { useToast } from '@/hooks/use-toast';
import KnowledgeSourceModal from '@/components/agents/knowledge/KnowledgeSourceModal';

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

const KnowledgeSourceTreeCard = ({ source, onClick, expanded, onToggle }: { 
  source: any, 
  onClick: () => void, 
  expanded: boolean,
  onToggle: () => void 
}) => {
  const IconComponent = getIconForType(source.type);
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      {/* Header */}
      <div 
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 rounded-t-lg"
        onClick={onClick}
      >
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex-shrink-0">
          <IconComponent className="h-4 w-4 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {source.name}
            </h3>
            {getBadgeForStatus(source.trainingStatus)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {source.type} • {source.lastUpdated}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>
      </div>
      
      {/* Expandable Content */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-750/50">
          <div className="space-y-2">
            {source.knowledge_sources?.filter((ks: any) => ks.is_selected).map((ks: any, index: number) => (
              <div key={index} className="space-y-1">
                {/* Main source file/url */}
                <div className="flex items-center gap-2 text-xs">
                  <File className="h-3 w-3 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400 truncate">
                    {ks.title || ks.url || `Source ${index + 1}`}
                  </span>
                  <Badge variant="default" className="text-[8px] px-1 py-0 bg-green-100 text-green-700 border-green-200">Selected</Badge>
                </div>
                
                {/* Sub URLs for websites - only selected ones */}
                {source.type === 'website' && ks.sub_urls?.children?.length > 0 && (
                  <div className="ml-4 space-y-1">
                    {ks.sub_urls.children.filter((subUrl: any) => subUrl.is_selected).map((subUrl: any, subIndex: number) => (
                      <div key={subIndex} className="flex items-center gap-2 text-xs">
                        <ChevronRight className="h-2 w-2 text-green-400" />
                        <span className="text-gray-500 dark:text-gray-500 truncate text-[10px]">
                          {subUrl.url}
                        </span>
                        <Badge variant="default" className="text-[8px] px-1 py-0 bg-green-100 text-green-700 border-green-200">Selected</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {source.knowledge_sources?.filter((ks: any) => ks.is_selected).length === 0 && (
              <div className="text-center py-2">
                <p className="text-xs text-gray-400">No files selected</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const BuilderSidebar = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());

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

  const handleSourceClick = (sourceId: number) => {
    setSelectedSourceId(sourceId);
    setIsModalOpen(true);
  };

  const handleSourceDelete = async (sourceId: number) => {
    if (!agentData.id) return;

    try {
      const token = getAccessToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${BASE_URL}agents/${agentData.id}/remove-knowledge-sources/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          knowledgeSources: [sourceId]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete knowledge source');
      }

      // Update local state
      const updatedSources = agentData.knowledgeSources.filter(source => source.id !== sourceId);
      updateAgentData({ knowledgeSources: updatedSources });
      
      // Close modal if the deleted source was selected
      if (selectedSourceId === sourceId) {
        setIsModalOpen(false);
        setSelectedSourceId(null);
      }

      toast({
        title: "Knowledge source removed",
        description: "The knowledge source has been successfully removed from your agent.",
      });
    } catch (error) {
      console.error('Error deleting knowledge source:', error);
      toast({
        title: "Delete failed",
        description: "There was an error removing the knowledge source.",
        variant: "destructive"
      });
    }
  };

  const toggleSourceExpansion = (sourceId: number) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(sourceId)) {
      newExpanded.delete(sourceId);
    } else {
      newExpanded.add(sourceId);
    }
    setExpandedSources(newExpanded);
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
    <div className="w-full h-full bg-white dark:bg-gray-900 flex flex-col">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
<<<<<<< Updated upstream
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Knowledge Base
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {agentData.knowledgeSources.length} source{agentData.knowledgeSources.length !== 1 ? 's' : ''} imported
            </p>
          </div>
=======
        <div className="flex items-start flex-col">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Knowledge Base
              </h2>
              {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                {agentData.knowledgeSources.length} source{agentData.knowledgeSources.length !== 1 ? 's' : ''} imported
              </p> */}
            </div>
          </div>
          
          {/* <div className="flex gap-2">
            <ModernButton
              variant="outline"
              size="sm"
              onClick={() => setIsImportDialogOpen(true)}
            >
              Import
            </ModernButton>
            <ModernButton
              variant="secondary"
              size="sm"
              onClick={handleTrainKnowledge}
              disabled={agentData.knowledgeSources.length === 0}
            >
              Train Knowledge
            </ModernButton>
          </div> */}
>>>>>>> Stashed changes
        </div>
      </div>
      
      <div className="flex-1">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {agentData.knowledgeSources.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No knowledge sources yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
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
              agentData.knowledgeSources.map((knowledgeSource) => (
                <KnowledgeSourceTreeCard
                  key={knowledgeSource.id}
                  source={knowledgeSource}
                  onClick={() => handleSourceClick(knowledgeSource.id)}
                  expanded={expandedSources.has(knowledgeSource.id)}
                  onToggle={() => toggleSourceExpansion(knowledgeSource.id)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Bottom Action Buttons */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex gap-2 w-full">
          <ModernButton
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setIsImportDialogOpen(true)}
          >
            Import Sources
          </ModernButton>
          <ModernButton
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={handleTrainKnowledge}
            disabled={agentData.knowledgeSources.length === 0}
          >
            Train Knowledge
          </ModernButton>
        </div>
      </div>

      <ImportSourcesDialog
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        externalSources={externalSources}
        currentSources={agentData.knowledgeSources}
        onImport={handleImport}
        agentId={agentData.id?.toString()}
      />

      <KnowledgeSourceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        sources={agentData.knowledgeSources}
        initialSourceId={selectedSourceId}
        agentId={agentData.id?.toString()}
        onSourceDelete={handleSourceDelete}
      />
    </div>
  );
};