
import React, { useState } from 'react';
import { ApiKnowledgeBase, KnowledgeSource, KnowledgeSourceItem } from './types';
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
        size: "1.5 MB",
        lastUpdated: "2023-04-01",
        trainingStatus: 'success',
        knowledge_sources: [
          { 
            id: 2001, 
            title: "Employee Handbook.pdf", 
            type: "pdf", 
            url: null,
            metadata: { file_size: 1500000 } 
          }
        ]
      },
      {
        id: 1002,
        name: "Marketing Website",
        type: "website",
        size: "2.3 MB",
        lastUpdated: "2023-05-15",
        trainingStatus: 'success',
        knowledge_sources: [
          { 
            id: 2002, 
            title: "Marketing Site", 
            url: "https://example.com",
            metadata: { 
              sub_urls: {
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

  // Create a mapping of ApiKnowledgeSource to KnowledgeSource for the dialog
  const mapApiSourcesToKnowledgeSources = () => {
    return knowledgeBases.flatMap(kb => kb.knowledge_sources).map(source => ({
      id: source.id,
      name: source.title,
      type: source.metadata?.format || "unknown",
      size: typeof source.metadata?.file_size === 'number' 
        ? `${Math.round(source.metadata.file_size / 1024)} KB` 
        : "Unknown size",
      lastUpdated: source.metadata?.last_fetched || "Unknown",
      trainingStatus: source.status === "trained" ? "success" : "idle",
      url: source.url,
      file: source.file,
      title: source.title,
      metadata: source.metadata,
      knowledge_sources: source.sub_knowledge_sources || []
    }));
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
        currentSources={mapApiSourcesToKnowledgeSources()}
        onImport={handleImportSources}
        agentId={agentId}
      />
    </div>
  );
};

export default AgentKnowledgeContainer;
