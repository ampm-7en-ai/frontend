
import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { useAppTheme } from '@/hooks/useAppTheme';

interface AskAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId?: string | null;
}

export const AskAiModal = ({ isOpen, onClose, agentId }: AskAiModalProps) => {
  const { theme } = useAppTheme();
  
  // Use the provided agent ID or fallback to a default, include theme parameter
  const modalUrl = agentId 
    ? `${window.location.origin}/chat/preview/${agentId}?theme=${theme}`
    : `https://staging.7en.ai/chat/assistant/3?theme=${theme}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 gap-0 z-[100]">
        <iframe
          src={modalUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="microphone"
          className="w-full h-full rounded-2xl"
          title="Ask AI"
          key={`${agentId}-${theme}`} // Force reload when agent or theme changes
        />
      </DialogContent>
    </Dialog>
  );
};
