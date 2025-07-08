
import React from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
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
    <ModernModal
      open={isOpen}
      onOpenChange={onClose}
      title="Ask AI Assistant"
      size="6xl"
      className="h-[90vh] p-0 gap-0"
    >
      <iframe
        src={modalUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        allow="microphone"
        className="w-full h-full rounded-2xl"
        title="Ask AI"
        key={`${agentId}-${theme}`}
      />
    </ModernModal>
  );
};
