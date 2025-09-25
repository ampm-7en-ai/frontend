import React from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import ModernButton from '@/components/dashboard/ModernButton';
import KnowledgeUploadEngine from '@/components/knowledge/KnowledgeUploadEngine';

interface AddSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  onSuccess?: (response?: any) => void;
}

const AddSourcesModal: React.FC<AddSourcesModalProps> = ({
  isOpen,
  onClose,
  agentId,
  onSuccess
}) => {
  const handleSuccess = (sources: any[]) => {
    if (onSuccess) {
      onSuccess(sources[0]); // Pass first source for compatibility
    }
    onClose();
  };

  return (
    <ModernModal
      open={isOpen}
      onOpenChange={onClose}
      title="Add Knowledge Sources"
      description="Import content from various sources to enhance your agent's knowledge base. Choose from websites, documents, or third-party integrations."
      size="4xl"
      fixedFooter={true}
    >
      <div className='bg-white/80 dark:bg-neutral-900/70 p-4 px-6 backdrop-blur-sm border-0 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-slate-800/20 transition-colors duration-200'>
      <KnowledgeUploadEngine
        mode="modal"
        agentId={agentId}
        onSuccess={handleSuccess}
        onCancel={onClose}
        showAgentSelector={false}
        showBackButton={false}
        showTitle={false}
      />
      </div>
    </ModernModal>
  );
};

export default AddSourcesModal;
