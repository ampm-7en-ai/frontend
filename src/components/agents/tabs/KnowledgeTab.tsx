
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Import } from 'lucide-react';
import EnhancedKnowledgeTraining from '@/components/agents/EnhancedKnowledgeTraining';
import { KnowledgeSource } from '@/hooks/useKnowledgeSources';

interface KnowledgeTabProps {
  selectedKnowledgeSources: KnowledgeSource[];
  onKnowledgeSourcesChange: (selectedSourceIds: number[]) => void;
}

const KnowledgeTab = ({ 
  selectedKnowledgeSources, 
  onKnowledgeSourcesChange 
}: KnowledgeTabProps) => {
  return (
    <div className="space-y-6">
      <EnhancedKnowledgeTraining 
        initialSources={selectedKnowledgeSources}
        onSourcesChange={onKnowledgeSourcesChange}
      />
    </div>
  );
};

export default KnowledgeTab;
