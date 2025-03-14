import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, LoaderCircle, AlertCircle, Zap, Import, Trash2, Link2Off } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import KnowledgeSourceTable from './KnowledgeSourceTable';
import { KnowledgeSource } from './types';
import ImportSourcesDialog from './ImportSourcesDialog';
import { getToastMessageForSourceChange, getTrainingStatusToast, getRetrainingRequiredToast } from './knowledgeUtils';

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
  const [isTrainingAll, setIsTrainingAll] = useState(false);
  
  const mockKnowledgeSources: KnowledgeSource[] = [
    { id: 1, name: 'Product Documentation', type: 'document', size: '2.4 MB', lastUpdated: '2023-12-15', trainingStatus: 'idle', progress: 0 },
    { id: 2, name: 'FAQs', type: 'webpage', size: '0.8 MB', lastUpdated: '2023-12-20', trainingStatus: 'idle', progress: 0, linkBroken: true },
    { id: 3, name: 'Customer Support Guidelines', type: 'document', size: '1.5 MB', lastUpdated: '2023-12-10', trainingStatus: 'error', progress: 100 },
    { id: 4, name: 'Pricing Information', type: 'document', size: '0.3 MB', lastUpdated: '2023-12-25', trainingStatus: 'idle', progress: 0 },
  ];
  
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(
    mockKnowledgeSources.filter(source => initialSelectedSources.includes(source.id))
  );
  
  const [needsRetraining, setNeedsRetraining] = useState(true);
  
  const externalKnowledgeSources = [
    { id: 101, name: 'Product Features Overview', type: 'pdf', size: '2.4 MB', lastUpdated: '2023-06-01' },
    { id: 102, name: 'Pricing Structure', type: 'docx', size: '1.1 MB', lastUpdated: '2023-06-02' },
    { id: 103, name: 'Technical Specifications', type: 'pdf', size: '3.7 MB', lastUpdated: '2023-06-05' },
    { id: 104, name: 'Company Website', type: 'url', size: 'N/A', lastUpdated: '2023-05-28', linkBroken: true },
    { id: 105, name: 'Customer Data', type: 'csv', size: '0.8 MB', lastUpdated: '2023-05-15' },
  ];

  const [prevSourcesLength, setPrevSourcesLength] = useState(knowledgeSources.length);
  const [prevSourceIds, setPrevSourceIds] = useState<number[]>(knowledgeSources.map(source => source.id));

  useEffect(() => {
    setNeedsRetraining(true);
    
    if (prevSourcesLength > 0 && knowledgeSources.length !== prevSourcesLength) {
      toast(getRetrainingRequiredToast());
    }
    
    setPrevSourcesLength(knowledgeSources.length);
    setPrevSourceIds(knowledgeSources.map(source => source.id));
  }, [knowledgeSources]);

  const removeSource = (sourceId: number) => {
    const sourceToRemove = knowledgeSources.find(source => source.id === sourceId);
    
    if (!sourceToRemove) return;
    
    setKnowledgeSources(prev => prev.filter(source => source.id !== sourceId));
    
    if (onSourcesChange) {
      const updatedSourceIds = knowledgeSources
        .filter(s => s.id !== sourceId)
        .map(s => s.id);
      onSourcesChange(updatedSourceIds);
    }
    
    setNeedsRetraining(true);
    
    const toastInfo = getToastMessageForSourceChange('removed', sourceToRemove.name);
    toast(toastInfo);
  };

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
    
    const newSources: KnowledgeSource[] = newSourceIds.map(id => {
      const source = externalKnowledgeSources.find(s => s.id === id);
      const sourceCopy = { ...source };
      return {
        id: source!.id,
        name: source!.name,
        type: source!.type,
        size: source!.size,
        lastUpdated: source!.lastUpdated,
        trainingStatus: 'idle' as 'idle',
        progress: 0,
        linkBroken: sourceCopy.linkBroken || false
      };
    });

    setKnowledgeSources(prev => [...prev, ...newSources]);
    setIsImportDialogOpen(false);

    setNeedsRetraining(true);

    if (onSourcesChange) {
      const updatedSourceIds = [...knowledgeSources.map(s => s.id), ...newSourceIds];
      onSourcesChange(updatedSourceIds);
    }

    if (newSourceIds.length === 1) {
      const newSourceName = newSources[0].name;
      const toastInfo = getToastMessageForSourceChange('added', newSourceName);
      toast(toastInfo);
    } else {
      toast({
        title: "Knowledge sources imported",
        description: `${newSourceIds.length} sources have been imported. Training is required for the agent to use this knowledge.`,
      });
    }
  };

  const trainSource = async (sourceId: number) => {
    const sourceName = knowledgeSources.find(s => s.id === sourceId)?.name || "Knowledge source";
    
    setKnowledgeSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, trainingStatus: 'training', progress: 0 } 
          : source
      )
    );
    
    toast(getTrainingStatusToast('start', sourceName));

    const intervalId = setInterval(() => {
      setKnowledgeSources(prev => {
        const sourceTrain = prev.find(s => s.id === sourceId);
        if (sourceTrain && sourceTrain.trainingStatus === 'training' && (sourceTrain.progress || 0) < 100) {
          return prev.map(s => 
            s.id === sourceId 
              ? { ...s, progress: (s.progress || 0) + 10 } 
              : s
          );
        } else {
          clearInterval(intervalId);
          return prev;
        }
      });
    }, 500);

    setTimeout(() => {
      clearInterval(intervalId);
      
      const success = Math.random() > 0.2;
      
      setKnowledgeSources(prev => 
        prev.map(source => 
          source.id === sourceId 
            ? { 
                ...source, 
                trainingStatus: success ? 'success' : 'error', 
                progress: 100,
                linkBroken: source.linkBroken && success ? false : source.linkBroken 
              } 
            : source
        )
      );
      
      toast(getTrainingStatusToast(success ? 'success' : 'error', sourceName));
      
      setNeedsRetraining(true);
    }, 5000);
  };

  const trainAllSources = async () => {
    if (knowledgeSources.length === 0) {
      toast({
        title: "No sources selected",
        description: "Please import at least one knowledge source to train.",
        variant: "destructive",
      });
      return;
    }

    setIsTrainingAll(true);
    
    toast({
      title: "Training all sources",
      description: `Processing ${knowledgeSources.length} knowledge sources. This may take a moment.`,
    });

    for (const source of knowledgeSources) {
      setKnowledgeSources(prev => 
        prev.map(s => 
          s.id === source.id 
            ? { ...s, trainingStatus: 'training', progress: 0 } 
            : s
        )
      );

      await new Promise<void>((resolve) => {
        const intervalId = setInterval(() => {
          setKnowledgeSources(prev => {
            const sourceTrain = prev.find(s => s.id === source.id);
            if (sourceTrain && sourceTrain.trainingStatus === 'training' && (sourceTrain.progress || 0) < 100) {
              return prev.map(s => 
                s.id === source.id 
                  ? { ...s, progress: (s.progress || 0) + 20 } 
                  : s
              );
            } else {
              clearInterval(intervalId);
              return prev;
            }
          });
        }, 300);

        setTimeout(() => {
          clearInterval(intervalId);
          const success = Math.random() > 0.2;
          
          setKnowledgeSources(prev => 
            prev.map(s => 
              s.id === source.id 
                ? { 
                    ...s, 
                    trainingStatus: success ? 'success' : 'error', 
                    progress: 100,
                    linkBroken: s.linkBroken && success ? false : s.linkBroken 
                  } 
                : s
            )
          );
          
          resolve();
        }, 2000);
      });
    }

    setIsTrainingAll(false);
    
    setNeedsRetraining(false);
    
    toast({
      title: "Training complete",
      description: "All knowledge sources have been processed.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Knowledge Sources</CardTitle>
          <CardDescription>Connect knowledge sources to your agent to improve its responses</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsImportDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Import className="h-4 w-4" />
            Import Sources
          </Button>
          <Button 
            onClick={trainAllSources} 
            disabled={isTrainingAll || knowledgeSources.length === 0}
            size="sm"
            className="flex items-center gap-1"
          >
            {isTrainingAll ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {isTrainingAll ? 'Training...' : 'Train All'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <KnowledgeSourceTable 
          sources={knowledgeSources} 
          onTrainSource={trainSource}
          onRemoveSource={removeSource}
        />
        
        {needsRetraining && knowledgeSources.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Some knowledge sources need training for your agent to use them. Click "Train All" to process them.</span>
          </div>
        )}
      </CardContent>

      <ImportSourcesDialog
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        externalSources={externalKnowledgeSources}
        currentSources={knowledgeSources}
        onImport={importSelectedSources}
      />
    </Card>
  );
};

export default KnowledgeTrainingStatus;
