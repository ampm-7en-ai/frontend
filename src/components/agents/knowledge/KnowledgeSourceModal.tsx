
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { KnowledgeSource } from './types';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, FileText, Globe, Database, Check } from 'lucide-react';

interface KnowledgeSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: KnowledgeSource[];
  initialSourceId: number | null;
  onSourceSelect?: (sourceId: number) => void;
}

const KnowledgeSourceModal = ({
  open,
  onOpenChange,
  sources,
  initialSourceId,
  onSourceSelect
}: KnowledgeSourceModalProps) => {
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(initialSourceId);

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

  const getSourceIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'webpage':
        return <Globe className="h-5 w-5 text-green-500" />;
      case 'database':
        return <Database className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'error') {
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    } else if (status === 'success') {
      return <Check className="h-5 w-5 text-green-500" />;
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden p-0" fixedFooter>
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Knowledge Source Details</DialogTitle>
        </DialogHeader>
        
        <DialogBody className="flex flex-col md:flex-row gap-4 p-6">
          {/* Source list */}
          <div className="w-full md:w-1/3 overflow-y-auto max-h-[300px] md:max-h-none">
            <div className="space-y-2">
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
          </div>
          
          {/* Source details */}
          <div className="flex-1 overflow-y-auto">
            {currentSource ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{currentSource.name}</h3>
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
            ) : (
              <p className="text-muted-foreground">
                {sources.length ? "Select a source to view details" : "No knowledge sources available"}
              </p>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeSourceModal;
