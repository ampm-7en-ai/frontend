
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle>Ask AI</DialogTitle>
        </DialogHeader>
        <div className="flex-1 w-full h-full">
          <iframe
            src="https://www.perplexity.ai"
            className="w-full h-full border-0 rounded-lg"
            title="Ask AI"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
