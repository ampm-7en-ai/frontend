
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KnowledgeSource, UrlNode } from './types';
import { CheckCircle, ChevronRight, ChevronDown, FileText, Globe, FileSpreadsheet, File, FolderOpen, Folder } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { formatFileSizeToMB } from '@/utils/api-config';

interface ImportSourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  externalSources: KnowledgeSource[];
  currentSources: KnowledgeSource[];
  onImport: (sourceIds: number[], selectedSubUrls?: Record<number, Set<string>>) => void;
}

export const ImportSourcesDialog = ({
  isOpen,
  onOpenChange,
  externalSources,
  currentSources,
  onImport,
}: ImportSourcesDialogProps) => {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [selectedSources, setSelectedSources] = useState<Set<number>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedSubUrls, setSelectedSubUrls] = useState<Record<number, Set<string>>>({});
  
  // Reset selections when dialog opens or external sources change
  useEffect(() => {
    if (isOpen) {
      setSelectedSources(new Set());
      setExpandedNodes(new Set());
      setSelectedSubUrls({});
    }
  }, [isOpen, externalSources]);

  // Count sources by type
  const countByType = {
    all: externalSources.length,
    docs: externalSources.filter(s => s.type === 'pdf' || s.type === 'docx' || s.type === 'docs').length,
    website: externalSources.filter(s => s.type === 'website').length,
    csv: externalSources.filter(s => s.type === 'csv').length,
    plain_text: externalSources.filter(s => s.type === 'plain_text').length
  };

  // Filter sources by selected tab
  const filteredSources = selectedTab === 'all' 
    ? externalSources 
    : externalSources.filter(source => source.type === selectedTab);

  // Toggle source selection
  const toggleSourceSelection = (sourceId: number) => {
    const newSelectedSources = new Set(selectedSources);
    if (newSelectedSources.has(sourceId)) {
      newSelectedSources.delete(sourceId);
      
      // Also remove any selected sub-URLs for this source
      const newSelectedSubUrls = { ...selectedSubUrls };
      delete newSelectedSubUrls[sourceId];
      setSelectedSubUrls(newSelectedSubUrls);
    } else {
      newSelectedSources.add(sourceId);
    }
    setSelectedSources(newSelectedSources);
  };

  // Toggle node expansion
  const toggleNodeExpansion = (nodePath: string) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(nodePath)) {
      newExpandedNodes.delete(nodePath);
    } else {
      newExpandedNodes.add(nodePath);
    }
    setExpandedNodes(newExpandedNodes);
  };

  // Toggle sub-URL selection
  const toggleSubUrlSelection = (sourceId: number, url: string) => {
    const newSelectedSubUrls = { ...selectedSubUrls };
    
    if (!newSelectedSubUrls[sourceId]) {
      newSelectedSubUrls[sourceId] = new Set<string>();
    }
    
    const sourceUrls = newSelectedSubUrls[sourceId];
    
    if (sourceUrls.has(url)) {
      sourceUrls.delete(url);
    } else {
      sourceUrls.add(url);
    }
    
    setSelectedSubUrls(newSelectedSubUrls);
  };

  // Import selected sources
  const handleImport = () => {
    const sourceIdsToImport = Array.from(selectedSources);
    onImport(sourceIdsToImport, selectedSubUrls);
  };

  // Check if a source is already imported
  const isSourceAlreadyImported = (sourceId: number) => {
    return currentSources.some(source => source.id === sourceId);
  };

  // Render source icon based on type
  const renderSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'pdf':
      case 'docx':
      case 'docs':
        return <FileText className="h-4 w-4 mr-2 text-blue-600" />;
      case 'website':
        return <Globe className="h-4 w-4 mr-2 text-green-600" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />;
      case 'plain_text':
        return <File className="h-4 w-4 mr-2 text-purple-600" />;
      default:
        return <File className="h-4 w-4 mr-2 text-gray-600" />;
    }
  };

  // Recursively render website URLs (tree structure)
  const renderWebsiteUrls = (source: KnowledgeSource, urlNode?: UrlNode | null, level: number = 0, parentPath: string = '') => {
    if (!urlNode) {
      // Try to get URL nodes from different possible locations in the source
      const knowledgeSource = source.knowledge_sources?.[0];
      if (!knowledgeSource) return null;
      
      let rootNode: UrlNode | null = null;
      
      if (knowledgeSource.metadata?.sub_urls) {
        rootNode = knowledgeSource.metadata.sub_urls as UrlNode;
      } else if (source.metadata?.domain_links) {
        rootNode = Array.isArray(source.metadata.domain_links) 
          ? source.metadata.domain_links[0] 
          : source.metadata.domain_links;
      }
      
      if (!rootNode) return null;
      
      return renderWebsiteUrls(source, rootNode, level, '');
    }
    
    const currentPath = parentPath ? `${parentPath}/${urlNode.url}` : urlNode.url;
    const isExpanded = expandedNodes.has(currentPath);
    const hasChildren = urlNode.children && urlNode.children.length > 0;
    const isSelected = selectedSubUrls[source.id]?.has(urlNode.url);
    
    return (
      <div key={currentPath} style={{ paddingLeft: `${level * 16}px` }}>
        <div className="flex items-center py-1 hover:bg-gray-100 rounded px-2 cursor-pointer">
          {hasChildren ? (
            <span 
              onClick={() => toggleNodeExpansion(currentPath)}
              className="inline-flex items-center justify-center w-5 h-5"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </span>
          ) : <span className="w-5" />}
          
          <Checkbox 
            id={`url-${source.id}-${urlNode.url}`}
            className="mr-2"
            checked={isSelected}
            onCheckedChange={() => toggleSubUrlSelection(source.id, urlNode.url)}
          />
          
          {urlNode.url === 'root' ? (
            <div>
              <span className="flex items-center text-sm">
                <FolderOpen className="h-4 w-4 mr-2 text-amber-500" />
                Root
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="flex items-center text-sm overflow-hidden text-ellipsis">
                <Globe className="h-4 w-4 mr-2 text-green-600" />
                {urlNode.title || urlNode.url}
              </span>
              {urlNode.url && urlNode.url !== 'root' && (
                <span className="text-xs text-muted-foreground ml-6">{urlNode.url}</span>
              )}
            </div>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {urlNode.children?.map(child => 
              renderWebsiteUrls(source, child, level + 1, currentPath)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden" fixedFooter>
        <DialogHeader>
          <DialogTitle>Import Knowledge Sources</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="w-full h-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">
              All Sources ({countByType.all})
            </TabsTrigger>
            <TabsTrigger value="docs">
              Documents ({countByType.docs})
            </TabsTrigger>
            <TabsTrigger value="website">
              Websites ({countByType.website})
            </TabsTrigger>
            <TabsTrigger value="csv">
              Spreadsheets ({countByType.csv})
            </TabsTrigger>
            <TabsTrigger value="plain_text">
              Plain Text ({countByType.plain_text})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedTab} className="h-full">
            <ScrollArea className="h-[400px] border rounded-md">
              {filteredSources.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No {selectedTab === 'all' ? '' : selectedTab} sources found</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {filteredSources.map((source) => {
                    const firstKnowledgeSource = source.knowledge_sources?.[0];
                    const isWebsite = source.type === 'website';
                    const alreadyImported = isSourceAlreadyImported(source.id);
                    const hasUrlStructure = isWebsite && (
                      (firstKnowledgeSource?.metadata?.sub_urls) || 
                      (source.metadata?.domain_links)
                    );
                    
                    return (
                      <div key={source.id} className="border rounded-md overflow-hidden">
                        <div className="flex items-center p-3 bg-white border-b">
                          <Checkbox 
                            id={`source-${source.id}`}
                            checked={selectedSources.has(source.id)}
                            onCheckedChange={() => toggleSourceSelection(source.id)}
                            className="mr-2"
                          />
                          <div className="flex-1">
                            <label 
                              htmlFor={`source-${source.id}`}
                              className="flex items-center cursor-pointer"
                            >
                              {renderSourceIcon(source.type)}
                              <span className="font-medium">
                                {source.name}
                                {alreadyImported && <span className="text-sm font-normal text-muted-foreground ml-2">(Already in your knowledge base)</span>}
                              </span>
                            </label>
                            
                            <div className="text-xs text-muted-foreground mt-1 flex items-center">
                              <span className="mr-3">Type: {source.type}</span>
                              
                              {firstKnowledgeSource?.metadata?.no_of_pages && (
                                <span className="mr-3">{firstKnowledgeSource.metadata.no_of_pages} pages</span>
                              )}
                              
                              {firstKnowledgeSource?.metadata?.no_of_rows && (
                                <span className="mr-3">{firstKnowledgeSource.metadata.no_of_rows} rows</span>
                              )}
                              
                              {firstKnowledgeSource?.metadata?.file_size && (
                                <span className="mr-3">
                                  Size: {formatFileSizeToMB(firstKnowledgeSource.metadata.file_size)}
                                </span>
                              )}
                              
                              {firstKnowledgeSource?.metadata?.upload_date && (
                                <span>
                                  Uploaded: {new Date(firstKnowledgeSource.metadata.upload_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {hasUrlStructure && selectedSources.has(source.id) && (
                          <div className="px-3 py-2 bg-gray-50">
                            <div className="ml-6">
                              {renderWebsiteUrls(source)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <DialogFooter fixed className="border-t p-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedSources.size} source{selectedSources.size !== 1 ? 's' : ''} selected
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={selectedSources.size === 0}
          >
            Import Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
