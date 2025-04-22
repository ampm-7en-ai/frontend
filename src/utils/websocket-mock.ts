
// This file provides mock implementations for WebSocket training status updates
// It's useful for development and testing when real WebSockets aren't available

import { useToast } from "@/hooks/use-toast";

// Mock training progress for an agent
export const mockAgentTrainingProgress = (
  agentId: string, 
  onComplete?: () => void
) => {
  const { toast } = useToast();
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    
    // Emit a toast notification to simulate a WebSocket message
    if (progress === 20) {
      toast({
        title: "Agent Training Update",
        description: "Preparing training data..."
      });
    } else if (progress === 50) {
      toast({
        title: "Agent Training Update",
        description: "Training model with your data..."
      });
    } else if (progress === 80) {
      toast({
        title: "Agent Training Update",
        description: "Optimizing agent responses..."
      });
    }
    
    if (progress >= 100) {
      clearInterval(interval);
      toast({
        title: "Agent Training Complete",
        description: "Your agent is now ready to use!"
      });
      if (onComplete) onComplete();
    }
  }, 1000);
  
  return () => clearInterval(interval);
};

// Mock training progress for a knowledge base
export const mockKnowledgeBaseTrainingProgress = (
  knowledgeBaseId: number, 
  knowledgeBaseName: string,
  onComplete?: () => void
) => {
  const { toast } = useToast();
  let progress = 0;
  const interval = setInterval(() => {
    progress += 15;
    
    // Emit a toast notification to simulate a WebSocket message
    if (progress === 30) {
      toast({
        title: "Knowledge Base Training Update",
        description: `Processing "${knowledgeBaseName}": Extracting data...`
      });
    } else if (progress === 60) {
      toast({
        title: "Knowledge Base Training Update",
        description: `Processing "${knowledgeBaseName}": Generating embeddings...`
      });
    }
    
    if (progress >= 100) {
      clearInterval(interval);
      toast({
        title: "Knowledge Base Training Complete",
        description: `"${knowledgeBaseName}" is now available for your agent!`
      });
      if (onComplete) onComplete();
    }
  }, 800);
  
  return () => clearInterval(interval);
};

// Utility function to simulate a WebSocket connection failure
export const simulateConnectionError = () => {
  const { toast } = useToast();
  setTimeout(() => {
    toast({
      title: "Connection Error",
      description: "Could not connect to the training server. Retrying...",
      variant: "destructive"
    });
  }, 500);
};
