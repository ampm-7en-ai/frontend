
import React from 'react';
import { FileText, Globe, FileSpreadsheet, File, Database, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { KnowledgeSource } from './types';

// This function renders the appropriate icon based on source type
export const renderSourceIcon = (sourceType: string) => {
  switch (sourceType) {
    case 'pdf':
      return <FileText className="h-4 w-4 mr-2 text-red-600" />;
    case 'docx':
      return <FileText className="h-4 w-4 mr-2 text-blue-600" />;
    case 'website':
      return <Globe className="h-4 w-4 mr-2 text-green-600" />;
    case 'csv':
      return <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />;
    case 'plain_text':
      return <File className="h-4 w-4 mr-2 text-purple-600" />;
    case 'database':
      return <Database className="h-4 w-4 mr-2 text-orange-600" />;
    default:
      return <File className="h-4 w-4 mr-2 text-gray-600" />;
  }
};

// Alias for renderSourceIcon for consistency
export const getSourceTypeIcon = renderSourceIcon;

// This function returns the appropriate status indicator component
export const getStatusIndicator = (source: KnowledgeSource) => {
  if (source.trainingStatus === 'success') {
    return (
      <>
        <CheckCircle className="h-4 w-4 text-green-600 mr-1.5" />
        <span className="text-sm">Trained</span>
      </>
    );
  } else if (source.trainingStatus === 'error') {
    return (
      <>
        <AlertCircle className="h-4 w-4 text-red-600 mr-1.5" />
        <span className="text-sm">Error</span>
      </>
    );
  } else if (source.linkBroken) {
    return (
      <>
        <AlertCircle className="h-4 w-4 text-orange-600 mr-1.5" />
        <span className="text-sm">Broken Link</span>
      </>
    );
  } else {
    return (
      <>
        <Clock className="h-4 w-4 text-amber-500 mr-1.5" />
        <span className="text-sm">Pending</span>
      </>
    );
  }
};

// Toast configuration for source changes
export const getToastMessageForSourceChange = (actionType: 'added' | 'removed' | 'updated', sourceName: string) => {
  const title = actionType === 'added' 
    ? "Knowledge source added" 
    : actionType === 'removed' 
      ? "Knowledge source removed" 
      : "Knowledge source updated";
  
  const description = actionType === 'added'
    ? `"${sourceName}" has been added to your knowledge base.`
    : actionType === 'removed'
      ? `"${sourceName}" has been removed from your knowledge base.`
      : `"${sourceName}" has been updated.`;
  
  const variant = actionType === 'removed' ? "destructive" as const : undefined;
  
  return {
    title,
    description,
    variant
  };
};

// Toast configuration for training status changes
export const getTrainingStatusToast = (
  status: 'start' | 'success' | 'error',
  sourceName: string
) => {
  switch (status) {
    case 'start':
      return {
        title: "Training started",
        description: `Processing "${sourceName}". This may take a moment.`,
      };
    case 'success':
      return {
        title: "Training complete",
        description: `"${sourceName}" has been successfully processed and is ready to use.`,
      };
    case 'error':
      return {
        title: "Training failed",
        description: `There was a problem processing "${sourceName}". Please try again.`,
        variant: "destructive" as const,
      };
    default:
      return {
        title: "Training update",
        description: `Status update for "${sourceName}".`,
      };
  }
};

// Toast for retraining notification
export const getRetrainingRequiredToast = (count: number) => {
  return {
    title: "Retraining required",
    description: `${count} knowledge source${count !== 1 ? 's' : ''} ${count !== 1 ? 'have' : 'has'} been updated and ${count !== 1 ? 'require' : 'requires'} retraining.`,
    variant: "warning" as const,
  };
};
