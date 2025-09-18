import React, { useState, useMemo } from 'react';
import { useBuilder } from './BuilderContext';
import { Brain, Plus, FileText, Globe, Database, File, ChevronRight, ChevronDown, X, ExternalLink, FileSpreadsheet, Layers, BookOpen, Book } from 'lucide-react';
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
import { Icon } from '@/components/icons';

const getIconForType = (source) => {
  if(source.type === 'custom') {
        const { mimeType, size} = source?.metadata || '';
        switch (mimeType) {
          case 'application/vnd.google-apps.document':
            return <Icon name="TextFile" type='plain' color='hsl(var(--primary))' className="h-5 w-5" />;
          case 'application/vnd.google-apps.spreadsheet':
            return <Icon name="SheetFile" type='plain' color='hsl(var(--primary))' className="h-5 w-5" />;
          default:
            return <Icon name="TextFile" type='plain' color='hsl(var(--primary))' className="h-5 w-5" />;
            }
      }else {
        switch (source.type) {
          case 'docs':
            return <Icon name="TextFile" type='plain' color='hsl(var(--primary))' className="h-5 w-5" />;
          case 'website':
            return <Icon name="WebPage" type='plain' color='hsl(var(--primary))' className="h-5 w-5" />;
          case 'csv':
            return <Icon name="SheetFile" type='plain' color='hsl(var(--primary))' className="h-5 w-5" />;
          case 'plain_text':
            return <Icon name="Typing" type='plain' color='hsl(var(--primary))' className="h-5 w-5" />;
          case 'third_party':
            return <Icon name="TextFile" type='plain' color='hsl(var(--primary))' className="h-5 w-5" />;
          default:
            return <Icon name="TextFile" type='plain' color='hsl(var(--primary))' className="h-5 w-5" />;
        }
      }
   
};

const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { label: 'Untrained', className: 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' },
      'success': { label: 'Trained', className: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/60 dark:text-blue-400 dark:border-blue-700' },
      'training': { label: 'Training', className: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' },
      'failed': { label: 'Failed', className: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' },
      'deleted': { label: 'Deleted', className: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' },
      'pending': { label: 'Pending', className: 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800' },
    };

    const config = statusConfig[status?.toLowerCase()] || { label: 'Unknown', className: 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800' };
    return <Badge className={`${config.className} text-[9px] font-medium`}>{config.label}</Badge>;
};

const getIconBackground = (type: string) => {
  return 'bg-transparent';
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
  
  return (
    <div className="group border dark:border-0 rounded-lg bg-white dark:bg-neutral-800/70 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-all duration-200">
      <div className="flex items-center gap-3 p-3">
        <div className={`flex items-center justify-center w-6 h-6 rounded-lg flex-shrink-0 ${getIconBackground(source.type)}`}>
          {getIconForType(source)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 font-semibold truncate"
              >
                {source.title || source.name || 'Untitled Source'}
                </a>
            </h3>
            {getStatusBadge(source.status || source.trainingStatus)}
          </div>
          {/* <p className="text-gray-500 text-xs">{source.type}</p> */}
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

  // Get knowledge sources from cached agent data - properly filtered
  const knowledgeSources = useMemo(() => {
    const sources = agentData.knowledgeSources || [];
    console.log('📁 Using cached knowledge sources from agent data:', sources.length);
    return sources.filter(source => 
      source && 
      source.trainingStatus !== 'deleted' && 
      source.trainingStatus !== 'failed'
    );
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
      <div className="w-full h-full bg-white dark:bg-neutral-900 flex items-center justify-center">
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
      <div className="w-full h-full bg-white dark:bg-[hsla(0,0%,0%,0.95)] flex flex-col">
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
              <div key={index} className="rounded-lg bg-transparent border dark:border-0 dark:bg-neutral-900 p-3">
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

  // Transform knowledge sources for display with proper field mapping
  const displaySources = Array.isArray(knowledgeSources) ? knowledgeSources.map(source => ({
    id: source.id,
    title: source.name || source.title,
    type: source.type,
    status: source.trainingStatus,
    url: source.metadata?.url || source.url
  })) : [];

  return (
    <>
      <div className="w-full h-full bg-white dark:bg-[hsla(0,0%,0%,0.95)] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Knowledge Sources
            </h2>
            <KnowledgeActionDropdown />
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden dark:bg-[hsla(0,0%,0%,0.95)]">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {displaySources.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    
                    <Icon name={`Folder`} type='plain' color='hsl(var(--primary))' className='h-8 w-8'/>
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
          type="alert"
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
          <div>
            
          </div>
        </ModernModal>
      </div>
    </>
  );
};
