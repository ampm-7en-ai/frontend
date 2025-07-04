
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { KnowledgeSource } from './types';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, FileText, Globe, Database, Check, Trash2, ExternalLink } from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
          <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 dark:bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-slate-200 dark:text-slate-200">{file.title || `File ${index + 1}`}</span>
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
          <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 dark:bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Globe className="h-4 w-4 text-green-400 flex-shrink-0" />
              <span className="text-sm text-slate-200 dark:text-slate-200 truncate">{url.url}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {url.chars && (
                <span className="text-xs text-slate-400 dark:text-slate-400">
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
      <Dialog open={open} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden p-0 bg-slate-900/95 dark:bg-slate-900/95 border-slate-700/50" fixedFooter>
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-white dark:text-white">Knowledge Source Details</DialogTitle>
          </DialogHeader>
          
          <DialogBody className="flex flex-col md:flex-row gap-4 p-6">
            {/* Source list */}
            <div className="w-full md:w-1/3">
              <ScrollArea className="h-[300px] md:h-[400px]">
                <div className="space-y-2 pr-4">
                  {sources.map(source => (
                    <Card 
                      key={source.id} 
                      className={`p-3 cursor-pointer transition-all hover:shadow-md bg-slate-800/50 dark:bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50 ${
                        selectedSourceId === source.id ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''
                      }`}
                      onClick={() => handleSourceClick(source.id)}
                    >
                      <div className="flex items-center gap-3">
                        {getSourceIcon(source.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-slate-200 dark:text-slate-200">{source.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-400">{source.type} • {source.size}</p>
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
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4 pr-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-white dark:text-white">{currentSource.name}</h3>
                      <ModernButton 
                        variant="outline" 
                        size="sm"
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 hover:border-red-500/50"
                        icon={Trash2}
                        onClick={handleDeleteClick}
                      >
                        Delete
                      </ModernButton>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-400 dark:text-slate-400">Type:</p>
                        <p className="text-slate-200 dark:text-slate-200">{currentSource.type}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 dark:text-slate-400">Size:</p>
                        <p className="text-slate-200 dark:text-slate-200">{currentSource.size}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 dark:text-slate-400">Last Updated:</p>
                        <p className="text-slate-200 dark:text-slate-200">{currentSource.lastUpdated}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 dark:text-slate-400">Status:</p>
                        <p className="text-slate-200 dark:text-slate-200">{currentSource.trainingStatus}</p>
                      </div>
                      {currentSource.metadata?.no_of_chars && (
                        <div>
                          <p className="text-slate-400 dark:text-slate-400">Characters:</p>
                          <p className="text-slate-200 dark:text-slate-200">{currentSource.metadata.no_of_chars.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <h4 className="text-md font-medium mb-3 text-white dark:text-white">
                        {currentSource.type.toLowerCase() === 'website' ? 'Selected URLs' : 'Selected Files'}
                      </h4>
                      {currentSource.type.toLowerCase() === 'website' 
                        ? renderSourceUrls(currentSource)
                        : renderSourceFiles(currentSource)
                      }
                    </div>

                    {currentSource.content && (
                      <div className="mt-4">
                        <h4 className="text-md font-medium mb-2 text-white dark:text-white">Content Preview</h4>
                        <div className="bg-slate-800/50 dark:bg-slate-800/50 p-4 rounded-lg overflow-auto max-h-[300px] whitespace-pre-wrap border border-slate-700/50">
                          <pre className="text-slate-200 dark:text-slate-200 text-sm">{currentSource.content}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-slate-400 dark:text-slate-400">
                    {sources.length ? "Select a source to view details" : "No knowledge sources available"}
                  </p>
                </div>
              )}
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-900/95 dark:bg-slate-900/95 border-slate-700/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white dark:text-white">Delete Knowledge Source</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 dark:text-slate-400">
              Are you sure you want to delete "{currentSource?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default KnowledgeSourceModal;
