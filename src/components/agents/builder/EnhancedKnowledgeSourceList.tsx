import React, { useState, useEffect } from 'react';
import { ApiKnowledgeBase } from '@/components/agents/knowledge/types';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Globe, FileText, File, Database, Trash2, Link, ExternalLink, CircleAlert } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { agentApi } from '@/utils/api-config';
import { useQueryClient } from '@tanstack/react-query';
import KnowledgeSourceBadge, { KnowledgeSourceBadgeProps } from '@/components/agents/KnowledgeSourceBadge';

interface EnhancedKnowledgeSourceListProps {
  knowledgeBases: ApiKnowledgeBase[];
  isLoading?: boolean;
  agentId?: string;
  onKnowledgeBaseRemoved?: (knowledgeBaseId: number) => void;
}

const getIconForType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'website':
      return <Globe className="h-4 w-4" />;
    case 'document':
    case 'pdf':
      return <FileText className="h-4 w-4" />;
    case 'csv':
      return <Database className="h-4 w-4" />;
    case 'plain_text':
      return <File className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
};

const getTypeDescription = (knowledgeBase: ApiKnowledgeBase): string => {
  const { type } = knowledgeBase;
  
  const firstSource = knowledgeBase.knowledge_sources?.[0];
  if (!firstSource) return type;
  
  switch (type.toLowerCase()) {
    case 'document':
    case 'pdf':
    case 'docs':
    case 'csv':
      const fileCount = knowledgeBase.knowledge_sources.filter(source => source.is_selected).length;
      return `${fileCount} ${fileCount === 1 ? 'file' : 'files'}`;
      
    case 'website':
      let urlCount = 0;
      if (firstSource.metadata?.sub_urls?.children) {
        urlCount = firstSource.metadata.sub_urls.children.filter(url => url.is_selected).length;
      }
      return `${urlCount} ${urlCount === 1 ? 'URL' : 'URLs'}`;
      
    case 'plain_text':
      if (firstSource.metadata?.no_of_chars) {
        return `${firstSource.metadata.no_of_chars} chars`;
      }
      return type;
      
    default:
      return type;
  }
};

const getBadgeForStatus = (status: string) => {
  switch (status) {
    case 'Active':
      return <Badge variant="success" className="text-[10px] px-2 py-0.5">Trained</Badge>;
    case 'Training':
      return <Badge variant="secondary" className="text-[10px] px-2 py-0.5">Training</Badge>;
    case 'Issues':
      return <Badge variant="waiting" className="text-[10px] px-2 py-0.5">Issues</Badge>
    default:
      return <Badge variant="outline" className="text-[10px] px-2 py-0.5">Untrained</Badge>;
  }
};

const getBadgeForDeleted = (status: string) => {
  switch (status) {
    case 'deleted':
      return (
         <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <CircleAlert fill="#f00" color="#fff" className="h-4 w-4 rounded-md ml-2 inline-flex items-center justify-center hover:bg-red-200"/>
            </TooltipTrigger>
            <TooltipContent>
              This Knowledge is deleted.
            </TooltipContent>
          </Tooltip>
         </TooltipProvider>
      );
    case 'issues':
      return (
         <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <CircleAlert fill="#fd0" color="#fff" className="h-4 w-4 rounded-md ml-2 inline-flex items-center justify-center hover:bg-red-200"/>
            </TooltipTrigger>
            <TooltipContent>
              Some of the sources is deleted.
            </TooltipContent>
          </Tooltip>
         </TooltipProvider>
      );
  }
};

const KnowledgeBaseCard = ({ 
  knowledgeBase, 
  agentId, 
  onDelete 
}: { 
  knowledgeBase: ApiKnowledgeBase;
  agentId?: string;
  onDelete?: () => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!agentId) {
      toast({
        title: "Error",
        description: "Cannot delete knowledge base: Agent ID is missing",
        variant: "destructive"
      });
      return;
    }

    if (isDeleting) {
      console.log("Delete operation already in progress, ignoring duplicate call");
      return;
    }

    try {
      setIsDeleting(true);
      
      queryClient.setQueryData(['agentKnowledgeBases', agentId], (old: any[]) => {
        if (!old) return [];
        return old.filter(kb => kb.id !== knowledgeBase.id);
      });
      
      setShowDeleteDialog(false);
      
      toast({
        title: "Removing knowledge base...",
        description: `Removing "${knowledgeBase.name}" from this agent`,
      });

      const response = await agentApi.removeKnowledgeSources(agentId, [knowledgeBase.id]);

      if (!response.ok) {
        queryClient.invalidateQueries({ 
          queryKey: ['agentKnowledgeBases', agentId] 
        });
        
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to delete: ${response.status}`);
      }

      toast({
        title: "Knowledge base removed",
        description: `Successfully removed "${knowledgeBase.name}" from this agent`,
      });
      
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error removing knowledge base:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove knowledge base",
        variant: "destructive"
      });
      
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const createKnowledgeSourceFromApi = (source: any, baseType: string) => ({
    id: source.id || 0,
    name: source.title || "Unknown",
    type: source.metadata?.format?.toLowerCase() || baseType,
    size: source.metadata?.file_size || source.metadata?.size || 'N/A',
    lastUpdated: source.metadata?.last_updated || new Date().toISOString(),
    trainingStatus: source.training_status || source.status || 'idle' as const,
    hasError: source.status === 'deleted',
    hasIssue: false,
    linkBroken: source.url && !source.url.startsWith('http'),
    metadata: source.metadata || {}
  });

  return (
    <>
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="p-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm flex-shrink-0">
                  {getIconForType(knowledgeBase.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
                      {knowledgeBase.name}
                    </h3>
                    {getBadgeForDeleted(knowledgeBase.status)}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400 capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {knowledgeBase.type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getTypeDescription(knowledgeBase)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {getBadgeForStatus(knowledgeBase.training_status)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-2">
                {agentId && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                
                <CollapsibleTrigger className="h-8 w-8 rounded-md inline-flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CollapsibleTrigger>
              </div>
            </div>
          </div>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
              <div className="space-y-2">
                {knowledgeBase.knowledge_sources.map((source, index) => {
                  const isWebsite = knowledgeBase.type.toLowerCase() === 'website';
                  
                  return (
                    <div key={source.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                      {isWebsite ? (
                        <div>
                          {source.metadata?.sub_urls?.children && source.metadata.sub_urls.children.some(subUrl => subUrl.is_selected) ? (
                            <div className="space-y-2">
                              {source.metadata.sub_urls.children
                                .filter(subUrl => subUrl.is_selected)
                                .map((subUrl) => (
                                  <div key={subUrl.key} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 max-w-[70%]">
                                      <Link className="h-3 w-3 flex-shrink-0 text-blue-500" />
                                      <a 
                                        href={subUrl.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-xs truncate hover:text-blue-600 hover:underline flex items-center text-gray-700 dark:text-gray-300"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {subUrl.url}
                                        <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                                      </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {subUrl.chars !== undefined && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {subUrl.chars === 0 ? "0 characters" : `${subUrl.chars.toLocaleString()} chars`}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <KnowledgeSourceBadge 
                                  source={createKnowledgeSourceFromApi(source, knowledgeBase.type)}
                                  size="sm" 
                                />
                                {source.url && (
                                  <a 
                                    href={source.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-xs text-blue-600 hover:underline flex items-center"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Visit <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {getBadgeForStatus(source.training_status)}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        source.is_selected && (
                          <div className="flex justify-between items-center">
                            <KnowledgeSourceBadge 
                              source={createKnowledgeSourceFromApi(source, knowledgeBase.type)}
                              size="sm" 
                            />
                            <div className="flex items-center gap-2">
                              {getBadgeForStatus(source.training_status)}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Knowledge Base</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{knowledgeBase.name}" from this agent? 
              This will unlink the knowledge base from this agent, but won't delete the knowledge base itself.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const EnhancedKnowledgeSourceList: React.FC<EnhancedKnowledgeSourceListProps> = ({ 
  knowledgeBases,
  isLoading = false,
  agentId,
  onKnowledgeBaseRemoved
}) => {
  const [localKnowledgeBases, setLocalKnowledgeBases] = useState(knowledgeBases);

  useEffect(() => {
    setLocalKnowledgeBases(knowledgeBases);
  }, [knowledgeBases]);

  const handleKnowledgeBaseRemoved = (id: number) => {
    setLocalKnowledgeBases(prev => prev.filter(kb => kb.id !== id));
    if (onKnowledgeBaseRemoved) {
      onKnowledgeBaseRemoved(id);
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-xl mb-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!localKnowledgeBases || localKnowledgeBases.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">No knowledge sources</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-sm">
          Import knowledge sources to improve your agent's responses and make it more knowledgeable.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {localKnowledgeBases.map((knowledgeBase) => (
        <KnowledgeBaseCard
          key={knowledgeBase.id}
          knowledgeBase={knowledgeBase}
          agentId={agentId}
          onDelete={() => handleKnowledgeBaseRemoved(knowledgeBase.id)}
        />
      ))}
    </div>
  );
};

export default EnhancedKnowledgeSourceList;
