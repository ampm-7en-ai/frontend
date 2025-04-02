
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
  // Placeholder implementation
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Knowledge Source Details</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">
            {sources.length} knowledge sources available.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeSourceModal;
