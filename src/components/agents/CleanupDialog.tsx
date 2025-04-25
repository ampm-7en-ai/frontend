
import React, { useState } from 'react';
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
}

const CleanupDialog = ({ 
  open, 
  onOpenChange, 
  knowledgeSources,
  agentId,
}: CleanupDialogProps) => {
  const { toast } = useToast();
  const [isCleanupDone, setIsCleanupDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const problematicSources = knowledgeSources.filter(source => source.hasError || source.hasIssue);

  const handleCleanup = async () => {
    setIsLoading(true);
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
        title: "Cleanup successful",
        description: "Knowledge base has been cleaned up successfully.",
        variant: "default"
      });

      setIsCleanupDone(true);

    } catch (error) {
      toast({
        title: "Cleanup failed",
        description: error instanceof Error ? error.message : "An error occurred during cleanup.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrain = async () => {
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
        throw new Error(errorText || "Retrain request failed.");
      }

      toast({
        title: "Retraining started",
        description: "Agent retraining is running in the background.",
        variant: "default"
      });

      onOpenChange(false);

    } catch (error) {
      toast({
        title: "Retraining failed",
        description: error instanceof Error ? error.message : "An error occurred during retraining.",
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

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!isCleanupDone ? (
            <Button onClick={handleCleanup} disabled={isLoading}>
              {isLoading ? "Cleaning up..." : "Clean Up Knowledge Base"}
            </Button>
          ) : (
            <Button onClick={handleRetrain}>
              Retrain Agent
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CleanupDialog;
