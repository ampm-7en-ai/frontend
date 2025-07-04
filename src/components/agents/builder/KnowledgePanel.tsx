
import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { Brain, Plus, FileText, Globe, Database, File } from 'lucide-react';
import KnowledgeTrainingStatus from '@/components/agents/knowledge/KnowledgeTrainingStatus';
import { ImportSourcesDialog } from '@/components/agents/knowledge/ImportSourcesDialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import ModernButton from '@/components/dashboard/ModernButton';
import { ApiKnowledgeBase, KnowledgeSource } from '@/components/agents/knowledge/types';
import { useToast } from '@/hooks/use-toast';

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

const getTypeDescription = (knowledgeBase: ApiKnowledgeBase): string => {
  const { type } = knowledgeBase;
  
  const firstSource = knowledgeBase.knowledge_sources?.[0];
  if (!firstSource) return type;
  
  switch (type.toLowerCase()) {
    case 'document':
    case 'pdf':
    case 'docs':
    case 'csv':
      const fileCount = knowledgeBase.knowledge_sources.filter(source => source.is_selected).length;
      return `${fileCount} ${fileCount === 1 ? 'file' : 'files'}`;
      
    case 'website':
      let urlCount = 0;
      if (firstSource.metadata?.sub_urls?.children) {
        urlCount = firstSource.metadata.sub_urls.children.filter(url => url.is_selected).length;
      }
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

const KnowledgeSourceCard = ({ knowledgeBase }: { knowledgeBase: ApiKnowledgeBase }) => {
  const IconComponent = getIconForType(knowledgeBase.type);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 h-32">
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm flex-shrink-0">
            <IconComponent className="h-5 w-5 text-white" />
          </div>
          {getBadgeForStatus(knowledgeBase.training_status)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm mb-1">
            {knowledgeBase.name}
          </h3>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-400 capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              {knowledgeBase.type}
            </span>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {getTypeDescription(knowledgeBase)}
          </p>
        </div>
      </div>
    </div>
  );
};

const AddKnowledgeCard = ({ onClick }: { onClick: () => void }) => {
  return (
    <div 
      className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 h-32 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
      onClick={onClick}
    >
      <div className="p-4 h-full flex flex-col items-center justify-center text-center">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl shadow-sm mb-3 group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-200">
          <Plus className="h-6 w-6 text-white" />
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-1 group-hover:text-gray-900 dark:group-hover:text-gray-100">
            Add Knowledge
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Import new sources
          </p>
        </div>
      </div>
    </div>
  );
};

export const KnowledgePanel = () => {
  const { state } = useBuilder();
  const { agentData } = state;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const { data: knowledgeBases = [], isLoading, error } = useQuery({
    queryKey: ['agentKnowledgeBases', agentData.id?.toString()],
    queryFn: async () => {
      if (!agentData.id) return [];
      
      const token = getAccessToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${BASE_URL}agents/${agentData.id}/knowledge-bases/`, {
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agent knowledge bases');
      }

      const result = await response.json();
      return result.data || [];
    },
    enabled: !!agentData.id
  });

  // Fetch external knowledge sources for import dialog
  const { data: externalSources = [] } = useQuery({
    queryKey: ['knowledgeSources'],
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
      // Refresh the knowledge bases after import
      await queryClient.invalidateQueries({ 
        queryKey: ['agentKnowledgeBases', agentData.id?.toString()]
      });
      
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

      // Refresh knowledge bases to update training status
      queryClient.invalidateQueries({ 
        queryKey: ['agentKnowledgeBases', agentData.id?.toString()]
      });
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
    <div className="w-full h-full bg-white dark:bg-gray-900">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Knowledge Base
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {knowledgeBases.length} source{knowledgeBases.length !== 1 ? 's' : ''} imported
              </p>
            </div>
          </div>
          
          <ModernButton
            variant="secondary"
            size="sm"
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
            onClick={handleTrainKnowledge}
            disabled={knowledgeBases.length === 0}
          >
            Train Knowledge
          </ModernButton>
        </div>
      </div>
      
      <ScrollArea className="flex-1 h-[calc(100%-120px)]">
        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-2xl"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Error loading knowledge sources</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                {error instanceof Error ? error.message : 'Failed to load knowledge sources'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AddKnowledgeCard onClick={() => setIsImportDialogOpen(true)} />
              {knowledgeBases.map((knowledgeBase) => (
                <KnowledgeSourceCard
                  key={knowledgeBase.id}
                  knowledgeBase={knowledgeBase}
                />
              ))}
            </div>
          )}
          
          {!isLoading && !error && knowledgeBases.length === 0 && (
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
          )}
        </div>
      </ScrollArea>

      <ImportSourcesDialog
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        externalSources={externalSources}
        currentSources={knowledgeBases}
        onImport={handleImport}
        agentId={agentData.id?.toString()}
      />
    </div>
  );
};
