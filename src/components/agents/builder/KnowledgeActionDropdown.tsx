
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';
import AddSourcesModal from '@/components/agents/knowledge/AddSourcesModal';
import { useBuilder } from './BuilderContext';
import { useQueryClient } from '@tanstack/react-query';
import { addKnowledgeSourceToAgentCache, transformApiSourceToUI } from '@/utils/knowledgeSourceCacheUtils';
import { KnowledgeSource } from '@/components/agents/knowledge/types';

export const KnowledgeActionDropdown = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;
  const queryClient = useQueryClient();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadSuccess = (response?: any) => {
    setShowUploadModal(false);
    
    console.log('🎉 Upload success response:', response);
    
    if (response?.data && agentData.id) {
      // The response.data contains the new knowledge source from the API
      const newSource = response.data;
      console.log('🎉 New source from API:', newSource);
      
      // Update agent cache with new source using the API response structure
      addKnowledgeSourceToAgentCache(queryClient, String(agentData.id), newSource);
      
      // Transform the API response to UI format for local state
      const transformedSource: KnowledgeSource = transformApiSourceToUI(newSource);
      console.log('🔄 Transformed source for UI:', transformedSource);
      
      const updatedKnowledgeSources: KnowledgeSource[] = [
        ...(agentData.knowledgeSources || []),
        transformedSource
      ];
      
      updateAgentData({ knowledgeSources: updatedKnowledgeSources });
      console.log('✅ Local agent data updated with new source');
    }
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
