
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
    
    if (!agentData.id) {
      console.warn('⚠️ No agent ID available');
      return;
    }
    
    // Handle response.data as array (API returns array of sources)
    let sourcesArray: any[] = [];
    
    if (response && Array.isArray(response.data)) {
      // Response has data as array - use it
      sourcesArray = response.data;
      console.log('📦 Using response.data array:', sourcesArray);
    } else if (response && response.data) {
      // Response has single data object - wrap in array
      sourcesArray = [response.data];
      console.log('📦 Wrapped single response.data in array:', sourcesArray);
    } else if (response && response.id) {
      // Response is the data itself - wrap in array
      sourcesArray = [response];
      console.log('📦 Wrapped direct response in array:', sourcesArray);
    } else {
      console.warn('⚠️ No valid response data received:', response);
      return;
    }
    
    if (sourcesArray.length > 0) {
      console.log(`🎯 Processing ${sourcesArray.length} new knowledge source(s)`);
      
      const transformedSources: KnowledgeSource[] = [];
      
      // Process each source
      sourcesArray.forEach(sourceData => {
        // Update agent cache with new source
        addKnowledgeSourceToAgentCache(queryClient, String(agentData.id), sourceData);
        
        // Transform the source data to UI format for local state
        const transformedSource: KnowledgeSource = transformApiSourceToUI(sourceData);
        console.log('🔄 Transformed source for UI:', transformedSource);
        
        if (transformedSource) {
          transformedSources.push(transformedSource);
        }
      });
      
      if (transformedSources.length > 0) {
        const updatedKnowledgeSources: KnowledgeSource[] = [
          ...(agentData.knowledgeSources || []),
          ...transformedSources
        ];
        
        updateAgentData({ knowledgeSources: updatedKnowledgeSources });
        console.log(`✅ Local agent data updated with ${transformedSources.length} new source(s)`);
      }
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
