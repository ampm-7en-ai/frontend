
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
    
    // Handle different response formats
    let responseData = response;
    
    // If response has a data property, use that
    if (response && response.data) {
      responseData = response.data;
      console.log('📦 Using response.data:', responseData);
    }
    // If response itself is the data (direct API response)
    else if (response && response.id) {
      responseData = response;
      console.log('📦 Using direct response:', responseData);
    }
    // If no valid response data
    else {
      console.warn('⚠️ No valid response data received:', response);
      return;
    }
    
    if (responseData && agentData.id) {
      console.log('🎯 Processing new knowledge source:', responseData);
      
      // Update agent cache with new source using the response data
      addKnowledgeSourceToAgentCache(queryClient, String(agentData.id), responseData);
      
      // Transform the response to UI format for local state
      const transformedSource: KnowledgeSource = transformApiSourceToUI(responseData);
      console.log('🔄 Transformed source for UI:', transformedSource);
      
      const updatedKnowledgeSources: KnowledgeSource[] = [
        ...(agentData.knowledgeSources || []),
        transformedSource
      ];
      
      updateAgentData({ knowledgeSources: updatedKnowledgeSources });
      console.log('✅ Local agent data updated with new source');
    } else {
      console.warn('⚠️ Missing agentData.id or responseData:', { 
        agentId: agentData.id, 
        responseData 
      });
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
