import React, { useState, useEffect } from 'react';
import { ApiKnowledgeBase } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Globe, FileText, File, Database, Trash2, Link, ExternalLink, CircleAlert, CheckCircle2 } from 'lucide-react';
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
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { useQueryClient } from '@tanstack/react-query';
import { Separator } from '@/components/ui/separator';
import KnowledgeSourceBadge, { KnowledgeSourceBadgeProps } from '@/components/agents/KnowledgeSourceBadge';
import { Checkbox } from '@/components/ui/checkbox';

interface KnowledgeSourceListProps {
  knowledgeBases?: ApiKnowledgeBase[];
  sources?: any[]; // Add this for backward compatibility
  isLoading?: boolean;
  agentId?: string;
  onKnowledgeBaseRemoved?: (knowledgeBaseId: number) => void;
  onRemoveSource?: (sourceId: number) => Promise<void>; // Add this for backward compatibility
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
      const selectedFileCount = knowledgeBase.knowledge_sources.filter(source => source.is_selected).length;
      const totalFileCount = knowledgeBase.knowledge_sources.length;
      return `${selectedFileCount}/${totalFileCount} ${totalFileCount === 1 ? 'file' : 'files'}`;
      
    case 'website':
      let selectedUrlCount = 0;
      let totalUrlCount = 0;
      
      if (firstSource.metadata?.sub_urls?.children) {
        totalUrlCount = firstSource.metadata.sub_urls.children.length;
        selectedUrlCount = firstSource.metadata.sub_urls.children.filter(url => url.is_selected).length;
      }
      return `${selectedUrlCount}/${totalUrlCount} ${totalUrlCount === 1 ? 'URL' : 'URLs'}`;
      
    case 'plain_text':
      if (firstSource.metadata?.no_of_chars) {
        return `${firstSource.metadata.no_of_chars} chars`;
      }
      return type;
      
    default:
      return type;
  }
};

const getFormattedSize = (source: any) => {
  if (source.metadata?.file_size) {
    if (typeof source.metadata.file_size === 'string' && source.metadata.file_size.endsWith('B')) {
      const sizeInBytes = parseInt(source.metadata.file_size.replace('B', ''), 10);
      return formatFileSizeToMB(sizeInBytes);
    }
    return formatFileSizeToMB(source.metadata.file_size);
  }
  
  if (source.metadata?.no_of_chars) {
    return `${source.metadata.no_of_chars} chars`;
  }
  
  if (source.metadata?.no_of_rows) {
    return `${source.metadata.no_of_rows} rows`;
  }
  
  return 'N/A';
};

const formatFileSizeToMB = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const getUrlChars = (source: any): number | undefined => {
  if (!source || !source.metadata) return undefined;
  
  if (source.metadata.sub_urls?.children && Array.isArray(source.metadata.sub_urls.children)) {
    const selectedChildUrl = source.metadata.sub_urls.children.find((url: any) => url.is_selected);
    if (selectedChildUrl && selectedChildUrl.chars !== undefined) {
      return selectedChildUrl.chars;
    }
  }
  
  return undefined;
};

const renderChildUrls = (childUrls: any[]) => {
  if (!childUrls || childUrls.length === 0) return null;
  
  // Filter to only show selected URLs
  const selectedUrls = childUrls.filter(url => url.is_selected);
  
  if (selectedUrls.length === 0) return null;
  
  return (
    <div className="space-y-1.5 mt-2">
      {selectedUrls.map((subUrl) => (
        <div key={subUrl.key} className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded-md text-sm">
          <div className="flex items-center gap-2 max-w-[70%]">
            <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-green-500" />
            <Link className="h-3 w-3 flex-shrink-0 text-blue-500" />
            <a 
              href={subUrl.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs truncate hover:text-blue-600 hover:underline flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {subUrl.url}
              <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            {subUrl.chars !== undefined && (
              <span className="text-xs text-muted-foreground">
                {subUrl.chars === 0 ? "0 characters" : `${subUrl.chars.toLocaleString()} chars`}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
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

    const token = getAccessToken();
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You need to be logged in to perform this action",
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

      const response = await fetch(`${BASE_URL}agents/${agentId}/remove-knowledge-sources/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          knowledgeSources: [knowledgeBase.id]
        })
      });

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

  const getBadgeForStatus = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success" className="text-[10px]">Trained</Badge>;
      case 'Training':
        return <Badge variant="secondary" className="text-[10px]">Training</Badge>;
      case 'Issues':
        return <Badge variant="waiting" className="text-[10px]">Issues</Badge>
      default:
        return <Badge variant="outline" className="text-[10px]">Untrained</Badge>;
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
      <div className="overflow-hidden rounded-md border border-gray-200 shadow-sm bg-white">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="px-4 py-3 cursor-pointer flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors" onClick={() => setIsOpen(!isOpen)}>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 bg-white rounded-md border">
                {getIconForType(knowledgeBase.type)}
              </div>
              <h3 className="font-medium text-sm">{knowledgeBase.name}{getBadgeForDeleted(knowledgeBase.status)}</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {getTypeDescription(knowledgeBase)}
              </span>
              
              {getBadgeForStatus(knowledgeBase.training_status)}
              
              {agentId && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              
              <CollapsibleTrigger className="h-7 w-7 rounded-md inline-flex items-center justify-center hover:bg-gray-200">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </CollapsibleTrigger>
            </div>
          </div>
          
          <CollapsibleContent>
            <div key={knowledgeBase.id} className="px-4 py-2 space-y-1">
              {knowledgeBase.knowledge_sources.map((source, index) => {
                const isWebsite = knowledgeBase.type.toLowerCase() === 'website';
                
                return (
                  <>
                    {isWebsite ? (
                      <div key={source.id} className="py-2">
                        {source.metadata?.sub_urls?.children && source.metadata.sub_urls.children.some(subUrl => subUrl.is_selected) ? (
                          <div className="space-y-1.5">
                            <div className="text-xs font-medium text-gray-600 mb-2">Selected URLs:</div>
                            {source.metadata.sub_urls.children
                              .filter(subUrl => subUrl.is_selected)
                              .map((subUrl) => (
                                <div key={subUrl.key} className="flex justify-between items-center py-1.5 px-3 bg-green-50 rounded-md border border-green-200">
                                  <div className="flex items-center gap-2 max-w-[70%]">
                                    <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-green-600" />
                                    <Link className="h-3 w-3 flex-shrink-0 text-blue-500" />
                                    <a 
                                      href={subUrl.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-xs truncate hover:text-blue-600 hover:underline flex items-center"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {subUrl.url}
                                      <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {subUrl.chars !== undefined && (
                                      <span className="text-xs text-muted-foreground">
                                        {subUrl.chars === 0 ? "0 characters" : `${subUrl.chars.toLocaleString()} chars`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2 max-w-[70%]">
                              <KnowledgeSourceBadge 
                                source={createKnowledgeSourceFromApi(source, knowledgeBase.type)}
                                size="sm"
                              />
                              {source.url && (
                                <a 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-xs ml-2 text-blue-600 hover:underline flex items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Visit <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {getFormattedSize(source)}
                              </span>
                              {source.metadata?.sub_urls?.chars !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  {source.metadata.sub_urls.chars === 0 ? "0 chars" : `${source.metadata.sub_urls.chars.toLocaleString()} chars`}
                                </span>
                              )}
                              {source.metadata?.sub_urls?.children && source.metadata.sub_urls.children.some(child => child.is_selected && child.chars !== undefined) && (
                                <span className="text-xs text-muted-foreground">
                                  {source.metadata.sub_urls.children.find(child => child.is_selected)?.chars === 0 ? 
                                    "0 chars" : 
                                    `${source.metadata.sub_urls.children.find(child => child.is_selected)?.chars.toLocaleString()} chars`}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      source.is_selected &&  (
                        <div key={source.id} className="py-2">
                          <div className="flex justify-between items-center mb-1.5 p-2 bg-green-50 rounded-md border border-green-200">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-green-600" />
                              <KnowledgeSourceBadge 
                                source={createKnowledgeSourceFromApi(source, knowledgeBase.type)}
                                size="sm"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{getFormattedSize(source)}</span>
                              { getBadgeForStatus(source.training_status) }
                            </div>
                          </div>
                          <Separator className="mt-2 bg-gray-100" />
                        </div>
                      )
                    )}
                  </>
                );
              })}
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

const KnowledgeSourceList: React.FC<KnowledgeSourceListProps> = ({ 
  knowledgeBases,
  sources,
  isLoading = false,
  agentId,
  onKnowledgeBaseRemoved,
  onRemoveSource
}) => {
  const actualSources = knowledgeBases || sources || [];
  const [localKnowledgeBases, setLocalKnowledgeBases] = useState(actualSources);

  useEffect(() => {
    setLocalKnowledgeBases(actualSources);
  }, [knowledgeBases, sources]);

  const handleKnowledgeBaseRemoved = (id: number) => {
    setLocalKnowledgeBases(prev => prev.filter(kb => kb.id !== id));
    if (onKnowledgeBaseRemoved) {
      onKnowledgeBaseRemoved(id);
    }
    if (onRemoveSource) {
      onRemoveSource(id);
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-gray-100 rounded-md mb-1"></div>
            <div className="h-8 bg-gray-50 rounded-md w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!localKnowledgeBases || localKnowledgeBases.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-6 flex flex-col items-center justify-center">
        <FileText className="h-8 w-8 text-muted-foreground mb-2" />
        <h3 className="text-sm font-medium mb-1">No knowledge sources</h3>
        <p className="text-xs text-muted-foreground text-center">
          Import knowledge sources to improve your agent's responses.
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

export default KnowledgeSourceList;
