import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { Brain, Plus, FileText, Globe, Database, File, ChevronRight, ChevronDown, Folder, FolderOpen, X } from 'lucide-react';
import { ImportSourcesDialog } from '@/components/agents/knowledge/ImportSourcesDialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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

const KnowledgeSourceTreeCard = ({ source, expanded, onToggle, onDelete }: { 
  source: any, 
  expanded: boolean,
  onToggle: () => void,
  onDelete: () => void
}) => {
  const IconComponent = getIconForType(source.type);
  
  return (
    <div className="group border border-border/50 rounded-lg bg-card hover:bg-accent/20 transition-all duration-200">
      {/* Compact Header */}
      <div className="flex items-center gap-2 p-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground transition-colors"
          onClick={onToggle}
        >
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>
        
        <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-primary to-primary/80 rounded-md flex-shrink-0">
          <IconComponent className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground truncate">
              {source.name}
            </h3>
            {getBadgeForStatus(source.trainingStatus)}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {source.type}
          </p>
        </div>

        <ModernButton
          variant="ghost"
          size="sm"
          icon={X}
          iconOnly
          onClick={onDelete}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
        />
      </div>
      
      {/* Tree View Content */}
      {expanded && (
        <div className="border-t border-border/30 px-3 pb-3">
          <div className="space-y-0.5 mt-2">
            {source.knowledge_sources?.filter((ks: any) => ks.is_selected).map((ks: any, index: number) => (
              <div key={index} className="ml-4">
                {/* Main source node */}
                <div className="flex items-center gap-2 py-1">
                  <div className="w-3 flex justify-center">
                    <div className="w-0.5 h-3 bg-border/50"></div>
                  </div>
                  <div className="w-2 h-0.5 bg-border/50"></div>
                  <File className="h-3 w-3 text-green-500 flex-shrink-0" />
                  {ks.url ? (
                    <a 
                      href={ks.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:text-primary/80 underline truncate flex-1"
                    >
                      {ks.title || ks.url || `Source ${index + 1}`}
                    </a>
                  ) : (
                    <span className="text-xs text-foreground/80 truncate flex-1">
                      {ks.title || `Source ${index + 1}`}
                    </span>
                  )}
                </div>
                
                {/* Sub URLs as tree branches */}
                {source.type === 'website' && ks.sub_urls?.children?.length > 0 && (
                  <div className="space-y-0.5">
                    {ks.sub_urls.children.filter((subUrl: any) => subUrl.is_selected).map((subUrl: any, subIndex: number) => (
                      <div key={subIndex} className="flex items-center gap-2 py-0.5 ml-2">
                        <div className="w-3 flex justify-center">
                          <div className="w-0.5 h-2 bg-border/30"></div>
                        </div>
                        <div className="w-2 h-0.5 bg-border/30"></div>
                        <Globe className="h-2.5 w-2.5 text-blue-500 flex-shrink-0" />
                        <a 
                          href={subUrl.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:text-primary/80 underline truncate flex-1"
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
                <div className="w-5 h-5 rounded-full bg-muted/50 mx-auto mb-2 flex items-center justify-center">
                  <File className="h-2.5 w-2.5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">No sources selected</p>
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<number | null>(null);

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
      <div className="w-full h-full bg-background flex items-center justify-center">
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Agent Context
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Knowledge panel requires an agent context. Please navigate to an agent builder page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background flex flex-col">
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Knowledge Base
          </h2>
          <ModernButton
            variant="ghost"
            size="sm"
            onClick={handleTrainKnowledge}
            disabled={agentData.knowledgeSources.length === 0}
          >
            Train
          </ModernButton>
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
                <h3 className="text-lg font-semibold text-foreground mb-2">No knowledge sources yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
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
                <ModernButton
                  variant="ghost"
                  size="sm"
                  icon={Plus}
                  onClick={() => setIsImportDialogOpen(true)}
                  className="w-full border-2 border-dashed border-border hover:border-primary/50 h-12"
                >
                  Add Source
                </ModernButton>
              </>
            )}
          </div>
        </ScrollArea>
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
        onSourceDelete={() => {}}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Knowledge Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this knowledge source from your agent? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleSourceDelete}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};