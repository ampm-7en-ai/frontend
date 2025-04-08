
import React, { useState } from 'react';
import { ApiKnowledgeBase, KnowledgeSource, KnowledgeSourceItem } from './types';
import KnowledgeSourceList from './KnowledgeSourceList';
import { Button } from '@/components/ui/button';
import { ImportSourcesDialog } from './ImportSourcesDialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchExternalKnowledgeSources } from '@/utils/api-config';

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
  const [isLoadingExternalSources, setIsLoadingExternalSources] = useState(false);
  
  const handleOpenImportDialog = async () => {
    setIsLoadingExternalSources(true);
    try {
      // Fetch from correct endpoint with agentId
      const response = await fetchExternalKnowledgeSources(agentId);
      
      // Transform API response to KnowledgeSource format
      const transformedSources = response.map((source: any) => {
        let sourceType = source.type || "unknown";
        if (source.url) sourceType = "website";
        if (source.file?.endsWith('.pdf')) sourceType = "pdf";
        if (source.file?.endsWith('.csv')) sourceType = "csv";
        if (source.file?.endsWith('.docx')) sourceType = "docx";
        
        return {
          id: source.id,
          name: source.title || source.name || "Untitled Source",
          type: sourceType,
          size: typeof source.metadata?.file_size === 'number' 
            ? `${Math.round(source.metadata.file_size / 1024)} KB` 
            : "Unknown size",
          lastUpdated: source.metadata?.last_fetched || "Unknown",
          trainingStatus: 'success' as const,
          knowledge_sources: Array.isArray(source.sub_knowledge_sources) 
            ? source.sub_knowledge_sources.map((subSource: any) => ({
                id: subSource.id,
                title: subSource.title,
                type: subSource.type || sourceType,
                url: subSource.url || null,
                metadata: subSource.metadata || {}
              }))
            : []
        };
      });
      
      setExternalSources(transformedSources);
    } catch (error) {
      console.error("Error fetching external knowledge sources:", error);
      toast({
        title: "Error loading sources",
        description: "Failed to load external knowledge sources. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingExternalSources(false);
      setIsImportDialogOpen(true);
    }
  };
  
  const handleImportSources = (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>, selectedFiles?: Record<number, Set<string>>) => {
    toast({
      title: "Sources imported",
      description: `${sourceIds.length} knowledge sources were imported successfully.`,
    });
    
    setIsImportDialogOpen(false);
  };

  const mapApiSourcesToKnowledgeSources = () => {
    return knowledgeBases.flatMap(kb => kb.knowledge_sources).map(source => {
      let trainingStatus: 'idle' | 'training' | 'success' | 'error' = 'idle';
      if (source.status === "trained") {
        trainingStatus = 'success';
      } else if (source.status === "training") {
        trainingStatus = 'training';
      } else if (source.status === "failed" || source.status === "error") {
        trainingStatus = 'error';
      }
      
      return {
        id: source.id,
        name: source.title,
        type: source.metadata?.format || "unknown",
        size: typeof source.metadata?.file_size === 'number' 
          ? `${Math.round(source.metadata.file_size / 1024)} KB` 
          : "Unknown size",
        lastUpdated: source.metadata?.last_fetched || "Unknown",
        trainingStatus: trainingStatus,
        url: source.url,
        file: source.file,
        title: source.title,
        metadata: source.metadata,
        knowledge_sources: source.sub_knowledge_sources || []
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Knowledge Sources</h2>
        <Button 
          onClick={handleOpenImportDialog}
          className="flex items-center gap-1"
          disabled={isLoadingExternalSources}
        >
          <Plus className="h-4 w-4" />
          {isLoadingExternalSources ? "Loading..." : "Import Knowledge"}
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
