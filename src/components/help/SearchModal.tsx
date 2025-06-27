
import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 gap-0">
        <iframe
          src="http://localhost:8080/chat/preview/3"
          width="100%"
          height="100%"
          frameBorder="0"
          allow="microphone"
          className="w-full h-full rounded-2xl"
          title="Ask AI"
        />
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
