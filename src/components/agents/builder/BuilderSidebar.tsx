import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { Brain, Plus, FileText, Globe, Database, File, ChevronRight, ChevronDown, Folder, FolderOpen, X, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ModernButton from '@/components/dashboard/ModernButton';
import { useToast } from '@/hooks/use-toast';
import KnowledgeSourceModal from '@/components/agents/knowledge/KnowledgeSourceModal';
import { ModernModal } from '@/components/ui/modern-modal';
import { KnowledgeActionDropdown } from './KnowledgeActionDropdown';

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

const KnowledgeSourceTreeCard = ({ source, expanded, onToggle, onDelete }: { 
  source: any, 
  expanded: boolean,
  onToggle: () => void,
  onDelete: () => void
}) => {
  const IconComponent = getIconForType(source.type);
  
  return (
    <div className="group border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
      {/* Compact Header */}
      <div className="flex items-center gap-2 p-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-300 transition-colors"
          onClick={onToggle}
        >
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>
        
        <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex-shrink-0">
          <IconComponent className="h-3.5 w-3.5 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {source.name}
            </h3>
            {getBadgeForStatus(source.trainingStatus)}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {source.type}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      {/* Tree View Content */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-3 pb-3">
          <div className="space-y-0.5 mt-2">
            {source.knowledge_sources?.filter((ks: any) => ks.is_selected).map((ks: any, index: number) => (
              <div key={index} className="ml-4">
                {/* Main source node */}
                <div className="flex items-center gap-2 py-1">
                  <div className="w-3 flex justify-center">
                    <div className="w-0.5 h-3 bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                  <div className="w-2 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                  <File className="h-3 w-3 text-green-500 flex-shrink-0" />
                  {ks.url ? (
                    <a 
                      href={ks.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline truncate flex-1"
                    >
                      {ks.title || ks.url || `Source ${index + 1}`}
                    </a>
                  ) : (
                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">
                      {ks.title || `Source ${index + 1}`}
                    </span>
                  )}
                </div>
                
                {/* Sub URLs as tree branches */}
                {source.type === 'website' && ks.metadata?.sub_urls?.children?.length > 0 && (
                  <div className="space-y-0.5">
                    {ks.metadata.sub_urls.children.filter((subUrl: any) => subUrl.is_selected).map((subUrl: any, subIndex: number) => (
                      <div key={subIndex} className="flex items-center gap-2 py-0.5 ml-2">
                        <div className="w-3 flex justify-center">
                          <div className="w-0.5 h-2 bg-gray-200 dark:bg-gray-600"></div>
                        </div>
                        <div className="w-2 h-0.5 bg-gray-200 dark:bg-gray-600"></div>
                        <Globe className="h-2.5 w-2.5 text-blue-500 flex-shrink-0" />
                        <a 
                          href={subUrl.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline truncate flex-1"
                        >
                          {subUrl.url.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {source.knowledge_sources?.filter((ks: any) => ks.is_selected).length === 0 && (
              <div className="text-center py-4">
                <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 mx-auto mb-2 flex items-center justify-center">
                  <File className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">No sources selected</p>
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
  const { agentData, isLoading } = state;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<number | null>(null);

  const handleSourceClick = (sourceId: number) => {
    setSelectedSourceId(sourceId);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = (sourceId: number) => {
    setSourceToDelete(sourceId);
    setDeleteConfirmOpen(true);
  };

  const handleSourceDelete = async () => {
    if (!agentData.id || !sourceToDelete) return;

    try {
      const token = getAccessToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${BASE_URL}agents/${agentData.id}/remove-knowledge-sources/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          knowledgeSources: [sourceToDelete]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete knowledge source');
      }

      // Update local state
      const updatedSources = agentData.knowledgeSources.filter(source => source.id !== sourceToDelete);
      updateAgentData({ knowledgeSources: updatedSources });
      
      // Close modal if the deleted source was selected
      if (selectedSourceId === sourceToDelete) {
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
    } finally {
      setDeleteConfirmOpen(false);
      setSourceToDelete(null);
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
          <Brain className="h-12 w-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Agent Context
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            Builder sidebar requires an agent context. Please navigate to an agent builder page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full bg-background flex flex-col">
        {/* Header Skeleton */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        
        {/* Knowledge Sources List Skeleton */}
        <div className="flex-1">
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="border border-border rounded-lg bg-transparent dark:border-gray-600 p-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-7 w-7 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full bg-background flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Knowledge Base
            </h2>
            <KnowledgeActionDropdown />
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {agentData.knowledgeSources.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No knowledge sources yet</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-4">
                    Import knowledge sources to improve your agent's responses and make it more knowledgeable.
                  </p>
                  <KnowledgeActionDropdown />
                </div>
              ) : (
                <>
                  {agentData.knowledgeSources.map((knowledgeSource) => (
                    <KnowledgeSourceTreeCard
                      key={knowledgeSource.id}
                      source={knowledgeSource}
                      expanded={expandedSources.has(knowledgeSource.id)}
                      onToggle={() => toggleSourceExpansion(knowledgeSource.id)}
                      onDelete={() => handleDeleteConfirm(knowledgeSource.id)}
                    />
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        <KnowledgeSourceModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          sources={agentData.knowledgeSources}
          initialSourceId={selectedSourceId}
          agentId={agentData.id?.toString()}
          onSourceDelete={() => {}}
        />

        <ModernModal
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Delete Knowledge Source"
          description="Are you sure you want to remove this knowledge source from your agent? This action cannot be undone."
          size="md"
          footer={
            <div className="flex gap-3">
              <ModernButton variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </ModernButton>
              <ModernButton 
                variant="gradient" 
                onClick={handleSourceDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </ModernButton>
            </div>
          }
        >
          <div className="py-4">
            <p className="text-slate-600 dark:text-slate-400">
              This will permanently remove the knowledge source from your agent.
            </p>
          </div>
        </ModernModal>
      </div>
    </>
  );
};
