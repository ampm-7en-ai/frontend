import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { 
  BASE_URL, 
  getAuthHeaders, 
  getAccessToken, 
  getSourceMetadataInfo, 
  formatFileSizeToMB 
} from '@/utils/api-config';
import { 
  Card, 
  CardContent, 
  CardDescription as UICardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Globe, Table, File, Link, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import KnowledgeSourceBadge from '@/components/agents/KnowledgeSourceBadge';
import { KnowledgeSourceBadgeProps } from '@/components/agents/KnowledgeSourceBadge';

interface ImportSourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  externalSources: any[];
  currentSources: any[];
  onImport: (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>, selectedFiles?: Record<number, Set<string>>) => void;
  agentId: string;
  preventMultipleCalls?: boolean;
  isLoading?: boolean;
  onImportSuccess?: () => void; // New callback prop
}

const getIconForType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'website':
      return <Globe className="h-4 w-4" />;
    case 'document':
    case 'pdf':
    case 'docs':
      return <FileText className="h-4 w-4" />;
    case 'csv':
      return <Table className="h-4 w-4" />;
    case 'plain_text':
      return <File className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
};

export const ImportSourcesDialog: React.FC<ImportSourcesDialogProps> = ({
  isOpen,
  onOpenChange,
  externalSources,
  currentSources,
  onImport,
  agentId,
  preventMultipleCalls = false,
  isLoading = false,
  onImportSuccess
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedSourceIds, setSelectedSourceIds] = useState<number[]>([]);
  const [selectedSubUrls, setSelectedSubUrls] = useState<Record<number, Set<string>>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<number, Set<string>>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [hasSelectionChanged, setHasSelectionChanged] = useState(false);
  
  const toggleSourceSelection = (sourceId: number) => {
    setHasSelectionChanged(true);
    setSelectedSourceIds(prev => {
      if (prev.includes(sourceId)) {
        return prev.filter(id => id !== sourceId);
      } else {
        return [...prev, sourceId];
      }
    });
  };

  const isSourceSelected = (sourceId: number) => {
    return selectedSourceIds.includes(sourceId);
  };

  const toggleSubUrlSelection = (sourceId: number, url: string) => {
    setHasSelectionChanged(true);
    setSelectedSubUrls(prev => {
      const sourceUrls = prev[sourceId] || new Set();
      if (sourceUrls.has(url)) {
        sourceUrls.delete(url);
      } else {
        sourceUrls.add(url);
      }
      
      if (sourceUrls.size === 0) {
        const { [sourceId]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [sourceId]: sourceUrls };
    });
  };

  const isSubUrlSelected = (sourceId: number, url: string) => {
    return selectedSubUrls[sourceId]?.has(url) || false;
  };

  const toggleFileSelection = (sourceId: number, file: string) => {
    setHasSelectionChanged(true);
    setSelectedFiles(prev => {
      const sourceFiles = prev[sourceId] || new Set();
      if (sourceFiles.has(file)) {
        sourceFiles.delete(file);
      } else {
        sourceFiles.add(file);
      }

      if (sourceFiles.size === 0) {
        const { [sourceId]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [sourceId]: sourceFiles };
    });
  };

  const isFileSelected = (sourceId: number, file: string) => {
    return selectedFiles[sourceId]?.has(file) || false;
  };

  const getSourceType = (source: any): KnowledgeSourceBadgeProps['source'] => {
    return {
      name: source.name || "Unknown",
      type: source.type,
      id: source.id || 0,
      hasError: false,
      linkBroken: false
    };
  };

  const handleImport = async () => {
    if (preventMultipleCalls && isImporting) {
      toast({
        title: "Please wait",
        description: "An import is already in progress.",
        variant: "warning"
      });
      return;
    }

    if (selectedSourceIds.length === 0 && Object.keys(selectedSubUrls).length === 0 && Object.keys(selectedFiles).length === 0) {
      toast({
        title: "No sources selected",
        description: "Please select at least one knowledge source to import.",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const requestBody = {
        knowledgeSources: selectedSourceIds,
        subUrls: Object.entries(selectedSubUrls).reduce((acc, [sourceId, urls]) => {
          acc[sourceId] = Array.from(urls);
          return acc;
        }, {}),
        files: Object.entries(selectedFiles).reduce((acc, [sourceId, files]) => {
          acc[sourceId] = Array.from(files);
          return acc;
        }, {})
      };

      const response = await fetch(`${BASE_URL}agents/${agentId}/add-knowledge-sources/`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to import sources: ${response.status}`);
      }
      
      // Call the onImport callback
      onImport(selectedSourceIds, selectedSubUrls, selectedFiles);
      
      // Close the dialog
      onOpenChange(false);
      
      // Invalidate relevant queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['agentKnowledgeBases', agentId] });
      
      // Call the success callback if provided
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      console.error('Error importing knowledge sources:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import knowledge sources",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Knowledge Sources</DialogTitle>
          <DialogDescription>
            Select the knowledge sources you want to import.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading sources...</span>
          </div>
        ) : externalSources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium mb-1">No external knowledge sources found</h3>
            <p className="text-sm text-muted-foreground">
              Please add knowledge sources to your account first.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="divide-y divide-gray-200">
              {externalSources.map((source) => {
                const isWebsite = source.type.toLowerCase() === 'website';
                const isAlreadyImported = currentSources.some(cs => cs.id === source.id);
                
                return (
                  <div key={source.id} className="py-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Checkbox
                          id={`source-${source.id}`}
                          checked={isSourceSelected(source.id)}
                          onCheckedChange={() => toggleSourceSelection(source.id)}
                          disabled={isAlreadyImported}
                        />
                        <Label htmlFor={`source-${source.id}`} className="ml-2 font-medium">
                          {source.name}
                        </Label>
                      </div>
                      {isAlreadyImported && (
                        <span className="text-xs text-muted-foreground italic">Already Imported</span>
                      )}
                    </div>
                    
                    {isWebsite && source.knowledge_sources && source.knowledge_sources.length > 0 && (
                      <div className="mt-2 pl-6">
                        {source.knowledge_sources[0].metadata?.sub_urls?.children && source.knowledge_sources[0].metadata.sub_urls.children.map((subUrl: any) => (
                          <div key={subUrl.key} className="flex items-center justify-between py-1">
                            <div className="flex items-center">
                              <Checkbox
                                id={`suburl-${source.id}-${subUrl.key}`}
                                checked={isSubUrlSelected(source.id, subUrl.url)}
                                onCheckedChange={() => toggleSubUrlSelection(source.id, subUrl.url)}
                                disabled={isAlreadyImported}
                              />
                              <Label htmlFor={`suburl-${source.id}-${subUrl.key}`} className="ml-2 text-sm">
                                <a 
                                  href={subUrl.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:underline flex items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {subUrl.url}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Label>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {subUrl.chars ? `${subUrl.chars.toLocaleString()} chars` : 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!isWebsite && source.knowledge_sources && source.knowledge_sources.length > 0 && (
                      <div className="mt-2 pl-6">
                        {source.knowledge_sources.map((file: any) => (
                          <div key={file.id} className="flex items-center justify-between py-1">
                            <div className="flex items-center">
                              <Checkbox
                                id={`file-${source.id}-${file.id}`}
                                checked={isFileSelected(source.id, file.title)}
                                onCheckedChange={() => toggleFileSelection(source.id, file.title)}
                                disabled={isAlreadyImported}
                              />
                              <Label htmlFor={`file-${source.id}-${file.id}`} className="ml-2 text-sm">
                                {file.title}
                              </Label>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatFileSizeToMB(file.metadata?.file_size || file.metadata?.size)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end mt-6">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleImport} 
            disabled={!hasSelectionChanged || isLoading || isImporting}
          >
            {isImporting ? 'Importing...' : 'Import Sources'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
