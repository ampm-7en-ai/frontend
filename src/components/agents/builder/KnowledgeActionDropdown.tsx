
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
    console.log('🎉 Raw upload success response received:', response);
    setShowUploadModal(false);
    
    // The response should have this structure:
    // { message: "...", data: { id, title, etc... }, status: "success" }
    let sourceData = null;
    
    if (response && response.data) {
      // Response has data property - use it
      sourceData = response.data;
      console.log('📦 Using response.data:', sourceData);
    } else if (response && response.id) {
      // Response is the data itself (fallback)
      sourceData = response;
      console.log('📦 Using direct response as data:', sourceData);
    } else {
      console.warn('⚠️ No valid response data received:', response);
      return;
    }
    
    if (sourceData && agentData.id) {
      console.log('🎯 Processing new knowledge source with data:', sourceData);
      
      // Update agent cache with new source
      addKnowledgeSourceToAgentCache(queryClient, String(agentData.id), sourceData);
      
      // Transform the source data to UI format for local state
      const transformedSource: KnowledgeSource = transformApiSourceToUI(sourceData);
      console.log('🔄 Transformed source for UI:', transformedSource);
      
      if (transformedSource) {
        const updatedKnowledgeSources: KnowledgeSource[] = [
          ...(agentData.knowledgeSources || []),
          transformedSource
        ];
        
        updateAgentData({ knowledgeSources: updatedKnowledgeSources });
        console.log('✅ Local agent data updated with new source');
      }
    } else {
      console.warn('⚠️ Missing agentData.id or sourceData:', { 
        agentId: agentData.id, 
        sourceData 
      });
    }
  };

  return (
    <>
      <ModernButton
        variant="outline"
        size="sm"
        icon={Plus}
        className="h-7 !px-2"
        onClick={() => setShowUploadModal(true)}
      >
        Add
      </ModernButton>

      {/* Add Sources Modal */}
      {
        showUploadModal && (
          <AddSourcesModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            agentId={agentData.id?.toString() || ''}
            onSuccess={handleUploadSuccess}
          />
        )
      }
      
    </>
  );
};
