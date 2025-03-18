import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import KnowledgeSourceTable from './table/KnowledgeSourceTable';
import ImportSourcesDialog from './ImportSourcesDialog';
import KnowledgeHeader from './components/KnowledgeHeader';
import TrainingWarning from './components/TrainingWarning';
import { useKnowledgeTraining } from './hooks/useKnowledgeTraining';
import { mockKnowledgeSources } from './mockData';
import { getToastMessageForSourceChange } from './knowledgeUtils';

interface KnowledgeTrainingStatusProps {
  agentId: string;
  initialSelectedSources?: number[];
  onSourcesChange?: (selectedSourceIds: number[]) => void;
}

const KnowledgeTrainingStatus = ({ 
  agentId, 
  initialSelectedSources = [], 
  onSourcesChange 
}: KnowledgeTrainingStatusProps) => {
  const { toast } = useToast();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const {
    knowledgeSources,
    setKnowledgeSources,
    isTrainingAll,
    needsRetraining,
    trainSource,
    trainAllSources,
    removeSource,
    updateSource
  } = useKnowledgeTraining(
    mockKnowledgeSources.filter(source => initialSelectedSources.includes(source.id)),
    onSourcesChange
  );

  const importSelectedSources = (sourceIds: number[]) => {
    const newSourceIds = sourceIds.filter(id => !knowledgeSources.some(s => s.id === id));
    
    if (newSourceIds.length === 0) {
      toast({
        title: "No new sources selected",
        description: "All selected sources are already imported.",
      });
      setIsImportDialogOpen(false);
      return;
    }
    
    const newSources = newSourceIds.map(id => {
      const source = mockKnowledgeSources.find(s => s.id === id);
      if (!source) throw new Error(`Source with id ${id} not found`);
      
      return {
        ...source,
        trainingStatus: 'idle' as const,
        progress: 0
      };
    });

    setKnowledgeSources(prev => [...prev, ...newSources]);
    setIsImportDialogOpen(false);

    if (onSourcesChange) {
      const updatedSourceIds = [...knowledgeSources.map(s => s.id), ...newSourceIds];
      onSourcesChange(updatedSourceIds);
    }

    if (newSourceIds.length === 1) {
      const newSourceName = newSources[0].name;
      toast(getToastMessageForSourceChange('added', newSourceName));
    } else {
      toast({
        title: "Knowledge sources imported",
        description: `${newSourceIds.length} sources have been imported. Training is required for the agent to use this knowledge.`,
      });
    }
  };

  return (
    <Card>
      <KnowledgeHeader 
        isTrainingAll={isTrainingAll}
        onImportClick={() => setIsImportDialogOpen(true)}
        onTrainAllClick={trainAllSources}
        sourcesLength={knowledgeSources.length}
      />
      
      <CardContent>
        <KnowledgeSourceTable 
          sources={knowledgeSources} 
          onTrainSource={trainSource}
          onRemoveSource={removeSource}
          onUpdateSource={updateSource}
        />
        
        <TrainingWarning 
          show={needsRetraining} 
          sourcesLength={knowledgeSources.length} 
        />
      </CardContent>

      <ImportSourcesDialog
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        externalSources={mockKnowledgeSources}
        currentSources={knowledgeSources}
        onImport={importSelectedSources}
      />
    </Card>
  );
};

export default KnowledgeTrainingStatus;
