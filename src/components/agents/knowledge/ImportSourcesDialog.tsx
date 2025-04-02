
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KnowledgeSource } from './types';

interface ImportSourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  externalSources: KnowledgeSource[];  // Changed from ProcessedSource[] to KnowledgeSource[]
  currentSources: KnowledgeSource[];   // Changed from ProcessedSource[] to KnowledgeSource[]
  onImport: (sourceIds: number[]) => void;
}

export const ImportSourcesDialog = ({
  isOpen,
  onOpenChange,
  externalSources,
  currentSources,
  onImport,
}: ImportSourcesDialogProps) => {
  // Placeholder implementation
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Knowledge Sources</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <p className="text-muted-foreground mb-4">Select knowledge sources to import.</p>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
              Cancel
            </Button>
            <Button onClick={() => onImport([])}>Import Selected</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
