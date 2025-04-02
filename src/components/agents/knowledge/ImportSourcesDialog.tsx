
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KnowledgeSource, UrlNode } from './types';
import { CheckCircle, ChevronRight, ChevronDown, FileText, Globe, FileSpreadsheet, File, FolderOpen, Folder } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { formatFileSizeToMB } from '@/utils/api-config';
import { cn } from '@/lib/utils';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { renderSourceIcon } from './knowledgeUtils';

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
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSources, setSelectedSources] = useState<Set<number>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedSubUrls, setSelectedSubUrls] = useState<Record<number, Set<string>>>({});
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(null);
  
  // Reset selections when dialog opens or external sources change
  useEffect(() => {
    if (isOpen) {
      setSelectedSources(new Set());
      setExpandedNodes(new Set());
      setSelectedSubUrls({});
      setSelectedSource(null);
      setSelectedType('all');
    }
  }, [isOpen, externalSources]);

  // Find and select root node when a source is selected
  useEffect(() => {
    if (selectedSource && hasUrlStructure(selectedSource)) {
      const sourceId = selectedSource.id;
      const rootNode = findRootUrlNode(selectedSource);
      
      if (rootNode && rootNode.url) {
        // Initialize the set for this source if it doesn't exist
        if (!selectedSubUrls[sourceId]) {
          setSelectedSubUrls(prev => ({
            ...prev,
            [sourceId]: new Set<string>()
          }));
        }
        
        // Expand the root node
        setExpandedNodes(prev => new Set([...prev, rootNode.url]));
        
        // Select all child URLs under the root node
        if (rootNode.children && rootNode.children.length > 0) {
          selectAllUrlsUnderNode(sourceId, rootNode);
        }
      }
    }
  }, [selectedSource]);

  // Memoize source counts for better performance
  const sourceTypes = useMemo(() => {
    const counts = {
      all: { count: 0, label: 'All Sources', icon: <FileText className="h-4 w-4" /> },
      docs: { count: 0, label: 'Documents', icon: <FileText className="h-4 w-4 text-blue-600" /> },
      pdf: { count: 0, label: 'PDF', icon: <FileText className="h-4 w-4 text-red-600" /> },
      docx: { count: 0, label: 'DOCX', icon: <FileText className="h-4 w-4 text-blue-600" /> },
      website: { count: 0, label: 'Websites', icon: <Globe className="h-4 w-4 text-green-600" /> },
      csv: { count: 0, label: 'Spreadsheets', icon: <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> },
      plain_text: { count: 0, label: 'Plain Text', icon: <File className="h-4 w-4 text-purple-600" /> }
    };
    
    // Count sources by type
    externalSources.forEach(source => {
      counts.all.count++;
      if (counts[source.type as keyof typeof counts]) {
        counts[source.type as keyof typeof counts].count++;
      }
      if (source.type === 'pdf' || source.type === 'docx') {
        counts.docs.count++;
      }
    });
    
    return counts;
  }, [externalSources]);
  
  // Memoize filtered sources for better performance
  const filteredSources = useMemo(() => {
    return selectedType === 'all' 
      ? externalSources 
      : selectedType === 'docs'
        ? externalSources.filter(source => source.type === 'pdf' || source.type === 'docx')
        : externalSources.filter(source => source.type === selectedType);
  }, [selectedType, externalSources]);

  // Helper function to find root URL node in a source
  const findRootUrlNode = (source: KnowledgeSource): UrlNode | null => {
    const firstKnowledgeSource = source.knowledge_sources?.[0];
    if (!firstKnowledgeSource) return null;
    
    if (firstKnowledgeSource.metadata?.sub_urls) {
      return firstKnowledgeSource.metadata.sub_urls as UrlNode;
    } else if (source.metadata?.domain_links) {
      return Array.isArray(source.metadata.domain_links) 
        ? source.metadata.domain_links[0] 
        : source.metadata.domain_links;
    }
    
    return null;
  };

  // Check if a source has URL structure
  const hasUrlStructure = (source: KnowledgeSource) => {
    return source.type === 'website' && findRootUrlNode(source) !== null;
  };

  // Toggle source selection
  const toggleSourceSelection = (source: KnowledgeSource) => {
    const sourceId = source.id;
    const newSelectedSources = new Set(selectedSources);
    
    if (newSelectedSources.has(sourceId)) {
      newSelectedSources.delete(sourceId);
      
      // Remove any selected sub-URLs for this source
      const newSelectedSubUrls = { ...selectedSubUrls };
      delete newSelectedSubUrls[sourceId];
      setSelectedSubUrls(newSelectedSubUrls);
      
      // Clear the selected source if it was this one
      if (selectedSource && selectedSource.id === sourceId) {
        setSelectedSource(null);
      }
    } else {
      newSelectedSources.add(sourceId);
      
      // If it's a website with URL structure, select it for the URL view
      // and automatically select all child URLs
      if (source.type === 'website' && hasUrlStructure(source)) {
        setSelectedSource(source);
      }
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

  // Get all URLs from a node and its children
  const getAllUrlsFromNode = (node: UrlNode): string[] => {
    const urls: string[] = [node.url];
    
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        urls.push(...getAllUrlsFromNode(child));
      }
    }
    
    return urls;
  };

  // Select all URLs under a node
  const selectAllUrlsUnderNode = (sourceId: number, node: UrlNode) => {
    const allUrls = getAllUrlsFromNode(node);
    
    setSelectedSubUrls(prev => {
      const sourceUrls = new Set(prev[sourceId] || []);
      allUrls.forEach(url => sourceUrls.add(url));
      
      return {
        ...prev,
        [sourceId]: sourceUrls
      };
    });
  };
  
  // Unselect all URLs under a node
  const unselectAllUrlsUnderNode = (sourceId: number, node: UrlNode) => {
    const allUrls = getAllUrlsFromNode(node);
    
    setSelectedSubUrls(prev => {
      if (!prev[sourceId]) return prev;
      
      const sourceUrls = new Set(prev[sourceId]);
      allUrls.forEach(url => sourceUrls.delete(url));
      
      return {
        ...prev,
        [sourceId]: sourceUrls
      };
    });
  };

  // Toggle URL selection
  const toggleUrlSelection = (sourceId: number, node: UrlNode, isRoot: boolean = false) => {
    const url = node.url;
    const isSelected = isUrlSelected(sourceId, url);
    
    if (isRoot) {
      if (isSelected) {
        unselectAllUrlsUnderNode(sourceId, node);
      } else {
        selectAllUrlsUnderNode(sourceId, node);
      }
    } else {
      setSelectedSubUrls(prev => {
        const sourceUrls = new Set(prev[sourceId] || []);
        
        if (isSelected) {
          sourceUrls.delete(url);
        } else {
          sourceUrls.add(url);
        }
        
        return {
          ...prev,
          [sourceId]: sourceUrls
        };
      });
    }
  };
  
  // Check if a URL is selected
  const isUrlSelected = (sourceId: number, url: string): boolean => {
    return selectedSubUrls[sourceId]?.has(url) || false;
  };

  // Check if all children of a node are selected
  const areAllChildrenSelected = (sourceId: number, node: UrlNode): boolean => {
    if (!node.children || node.children.length === 0) return true;
    
    return node.children.every(child => {
      const childSelected = isUrlSelected(sourceId, child.url);
      const childrenSelected = areAllChildrenSelected(sourceId, child);
      return childSelected && childrenSelected;
    });
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

  // Recursively render website URLs (tree structure)
  const renderWebsiteUrls = (source: KnowledgeSource, urlNode?: UrlNode | null, level: number = 0, parentPath: string = '') => {
    if (!urlNode) {
      const rootNode = findRootUrlNode(source);
      if (!rootNode) return null;
      
      return renderWebsiteUrls(source, rootNode, level, '');
    }
    
    const currentPath = parentPath ? `${parentPath}/${urlNode.url}` : urlNode.url;
    const isExpanded = expandedNodes.has(currentPath);
    const hasChildren = urlNode.children && urlNode.children.length > 0;
    const isRoot = level === 0;
    const isSelected = isUrlSelected(source.id, urlNode.url);
    
    return (
      <div key={currentPath} className="py-1">
        <div className={cn(
          "flex items-center hover:bg-gray-100 rounded px-2 py-1 cursor-pointer", 
          isSelected && "bg-gray-100"
        )}>
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
            onCheckedChange={() => toggleUrlSelection(source.id, urlNode, isRoot)}
          />
          
          {isRoot ? (
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
              {urlNode.url && (
                <span className="text-xs text-muted-foreground ml-6 truncate max-w-[300px]">{urlNode.url}</span>
              )}
            </div>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div className="ml-5 border-l pl-2 mt-1">
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
      <DialogContent className="sm:max-w-[1000px] max-h-[80vh] overflow-hidden" fixedFooter>
        <DialogHeader>
          <DialogTitle>Import Knowledge Sources</DialogTitle>
        </DialogHeader>
        
        <ResizablePanelGroup direction="horizontal" className="h-[400px]">
          {/* Left panel - Source types */}
          <ResizablePanel minSize={15} defaultSize={20}>
            <div className="border rounded-md overflow-hidden h-full">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                  {Object.entries(sourceTypes).map(([type, { count, label, icon }]) => (
                    count > 0 && (
                      <button
                        key={type}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md",
                          selectedType === type ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        )}
                        onClick={() => setSelectedType(type)}
                      >
                        <span className="flex items-center">
                          {icon}
                          <span className="ml-2">{label}</span>
                        </span>
                        <span className="bg-primary-foreground/20 text-xs rounded-full px-2 py-0.5">
                          {count}
                        </span>
                      </button>
                    )
                  ))}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Middle panel - Source list */}
          <ResizablePanel minSize={30} defaultSize={50}>
            <div className="border rounded-md overflow-hidden h-full">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-2">
                  {filteredSources.length === 0 ? (
                    <div className="flex items-center justify-center h-full py-20">
                      <p className="text-muted-foreground">No {selectedType === 'all' ? '' : selectedType} sources found</p>
                    </div>
                  ) : (
                    filteredSources.map((source) => {
                      const firstKnowledgeSource = source.knowledge_sources?.[0];
                      const alreadyImported = isSourceAlreadyImported(source.id);
                      const isSelected = selectedSources.has(source.id);
                      
                      return (
                        <div 
                          key={source.id} 
                          className={cn(
                            "border rounded-md overflow-hidden cursor-pointer transition",
                            isSelected && "border-primary",
                            source === selectedSource && "ring-2 ring-primary"
                          )}
                          onClick={() => {
                            if (!selectedSources.has(source.id)) {
                              toggleSourceSelection(source);
                            } else if (hasUrlStructure(source)) {
                              setSelectedSource(source);
                            }
                          }}
                        >
                          <div className="flex items-center p-3 bg-white">
                            <Checkbox 
                              id={`source-${source.id}`}
                              checked={selectedSources.has(source.id)}
                              onCheckedChange={() => toggleSourceSelection(source)}
                              className="mr-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <label 
                                htmlFor={`source-${source.id}`}
                                className="flex items-center cursor-pointer"
                              >
                                {renderSourceIcon(source.type)}
                                <span className="font-medium">
                                  {source.name}
                                  {alreadyImported && <span className="text-sm font-normal text-muted-foreground ml-2">(already imported)</span>}
                                </span>
                              </label>
                              
                              <div className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap">
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
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Right panel - URLs for website sources */}
          <ResizablePanel minSize={15} defaultSize={30}>
            <div className="border rounded-md overflow-hidden h-full">
              <ScrollArea className="h-full">
                <div className="p-2">
                  {selectedSource && hasUrlStructure(selectedSource) ? (
                    <div className="space-y-1">
                      <div className="font-medium text-sm px-2 py-1 bg-muted/50 mb-2 rounded">
                        URLs for {selectedSource.name}
                      </div>
                      {renderWebsiteUrls(selectedSource)}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[350px] text-center px-4">
                      <Globe className="h-10 w-10 text-muted-foreground/40 mb-2" />
                      <p className="text-muted-foreground text-sm">
                        {selectedSources.size > 0 
                          ? "Select a website source to view and select specific URLs" 
                          : "Select a source from the list"}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        
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
