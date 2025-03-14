import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface KnowledgeSource {
  id: number;
  name: string;
  type: string;
  icon: string;
  trainingStatus: 'pending' | 'training' | 'success' | 'failed' | 'none';
  trainingProgress?: number;
  isDeleted?: boolean;
  isBroken?: boolean;
}

export interface UseKnowledgeSourcesProps {
  initialSources?: KnowledgeSource[];
  onSourcesChange?: (sourceIds: number[]) => void;
}

export function useKnowledgeSources({ 
  initialSources = [], 
  onSourcesChange 
}: UseKnowledgeSourcesProps = {}) {
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(initialSources);
  const [isTrainingAll, setIsTrainingAll] = useState(false);
  const [sourcesChanged, setSourcesChanged] = useState(false);
  const [needsRetraining, setNeedsRetraining] = useState(false);

  useEffect(() => {
    // Initialize with the given sources
    if (initialSources.length > 0) {
      setKnowledgeSources(initialSources);
      
      // Check if any source needs training initially
      const hasFailedOrNone = initialSources.some(
        s => s.trainingStatus === 'failed' || s.trainingStatus === 'none' || s.isDeleted || s.isBroken
      );
      setNeedsRetraining(hasFailedOrNone);
    }
  }, [initialSources]);

  // Simulate training a single source
  const trainSource = async (sourceId: number) => {
    setKnowledgeSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, trainingStatus: 'training', trainingProgress: 0 } 
          : source
      )
    );

    // Simulate progress
    const interval = setInterval(() => {
      setKnowledgeSources(prev => {
        const sourceIndex = prev.findIndex(s => s.id === sourceId);
        if (sourceIndex === -1) {
          clearInterval(interval);
          return prev;
        }

        const source = prev[sourceIndex];
        if (!source || source.trainingStatus !== 'training') {
          clearInterval(interval);
          return prev;
        }

        const newProgress = (source.trainingProgress || 0) + 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // For simulation, let's succeed mostly, but occasionally fail
          const willSucceed = Math.random() > 0.2;
          
          const updatedSources = [...prev];
          updatedSources[sourceIndex] = {
            ...source,
            trainingStatus: willSucceed ? 'success' : 'failed',
            trainingProgress: 100,
            isBroken: source.isBroken && willSucceed ? false : source.isBroken,
            isDeleted: source.isDeleted && willSucceed ? false : source.isDeleted
          };
          
          return updatedSources;
        }
        
        const updatedSources = [...prev];
        updatedSources[sourceIndex] = {
          ...source,
          trainingProgress: newProgress
        };
        
        return updatedSources;
      });
    }, 300);

    // Wait for training to complete (simulated)
    await new Promise(resolve => setTimeout(resolve, 3000));

    const updatedSource = knowledgeSources.find(s => s.id === sourceId);
    
    if (updatedSource?.trainingStatus === 'success') {
      toast({
        title: "Training successful",
        description: `${updatedSource.name} has been successfully processed.`,
      });
    } else {
      toast({
        title: "Training failed",
        description: `Failed to process ${updatedSource?.name || "source"}.`,
        variant: "destructive",
      });
    }

    return updatedSource?.trainingStatus || 'failed';
  };

  // Train all sources
  const trainAllSources = async () => {
    setIsTrainingAll(true);
    
    for (const source of knowledgeSources) {
      await trainSource(source.id);
    }
    
    setIsTrainingAll(false);
    setSourcesChanged(false);
    
    // Check if all sources were trained successfully
    const allSuccessful = knowledgeSources.every(
      s => s.trainingStatus === 'success' && !s.isDeleted && !s.isBroken
    );
    
    setNeedsRetraining(!allSuccessful);
    
    toast({
      title: "Training complete",
      description: "All knowledge sources have been processed.",
    });
  };

  // Remove a source
  const removeSource = (sourceId: number) => {
    setKnowledgeSources(prev => prev.filter(source => source.id !== sourceId));
    
    if (onSourcesChange) {
      const updatedSourceIds = knowledgeSources
        .filter(s => s.id !== sourceId)
        .map(s => s.id);
      onSourcesChange(updatedSourceIds);
    }
    
    setSourcesChanged(true);
    
    toast({
      title: "Source removed",
      description: "Consider retraining your agent to update its knowledge.",
    });
  };

  // Mark a source as broken for simulation
  const markSourceAsBroken = (sourceId: number) => {
    setKnowledgeSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, isBroken: true, trainingStatus: 'failed' } 
          : source
      )
    );
    setNeedsRetraining(true);
    
    toast({
      title: "Source marked as broken",
      description: "This source needs to be retrained.",
      variant: "warning"
    });
  };

  // Mark a source as deleted (but keep in list) for simulation
  const markSourceAsDeleted = (sourceId: number) => {
    setKnowledgeSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, isDeleted: true, trainingStatus: 'failed' } 
          : source
      )
    );
    setNeedsRetraining(true);
    
    toast({
      title: "Source marked as deleted",
      description: "This source needs to be removed or updated.",
      variant: "destructive"
    });
  };

  const canTrainAll = knowledgeSources.length > 0;

  return {
    knowledgeSources,
    isTrainingAll,
    needsRetraining,
    trainSource,
    trainAllSources,
    removeSource,
    markSourceAsBroken,
    markSourceAsDeleted,
    canTrainAll
  };
}
