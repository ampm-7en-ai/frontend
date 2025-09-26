
import React from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import ModernButton from '@/components/dashboard/ModernButton';

interface PlainTextViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
}

const PlainTextViewerModal: React.FC<PlainTextViewerModalProps> = ({
  open,
  onOpenChange,
  title,
  content
}) => {
  return (
    <ModernModal
      open={open}
      onOpenChange={onOpenChange}
      title={`View Plain Text: ${title}`}
      description="Read-only view of the plain text content"
      size="4xl"
    >
      <div className="h-full">
        <ScrollArea className="h-[500px] w-full">
          <Textarea
            value={content}
            readOnly
            className="min-h-[480px] w-full resize-none text-sm leading-relaxed p-4 focus:outline-none focus:ring-0"
            placeholder="No content available"
          />
        </ScrollArea>
      </div>
    </ModernModal>
  );
};

export default PlainTextViewerModal;
