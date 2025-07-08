
import React from 'react';
import { ModernModal } from '@/components/ui/modern-modal';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  return (
    <ModernModal
      open={isOpen}
      onOpenChange={onClose}
      title="Search Assistant"
      size="6xl"
      className="h-[90vh] p-0 gap-0"
    >
      <iframe
        src="http://localhost:8080/chat/assistant/3"
        width="100%"
        height="100%"
        frameBorder="0"
        allow="microphone"
        className="w-full h-full rounded-2xl"
        title="Ask AI"
      />
    </ModernModal>
  );
};

export default SearchModal;
