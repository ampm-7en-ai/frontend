
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KnowledgeSource } from '@/components/agents/knowledge/types';
import KnowledgeSourceBadge from './KnowledgeSourceBadge';
import { useToast } from "@/hooks/use-toast";
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';

interface CleanupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knowledgeSources: KnowledgeSource[];
  agentId: string;
  onCleanupComplete: () => void;
}

const CleanupDialog = ({ 
  open, 
  onOpenChange, 
  knowledgeSources,
  agentId,
  onCleanupComplete 
}: CleanupDialogProps) => {
  const { toast } = useToast();
  const problematicSources = knowledgeSources.filter(source => source.hasError || source.hasIssue);

  const handleCleanup = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${BASE_URL}agents/${agentId}/retrain/`, {
        method: "POST",
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Cleanup request failed.");
      }

      toast({
        title: "Cleanup initiated",
        description: "Knowledge base cleanup is in progress.",
        variant: "default"
      });

      onCleanupComplete();
      onOpenChange(false);

    } catch (error) {
      toast({
        title: "Cleanup failed",
        description: error instanceof Error ? error.message : "An error occurred during cleanup.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Knowledge Base Cleanup Required</DialogTitle>
          <DialogDescription>
            The following knowledge sources need to be cleaned up before retraining:
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-wrap gap-2 py-4">
          {problematicSources.map((source) => (
            <KnowledgeSourceBadge key={source.id} source={source} />
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCleanup}>
            Clean Up Knowledge Base
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CleanupDialog;
