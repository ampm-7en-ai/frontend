
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';
import AddSourcesModal from '@/components/agents/knowledge/AddSourcesModal';
import { useBuilder } from './BuilderContext';
import { useQueryClient } from '@tanstack/react-query';
import { addKnowledgeSourceToAgentCache } from '@/utils/knowledgeSourceCacheUtils';
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
      
      // Update agent cache with new sources
      newSources.forEach(source => {
        addKnowledgeSourceToAgentCache(queryClient, String(agentData.id), {
          id: source.id,
          title: source.title || source.name,
          type: source.type,
          status: source.status || 'active',
          url: source.url,
          created_at: source.created_at,
          updated_at: source.updated_at
        });
      });
      
      // Update local BuilderContext state with proper KnowledgeSource type
      const updatedKnowledgeSources: KnowledgeSource[] = [
        ...(agentData.knowledgeSources || []),
        ...newSources.map(source => ({
          id: source.id,
          name: source.title || source.name,
          type: source.type,
          size: 'N/A',
          lastUpdated: new Date().toLocaleDateString('en-GB'),
          trainingStatus: source.status || 'active' as const,
          linkBroken: false,
          knowledge_sources: [],
          metadata: {
            url: source.url,
            created_at: source.created_at,
            last_updated: source.updated_at
          }
        }))
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
