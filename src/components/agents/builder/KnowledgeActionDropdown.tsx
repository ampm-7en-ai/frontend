
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';
import AddSourcesModal from '@/components/agents/knowledge/AddSourcesModal';
import { useBuilder } from './BuilderContext';

export const KnowledgeActionDropdown = () => {
  const { state } = useBuilder();
  const { agentData } = state;
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    // Refresh agent data could be handled here if needed
  };

  return (
    <>
      <ModernButton
        variant="outline"
        size="sm"
        icon={Plus}
        iconOnly
        className="h-9 w-9"
        onClick={() => setShowUploadModal(true)}
      />

      {/* Add Sources Modal */}
      <AddSourcesModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        agentId={agentData.id?.toString() || ''}
        onSuccess={handleUploadSuccess}
      />
    </>
  );
};
