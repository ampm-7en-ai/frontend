
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KnowledgeSource } from './types';

interface KnowledgeSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: KnowledgeSource[];
  initialSourceId: number | null;
}

const KnowledgeSourceModal = ({
  open,
  onOpenChange,
  sources,
  initialSourceId
}: KnowledgeSourceModalProps) => {
  // Simple placeholder implementation
  const currentSource = initialSourceId !== null 
    ? sources.find(source => source.id === initialSourceId) 
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Knowledge Source Details</DialogTitle>
        </DialogHeader>
        <div className="py-4">
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
              {sources.length} knowledge sources available. Select a source to view details.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeSourceModal;
