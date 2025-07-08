
import React, { useState, useEffect } from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { KnowledgeSource } from './types';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, FileText, Globe, Database, Check, Trash2, ExternalLink } from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KnowledgeSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: KnowledgeSource[];
  initialSourceId: number | null;
  agentId?: string;
  onSourceSelect?: (sourceId: number) => void;
  onSourceDelete?: (sourceId: number) => void;
}

const KnowledgeSourceModal = ({
  open,
  onOpenChange,
  sources,
  initialSourceId,
  agentId,
  onSourceSelect,
  onSourceDelete
}: KnowledgeSourceModalProps) => {
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(initialSourceId);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Update the selected source when initialSourceId changes
  useEffect(() => {
    setSelectedSourceId(initialSourceId);
  }, [initialSourceId]);

  // Reset state when modal closes to prevent freezing
  useEffect(() => {
    if (!open) {
      setShowDeleteDialog(false);
    }
  }, [open]);

  const currentSource = selectedSourceId !== null 
    ? sources.find(source => source.id === selectedSourceId) 
    : null;

  const handleSourceClick = (sourceId: number) => {
    setSelectedSourceId(sourceId);
    if (onSourceSelect) {
      onSourceSelect(sourceId);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedSourceId && onSourceDelete) {
      onSourceDelete(selectedSourceId);
      setShowDeleteDialog(false);
      // Close modal after deletion
      onOpenChange(false);
    }
  };

  const handleModalClose = () => {
    setSelectedSourceId(null);
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  const getSourceIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'website':
        return <Globe className="h-5 w-5 text-green-500" />;
      case 'document':
      case 'pdf':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'csv':
        return <Database className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'error') {
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    } else if (status === 'success' || status === 'Active') {
      return <Check className="h-5 w-5 text-green-500" />;
    }
    return null;
  };

  const renderSourceFiles = (source: KnowledgeSource) => {
    if (!source.knowledge_sources || source.knowledge_sources.length === 0) {
      return <p className="text-sm text-slate-400 dark:text-slate-400">No files available</p>;
    }

    // Filter to show only selected/imported files
    const selectedFiles = source.knowledge_sources.filter(file => 
      file.is_selected !== false // Show files that are selected or don't have selection status
    );

    if (selectedFiles.length === 0) {
      return <p className="text-sm text-slate-400 dark:text-slate-400">No selected files</p>;
    }

    return (
      <div className="space-y-2">
        {selectedFiles.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <span className="text-sm text-slate-700 dark:text-slate-200">{file.title || `File ${index + 1}`}</span>
            </div>
            {file.url && (
              <ModernButton
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8"
                onClick={() => window.open(file.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </ModernButton>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSourceUrls = (source: KnowledgeSource) => {
    const firstSource = source.knowledge_sources?.[0];
    if (!firstSource?.metadata?.sub_urls?.children) {
      return <p className="text-sm text-slate-400 dark:text-slate-400">No URLs available</p>;
    }

    // Filter to show only selected URLs
    const selectedUrls = firstSource.metadata.sub_urls.children.filter(url => url.is_selected === true);
    
    if (selectedUrls.length === 0) {
      return <p className="text-sm text-slate-400 dark:text-slate-400">No selected URLs</p>;
    }

    return (
      <div className="space-y-2">
        {selectedUrls.map((url, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Globe className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{url.url}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {url.chars && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {url.chars.toLocaleString()} chars
                </span>
              )}
              <ModernButton
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8"
                onClick={() => window.open(url.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </ModernButton>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <ModernModal
        open={open}
        onOpenChange={handleModalClose}
        title="Knowledge Source Details"
        size="6xl"
        className="h-[90vh]"
        fixedFooter
      >
        <div className="flex flex-col md:flex-row gap-6 h-full">
          {/* Source list */}
          <div className="w-full md:w-1/3">
            <ScrollArea className="h-[400px] md:h-[500px]">
              <div className="space-y-3 pr-4">
                {sources.map(source => (
                  <Card 
                    key={source.id} 
                    className={`p-4 cursor-pointer transition-all hover:shadow-md bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600/50 ${
                      selectedSourceId === source.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-500/10' : ''
                    }`}
                    onClick={() => handleSourceClick(source.id)}
                  >
                    <div className="flex items-center gap-3">
                      {getSourceIcon(source.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-slate-900 dark:text-slate-100">{source.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{source.type} • {source.size}</p>
                      </div>
                      {source.trainingStatus === 'training' && source.progress !== undefined && (
                        <Progress value={source.progress} className="h-2 w-16" />
                      )}
                      {getStatusIcon(source.trainingStatus)}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Source details */}
          <div className="flex-1">
            {currentSource ? (
              <ScrollArea className="h-[500px]">
                <div className="space-y-6 pr-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">{currentSource.name}</h3>
                    <ModernButton 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                      icon={Trash2}
                      onClick={handleDeleteClick}
                    >
                      Delete
                    </ModernButton>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Type:</p>
                      <p className="text-slate-900 dark:text-slate-100 font-medium">{currentSource.type}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Size:</p>
                      <p className="text-slate-900 dark:text-slate-100 font-medium">{currentSource.size}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Last Updated:</p>
                      <p className="text-slate-900 dark:text-slate-100 font-medium">{currentSource.lastUpdated}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Status:</p>
                      <p className="text-slate-900 dark:text-slate-100 font-medium">{currentSource.trainingStatus}</p>
                    </div>
                    {currentSource.metadata?.no_of_chars && (
                      <div className="col-span-2">
                        <p className="text-slate-500 dark:text-slate-400">Characters:</p>
                        <p className="text-slate-900 dark:text-slate-100 font-medium">{currentSource.metadata.no_of_chars.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <h4 className="text-md font-medium mb-4 text-slate-900 dark:text-slate-100">
                      {currentSource.type.toLowerCase() === 'website' ? 'Selected URLs' : 'Selected Files'}
                    </h4>
                    {currentSource.type.toLowerCase() === 'website' 
                      ? renderSourceUrls(currentSource)
                      : renderSourceFiles(currentSource)
                    }
                  </div>

                  {currentSource.content && (
                    <div className="mt-6">
                      <h4 className="text-md font-medium mb-3 text-slate-900 dark:text-slate-100">Content Preview</h4>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl overflow-auto max-h-[300px] whitespace-pre-wrap border border-slate-200 dark:border-slate-700/50">
                        <pre className="text-slate-700 dark:text-slate-300 text-sm">{currentSource.content}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-[500px]">
                <p className="text-slate-500 dark:text-slate-400">
                  {sources.length ? "Select a source to view details" : "No knowledge sources available"}
                </p>
              </div>
            )}
          </div>
        </div>
      </ModernModal>

      <ModernModal
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Knowledge Source"
        description={`Are you sure you want to delete "${currentSource?.name}"? This action cannot be undone.`}
        size="md"
        footer={
          <div className="flex gap-3">
            <ModernButton variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </ModernButton>
            <ModernButton 
              variant="gradient" 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </ModernButton>
          </div>
        }
      >
        <div className="py-4">
          <p className="text-slate-600 dark:text-slate-400">
            This will permanently remove the knowledge source from your agent. All associated data will be lost.
          </p>
        </div>
      </ModernModal>
    </>
  );
};

export default KnowledgeSourceModal;
