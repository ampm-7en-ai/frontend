
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { KnowledgeSource } from './types';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, FileText, Globe, Database, Check, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    }
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
      return <p className="text-sm text-muted-foreground">No files available</p>;
    }

    return (
      <div className="space-y-2">
        {source.knowledge_sources.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{file.title || `File ${index + 1}`}</span>
            </div>
            {file.url && (
              <a 
                href={file.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSourceUrls = (source: KnowledgeSource) => {
    const firstSource = source.knowledge_sources?.[0];
    if (!firstSource?.metadata?.sub_urls?.children) {
      return <p className="text-sm text-muted-foreground">No URLs available</p>;
    }

    const selectedUrls = firstSource.metadata.sub_urls.children.filter(url => url.is_selected);
    
    if (selectedUrls.length === 0) {
      return <p className="text-sm text-muted-foreground">No selected URLs</p>;
    }

    return (
      <div className="space-y-2">
        {selectedUrls.map((url, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-500" />
              <span className="text-sm truncate">{url.url}</span>
            </div>
            <div className="flex items-center gap-2">
              {url.chars && (
                <span className="text-xs text-muted-foreground">
                  {url.chars.toLocaleString()} chars
                </span>
              )}
              <a 
                href={url.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden p-0" fixedFooter>
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Knowledge Source Details</DialogTitle>
          </DialogHeader>
          
          <DialogBody className="flex flex-col md:flex-row gap-4 p-6">
            {/* Source list */}
            <div className="w-full md:w-1/3">
              <ScrollArea className="h-[300px] md:h-[400px]">
                <div className="space-y-2 pr-4">
                  {sources.map(source => (
                    <Card 
                      key={source.id} 
                      className={`p-3 cursor-pointer transition-all hover:shadow-md ${selectedSourceId === source.id ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                      onClick={() => handleSourceClick(source.id)}
                    >
                      <div className="flex items-center gap-3">
                        {getSourceIcon(source.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{source.name}</p>
                          <p className="text-xs text-muted-foreground">{source.type} • {source.size}</p>
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
                      <h3 className="text-lg font-medium">{currentSource.name}</h3>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleDeleteClick}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Type:</p>
                        <p>{currentSource.type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Size:</p>
                        <p>{currentSource.size}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Updated:</p>
                        <p>{currentSource.lastUpdated}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status:</p>
                        <p>{currentSource.trainingStatus}</p>
                      </div>
                      {currentSource.metadata?.no_of_chars && (
                        <div>
                          <p className="text-muted-foreground">Characters:</p>
                          <p>{currentSource.metadata.no_of_chars.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <h4 className="text-md font-medium mb-2">
                        {currentSource.type.toLowerCase() === 'website' ? 'Selected URLs' : 'Files'}
                      </h4>
                      {currentSource.type.toLowerCase() === 'website' 
                        ? renderSourceUrls(currentSource)
                        : renderSourceFiles(currentSource)
                      }
                    </div>

                    {currentSource.content && (
                      <div className="mt-4">
                        <h4 className="text-md font-medium mb-2">Content Preview</h4>
                        <div className="bg-muted p-4 rounded-md overflow-auto max-h-[300px] whitespace-pre-wrap">
                          {currentSource.content}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground">
                  {sources.length ? "Select a source to view details" : "No knowledge sources available"}
                </p>
              )}
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Knowledge Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{currentSource?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
