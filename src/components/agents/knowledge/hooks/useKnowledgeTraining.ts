
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { KnowledgeSource } from '../types';
import { getToastMessageForSourceChange, getTrainingStatusToast } from '../knowledgeUtils';

export const useKnowledgeTraining = (
  initialSources: KnowledgeSource[],
  onSourcesChange?: (selectedSourceIds: number[]) => void
) => {
  const { toast } = useToast();
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(initialSources);
  const [isTrainingAll, setIsTrainingAll] = useState(false);
  const [needsRetraining, setNeedsRetraining] = useState(true);
  const [prevSourcesLength, setPrevSourcesLength] = useState(knowledgeSources.length);

  useEffect(() => {
    setNeedsRetraining(true);
    if (prevSourcesLength > 0 && knowledgeSources.length !== prevSourcesLength) {
      toast({
        title: "Training Required",
        description: "Changes to knowledge sources require retraining.",
      });
    }
    setPrevSourcesLength(knowledgeSources.length);
  }, [knowledgeSources, prevSourcesLength, toast]);

  const trainSource = async (sourceId: number) => {
    const sourceIndex = knowledgeSources.findIndex(s => s.id === sourceId);
    if (sourceIndex === -1) return;
    
    const sourceName = knowledgeSources[sourceIndex].name;
    
    setKnowledgeSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, trainingStatus: 'training', progress: 0 } 
          : source
      )
    );
    
    toast(getTrainingStatusToast('start', sourceName));

    try {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setKnowledgeSources(prev => 
          prev.map(source => 
            source.id === sourceId 
              ? { ...source, progress, trainingStatus: 'training' } 
              : source
          )
        );
      }

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
    } catch (error) {
      setKnowledgeSources(prev => 
        prev.map(source => 
          source.id === sourceId 
            ? { ...source, trainingStatus: 'error', progress: 100 } 
            : source
        )
      );
      toast(getTrainingStatusToast('error', sourceName));
    }
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
      await trainSource(source.id);
    }

    setIsTrainingAll(false);
    setNeedsRetraining(false);
  };

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
    
    const toastInfo = getToastMessageForSourceChange('removed', sourceToRemove.name);
    toast(toastInfo);
  };

  const updateSource = (sourceId: number, data: Partial<KnowledgeSource>) => {
    setKnowledgeSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, ...data } 
          : source
      )
    );
    setNeedsRetraining(true);
  };

  return {
    knowledgeSources,
    setKnowledgeSources,
    isTrainingAll,
    needsRetraining,
    trainSource,
    trainAllSources,
    removeSource,
    updateSource
  };
};
