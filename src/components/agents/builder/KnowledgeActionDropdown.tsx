
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

  const handleUploadSuccess = (newSources?: any[]) => {
    setShowUploadModal(false);
    
    if (newSources && newSources.length > 0 && agentData.id) {
      console.log('🎉 New sources added via modal:', newSources);
      
      // Update agent cache with new sources using the real API structure
      newSources.forEach(source => {
        // Use the API response structure directly for cache
        addKnowledgeSourceToAgentCache(queryClient, String(agentData.id), source);
      });
      
      // Update local BuilderContext state with properly transformed sources
      const transformedSources: KnowledgeSource[] = newSources.map(source => transformApiSourceToUI(source));
      
      const updatedKnowledgeSources: KnowledgeSource[] = [
        ...(agentData.knowledgeSources || []),
        ...transformedSources
      ];
      
      updateAgentData({ knowledgeSources: updatedKnowledgeSources });
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
