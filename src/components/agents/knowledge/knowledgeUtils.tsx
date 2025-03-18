
import React from 'react';
import { BookOpen, Database, Globe, CheckCircle, AlertCircle, Link2Off } from 'lucide-react';
import { KnowledgeSource } from './types';

export const getSourceTypeIcon = (type: string) => {
  switch (type) {
    case 'document':
    case 'pdf':
    case 'docx':
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    case 'database':
    case 'csv':
      return <Database className="h-4 w-4 text-purple-500" />;
    case 'webpage':
    case 'url':
      return <Globe className="h-4 w-4 text-green-500" />;
    default:
      return <BookOpen className="h-4 w-4 text-blue-500" />;
  }
};

export const getStatusIndicator = (source: KnowledgeSource) => {
  if (source.linkBroken) {
    return (
      <div className="flex items-center gap-1 text-orange-500 font-medium text-xs">
        <Link2Off className="h-4 w-4" />
        <span>Link broken</span>
      </div>
    );
  }
  
  if (source.trainingStatus === 'training') {
    return (
      <div className="flex items-center gap-2 w-full max-w-[200px]">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${source.progress || 0}%` }}>
          </div>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {source.progress}%
        </span>
      </div>
    );
  }
  
  switch (source.trainingStatus) {
    case 'success':
      return (
        <div className="flex items-center gap-1 text-green-500 font-medium text-xs">
          <CheckCircle className="h-4 w-4" />
          <span>Trained</span>
        </div>
      );
    case 'error':
      return (
        <div className="flex items-center gap-1 text-red-500 font-medium text-xs">
          <AlertCircle className="h-4 w-4" />
          <span>Failed</span>
        </div>
      );
    case 'idle':
      return (
        <div className="flex items-center gap-1 text-amber-500 font-medium text-xs">
          <AlertCircle className="h-4 w-4" />
          <span>Needs training</span>
        </div>
      );
    default:
      return null;
  }
};

export const getToastMessageForSourceChange = (action: 'removed' | 'added' | 'modified', sourceName: string) => {
  switch (action) {
    case 'removed':
      return {
        title: "Knowledge source removed",
        description: `${sourceName} has been removed. Your agent needs retraining to update its knowledge.`,
        variant: "destructive" as const,
      };
    case 'added':
      return {
        title: "Knowledge source added",
        description: `${sourceName} has been added. Training is required for the agent to use this knowledge.`,
        variant: "default" as const,
      };
    case 'modified':
      return {
        title: "Knowledge source modified",
        description: `${sourceName} has been modified. Your agent needs retraining to update its knowledge.`,
        variant: "default" as const,
      };
    default:
      return {
        title: "Knowledge source updated",
        description: "Consider retraining your agent to update its knowledge.",
        variant: "default" as const,
      };
  }
};

export const getTrainingStatusToast = (status: 'start' | 'success' | 'error', sourceName: string) => {
  switch (status) {
    case 'start':
      return {
        title: "Training started",
        description: `${sourceName} is now being processed. This may take a few moments.`,
        variant: "default" as const,
      };
    case 'success':
      return {
        title: "Training complete",
        description: `${sourceName} has been trained successfully and is ready to use.`,
        variant: "default" as const,
      };
    case 'error':
      return {
        title: "Training failed",
        description: `Failed to train ${sourceName}. Please try again or check your source.`,
        variant: "destructive" as const,
      };
    default:
      return {
        title: "Training status update",
        description: `${sourceName} training status has changed.`,
        variant: "default" as const,
      };
  }
};

export const getRetrainingRequiredToast = () => {
  return {
    title: "Retraining required",
    description: "Your knowledge sources have changed. Please retrain your agent to apply these changes.",
    variant: "destructive" as const,
  };
};
