
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, X, FileText, Globe, Database, File, Loader2, Plus, Check, ChevronRight, ChevronDown, ExternalLink, FolderOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KnowledgeSource, UrlNode, ProcessedSource, SourceAnalysis, ImportKnowledgeSourcesPayload } from './types';
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useQueryClient } from '@tanstack/react-query';

interface ImportSourcesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  externalSources?: any[];
  currentSources?: any[];
  onImport?: (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>) => void;
  agentId?: string;
  preventMultipleCalls?: boolean;
}

const ImportSourcesDialog: React.FC<ImportSourcesDialogProps> = ({
  open,
  onOpenChange,
  externalSources = [],
  currentSources = [],
  onImport,
  agentId,
  preventMultipleCalls = false
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sources, setSources] = useState<ProcessedSource[]>([]);
  const [selectedSources, setSelectedSources] = useState<Record<number, boolean>>({});
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});
  const [selectedSubUrls, setSelectedSubUrls] = useState<Record<number, Set<string>>>({});
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [sourceAnalysis, setSourceAnalysis] = useState<Record<number, SourceAnalysis>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      fetchSources();
    } else {
      // Reset state when dialog closes
      setSearchQuery('');
      setSelectedSources({});
      setExpandedSources({});
      setSelectedSubUrls({});
      setExpandedNodes({});
    }
  }, [open]);

  const fetchSources = async () => {
    setIsLoading(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${BASE_URL}knowledge-sources/`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sources: ${response.status}`);
      }

      const data = await response.json();
      
      // Process the sources to add format information
      const processedSources: ProcessedSource[] = data.map((source: any) => {
        let format = 'unknown';
        let pages = '';
        
        if (source.type === 'document' || source.type === 'pdf') {
          format = source.metadata?.format || 'pdf';
          pages = source.metadata?.no_of_pages ? `${source.metadata.no_of_pages} pages` : '';
        } else if (source.type === 'csv') {
          format = 'csv';
          pages = source.metadata?.no_of_rows ? `${source.metadata.no_of_rows} rows` : '';
        } else if (source.type === 'website' || source.type === 'url') {
          format = 'website';
        } else if (source.type === 'plain_text') {
          format = 'text';
        }
        
        // Extract domain links from metadata or directly from the source
        let domain_links = null;
        if (source.metadata?.domain_links) {
          domain_links = source.metadata.domain_links;
        } else if (source.metadata?.sub_urls?.children) {
          domain_links = source.metadata.sub_urls.children;
        }
        
        return {
          ...source,
          format,
          pages,
          domain_links,
          trainingStatus: source.training_status || 'idle'
        };
      });
      
      setSources(processedSources);
      
      // Analyze sources for expandable content
      const analysis: Record<number, SourceAnalysis> = {};
      processedSources.forEach(source => {
        let hasDomainLinks = false;
        let domainLinksSource: 'metadata' | 'direct' | 'none' = 'none';
        
        if (source.metadata?.domain_links) {
          hasDomainLinks = true;
          domainLinksSource = 'metadata';
        } else if (source.domain_links) {
          hasDomainLinks = true;
          domainLinksSource = 'direct';
        }
        
        const hasChildren = source.knowledge_sources && source.knowledge_sources.length > 0;
        
        analysis[source.id] = {
          id: source.id,
          name: source.name,
          type: source.type,
          hasDomainLinks,
          domainLinksSource,
          hasChildren,
          childrenCount: hasChildren ? source.knowledge_sources!.length : 0,
          structure: JSON.stringify({
            hasDomainLinks,
            domainLinksSource,
            hasChildren,
            childrenCount: hasChildren ? source.knowledge_sources!.length : 0
          })
        };
      });
      
      setSourceAnalysis(analysis);
    } catch (error) {
      console.error('Error fetching sources:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load knowledge sources',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSources = useMemo(() => {
    return sources.filter(source => {
      // Filter by tab
      if (activeTab !== 'all' && source.type !== activeTab) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return source.name.toLowerCase().includes(query) || 
               source.type.toLowerCase().includes(query);
      }
      
      return true;
    });
  }, [sources, activeTab, searchQuery]);

  const handleSourceSelect = (sourceId: number, selected: boolean) => {
    setSelectedSources(prev => ({
      ...prev,
      [sourceId]: selected
    }));
    
    // If deselecting, also clear any selected sub-URLs
    if (!selected && selectedSubUrls[sourceId]) {
      setSelectedSubUrls(prev => {
        const newState = { ...prev };
        delete newState[sourceId];
        return newState;
      });
    }
  };

  const toggleSourceExpansion = (sourceId: number) => {
    setExpandedSources(prev => ({
      ...prev,
      [sourceId]: !prev[sourceId]
    }));
  };

  const toggleNodeExpansion = (nodeKey: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeKey]: !prev[nodeKey]
    }));
  };

  const handleSubUrlSelect = (sourceId: number, url: string, selected: boolean) => {
    setSelectedSubUrls(prev => {
      const currentUrls = prev[sourceId] || new Set<string>();
      const newUrls = new Set(currentUrls);
      
      if (selected) {
        newUrls.add(url);
      } else {
        newUrls.delete(url);
      }
      
      return {
        ...prev,
        [sourceId]: newUrls
      };
    });
  };

  const isUrlSelected = (sourceId: number, url: string): boolean => {
    return selectedSubUrls[sourceId]?.has(url) || false;
  };

  const selectAllSubUrls = (sourceId: number, urls: string[], selected: boolean) => {
    setSelectedSubUrls(prev => {
      const currentUrls = prev[sourceId] || new Set<string>();
      const newUrls = new Set(currentUrls);
      
      if (selected) {
        urls.forEach(url => newUrls.add(url));
      } else {
        urls.forEach(url => newUrls.delete(url));
      }
      
      return {
        ...prev,
        [sourceId]: newUrls
      };
    });
  };

  const getSelectedSourcesCount = () => {
    return Object.values(selectedSources).filter(Boolean).length;
  };

  const getSelectedUrlsCount = (sourceId: number) => {
    return selectedSubUrls[sourceId]?.size || 0;
  };

  const getTotalSelectedUrlsCount = () => {
    return Object.values(selectedSubUrls).reduce((total, urls) => total + urls.size, 0);
  };

  const handleImportSources = async () => {
    const selectedSourceIds = Object.entries(selectedSources)
      .filter(([_, selected]) => selected)
      .map(([id]) => parseInt(id));
    
    if (selectedSourceIds.length === 0) {
      toast({
        title: 'No sources selected',
        description: 'Please select at least one knowledge source to import.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!agentId) {
      toast({
        title: 'Error',
        description: 'Agent ID is missing. Cannot import sources.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Prepare the selected URLs for each source
      const selected_knowledge_sources: string[] = [];
      
      for (const sourceId of selectedSourceIds) {
        // If there are selected sub-URLs for this source, add them
        const sourceUrls = selectedSubUrls[sourceId];
        if (sourceUrls && sourceUrls instanceof Set && sourceUrls.size > 0) {
          const urlsToImport = Array.from(sourceUrls);
          selected_knowledge_sources.push(...urlsToImport);
        }
      }
      
      const payload: ImportKnowledgeSourcesPayload = {
        knowledgeSources: selectedSourceIds,
        selected_knowledge_sources
      };
      
      const response = await fetch(`${BASE_URL}agents/${agentId}/add-knowledge-sources/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to import sources: ${response.status}`);
      }
      
      // Optimistically update the client-side data with the selected URLs
      const importedSourcesData = selectedSourceIds.map(id => {
        const source = sources.find(s => s.id === id);
        if (!source) return null;
        
        // Include selected sub-URLs in the source data
        const selectedUrlsSet = selectedSubUrls[id];
        const selectedUrlsArray = selectedUrlsSet ? Array.from(selectedUrlsSet) : [];
        
        return {
          ...source,
          selected_urls: selectedUrlsArray,
          selected_urls_count: selectedUrlsArray.length
        };
      }).filter(Boolean);
      
      // Invalidate the agent knowledge bases query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['agentKnowledgeBases', agentId] });
      
      toast({
        title: 'Sources imported',
        description: `Successfully imported ${selectedSourceIds.length} knowledge sources.`,
      });
      
      // Call the callback with the selected sources and URLs
      if (onImport) {
        onImport(selectedSourceIds, selectedSubUrls);
      }
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error importing sources:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to import knowledge sources',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const renderSourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'document':
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'website':
      case 'url':
        return <Globe className="h-4 w-4" />;
      case 'csv':
        return <Database className="h-4 w-4" />;
      case 'plain_text':
        return <File className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const renderUrlTree = (sourceId: number, nodes: UrlNode[] | undefined, level = 0, path = '') => {
    if (!nodes || nodes.length === 0) return null;
    
    return nodes.map((node, index) => {
      const nodeKey = node.key || `${sourceId}-${path}-${index}`;
      const isExpanded = expandedNodes[nodeKey] || false;
      const hasChildren = node.children && node.children.length > 0;
      const nodePath = path ? `${path}-${index}` : `${index}`;
      
      return (
        <div key={nodeKey} style={{ marginLeft: `${level * 16}px` }}>
          <div className="flex items-center py-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleNodeExpansion(nodeKey)}
                className="mr-1 h-5 w-5 inline-flex items-center justify-center rounded-sm hover:bg-gray-100"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
            ) : (
              <div className="mr-1 w-5" />
            )}
            
            <Checkbox
              id={`url-${nodeKey}`}
              checked={isUrlSelected(sourceId, node.url)}
              onCheckedChange={(checked) => handleSubUrlSelect(sourceId, node.url, !!checked)}
              className="mr-2"
            />
            
            <div className="flex items-center">
              <ExternalLink className="h-3 w-3 mr-1 text-blue-500" />
              <Label
                htmlFor={`url-${nodeKey}`}
                className="text-xs cursor-pointer truncate max-w-[300px]"
                title={node.url}
              >
                {node.title || node.url}
              </Label>
              {node.chars !== undefined && (
                <span className="text-xs text-muted-foreground ml-2">
                  {node.chars.toLocaleString()} chars
                </span>
              )}
            </div>
          </div>
          
          {hasChildren && isExpanded && renderUrlTree(sourceId, node.children, level + 1, nodePath)}
        </div>
      );
    });
  };

  const renderSourceItem = (source: ProcessedSource) => {
    const isSelected = selectedSources[source.id] || false;
    const isExpanded = expandedSources[source.id] || false;
    const analysis = sourceAnalysis[source.id];
    
    // Determine if this source has expandable content
    const hasExpandableContent = analysis?.hasDomainLinks || analysis?.hasChildren;
    
    // Get all URLs from domain_links for the "Select All" functionality
    const allUrls: string[] = [];
    if (source.domain_links) {
      const extractUrls = (nodes: UrlNode[] | UrlNode | undefined): void => {
        if (!nodes) return;
        
        const nodeArray = Array.isArray(nodes) ? nodes : [nodes];
        
        nodeArray.forEach(node => {
          if (node.url) allUrls.push(node.url);
          if (node.children) extractUrls(node.children);
        });
      };
      
      extractUrls(source.domain_links);
    }
    
    const selectedUrlsCount = getSelectedUrlsCount(source.id);
    const allUrlsSelected = selectedUrlsCount > 0 && selectedUrlsCount === allUrls.length;
    const someUrlsSelected = selectedUrlsCount > 0 && selectedUrlsCount < allUrls.length;
    
    return (
      <div key={source.id} className="border rounded-md mb-2 overflow-hidden">
        <div className="flex items-center p-3 bg-gray-50">
          <Checkbox
            id={`source-${source.id}`}
            checked={isSelected}
            onCheckedChange={(checked) => handleSourceSelect(source.id, !!checked)}
            className="mr-3"
          />
          
          <div className="flex-1">
            <div className="flex items-center">
              <div className="mr-2 h-6 w-6 rounded-md bg-white border border-gray-200 flex items-center justify-center">
                {renderSourceIcon(source.type)}
              </div>
              
              <Label
                htmlFor={`source-${source.id}`}
                className="font-medium cursor-pointer"
              >
                {source.name}
              </Label>
              
              <Badge variant="outline" className="ml-2 text-xs">
                {source.type}
              </Badge>
              
              {source.pages && (
                <span className="text-xs text-muted-foreground ml-2">
                  {source.pages}
                </span>
              )}
            </div>
            
            {source.metadata?.website && (
              <div className="text-xs text-muted-foreground ml-8 mt-0.5 flex items-center">
                <Globe className="h-3 w-3 mr-1" />
                {source.metadata.website}
              </div>
            )}
          </div>
          
          {hasExpandableContent && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 p-0 h-8 w-8"
              onClick={() => toggleSourceExpansion(source.id)}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}
        </div>
        
        {isSelected && isExpanded && (
          <Collapsible open={true}>
            <CollapsibleContent>
              <div className="p-3 border-t">
                {analysis?.hasDomainLinks && source.domain_links && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">URLs</h4>
                      
                      {allUrls.length > 0 && (
                        <div className="flex items-center">
                          <Checkbox
                            id={`select-all-${source.id}`}
                            checked={allUrlsSelected}
                            onCheckedChange={(checked) => selectAllSubUrls(source.id, allUrls, !!checked)}
                            className="mr-2"
                          />
                          <Label
                            htmlFor={`select-all-${source.id}`}
                            className="text-xs cursor-pointer"
                          >
                            {allUrlsSelected ? 'Deselect All' : 'Select All'}
                          </Label>
                        </div>
                      )}
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto">
                      {Array.isArray(source.domain_links) ? (
                        renderUrlTree(source.id, source.domain_links)
                      ) : (
                        renderUrlTree(source.id, [source.domain_links])
                      )}
                    </div>
                    
                    {selectedUrlsCount > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {selectedUrlsCount} URL{selectedUrlsCount !== 1 ? 's' : ''} selected
                      </div>
                    )}
                  </div>
                )}
                
                {analysis?.hasChildren && source.knowledge_sources && (
                  <div>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="files" className="border-0">
                        <AccordionTrigger className="py-2 hover:no-underline">
                          <span className="flex items-center text-sm font-medium">
                            <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />
                            Files ({source.knowledge_sources.length})
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {source.knowledge_sources.map((file) => (
                              <div key={file.id} className="flex items-center text-xs p-1 rounded hover:bg-muted">
                                <File className="h-3 w-3 mr-2 text-blue-500" />
                                <span className="truncate flex-1" title={file.title}>
                                  {file.title}
                                </span>
                                {file.metadata?.file_size && (
                                  <span className="text-muted-foreground">
                                    {typeof file.metadata.file_size === 'string' ? 
                                      file.metadata.file_size : 
                                      `${Math.round(file.metadata.file_size / 1024)} KB`}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Knowledge Sources</DialogTitle>
          <DialogDescription>
            Select knowledge sources to import into your agent.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 my-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sources..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="website">Websites</TabsTrigger>
            <TabsTrigger value="document">Documents</TabsTrigger>
            <TabsTrigger value="csv">CSV</TabsTrigger>
            <TabsTrigger value="plain_text">Text</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Loading knowledge sources...</p>
                </div>
              ) : filteredSources.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium mb-1">No knowledge sources found</p>
                  <p className="text-xs text-muted-foreground">
                    {searchQuery ? 'Try a different search term' : 'Add knowledge sources to get started'}
                  </p>
                </div>
              ) : (
                filteredSources.map(renderSourceItem)
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-2" />
        
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="text-sm">
            {getSelectedSourcesCount()} source{getSelectedSourcesCount() !== 1 ? 's' : ''} selected
            {getTotalSelectedUrlsCount() > 0 && (
              <span className="ml-1">
                ({getTotalSelectedUrlsCount()} URL{getTotalSelectedUrlsCount() !== 1 ? 's' : ''})
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImportSources} 
              disabled={getSelectedSourcesCount() === 0 || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Import Selected
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSourcesDialog;
