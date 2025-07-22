
import React, { useState, useMemo } from 'react';
import { useBuilder } from './BuilderContext';
import { Brain, Plus, FileText, Globe, Database, File, ChevronRight, ChevronDown, X, ExternalLink, FileSpreadsheet, Layers } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ModernButton from '@/components/dashboard/ModernButton';
import { useToast } from '@/hooks/use-toast';
import { ModernModal } from '@/components/ui/modern-modal';
import { KnowledgeActionDropdown } from './KnowledgeActionDropdown';
import { removeKnowledgeSourceFromAgentCache } from '@/utils/knowledgeSourceCacheUtils';

const getIconForType = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'docs':
      return FileText;
    case 'website':
      return Globe;
    case 'csv':
      return FileSpreadsheet;
    case 'plain_text':
      return File;
    case 'third_party':
      return Layers;
    default:
      return File;
  }
};

const getBadgeForStatus = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 border-green-200">Active</Badge>;
    case 'training':
      return <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 border-blue-200">Training</Badge>;
    case 'failed':
      return <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 border-red-200">Failed</Badge>;
    case 'deleted':
      return <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 border-red-200">Deleted</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px] px-2 py-0.5">Unknown</Badge>;
  }
};

const getIconBackground = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'docs':
      return 'bg-gradient-to-br from-blue-500 to-blue-600';
    case 'website':
      return 'bg-gradient-to-br from-green-500 to-green-600';
    case 'csv':
      return 'bg-gradient-to-br from-purple-500 to-purple-600';
    case 'plain_text':
      return 'bg-gradient-to-br from-orange-500 to-orange-600';
    case 'third_party':
      return 'bg-gradient-to-br from-indigo-500 to-indigo-600';
    default:
      return 'bg-gradient-to-br from-gray-500 to-gray-600';
  }
};

const KnowledgeSourceCard = ({ source, onDelete }: { 
  source: any, 
  onDelete: () => void
}) => {
  const IconComponent = getIconForType(source.type);
  
  return (
    <div className="group border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
      <div className="flex items-center gap-3 p-3">
        <div className={`flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0 ${getIconBackground(source.type)}`}>
          <IconComponent className="h-4 w-4 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {source.title || source.name || 'Untitled Source'}
            </h3>
            {getBadgeForStatus(source.status || source.trainingStatus)}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {source.type || 'Unknown Type'}
          </p>
          {source.url && (
            <div className="flex items-center gap-1 mt-1">
              <ExternalLink className="h-3 w-3 text-gray-400" />
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline truncate max-w-[200px]"
              >
                {source.url}
              </a>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export const BuilderSidebar = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData, isLoading } = state;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<number | null>(null);

  // Get knowledge sources from cached agent data instead of separate API call
  const knowledgeSources = useMemo(() => {
    const sources = agentData.knowledgeSources || [];
    console.log('📁 Using cached knowledge sources from agent data:', sources.length);
    return sources.filter(source => source && source.trainingStatus !== 'deleted');
  }, [agentData.knowledgeSources]);

  const handleDeleteConfirm = (sourceId: number) => {
    setSourceToDelete(sourceId);
    setDeleteConfirmOpen(true);
  };

  const handleSourceDelete = async () => {
    if (!agentData.id || !sourceToDelete) return;

    try {
      const token = getAccessToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${BASE_URL}knowledgesource/${sourceToDelete}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to delete knowledge source');
      }

      // Update cache immediately
      removeKnowledgeSourceFromAgentCache(queryClient, String(agentData.id), sourceToDelete);
      
      // Update local state in BuilderContext
      const updatedKnowledgeSources = knowledgeSources.filter(source => source.id !== sourceToDelete);
      updateAgentData({ knowledgeSources: updatedKnowledgeSources });

      toast({
        title: "Knowledge source removed",
        description: "The knowledge source has been successfully removed from your agent.",
      });
    } catch (error) {
      console.error('Error deleting knowledge source:', error);
      toast({
        title: "Delete failed",
        description: "There was an error removing the knowledge source.",
        variant: "destructive"
      });
    } finally {
      setDeleteConfirmOpen(false);
      setSourceToDelete(null);
    }
  };

  // Show error state if not in agent context
  if (!agentData.id) {
    return (
      <div className="w-full h-full bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Agent Context
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            Builder sidebar requires an agent context. Please navigate to an agent builder page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full bg-background flex flex-col">
        {/* Header Skeleton */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        
        {/* Knowledge Sources List Skeleton */}
        <div className="flex-1">
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="border border-border rounded-lg bg-transparent dark:border-gray-600 p-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Ensure we have an array and convert to display format
  const displaySources = Array.isArray(knowledgeSources) ? knowledgeSources.map(source => ({
    id: source.id,
    title: source.name,
    type: source.type,
    status: source.trainingStatus,
    url: source.metadata?.url || source.url
  })) : [];

  return (
    <>
      <div className="w-full h-full bg-background flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Knowledge Sources
            </h2>
            <KnowledgeActionDropdown />
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {displaySources.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No knowledge sources yet</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-4">
                    Import knowledge sources to improve your agent's responses and make it more knowledgeable.
                  </p>
                  <KnowledgeActionDropdown />
                </div>
              ) : (
                <>
                  {displaySources.map((knowledgeSource) => (
                    <KnowledgeSourceCard
                      key={knowledgeSource.id}
                      source={knowledgeSource}
                      onDelete={() => handleDeleteConfirm(knowledgeSource.id)}
                    />
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        <ModernModal
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Delete Knowledge Source"
          description="Are you sure you want to remove this knowledge source from your agent? This action cannot be undone."
          size="md"
          footer={
            <div className="flex gap-3">
              <ModernButton variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </ModernButton>
              <ModernButton 
                variant="gradient" 
                onClick={handleSourceDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </ModernButton>
            </div>
          }
        >
          <div className="py-4">
            <p className="text-slate-600 dark:text-slate-400">
              This will permanently remove the knowledge source from your agent.
            </p>
          </div>
        </ModernModal>
      </div>
    </>
  );
};
