
import React, { useState, useEffect } from 'react';
import { KnowledgeSourceTable } from './KnowledgeSourceTable';
import KnowledgeSourceModal from './KnowledgeSourceModal';
import { KnowledgeSource } from './types';
import { ImportSourcesDialog } from './ImportSourcesDialog';
import { Button } from '@/components/ui/button';
import { Plus, Import, Trash2, RotateCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { getToastMessageForSourceChange } from './knowledgeUtils';
import { TrainingProgressIndicator } from './TrainingProgressIndicator';
import { useKnowledgeTraining } from '@/hooks/useKnowledgeTraining';

interface AgentKnowledgeSectionProps {
  agentId: string;
  knowledgeSources: KnowledgeSource[];
  onSourcesChange?: (sources: KnowledgeSource[]) => void;
  onTrainAllSources?: () => void;
  onRemoveSource?: (sourceId: number) => void;
  externalSources?: KnowledgeSource[];
}

export const AgentKnowledgeSection = ({
  agentId,
  knowledgeSources,
  onSourcesChange,
  onTrainAllSources,
  onRemoveSource,
  externalSources = [],
}: AgentKnowledgeSectionProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const { toast } = useToast();

  const { 
    trainingStatus, 
    startTraining, 
    resetTrainingStatus 
  } = useKnowledgeTraining(agentId);

  const filteredExternalSources = externalSources.filter(
    (source) => !knowledgeSources.some((existing) => existing.id === source.id)
  );

  const handleRemoveSource = () => {
    if (selectedSourceId !== null) {
      if (onSourcesChange) {
        const updatedSources = knowledgeSources.filter((source) => source.id !== selectedSourceId);
        onSourcesChange(updatedSources);
      }
      
      const removedSource = knowledgeSources.find((source) => source.id === selectedSourceId);
      if (removedSource) {
        toast(getToastMessageForSourceChange('removed', removedSource.name));
      }

      if (onRemoveSource) {
        onRemoveSource(selectedSourceId);
      }
      
      setSelectedSourceId(null);
      setIsRemoveDialogOpen(false);
    }
  };

  const handleConfirmRemoval = (sourceId: number) => {
    setSelectedSourceId(sourceId);
    setIsRemoveDialogOpen(true);
  };

  const handleImportSources = (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>) => {
    if (!onSourcesChange) return;
    
    const sourcesToImport = sourceIds.map((id) => {
      const source = externalSources.find((s) => s.id === id);
      if (!source) return null;
      
      // If we have selectedSubUrls for this source, 
      // we should modify the source to only include those URLs
      if (selectedSubUrls && selectedSubUrls[id]) {
        // Deep clone to avoid modifying the original
        const modifiedSource = JSON.parse(JSON.stringify(source));
        
        // Store the selected URLs in the source metadata
        if (!modifiedSource.metadata) modifiedSource.metadata = {};
        modifiedSource.metadata.selectedUrls = Array.from(selectedSubUrls[id]);
        
        return modifiedSource;
      }
      
      return source;
    }).filter((s): s is KnowledgeSource => s !== null);

    const updatedSources = [...knowledgeSources, ...sourcesToImport];
    onSourcesChange(updatedSources);
    
    if (sourcesToImport.length === 1) {
      toast(getToastMessageForSourceChange('added', sourcesToImport[0].name));
    } else {
      toast({
        title: "Knowledge sources added",
        description: `${sourcesToImport.length} sources have been added to your knowledge base.`,
      });
    }
    
    setIsImportDialogOpen(false);
  };

  const handleTrainAll = async () => {
    if (knowledgeSources.length === 0) {
      toast({
        title: "No sources to train",
        description: "Please add knowledge sources before training.",
      });
      return;
    }
    
    // Reset previous training status
    resetTrainingStatus();
    
    // Start training through API
    await startTraining(knowledgeSources);
    
    // Also call the provided onTrainAllSources if available
    if (onTrainAllSources) {
      onTrainAllSources();
    }
  };

  const handleSourceCreated = (source: KnowledgeSource) => {
    if (onSourcesChange) {
      const updatedSources = [...knowledgeSources, source];
      onSourcesChange(updatedSources);
      toast(getToastMessageForSourceChange('added', source.name));
    }
  };

  // Simple view-only implementation when onSourcesChange is not provided
  const renderSourcesDisplay = () => {
    if (knowledgeSources.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          No knowledge sources available
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {knowledgeSources.map((source) => (
          <div key={source.id} className="text-sm border rounded p-2">
            <div className="font-medium">{source.name}</div>
            <div className="text-xs text-muted-foreground">
              {source.type} • {source.size}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {onSourcesChange ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Knowledge Sources</h3>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                <Import className="h-4 w-4 mr-1" />
                Import
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Source
              </Button>
              <Button 
                size="sm" 
                onClick={handleTrainAll}
                disabled={knowledgeSources.length === 0 || trainingStatus.status === 'training'}
              >
                <RotateCw className={`h-4 w-4 mr-1 ${trainingStatus.status === 'training' ? 'animate-spin' : ''}`} />
                Train All
              </Button>
            </div>
          </div>

          {trainingStatus.status !== 'idle' && (
            <TrainingProgressIndicator
              status={trainingStatus.status}
              progress={trainingStatus.progress}
              count={{
                total: trainingStatus.count.total,
                completed: trainingStatus.count.completed,
                failed: trainingStatus.count.failed,
              }}
            />
          )}
          
          <KnowledgeSourceTable
            sources={knowledgeSources}
            onRemoveSource={handleConfirmRemoval}
            trainingStatuses={trainingStatus.sources}
            onTrainSource={(sourceId) => {
              const sourceToTrain = knowledgeSources.find(source => source.id === sourceId);
              if (sourceToTrain) {
                startTraining([sourceToTrain]);
              }
            }}
          />
        </>
      ) : (
        renderSourcesDisplay()
      )}

      <KnowledgeSourceModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        sources={knowledgeSources}
        initialSourceId={null}
        onSourceCreated={handleSourceCreated}
      />

      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Knowledge Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this knowledge source? The agent will no longer have access to this information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveSource}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {onSourcesChange && (
        <ImportSourcesDialog
          isOpen={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          externalSources={filteredExternalSources}
          currentSources={knowledgeSources}
          onImport={handleImportSources}
        />
      )}
    </div>
  );
};
