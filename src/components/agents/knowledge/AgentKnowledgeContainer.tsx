
import React, { useState } from 'react';
import { ApiKnowledgeBase, KnowledgeSource } from './types';
import KnowledgeSourceList from './KnowledgeSourceList';
import { Button } from '@/components/ui/button';
import { ImportSourcesDialog } from './ImportSourcesDialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AgentKnowledgeContainerProps {
  agentId: string;
  knowledgeBases: ApiKnowledgeBase[];
  isLoading?: boolean;
}

const AgentKnowledgeContainer: React.FC<AgentKnowledgeContainerProps> = ({
  agentId,
  knowledgeBases,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [externalSources, setExternalSources] = useState<KnowledgeSource[]>([]);
  
  // Placeholder for external sources that would normally come from an API call
  const handleOpenImportDialog = () => {
    // In a real implementation, this would fetch external sources from an API
    // For now, let's create some mock data
    const mockExternalSources: KnowledgeSource[] = [
      {
        id: 1001,
        name: "Corporate Documentation",
        type: "docs",
        knowledge_sources: [
          { id: 2001, title: "Employee Handbook.pdf", type: "pdf", metadata: { file_size: 1500000 } }
        ]
      },
      {
        id: 1002,
        name: "Marketing Website",
        type: "website",
        knowledge_sources: [
          { 
            id: 2002, 
            title: "Marketing Site", 
            metadata: { 
              sub_urls: {
                url: "root",
                key: "root-key",
                children: [
                  { url: "https://example.com/home", key: "home-key", is_selected: true },
                  { url: "https://example.com/products", key: "products-key", is_selected: false }
                ]
              }
            }
          }
        ]
      }
    ];
    
    setExternalSources(mockExternalSources);
    setIsImportDialogOpen(true);
  };
  
  const handleImportSources = (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>, selectedFiles?: Record<number, Set<string>>) => {
    toast({
      title: "Sources imported",
      description: `${sourceIds.length} knowledge sources were imported successfully.`,
    });
    
    // In a real implementation, this would update the knowledgeBases state with the newly imported sources
    setIsImportDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Knowledge Sources</h2>
        <Button 
          onClick={handleOpenImportDialog}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Import Knowledge
        </Button>
      </div>
      
      <KnowledgeSourceList 
        knowledgeBases={knowledgeBases}
        isLoading={isLoading}
      />
      
      <ImportSourcesDialog
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        externalSources={externalSources}
        currentSources={knowledgeBases.flatMap(kb => kb.knowledge_sources)}
        onImport={handleImportSources}
        agentId={agentId}
      />
    </div>
  );
};

export default AgentKnowledgeContainer;
